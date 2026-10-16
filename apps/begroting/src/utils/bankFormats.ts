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

/** Normaliseert een rekeningnummer (IBAN) naar hoofdletters zonder spaties, of "" als het er niet op lijkt. */
export function normalizeIban(raw: string | undefined | null): string {
  if (!raw) return "";
  const compact = raw.toUpperCase().replace(/\s+/g, "");
  for (const m of compact.matchAll(/[A-Z]{2}\d{2}[A-Z0-9]{8,30}/g)) {
    let cand = m[0];
    // Soms plakt de valuta erachter (bv. "NL..1234EUR"): probeer korter tot het controlegetal klopt
    for (let cut = 0; cut <= 3 && cand.length - cut >= 12; cut++) {
      const c = cand.slice(0, cand.length - cut);
      if (ibanValid(c)) return c;
    }
  }
  return "";
}

function ibanValid(iban: string): boolean {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let rem = 0;
  for (const ch of rearranged) {
    const v = /[A-Z]/.test(ch) ? String(ch.charCodeAt(0) - 55) : ch;
    for (const d of v) rem = (rem * 10 + Number(d)) % 97;
  }
  return rem === 1;
}

function makeTx(
  date: string,
  description: string,
  amount: number,
  type: "income" | "expense",
  accounts: { own?: string; counter?: string; name?: string } = {}
): Transaction {
  const own = normalizeIban(accounts.own);
  const counter = normalizeIban(accounts.counter);
  const name = (accounts.name || "").replace(/\s+/g, " ").replace(/^[\s/]+|[\s/]+$/g, "").trim().substring(0, 80);
  return {
    ...(own ? { ownAccount: own } : {}),
    ...(counter ? { counterAccount: counter } : {}),
    ...(name ? { counterparty: name } : {}),
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
  const txs: Transaction[] = [];
  // Een bestand kan meerdere afschriften (Stmt) bevatten, elk voor een eigen rekening
  const statements = allTags(xml, "Stmt");
  for (const stmt of statements.length ? statements : [xml]) {
  const ownIban = tag(tag(tag(stmt, "Acct"), "Id"), "IBAN");
  const entries = allTags(stmt, "Ntry");
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

    const counterIban = tag(tag(tag(parties, isCredit ? "DbtrAcct" : "CdtrAcct"), "Id"), "IBAN");

    const parts = [name, remittance || extra].filter(Boolean);
    txs.push(
      makeTx(date, parts.join(" - ") || extra || "Banktransactie", amount, income ? "income" : "expense", {
        own: ownIban,
        counter: counterIban,
        name,
      })
    );
  }
  }
  return txs;
}

// ---------------------------------------------------------------------------
// MT940 (SWIFT)
// ---------------------------------------------------------------------------
function mt940Description(info: string): { desc: string; counter: string; name: string } {
  const flat = info.replace(/\r?\n/g, "");
  // Tegenrekening: /CNTP/IBAN/BIC/Naam/Plaats/ (Rabobank, ING) of een los IBAN in de tekst
  const cntp = flat.match(/\/CNTP\/([^/]*)\/([^/]*)\/([^/]*)\//);
  const counter = normalizeIban(cntp?.[1]) || normalizeIban((flat.match(/\b[A-Z]{2}\d{2}\s?[A-Z]{4}\s?\d{4}\s?\d{4}\s?\d{2,4}\b/) || [""])[0]);
  if (flat.includes("/")) {
    // Gestructureerde :86: (Rabobank, ING, ABN AMRO): /NAME/.../REMI/.../
    const field = (code: string) => {
      const m = flat.match(new RegExp(`/${code}/(.*?)(?=/(?:[A-Z]{2,4})/|$)`));
      return m ? m[1].trim() : "";
    };
    const name = field("NAME") || (cntp?.[3] || "").trim();
    let remi = field("REMI");
    if (remi.startsWith("USTD//")) remi = remi.slice(6);
    remi = remi.replace(/^(USTD|STRD)\/+/, "").replace(/\/+$/, "");
    const desc = [name, remi].filter(Boolean).join(" - ");
    if (desc) return { desc, counter, name };
  }
  return { desc: flat.replace(/\/[A-Z]{2,4}\//g, " ").replace(/\s+/g, " ").trim(), counter, name: "" };
}

export function parseMT940(text: string): Transaction[] {
  const lines = text.replace(/\r/g, "").split("\n");
  const txs: Transaction[] = [];
  let current: { date: string; amount: number; income: boolean; info: string[]; extra: string } | null = null;
  let inInfo = false;
  let ownAccount = "";

  const flush = () => {
    if (current) {
      const { desc, counter, name } = mt940Description(current.info.join("\n"));
      const counterIban = counter || normalizeIban(current.extra);
      txs.push(
        makeTx(current.date, desc, current.amount, current.income ? "income" : "expense", {
          own: ownAccount,
          counter: counterIban !== ownAccount ? counterIban : "",
          name,
        })
      );
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
          // Na het bedrag kan (bij oudere exports) de tegenrekening staan
          current = { date: `20${yy}-${mm}-${dd}`, amount, income, info: [], extra: rest.slice(m[0].length) };
        }
      } else if (code === "25") {
        ownAccount = normalizeIban(rest.split(/\s/)[0]) || normalizeIban(rest);
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
    } else if (current && current.info.length === 0) {
      // Vervolgregel van :61: (bv. tegenrekening bij oudere Rabobank-exports)
      current.extra += " " + line;
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
  jan: "01", feb: "02", mrt: "03", maa: "03", mar: "03", apr: "04", mei: "05", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", okt: "10", oct: "10", nov: "11", dec: "12",
};

const DATE_RE = /^(\d{1,2})[-/.](\d{1,2})(?:[-/.](\d{2,4}))?$|^(\d{4})-(\d{2})-(\d{2})$|^(\d{1,2})\s+([a-z]{3})[a-z]*\.?(?:\s+(\d{4}))?$/i;
const AMOUNT_RE = /^([+\-−])?\s*(?:€|EUR)?\s*([+\-−])?\s*(\d{1,3}(?:\.\d{3})*|\d+),(\d{2})\s*([+\-−]|af|bij|cr|db|d|c)?$/i;
const FULL_DATE_RE = /\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})\b|\b(\d{4})-(\d{2})-(\d{2})\b|\b(\d{1,2})\s+(jan|feb|mrt|maa|apr|mei|jun|jul|aug|sep|okt|nov|dec)[a-z]*\.?\s+(\d{4})\b/gi;

interface DateParts { y?: number; m: number; d: number }

function parseDateParts(s: string): DateParts | null {
  const m = s.trim().match(DATE_RE);
  if (!m) return null;
  let y: string | undefined, mo: string, d: string;
  if (m[4]) {
    [y, mo, d] = [m[4], m[5], m[6]];
  } else if (m[1]) {
    d = m[1];
    mo = m[2];
    y = m[3];
  } else {
    d = m[7];
    mo = MONTHS[m[8].toLowerCase().slice(0, 3)];
    if (!mo) return null;
    y = m[9];
  }
  if (y && y.length === 2) y = "20" + y;
  const mon = Number(mo), day = Number(d);
  if (mon < 1 || mon > 12 || day < 1 || day > 31) return null;
  return { y: y ? Number(y) : undefined, m: mon, d: day };
}

const toKey = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const toTime = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d);

function fullDatesIn(text: string): number[] {
  const out: number[] = [];
  for (const m of text.matchAll(FULL_DATE_RE)) {
    if (m[3]) out.push(toTime(+m[3], +m[2], +m[1]));
    else if (m[4]) out.push(toTime(+m[4], +m[5], +m[6]));
    else if (m[9]) out.push(toTime(+m[9], +MONTHS[m[8].toLowerCase().slice(0, 3)], +m[7]));
  }
  return out.filter((t) => !isNaN(t));
}

/** Zoekt de periode van het afschrift, bv. "Periode 01-07-2025 t/m 30-06-2026". */
function findPeriod(text: string): { start: number; end: number } | null {
  const range = /(\d{1,2}[-/.]\d{1,2}[-/.]\d{4}|\d{1,2}\s+[a-z]{3,9}\.?\s+\d{4})\s*(?:t\/m|tot en met|tot|-|–|—)\s*(\d{1,2}[-/.]\d{1,2}[-/.]\d{4}|\d{1,2}\s+[a-z]{3,9}\.?\s+\d{4})/i;
  const m = text.match(range);
  if (!m) return null;
  const a = fullDatesIn(m[1])[0];
  const b = fullDatesIn(m[2])[0];
  if (a === undefined || b === undefined || b < a) return null;
  return { start: a, end: b };
}

function parseAmountToken(s: string): { value: number; sign: 1 | -1 | 0 } | null {
  const m = s.trim().match(AMOUNT_RE);
  if (!m) return null;
  const value = parseFloat(m[3].replace(/\./g, "") + "." + m[4]);
  const signChar = m[1] || m[2] || m[5] || "";
  let sign: 1 | -1 | 0 = 0;
  if (/^(\+|bij|cr|c)$/i.test(signChar)) sign = 1;
  if (/^(-|−|af|db|d)$/i.test(signChar)) sign = -1;
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

const SKIP_LINE_RE = /\b(saldo|pagina|blad|totaal|totalen|overgebracht|transport|rekeningafschrift|rekeningoverzicht|periode|afgedrukt|aangemaakt)\b/i;
const HEADER_DATE_RE = /^(datum|boekdatum|transactiedatum|rentedatum|boekingsdatum|date)\b/;
const HEADER_OTHER_RE = /(\baf\b|\bbij\b|bedrag|debet|credit|omschrijving|naam|saldo)/;

function isHeaderLine(lower: string[]): boolean {
  return lower.some((s) => HEADER_DATE_RE.test(s)) && lower.some((s) => HEADER_OTHER_RE.test(s));
}

export function parsePdfLines(lines: PdfLine[]): { transactions: Transaction[]; warnings: string[] } {
  const warnings: string[] = [];
  const allText = lines.map((l) => l.items.map((i) => i.str).join(" ")).join("\n");

  // Jaartal voor datums zonder jaar ("03-01"): bij voorkeur binnen de periode van het afschrift
  const period = findPeriod(allText);
  const docDates = fullDatesIn(allText);
  const baseYear = period
    ? new Date(period.start).getUTCFullYear()
    : docDates.length
    ? Math.min(...docDates.map((t) => new Date(t).getUTCFullYear()))
    : new Date().getFullYear();
  let prevTime: number | null = null;

  const resolveDate = (p: DateParts): string => {
    if (p.y) return toKey(p.y, p.m, p.d);
    let years: number[];
    if (period) {
      const y1 = new Date(period.start).getUTCFullYear(), y2 = new Date(period.end).getUTCFullYear();
      years = [];
      for (let y = y1 - 1; y <= y2 + 1; y++) years.push(y);
      const margin = 7 * 86400000;
      const inside = years.filter((y) => {
        const t = toTime(y, p.m, p.d);
        return t >= period.start - margin && t <= period.end + margin;
      });
      if (inside.length === 1) return toKey(inside[0], p.m, p.d);
      if (inside.length > 1) years = inside;
    } else {
      years = prevTime !== null
        ? [-1, 0, 1].map((k) => new Date(prevTime as number).getUTCFullYear() + k)
        : [baseYear];
    }
    const ref = prevTime ?? (period ? period.start : toTime(baseYear, 1, 1));
    const best = years.reduce((a, b) => (Math.abs(toTime(b, p.m, p.d) - ref) < Math.abs(toTime(a, p.m, p.d) - ref) ? b : a));
    return toKey(best, p.m, p.d);
  };

  // Pagina's met een kolomkop: alles daarboven (samenvatting, saldo's, adres) wordt overgeslagen
  const headerPages = new Set<number>();
  for (const l of lines) {
    if (isHeaderLine(cells(l).map((c) => c.str.toLowerCase()))) headerPages.add(l.page);
  }
  const anyHeader = headerPages.size > 0;
  let headerSeenOnPage = 0;

  type Cols = { af?: number; bij?: number; saldo?: number; bedrag?: number };
  let cols: Cols = {};
  const center = (c: PdfTextItem) => c.x + c.width / 2;

  const txs: Transaction[] = [];
  let guessed = 0;
  let current: { date: string; desc: string[]; value: number; income: boolean | null; firstLineCells: number } | null = null;
  const flush = () => {
    if (current && current.value > 0) {
      let income = current.income;
      if (income === null) {
        guessed++;
        const d = current.desc.join(" ").toLowerCase();
        income = /\b(bijschrijving|ontvangen|storting|creditering|terugbetaling)\b/.test(d);
      }
      // Naam tegenpartij: de eerste cel als de regel uit meerdere kolommen bestaat,
      // of de eerste regel als de omschrijving over meerdere regels doorloopt
      const name = current.firstLineCells >= 2 || current.desc.length >= 2 ? current.desc[0] : "";
      const counterIban = normalizeIban(current.desc.join(" "));
      txs.push(makeTx(current.date, current.desc.join(" "), current.value, income ? "income" : "expense", {
        name: name.replace(/\b[A-Z]{2}\d{2}\s?[A-Z]{4}[\s\d]{10,16}\b/g, "").trim(),
        counter: counterIban,
      }));
    }
    current = null;
  };

  for (const line of lines) {
    const cs = cells(line);
    if (cs.length === 0) continue;
    const lower = cs.map((c) => c.str.toLowerCase());

    // Koptekst herkennen (en de kolomposities onthouden)
    if (isHeaderLine(lower)) {
      const next: Cols = {};
      cs.forEach((c, i) => {
        const s = lower[i];
        if (/saldo/.test(s)) next.saldo = center(c);
        else if (/(\baf\b|debet|debit|uitgave)/.test(s)) next.af = center(c);
        else if (/(\bbij\b|credit|inkomst|ontvangst)/.test(s)) next.bij = center(c);
        else if (/bedrag/.test(s)) next.bedrag = center(c);
      });
      if (next.af !== undefined || next.bij !== undefined || next.bedrag !== undefined) cols = next;
      headerSeenOnPage = line.page;
      flush();
      continue;
    }
    // Boven de kolomkop van deze pagina staat geen transactie
    if (anyHeader && headerPages.has(line.page) && headerSeenOnPage !== line.page) continue;
    // Pagina's vóór de eerste kolomkop (voorblad/samenvatting) overslaan
    if (anyHeader && headerSeenOnPage === 0) continue;

    const dateParts = parseDateParts(cs[0].str);
    const amounts = cs
      .map((c, i) => ({ c, i, a: parseAmountToken(c.str) }))
      .filter((x): x is { c: PdfTextItem; i: number; a: { value: number; sign: 1 | -1 | 0 } } => !!x.a);

    if (dateParts && amounts.length > 0 && !SKIP_LINE_RE.test(lower.join(" "))) {
      flush();
      const nearest = (x: number) => {
        const options: [string, number][] = (Object.entries(cols) as [string, number | undefined][])
          .filter((e): e is [string, number] => e[1] !== undefined);
        if (!options.length) return null;
        return options.reduce((best, cur) => (Math.abs(cur[1] - x) < Math.abs(best[1] - x) ? cur : best))[0];
      };
      // Kies het bedrag dat niet in de saldokolom staat
      const candidates = amounts.filter((x) => nearest(center(x.c)) !== "saldo");
      const pick = (candidates.length ? candidates : amounts)[0];
      const col = nearest(center(pick.c));
      let income: boolean | null = null;
      if (pick.a.sign !== 0) income = pick.a.sign > 0;
      // Los +/−-teken vlak voor het bedrag
      if (income === null && pick.i > 0 && /^[+\-−]$/.test(cs[pick.i - 1].str)) income = cs[pick.i - 1].str === "+";
      if (income === null && col === "af") income = false;
      if (income === null && col === "bij") income = true;
      // Losse "Af"/"Bij"-cel op de regel
      if (income === null) {
        if (lower.includes("bij") || lower.includes("cr")) income = true;
        else if (lower.includes("af") || lower.includes("db")) income = false;
      }
      const amountCells = new Set(amounts.map((x) => x.c));
      const descParts = cs
        .slice(1)
        .filter((c) => !amountCells.has(c) && !/^(af|bij|cr|db|d|c|[+\-−])$/i.test(c.str) && !parseDateParts(c.str));
      const date = resolveDate(dateParts);
      prevTime = toTime(+date.slice(0, 4), +date.slice(5, 7), +date.slice(8, 10));
      current = { date, desc: descParts.map((c) => c.str), value: pick.a.value, income, firstLineCells: descParts.length };
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
