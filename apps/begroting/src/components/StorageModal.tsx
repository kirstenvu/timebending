import React, { useState } from "react";
import {
  HardDrive,
  Cloud,
  Check,
  Download,
  Upload,
  RefreshCw,
  X,
  Shield,
  Smartphone,
  Laptop,
  Copy,
  ExternalLink,
  Lock,
  Key,
  FolderSync,
  AlertCircle,
  FileCheck
} from "lucide-react";
import { AppBackupData, StorageMode, CLOUD_STORAGE_ENABLED } from "../types";
import {
  GDriveState,
  CloudSyncState,
  connectGoogleDrive,
  disconnectGoogleDrive,
  syncToGoogleDrive,
  loadFromGoogleDrive,
  loginCloudAccount,
  logoutCloudAccount,
  syncToCloudVault,
  loadFromCloudVault,
  exportAppBackupJSON,
  readBackupJSONFile
} from "../utils/storageManager";

interface StorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  storageMode: StorageMode;
  onStorageModeChange: (mode: StorageMode) => void;
  currentBackupData: AppBackupData;
  onRestoreData: (data: AppBackupData, sourceName: string) => void;
  gdriveState: GDriveState;
  setGdriveState: React.Dispatch<React.SetStateAction<GDriveState>>;
  cloudSyncState: CloudSyncState;
  setCloudSyncState: React.Dispatch<React.SetStateAction<CloudSyncState>>;
  onNotify: (msg: string, isError?: boolean) => void;
}

export default function StorageModal({
  isOpen,
  onClose,
  storageMode,
  onStorageModeChange,
  currentBackupData,
  onRestoreData,
  gdriveState,
  setGdriveState,
  cloudSyncState,
  setCloudSyncState,
  onNotify
}: StorageModalProps) {
  const [selectedTab, setSelectedTab] = useState<StorageMode>(storageMode);
  const [gdriveInputEmail, setGdriveInputEmail] = useState(gdriveState.userEmail || "");
  const [cloudInputEmail, setCloudInputEmail] = useState(cloudSyncState.email || "");
  const [cloudJoinCode, setCloudJoinCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  // 1. Local Actions
  const handleExportJSON = () => {
    try {
      exportAppBackupJSON(currentBackupData);
      onNotify("Begrotingsbestand (.json) succesvol gedownload naar je computer!");
    } catch {
      onNotify("Fout bij het downloaden van het bestand.", true);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const parsedData = await readBackupJSONFile(file);
      onRestoreData(parsedData, file.name);
      onNotify(`Back-up uit "${file.name}" succesvol hersteld!`);
      onClose();
    } catch (err: any) {
      onNotify(err.message || "Ongeldig back-up bestand.", true);
    } finally {
      setIsProcessing(false);
      e.target.value = "";
    }
  };

  // 2. Google Drive Actions
  const handleConnectGDrive = async () => {
    if (!gdriveInputEmail.trim()) {
      onNotify("Vul een geldig Google / Gmail e-mailadres in.", true);
      return;
    }
    setIsProcessing(true);
    try {
      const state = await connectGoogleDrive(gdriveInputEmail);
      setGdriveState(state);
      onStorageModeChange("gdrive");
      // Also perform initial sync
      await syncToGoogleDrive(currentBackupData, state.userEmail);
      onNotify(`Google Drive succesvol gekoppeld aan ${state.userEmail}!`);
    } catch {
      onNotify("Kon geen verbinding maken met Google Drive.", true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSyncToGDrive = async () => {
    if (!gdriveState.userEmail) return;
    setIsProcessing(true);
    try {
      const res = await syncToGoogleDrive(currentBackupData, gdriveState.userEmail);
      setGdriveState((prev) => ({ ...prev, lastSyncedAt: res.timestamp }));
      onNotify("Begroting direct bijgewerkt in je Google Drive!");
    } catch {
      onNotify("Fout bij synchroniseren naar Google Drive.", true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadFromGDrive = async () => {
    if (!gdriveState.userEmail) return;
    setIsProcessing(true);
    try {
      const res = await loadFromGoogleDrive(gdriveState.userEmail);
      if (res.success && res.data) {
        onRestoreData(res.data, `Google Drive (${gdriveState.userEmail})`);
        onNotify("Begroting succesvol ingeladen vanuit Google Drive!");
        onClose();
      } else {
        onNotify(res.message, true);
      }
    } catch {
      onNotify("Kon data niet ophalen uit Google Drive.", true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisconnectGDrive = () => {
    disconnectGoogleDrive();
    setGdriveState({
      isConnected: false,
      userEmail: "",
      folderName: "Mijn Begrotingen",
      lastSyncedFile: "Begroting-Actueel.json",
      lastSyncedAt: ""
    });
    onStorageModeChange("local");
    onNotify("Google Drive ontkoppeld. Opslag staat weer op lokaal.");
  };

  // 3. Cloud Sync Actions
  const handleCreateCloudAccount = async () => {
    if (!cloudInputEmail.trim()) {
      onNotify("Vul een geldig e-mailadres in voor je account.", true);
      return;
    }
    setIsProcessing(true);
    try {
      const state = await loginCloudAccount(cloudInputEmail);
      setCloudSyncState(state);
      onStorageModeChange("cloud");
      await syncToCloudVault(currentBackupData, state.syncCode);
      onNotify(`Account aangemaakt! Koppelcode: ${state.syncCode}`);
    } catch {
      onNotify("Fout bij aanmaken van kluisaccount.", true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleJoinWithCode = async () => {
    if (!cloudJoinCode.trim()) {
      onNotify("Vul de 6-cijferige koppelcode in van je andere apparaat.", true);
      return;
    }
    setIsProcessing(true);
    try {
      const res = await loadFromCloudVault(cloudJoinCode);
      if (res.success && res.data) {
        const state = await loginCloudAccount(res.data.selectedSector || "Ondernemer", cloudJoinCode);
        setCloudSyncState(state);
        onStorageModeChange("cloud");
        onRestoreData(res.data, `Kluis (${cloudJoinCode.toUpperCase()})`);
        onNotify(`Verbonden met kluis ${cloudJoinCode.toUpperCase()}! Data succesvol ingeladen.`);
        onClose();
      } else {
        onNotify(res.message, true);
      }
    } catch {
      onNotify("Kon niet koppelen met opgegeven code.", true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSyncToCloud = async () => {
    if (!cloudSyncState.syncCode) return;
    setIsProcessing(true);
    try {
      const res = await syncToCloudVault(currentBackupData, cloudSyncState.syncCode);
      setCloudSyncState((prev) => ({ ...prev, lastSyncedAt: res.timestamp }));
      onNotify(`Begroting gesynchroniseerd met kluis (${cloudSyncState.syncCode})!`);
    } catch {
      onNotify("Fout bij synchroniseren met kluis.", true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogoutCloud = () => {
    logoutCloudAccount();
    setCloudSyncState({
      isLoggedIn: false,
      email: "",
      syncCode: "",
      deviceName: "Huidig apparaat",
      lastSyncedAt: ""
    });
    onStorageModeChange("local");
    onNotify("Kluis ontkoppeld. Opslag staat weer op lokaal.");
  };

  const copySyncCode = () => {
    if (!cloudSyncState.syncCode) return;
    navigator.clipboard.writeText(cloudSyncState.syncCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    onNotify("Koppelcode gekopieerd naar klembord!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 pb-5 flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold font-mono border border-emerald-500/30">
              <FolderSync className="w-3.5 h-3.5" /> OPSLAG & SYNCHRONISATIE
            </div>
            <h2 className="text-xl font-bold font-display text-white">
              Kies hoe je je begroting wilt bewaren
            </h2>
            <p className="text-xs text-slate-300">
              {CLOUD_STORAGE_ENABLED
                ? "Volledige controle over je data: 100% lokaal, in je eigen Google Drive of gesynchroniseerd tussen meerdere apparaten."
                : "Volledige controle over je data: alles blijft 100% lokaal in de browser van dit apparaat."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition"
            title="Sluiten"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TAB SELECTOR BUTTONS */}
        {CLOUD_STORAGE_ENABLED && (
          <div className="grid grid-cols-3 bg-slate-100 p-2 gap-1.5 border-b border-slate-200">
            <button
              onClick={() => setSelectedTab("local")}
              className={`py-3 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                selectedTab === "local"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <HardDrive className={`w-4 h-4 ${selectedTab === "local" ? "text-emerald-600" : "text-slate-400"}`} />
              <span>100% Lokaal</span>
              {storageMode === "local" && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              )}
            </button>

            <button
              onClick={() => setSelectedTab("gdrive")}
              className={`py-3 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                selectedTab === "gdrive"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Cloud className={`w-4 h-4 ${selectedTab === "gdrive" ? "text-blue-600" : "text-slate-400"}`} />
              <span>Google Drive</span>
              {storageMode === "gdrive" && (
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
              )}
            </button>

            <button
              onClick={() => setSelectedTab("cloud")}
              className={`py-3 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                selectedTab === "cloud"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Key className={`w-4 h-4 ${selectedTab === "cloud" ? "text-purple-600" : "text-slate-400"}`} />
              <span>Meerdere Apparaten</span>
              {storageMode === "cloud" && (
                <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></span>
              )}
            </button>
          </div>
        )}

        {/* TAB CONTENT AREA */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: 100% LOKAAL */}
          {selectedTab === "local" && (
            <div className="space-y-5">
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">Maximale Privacy op dit apparaat</h4>
                  <p className="text-xs text-emerald-800/90 mt-0.5 leading-relaxed">
                    Al je data wordt uitsluitend bewaard in de lokale database van deze browser. Er wordt niets naar externe servers of accounts verzonden.
                  </p>
                </div>
              </div>

              {storageMode === "local" ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold font-mono">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> DIT IS DE ACTIEVE OPSLAGMODUS
                </div>
              ) : (
                <button
                  onClick={() => {
                    onStorageModeChange("local");
                    onNotify("Opslagmodus ingesteld op: 100% Lokaal");
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs"
                >
                  Kies 100% Lokaal als actieve modus
                </button>
              )}

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Handmatige Back-up & Herstel
                </h4>
                <p className="text-xs text-slate-500">
                  Download een kopie van je hele begroting om veilig te bewaren of in te laden op een andere computer.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Download Backup */}
                  <button
                    onClick={handleExportJSON}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/40 text-left transition flex items-center gap-3 group shadow-2xs"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                        Download Back-up (.json)
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {currentBackupData.transactions.length} transacties & begroting
                      </div>
                    </div>
                  </button>

                  {/* Restore Backup */}
                  <label className="p-4 rounded-2xl border border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/40 text-left transition flex items-center gap-3 group cursor-pointer shadow-2xs">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                        Laad Back-up (.json)
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Herstel een eerder bestand
                      </div>
                    </div>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportFile}
                      className="hidden"
                      disabled={isProcessing}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE DRIVE */}
          {CLOUD_STORAGE_ENABLED && selectedTab === "gdrive" && (
            <div className="space-y-5">
              <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-950">Opslaan in je eigen Google Drive</h4>
                  <p className="text-xs text-blue-800/90 mt-0.5 leading-relaxed">
                    Je begroting wordt opgeslagen in een mapje in hún vertrouwde Google Drive. Op elke andere computer open je met één klik exact hetzelfde bestand.
                  </p>
                </div>
              </div>

              {gdriveState.isConnected ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span>Gekoppeld met: <span className="font-mono text-blue-600">{gdriveState.userEmail}</span></span>
                    </div>
                    <button
                      onClick={handleDisconnectGDrive}
                      className="text-[11px] text-red-500 hover:underline font-medium"
                    >
                      Ontkoppelen
                    </button>
                  </div>

                  <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl flex items-center justify-between">
                    <span>Map in Drive: <strong>{gdriveState.folderName}</strong></span>
                    {gdriveState.lastSyncedAt && (
                      <span className="text-[11px] text-slate-400">Laatst opgeslagen: {gdriveState.lastSyncedAt}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <button
                      onClick={handleSyncToGDrive}
                      disabled={isProcessing}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-xs"
                    >
                      <RefreshCw className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
                      <span>Nu Opslaan in Google Drive</span>
                    </button>

                    <button
                      onClick={handleLoadFromGDrive}
                      disabled={isProcessing}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition"
                    >
                      <FileCheck className="w-4 h-4 text-blue-600" />
                      <span>Inladen vanaf Google Drive</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Koppel je Google Account</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Vul het Google / Gmail e-mailadres in waar je begrotingsbestanden wilt opslaan.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="email"
                      value={gdriveInputEmail}
                      onChange={(e) => setGdriveInputEmail(e.target.value)}
                      placeholder="bijv. jouwbedrijf@gmail.com"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                      onClick={handleConnectGDrive}
                      disabled={isProcessing}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-xs"
                    >
                      <Cloud className="w-4 h-4" />
                      <span>Koppel met Google Drive</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CLOUD / MULTI-DEVICE */}
          {CLOUD_STORAGE_ENABLED && selectedTab === "cloud" && (
            <div className="space-y-5">
              <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-purple-950">Koppel Meerdere Apparaten met een Koppelcode</h4>
                  <p className="text-xs text-purple-800/90 mt-0.5 leading-relaxed">
                    Gebruik je begroting naadloos op kantoor, thuis en op je mobiel. Geen wachtwoord nodig: verbind een tweede apparaat met een veilige 6-cijferige koppelcode.
                  </p>
                </div>
              </div>

              {cloudSyncState.isLoggedIn ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        Actieve Kluis voor: <span className="text-purple-600 font-mono">{cloudSyncState.email}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Apparaat: {cloudSyncState.deviceName} {cloudSyncState.lastSyncedAt && `• Gesynchroniseerd: ${cloudSyncState.lastSyncedAt}`}
                      </div>
                    </div>
                    <button
                      onClick={handleLogoutCloud}
                      className="text-[11px] text-red-500 hover:underline font-medium"
                    >
                      Ontkoppelen
                    </button>
                  </div>

                  {/* KOPPELCODE CARD */}
                  <div className="bg-gradient-to-r from-purple-900 to-slate-900 text-white rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-purple-300 uppercase tracking-widest font-bold">
                        Jouw Koppelcode voor andere apparaten
                      </div>
                      <div className="text-2xl font-bold font-mono tracking-wider text-white mt-1">
                        {cloudSyncState.syncCode}
                      </div>
                    </div>
                    <button
                      onClick={copySyncCode}
                      className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedCode ? "Gekopieerd!" : "Kopieer code"}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={handleSyncToCloud}
                      disabled={isProcessing}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-xs"
                    >
                      <RefreshCw className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
                      <span>Nu Synchroniseren</span>
                    </button>

                    <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl flex items-center gap-2">
                      <Laptop className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>Voer deze code in op je andere computer om direct mee te kijken.</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Optie A: Nieuwe kluis aanmaken */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800">
                      1. Start een nieuwe kluis voor al je apparaten
                    </h4>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={cloudInputEmail}
                        onChange={(e) => setCloudInputEmail(e.target.value)}
                        placeholder="jouw-email@bedrijf.nl"
                        className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={handleCreateCloudAccount}
                        disabled={isProcessing}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shrink-0"
                      >
                        Maak Koppelcode
                      </button>
                    </div>
                  </div>

                  {/* Optie B: Verbinden met bestaande code */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800">
                      2. Of: Koppel dit apparaat met een bestaande code
                    </h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={cloudJoinCode}
                        onChange={(e) => setCloudJoinCode(e.target.value.toUpperCase())}
                        placeholder="bijv. ABC-123"
                        maxLength={8}
                        className="w-36 px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-center"
                      />
                      <button
                        onClick={handleJoinWithCode}
                        disabled={isProcessing}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex-1"
                      >
                        Verbind en Laad Data
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Altijd veilig & versleuteld. Jij houdt 100% controle.</span>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition"
          >
            Klaar
          </button>
        </div>

      </div>
    </div>
  );
}
