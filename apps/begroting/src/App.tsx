import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Upload,
  Shield,
  FileSpreadsheet,
  TrendingUp,
  Coins,
  FileText,
  CheckCircle,
  AlertCircle,
  Trash2,
  Plus,
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw,
  Sliders,
  HelpCircle,
  X,
  Info,
  Check,
  Building,
  ArrowRight,
  PieChart,
  Lock,
  Edit2,
  Tractor,
  Sprout,
  Calendar,
  BarChart3,
  AlertTriangle,
  PiggyBank,
  Smile,
  Heart,
  Coffee,
  Zap,
  Settings,
  SlidersHorizontal,
  Layers,
  Database,
  HardDrive,
  Cloud,
  Key,
  FolderSync,
  Laptop
} from "lucide-react";
import { Transaction, BudgetPlanning, BankStatementFile, STANDARD_CATEGORIES, CATEGORY_COLORS, StorageMode, AppBackupData, CLOUD_STORAGE_ENABLED } from "./types";
import { parseBankStatementCSV, parseRawUnstructuredText } from "./utils/parser";
import { SECTOR_DEMO_DATA } from "./data";
import { CustomRule, autoCategorizeAll, classifyTransaction } from "./utils/categorizer";
import { generateForecastBudget } from "./utils/budgetEngine";
import StorageModal from "./components/StorageModal";
import {
  getStoredStorageMode,
  saveStorageMode,
  getStoredGDriveState,
  saveGDriveState,
  getStoredCloudSyncState,
  saveCloudSyncState,
  getLastSyncTime,
  syncToGoogleDrive,
  syncToCloudVault,
  exportAppBackupJSON
} from "./utils/storageManager";

export default function App() {
  // STATE DEFINITIONS
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetPlanning, setBudgetPlanning] = useState<BudgetPlanning | null>(null);
  const [files, setFiles] = useState<BankStatementFile[]>([]);
  const [activeTab, setActiveTab] = useState<"import" | "jaaroverzicht" | "monthly" | "transactions" | "budget" | "gemoedsrust">("import");
  const [monthFilter, setMonthFilter] = useState<string>("all");

  // Storage & Synchronization State
  const [storageMode, setStorageMode] = useState<StorageMode>(() => getStoredStorageMode());
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [gdriveState, setGdriveState] = useState(() => getStoredGDriveState());
  const [cloudSyncState, setCloudSyncState] = useState(() => getStoredCloudSyncState());
  const [lastSyncTime, setLastSyncTimeState] = useState<string | null>(() => getLastSyncTime());

  const handleStorageModeChange = (mode: StorageMode) => {
    setStorageMode(mode);
    saveStorageMode(mode);
  };
  
  // Custom Categorization Rules state
  const [customRules, setCustomRules] = useState<CustomRule[]>(() => {
    const stored = localStorage.getItem("budget_planner_custom_rules");
    return stored ? JSON.parse(stored) : [];
  });
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [newRule, setNewRule] = useState<{ keyword: string; category: string; cleanName: string; targetType: "all" | "income" | "expense" }>({
    keyword: "",
    category: "Kantoor & IT",
    cleanName: "",
    targetType: "all"
  });

  // Budget Forecast Parameters
  const [inflationPct, setInflationPct] = useState<number>(3);
  const [revenueGrowthPct, setRevenueGrowthPct] = useState<number>(5);

  // Gemoedsrust (Buffer & Stress-Free Volatility Manager) State
  const [savingsBuffer, setSavingsBuffer] = useState<number>(() => {
    const stored = localStorage.getItem("budget_planner_savings_buffer");
    return stored ? parseFloat(stored) : 7500;
  });
  const [irregularExpenses, setIrregularExpenses] = useState<Array<{ id: string; name: string; amount: number; interval: "quarterly" | "yearly" }>>(() => {
    const stored = localStorage.getItem("budget_planner_irregular_expenses");
    if (stored) return JSON.parse(stored);
    return [
      { id: "irr-1", name: "Inkomstenbelasting / Vennootschapsbelasting", amount: 2400, interval: "yearly" },
      { id: "irr-2", name: "Jaarlijkse Bedrijfsverzekeringen", amount: 1200, interval: "yearly" },
      { id: "irr-3", name: "Auto-onderhoud & APK / Wegenbelasting", amount: 900, interval: "yearly" },
      { id: "irr-4", name: "Software Licenties & Cloud-hosting", amount: 600, interval: "yearly" },
      { id: "irr-5", name: "Onderhoud kantoor, inventaris of machines", amount: 800, interval: "yearly" },
    ];
  });
  const [showAddIrregularForm, setShowAddIrregularForm] = useState(false);
  const [newIrregular, setNewIrregular] = useState({
    name: "",
    amount: "",
    interval: "yearly" as "quarterly" | "yearly"
  });

  // Local effect to persist savingsBuffer and irregularExpenses
  useEffect(() => {
    localStorage.setItem("budget_planner_savings_buffer", savingsBuffer.toString());
  }, [savingsBuffer]);

  useEffect(() => {
    localStorage.setItem("budget_planner_irregular_expenses", JSON.stringify(irregularExpenses));
  }, [irregularExpenses]);

  useEffect(() => {
    localStorage.setItem("budget_planner_custom_rules", JSON.stringify(customRules));
  }, [customRules]);

  const [selectedSector, setSelectedSector] = useState<string>(() => {
    return localStorage.getItem("budget_planner_selected_sector") || "dienstverlening";
  });

  const handleSectorChange = (newSector: string) => {
    setSelectedSector(newSector);
    localStorage.setItem("budget_planner_selected_sector", newSector);
  };

  // Memoized Backup Payload for Export & Sync
  const currentBackupData: AppBackupData = useMemo(() => ({
    version: "1.1",
    exportedAt: new Date().toISOString(),
    selectedSector,
    savingsBuffer,
    irregularExpenses,
    customRules,
    transactions,
    budgetPlanning,
    files,
    inflationPct,
    revenueGrowthPct
  }), [selectedSector, savingsBuffer, irregularExpenses, customRules, transactions, budgetPlanning, files, inflationPct, revenueGrowthPct]);

  const handleRestoreData = (data: AppBackupData, sourceName: string) => {
    if (data.transactions && Array.isArray(data.transactions)) {
      setTransactions(data.transactions);
      localStorage.setItem("budget_planner_transactions", JSON.stringify(data.transactions));
    }
    if (data.budgetPlanning) {
      setBudgetPlanning(data.budgetPlanning);
      localStorage.setItem("budget_planner_budget", JSON.stringify(data.budgetPlanning));
    }
    if (data.files && Array.isArray(data.files)) {
      setFiles(data.files);
      localStorage.setItem("budget_planner_files", JSON.stringify(data.files));
    }
    if (data.selectedSector) {
      handleSectorChange(data.selectedSector);
    }
    if (data.savingsBuffer !== undefined) {
      setSavingsBuffer(data.savingsBuffer);
    }
    if (data.irregularExpenses && Array.isArray(data.irregularExpenses)) {
      setIrregularExpenses(data.irregularExpenses);
    }
    if (data.customRules && Array.isArray(data.customRules)) {
      setCustomRules(data.customRules);
    }
    if (data.inflationPct !== undefined) {
      setInflationPct(data.inflationPct);
    }
    if (data.revenueGrowthPct !== undefined) {
      setRevenueGrowthPct(data.revenueGrowthPct);
    }
    setSuccessMessage(`Begroting succesvol ingeladen vanuit ${sourceName}!`);
  };

  const handleQuickSync = async () => {
    if (storageMode === "gdrive" && gdriveState.userEmail) {
      setIsAnalyzing(true);
      try {
        const res = await syncToGoogleDrive(currentBackupData, gdriveState.userEmail);
        setGdriveState((prev) => ({ ...prev, lastSyncedAt: res.timestamp }));
        setLastSyncTimeState(res.timestamp);
        setSuccessMessage(res.message);
      } catch {
        setErrorMessage("Fout bij synchroniseren naar Google Drive.");
      } finally {
        setIsAnalyzing(false);
      }
    } else if (storageMode === "cloud" && cloudSyncState.syncCode) {
      setIsAnalyzing(true);
      try {
        const res = await syncToCloudVault(currentBackupData, cloudSyncState.syncCode);
        setCloudSyncState((prev) => ({ ...prev, lastSyncedAt: res.timestamp }));
        setLastSyncTimeState(res.timestamp);
        setSuccessMessage(res.message);
      } catch {
        setErrorMessage("Fout bij synchroniseren met kluis.");
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      setShowStorageModal(true);
    }
  };
  
  // UI Helpers
  const [isDragActive, setIsDragActive] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingBudget, setIsGeneratingBudget] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [selectedMonthlyDetail, setSelectedMonthlyDetail] = useState<string | null>(null);
  const [monthlyViewType, setMonthlyViewType] = useState<"projected" | "historical">("projected");
  const [selectedDetailCategory, setSelectedDetailCategory] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Manual Transaction Input form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTx, setNewTx] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    type: "expense" as "income" | "expense",
    category: "Niet gecategoriseerd"
  });

  // Load state from localStorage on init
  useEffect(() => {
    try {
      const storedTxs = localStorage.getItem("budget_planner_transactions");
      const storedBudget = localStorage.getItem("budget_planner_budget");
      const storedFiles = localStorage.getItem("budget_planner_files");

      if (storedTxs) {
        setTransactions(JSON.parse(storedTxs));
      }
      if (storedBudget) {
        setBudgetPlanning(JSON.parse(storedBudget));
      }
      if (storedFiles) {
        setFiles(JSON.parse(storedFiles));
      }
    } catch (e) {
      console.error("Fout bij laden van opgeslagen gegevens:", e);
    }
  }, []);

  // Save state to localStorage when changed
  const saveToLocal = (txs: Transaction[], budget: BudgetPlanning | null, uploadedFiles: BankStatementFile[]) => {
    try {
      localStorage.setItem("budget_planner_transactions", JSON.stringify(txs));
      localStorage.setItem("budget_planner_files", JSON.stringify(uploadedFiles));
      if (budget) {
        localStorage.setItem("budget_planner_budget", JSON.stringify(budget));
      } else {
        localStorage.removeItem("budget_planner_budget");
      }
    } catch (e) {
      console.error("Fout bij opslaan van gegevens:", e);
    }
  };

  // HANDLERS
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseBankStatementCSV(text, file.name);
        
        if (parsed.length === 0) {
          throw new Error("Geen geldige transacties gevonden. Controleer het bestand of probeer handmatig te plakken.");
        }

        // Run instant rule-based categorization immediately
        const categorized = autoCategorizeAll(parsed, customRules);

        const updatedTxs = [...transactions, ...categorized];
        const newFileMeta: BankStatementFile = {
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          transactionCount: parsed.length,
          uploadedAt: new Date().toLocaleDateString("nl-NL")
        };
        const updatedFiles = [...files, newFileMeta];

        setTransactions(updatedTxs);
        setFiles(updatedFiles);
        saveToLocal(updatedTxs, budgetPlanning, updatedFiles);
        setSuccessMessage(`${parsed.length} transacties succesvol ingeladen en automatisch gecategoriseerd!`);
        setActiveTab("transactions");
        setTimeout(() => setSuccessMessage(null), 5000);
      } catch (err: any) {
        setErrorMessage(err.message || "Fout bij verwerken van het bestand.");
      }
    };
    reader.readAsText(file);
  };

  const handlePasteSubmit = () => {
    setErrorMessage(null);
    if (!pastedText.trim()) {
      setErrorMessage("Plak aanzienlijk bankoverzicht of transactieregels.");
      return;
    }

    try {
      const parsed = parseRawUnstructuredText(pastedText);
      if (parsed.length === 0) {
        throw new Error("Geen herkenbare datums of bedragen gevonden in de geplakte tekst. Probeer een andere indeling.");
      }

      // Run instant rule-based categorization immediately
      const categorized = autoCategorizeAll(parsed, customRules);

      const updatedTxs = [...transactions, ...categorized];
      const newFileMeta: BankStatementFile = {
        name: "Gekopieerd Klembord",
        size: "Handmatig geplakt",
        transactionCount: parsed.length,
        uploadedAt: new Date().toLocaleDateString("nl-NL")
      };
      const updatedFiles = [...files, newFileMeta];

      setTransactions(updatedTxs);
      setFiles(updatedFiles);
      saveToLocal(updatedTxs, budgetPlanning, updatedFiles);
      setSuccessMessage(`${parsed.length} transacties succesvol herkend en automatisch gecategoriseerd!`);
      setPastedText("");
      setShowPasteArea(false);
      setActiveTab("transactions");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const loadDemoData = () => {
    setErrorMessage(null);
    const sectorData = SECTOR_DEMO_DATA[selectedSector] || SECTOR_DEMO_DATA.dienstverlening;
    
    const demoTxs = sectorData.transactions.map((t, idx) => ({
      ...t,
      id: `demo-${idx}-${Math.random().toString(36).substring(2, 5)}`
    }));

    const demoFileMeta: BankStatementFile = {
      name: sectorData.fileName,
      size: selectedSector === "dienstverlening" ? "18.5 KB" : selectedSector === "manege" ? "21.2 KB" : "24.8 KB",
      transactionCount: demoTxs.length,
      uploadedAt: new Date().toLocaleDateString("nl-NL")
    };

    const updatedFiles = [...files, demoFileMeta];
    setTransactions(demoTxs);
    setFiles(updatedFiles);

    // Formulate budget forecast for demo
    const defaultBudget = generateForecastBudget(demoTxs, {
      sector: selectedSector,
      inflationPct,
      revenueGrowthPct
    });

    setBudgetPlanning(defaultBudget);
    saveToLocal(demoTxs, defaultBudget, updatedFiles);
    setSuccessMessage(`Voorbeelddata (${sectorData.companyName}) succesvol ingeladen met jaarbegroting!`);
    setActiveTab("transactions");
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const clearAllData = () => {
    if (window.confirm("Weet je zeker dat je alle opgeslagen banktransacties en de begroting wilt wissen? Al je gegevens worden lokaal verwijderd.")) {
      setTransactions([]);
      setBudgetPlanning(null);
      setFiles([]);
      localStorage.removeItem("budget_planner_transactions");
      localStorage.removeItem("budget_planner_budget");
      localStorage.removeItem("budget_planner_files");
      setActiveTab("import");
      setSuccessMessage("Alle lokale gegevens zijn succesvol verwijderd.");
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  // Add custom manual transaction
  const handleAddManualTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.description || !newTx.amount) {
      alert("Vul alle verplichte velden in.");
      return;
    }

    const amountNum = parseFloat(newTx.amount.replace(",", "."));
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("Voer een geldig positief bedrag in.");
      return;
    }

    // Classify automatically if category not explicitly chosen
    let cat = newTx.category;
    if (cat === "Niet gecategoriseerd") {
      const classified = classifyTransaction({
        description: newTx.description,
        amount: amountNum,
        type: newTx.type
      }, customRules);
      cat = classified.category;
    }

    const manualTransaction: Transaction = {
      id: `manual-${Date.now()}`,
      date: newTx.date,
      description: newTx.description,
      amount: amountNum,
      type: newTx.type,
      category: cat
    };

    const updatedTxs = [manualTransaction, ...transactions];
    setTransactions(updatedTxs);
    saveToLocal(updatedTxs, budgetPlanning, files);
    
    // Reset form
    setNewTx({
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: "",
      type: "expense",
      category: "Niet gecategoriseerd"
    });
    setShowAddForm(false);
    setSuccessMessage("Transactie handmatig toegevoegd en gecategoriseerd!");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Edit category of a single transaction
  const handleUpdateCategory = (id: string, category: string) => {
    const updated = transactions.map(t => {
      if (t.id === id) {
        return { ...t, category };
      }
      return t;
    });
    setTransactions(updated);
    saveToLocal(updated, budgetPlanning, files);
  };

  // Fast, deterministic rule-based categorizer (100% local, no AI)
  const runAutoCategorization = () => {
    if (transactions.length === 0) return;
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const updated = autoCategorizeAll(transactions, customRules);
      const newlyCategorized = updated.filter((t, i) => transactions[i].category === "Niet gecategoriseerd" && t.category !== "Niet gecategoriseerd").length;
      
      setTransactions(updated);
      saveToLocal(updated, budgetPlanning, files);
      setIsAnalyzing(false);
      setSuccessMessage(
        newlyCategorized > 0
          ? `Slimme regelmotor voltooid! ${newlyCategorized} niet-ingedeelde posten automatisch toegewezen.`
          : `Alle ${transactions.length} transacties succesvol geanalyseerd en bijgewerkt volgens de regels!`
      );
      setTimeout(() => setSuccessMessage(null), 4500);
    }, 150);
  };

  // Custom Rules handlers
  const handleAddCustomRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.keyword.trim()) return;

    const created: CustomRule = {
      id: `rule-${Date.now()}`,
      keyword: newRule.keyword.trim(),
      category: newRule.category,
      cleanName: newRule.cleanName.trim() || undefined,
      targetType: newRule.targetType
    };

    const updatedRules = [created, ...customRules];
    setCustomRules(updatedRules);
    setNewRule({ keyword: "", category: "Kantoor & IT", cleanName: "", targetType: "all" });

    // Apply immediately to current transactions
    const updatedTxs = autoCategorizeAll(transactions, updatedRules);
    setTransactions(updatedTxs);
    saveToLocal(updatedTxs, budgetPlanning, files);
    setSuccessMessage(`Regel voor "${created.keyword}" toegevoegd en direct toegepast op ${updatedTxs.length} transacties!`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleDeleteCustomRule = (id: string) => {
    const updatedRules = customRules.filter(r => r.id !== id);
    setCustomRules(updatedRules);
  };

  // Forecast Budget generation (100% local, no AI)
  const runForecastBudgetGeneration = () => {
    if (transactions.length === 0) {
      setErrorMessage("Voeg eerst banktransacties of een voorbeeldexport toe om een begroting te berekenen.");
      return;
    }

    setIsGeneratingBudget(true);
    setTimeout(() => {
      const forecast = generateForecastBudget(transactions, {
        sector: selectedSector,
        inflationPct,
        revenueGrowthPct
      });

      setBudgetPlanning(forecast);
      saveToLocal(transactions, forecast, files);
      setIsGeneratingBudget(false);
      setSuccessMessage("Jaarbegroting berekend op basis van je historische boekingen, indexatie en sector-kenmerken!");
      setActiveTab("budget");
      setTimeout(() => setSuccessMessage(null), 5000);
    }, 200);
  };

  const updateBudgetAllocation = (categoryName: string, value: number) => {
    if (!budgetPlanning) return;
    const updatedCategories = budgetPlanning.categories.map(c => {
      if (c.category === categoryName) {
        return { ...c, allocated: value };
      }
      return c;
    });

    const updatedBudget = {
      ...budgetPlanning,
      categories: updatedCategories
    };

    setBudgetPlanning(updatedBudget);
    saveToLocal(transactions, updatedBudget, files);
  };

  // Delete individual transaction
  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    saveToLocal(updated, budgetPlanning, files);
  };

  // CALCULATED METRICS FOR CHARTS & STATS
  const stats = useMemo(() => {
    let income = 0;
    let expenses = 0;
    const byCategory: Record<string, number> = {};

    transactions.forEach(t => {
      if (t.type === "income") {
        income += t.amount;
      } else {
        expenses += t.amount;
        byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
      }
    });

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netProfit: income - expenses,
      savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
      byCategory
    };
  }, [transactions]);

  // Filters for transactions table
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.cleanName && t.cleanName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        t.amount.toString().includes(searchTerm);
      
      const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
      const matchesType = typeFilter === "all" || t.type === typeFilter;
      const matchesMonth = monthFilter === "all" || (t.date && t.date.startsWith(monthFilter));

      return matchesSearch && matchesCategory && matchesType && matchesMonth;
    });
  }, [transactions, searchTerm, categoryFilter, typeFilter, monthFilter]);

  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    transactions.forEach(t => {
      if (t.date) {
        monthsSet.add(t.date.substring(0, 7));
      }
    });
    return Array.from(monthsSet).sort();
  }, [transactions]);

  const formatMonthKey = (monthKey: string) => {
    if (!monthKey || monthKey === "all") return "Alle maanden";
    const [year, month] = monthKey.split("-");
    const monthNames = [
      "Januari", "Februari", "Maart", "April", "Mei", "Juni",
      "Juli", "Augustus", "September", "Oktober", "November", "December"
    ];
    const mIdx = parseInt(month, 10) - 1;
    if (mIdx >= 0 && mIdx < 12) {
      return `${monthNames[mIdx]} ${year}`;
    }
    return monthKey;
  };

  const monthlyStats = useMemo(() => {
    const months: Record<string, { income: number; expenses: number; transactionsCount: number }> = {};
    
    transactions.forEach(t => {
      if (!t.date) return;
      const mKey = t.date.substring(0, 7); // "YYYY-MM"
      if (!months[mKey]) {
        months[mKey] = { income: 0, expenses: 0, transactionsCount: 0 };
      }
      months[mKey].transactionsCount += 1;
      if (t.type === "income") {
        months[mKey].income += t.amount;
      } else {
        months[mKey].expenses += t.amount;
      }
    });

    const monthList = Object.entries(months)
      .map(([monthKey, data]) => {
        const [year, month] = monthKey.split("-");
        const monthNames = [
          "Januari", "Februari", "Maart", "April", "Mei", "Juni",
          "Juli", "Augustus", "September", "Oktober", "November", "December"
        ];
        const mIdx = parseInt(month, 10) - 1;
        const name = mIdx >= 0 && mIdx < 12 ? `${monthNames[mIdx]} ${year}` : monthKey;
        const net = data.income - data.expenses;
        return {
          key: monthKey,
          name,
          income: data.income,
          expenses: data.expenses,
          net,
          isLoss: net < 0,
          transactionsCount: data.transactionsCount
        };
      })
      .sort((a, b) => a.key.localeCompare(b.key));

    const maxExpenses = monthList.length > 0 ? Math.max(...monthList.map(m => m.expenses)) : 0;
    
    return monthList.map(m => ({
      ...m,
      isHighestExpense: m.expenses > 0 && m.expenses === maxExpenses
    }));
  }, [transactions]);

  const monthlyBudgetStats = useMemo(() => {
    const year = budgetPlanning?.year || (new Date().getFullYear() + 1);
    const monthNames = [
      "Januari", "Februari", "Maart", "April", "Mei", "Juni",
      "Juli", "Augustus", "September", "Oktober", "November", "December"
    ];

    // 1. Calculate total historical values by category
    const histTotalByCategory: Record<string, number> = {};
    const histMonthlyByCategory: Record<string, Record<number, number>> = {}; // category -> monthIndex (0-11) -> amount

    transactions.forEach(t => {
      const cat = t.category || "Niet gecategoriseerd";
      if (!histTotalByCategory[cat]) histTotalByCategory[cat] = 0;
      histTotalByCategory[cat] += t.amount;

      if (t.date) {
        const monthPart = parseInt(t.date.split("-")[1], 10); // 1 to 12
        if (monthPart >= 1 && monthPart <= 12) {
          const mIdx = monthPart - 1;
          if (!histMonthlyByCategory[cat]) histMonthlyByCategory[cat] = {};
          if (!histMonthlyByCategory[cat][mIdx]) histMonthlyByCategory[cat][mIdx] = 0;
          histMonthlyByCategory[cat][mIdx] += t.amount;
        }
      }
    });

    // Determine the categories with allocations
    const categoriesWithAllocation = budgetPlanning?.categories || STANDARD_CATEGORIES.map(c => {
      const histSpent = histTotalByCategory[c] || 0;
      let allocated = histSpent;
      if (c === "Inkomsten (Omzet)") {
        allocated = histSpent * 1.05;
      }
      return {
        category: c,
        allocated: allocated || 1200,
        spent: histSpent
      };
    });

    // 2. Project each of the 12 months
    const projectedMonths = Array.from({ length: 12 }, (_, mIdx) => {
      const monthNum = String(mIdx + 1).padStart(2, "0");
      const monthKey = `${year}-${monthNum}`;
      const name = `${monthNames[mIdx]} ${year}`;

      let income = 0;
      let expenses = 0;
      const categoryBreakdown: Array<{ category: string; projected: number; histActual: number }> = [];

      categoriesWithAllocation.forEach(bc => {
        const cat = bc.category;
        const yearlyAllocated = bc.allocated;

        // Determine monthly distribution ratio
        let ratio = 1 / 12;
        const totalHist = histTotalByCategory[cat] || 0;
        const histForMonth = histMonthlyByCategory[cat]?.[mIdx] || 0;
        if (totalHist > 0) {
          ratio = histForMonth / totalHist;
        }

        const projectedAmount = yearlyAllocated * ratio;

        if (cat === "Inkomsten (Omzet)") {
          income += projectedAmount;
        } else if (cat !== "Privé (Onttrekkingen/Stortingen)") { // Privé is typically excluded from company operational overhead
          expenses += projectedAmount;
        }

        categoryBreakdown.push({
          category: cat,
          projected: Math.round(projectedAmount),
          histActual: Math.round(histForMonth)
        });
      });

      const net = income - expenses;

      return {
        key: monthKey,
        monthIndex: mIdx,
        name,
        income,
        expenses,
        net,
        isLoss: net < 0,
        categoryBreakdown
      };
    });

    const maxExpenses = projectedMonths.length > 0 ? Math.max(...projectedMonths.map(m => m.expenses)) : 0;

    return projectedMonths.map(m => ({
      ...m,
      isHighestExpense: m.expenses > 0 && m.expenses === maxExpenses
    }));
  }, [transactions, budgetPlanning]);

  // Excel-like matrix data computation for either historical or projected year
  const excelMatrix = useMemo(() => {
    const activeMonths = monthlyViewType === "projected" ? monthlyBudgetStats : monthlyStats;
    
    const rows: Array<{
      category: string;
      isIncome: boolean;
      isExpense: boolean;
      isPrivate: boolean;
      values: number[];
      total: number;
    }> = [];

    const categoriesToShow = [
      "Inkomsten (Omzet)",
      ...STANDARD_CATEGORIES.filter(c => c !== "Inkomsten (Omzet)" && c !== "Privé (Onttrekkingen/Stortingen)"),
      "Privé (Onttrekkingen/Stortingen)"
    ];

    categoriesToShow.forEach(cat => {
      const isIncome = cat === "Inkomsten (Omzet)";
      const isPrivate = cat === "Privé (Onttrekkingen/Stortingen)";
      const isExpense = !isIncome && !isPrivate;

      const values = activeMonths.map(m => {
        if (monthlyViewType === "projected") {
          const found = m.categoryBreakdown?.find((cb: any) => cb.category === cat);
          return found ? found.projected : 0;
        } else {
          const monthKey = m.key; // "YYYY-MM"
          return transactions
            .filter(t => t.category === cat && t.date && t.date.startsWith(monthKey))
            .reduce((sum, t) => sum + t.amount, 0);
        }
      });

      const total = values.reduce((sum, v) => sum + v, 0);

      rows.push({
        category: cat,
        isIncome,
        isExpense,
        isPrivate,
        values,
        total
      });
    });

    // Compute totals for Expenses (excluding Private and Income)
    const expenseValues = activeMonths.map((_, colIdx) => {
      return rows
        .filter(r => r.isExpense)
        .reduce((sum, r) => sum + r.values[colIdx], 0);
    });
    const totalExpensesSum = expenseValues.reduce((sum, v) => sum + v, 0);

    // Compute Net Result: Income - Expenses (excluding Private)
    const incomeRow = rows.find(r => r.isIncome);
    const netValues = activeMonths.map((_, colIdx) => {
      const inc = incomeRow ? incomeRow.values[colIdx] : 0;
      const exp = expenseValues[colIdx];
      return inc - exp;
    });
    const totalNetSum = netValues.reduce((sum, v) => sum + v, 0);

    return {
      months: activeMonths,
      categoryRows: rows,
      expenseValues,
      totalExpensesSum,
      netValues,
      totalNetSum
    };
  }, [transactions, monthlyViewType, monthlyBudgetStats, monthlyStats]);

  const exportMatrixAsCSV = () => {
    const { months, categoryRows, expenseValues, totalExpensesSum, netValues, totalNetSum } = excelMatrix;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    const headers = ["Categorie", ...months.map(m => m.name.split(" ")[0]), "TOTAAL (Jaar)"];
    csvContent += headers.map(h => `"${h}"`).join(",") + "\n";

    categoryRows.forEach(row => {
      const line = [
        row.category,
        ...row.values,
        row.total
      ];
      csvContent += line.map(v => typeof v === "number" ? Math.round(v) : `"${v}"`).join(",") + "\n";
    });

    const expLine = [
      "Totaal Bedrijfskosten",
      ...expenseValues,
      totalExpensesSum
    ];
    csvContent += expLine.map(v => typeof v === "number" ? Math.round(v) : `"${v}"`).join(",") + "\n";

    const netLine = [
      "Netto Bedrijfsresultaat (W&V)",
      ...netValues,
      totalNetSum
    ];
    csvContent += netLine.map(v => typeof v === "number" ? Math.round(v) : `"${v}"`).join(",") + "\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Jaaroverzicht_${monthlyViewType === "projected" ? "Begroting" : "Werkelijk"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Paginated Transactions
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Gemoedsrust helper formulas and handlers
  const avgMonthlyExpenses = useMemo(() => {
    if (transactions.length === 0) return 2500;
    const uniqueMonthsCount = availableMonths.length || 1;
    return Math.max(stats.totalExpenses / uniqueMonthsCount, 500); // at least €500
  }, [transactions, stats.totalExpenses, availableMonths]);

  const totalMonthlyIrregularReservation = useMemo(() => {
    return irregularExpenses.reduce((sum, exp) => {
      const monthlyAmount = exp.interval === "quarterly" ? exp.amount / 3 : exp.amount / 12;
      return sum + monthlyAmount;
    }, 0);
  }, [irregularExpenses]);

  const runwayMonths = useMemo(() => {
    if (avgMonthlyExpenses <= 0) return 0;
    return savingsBuffer / avgMonthlyExpenses;
  }, [savingsBuffer, avgMonthlyExpenses]);

  // Determine Runway Feedback
  const runwayFeedback = useMemo(() => {
    if (runwayMonths < 1) {
      return {
        badge: "Opbouwend",
        colorClass: "bg-amber-50 text-amber-800 border-amber-200/60",
        barColorClass: "bg-amber-500",
        message: "Je hebt nog een beperkte buffer. Focus op het opbouwen van minimaal 1 maand vaste lasten (€" + Math.round(avgMonthlyExpenses).toLocaleString("nl-NL") + ") aan ademruimte. Elke euro is een stap naar meer rust."
      };
    } else if (runwayMonths < 3) {
      return {
        badge: "Fijne Start",
        colorClass: "bg-emerald-50 text-emerald-800 border-emerald-200/60",
        barColorClass: "bg-emerald-500",
        message: "Een mooie start! Je hebt genoeg reserve om korte inkomensschommelingen op te vangen. Probeer stapsgewijs toe te werken naar 3 maanden."
      };
    } else if (runwayMonths < 6) {
      return {
        badge: "Gezond & Veilig",
        colorClass: "bg-teal-50 text-teal-800 border-teal-200/60",
        barColorClass: "bg-teal-500",
        message: "Dit is de gouden standaard voor ondernemers! Met 3 tot 6 maanden buffer kun je met een gerust hart ondernemen en tijdelijke tegenwind rustig uitzitten."
      };
    } else {
      return {
        badge: "IJzersterk fundament",
        colorClass: "bg-rose-50 text-rose-800 border-rose-200/60",
        barColorClass: "bg-rose-500",
        message: "Geweldig gedaan! Je hebt een buitengewone buffer opgebouwd. Schommelingen in je omzet of plotselinge grote rekeningen kunnen jou absoluut niet uit je rust brengen."
      };
    }
  }, [runwayMonths, avgMonthlyExpenses]);

  const handleAddIrregularExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newIrregular.amount.replace(",", "."));
    if (!newIrregular.name || isNaN(amountNum) || amountNum <= 0) return;

    const newItem = {
      id: "irr-" + Math.random().toString(36).substring(2, 9),
      name: newIrregular.name,
      amount: amountNum,
      interval: newIrregular.interval
    };

    setIrregularExpenses([...irregularExpenses, newItem]);
    setNewIrregular({ name: "", amount: "", interval: "yearly" });
    setShowAddIrregularForm(false);
  };

  const handleDeleteIrregularExpense = (id: string) => {
    setIrregularExpenses(irregularExpenses.filter(item => item.id !== id));
  };

  // SVG Chart data preparation
  const donutChartSegments = useMemo(() => {
    const activeCategories = (Object.entries(stats.byCategory) as [string, number][])
      .filter(([_, value]) => value > 0)
      .sort((a, b) => b[1] - a[1]);

    const total = activeCategories.reduce((sum, [_, val]) => sum + val, 0);
    let accumulatedAngle = 0;

    return activeCategories.map(([name, value]) => {
      const percentage = total > 0 ? (value / total) * 100 : 0;
      const angle = (percentage / 100) * 360;
      const startAngle = accumulatedAngle;
      accumulatedAngle += angle;

      // Coordinate math for SVG paths
      const radius = 70;
      const x1 = 100 + radius * Math.cos((startAngle - 90) * Math.PI / 180);
      const y1 = 100 + radius * Math.sin((startAngle - 90) * Math.PI / 180);
      const x2 = 100 + radius * Math.cos((accumulatedAngle - 90) * Math.PI / 180);
      const y2 = 100 + radius * Math.sin((accumulatedAngle - 90) * Math.PI / 180);
      const largeArc = angle > 180 ? 1 : 0;

      const colorMeta = CATEGORY_COLORS[name] || CATEGORY_COLORS["Niet gecategoriseerd"];

      return {
        name,
        value,
        percentage,
        color: colorMeta.hex,
        textColor: colorMeta.text,
        path: `M 100 100 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
      };
    });
  }, [stats.byCategory]);

  // Export utility: JSON or CSV
  const exportBudgetAsCSV = () => {
    if (!budgetPlanning) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Categorie,Werkelijk Afgelopen Jaar,Nieuw Begroot Jaar,Verschil (EUR),Toelichting\n";

    budgetPlanning.categories.forEach(c => {
      const diff = c.allocated - c.spent;
      csvContent += `"${c.category}",${c.spent},${c.allocated},${diff},"${(c.justification || "").replace(/"/g, '""')}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Jaarbegroting_${budgetPlanning.year}_Planner.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportBudgetAsJSON = () => {
    if (!budgetPlanning) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(budgetPlanning, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `Slimme_Begroting_${budgetPlanning.year}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-950">
      
      {/* PROFESSIONAL TRUST & SECURITY MARGIN LINE */}
      <div className="bg-emerald-950 text-emerald-100 text-xs px-4 py-2 flex flex-col sm:flex-row items-center justify-between border-b border-emerald-900/60 font-mono tracking-wide shadow-xs gap-2">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-bold text-white">
            {storageMode === "local" && "💾 OPSLAG: 100% LOKAAL OP DIT APPARAAT"}
            {storageMode === "gdrive" && `📁 GOOGLE DRIVE GEKOPPELD (${gdriveState.userEmail || "Actief"})`}
            {storageMode === "cloud" && `☁️ KLUIS GESYNCHRONISEERD (${cloudSyncState.syncCode || "Actief"})`}
          </span>
          <span className="hidden md:inline text-emerald-400">|</span>
          <span className="hidden md:inline text-emerald-200/80 text-[11px]">
            {storageMode === "local" && "Geen account nodig • 100% in eigen browser"}
            {storageMode === "gdrive" && `Laatste sync: ${gdriveState.lastSyncedAt || "Zojuist"}`}
            {storageMode === "cloud" && `Laatste sync: ${cloudSyncState.lastSyncedAt || "Zojuist"}`}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {(storageMode === "gdrive" || storageMode === "cloud") && (
            <button
              onClick={handleQuickSync}
              className="flex items-center gap-1 text-[11px] bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 px-2.5 py-1 rounded-md border border-emerald-500/40 transition cursor-pointer font-sans"
              title="Nu direct synchroniseren"
            >
              <RefreshCw className={`w-3 h-3 text-emerald-300 ${isAnalyzing ? "animate-spin" : ""}`} />
              <span>Nu Synchroniseren</span>
            </button>
          )}
          <button
            onClick={() => setShowStorageModal(true)}
            className="flex items-center gap-1.5 text-[11px] text-emerald-300 hover:text-white bg-emerald-900/60 hover:bg-emerald-800/80 px-2.5 py-1 rounded-md border border-emerald-500/30 transition cursor-pointer font-sans font-semibold"
          >
            <FolderSync className="w-3 h-3 text-emerald-400" />
            <span>Wijzig Opslag & Back-up</span>
          </button>
        </div>
      </div>

      {/* HEADER SECTION */}
      <header className="bg-white border-b border-slate-200 py-6 px-4 md:px-8 shadow-xs relative">
        <img
          src={`${import.meta.env.BASE_URL}meavia-logo.png`}
          alt="Meavia"
          className="hidden md:block absolute top-4 right-6 h-14 w-auto object-contain opacity-90"
        />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/15">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight">Slimme Begrotingsplanner</h1>
                <p className="text-xs text-slate-500 mt-0.5">Moeiteloos bankafschriften categoriseren & begroten voor ondernemers</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
            <button
              onClick={() => setActiveTab("import")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shrink-0 ${
                activeTab === "import"
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Upload className="w-4 h-4" />
              1. Importeer Bank
            </button>
            <button
              onClick={() => setActiveTab("jaaroverzicht")}
              disabled={transactions.length === 0}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shrink-0 ${
                transactions.length === 0 ? "opacity-50 cursor-not-allowed" : ""
              } ${
                activeTab === "jaaroverzicht"
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              2. Excel Jaaroverzicht
            </button>
            <button
              onClick={() => setActiveTab("monthly")}
              disabled={transactions.length === 0}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shrink-0 ${
                transactions.length === 0 ? "opacity-50 cursor-not-allowed" : ""
              } ${
                activeTab === "monthly"
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              3. Maandoverzicht (Details)
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              disabled={transactions.length === 0}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shrink-0 ${
                transactions.length === 0 ? "opacity-50 cursor-not-allowed" : ""
              } ${
                activeTab === "transactions"
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              4. Transacties ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTab("budget")}
              disabled={transactions.length === 0}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shrink-0 ${
                transactions.length === 0 ? "opacity-50 cursor-not-allowed" : ""
              } ${
                activeTab === "budget"
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              5. Jaarbegroting Planning
            </button>
            <button
              onClick={() => setActiveTab("gemoedsrust")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shrink-0 ${
                activeTab === "gemoedsrust"
                  ? "bg-rose-50 text-rose-700 font-semibold border border-rose-200/50"
                  : "text-slate-600 hover:bg-rose-50/30 hover:text-rose-700"
              }`}
            >
              <Heart className={`w-4 h-4 ${activeTab === "gemoedsrust" ? "text-rose-600 fill-rose-600 animate-pulse" : "text-rose-500"}`} />
              6. Gemoedsrust & Buffer
            </button>

            {/* QUICK STORAGE BUTTON */}
            <button
              onClick={() => setShowStorageModal(true)}
              className="px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-2xs"
              title="Opslag & synchronisatie instellen"
            >
              {storageMode === "local" && <HardDrive className="w-3.5 h-3.5 text-emerald-600" />}
              {storageMode === "gdrive" && <Cloud className="w-3.5 h-3.5 text-blue-600" />}
              {storageMode === "cloud" && <Key className="w-3.5 h-3.5 text-purple-600" />}
              <span className="hidden xl:inline">
                {storageMode === "local" && "Opslag: Lokaal"}
                {storageMode === "gdrive" && "Google Drive"}
                {storageMode === "cloud" && "Kluis Sync"}
              </span>
              <Settings className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      {/* NOTIFICATIONS CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-800 animate-fadeIn shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-semibold">Foutmelding:</span> {errorMessage}
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 text-emerald-800 animate-fadeIn shadow-xs">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-sm font-medium">
              {successMessage}
            </div>
          </div>
        )}
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-20">
        
        {/* ========================================================================= */}
        {/* TAB 1: IMPORT & ONBOARDING */}
        {/* ========================================================================= */}
        {activeTab === "import" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left/Middle Column - Interactive file uploader */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Privacy promise card */}
              <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-emerald-100 rounded-2xl p-6 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Shield className="w-32 h-32" />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-800/40 border border-emerald-500/30 rounded-full text-xs text-emerald-400 font-semibold font-mono">
                    <Shield className="w-3.5 h-3.5" /> PRIVACY GARANTIE
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight text-white">Je bankafschriften verlaten nooit je computer</h2>
                  <p className="text-emerald-200/80 text-sm leading-relaxed max-w-xl">
                    In tegenstelling tot reguliere online boekhoudprogramma's slaat deze begrotingsplanner nooit bestanden of bankgegevens op op externe servers. Al je transactiehistorie en berekeningen blijven 100% in de beveiligde lokale opslag van je eigen browser{CLOUD_STORAGE_ENABLED ? " of in je eigen gekoppelde Google Drive" : ""}.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center gap-2.5 text-xs text-emerald-300">
                      <div className="w-5 h-5 rounded-full bg-emerald-800/50 flex items-center justify-center text-emerald-400 font-bold">✓</div>
                      <span>Geen gedwongen registratie</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-emerald-300">
                      <div className="w-5 h-5 rounded-full bg-emerald-800/50 flex items-center justify-center text-emerald-400 font-bold">✓</div>
                      <span>100% Lokale & Veilige Verwerking</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* STORAGE & SYNC CHOICE CARD */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold font-display text-slate-900">1. Opslag</h3>
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full font-mono">
                        {storageMode === "local" && "💻 100% Lokaal"}
                        {storageMode === "gdrive" && "📁 Google Drive"}
                        {storageMode === "cloud" && "☁️ Meerdere Apparaten"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {CLOUD_STORAGE_ENABLED
                        ? "Werk anoniem op 1 computer, of synchroniseer je begroting veilig tussen kantoor en thuis."
                        : "Alles blijft veilig en anoniem in de browser van dit apparaat."}
                    </p>
                  </div>

                  {CLOUD_STORAGE_ENABLED && (
                    <button
                      onClick={() => setShowStorageModal(true)}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100/80 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto border border-emerald-200/60 shrink-0 shadow-2xs"
                    >
                      <FolderSync className="w-4 h-4 text-emerald-600" />
                      <span>Beheer Opslag & Back-up</span>
                    </button>
                  )}
                </div>

                <div className={`grid grid-cols-1 ${CLOUD_STORAGE_ENABLED ? "sm:grid-cols-3" : "sm:max-w-xs"} gap-3 pt-1`}>
                  {/* Option 1: Local */}
                  <button
                    onClick={() => {
                      handleStorageModeChange("local");
                      setSuccessMessage("Opslagmodus ingesteld op: 100% Lokaal op dit apparaat.");
                    }}
                    className={`p-3.5 rounded-xl border text-left transition relative flex flex-col justify-between cursor-pointer ${
                      storageMode === "local"
                        ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500 shadow-2xs"
                        : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <HardDrive className="w-4 h-4" />
                        </div>
                        {storageMode === "local" && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-900">100% Lokaal</div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        Geen account nodig. Alles blijft veilig op deze computer.
                      </p>
                    </div>
                    <div className="text-[10px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
                      {storageMode === "local" ? "✓ Actief geselecteerd" : "Klik om te kiezen"}
                    </div>
                  </button>

                  {/* Option 2: Google Drive */}
                  {CLOUD_STORAGE_ENABLED && (
                    <button
                      onClick={() => {
                        if (!gdriveState.isConnected) {
                          setShowStorageModal(true);
                        } else {
                          handleStorageModeChange("gdrive");
                          setSuccessMessage("Opslag ingesteld op: Google Drive");
                        }
                      }}
                      className={`p-3.5 rounded-xl border text-left transition relative flex flex-col justify-between cursor-pointer ${
                        storageMode === "gdrive"
                          ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500 shadow-2xs"
                          : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                            <Cloud className="w-4 h-4" />
                          </div>
                          {storageMode === "gdrive" && (
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-slate-900">Google Drive</div>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          Sla op in je eigen Google Cloud map voor meerdere apparaten.
                        </p>
                      </div>
                      <div className="text-[10px] text-blue-700 font-semibold mt-2 flex items-center gap-1">
                        {storageMode === "gdrive" ? "✓ Actief gekoppeld" : gdriveState.isConnected ? "Kies Google Drive" : "Koppel Google Drive"}
                      </div>
                    </button>
                  )}

                  {/* Option 3: Multi-device */}
                  {CLOUD_STORAGE_ENABLED && (
                    <button
                      onClick={() => {
                        if (!cloudSyncState.isLoggedIn) {
                          setShowStorageModal(true);
                        } else {
                          handleStorageModeChange("cloud");
                          setSuccessMessage("Opslag ingesteld op: Meerdere Apparaten (Kluis)");
                        }
                      }}
                      className={`p-3.5 rounded-xl border text-left transition relative flex flex-col justify-between cursor-pointer ${
                        storageMode === "cloud"
                          ? "border-purple-500 bg-purple-50/50 ring-1 ring-purple-500 shadow-2xs"
                          : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                            <Key className="w-4 h-4" />
                          </div>
                          {storageMode === "cloud" && (
                            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-slate-900">Koppelcode</div>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          Wissel tussen kantoor, thuis en laptop via 6-cijferige code.
                        </p>
                      </div>
                      <div className="text-[10px] text-purple-700 font-semibold mt-2 flex items-center gap-1">
                        {storageMode === "cloud" ? "✓ Koppelcode actief" : cloudSyncState.isLoggedIn ? "Kies Koppelcode" : "Maak Koppelcode"}
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* SECTOR SELECTOR CARD */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-900">2. Vul je type bedrijf of bedrijfstak in</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Vul in wat voor bedrijf je hebt of in welke sector je actief bent. De begrotingsmotor gebruikt dit om je transacties optimaal te categoriseren en gerichte sector-besparingstips te berekenen.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="relative rounded-xl max-w-lg">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Edit2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <input
                      type="text"
                      id="custom-sector-input"
                      value={selectedSector}
                      onChange={(e) => handleSectorChange(e.target.value)}
                      placeholder="Bijv. Bakkerij, Hovenier, Manege, Dienstverlening, Schilder, Webshop..."
                      className="block w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-150 font-medium text-slate-800 shadow-2xs"
                    />
                    {selectedSector.trim() !== "" && (
                      <button
                        onClick={() => handleSectorChange("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        title="Veld leegmaken"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {selectedSector.trim() !== "" ? (
                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Actief ingesteld type bedrijf: <span className="underline font-mono text-slate-900 bg-emerald-50 px-1.5 py-0.5 rounded">{selectedSector}</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                      Vul hierboven je type bedrijf in om de begrotingsanalyse extra context te geven.
                    </p>
                  )}
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-slate-500 flex items-start gap-2">
                  <Sprout className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Slimme Begrotingsmotor:</strong> Door je type bedrijf of sector op te geven, worden specifieke posten (zoals voer, loonwerk, pacht, diesel of inkoop goederen) automatisch herkend en ontvang je toepasbare besparingstips en benchmarks afgestemd op jouw sector.
                  </span>
                </div>
              </div>

              {/* UPLOADER INTERFACE CARD */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-900">3. Upload bankafschriften (CSV of Tekst)</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Sleep de geëxporteerde CSV van Rabobank, ING of ABN AMRO hieronder naartoe, of plak een tekstkopie uit je bankapp.
                  </p>
                </div>

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                  onDragLeave={() => setIsDragActive(false)}
                  onDrop={handleFileDrop}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                    isDragActive
                      ? "border-emerald-500 bg-emerald-50/50 scale-[0.99]"
                      : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                  }`}
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    accept=".csv, .txt, text/csv, text/plain"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h4 className="font-semibold text-sm text-slate-800">Klik of sleep een bestand hierheen</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Ondersteunt Rabobank, ING, ABN AMRO exports & generieke Excel CSV-bestanden. 100% lokaal in je browser.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-400 py-1">
                  <div className="h-px bg-slate-200 w-full"></div>
                  <span>OF</span>
                  <div className="h-px bg-slate-200 w-full"></div>
                </div>

                {/* Paste Area Toggle */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setShowPasteArea(!showPasteArea)}
                      className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline font-medium flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {showPasteArea ? "Verberg plakvenster" : "Handmatig bankregels plakken (Copy/Paste)"}
                    </button>
                  </div>

                  {showPasteArea && (
                    <div className="space-y-3 animate-fadeIn">
                      <textarea
                        rows={6}
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                        placeholder="Plak hier je transactieregels. Bijvoorbeeld:&#10;15-02-2025  Adobe Systems Software  -€15,50&#10;18-02-2025  Betaling Factuur 2025-001  +€2450,00"
                        className="w-full text-xs font-mono p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50"
                      />
                      <button
                        onClick={handlePasteSubmit}
                        className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition shadow-xs"
                      >
                        Verwerk geplakte tekst
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* DEMO LAUNCHER */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 font-display text-sm">Geen bankexport bij de hand?</h4>
                  <p className="text-xs text-slate-500">
                    Probeer direct onze complete demo gevuld met een jaar aan realistische transacties van <strong>{SECTOR_DEMO_DATA[selectedSector]?.companyName || "ons voorbeeldbedrijf"}</strong>.
                  </p>
                </div>
                <button
                  onClick={loadDemoData}
                  className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition flex items-center gap-2 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Laad voorbeelddata
                </button>
              </div>
            </div>

            {/* Right Column - Checklist & Guidelines */}
            <div className="space-y-6">
              
              {/* HOW IT WORKS WIDGET */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 font-display text-sm pb-4 border-b border-slate-100 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-600" />
                  Hoe werkt de planner?
                </h3>

                <div className="space-y-5 pt-4">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs flex items-center justify-center shrink-0">1</div>
                    <div>
                      <h4 className="font-semibold text-xs text-slate-800">Bankbestanden laden</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Upload een CSV export van je bank of kopieer tekstregels uit je bankoverzicht.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs flex items-center justify-center shrink-0">2</div>
                    <div>
                      <h4 className="font-semibold text-xs text-slate-800">Automatisch indelen (100% Lokaal)</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Onze ingebouwde snelle regelmotor categoriseert direct inkomsten, vaste lasten en leveranciers zonder externe servers.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs flex items-center justify-center shrink-0">3</div>
                    <div>
                      <h4 className="font-semibold text-xs text-slate-800">Jaarbegroting downloaden</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Zie direct een realistisch begrotingsvoorstel voor volgend jaar, pas cijfers aan en download je begrotingsplanning.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* UPLOADED FILES LOG */}
              {files.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 font-display text-xs">Geüploade bestanden</h3>
                    <button
                      onClick={clearAllData}
                      className="text-[10px] text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <Trash2 className="w-3 h-3" /> Wis alles
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {files.map((file, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-700 truncate">{file.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{file.transactionCount} regels • {file.uploadedAt}</p>
                        </div>
                        <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-mono font-medium shrink-0">
                          {file.size}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: EXCEL-STYLE 12-MONTH OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === "jaaroverzicht" && (() => {
          const { months, categoryRows, expenseValues, totalExpensesSum, netValues, totalNetSum } = excelMatrix;
          
          const incomeRow = categoryRows.find(r => r.category === "Inkomsten (Omzet)");
          const totalIncomeSum = incomeRow ? incomeRow.total : 0;
          const netMargin = totalIncomeSum > 0 ? (totalNetSum / totalIncomeSum) * 100 : 0;

          return (
            <div className="space-y-6 animate-fadeIn">
              
              {/* SPREADSHEET HEADER BANNER */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 font-display text-base flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    12-Maanden Jaarsheet (Excel-stijl)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xl">
                    Een compact en overzichtelijk financieel jaaroverzicht met inkomsten en uitgaven naast elkaar. Net zoals je vertrouwde Excel-bestand.
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 select-none">
                  <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
                    <button
                      onClick={() => setMonthlyViewType("projected")}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition duration-150 flex items-center gap-1.5 ${
                        monthlyViewType === "projected"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-800"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Begroting (Prognose)
                    </button>
                    <button
                      onClick={() => setMonthlyViewType("historical")}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition duration-150 flex items-center gap-1.5 ${
                        monthlyViewType === "historical"
                          ? "bg-slate-700 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-800"
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      Werkelijk (Historisch)
                    </button>
                  </div>

                  <button
                    onClick={exportMatrixAsCSV}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
                    title="Exporteer dit overzicht als CSV-bestand voor Excel of Google Sheets"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    Exporteer naar Excel
                  </button>
                </div>
              </div>

              {/* HIGH-DENSITY METRIC CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Totale Inkomsten (Jaar)</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl font-bold font-mono text-emerald-600">
                      €{Math.round(totalIncomeSum).toLocaleString("nl-NL")}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {monthlyViewType === "projected" ? "Geprojecteerde jaaromzet" : "Gerealiseerde jaaromzet"}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Totale Uitgaven (Jaar)</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl font-bold font-mono text-rose-600">
                      €{Math.round(totalExpensesSum).toLocaleString("nl-NL")}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Exclusief privé-onttrekkingen</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Netto Resultaat (W&V)</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className={`text-xl font-bold font-mono ${totalNetSum >= 0 ? "text-emerald-700" : "text-rose-700 animate-pulse"}`}>
                      €{Math.round(totalNetSum).toLocaleString("nl-NL")}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {totalNetSum >= 0 ? "Winst over het gehele jaar" : "Netto verlies over het jaar"}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Operationele Marge</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className={`text-xl font-bold font-mono ${netMargin >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                      {netMargin.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Winstpercentage van de omzet</p>
                </div>
              </div>

              {/* MAIN SPREADSHEET CARD */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 tracking-tight flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                    Blad 1: Jaaroverzicht ({monthlyViewType === "projected" ? "Prognose Begroting" : "Historische Realiteit"})
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] font-semibold text-slate-500 font-mono">100% Berekening Actief</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-[11px] text-slate-500 font-mono font-bold">
                        <th className="p-2.5 pl-4 border-r border-slate-200 min-w-[200px] sticky left-0 bg-slate-100 z-10 shadow-sm">
                          FINANCIEEL OVERZICHT
                        </th>
                        {months.map((m, idx) => (
                          <th key={idx} className="p-2.5 text-center border-r border-slate-200 min-w-[90px]">
                            {m.name.split(" ")[0]}
                          </th>
                        ))}
                        <th className="p-2.5 text-center bg-slate-200/80 text-slate-900 border-l border-slate-300 min-w-[110px]">
                          TOTAAL (JAAR)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* RENDER CATEGORIES */}
                      {categoryRows.map((row, rIdx) => {
                        const isIncome = row.isIncome;
                        const isPrivate = row.isPrivate;
                        
                        let rowBg = "hover:bg-slate-50/70";
                        let fontClass = "text-slate-700 text-xs";
                        
                        if (isIncome) {
                          rowBg = "bg-emerald-50/30 hover:bg-emerald-50/50";
                          fontClass = "font-bold text-slate-900 text-xs";
                        } else if (isPrivate) {
                          rowBg = "bg-fuchsia-50/10 hover:bg-fuchsia-50/20 border-t border-slate-200";
                          fontClass = "italic text-slate-600 text-xs";
                        }

                        return (
                          <tr key={rIdx} className={`border-b border-slate-200/80 ${rowBg} transition-colors`}>
                            <td className="p-2 pl-4 border-r border-slate-200 font-medium sticky left-0 bg-white/95 z-10 shadow-xs flex items-center gap-1.5 min-h-[38px]">
                              <span className={`w-2 h-2 rounded-full ${
                                isIncome ? "bg-emerald-500" : isPrivate ? "bg-fuchsia-400" : "bg-slate-300"
                              }`} />
                              <span className={fontClass}>{row.category}</span>
                            </td>
                            {row.values.map((val, cIdx) => (
                              <td 
                                key={cIdx} 
                                className={`p-2 text-right border-r border-slate-200 font-mono text-xs ${
                                  isIncome 
                                    ? "text-emerald-700 font-semibold" 
                                    : isPrivate 
                                      ? "text-fuchsia-700" 
                                      : val > 0 
                                        ? "text-slate-800" 
                                        : "text-slate-300"
                                }`}
                              >
                                {val > 0 ? `€${Math.round(val).toLocaleString("nl-NL")}` : "€0"}
                              </td>
                            ))}
                            <td className={`p-2 text-right font-mono text-xs font-bold border-l border-slate-300 ${
                              isIncome 
                                ? "bg-emerald-50 text-emerald-800" 
                                : isPrivate 
                                  ? "bg-fuchsia-50 text-fuchsia-800" 
                                  : "bg-slate-50 text-slate-800"
                            }`}>
                              €{Math.round(row.total).toLocaleString("nl-NL")}
                            </td>
                          </tr>
                        );
                      })}

                      {/* TOTAL OPERATING EXPENSES ROW */}
                      <tr className="bg-rose-50/20 border-t-2 border-slate-300 border-b border-slate-200">
                        <td className="p-2.5 pl-4 border-r border-slate-200 font-bold text-slate-800 text-xs sticky left-0 bg-rose-50/10 z-10 shadow-xs">
                          Totaal Bedrijfskosten (Overhead)
                        </td>
                        {expenseValues.map((val, cIdx) => (
                          <td key={cIdx} className="p-2.5 text-right border-r border-slate-200 font-mono text-xs font-bold text-rose-700">
                            €{Math.round(val).toLocaleString("nl-NL")}
                          </td>
                        ))}
                        <td className="p-2.5 text-right font-mono text-xs font-bold bg-rose-50 border-l border-slate-300 text-rose-800">
                          €{Math.round(totalExpensesSum).toLocaleString("nl-NL")}
                        </td>
                      </tr>

                      {/* NET RESULT ROW (DOUBLE BORDER EXCEL EFFECT) */}
                      <tr className="bg-slate-50 font-bold border-t border-slate-300 border-b-4 border-double border-slate-400">
                        <td className="p-3 pl-4 border-r border-slate-200 text-slate-900 text-xs sticky left-0 bg-slate-50 z-10 shadow-xs">
                          Netto Bedrijfsresultaat (W&V)
                        </td>
                        {netValues.map((val, cIdx) => {
                          const isLoss = val < 0;
                          return (
                            <td 
                              key={cIdx} 
                              className={`p-3 text-right border-r border-slate-200 font-mono text-xs font-bold ${
                                isLoss ? "text-rose-700 bg-rose-50/40" : "text-emerald-800 bg-emerald-50/20"
                              }`}
                            >
                              €{Math.round(val).toLocaleString("nl-NL")}
                            </td>
                          );
                        })}
                        <td className={`p-3 text-right font-mono text-xs font-bold border-l border-slate-300 ${
                          totalNetSum >= 0 ? "bg-emerald-100/60 text-emerald-950" : "bg-rose-100/60 text-rose-950"
                        }`}>
                          €{Math.round(totalNetSum).toLocaleString("nl-NL")}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-50 p-4 border-t border-slate-200 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Tip: Alle getallen zijn automatisch afgerond op hele euro's, net zoals in een formele jaarbegroting.
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Inkomsten</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <span>Kosten</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-fuchsia-400" />
                      <span>Privé</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* MINI ADVICE OR ACTION BOX */}
              <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-5 shadow-2xs">
                <h4 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                  Gemoedsrust Dashboard Snelkoppeling
                </h4>
                <p className="text-xs text-emerald-800 mt-1 max-w-3xl leading-relaxed">
                  Zit er een maand met hoge incidentele bedrijfskosten of een dip in je inkomsten tussen? 
                  Gebruik onze <strong className="cursor-pointer underline hover:text-emerald-950" onClick={() => setActiveTab("gemoedsrust")}>Gemoedsrust & Buffer Calculator (Tab 6)</strong> om deze schommelingen risicoloos op te vangen met een seizoensbuffer of spreidingsplan.
                </p>
              </div>

            </div>
          );
        })()}

        {/* ========================================================================= */}
        {/* TAB: MONTHLY PROFIT & LOSS BREAKDOWN (FUTURE BUDGET VS HISTORICAL ACTUALS) */}
        {/* ========================================================================= */}
        {activeTab === "monthly" && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* VIEW MODE TOGGLE BANNER */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 font-display text-sm">Winst & Verlies Maandanalyse</h3>
                <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                  Deze app is gericht op <strong>het komende jaar</strong>. Bekijk de seizoensgebonden geprojecteerde begroting of wissel naar de reële historische cijfers van afgelopen jaar.
                </p>
              </div>
              <div className="flex gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0 select-none">
                <button
                  onClick={() => {
                    setMonthlyViewType("projected");
                    setSelectedMonthlyDetail(null);
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition duration-200 flex items-center gap-1.5 ${
                    monthlyViewType === "projected"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Komend Jaar (Begroot)
                </button>
                <button
                  onClick={() => {
                    setMonthlyViewType("historical");
                    setSelectedMonthlyDetail(null);
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition duration-200 flex items-center gap-1.5 ${
                    monthlyViewType === "historical"
                      ? "bg-slate-700 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Afgelopen Jaar (Werkelijk)
                </button>
              </div>
            </div>

            {/* TOP STATS FOR MONTHLY TAB */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold">Winstgevende Maanden</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-bold font-mono text-emerald-700">
                    {(monthlyViewType === "projected" ? monthlyBudgetStats : monthlyStats).filter(m => m.net >= 0).length}
                  </h3>
                  <p className="text-[11px] text-emerald-600 mt-0.5">Resultaat is positief (+)</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold">Verliesgevende Maanden</span>
                  <div className="w-7 h-7 rounded-lg bg-red-100 text-red-800 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 rotate-180" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className={`text-2xl font-bold font-mono ${
                    (monthlyViewType === "projected" ? monthlyBudgetStats : monthlyStats).filter(m => m.net < 0).length > 0 ? "text-red-600 animate-pulse" : "text-slate-900"
                  }`}>
                    {(monthlyViewType === "projected" ? monthlyBudgetStats : monthlyStats).filter(m => m.net < 0).length}
                  </h3>
                  <p className="text-[11px] text-red-500 mt-0.5">Resultaat is negatief (-)</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold">Gem. Bedrijfskosten p/m</span>
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Coins className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-bold font-mono text-slate-900">
                    €{Math.round(
                      (monthlyViewType === "projected" ? monthlyBudgetStats : monthlyStats).length > 0 
                        ? (monthlyViewType === "projected" ? monthlyBudgetStats : monthlyStats).reduce((sum, m) => sum + m.expenses, 0) / (monthlyViewType === "projected" ? monthlyBudgetStats : monthlyStats).length 
                        : 0
                    ).toLocaleString("nl-NL")}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Gemiddelde overhead per maand</p>
                </div>
              </div>
            </div>

            {/* ALERT BOX FOR EXPECTED LOSSES */}
            {(monthlyViewType === "projected" ? monthlyBudgetStats : monthlyStats).some(m => m.net < 0) && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-amber-900 font-display">
                      {monthlyViewType === "projected" 
                        ? "Aandacht vereist: Seizoensgebonden tekorten geprojecteerd voor komend jaar"
                        : "Aandacht vereist: Er zijn maanden met historisch operationeel verlies"
                      }
                    </h4>
                    <p className="text-xs text-amber-700 mt-0.5 max-w-2xl leading-relaxed">
                      {monthlyViewType === "projected"
                        ? "Op basis van historische patronen en uw jaarbegroting zullen sommige maanden verliesgevend zijn vanwege lagere omzet of geconcentreerde kosten. Klik op een maand om de oorzaak te analyseren en te optimaliseren."
                        : "In de onderstaande maanden liggen de bedrijfskosten hoger dan de inkomsten. Klik op de betreffende maand om direct de onderliggende transacties te filteren en te zien waar de grote uitgaven of incidentele kosten zaten."
                      }
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(monthlyViewType === "projected" ? monthlyBudgetStats : monthlyStats).filter(m => m.net < 0).map((m, idx) => (
                        <span 
                          key={idx}
                          onClick={() => {
                            setSelectedMonthlyDetail(m.key);
                            setSelectedDetailCategory(null);
                          }}
                          className="cursor-pointer bg-amber-100/80 hover:bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-1 rounded-md border border-amber-300 flex items-center gap-1 transition"
                        >
                          {m.name} ({monthlyViewType === "projected" ? "Verwacht" : "Historisch"} verlies: €{Math.round(Math.abs(m.net)).toLocaleString("nl-NL")}) <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VISUAL MONTH-OVER-MONTH CHART */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 font-display text-base">
                    {monthlyViewType === "projected" 
                      ? "Geprojecteerd Inkomsten vs. Uitgaven Verloop (Komend Jaar)" 
                      : "Historisch Inkomsten vs. Uitgaven Verloop (Afgelopen Jaar)"
                    }
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {monthlyViewType === "projected"
                      ? "Seizoensgebonden omzetprognose vergeleken met de geplande maandelijkse kosten."
                      : "Vergelijk direct de historische omzet (groen) met de totale operationele kosten (rood) per maand."
                    }
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-emerald-500"></span>
                    <span className="text-slate-600 font-medium">Inkomsten</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-rose-500"></span>
                    <span className="text-slate-600 font-medium">Uitgaven</span>
                  </div>
                </div>
              </div>

              {(monthlyViewType === "projected" ? monthlyBudgetStats : monthlyStats).length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
                  Geen gegevens beschikbaar om grafiek te tekenen. Importeer eerst een bankbestand of laad demo-gegevens.
                </div>
              ) : (
                <div className="w-full overflow-x-auto pt-4 pb-2">
                  <div className="min-w-[600px] h-60 flex flex-col justify-between">
                    {/* SVG GRAPH CONTAINER */}
                    <div className="flex-1 relative">
                      <svg className="w-full h-full" viewBox="0 0 800 180" preserveAspectRatio="none">
                        {/* Grid lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                          const y = 10 + ratio * 140;
                          return (
                            <line 
                              key={i} 
                              x1="0" 
                              y1={y} 
                              x2="800" 
                              y2={y} 
                              stroke="#f1f5f9" 
                              strokeWidth="1.5"
                              strokeDasharray={i === 4 ? "0" : "4 4"}
                            />
                          );
                        })}

                        {/* Bars for each month */}
                        {(monthlyViewType === "projected" ? monthlyBudgetStats : monthlyStats).map((m, idx) => {
                          const count = (monthlyViewType === "projected" ? monthlyBudgetStats : monthlyStats).length;
                          const sectionWidth = 800 / count;
                          const groupX = idx * sectionWidth + (sectionWidth - 50) / 2; // Center the 50px wide group

                          const maxAmount = Math.max(...(monthlyViewType === "projected" ? monthlyBudgetStats : monthlyStats).map(mo => Math.max(mo.income, mo.expenses)), 1);
                          const scale = 140 / maxAmount;
                          
                          const incomeHeight = m.income * scale;
                          const expensesHeight = m.expenses * scale;

                          const incomeY = 150 - incomeHeight;
                          const expensesY = 150 - expensesHeight;

                          const isSelected = selectedMonthlyDetail === m.key;

                          return (
                            <g 
                              key={idx} 
                              className="group cursor-pointer"
                              onClick={() => {
                                setSelectedMonthlyDetail(m.key);
                                setSelectedDetailCategory(null);
                              }}
                            >
                              {/* Selection Indicator Background */}
                              {isSelected && (
                                <rect
                                  x={groupX - 5}
                                  y="5"
                                  width="60"
                                  height="150"
                                  fill="#10b981"
                                  fillOpacity="0.06"
                                  rx="8"
                                  stroke="#10b981"
                                  strokeWidth="1"
                                  strokeDasharray="2 2"
                                />
                              )}

                              {/* Income Bar */}
                              <rect
                                x={groupX}
                                y={incomeY}
                                width="20"
                                height={Math.max(incomeHeight, 2)}
                                rx="3"
                                fill={isSelected ? "#10b981" : "#34d399"}
                                className="transition-all duration-200 group-hover:fill-emerald-500"
                              >
                                <title>Inkomsten {m.name}: €{Math.round(m.income).toLocaleString("nl-NL")}</title>
                              </rect>

                              {/* Expenses Bar */}
                              <rect
                                x={groupX + 24}
                                y={expensesY}
                                width="20"
                                height={Math.max(expensesHeight, 2)}
                                rx="3"
                                fill={isSelected ? "#f43f5e" : "#fb7185"}
                                className="transition-all duration-200 group-hover:fill-rose-500"
                              >
                                <title>Uitgaven {m.name}: €{Math.round(m.expenses).toLocaleString("nl-NL")}</title>
                              </rect>
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    {/* X-Axis labels */}
                    <div className="flex border-t border-slate-100 pt-2 text-[10px] text-slate-400 font-medium font-mono select-none">
                      {(monthlyViewType === "projected" ? monthlyBudgetStats : monthlyStats).map((m, idx) => {
                        const count = (monthlyViewType === "projected" ? monthlyBudgetStats : monthlyStats).length;
                        return (
                          <div 
                            key={idx} 
                            style={{ width: `${100 / count}%` }} 
                            className={`text-center truncate px-1 cursor-pointer hover:text-emerald-700 transition ${
                              selectedMonthlyDetail === m.key ? "text-emerald-600 font-bold" : ""
                            }`}
                            onClick={() => {
                              setSelectedMonthlyDetail(m.key);
                              setSelectedDetailCategory(null);
                            }}
                            title={m.name}
                          >
                            {m.name.split(" ")[0]}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* INTERACTIVE COMPREHENSIVE DETAIL CARD */}
            {selectedMonthlyDetail && (() => {
              const selectedMonth = (monthlyViewType === "projected" ? monthlyBudgetStats : monthlyStats).find(m => m.key === selectedMonthlyDetail);
              if (!selectedMonth) return null;

              // Find corresponding historical details for comparison
              const histCorresponding = monthlyStats.find(h => h.key.endsWith(selectedMonthlyDetail.substring(4))); // match "-MM"
              const hasComparison = monthlyViewType === "projected" && histCorresponding;

              return (
                <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 shadow-xl animate-fadeIn space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          {monthlyViewType === "projected" ? "🔮 Geprojecteerd Budget" : "📊 Historische Realiteit"}
                        </span>
                        <span className="text-xs text-slate-400">Gedetailleerde analyse</span>
                      </div>
                      <h3 className="text-lg font-bold font-display text-white mt-1">
                        Begroting & Seizoensverloop: {selectedMonth.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedMonthlyDetail(null)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Summary row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-y border-slate-800 py-5">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Verwachte Omzet</p>
                      <p className="text-xl font-bold font-mono text-emerald-400">
                        €{Math.round(selectedMonth.income).toLocaleString("nl-NL")}
                      </p>
                      {hasComparison && (
                        <p className="text-[10px] text-slate-500">
                          Vorig jaar: €{Math.round(histCorresponding.income).toLocaleString("nl-NL")}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Gebudgetteerde Overhead</p>
                      <p className="text-xl font-bold font-mono text-rose-400">
                        €{Math.round(selectedMonth.expenses).toLocaleString("nl-NL")}
                      </p>
                      {hasComparison && (
                        <p className="text-[10px] text-slate-500">
                          Vorig jaar: €{Math.round(histCorresponding.expenses).toLocaleString("nl-NL")}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Operationeel Resultaat (W&V)</p>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xl font-bold font-mono ${selectedMonth.net >= 0 ? "text-emerald-400" : "text-rose-500"}`}>
                          {selectedMonth.net >= 0 ? "+" : "-"} €{Math.abs(Math.round(selectedMonth.net)).toLocaleString("nl-NL")}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          selectedMonth.net >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400 animate-pulse"
                        }`}>
                          {selectedMonth.net >= 0 ? "Winstgevend" : "Verlies"}
                        </span>
                      </div>
                      {hasComparison && (
                        <p className="text-[10px] text-slate-500">
                          Vorig jaar: {histCorresponding.net >= 0 ? "+" : "-"}€{Math.abs(Math.round(histCorresponding.net)).toLocaleString("nl-NL")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Grid Layout: Category list and Recommendations */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left side: Category distribution */}
                    <div className="lg:col-span-2 space-y-4">
                      <h4 className="font-semibold text-xs text-slate-300">Begrotingsverdeling per categorie</h4>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {selectedMonth.categoryBreakdown?.map((catData, idx) => {
                          if (catData.category === "Privé (Onttrekkingen/Stortingen)" && catData.projected === 0 && catData.histActual === 0) return null;
                          
                          const isExpanded = selectedDetailCategory === catData.category;
                          const catTxs = transactions.filter(t => {
                            if (t.category !== catData.category) return false;
                            if (t.date) {
                              const targetMonthNum = selectedMonthlyDetail.split("-")[1];
                              const parts = t.date.split("-");
                              return parts.length >= 2 && parts[1] === targetMonthNum;
                            }
                            return false;
                          });
                          const sortedCatTxs = [...catTxs].sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime());

                          const maxValue = Math.max(...selectedMonth.categoryBreakdown.map(c => Math.max(c.projected, c.histActual)), 1);
                          const currentWidth = (catData.projected / maxValue) * 100;
                          const comparisonWidth = (catData.histActual / maxValue) * 100;
                          const isIncome = catData.category === "Inkomsten (Omzet)";
                          const colorObj = CATEGORY_COLORS[catData.category] || CATEGORY_COLORS["Niet gecategoriseerd"];

                          return (
                            <div 
                              key={idx} 
                              onClick={() => setSelectedDetailCategory(isExpanded ? null : catData.category)}
                              className={`border rounded-xl p-3.5 space-y-2 cursor-pointer transition duration-150 select-none ${
                                isExpanded 
                                  ? "bg-slate-800/80 border-slate-700 shadow-md" 
                                  : "bg-slate-800/40 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700"
                              }`}
                            >
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colorObj.hex }}></span>
                                  <span className="font-bold text-slate-200">{catData.category}</span>
                                </div>
                                <div className="text-right flex items-center gap-2">
                                  <div>
                                    <span className="font-bold font-mono text-slate-100">
                                      €{catData.projected.toLocaleString("nl-NL")}
                                    </span>
                                    {monthlyViewType === "projected" && catData.histActual > 0 && (
                                      <span className="text-[10px] text-slate-500 block font-mono">
                                        Historisch: €{catData.histActual.toLocaleString("nl-NL")}
                                      </span>
                                    )}
                                  </div>
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                                  )}
                                </div>
                              </div>

                              {/* Progress bar visual container */}
                              <div className="space-y-1">
                                {/* Current Projected Budget bar */}
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      isIncome ? "bg-emerald-500" : "bg-indigo-500"
                                    }`}
                                    style={{ width: `${currentWidth}%` }}
                                  />
                                </div>

                                {/* Comparison/Historical actual bar */}
                                {monthlyViewType === "projected" && catData.histActual > 0 && (
                                  <div className="w-full bg-slate-800/40 h-1.5 rounded-full overflow-hidden relative">
                                    <div 
                                      className="h-full rounded-full bg-slate-600 transition-all duration-500"
                                      style={{ width: `${comparisonWidth}%` }}
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Saving insights or change percentages */}
                              {monthlyViewType === "projected" && catData.histActual > 0 && !isIncome && (
                                <div className="flex items-center justify-between text-[10px] text-slate-400">
                                  <span>Begrotingsvergelijking:</span>
                                  {catData.projected < catData.histActual ? (
                                    <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                                      <Check className="w-3 h-3" /> €{(catData.histActual - catData.projected).toLocaleString("nl-NL")} besparing t.o.v. vorig jaar
                                    </span>
                                  ) : catData.projected > catData.histActual ? (
                                    <span className="text-slate-500 font-semibold">
                                      +€{(catData.projected - catData.histActual).toLocaleString("nl-NL")} overhead verhoging
                                    </span>
                                  ) : (
                                    <span className="text-slate-500">Stabiel budget</span>
                                  )}
                                </div>
                              )}

                              {/* Nested transactions drawer */}
                              {isExpanded && (
                                <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-2 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                                    <span>
                                      {monthlyViewType === "projected" 
                                        ? "Historische boekingen van afgelopen jaar (basis voor prognose):" 
                                        : "Gevonden boekingen in deze maand:"
                                      }
                                    </span>
                                    <span className="bg-slate-700 px-1.5 py-0.5 rounded font-mono text-[9px]">
                                      {sortedCatTxs.length} stuks
                                    </span>
                                  </div>

                                  {sortedCatTxs.length === 0 ? (
                                    <p className="text-[10px] text-slate-500 italic py-1">
                                      Geen onderliggende boekingen gevonden voor deze maand.
                                    </p>
                                  ) : (
                                    <div className="space-y-1 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                      {sortedCatTxs.map((t, tIdx) => (
                                        <div 
                                          key={t.id || tIdx} 
                                          className="flex items-center justify-between text-[10px] bg-slate-900/45 p-2 rounded-lg border border-slate-800/60 hover:bg-slate-900/80 transition duration-100"
                                        >
                                          <div className="flex flex-col min-w-0 pr-2">
                                            <span className="text-slate-200 font-medium truncate max-w-[150px] sm:max-w-xs" title={t.description}>
                                              {t.cleanName || t.description}
                                            </span>
                                            <span className="text-[8px] text-slate-500 font-mono mt-0.5">
                                              {t.date ? new Date(t.date).toLocaleDateString("nl-NL", { day: 'numeric', month: 'short', year: 'numeric' }) : "Geen datum"}
                                            </span>
                                          </div>
                                          <span className={`font-mono font-bold shrink-0 text-[10px] ${
                                            t.type === "income" ? "text-emerald-400" : "text-slate-300"
                                          }`}>
                                            {t.type === "income" ? "+" : "-"}€{Math.abs(t.amount).toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right side: Strategic Advisory Column */}
                    <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                      <div className="space-y-3 text-xs">
                        <div className="flex items-center gap-2 text-slate-300 font-semibold border-b border-slate-700/50 pb-2">
                          <Info className="w-4 h-4 text-emerald-400" />
                          <span>Financiële Analyse & Begrotingsadvies</span>
                        </div>

                        {selectedMonth.isLoss ? (
                          <div className="bg-red-950/40 border border-red-900/50 p-3 rounded-xl space-y-1.5 text-red-300">
                            <p className="font-bold text-[11px] flex items-center gap-1 text-red-400">
                              ⚠️ Knelpunt: Operationeel Verlies Verwacht
                            </p>
                            <p className="text-[10px] leading-relaxed">
                              De geprojecteerde inkomsten voor deze maand dekken de geplande vaste lasten niet. Overweeg niet-essentiële softwarelicenties of marketingcampagnes te pauzeren, of verplaats geplande jaarlijkse aanschaffen naar een kwartaal met hogere omzet.
                            </p>
                          </div>
                        ) : (
                          <div className="bg-emerald-950/40 border border-emerald-900/50 p-3 rounded-xl space-y-1.5 text-emerald-300">
                            <p className="font-bold text-[11px] flex items-center gap-1 text-emerald-400">
                              ✅ Gezonde Cashflow Prognose
                            </p>
                            <p className="text-[10px] leading-relaxed">
                              In deze maand wordt een positief netto operationeel resultaat verwacht. Dit is een ideaal moment om een buffer op te bouwen voor de minder actieve seizoensmaanden, of om direct 21% BTW en circa 30% inkomstenbelasting apart te zetten op uw spaarrekening.
                            </p>
                          </div>
                        )}

                        <div className="space-y-1 text-slate-300">
                          <p className="font-semibold text-[10px] text-slate-400 uppercase tracking-wider">Hoge uitgavenposten deze maand:</p>
                          <ul className="list-disc pl-4 space-y-1 text-[10px] text-slate-400">
                            {selectedMonth.categoryBreakdown
                              ?.filter(c => c.category !== "Inkomsten (Omzet)" && c.projected > 0)
                              ?.sort((a, b) => b.projected - a.projected)
                              ?.slice(0, 2)
                              ?.map((item, idx) => (
                                <li key={idx}>
                                  <strong>{item.category}</strong>: €{item.projected.toLocaleString("nl-NL")}
                                </li>
                              ))}
                          </ul>
                        </div>
                      </div>

                      {/* Interaction Actions inside Detail */}
                      <div className="pt-4 border-t border-slate-700/50 space-y-2">
                        <button
                          onClick={() => {
                            // Find corresponding month code
                            const [year, month] = selectedMonth.key.split("-");
                            const mCode = `${monthlyViewType === "projected" ? (parseInt(year, 10) - 1) : year}-${month}`; // map 2027 projected back to 2026 historical
                            setMonthFilter(mCode);
                            setActiveTab("transactions");
                            setCurrentPage(1);
                            setSuccessMessage(`Gefilterd op transacties van: ${selectedMonth.name.replace(year, String(monthlyViewType === "projected" ? parseInt(year, 10) - 1 : year))}`);
                            setTimeout(() => setSuccessMessage(null), 4000);
                          }}
                          className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-[11px] font-bold text-white transition flex items-center justify-center gap-2 shrink-0 shadow-sm"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                          Bekijk onderliggende transacties
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab("budget");
                          }}
                          className="w-full py-2 bg-transparent hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl text-[10px] font-bold text-slate-300 hover:text-white transition"
                        >
                          Jaarbegroting aanpassen
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })()}

            {/* MONTHLY P&L DETAILED LIST */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 font-display text-sm">
                    {monthlyViewType === "projected" ? "Begroot overzicht per kalendermaand" : "Historisch overzicht per kalendermaand"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {monthlyViewType === "projected"
                      ? "Klik op de \"Details\" knop om de seizoensgebonden categorische begroting van die specifieke maand te analyseren."
                      : "Klik op de \"Details\" knop om de werkelijke inkomsten en uitgaven van die historische maand te inspecteren."
                    }
                  </p>
                </div>
                <span className="text-[11px] bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full text-slate-600 font-medium">
                  {(monthlyViewType === "projected" ? monthlyBudgetStats : monthlyStats).length} periodes
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold select-none">
                      <th className="p-4">Maand</th>
                      <th className="p-4">Inkomsten (Prognose/Omzet)</th>
                      <th className="p-4">Uitgaven (Overhead)</th>
                      <th className="p-4">Resultaat (W&V)</th>
                      <th className="p-4">Status & Bijzonderheden</th>
                      <th className="p-4 text-center w-36">Actie</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(monthlyViewType === "projected" ? monthlyBudgetStats : monthlyStats).map((m) => {
                      return (
                        <tr 
                          key={m.key} 
                          className={`hover:bg-slate-50/70 transition-all duration-150 cursor-pointer ${
                            m.isLoss ? "bg-rose-50/20" : ""
                          } ${selectedMonthlyDetail === m.key ? "bg-emerald-50/45 font-semibold" : ""}`}
                          onClick={() => {
                            setSelectedMonthlyDetail(m.key);
                            setSelectedDetailCategory(null);
                          }}
                        >
                          <td className="p-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span>{m.name}</span>
                            </div>
                          </td>
                          <td className="p-4 font-mono font-semibold text-emerald-700">
                            €{m.income.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="p-4 font-mono font-semibold text-slate-700">
                            €{m.expenses.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className={`p-4 font-mono font-bold ${m.net >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                            {m.net >= 0 ? "+" : "-"} €{Math.abs(m.net).toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="p-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {m.isLoss ? (
                                <span className="bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-red-200 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-red-600" /> Verliesgevend
                                </span>
                              ) : (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-emerald-200 flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-600" /> Winstgevend
                                </span>
                              )}
                              {m.isHighestExpense && (
                                <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded-full font-bold border border-rose-200 flex items-center gap-1 animate-pulse">
                                  ⚠️ Hoogste uitgaven
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-mono">
                                {monthlyViewType === "projected" ? "(Begroot)" : `(${m.transactionsCount} transacties)`}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setSelectedMonthlyDetail(m.key);
                                setSelectedDetailCategory(null);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition duration-150 inline-flex items-center gap-1 ${
                                selectedMonthlyDetail === m.key 
                                  ? "bg-slate-800 text-white border border-slate-800" 
                                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 hover:border-emerald-600"
                              }`}
                            >
                              Analyseer <ArrowRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: TRANSACTIONS LIST & OVERVIEWS */}
        {/* ========================================================================= */}
        {activeTab === "transactions" && (
          <div className="space-y-6">
            
            {/* STATS OVERVIEW CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold">Totaal Inkomsten</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Coins className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-bold font-mono text-slate-900">
                    €{stats.totalIncome.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Uit geüploade overzichten</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold">Totaal Uitgaven</span>
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 rotate-180" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-bold font-mono text-slate-900">
                    €{stats.totalExpenses.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Geregistreerde bedrijfskosten</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold">Netto Resultaat</span>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    stats.netProfit >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                  }`}>
                    <Building className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className={`text-2xl font-bold font-mono ${stats.netProfit >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                    €{stats.netProfit.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Vrij besteedbaar saldo</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold">Gecategoriseerd</span>
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-bold font-mono text-slate-900">
                    {Math.round((transactions.filter(t => t.category !== "Niet gecategoriseerd").length / (transactions.length || 1)) * 100)}%
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {transactions.filter(t => t.category !== "Niet gecategoriseerd").length} van de {transactions.length} transacties
                  </p>
                </div>
              </div>

            </div>

            {/* LOCAL RULE-BASED CATEGORIZE CTA BANNER */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">100% LOKAAL & PRIVÉ</span>
                  <span className="text-xs text-slate-400">Automatische Regelmotor</span>
                </div>
                <h3 className="text-base md:text-lg font-bold font-display text-white">Categoriseer al je transacties automatisch</h3>
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                  Onze ingebouwde regelmotor herkent direct leveranciers, categoriseert vaste bedrijfskosten en identificeert terugkerende abonnementen. 100% lokaal: al je data blijft veilig en vertrouwelijk in je eigen browser.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  onClick={() => setShowRulesModal(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs px-4 py-3 rounded-xl transition duration-200 flex items-center justify-center gap-1.5 shadow-sm"
                  title="Bekijk of voeg trefwoordregels toe"
                >
                  <Settings className="w-4 h-4 text-emerald-400" />
                  Regels Beheren ({customRules.length})
                </button>

                <button
                  disabled={isAnalyzing || transactions.length === 0}
                  onClick={runAutoCategorization}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-semibold text-xs px-5 py-3 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-sm"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Regels toepassen...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300" />
                      Categoriseer Alle Transacties
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* MAIN DATA GRID: VISUAL CHART & TABLE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Visual Chart Breakdown */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* SVG DONUT CHART CARD */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
                  <h3 className="font-bold text-slate-900 font-display text-sm">Kostenverdeling afgelopen jaar</h3>
                  
                  {donutChartSegments.length === 0 ? (
                    <div className="h-60 flex flex-col items-center justify-center text-slate-400 text-xs">
                      <PieChart className="w-12 h-12 stroke-[1.25] text-slate-300 mb-2" />
                      Geen uitgaven om te categoriseren
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative w-48 h-48">
                        <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                          {donutChartSegments.map((seg, idx) => (
                            <path
                              key={idx}
                              d={seg.path}
                              fill={seg.color}
                              className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                              onMouseEnter={() => setHoveredCategory(seg.name)}
                              onMouseLeave={() => setHoveredCategory(null)}
                            />
                          ))}
                          <circle cx="100" cy="100" r="50" fill="white" />
                        </svg>
                        
                        {/* Center label */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                            {hoveredCategory || "Totaal Kosten"}
                          </span>
                          <span className="text-base font-bold font-mono text-slate-800 mt-0.5">
                            €{Math.round(
                              hoveredCategory 
                                ? (stats.byCategory[hoveredCategory] || 0)
                                : stats.totalExpenses
                            ).toLocaleString("nl-NL")}
                          </span>
                        </div>
                      </div>

                      {/* Legend List */}
                      <div className="w-full space-y-2 mt-5">
                        {donutChartSegments.slice(0, 5).map((seg, idx) => (
                          <div 
                            key={idx} 
                            className={`flex items-center justify-between text-xs p-1.5 rounded-lg transition ${
                              hoveredCategory === seg.name ? "bg-slate-50" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }}></span>
                              <span className="text-slate-600 font-medium truncate">{seg.name}</span>
                            </div>
                            <span className="font-mono text-slate-800 font-semibold shrink-0">
                              {seg.percentage.toFixed(1)}%
                            </span>
                          </div>
                        ))}
                        {donutChartSegments.length > 5 && (
                          <p className="text-[10px] text-slate-400 text-center pt-1 italic">
                            + {donutChartSegments.length - 5} overige categorieën
                          </p>
                        )}
                      </div>

                    </div>
                  )}
                </div>

                {/* MANUAL TRANSACTION FORM */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 font-display text-sm">Transactie toevoegen</h3>
                    <button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 hover:underline"
                    >
                      {showAddForm ? "Sluiten" : "Open formulier"}
                    </button>
                  </div>

                  {showAddForm && (
                    <form onSubmit={handleAddManualTransaction} className="space-y-3 pt-2 text-xs animate-fadeIn">
                      <div className="space-y-1">
                        <label className="font-medium text-slate-600">Omschrijving / Leverancier *</label>
                        <input
                          type="text"
                          required
                          value={newTx.description}
                          onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                          placeholder="Bijv. Albert Heijn - Kantoorbenodigdheden"
                          className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-medium text-slate-600">Bedrag (€) *</label>
                          <input
                            type="text"
                            required
                            value={newTx.amount}
                            onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                            placeholder="Bijv. 15,50"
                            className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50 font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-medium text-slate-600">Datum *</label>
                          <input
                            type="date"
                            required
                            value={newTx.date}
                            onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                            className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-medium text-slate-600">Type</label>
                          <select
                            value={newTx.type}
                            onChange={(e) => setNewTx({ ...newTx, type: e.target.value as "income" | "expense" })}
                            className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50"
                          >
                            <option value="expense">Uitgave (-)</option>
                            <option value="income">Inkomst (+)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="font-medium text-slate-600">Categorie</label>
                          <select
                            value={newTx.category}
                            onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                            className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50"
                          >
                            <option value="Niet gecategoriseerd">Niet gecategoriseerd</option>
                            {STANDARD_CATEGORIES.map((c, idx) => (
                              <option key={idx} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full mt-2 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition"
                      >
                        Voeg transactie toe
                      </button>
                    </form>
                  )}
                </div>

              </div>

              {/* Right Column: Interactive Transactions Table */}
              <div className="lg:col-span-2 space-y-4">
                
                {/* Search, Filter Tools */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3">
                  
                  {/* Search input */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      placeholder="Zoek omschrijving, leverancier, bedrag..."
                      className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={monthFilter}
                      onChange={(e) => { setMonthFilter(e.target.value); setCurrentPage(1); }}
                      className={`text-xs p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                        monthFilter !== "all" 
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <option value="all">Alle maanden</option>
                      {availableMonths.map((m, idx) => (
                        <option key={idx} value={m}>{formatMonthKey(m)}</option>
                      ))}
                    </select>

                    <select
                      value={categoryFilter}
                      onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                      className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="all">Alle categorieën</option>
                      <option value="Niet gecategoriseerd">Niet gecategoriseerd</option>
                      {STANDARD_CATEGORIES.map((c, idx) => (
                        <option key={idx} value={c}>{c}</option>
                      ))}
                    </select>

                    <select
                      value={typeFilter}
                      onChange={(e) => { setTypeFilter(e.target.value as any); setCurrentPage(1); }}
                      className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="all">In & Uit</option>
                      <option value="income">Enkel Inkomsten</option>
                      <option value="expense">Enkel Uitgaven</option>
                    </select>
                  </div>

                </div>

                {monthFilter !== "all" && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-800 flex items-center justify-between shadow-xs animate-fadeIn">
                    <div className="flex items-center gap-2 font-medium">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span>Resultaten gefilterd op maand: <strong>{formatMonthKey(monthFilter)}</strong></span>
                    </div>
                    <button
                      onClick={() => setMonthFilter("all")}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1"
                    >
                      Wis maandfilter
                    </button>
                  </div>
                )}

                {/* Main list */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold select-none">
                          <th className="p-4 w-24">Datum</th>
                          <th className="p-4">Omschrijving / Leverancier</th>
                          <th className="p-4 w-32">Bedrag</th>
                          <th className="p-4 w-44">Categorie</th>
                          <th className="p-4 w-12 text-center">Actie</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedTransactions.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400">
                              Geen transacties gevonden die voldoen aan de zoekcriteria of filters.
                            </td>
                          </tr>
                        ) : (
                          paginatedTransactions.map((t) => {
                            const badge = CATEGORY_COLORS[t.category] || CATEGORY_COLORS["Niet gecategoriseerd"];
                            return (
                              <tr key={t.id} className="hover:bg-slate-50/75 transition-all duration-150">
                                <td className="p-4 font-mono font-medium text-slate-500 whitespace-nowrap">
                                  {t.date}
                                </td>
                                <td className="p-4 min-w-[200px]">
                                  <div className="font-semibold text-slate-900 max-w-[260px] truncate" title={t.description}>
                                    {t.cleanName || t.description}
                                  </div>
                                  {t.cleanName && (
                                    <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[240px]">
                                      Oorspronkelijk: {t.description}
                                    </div>
                                  )}
                                  {t.isRecurring && (
                                    <span className="inline-flex items-center gap-1 mt-1 text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-semibold font-mono uppercase">
                                      Vaste Last • {t.frequency}
                                    </span>
                                  )}
                                </td>
                                <td className={`p-4 font-mono font-bold whitespace-nowrap ${
                                  t.type === "income" ? "text-emerald-700" : "text-slate-900"
                                }`}>
                                  {t.type === "income" ? "+" : "-"} €{t.amount.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="p-4">
                                  <select
                                    value={t.category}
                                    onChange={(e) => handleUpdateCategory(t.id, e.target.value)}
                                    className={`text-[11px] font-semibold border rounded-md p-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${badge.bg} ${badge.text} ${badge.border}`}
                                  >
                                    <option value="Niet gecategoriseerd">Selecteer...</option>
                                    {STANDARD_CATEGORIES.map((cat, catIdx) => (
                                      <option key={catIdx} value={cat}>{cat}</option>
                                    ))}
                                  </select>
                                </td>
                                <td className="p-4 text-center">
                                  <button
                                    onClick={() => handleDeleteTransaction(t.id)}
                                    className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
                                    title="Transactie verwijderen"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Pagination */}
                  {totalPages > 1 && (
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs select-none">
                      <span className="text-slate-500">
                        Pagina <span className="font-semibold text-slate-800">{currentPage}</span> van <span className="font-semibold text-slate-800">{totalPages}</span> ({filteredTransactions.length} resultaten)
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg disabled:opacity-50 font-medium hover:bg-slate-50 transition"
                        >
                          Vorige
                        </button>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg disabled:opacity-50 font-medium hover:bg-slate-50 transition"
                        >
                          Volgende
                        </button>
                      </div>
                    </div>
                  )}

                </div>

                {/* BUDGET GENERATE TRIGGER CTA */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 font-display text-sm">Transacties ingedeeld?</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Bereken direct de jaarbegroting voor het komende jaar op basis van deze categorisaties en sector-parameters.</p>
                  </div>
                  <button
                    onClick={runForecastBudgetGeneration}
                    disabled={isGeneratingBudget}
                    className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-3 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    {isGeneratingBudget ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Begroting berekenen...
                      </>
                    ) : (
                      <>
                        <span>Stap 3: Bereken Begroting</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: NEXT YEAR BUDGET PLANNER */}
        {/* ========================================================================= */}
        {activeTab === "budget" && (
          <div className="space-y-6">
            
            {/* Header introduction of Budget Planning */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                    Jaarbegroting {budgetPlanning?.year || new Date().getFullYear() + 1}
                  </span>
                  <h2 className="text-xl font-bold font-display text-slate-900 mt-1">Slimme Begrotingsplanning & Besparingstips</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Gecalculeerd op basis van je historische transacties. Versleep de schuiven of vul bedragen in om aan te passen.</p>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    onClick={exportBudgetAsCSV}
                    className="p-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                    title="Exporteer als Excel CSV"
                  >
                    <Download className="w-4 h-4 text-slate-400" />
                    CSV downloaden
                  </button>
                  <button
                    onClick={exportBudgetAsJSON}
                    className="p-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                    title="Sla JSON op voor later hergebruik"
                  >
                    <FileText className="w-4 h-4 text-slate-400" />
                    Project opslaan
                  </button>
                </div>
              </div>

              {!budgetPlanning ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <Sliders className="w-12 h-12 stroke-[1.25] text-slate-300 mx-auto mb-3" />
                  Nog geen jaarbegroting opgesteld. Ga naar de tab "Transacties" en klik op "Bereken Begroting" om te starten.
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* FORECAST PARAMETERS BAR */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-800">Begrotingsparameters:</span>
                      </div>

                      <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
                        <span className="text-xs text-slate-600">Kostenindexatie / Inflatie:</span>
                        <input
                          type="number"
                          value={inflationPct}
                          onChange={(e) => setInflationPct(parseFloat(e.target.value) || 0)}
                          className="w-14 text-xs font-mono font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-center"
                          step="0.5"
                          min="-20"
                          max="50"
                        />
                        <span className="text-xs font-mono text-slate-500">%</span>
                      </div>

                      <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
                        <span className="text-xs text-slate-600">Omzetgroeidoel:</span>
                        <input
                          type="number"
                          value={revenueGrowthPct}
                          onChange={(e) => setRevenueGrowthPct(parseFloat(e.target.value) || 0)}
                          className="w-14 text-xs font-mono font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-center"
                          step="0.5"
                          min="-50"
                          max="100"
                        />
                        <span className="text-xs font-mono text-slate-500">%</span>
                      </div>
                    </div>

                    <button
                      onClick={runForecastBudgetGeneration}
                      disabled={isGeneratingBudget}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition duration-150 flex items-center justify-center gap-1.5 shrink-0 shadow-2xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingBudget ? "animate-spin" : ""}`} />
                      Herberekenen
                    </button>
                  </div>

                  {/* METRICS OF BUDGETS PROPOSAL */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Begrote Jaaromzet</p>
                      <p className="text-xl font-bold text-slate-900 font-mono mt-1">
                        €{(budgetPlanning.categories.find(c => c.category === "Inkomsten (Omzet)")?.allocated || 0).toLocaleString("nl-NL")}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Werkelijk afgelopen jaar: €{(budgetPlanning.categories.find(c => c.category === "Inkomsten (Omzet)")?.spent || 0).toLocaleString("nl-NL")}
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Begrote Jaarkosten</p>
                      <p className="text-xl font-bold text-rose-700 font-mono mt-1">
                        €{budgetPlanning.categories
                          .filter(c => c.category !== "Inkomsten (Omzet)")
                          .reduce((sum, c) => sum + c.allocated, 0)
                          .toLocaleString("nl-NL")}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Werkelijk afgelopen jaar: €{budgetPlanning.categories
                          .filter(c => c.category !== "Inkomsten (Omzet)")
                          .reduce((sum, c) => sum + c.spent, 0)
                          .toLocaleString("nl-NL")}
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Verwacht Bedrijfsresultaat</p>
                      {(() => {
                        const recIncome = budgetPlanning.categories.find(c => c.category === "Inkomsten (Omzet)")?.allocated || 0;
                        const recExpenses = budgetPlanning.categories
                          .filter(c => c.category !== "Inkomsten (Omzet)")
                          .reduce((sum, c) => sum + c.allocated, 0);
                        const result = recIncome - recExpenses;

                        return (
                          <>
                            <p className={`text-xl font-bold font-mono mt-1 ${result >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                              €{result.toLocaleString("nl-NL")}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Geprognoosterd netto saldo</p>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* COMPARATIVE INTERACTIVE SLIDER/INPUT LIST */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 text-xs tracking-wider uppercase">Budget Toewijzing per Categorie</h3>
                    
                    <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                      
                      {budgetPlanning.categories.map((item, idx) => {
                        const isIncome = item.category === "Inkomsten (Omzet)";
                        const themeColor = CATEGORY_COLORS[item.category] || CATEGORY_COLORS["Niet gecategoriseerd"];

                        // Percentage change helper
                        const pctChange = item.spent > 0 
                          ? ((item.allocated - item.spent) / item.spent) * 100 
                          : 0;

                        return (
                          <div key={idx} className="p-4 sm:p-5 bg-white hover:bg-slate-50/50 transition duration-150 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              
                              {/* Left Info */}
                              <div className="flex items-start gap-2.5">
                                <span className={`w-3 h-3 rounded-full mt-1.5 shrink-0`} style={{ backgroundColor: themeColor.hex }}></span>
                                <div>
                                  <h4 className="font-bold text-slate-800 text-sm">{item.category}</h4>
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    Historisch uitgegeven: <span className="font-mono text-slate-600 font-semibold">€{item.spent.toLocaleString("nl-NL")}</span>
                                  </p>
                                </div>
                              </div>

                              {/* Right Interactive inputs */}
                              <div className="flex items-center gap-3 self-end sm:self-center">
                                
                                {/* Pct shift pill */}
                                {item.spent > 0 && (
                                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                    isIncome
                                      ? (pctChange >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")
                                      : (pctChange <= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")
                                  }`}>
                                    {pctChange >= 0 ? "+" : ""}{pctChange.toFixed(0)}%
                                  </span>
                                )}

                                <div className="relative">
                                  <span className="absolute left-2.5 top-2 text-xs font-mono font-semibold text-slate-400">€</span>
                                  <input
                                    type="number"
                                    value={item.allocated}
                                    onChange={(e) => updateBudgetAllocation(item.category, Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-28 text-right p-1.5 pl-6 font-mono font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50 text-xs text-slate-800"
                                  />
                                </div>

                              </div>

                            </div>

                            {/* Slider visualizer */}
                            <div className="flex items-center gap-3">
                              <input
                                type="range"
                                min={0}
                                max={Math.max(item.spent * 2, 5000)}
                                value={item.allocated}
                                onChange={(e) => updateBudgetAllocation(item.category, parseInt(e.target.value))}
                                className="flex-1 accent-emerald-600 h-1 rounded-lg cursor-pointer bg-slate-100"
                              />
                            </div>

                            {/* Collapsible reasoning / savings advice */}
                            {(item.justification || item.savingTips) && (
                              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs space-y-2 mt-2">
                                {item.justification && (
                                  <p className="text-slate-600 leading-relaxed">
                                    <span className="font-semibold text-slate-800">Toelichting:</span> {item.justification}
                                  </p>
                                )}
                                {item.savingTips && (
                                  <div className="text-emerald-800 flex items-start gap-1.5 pt-1 border-t border-slate-200/50 mt-1">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                    <p className="leading-relaxed">
                                      <span className="font-semibold text-emerald-950">Slimme besparingstip:</span> {item.savingTips}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                          </div>
                        );
                      })}

                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* STRATEGIC ADVICE SECTION */}
            {budgetPlanning && budgetPlanning.strategicAdvice && budgetPlanning.strategicAdvice.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 font-display text-sm pb-3 border-b border-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Algemeen Financieel Advies voor {budgetPlanning.year}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  {budgetPlanning.strategicAdvice.map((advice, idx) => (
                    <div key={idx} className="bg-emerald-50/50 border border-emerald-100/60 rounded-xl p-4.5 space-y-2 text-xs flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          {advice.split(":")[1] || advice}
                        </p>
                      </div>
                      <span className="font-semibold text-emerald-800 pt-2 block font-display text-[10px] tracking-wide uppercase">
                        {advice.split(":")[0] || "Strategie"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: GEMOEDSRUST & BUFFER CALCULATOR */}
        {/* ========================================================================= */}
        {activeTab === "gemoedsrust" && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* SERENE CALM WELCOME BANNER */}
            <div className="bg-gradient-to-r from-rose-50 via-amber-50/40 to-emerald-50/40 border border-rose-100 rounded-3xl p-6 md:p-8 shadow-xs relative overflow-hidden">
              <div className="absolute -top-12 -right-12 text-rose-200/20 pointer-events-none">
                <Heart className="w-48 h-48 fill-rose-100" />
              </div>
              <div className="relative z-10 max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 border border-rose-200 rounded-full text-[11px] text-rose-700 font-semibold shadow-2xs">
                  <Smile className="w-3.5 h-3.5 text-rose-500" /> GEMOEDSRUST VOOR ONDERNEMERS
                </div>
                <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight text-slate-900">
                  Breng rust en stabiliteit in je financiën
                </h2>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                  Als ondernemer zijn je inkomsten zelden stabiel en vallen grote kosten vaak onverwacht op de mat. Dat veroorzaakt stress. Dit dashboard helpt je rust te creëren door je financiële reserves te vertalen naar concreet overlevingsvermogen ("Ademruimte") en piek-uitgaven vloeiend over het jaar te dempen.
                </p>
                <p className="text-[11px] italic text-rose-600/90 font-medium flex items-center gap-1.5 pt-1">
                  <Coffee className="w-3.5 h-3.5 text-rose-500 shrink-0" /> "Adem in, adem uit. Cijfers zijn er om jouw ondernemersdroom te ondersteunen, niet om je te beheersen."
                </p>
              </div>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* LEFT & CENTER COLUMN - RUNWAY & EXPENSE SMOOTHING */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1. ADEMRUIMTE RUNWAY WIDGET */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="font-bold text-slate-900 font-display text-sm flex items-center gap-2">
                        <PiggyBank className="w-5 h-5 text-rose-500" />
                        Financiële Ademruimte (Runway)
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Hoe lang kun je het zakelijk volhouden zonder inkomsten?
                      </p>
                    </div>
                    <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-1 rounded-full font-semibold self-start sm:self-center">
                      Live Berekening
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* Visual Runway Meter */}
                    <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-100 rounded-2xl text-center relative overflow-hidden">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jouw Ademruimte</span>
                      <h4 className="text-4xl md:text-5xl font-extrabold font-mono text-slate-900 my-2">
                        {runwayMonths.toFixed(1)}
                      </h4>
                      <span className="text-xs font-semibold text-slate-500">maanden</span>

                      <span className={`mt-4 px-3 py-1 rounded-full text-[10px] font-bold border ${runwayFeedback.colorClass}`}>
                        {runwayFeedback.badge}
                      </span>
                    </div>

                    {/* Controls & Metrics */}
                    <div className="md:col-span-7 space-y-5">
                      
                      {/* Input for Savings Buffer */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <label htmlFor="buffer-input" className="font-bold text-slate-700">Huidige Zakelijke Spaarbuffer:</label>
                          <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-xs">
                            €{Math.round(savingsBuffer).toLocaleString("nl-NL")}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">€</span>
                            <input
                              type="number"
                              id="buffer-input"
                              value={savingsBuffer || ""}
                              onChange={(e) => setSavingsBuffer(Math.max(0, parseFloat(e.target.value) || 0))}
                              className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition"
                              placeholder="Vul je spaarsaldo in"
                            />
                          </div>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100000}
                          step={500}
                          value={savingsBuffer}
                          onChange={(e) => setSavingsBuffer(parseFloat(e.target.value))}
                          className="w-full accent-rose-500 h-1.5 rounded-lg cursor-pointer bg-slate-100"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>€0</span>
                          <span>€25.000</span>
                          <span>€50.000</span>
                          <span>€100.000+</span>
                        </div>
                      </div>

                      {/* Info lines */}
                      <div className="space-y-2.5 text-xs pt-2 border-t border-slate-100">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Gemiddelde vaste bedrijfslasten:</span>
                          <span className="font-mono font-bold text-slate-700">
                            €{Math.round(avgMonthlyExpenses).toLocaleString("nl-NL")} / mnd
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          {transactions.length > 0 
                            ? "✓ Automatisch berekend op basis van je geïmporteerde bankgegevens over de afgelopen " + (availableMonths.length || 1) + " actieve maanden."
                            : "⚠️ Standaard schatting van €2.500/mnd gebruikt omdat er nog geen bankbestand is geüpload."}
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Feedback Box */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>
                      {runwayFeedback.message}
                    </span>
                  </div>

                </div>

                {/* 2. THE LUMP-SUM DEPRESSION CALCULATOR (Kosten Demper) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="font-bold text-slate-900 font-display text-sm flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-rose-500" />
                        De Grote Kosten-Demper
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Spreid zware periodieke kosten uit over een gelijkmatig maandelijks spaarbedrag.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddIrregularForm(!showAddIrregularForm)}
                      className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded-lg font-bold transition duration-150 flex items-center gap-1 self-start sm:self-center"
                    >
                      <Plus className="w-3.5 h-3.5" /> Kostenpost toevoegen
                    </button>
                  </div>

                  {/* Form to add irregular expense */}
                  {showAddIrregularForm && (
                    <form onSubmit={handleAddIrregularExpense} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 animate-fadeIn text-xs">
                      <h4 className="font-bold text-slate-800">Grote periodieke uitgave toevoegen</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="font-medium text-slate-600">Omschrijving van de kosten</label>
                          <input
                            type="text"
                            required
                            value={newIrregular.name}
                            onChange={(e) => setNewIrregular({ ...newIrregular, name: e.target.value })}
                            placeholder="Bijv. Auto Verzekering of Inkomstenbelasting"
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-rose-500 bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-medium text-slate-600">Totaal Bedrag (€)</label>
                          <input
                            type="text"
                            required
                            value={newIrregular.amount}
                            onChange={(e) => setNewIrregular({ ...newIrregular, amount: e.target.value })}
                            placeholder="Bijv. 1200"
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-rose-500 bg-white font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-medium text-slate-600">Interval</label>
                          <select
                            value={newIrregular.interval}
                            onChange={(e) => setNewIrregular({ ...newIrregular, interval: e.target.value as "quarterly" | "yearly" })}
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-rose-500 bg-white"
                          >
                            <option value="yearly">Jaarlijks (1x per jaar)</option>
                            <option value="quarterly">Kwartaal (om de 3 mnd)</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddIrregularForm(false)}
                          className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                        >
                          Annuleren
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold transition shadow-xs"
                        >
                          Voeg toe
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Irregular Expenses Table */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                            <th className="p-3">Grote Uitgave (Niet-maandelijks)</th>
                            <th className="p-3 text-right">Bedrag</th>
                            <th className="p-3 text-center">Interval</th>
                            <th className="p-3 text-right text-rose-700 bg-rose-50/40">Maandelijkse Spaarbehoefte</th>
                            <th className="p-3 text-center">Actie</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {irregularExpenses.map((exp) => {
                            const monthlyReservation = exp.interval === "quarterly" ? exp.amount / 3 : exp.amount / 12;
                            return (
                              <tr key={exp.id} className="hover:bg-slate-50/50 transition">
                                <td className="p-3 font-semibold text-slate-800">{exp.name}</td>
                                <td className="p-3 text-right font-mono text-slate-700">€{Math.round(exp.amount).toLocaleString("nl-NL")}</td>
                                <td className="p-3 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    exp.interval === "quarterly" ? "bg-cyan-50 text-cyan-800 border border-cyan-100" : "bg-purple-50 text-purple-800 border border-purple-100"
                                  }`}>
                                    {exp.interval === "quarterly" ? "Kwartaal" : "Jaarlijks"}
                                  </span>
                                </td>
                                <td className="p-3 text-right font-mono font-bold text-rose-700 bg-rose-50/10">
                                  €{Math.round(monthlyReservation).toLocaleString("nl-NL")} / mnd
                                </td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => handleDeleteIrregularExpense(exp.id)}
                                    className="text-slate-400 hover:text-red-600 p-1 rounded-md transition"
                                    title="Verwijder regel"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Summary Ribbon */}
                  <div className="bg-gradient-to-r from-rose-900 to-slate-800 text-rose-100 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="space-y-1 text-center sm:text-left">
                      <h4 className="font-bold text-sm text-white">Totaal maandelijks apart te zetten buffer</h4>
                      <p className="text-xs text-rose-200/80">
                        Als je dit totale bedrag elke maand reserveert op een aparte rekening, ben je gegarandeerd ontspannen als de rekeningen vallen!
                      </p>
                    </div>
                    <div className="text-center sm:text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold tracking-wider block text-rose-300">Maandelijkse Spaarpot</span>
                      <span className="text-2xl md:text-3xl font-mono font-extrabold text-white">
                        €{Math.round(totalMonthlyIrregularReservation).toLocaleString("nl-NL")} <span className="text-sm font-sans font-medium">/ mnd</span>
                      </span>
                    </div>
                  </div>

                </div>

              </div>

              {/* RIGHT COLUMN - QUICK ADD WIDGET & STEADY INCOME RULES */}
              <div className="space-y-6">
                
                {/* 3. QUICK STATEMENT ADDER FOR EASY OPERATION (Makkelijk afschrift erbij) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="pb-3 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 font-display text-sm flex items-center gap-2">
                      <Upload className="w-4.5 h-4.5 text-rose-500 animate-bounce" />
                      Afschrift of boeking toevoegen
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Snel je administratie bijwerken vanaf je telefoon of laptop.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    
                    {/* CSV Upload box mini */}
                    <div 
                      onClick={() => document.getElementById("file-input")?.click()}
                      className="border border-dashed border-slate-200 hover:border-rose-400 bg-slate-50/50 hover:bg-rose-50/10 p-4.5 rounded-xl text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5"
                    >
                      <Upload className="w-5 h-5 text-rose-500" />
                      <span className="font-bold text-slate-700">Kies bankbestand (CSV)</span>
                      <span className="text-[10px] text-slate-400">Rabobank, ING, ABN AMRO etc.</span>
                    </div>

                    {/* Quick navigation links for fast access */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setActiveTab("import");
                          setShowPasteArea(true);
                        }}
                        className="p-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl font-semibold text-slate-700 transition flex flex-col items-center justify-center text-center gap-1"
                      >
                        <FileText className="w-4 h-4 text-rose-500" />
                        <span>Kopie plakken</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setActiveTab("transactions");
                          setShowAddForm(true);
                        }}
                        className="p-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl font-semibold text-slate-700 transition flex flex-col items-center justify-center text-center gap-1"
                      >
                        <Plus className="w-4 h-4 text-rose-500" />
                        <span>Handmatig boeken</span>
                      </button>
                    </div>

                    {files.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 space-y-1 text-[10px] text-slate-400">
                        <p className="font-semibold text-slate-500">Laatste upload:</p>
                        <p className="truncate">📄 {files[files.length - 1].name} ({files[files.length - 1].transactionCount} regels)</p>
                      </div>
                    )}

                  </div>
                </div>

                {/* 4. FOUR PEACEMAKING ADVICE RULES FOR INCOME FLUCTUATION */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 font-display text-sm pb-3 border-b border-slate-100 flex items-center gap-2">
                    <Heart className="w-4.5 h-4.5 text-rose-500" />
                    Rustgevende Vuistregels
                  </h3>

                  <div className="space-y-4 pt-1">
                    
                    {/* Rule 1 */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                        <h4 className="font-bold text-xs text-slate-800">Keer jezelf een 'Vast Salaris' uit</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 pl-7 leading-relaxed">
                        Betaal jezelf elke maand exact hetzelfde basissalaris uit, ongeacht of het een topmaand of mindere maand was. Dit stabiliseert je privéleven en geeft veel rust.
                      </p>
                    </div>

                    {/* Rule 2 */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                        <h4 className="font-bold text-xs text-slate-800">De Onzichtbare 30%-Belastingregel</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 pl-7 leading-relaxed">
                        Sluis bij elke betaalde factuur direct 30% door naar een aparte btw/belasting spaarrekening. Dit geld is niet van jou. Zo schrik je nooit van belastingaanslagen.
                      </p>
                    </div>

                    {/* Rule 3 */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                        <h4 className="font-bold text-xs text-slate-800">Vette maanden vullen magere</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 pl-7 leading-relaxed">
                        Als je een topomzet boekt, verhoog dan niet direct je levensstandaard of uitgaven. Laat de winst op je bufferrekening staan om de onvermijdelijke rustigere periodes soepel te overbruggen.
                      </p>
                    </div>

                    {/* Rule 4 */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold flex items-center justify-center shrink-0">4</span>
                        <h4 className="font-bold text-xs text-slate-800">Automatische Virtuele Enveloppen</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 pl-7 leading-relaxed">
                        Maak binnen de app van je bank gratis extra spaarpotten aan voor grote periodieke kosten (bijv. 'Reservering Auto', 'Jaarlijks Software'). Sluis de berekende maandbedragen automatisch door.
                      </p>
                    </div>

                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* RULES MANAGEMENT MODAL */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
              <div>
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-bold font-display text-slate-900">Categorisatieregels Beheren</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Stel slimme trefwoorden in om specifieke bankomschrijvingen automatisch toe te wijzen en op te schonen.
                </p>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Form to add a new rule */}
              <form onSubmit={handleAddCustomRule} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Nieuwe Regel Toevoegen</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Trefwoord in bankomschrijving *</label>
                    <input
                      type="text"
                      placeholder="bijv. Shell, NS Groep, Klant Jansen"
                      value={newRule.keyword}
                      onChange={(e) => setNewRule({ ...newRule, keyword: e.target.value })}
                      required
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Toewijzen aan Categorie *</label>
                    <select
                      value={newRule.category}
                      onChange={(e) => setNewRule({ ...newRule, category: e.target.value })}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    >
                      {STANDARD_CATEGORIES.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Schone weergavenaam (optioneel)</label>
                    <input
                      type="text"
                      placeholder="bijv. Shell Brandstof Zakelijk"
                      value={newRule.cleanName}
                      onChange={(e) => setNewRule({ ...newRule, cleanName: e.target.value })}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Geldt voor</label>
                    <select
                      value={newRule.targetType}
                      onChange={(e) => setNewRule({ ...newRule, targetType: e.target.value as any })}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="all">Alle transacties</option>
                      <option value="expense">Alleen uitgaven (-)</option>
                      <option value="income">Alleen inkomsten (+)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Regel Toevoegen & Direct Toepassen
                  </button>
                </div>
              </form>

              {/* List of custom rules */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Jouw Aangepaste Regels ({customRules.length})</span>
                  {customRules.length > 0 && (
                    <button
                      onClick={() => setCustomRules([])}
                      className="text-[10px] text-red-600 hover:underline font-normal"
                    >
                      Alle eigen regels wissen
                    </button>
                  )}
                </h4>

                {customRules.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                    Je hebt nog geen aangepaste regels aangemaakt. De standaard ingebouwde regels zijn wel altijd actief.
                  </p>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
                    {customRules.map((r) => (
                      <div key={r.id} className="p-3 bg-white flex items-center justify-between text-xs hover:bg-slate-50 transition">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">"{r.keyword}"</span>
                            <span className="text-slate-400">→</span>
                            <span className="font-semibold text-emerald-700">{r.category}</span>
                            {r.targetType !== "all" && (
                              <span className="text-[10px] text-slate-400 bg-slate-100 px-1 py-0.5 rounded">
                                {r.targetType === "income" ? "Inkomsten" : "Uitgaven"}
                              </span>
                            )}
                          </div>
                          {r.cleanName && (
                            <p className="text-[11px] text-slate-500">Weergave: <span className="font-medium text-slate-700">{r.cleanName}</span></p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteCustomRule(r.id)}
                          className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                          title="Regel verwijderen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Built-in system rules info */}
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>Standaard Ingebouwde Herkenningsregels (60+ Nederlandse bronnen)</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  De app herkent standaard automatisch posten zoals <strong>KPN, Ziggo, Vodafone, Adobe, Google, Microsoft, Belastingdienst, Belastingkantoor, Shell, BP, Total, NS, Uber, LeasePlan, Huur, Salaris, Pensioen, KvK, Rabobank, ING, ABN AMRO, Bunq</strong> en sector-specifieke leveranciers (zoals Agrifirm, Voer, Zaad, Dierenarts, Hoefsmid, Sligro, Makro, Loonwerk).
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowRulesModal(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700 transition"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STORAGE & MULTI-DEVICE SYNCHRONIZATION MODAL */}
      <StorageModal
        isOpen={showStorageModal}
        onClose={() => setShowStorageModal(false)}
        storageMode={storageMode}
        onStorageModeChange={handleStorageModeChange}
        currentBackupData={currentBackupData}
        onRestoreData={handleRestoreData}
        gdriveState={gdriveState}
        setGdriveState={setGdriveState}
        cloudSyncState={cloudSyncState}
        setCloudSyncState={setCloudSyncState}
        onNotify={(msg, isError) => {
          if (isError) {
            setErrorMessage(msg);
          } else {
            setSuccessMessage(msg);
          }
        }}
      />

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 text-center text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-600 font-display">Slimme Begrotingsplanner</span>
            <span className="text-slate-300">|</span>
            <span>Local Browser Sandbox v1.1</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Volledig geanonimiseerd en offline-first beveiligd.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
