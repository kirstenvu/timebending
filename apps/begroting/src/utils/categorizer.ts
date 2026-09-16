import { Transaction, STANDARD_CATEGORIES } from "../types";

export interface CustomRule {
  id: string;
  keyword: string;
  category: string;
  cleanName?: string;
  targetType?: "all" | "income" | "expense";
}

// Default comprehensive Dutch business keyword rules
interface BuiltInRule {
  keywords: string[];
  category: string;
  cleanName?: string;
  type?: "income" | "expense";
  frequency?: "monthly" | "quarterly" | "yearly";
}

const BUILT_IN_RULES: BuiltInRule[] = [
  // 1. Inkomsten (Omzet)
  {
    keywords: [
      "omzet", "factuur", "declaratie", "verkoop", "bijschrijving van", "lesgeld", "pensiongeld",
      "stalling", "stg mollie", "mollie payments", "stripe payments", "multisafepay", "adyen",
      "pincash", "pinomzet", "honorarium", "opbrengst", "klantbetaling", "debiteur", "overboeking van",
      "bezoekers", "entree", "vergoeding", "subsidie rvo", "toeslag rvo", "glb toeslag", "pacht opbrengst"
    ],
    category: "Inkomsten (Omzet)",
    type: "income"
  },

  // 2. Huisvesting
  {
    keywords: [
      "huur", "pacht", "stalhuur", "erfpacht", "eneco", "essent", "vattenfall", "energiedirect",
      "greenchoice", "stedin", "liander", "enexis", "waternet", "vitens", "brabant water", "dunea",
      "evides", "afvalstoffenheffing", "waterschapsbelasting", "ozb", "onroerendezaakbelasting",
      "gemeentebelastingen", "woz", "schoonmaakbedrijf", "beveiliging", "kantoorpand", "bedrijfsruimte"
    ],
    category: "Huisvesting",
    frequency: "monthly"
  },

  // 3. Kantoor & IT
  {
    keywords: [
      "kpn", "ziggo", "vodafone", "odido", "t-mobile", "tele2", "telfort", "microsoft", "adobe",
      "apple.com", "google workspace", "google cloud", "dropbox", "canva", "spotify", "twinfield",
      "moneybird", "exact online", "e-boekhouden", "visma", "wefact", "snelstart", "transip",
      "hostnet", "vimexx", "antagonist", "siteground", "aws", "github", "slack", "notion", "zoom.us",
      "bol.com", "coolblue", "staples", "officemarket", "bruna", "printer", "inkt", "toner"
    ],
    category: "Kantoor & IT",
    frequency: "monthly"
  },

  // 4. Marketing & Verkoop
  {
    keywords: [
      "meta platforms", "facebook ads", "instagram", "google ads", "google adwords", "linkedin",
      "tiktok ads", "drukwerkdeal", "flyeralarm", "reclameland", "vista print", "belettering",
      "marketing", "advertentie", "sponsor", "fotograaf", "webdesign", "copywriting", "seo bureau",
      "beursdeelname", "relatiegeschenk", "kerstpakket"
    ],
    category: "Marketing & Verkoop"
  },

  // 5. Personeel & Inhuur
  {
    keywords: [
      "salaris", "loonbetaling", "uitzendbureau", "randstad", "tempo-team", "youngcapital", "payroll",
      "zzp inhuur", "freelance", "arbo", "arbodienst", "pensioenfonds", "bpf", "pensioenpremie",
      "stagevergoeding", "personeelsvereniging", "reiskostenvergoeding personeel", "cursus personeel"
    ],
    category: "Personeel & Inhuur",
    frequency: "monthly"
  },

  // 6. Reiskosten
  {
    keywords: [
      "shell", "bp ", "esso", "totalenergies", "tango", "avia", "tamoil", "tinq", "texaco", "q8",
      "fastned", "brandstof", "tankstation", "diesel", "benzine", "ns-reizigers", "ns reizigers",
      "ov-chipkaart", "connexxion", "arriva", "q-park", "yellowbrick", "parkmobile", "easypark",
      "parkeergeld", "garage", "apk", "kwik-fit", "euromaster", "leaseplan", "alphabet", "arval",
      "autolease", "wasstraat", "tol", "peage"
    ],
    category: "Reiskosten"
  },

  // 7. Verzekeringen & Advies
  {
    keywords: [
      "unive", "univé", "nationale nederlanden", "centraal beheer", "achmea", "asr", "aegon",
      "interpolis", "klaverblad", "nn non-life", "aon", "allianz", "arag", "das rechtsbijstand",
      "bedrijfsaansprakelijkheid", "arbeidsongeschiktheidsverzekering", "aov", "boekhouder",
      "accountant", "notaris", "advocaat", "juridisch", "kvk", "kamer van koophandel", "bdo",
      "deloitte", "pwc", "kpmg", "jongbloed"
    ],
    category: "Verzekeringen & Advies",
    frequency: "monthly"
  },

  // 8. Belastingen
  {
    keywords: [
      "belastingdienst", "omzetbelasting", "btw", "inkomstenbelasting", "vennootschapsbelasting",
      "vpb", "zorgverzekeringswet", "zvw", "douane", "motorrijtuigenbelasting", "mrb",
      "loonheffing", "voorlopige aanslag"
    ],
    category: "Belastingen",
    frequency: "quarterly"
  },

  // 9. Overige Bedrijfskosten
  {
    keywords: [
      "welkoop", "boerenbond", "agrifirm", "forfarmers", "voeder", "hooi", "stro", "krachtvoer",
      "veearts", "dierenarts", "hoefsmid", "paardenkliniek", "landbouwmechanisatie", "kramp",
      "kraakman", "de heus", "gamma", "praxis", "hornbach", "karwei", "bouwmaat", "toolstation",
      "kosten betaalpakket", "bankkosten", "rabobank kosten", "ing kosten", "abn amro kosten",
      "pincontract", "kantoorkosten", "klein gereedschap", "bedrijfskleding"
    ],
    category: "Overige Bedrijfskosten"
  },

  // 10. Privé (Onttrekkingen/Stortingen)
  {
    keywords: [
      "prive", "privé", "eigen opname", "priveopname", "privéstorting", "prive-onttrekking",
      "zakgeld", "sparen prive", "tikkie", "albert heijn", "ah to go", "jumbo", "lidl", "aldi",
      "plus supermarkt", "dirk van den broek", "hema", "action", "kruidvat", "etos", "ikea",
      "thuisbezorgd", "uber eats", "restaurant", "cafe", "café", "bioscoop", "netflix",
      "disney+", "videoland", "h&m", "zara", "zalando"
    ],
    category: "Privé (Onttrekkingen/Stortingen)"
  }
];

// Clean display names for popular merchants
const CLEAN_NAME_MAP: Array<{ match: string; clean: string }> = [
  { match: "kpn", clean: "KPN" },
  { match: "ziggo", clean: "Ziggo" },
  { match: "vodafone", clean: "Vodafone" },
  { match: "odido", clean: "Odido" },
  { match: "belastingdienst", clean: "Belastingdienst" },
  { match: "eneco", clean: "Eneco" },
  { match: "essent", clean: "Essent" },
  { match: "vattenfall", clean: "Vattenfall" },
  { match: "energiedirect", clean: "Energiedirect" },
  { match: "shell", clean: "Shell" },
  { match: "bp ", clean: "BP" },
  { match: "esso", clean: "Esso" },
  { match: "total", clean: "TotalEnergies" },
  { match: "tamoil", clean: "Tamoil" },
  { match: "tango", clean: "Tango" },
  { match: "mollie", clean: "Mollie Payments" },
  { match: "stripe", clean: "Stripe" },
  { match: "ns-reizigers", clean: "NS Reizigers" },
  { match: "ov-chipkaart", clean: "OV-Chipkaart" },
  { match: "q-park", clean: "Q-Park" },
  { match: "yellowbrick", clean: "Yellowbrick" },
  { match: "parkmobile", clean: "ParkMobile" },
  { match: "microsoft", clean: "Microsoft" },
  { match: "adobe", clean: "Adobe" },
  { match: "google", clean: "Google" },
  { match: "apple", clean: "Apple" },
  { match: "bol.com", clean: "Bol.com" },
  { match: "coolblue", clean: "Coolblue" },
  { match: "moneybird", clean: "Moneybird" },
  { match: "exact", clean: "Exact Online" },
  { match: "e-boekhouden", clean: "e-Boekhouden" },
  { match: "unive", clean: "Univé" },
  { match: "interpolis", clean: "Interpolis" },
  { match: "centraal beheer", clean: "Centraal Beheer" },
  { match: "nationale nederlanden", clean: "Nationale-Nederlanden" },
  { match: "asr", clean: "a.s.r. Verzekeringen" },
  { match: "welkoop", clean: "Welkoop" },
  { match: "gamma", clean: "Gamma" },
  { match: "praxis", clean: "Praxis" },
  { match: "hornbach", clean: "Hornbach" },
  { match: "karwei", clean: "Karwei" },
  { match: "albert heijn", clean: "Albert Heijn" },
  { match: "jumbo", clean: "Jumbo" },
  { match: "lidl", clean: "Lidl" },
  { match: "aldi", clean: "Aldi" }
];

export function cleanMerchantName(rawDescription: string): string {
  const descLower = rawDescription.toLowerCase();
  
  for (const item of CLEAN_NAME_MAP) {
    if (descLower.includes(item.match)) {
      return item.clean;
    }
  }

  // Remove common banking noise words
  let cleaned = rawDescription
    .replace(/^SEPA\s+iDEAL\s+/i, "")
    .replace(/^SEPA\s+Overboeking\s+/i, "")
    .replace(/^SEPA\s+Periodiek\s+/i, "")
    .replace(/^SEPA\s+Incasso\s+/i, "")
    .replace(/^BEA\s+NR:[\w\d]+\s+/i, "")
    .replace(/^Betaalautomaat\s+/i, "")
    .replace(/^STG\s+DERDENGELDEN\s+INZ\.?\s+/i, "")
    .replace(/^STICHTING\s+DERDENGELDEN\s+/i, "")
    .replace(/^STG\s+MOLLIE\s+PAYMENTS\s+/i, "Mollie / ")
    .replace(/PASVOLGNR:\d+/gi, "")
    .replace(/\bNL\d{2}[A-Z]{4}\d{10}\b/gi, "")
    .trim();

  // Shorten if too long
  if (cleaned.length > 35) {
    cleaned = cleaned.substring(0, 32) + "...";
  }

  return cleaned || rawDescription;
}

/**
 * Deterministic, 100% local categorization engine
 */
export function classifyTransaction(
  t: { description: string; amount: number; type: "income" | "expense" },
  customRules: CustomRule[] = []
): {
  category: string;
  cleanName: string;
  isRecurring: boolean;
  frequency?: string;
  confidence: number;
} {
  const descLower = t.description.toLowerCase();
  const cleanName = cleanMerchantName(t.description);

  // 1. Check custom user-defined rules first
  for (const rule of customRules) {
    if (rule.keyword && descLower.includes(rule.keyword.toLowerCase())) {
      if (!rule.targetType || rule.targetType === "all" || rule.targetType === t.type) {
        return {
          category: rule.category,
          cleanName: rule.cleanName || cleanName,
          isRecurring: false,
          frequency: "none",
          confidence: 1.0
        };
      }
    }
  }

  // 2. If it's pure income and contains clear income indicators
  if (t.type === "income") {
    // Check if it's private deposit
    if (descLower.includes("prive") || descLower.includes("privé") || descLower.includes("storting eigen")) {
      return {
        category: "Privé (Onttrekkingen/Stortingen)",
        cleanName,
        isRecurring: false,
        confidence: 0.95
      };
    }

    // Default income category
    return {
      category: "Inkomsten (Omzet)",
      cleanName,
      isRecurring: descLower.includes("maand") || descLower.includes("periodiek") || descLower.includes("pension"),
      frequency: descLower.includes("maand") || descLower.includes("pension") ? "monthly" : "none",
      confidence: 0.95
    };
  }

  // 3. Search built-in keyword rules
  for (const rule of BUILT_IN_RULES) {
    for (const kw of rule.keywords) {
      if (descLower.includes(kw)) {
        return {
          category: rule.category,
          cleanName,
          isRecurring: !!rule.frequency || descLower.includes("periodiek") || descLower.includes("incasso"),
          frequency: rule.frequency || (descLower.includes("periodiek") ? "monthly" : "none"),
          confidence: 0.92
        };
      }
    }
  }

  // Fallback for unclassified expenses
  return {
    category: "Niet gecategoriseerd",
    cleanName,
    isRecurring: descLower.includes("periodiek") || descLower.includes("incasso"),
    frequency: descLower.includes("periodiek") ? "monthly" : "none",
    confidence: 0.2
  };
}

/**
 * Bulk categorize all transactions instantly
 */
export function autoCategorizeAll(
  transactions: Transaction[],
  customRules: CustomRule[] = []
): Transaction[] {
  return transactions.map(t => {
    const classification = classifyTransaction(
      { description: t.description, amount: t.amount, type: t.type },
      customRules
    );

    return {
      ...t,
      category: t.category !== "Niet gecategoriseerd" && t.category ? t.category : classification.category,
      cleanName: t.cleanName || classification.cleanName,
      isRecurring: t.isRecurring !== undefined ? t.isRecurring : classification.isRecurring,
      frequency: t.frequency || classification.frequency,
      confidence: classification.confidence
    };
  });
}
