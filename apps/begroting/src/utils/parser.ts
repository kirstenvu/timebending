import { Transaction } from "../types";

// Generate a random ID
function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

// Clean and parse monetary amount from string (e.g. "1.250,50" or "-15,40" or "400.00")
function cleanAmount(val: string): number {
  if (!val) return 0;
  // Replace comma decimal with dot if there's a comma
  let clean = val.trim();
  // If there's a comma and a dot, e.g. "1.250,50", remove dot and replace comma with dot
  if (clean.includes(",") && clean.includes(".")) {
    if (clean.indexOf(".") < clean.indexOf(",")) {
      // Dutch/European format: "1.250,50" -> "1250.50"
      clean = clean.replace(/\./g, "").replace(",", ".");
    } else {
      // US format: "1,250.50" -> "1250.50"
      clean = clean.replace(/,/g, "");
    }
  } else if (clean.includes(",")) {
    // Single separator comma, e.g. "24,50" -> "24.50" or "1250,00" -> "1250.00"
    // Unless it's thousands separator like "1,250" with no dot - but usually bank exports use comma for decimals in NL
    clean = clean.replace(",", ".");
  }
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : Math.abs(parsed);
}

// Parse custom formats or CSV lines
export function parseBankStatementCSV(content: string, filename: string): Transaction[] {
  const lines = content.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const transactions: Transaction[] = [];

  // Try to parse headers
  const firstLine = lines[0];
  const isCSV = firstLine.includes(",") || firstLine.includes(";") || firstLine.includes("\t");

  if (!isCSV) {
    return parseRawUnstructuredText(content);
  }

  // Detect delimiter
  let delimiter = ",";
  if (firstLine.includes(";")) delimiter = ";";
  else if (firstLine.includes("\t")) delimiter = "\t";

  // Split helper supporting quotes
  const splitCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = splitCSVLine(firstLine).map(h => h.toLowerCase().replace(/["']/g, ""));

  // Check common Dutch formats
  // 1. ING: "Datum","Naam / Omschrijving","Rekening","Tegenrekening","Code","Af Bij","Bedrag (EUR)","MutatieSoort","Mededelingen"
  const isING = headers.includes("af bij") && (headers.includes("bedrag (eur)") || headers.includes("bedrag"));
  // 2. Rabobank: "IBAN/BBAN","Munt","Datum","Rentedatum","Bedrag","Tegenrekening","Naam tegenpartij","Code","Omschrijving"
  const isRabo = headers.includes("naam tegenpartij") && headers.includes("omschrijving") && headers.includes("bedrag");
  // 3. ABN AMRO: Headers are often: "rekeningnummer", "munt", "transactiedatum", "rentebedrag", "beginsaldo", "eindsaldo", "boekdatum", "bedrag", "omschrijving"
  const isABN = headers.includes("transactiedatum") && headers.includes("bedrag") && headers.includes("omschrijving");

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]).map(c => c.replace(/["']/g, ""));
    if (cols.length < 3) continue;

    try {
      let date = "";
      let description = "";
      let amount = 0;
      let type: "income" | "expense" = "expense";

      if (isING) {
        const dateIdx = headers.indexOf("datum");
        const nameIdx = headers.indexOf("naam / omschrijving");
        const afBijIdx = headers.indexOf("af bij");
        const amountIdx = headers.indexOf("bedrag (eur)") !== -1 ? headers.indexOf("bedrag (eur)") : headers.indexOf("bedrag");
        const descIdx = headers.indexOf("mededelingen");

        date = cols[dateIdx] || "";
        const name = cols[nameIdx] || "";
        const memo = cols[descIdx] || "";
        description = name + (memo ? ` - ${memo}` : "");
        amount = cleanAmount(cols[amountIdx]);
        
        const direction = (cols[afBijIdx] || "").toLowerCase();
        type = direction === "bij" || direction === "b" || direction === "credit" ? "income" : "expense";
      } 
      else if (isRabo) {
        const dateIdx = headers.indexOf("datum");
        const nameIdx = headers.indexOf("naam tegenpartij");
        const amountIdx = headers.indexOf("bedrag");
        const descIdx = headers.indexOf("omschrijving");

        date = cols[dateIdx] || "";
        const name = cols[nameIdx] || "";
        const memo = cols[descIdx] || "";
        description = name + (memo ? ` - ${memo}` : "");
        
        const rawAmountStr = cols[amountIdx] || "0";
        amount = cleanAmount(rawAmountStr);
        // Rabo uses positive/negative or debit/credit. If negative amount or signed negative, it's expense
        type = rawAmountStr.startsWith("-") ? "expense" : "income";
      }
      else if (isABN) {
        const dateIdx = headers.indexOf("transactiedatum");
        const amountIdx = headers.indexOf("bedrag");
        const descIdx = headers.indexOf("omschrijving");

        date = cols[dateIdx] || "";
        description = cols[descIdx] || "";
        const rawAmountStr = cols[amountIdx] || "0";
        amount = cleanAmount(rawAmountStr);
        type = rawAmountStr.startsWith("-") ? "expense" : "income";
      }
      else {
        // Generic CSV mapping based on closest headers
        const dateIdx = headers.findIndex(h => h.includes("dat") || h.includes("dag") || h.includes("date"));
        const descIdx = headers.findIndex(h => h.includes("omschr") || h.includes("desc") || h.includes("mededel") || h.includes("naam") || h.includes("memo") || h.includes("counterparty"));
        const amountIdx = headers.findIndex(h => h.includes("bedrag") || h.includes("amount") || h.includes("val") || h.includes("eur") || h.includes("som"));
        const typeIdx = headers.findIndex(h => h.includes("type") || h.includes("af bij") || h.includes("af/bij") || h.includes("credit") || h.includes("debet"));

        date = dateIdx !== -1 ? cols[dateIdx] : "";
        description = descIdx !== -1 ? cols[descIdx] : cols.slice(0, 3).join(" ");
        
        const rawAmountStr = amountIdx !== -1 ? cols[amountIdx] : "0";
        amount = cleanAmount(rawAmountStr);

        if (typeIdx !== -1) {
          const typeVal = cols[typeIdx].toLowerCase();
          type = typeVal.includes("bij") || typeVal.includes("credit") || typeVal.includes("in") || typeVal.includes("+") ? "income" : "expense";
        } else {
          // Fallback to +/- sign
          type = rawAmountStr.startsWith("-") ? "expense" : "income";
        }
      }

      // Convert date standardizer (DD-MM-YYYY or similar to YYYY-MM-DD if possible)
      date = standardizeDate(date);

      if (description.trim() && amount > 0) {
        transactions.push({
          id: generateId(),
          date,
          description: description.substring(0, 200),
          amount,
          type,
          category: "Niet gecategoriseerd"
        });
      }
    } catch (err) {
      console.warn("Fout bij parsen van CSV regel:", lines[i], err);
    }
  }

  // If we parsed headers but found nothing, fallback to raw parsing
  if (transactions.length === 0) {
    return parseRawUnstructuredText(content);
  }

  return transactions;
}

// Intelligent fallback parser for unstructured text (like a copy-pasted bank list or bank overview)
export function parseRawUnstructuredText(content: string): Transaction[] {
  const lines = content.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const transactions: Transaction[] = [];

  // Dutch date formats regex: e.g. "10-02-2025", "10/02/2025", "10 feb 2025", "2025-02-10"
  const dateRegex = /(\b\d{1,2}[-/\s](?:\d{1,2}|jan|feb|mrt|apr|mei|jun|jul|aug|sep|okt|nov|dec)[-/\s]\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b)/i;
  
  // Money regex: match positive/negative numbers with commas/dots like -15,50, € 1.250,00, 45.00
  const moneyRegex = /(?:[€$]\s*)?(-?\b\d{1,3}(?:\.\d{3})*(?:,\d{2})\b|-?\b\d+(?:[.,]\d{2})?\b)/;

  for (const line of lines) {
    // Skip header lines
    if (line.toLowerCase().includes("datum") && line.toLowerCase().includes("bedrag")) continue;

    const dateMatch = line.match(dateRegex);
    if (!dateMatch) continue;

    const remainingText = line.replace(dateMatch[0], "");
    const moneyMatch = remainingText.match(moneyRegex);
    if (!moneyMatch) continue;

    const dateStr = standardizeDate(dateMatch[0]);
    const amountStr = moneyMatch[1];
    const amount = cleanAmount(amountStr);
    
    // Determine type based on +/- signs or keyword
    let type: "income" | "expense" = "expense";
    if (amountStr.startsWith("+") || line.toLowerCase().includes(" bij ") || line.toLowerCase().includes("bijschrijving") || line.toLowerCase().includes("ontvangen")) {
      type = "income";
    } else if (amountStr.startsWith("-") || line.toLowerCase().includes(" af ") || line.toLowerCase().includes("afschrijving") || line.toLowerCase().includes("betaald")) {
      type = "expense";
    } else {
      // Guess based on description keywords
      const lowerLine = line.toLowerCase();
      const incomeKeywords = ["omzet", "factuur", "invoice", "payment from", "betaling van", "teruggaaf", "salaris", "storting"];
      if (incomeKeywords.some(kw => lowerLine.includes(kw))) {
        type = "income";
      }
    }

    // The description is the text with date and money removed
    let description = remainingText.replace(moneyMatch[0], "").replace(/[€\s\-\+;,]+/g, " ").trim();
    if (!description) {
      description = "Banktransactie";
    }

    if (amount > 0) {
      transactions.push({
        id: generateId(),
        date: dateStr,
        description: description,
        amount,
        type,
        category: "Niet gecategoriseerd"
      });
    }
  }

  return transactions;
}

// Convert arbitrary dates into standard Dutch string format YYYY-MM-DD
function standardizeDate(rawDate: string): string {
  let dateStr = rawDate.trim().replace(/["']/g, "");
  if (!dateStr) return new Date().toISOString().split("T")[0];

  // If already in YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Handle DD-MM-YYYY or DD/MM/YYYY
  const parts = dateStr.split(/[-/]/);
  if (parts.length === 3) {
    // Check if YYYY is first or last
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
    } else if (parts[2].length === 4) {
      // DD-MM-YYYY -> YYYY-MM-DD
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    } else if (parts[2].length === 2) {
      // DD-MM-YY -> YYYY-MM-DD (assuming 20xx)
      return `20${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
  }

  // Dutch text months support: "15 feb 2025" or "10 februari 2025"
  const months: Record<string, string> = {
    jan: "01", janari: "01",
    feb: "02", februari: "02",
    mrt: "03", maart: "03",
    apr: "04", april: "04",
    mei: "05",
    jun: "06", juni: "06",
    jul: "07", juli: "07",
    aug: "08", augustus: "08",
    sep: "09", september: "09",
    okt: "10", oktober: "10",
    nov: "11", november: "11",
    dec: "12", december: "12"
  };

  const textParts = dateStr.toLowerCase().split(/[\s,]+/);
  if (textParts.length === 3) {
    const day = textParts[0].padStart(2, "0");
    const monthWord = textParts[1].substring(0, 3);
    const month = months[monthWord] || "01";
    let year = textParts[2];
    if (year.length === 2) year = `20${year}`;
    if (/^\d{2}$/.test(day) && /^\d{4}$/.test(year)) {
      return `${year}-${month}-${day}`;
    }
  }

  // Fallback to standard JS parse
  try {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }
  } catch (e) {}

  return new Date().toISOString().split("T")[0];
}
