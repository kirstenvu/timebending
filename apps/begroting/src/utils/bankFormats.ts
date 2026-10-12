import { Transaction } from "../types";
import { parseBankStatementCSV } from "./parser";

/**
 * Herkent het formaat van een bankbestand en leest het in.
 * Ondersteund: CAMT.053 (XML), MT940 (.swi/.sta/.940), CSV en PDF.
 * Alles gebeurt lokaal in de browser.
 */

export type BankFormat = "camt053" | "mt940" | "csv" | "pdf" | "onbekend";

export interface ParseResult {
  format: BankFormat;
  transactions: Transaction[];
  warnings: string[];
}

export class BankFileError extends Error {}

const FORMAT_LABELS: Record<BankFormat, string> = {
  camt053: "CAMT.053",
  mt940: "MT940",
  csv: "CSV",
  pdf: "PDF",
  onbekend: "onbekend formaat",
};
export const formatLabel = (f: BankFormat) => FORMAT_LABELS[f];

function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

function makeTx(date: string, description: string, amount: number, type: "income" | "expense"): Transaction {
  return {
    id: generateId(),
    date,
    description: description.replace(/\s+/g, " ").trim().substring(0, 200) || "Banktransactie",
    amount: Math.round(Math.abs(amount) * 100) / 100,
    type,
    category: "Niet gecategoriseerd",
  };
}

// ---------------------------------------------------------------------------
// Tekst decoderen (UTF-8, met terugval op Windows-1252 voor oudere bankexports)
// ---------------------------------------------------------------------------
export function decodeText(bytes: Uint8Array): string {
  let text = new TextDecoder("utf-8").decode(bytes);
  if (text.includes("�")) {
    try {
      text = new TextDecoder("windows-1252").decode(bytes);
    } catch {
      /* laat UTF-8 staan */
    }
  }
  return text.replace(/^﻿/, "");
}

/** True als de inhoud eruitziet als binaire data in plaats van leesbare tekst. */
function looksBinary(bytes: Uint8Array): boolean {
  const sample = bytes.subarray(0, Math.min(bytes.length, 4000));
  if (sample.length === 0) return false;
  let control = 0;
  for (const b of sample) {
    if (b === 0) return true;
    if (b < 9 || (b > 13 && b < 32)) control++;
  }
  return control / sample.length > 0.02;
}

export function detectFormat(bytes: Uint8Array, filename: string): BankFormat {
  const head = new TextDecoder("latin1").decode(bytes.subarray(0, 2048));
  if (head.startsWith("%PDF")) return "pdf";
  if (/^\s*(<\?xml|<Document)/i.test(head) && /camt\.05[234]|<BkToCstmrStmt|<Ntry>/i.test(head + decodeText(bytes.subarray(0, 20000)))) {
    return "camt053";
  }
  if (/(^|\n):20:/.test(head) && /:61:|:60F:|:25:/.test(decodeText(bytes))) return "mt940";
  const ext = filename.toLowerCase().split(".").pop() || "";
  if (["swi", "sta", "940", "mt940"].includes(ext)) return "mt940";
  if (ext === "xml") return "camt053";
  if (looksBinary(bytes)) return "onbekend";
  return "csv";
}

// ---------------------------------------------------------------------------
// CAMT.053 (ISO 20022 XML)
// ---------------------------------------------------------------------------
function xmlDecode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&");
}

/** Haalt de inhoud van het eerste <tag> binnen een stuk XML op (namespace-prefix wordt genegeerd). */
function tag(xml: string, name: string): string {
  const m = xml.match(new RegExp(`<(?:\\w+:)?${name}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:\\w+:)?${name}>`));
  return m ? xmlDecode(m[1].trim()) : "";
}
function allTags(xml: string, name: string): string[] {
  const re = new RegExp(`<(?:\\w+:)?${name}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:\\w+:)?${name}>`, "g");
  return [...xml.matchAll(re)].map((m) => xmlDecode(m[1].trim()));
}

export function parseCamt053(xml: string): Transaction[] {
  const entries = allTags(xml, "Ntry");
  const txs: Transaction[] = [];
  for (const e of entries) {
    const amount = parseFloat(tag(e, "Amt"));
    if (!isFinite(amount) || amount === 0) continue;
    const isCredit = tag(e, "CdtDbtInd") === "CRDT";
    // Bij een teruggeboekte post (RvslInd = true) draait de richting om
    const reversed = /^true$/i.test(tag(e, "RvslInd"));
    const income = reversed ? !isCredit : isCredit;

    const bookingDate = tag(tag(e, "BookgDt") || "", "Dt") || tag(tag(e, "BookgDt") || "", "DtTm").slice(0, 10);
    const valueDate = tag(tag(e, "ValDt") || "", "Dt");
    const date = bookingDate || valueDate;

    // Tegenpartij: bij een afschrijving de ontvanger (Cdtr), bij een bijschrijving de betaler (Dbtr)
    const parties = tag(e, "RltdPties");
    const partyBlock = tag(parties, isCredit ? "Dbtr" : "Cdtr");
    const name = tag(partyBlock, "Nm");
    const remittance = allTags(e, "Ustrd").join(" ");
    const extra = tag(e, "AddtlNtryInf") || tag(e, "AddtlTxInf");

    const parts = [name, remittance || extra].filter(Boolean);
    txs.push(makeTx(date, parts.join(" - ") || extra || "Banktransactie", amount, income ? "income" : "expense"));
  }
  return txs;
}

// ---------------------------------------------------------------------------
// MT940 (SWIFT)
// ---------------------------------------------------------------------------
function mt940Description(info: string): string {
  const flat = info.replace(/\r?\n/g, "");
  if (flat.includes("/")) {
    // Gestructureerde :86: (Rabobank, ING, ABN AMRO): /NAME/.../REMI/.../
    const field = (code: string) => {
      const m = flat.match(new RegExp(`/${code}/(.*?)(?=/(?:[A-Z]{2,4})/|$)`));
      return m ? m[1].trim() : "";
    };
    const name = field("NAME");
    let remi = field("REMI");
    if (remi.startsWith("USTD//")) remi = remi.slice(6);
    remi = remi.replace(/^(USTD|STRD)\/+/, "").replace(/\/+$/, "");
    const desc = [name, remi].filter(Boolean).join(" - ");
    if (desc) return desc;
  }
  return flat.replace(/\/[A-Z]{2,4}\//g, " ").replace(/\s+/g, " ").trim();
}

export function parseMT940(text: string): Transaction[] {
  const lines = text.replace(/\r/g, "").split("\n");
  const txs: Transaction[] = [];
  let current: { date: string; amount: number; income: boolean; info: string[] } | null = null;
  let inInfo = false;

  const flush = () => {
    if (current) {
      txs.push(makeTx(current.date, mt940Description(current.info.join("\n")), current.amount, current.income ? "income" : "expense"));
    }
    current = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const tagMatch = line.match(/^:(\d{2}[A-Z]?):(.*)$/);
    if (tagMatch) {
      const [, code, rest] = tagMatch;
      inInfo = false;
      if (code === "61") {
        flush();
        // YYMMDD [MMDD] [R]C|D [funds code] bedrag,cc ...
        const m = rest.match(/^(\d{2})(\d{2})(\d{2})(\d{4})?(R?[CD])[A-Z]?(\d+,\d{0,2})/);
        if (m) {
          const [, yy, mm, dd, , mark, amt] = m;
          const amount = parseFloat(amt.replace(",", "."));
          // RC = terugboeking van een bijschrijving (dus geld eruit), RD = andersom
          const income = mark === "C" || mark === "RD";
          current = { date: `20${yy}-${mm}-${dd}`, amount, income, info: [] };
        }
      } else if (code === "86" && current) {
        current.info.push(rest);
        inInfo = true;
      } else if (code.startsWith("62") || code === "20") {
        flush();
      }
    } else if (line === "-" || line.startsWith("{") || line.startsWith("-}")) {
      flush();
      inInfo = false;
    } else if (inInfo && current) {
      current.info.push(line);
    }
  }
  flush();
  return txs.filter((t) => t.amount > 0);
}

// ---------------------------------------------------------------------------
// PDF (via pdf.js) — werkt op de posities van tekst op de pagina
// ---------------------------------------------------------------------------
export interface PdfTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
}
export interface PdfLine {
  page: number;
  y: number;
  items: PdfTextItem[];
}

/** Groepeert losse tekststukjes per pagina tot regels (zelfde hoogte), gesorteerd van links naar rechts. */
export function groupIntoLines(pages: PdfTextItem[][]): PdfLine[] {
  const out: PdfLine[] = [];
  pages.forEach((items, pageIdx) => {
    const sorted = items.filter((i) => i.str.trim()).sort((a, b) => b.y - a.y || a.x - b.x);
    const lines: PdfLine[] = [];
    for (const it of sorted) {
      const line = lines.find((l) => Math.abs(l.y - it.y) < 3);
      if (line) line.items.push(it);
      else lines.push({ page: pageIdx + 1, y: it.y, items: [it] });
    }
    lines.forEach((l) => l.items.sort((a, b) => a.x - b.x));
    lines.sort((a, b) => b.y - a.y);
    out.push(...lines);
  });
  return out;
}

const MONTHS: Record<string, string> = {
  jan: "01", feb: "02", mrt: "03", maa: "03", apr: "04", mei: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", okt: "10", oct: "10", nov: "11", dec: "12",
};

const DATE_RE = /^(\d{1,2})[-/.](\d{1,2})(?:[-/.](\d{2,4}))?$|^(\d{4})-(\d{2})-(\d{2})$|^(\d{1,2})\s+([a-z]{3})[a-z]*\.?(?:\s+(\d{4}))?$/i;
const AMOUNT_RE = /^([+-])?\s*(?:€|EUR)?\s*([+-])?\s*(\d{1,3}(?:\.\d{3})*|\d+),(\d{2})\s*([+-]|af|bij|cr|db|d|c)?$/i;

function parseDateToken(s: string, fallbackYear: string): string | null {
  const m = s.trim().match(DATE_RE);
  if (!m) return null;
  let y: string, mo: string, d: string;
  if (m[4]) {
    [y, mo, d] = [m[4], m[5], m[6]];
  } else if (m[1]) {
    d = m[1];
    mo = m[2];
    y = m[3] || fallbackYear;
  } else {
    d = m[7];
    mo = MONTHS[m[8].toLowerCase().slice(0, 3)];
    if (!mo) return null;
    y = m[9] || fallbackYear;
  }
  if (y.length === 2) y = "20" + y;
  const mon = Number(mo), day = Number(d);
  if (mon < 1 || mon > 12 || day < 1 || day > 31) return null;
  return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function parseAmountToken(s: string): { value: number; sign: 1 | -1 | 0 } | null {
  const m = s.trim().match(AMOUNT_RE);
  if (!m) return null;
  const value = parseFloat(m[3].replace(/\./g, "") + "." + m[4]);
  const signChar = m[1] || m[2] || m[5] || "";
  let sign: 1 | -1 | 0 = 0;
  if (/^(\+|bij|cr|c)$/i.test(signChar)) sign = 1;
  if (/^(-|af|db|d)$/i.test(signChar)) sign = -1;
  return { value, sign };
}

/** Splitst een regel in "cellen": tekststukjes die dicht bij elkaar staan worden samengevoegd. */
function cells(line: PdfLine): PdfTextItem[] {
  const out: PdfTextItem[] = [];
  for (const it of line.items) {
    const last = out[out.length - 1];
    if (last && it.x - (last.x + last.width) < 4) {
      const gap = it.x - (last.x + last.width) > 1 ? " " : "";
      last.str += gap + it.str;
      last.width = it.x + it.width - last.x;
    } else {
      out.push({ ...it });
    }
  }
  return out.map((c) => ({ ...c, str: c.str.trim() })).filter((c) => c.str);
}

const SKIP_LINE_RE = /\b(saldo|pagina|blad|totaal|overgebracht|transport|rekeningafschrift|rekeningoverzicht|periode)\b/i;

export function parsePdfLines(lines: PdfLine[]): { transactions: Transaction[]; warnings: string[] } {
  const warnings: string[] = [];
  const allText = lines.map((l) => l.items.map((i) => i.str).join(" ")).join("\n");

  // Jaar voor datums zonder jaartal (bv. "03-01"): neem het eerste volledige jaartal uit het document
  const yearMatch = allText.match(/\b\d{1,2}[-/.]\d{1,2}[-/.](20\d{2})\b|\b(20\d{2})-\d{2}-\d{2}\b|\b\d{1,2}\s+[a-z]{3,9}\s+(20\d{2})\b/i);
  const fallbackYear = yearMatch ? yearMatch[1] || yearMatch[2] || yearMatch[3] : String(new Date().getFullYear());

  // Kolomposities uit de koptekst (bv. "Datum | Omschrijving | Af | Bij | Saldo")
  type Cols = { af?: number; bij?: number; saldo?: number; bedrag?: number };
  let cols: Cols = {};
  const center = (c: PdfTextItem) => c.x + c.width / 2;

  const txs: Transaction[] = [];
  let guessed = 0;
  let current: { date: string; desc: string[]; value: number; income: boolean | null } | null = null;
  const flush = () => {
    if (current && current.value > 0) {
      let income = current.income;
      if (income === null) {
        guessed++;
        const d = current.desc.join(" ").toLowerCase();
        income = /\b(bijschrijving|ontvangen|storting|creditering|terugbetaling)\b/.test(d);
      }
      txs.push(makeTx(current.date, current.desc.join(" "), current.value, income ? "income" : "expense"));
    }
    current = null;
  };

  for (const line of lines) {
    const cs = cells(line);
    if (cs.length === 0) continue;
    const lower = cs.map((c) => c.str.toLowerCase());

    // Koptekst herkennen
    if (lower.some((s) => /^(datum|boekdatum|transactiedatum)$/.test(s))) {
      const next: Cols = {};
      cs.forEach((c, i) => {
        const s = lower[i];
        if (/^(af|bedrag af|debet|uitgaven?|af \(eur\))$/.test(s)) next.af = center(c);
        else if (/^(bij|bedrag bij|credit|inkomsten|bij \(eur\))$/.test(s)) next.bij = center(c);
        else if (/saldo/.test(s)) next.saldo = center(c);
        else if (/^bedrag( \(eur\)| eur)?$/.test(s)) next.bedrag = center(c);
      });
      if (next.af !== undefined || next.bij !== undefined || next.bedrag !== undefined) cols = next;
      flush();
      continue;
    }

    const date = parseDateToken(cs[0].str, fallbackYear);
    const amounts = cs
      .map((c) => ({ c, a: parseAmountToken(c.str) }))
      .filter((x): x is { c: PdfTextItem; a: { value: number; sign: 1 | -1 | 0 } } => !!x.a);

    if (date && amounts.length > 0 && !SKIP_LINE_RE.test(lower.join(" "))) {
      flush();
      // Kies het bedrag dat niet in de saldokolom staat
      const nearest = (x: number) => {
        const options: [string, number][] = (Object.entries(cols) as [string, number | undefined][])
          .filter((e): e is [string, number] => e[1] !== undefined);
        if (!options.length) return null;
        return options.reduce((best, cur) => (Math.abs(cur[1] - x) < Math.abs(best[1] - x) ? cur : best))[0];
      };
      const candidates = amounts.filter((x) => nearest(center(x.c)) !== "saldo");
      const pick = (candidates.length ? candidates : amounts)[0];
      const col = nearest(center(pick.c));
      let income: boolean | null = null;
      if (pick.a.sign !== 0) income = pick.a.sign > 0;
      else if (col === "af") income = false;
      else if (col === "bij") income = true;
      // Losse "Af"/"Bij"-cel op de regel (zoals bij ING/Rabo-overzichten)
      if (income === null) {
        if (lower.includes("bij") || lower.includes("cr")) income = true;
        else if (lower.includes("af") || lower.includes("db")) income = false;
      }
      const amountCells = new Set(amounts.map((x) => x.c));
      const descParts = cs
        .slice(1)
        .filter((c) => !amountCells.has(c) && !/^(af|bij|cr|db|d|c)$/i.test(c.str) && !parseDateToken(c.str, fallbackYear));
      current = { date, desc: descParts.map((c) => c.str), value: pick.a.value, income };
      continue;
    }

    // Vervolgregel van de omschrijving
    if (current && !SKIP_LINE_RE.test(lower.join(" ")) && amounts.length === 0 && current.desc.join(" ").length < 180) {
      current.desc.push(cs.map((c) => c.str).join(" "));
    } else if (SKIP_LINE_RE.test(lower.join(" "))) {
      flush();
    }
  }
  flush();

  if (guessed > 0) {
    warnings.push(`Bij ${guessed} transactie(s) was niet duidelijk of het geld erin of eruit ging. Controleer of inkomsten en uitgaven goed zijn ingedeeld.`);
  }
  return { transactions: txs, warnings };
}

// pdf.js wordt pas geladen als iemand echt een PDF uploadt
async function extractPdfPages(bytes: Uint8Array): Promise<PdfTextItem[][]> {
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const doc = await pdfjs.getDocument({ data: bytes }).promise;
  const pages: PdfTextItem[][] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    pages.push(
      (content.items as any[])
        .filter((i) => typeof i.str === "string")
        .map((i) => ({ str: i.str, x: i.transform[4], y: i.transform[5], width: i.width }))
    );
  }
  return pages;
}

// ---------------------------------------------------------------------------
// Hoofdingang
// ---------------------------------------------------------------------------
export async function parseBankFile(bytes: Uint8Array, filename: string): Promise<ParseResult> {
  const format = detectFormat(bytes, filename);
  const warnings: string[] = [];
  let transactions: Transaction[] = [];

  switch (format) {
    case "camt053":
      transactions = parseCamt053(decodeText(bytes));
      break;
    case "mt940":
      transactions = parseMT940(decodeText(bytes));
      break;
    case "csv":
      transactions = parseBankStatementCSV(decodeText(bytes), filename);
      break;
    case "pdf": {
      let pages: PdfTextItem[][];
      try {
        pages = await extractPdfPages(bytes);
      } catch {
        throw new BankFileError("Deze PDF kon niet worden geopend. Misschien is hij beveiligd met een wachtwoord of beschadigd.");
      }
      if (pages.every((p) => p.length === 0)) {
        throw new BankFileError(
          "Deze PDF bevat geen leesbare tekst, waarschijnlijk is het een scan of foto. Download het afschrift liever als CAMT.053, MT940 of CSV in je internetbankieren."
        );
      }
      const res = parsePdfLines(groupIntoLines(pages));
      transactions = res.transactions;
      warnings.push(...res.warnings, "PDF-afschriften zijn minder betrouwbaar dan CAMT.053 of MT940. Loop de transacties even na.");
      break;
    }
    default:
      throw new BankFileError(
        "Dit bestandstype wordt niet herkend. Gebruik een CAMT.053 (.xml), MT940 (.swi/.sta/.940), CSV of PDF uit je internetbankieren."
      );
  }

  if (transactions.length === 0) {
    throw new BankFileError(
      `Er zijn geen transacties gevonden in dit ${formatLabel(format)}-bestand. Controleer of het een bankafschrift is, of probeer een ander formaat (CAMT.053 werkt het betrouwbaarst).`
    );
  }
  return { format, transactions, warnings };
}
