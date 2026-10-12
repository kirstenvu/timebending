import { readFileSync } from "fs";
import { detectFormat, parseCamt053, parseMT940, decodeText, groupIntoLines, parsePdfLines } from "../src/utils/bankFormats";
import { parseBankStatementCSV } from "../src/utils/parser";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

const dir = process.argv[2];
const show = (name: string, fmt: string, txs: any[], w: string[] = []) => {
  console.log(`\n== ${name}  [${fmt}]  ${txs.length} transacties`);
  for (const t of txs) console.log(`  ${t.date}  ${t.type === "income" ? "+" : "-"}${t.amount.toFixed(2).padStart(9)}  ${t.description}`);
  w.forEach(x => console.log("  ! " + x));
};
async function pdf(file: string) {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(readFileSync(file)) }).promise;
  const pages = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const c = await (await doc.getPage(p)).getTextContent();
    pages.push((c.items as any[]).filter(i => typeof i.str === "string").map(i => ({ str: i.str, x: i.transform[4], y: i.transform[5], width: i.width })));
  }
  return parsePdfLines(groupIntoLines(pages));
}
(async () => {
  for (const f of process.argv.slice(3)) {
    const bytes = new Uint8Array(readFileSync(`${dir}/${f}`));
    const fmt = detectFormat(bytes, f);
    if (fmt === "camt053") show(f, fmt, parseCamt053(decodeText(bytes)));
    else if (fmt === "mt940") show(f, fmt, parseMT940(decodeText(bytes)));
    else if (fmt === "csv") show(f, fmt, parseBankStatementCSV(decodeText(bytes), f));
    else if (fmt === "pdf") { const r = await pdf(`${dir}/${f}`); show(f, fmt, r.transactions, r.warnings); }
    else console.log(`\n== ${f} [${fmt}] -> geweigerd`);
  }
})();
