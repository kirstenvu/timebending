import { Transaction, TRANSFER_CATEGORY } from "../types";

/**
 * Eerste laag van de app: wie betaalt jou en wie betaal jij?
 * Transacties worden gebundeld per tegenpartij, zonder dat er iets ingedeeld hoeft te worden.
 */

// Bankruis die vóór of in de omschrijving staat en niets zegt over wie het is
const NOISE: RegExp[] = [
  /^SEPA\s+(iDEAL|Overboeking|Periodieke?\s+overb\.?|Periodiek|Incasso(\s+algemeen\s+doorlopend)?|Acceptgiro)\s+/i,
  /^(iDEAL|Overboeking|Incasso|Betaalautomaat|Geldautomaat|Online\s+bankieren|Internetbankieren)\s+/i,
  /^(BEA|GEA)[,\s]*(NR:?\s*\S+)?\s*/i,
  /^Betaalpas\s+/i,
  /\b\d{2}[.\-/]\d{2}[.\-/]\d{2,4}\b/g, // datums
  /\b\d{1,2}[.:]\d{2}\s*(uur)?\b/g, // tijden
  /\bPAS\s*\d+\b/gi,
  /\bPASVOLGNR:?\s*\d+\b/gi,
  /\bNR:?\s*[A-Z0-9]+\b/gi,
  /\b[A-Z]{2}\d{2}\s?[A-Z]{4}[\s\d]{8,18}\b/g, // IBAN
  /\bApple\s?Pay\b|\bGoogle\s?Pay\b/gi,
];

function tidy(s: string): string {
  return s.replace(/\s+/g, " ").replace(/^[\s,.;:/\-]+|[\s,.;:/\-]+$/g, "").trim();
}

/** Naam afleiden uit de omschrijving, als de bank geen aparte naam meelevert (bv. bij een PDF). */
export function deriveNameFromDescription(description: string): string {
  let s = (description || "").split(" - ")[0];
  for (const re of NOISE) s = s.replace(re, " ");
  s = tidy(s.replace(/\b\d+\b/g, " "));
  const words = s.split(" ").filter(Boolean);
  // Kort houden: de eerste drie woorden zijn bijna altijd de naam
  return words.slice(0, 3).join(" ") || tidy(description).slice(0, 30) || "Onbekend";
}

export function counterpartyName(t: Pick<Transaction, "counterparty" | "description">): string {
  return t.counterparty?.trim() || deriveNameFromDescription(t.description);
}

const normalize = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\b(b\.?v\.?|v\.?o\.?f\.?|n\.?v\.?)\b/g, "")
    .replace(/[^a-z]+/g, " ")
    .trim();

/** Sleutel waarop transacties gebundeld worden: rekeningnummer als dat er is, anders de naam. */
export function counterpartyKey(t: Pick<Transaction, "counterparty" | "description" | "counterAccount">): string {
  if (t.counterAccount) return `iban:${t.counterAccount}`;
  return `naam:${normalize(counterpartyName(t)) || "onbekend"}`;
}

export interface CounterpartySummary {
  key: string;
  name: string;
  iban?: string;
  count: number;
  received: number; // geld van deze partij naar jou
  paid: number; // geld van jou naar deze partij
  net: number; // received - paid
  firstDate: string;
  lastDate: string;
  ownAccount: boolean; // overboekingen tussen eigen rekeningen
  transactions: Transaction[];
}

export function summarizeByCounterparty(transactions: Transaction[]): CounterpartySummary[] {
  const map = new Map<string, CounterpartySummary & { names: Map<string, number> }>();
  for (const t of transactions) {
    const key = counterpartyKey(t);
    let s = map.get(key);
    if (!s) {
      s = {
        key,
        name: "",
        iban: t.counterAccount,
        count: 0,
        received: 0,
        paid: 0,
        net: 0,
        firstDate: t.date,
        lastDate: t.date,
        ownAccount: true,
        transactions: [],
        names: new Map(),
      };
      map.set(key, s);
    }
    const name = counterpartyName(t);
    s.names.set(name, (s.names.get(name) || 0) + 1);
    s.count++;
    if (t.type === "income") s.received += t.amount;
    else s.paid += t.amount;
    if (t.date < s.firstDate) s.firstDate = t.date;
    if (t.date > s.lastDate) s.lastDate = t.date;
    if (t.category !== TRANSFER_CATEGORY) s.ownAccount = false;
    s.transactions.push(t);
  }
  return [...map.values()].map(({ names, ...s }) => {
    const name = [...names.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "Onbekend";
    const round = (n: number) => Math.round(n * 100) / 100;
    return {
      ...s,
      name,
      received: round(s.received),
      paid: round(s.paid),
      net: round(s.received - s.paid),
      transactions: s.transactions.sort((a, b) => (a.date < b.date ? 1 : -1)),
    };
  });
}

/**
 * Vaste groep per tegenpartij (alleen als de gebruiker daar zelf voor kiest).
 * Geldt voor alle huidige én toekomstige boekingen van die partij.
 */
export function applyCounterpartyGroups(transactions: Transaction[], groups: Record<string, string>): Transaction[] {
  if (!groups || Object.keys(groups).length === 0) return transactions;
  return transactions.map(t => {
    const g = groups[counterpartyKey(t)];
    return g && g !== t.category ? { ...t, category: g, confidence: 1 } : t;
  });
}
