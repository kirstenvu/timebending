import React, { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, ChevronDown, ChevronRight, Download, Search, Users, Wallet, Info } from "lucide-react";
import { Transaction, STANDARD_CATEGORIES } from "../types";
import { summarizeByCounterparty, CounterpartySummary } from "../utils/counterparty";

interface Props {
  transactions: Transaction[];
  groups: Record<string, string>;
  onAssignGroup: (key: string, category: string) => void;
}

type Direction = "all" | "in" | "out";
type SortKey = "amount" | "name" | "count";

const euro = (n: number, decimals = 0) =>
  `€${n.toLocaleString("nl-NL", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

const formatDate = (d: string) => {
  const [y, m, day] = d.split("-");
  return y && m && day ? `${day}-${m}-${y}` : d;
};

export default function CounterpartyView({ transactions, groups, onAssignGroup }: Props) {
  const [direction, setDirection] = useState<Direction>("all");
  const [sortKey, setSortKey] = useState<SortKey>("amount");
  const [search, setSearch] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [showOwn, setShowOwn] = useState(false);

  const summaries = useMemo(() => summarizeByCounterparty(transactions), [transactions]);
  const regular = summaries.filter(s => !s.ownAccount);
  const own = summaries.filter(s => s.ownAccount);

  const totals = useMemo(() => {
    const received = regular.reduce((a, s) => a + s.received, 0);
    const paid = regular.reduce((a, s) => a + s.paid, 0);
    const ownMoved = own.reduce((a, s) => a + s.received + s.paid, 0);
    const dates = transactions.map(t => t.date).filter(Boolean).sort();
    return { received, paid, net: received - paid, ownMoved, from: dates[0], to: dates[dates.length - 1] };
  }, [regular, own, transactions]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = regular.filter(s => {
      if (direction === "in" && s.received === 0) return false;
      if (direction === "out" && s.paid === 0) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        (s.iban || "").toLowerCase().includes(q) ||
        s.transactions.some(t => t.description.toLowerCase().includes(q))
      );
    });
    const volume = (s: CounterpartySummary) =>
      direction === "in" ? s.received : direction === "out" ? s.paid : s.received + s.paid;
    list = [...list].sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name, "nl");
      if (sortKey === "count") return b.count - a.count || volume(b) - volume(a);
      return volume(b) - volume(a);
    });
    return list;
  }, [regular, direction, sortKey, search]);

  const exportCsv = () => {
    const num = (n: number) => n.toFixed(2).replace(".", ",");
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const rows = [
      ["Tegenpartij", "Rekeningnummer", "Aantal", "Ontvangen", "Betaald", "Verschil", "Eerste", "Laatste", "Groep"].map(esc).join(";"),
      ...[...regular, ...own].map(s =>
        [
          esc(s.name),
          esc(s.iban || ""),
          String(s.count),
          num(s.received),
          num(s.paid),
          num(s.net),
          esc(formatDate(s.firstDate)),
          esc(formatDate(s.lastDate)),
          esc(s.ownAccount ? "Eigen rekening" : groups[s.key] || ""),
        ].join(";")
      ),
    ];
    // BOM + puntkomma's zodat Excel (Nederlandse instellingen) het direct goed opent
    const blob = new Blob(["﻿" + rows.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Geld_in_en_uit_per_tegenpartij.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderRow = (s: CounterpartySummary) => {
    const open = openKey === s.key;
    return (
      <React.Fragment key={s.key}>
        <tr
          className={`border-t border-slate-100 hover:bg-slate-50/70 cursor-pointer ${open ? "bg-slate-50" : ""}`}
          onClick={() => setOpenKey(open ? null : s.key)}
        >
          <td className="px-4 py-3">
            <div className="flex items-start gap-2">
              {open ? <ChevronDown className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />}
              <div className="min-w-0">
                <div className="font-semibold text-slate-800 text-sm break-words">{s.name}</div>
                {s.iban && <div className="text-[11px] text-slate-400 font-mono">{s.iban}</div>}
              </div>
            </div>
          </td>
          <td className="px-3 py-3 text-center text-xs text-slate-500 hidden sm:table-cell">{s.count}×</td>
          <td className={`px-3 py-3 text-right font-mono text-sm font-semibold sm:hidden ${s.net >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
            {s.net >= 0 ? "+" : "−"}{euro(Math.abs(s.net))}
            <div className="text-[10px] font-sans font-normal text-slate-400">{s.count}×</div>
          </td>
          <td className="px-3 py-3 text-right font-mono text-sm text-emerald-700 hidden sm:table-cell">{s.received ? euro(s.received) : <span className="text-slate-300">–</span>}</td>
          <td className="px-3 py-3 text-right font-mono text-sm text-rose-600 hidden sm:table-cell">{s.paid ? euro(s.paid) : <span className="text-slate-300">–</span>}</td>
          <td className={`px-3 py-3 text-right font-mono text-sm font-semibold hidden md:table-cell ${s.net >= 0 ? "text-slate-700" : "text-slate-500"}`}>
            {s.net >= 0 ? "+" : "−"}{euro(Math.abs(s.net))}
          </td>
          {!s.ownAccount && (
            <td className="px-3 py-3 hidden lg:table-cell" onClick={e => e.stopPropagation()}>
              <select
                value={groups[s.key] || ""}
                onChange={e => onAssignGroup(s.key, e.target.value)}
                className={`w-full text-xs rounded-lg border px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                  groups[s.key] ? "border-emerald-300 text-slate-800" : "border-slate-200 text-slate-400"
                }`}
              >
                <option value="">Geen groep</option>
                {STANDARD_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </td>
          )}
        </tr>
        {open && (
          <tr className="bg-slate-50">
            <td colSpan={7} className="px-4 pb-4 pt-1">
              <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {s.transactions.map(t => (
                  <div key={t.id} className="flex items-center gap-3 px-3 py-2 text-xs">
                    <span className="text-slate-400 font-mono w-20 shrink-0">{formatDate(t.date)}</span>
                    <span className="text-slate-600 flex-1 min-w-0 line-clamp-2 break-words" title={t.description}>{t.description}</span>
                    <span className={`font-mono shrink-0 ${t.type === "income" ? "text-emerald-700" : "text-rose-600"}`}>
                      {t.type === "income" ? "+" : "−"}{euro(t.amount, 2)}
                    </span>
                  </div>
                ))}
              </div>
              {/* Op kleine schermen staat de groepkeuze hier */}
              {!s.ownAccount && (
                <div className="lg:hidden mt-3 flex items-center gap-2">
                  <span className="text-xs text-slate-500 shrink-0">Groep (optioneel):</span>
                  <select
                    value={groups[s.key] || ""}
                    onChange={e => onAssignGroup(s.key, e.target.value)}
                    className="flex-1 text-xs rounded-lg border border-slate-200 px-2 py-1.5 bg-white"
                  >
                    <option value="">Geen groep</option>
                    {STANDARD_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* KOP */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 font-display text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Geld in &amp; uit
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Wie betaalt jou, en wie betaal jij? Direct uit je afschrift, zonder dat je iets hoeft in te delen.
            {totals.from && (
              <> Periode: <span className="font-medium text-slate-700">{formatDate(totals.from)}</span> t/m <span className="font-medium text-slate-700">{formatDate(totals.to)}</span>.</>
            )}
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs shrink-0"
          title="Download dit overzicht om te openen in Excel"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          Download voor Excel
        </button>
      </div>

      {/* TOTALEN */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" /> Kwam binnen
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">{euro(totals.received)}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">van {regular.filter(s => s.received > 0).length} partijen</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" /> Ging eruit
          </span>
          <div className="text-2xl font-bold font-mono text-rose-600 mt-1">{euro(totals.paid)}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">naar {regular.filter(s => s.paid > 0).length} partijen</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-slate-500" /> Verschil
          </span>
          <div className={`text-2xl font-bold font-mono mt-1 ${totals.net >= 0 ? "text-slate-800" : "text-rose-600"}`}>
            {totals.net >= 0 ? "+" : "−"}{euro(Math.abs(totals.net))}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {totals.ownMoved > 0 ? `Schuiven tussen je eigen rekeningen (${euro(totals.ownMoved)}) telt niet mee` : "Binnen min eruit"}
          </p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0 self-start">
          {([
            ["all", "Alles"],
            ["in", "Komt binnen"],
            ["out", "Gaat eruit"],
          ] as [Direction, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setDirection(key)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                direction === key ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Zoek op naam, rekeningnummer of omschrijving"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
        <select
          value={sortKey}
          onChange={e => setSortKey(e.target.value as SortKey)}
          className="text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-700 shrink-0"
        >
          <option value="amount">Grootste bedrag eerst</option>
          <option value="count">Vaakst eerst</option>
          <option value="name">Op naam (A-Z)</option>
        </select>
      </div>

      {/* TABEL */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Tegenpartij</th>
                <th className="px-3 py-2.5 font-semibold text-center hidden sm:table-cell">Keer</th>
                <th className="px-3 py-2.5 font-semibold text-right sm:hidden">Saldo</th>
                <th className="px-3 py-2.5 font-semibold text-right hidden sm:table-cell">Ontvangen</th>
                <th className="px-3 py-2.5 font-semibold text-right hidden sm:table-cell">Betaald</th>
                <th className="px-3 py-2.5 font-semibold text-right hidden md:table-cell">Verschil</th>
                <th className="px-3 py-2.5 font-semibold hidden lg:table-cell w-52">Groep <span className="normal-case font-normal text-slate-400">(hoeft niet)</span></th>
              </tr>
            </thead>
            <tbody>
              {visible.map(renderRow)}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">Niets gevonden.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EIGEN REKENINGEN */}
      {own.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <button
            onClick={() => setShowOwn(!showOwn)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              {showOwn ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              Tussen je eigen rekeningen ({own.length})
            </span>
            <span className="text-xs text-slate-400">telt niet mee in binnen en eruit</span>
          </button>
          {showOwn && (
            <table className="w-full text-left">
              <tbody>
                {own.map(renderRow)}
              </tbody>
            </table>
          )}
        </div>
      )}

      <p className="text-xs text-slate-500 flex items-start gap-2 max-w-3xl">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        Klik op een naam om de losse boekingen te zien. Een groep kiezen is niet nodig. Doe je het wel, dan geldt het voor alle
        boekingen van die partij, ook bij een volgende upload, en gebruikt de app het voor het jaaroverzicht en de begroting.
      </p>
    </div>
  );
}
