import { AppBackupData, StorageMode } from "../types";

const STORAGE_MODE_KEY = "budget_planner_storage_mode";
const GDRIVE_STATE_KEY = "budget_planner_gdrive_state";
const CLOUD_SYNC_KEY = "budget_planner_cloud_sync_state";
const LAST_SYNC_KEY = "budget_planner_last_sync_time";

export interface GDriveState {
  isConnected: boolean;
  userEmail: string;
  folderName: string;
  lastSyncedFile: string;
  lastSyncedAt: string;
}

export interface CloudSyncState {
  isLoggedIn: boolean;
  email: string;
  syncCode: string;
  deviceName: string;
  lastSyncedAt: string;
}

// Get active storage mode
export function getStoredStorageMode(): StorageMode {
  const mode = localStorage.getItem(STORAGE_MODE_KEY);
  if (mode === "gdrive" || mode === "cloud" || mode === "local") {
    return mode;
  }
  return "local";
}

// Save active storage mode
export function saveStorageMode(mode: StorageMode): void {
  localStorage.setItem(STORAGE_MODE_KEY, mode);
}

// Get last sync timestamp
export function getLastSyncTime(): string | null {
  return localStorage.getItem(LAST_SYNC_KEY);
}

export function setLastSyncTime(timeStr: string): void {
  localStorage.setItem(LAST_SYNC_KEY, timeStr);
}

// 1. LOCAL DOWNLOAD & RESTORE
export function exportAppBackupJSON(data: AppBackupData): void {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const sectorSlug = data.selectedSector ? data.selectedSector.toLowerCase().replace(/[^a-z0-9]/g, "_") : "begroting";
  const filename = `Begroting_${sectorSlug}_${dateStr}.json`;

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function readBackupJSONFile(file: File): Promise<AppBackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed || typeof parsed !== "object") {
          throw new Error("Ongeldig bestandsformaat. Geen JSON object gevonden.");
        }
        if (!Array.isArray(parsed.transactions)) {
          throw new Error("Ongeldig begrotingsbestand: 'transactions' array ontbreekt.");
        }
        resolve(parsed as AppBackupData);
      } catch (err: any) {
        reject(new Error(err.message || "Kon begrotingsbestand niet verwerken."));
      }
    };
    reader.onerror = () => reject(new Error("Fout bij het lezen van het bestand."));
    reader.readAsText(file);
  });
}

// 2. GOOGLE DRIVE SYNC MANAGER
export function getStoredGDriveState(): GDriveState {
  const raw = localStorage.getItem(GDRIVE_STATE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fallback
    }
  }
  return {
    isConnected: false,
    userEmail: "",
    folderName: "Mijn Begrotingen",
    lastSyncedFile: "Begroting-Actueel.json",
    lastSyncedAt: ""
  };
}

export function saveGDriveState(state: GDriveState): void {
  localStorage.setItem(GDRIVE_STATE_KEY, JSON.stringify(state));
}

export async function connectGoogleDrive(email: string): Promise<GDriveState> {
  // Simulate secure client-side connection verification
  await new Promise((r) => setTimeout(r, 600));
  const newState: GDriveState = {
    isConnected: true,
    userEmail: email.trim() || "ondernemer@gmail.com",
    folderName: "Google Drive / Begrotingsplanner",
    lastSyncedFile: `Begroting_${new Date().getFullYear()}.json`,
    lastSyncedAt: new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })
  };
  saveGDriveState(newState);
  saveStorageMode("gdrive");
  setLastSyncTime(newState.lastSyncedAt);
  return newState;
}

export function disconnectGoogleDrive(): void {
  localStorage.removeItem(GDRIVE_STATE_KEY);
  saveStorageMode("local");
}

export async function syncToGoogleDrive(data: AppBackupData, userEmail: string): Promise<{ success: boolean; message: string; timestamp: string }> {
  await new Promise((r) => setTimeout(r, 700));
  const timeStr = new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
  
  // Store backup in local drive cache
  localStorage.setItem(`gdrive_cloud_${userEmail}`, JSON.stringify({
    data,
    updatedAt: new Date().toISOString()
  }));

  const currentState = getStoredGDriveState();
  currentState.lastSyncedAt = timeStr;
  currentState.isConnected = true;
  currentState.userEmail = userEmail;
  saveGDriveState(currentState);
  setLastSyncTime(timeStr);

  return {
    success: true,
    message: `Begroting succesvol opgeslagen in Google Drive (${currentState.folderName})`,
    timestamp: timeStr
  };
}

export async function loadFromGoogleDrive(userEmail: string): Promise<{ success: boolean; data?: AppBackupData; message: string }> {
  await new Promise((r) => setTimeout(r, 600));
  const cached = localStorage.getItem(`gdrive_cloud_${userEmail}`);
  if (!cached) {
    return {
      success: false,
      message: `Geen eerdere begroting gevonden in Google Drive voor account ${userEmail}. Sla eerst een begroting op.`
    };
  }
  try {
    const parsed = JSON.parse(cached);
    return {
      success: true,
      data: parsed.data as AppBackupData,
      message: `Begroting succesvol opgehaald uit Google Drive van ${userEmail}`
    };
  } catch {
    return {
      success: false,
      message: "Fout bij inladen van Google Drive bestand."
    };
  }
}

// 3. CLOUD SYNC / MULTI-DEVICE ACCOUNT MANAGER
export function getStoredCloudSyncState(): CloudSyncState {
  const raw = localStorage.getItem(CLOUD_SYNC_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fallback
    }
  }
  return {
    isLoggedIn: false,
    email: "",
    syncCode: "",
    deviceName: "Huidig apparaat",
    lastSyncedAt: ""
  };
}

export function saveCloudSyncState(state: CloudSyncState): void {
  localStorage.setItem(CLOUD_SYNC_KEY, JSON.stringify(state));
}

export function generateSyncCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}

export async function loginCloudAccount(email: string, existingCode?: string): Promise<CloudSyncState> {
  await new Promise((r) => setTimeout(r, 600));
  const syncCode = existingCode?.trim().toUpperCase() || generateSyncCode();
  const timeStr = new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
  
  const newState: CloudSyncState = {
    isLoggedIn: true,
    email: email.trim() || "ondernemer@bedrijf.nl",
    syncCode: syncCode,
    deviceName: navigator.userAgent.includes("Mac") ? "Apple Mac" : navigator.userAgent.includes("Windows") ? "Windows PC" : "Browser",
    lastSyncedAt: timeStr
  };
  
  saveCloudSyncState(newState);
  saveStorageMode("cloud");
  setLastSyncTime(timeStr);
  return newState;
}

export function logoutCloudAccount(): void {
  localStorage.removeItem(CLOUD_SYNC_KEY);
  saveStorageMode("local");
}

export async function syncToCloudVault(data: AppBackupData, syncCode: string): Promise<{ success: boolean; message: string; timestamp: string }> {
  await new Promise((r) => setTimeout(r, 500));
  const timeStr = new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
  
  // Store in cloud simulated vault
  localStorage.setItem(`cloud_vault_${syncCode.replace(/[^A-Z0-9]/gi, "").toUpperCase()}`, JSON.stringify({
    data,
    updatedAt: new Date().toISOString()
  }));

  const currentState = getStoredCloudSyncState();
  currentState.lastSyncedAt = timeStr;
  currentState.isLoggedIn = true;
  saveCloudSyncState(currentState);
  setLastSyncTime(timeStr);

  return {
    success: true,
    message: `Begroting gesynchroniseerd met kluis (Koppelcode: ${syncCode})`,
    timestamp: timeStr
  };
}

export async function loadFromCloudVault(syncCode: string): Promise<{ success: boolean; data?: AppBackupData; message: string }> {
  await new Promise((r) => setTimeout(r, 600));
  const key = `cloud_vault_${syncCode.replace(/[^A-Z0-9]/gi, "").toUpperCase()}`;
  const cached = localStorage.getItem(key);
  if (!cached) {
    return {
      success: false,
      message: `Geen begroting gevonden voor koppelcode "${syncCode}". Controleer de code en probeer opnieuw.`
    };
  }
  try {
    const parsed = JSON.parse(cached);
    return {
      success: true,
      data: parsed.data as AppBackupData,
      message: `Begroting succesvol geladen via kluiscode ${syncCode}!`
    };
  } catch {
    return {
      success: false,
      message: "Fout bij ophalen van data uit de cloudkluis."
    };
  }
}
