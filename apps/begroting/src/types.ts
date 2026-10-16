export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number; // positive number
  type: "income" | "expense";
  category: string;
  confidence?: number;
  isRecurring?: boolean;
  frequency?: string;
  cleanName?: string;
  sourceFileId?: string; // koppeling met het geüploade bestand, zodat een import in één keer gewist kan worden
  ownAccount?: string;     // IBAN van de eigen rekening waar dit afschrift bij hoort
  counterAccount?: string; // IBAN van de tegenpartij (als de bank die meelevert)
  counterparty?: string;   // naam van de tegenpartij (als de bank die meelevert)
}

export interface BudgetCategory {
  category: string;
  allocated: number; // yearly budget recommended or set
  spent: number; // actual spent from loaded transactions
  justification?: string;
  savingTips?: string;
}

export interface BudgetPlanning {
  year: number;
  categories: BudgetCategory[];
  strategicAdvice?: string[];
  createdAt: string;
}

export interface BankStatementFile {
  id?: string;
  format?: string;
  name: string;
  size: string;
  transactionCount: number;
  uploadedAt: string;
}

export const STANDARD_CATEGORIES = [
  "Inkomsten (Omzet)",
  "Huisvesting",
  "Kantoor & IT",
  "Marketing & Verkoop",
  "Personeel & Inhuur",
  "Reiskosten",
  "Verzekeringen & Advies",
  "Belastingen",
  "Overige Bedrijfskosten",
  "Privé (Onttrekkingen/Stortingen)",
  "Eigen rekeningen (sparen/buffer)"
];

export const INCOME_CATEGORY = "Inkomsten (Omzet)";
export const PRIVATE_CATEGORY = "Privé (Onttrekkingen/Stortingen)";
export const TRANSFER_CATEGORY = "Eigen rekeningen (sparen/buffer)";
export const UNCATEGORIZED = "Niet gecategoriseerd";

/** Categorieën die geen omzet en geen bedrijfskosten zijn: die tellen niet mee in resultaat en begroting. */
export const NON_BUSINESS_CATEGORIES = [PRIVATE_CATEGORY, TRANSFER_CATEGORY];
export const isNonBusiness = (category: string) => NON_BUSINESS_CATEGORIES.includes(category);

/**
 * Bedrag van een transactie zoals het in zijn categorie meetelt.
 * - Omzet: geld erin telt op, geld eruit (bv. een terugbetaling aan een klant) telt af.
 * - Kosten- en privécategorieën: geld eruit telt op, geld erin (bv. een terugbetaling of storting) telt af.
 */
export function categoryAmount(t: Pick<Transaction, "amount" | "type" | "category">): number {
  if (t.category === INCOME_CATEGORY) return t.type === "income" ? t.amount : -t.amount;
  return t.type === "expense" ? t.amount : -t.amount;
}

/** Hoe een transactie meetelt in het bedrijfsresultaat. */
export function businessEffect(t: Pick<Transaction, "amount" | "type" | "category">): { income: number; expense: number; excluded: boolean } {
  if (isNonBusiness(t.category)) return { income: 0, expense: 0, excluded: true };
  if (t.category === INCOME_CATEGORY) return { income: categoryAmount(t), expense: 0, excluded: false };
  if (t.category === UNCATEGORIZED || !t.category) {
    return t.type === "income" ? { income: t.amount, expense: 0, excluded: false } : { income: 0, expense: t.amount, excluded: false };
  }
  return { income: 0, expense: categoryAmount(t), excluded: false };
}

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; hex: string }> = {
  "Inkomsten (Omzet)": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", hex: "#10b981" },
  "Huisvesting": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", hex: "#3b82f6" },
  "Kantoor & IT": { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", hex: "#6366f1" },
  "Marketing & Verkoop": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", hex: "#a855f7" },
  "Personeel & Inhuur": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", hex: "#f59e0b" },
  "Reiskosten": { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", hex: "#f43f5e" },
  "Verzekeringen & Advies": { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200", hex: "#06b6d4" },
  "Belastingen": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", hex: "#f97316" },
  "Overige Bedrijfskosten": { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200", hex: "#64748b" },
  "Privé (Onttrekkingen/Stortingen)": { bg: "bg-fuchsia-50", text: "text-fuchsia-700", border: "border-fuchsia-200", hex: "#d946ef" },
  "Eigen rekeningen (sparen/buffer)": { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", hex: "#14b8a6" },
  "Niet gecategoriseerd": { bg: "bg-gray-100", text: "text-gray-500", border: "border-gray-200", hex: "#94a3b8" }
};

export type StorageMode = "local" | "gdrive" | "cloud";

// Google Drive- en Cloud-sync-opslag zijn in deze codebase nagemaakt (geen echte
// externe koppeling, alleen een setTimeout + localStorage). Voor de livegang naar
// echte deelnemers staat deze flag uit zodat alleen de wél werkende "100% Lokaal"
// optie zichtbaar is. Zet op true zodra gdrive/cloud sync echt gebouwd zijn.
export const CLOUD_STORAGE_ENABLED = false;

export interface AppBackupData {
  version: string;
  exportedAt: string;
  selectedSector: string;
  savingsBuffer: number;
  irregularExpenses: Array<{ id: string; name: string; amount: number; interval: "quarterly" | "yearly" }>;
  customRules: Array<{ id: string; keyword: string; category: string; cleanName?: string; targetType: "all" | "income" | "expense" }>;
  transactions: Transaction[];
  budgetPlanning: BudgetPlanning | null;
  files: BankStatementFile[];
  inflationPct?: number;
  revenueGrowthPct?: number;
}

