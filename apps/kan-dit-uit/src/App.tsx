import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Plus, 
  Trash2, 
  Sliders, 
  Printer, 
  RotateCcw,
  Globe,
  Home,
  Building,
  Target,
  Euro,
  Lightbulb,
  Clock,
  ArrowRight
} from 'lucide-react';

interface FreeCostItem {
  id: string;
  name: string;
  amount: number;
}

export default function App() {
  // 1. Het Creatieve Idee
  const [ideaTitle, setIdeaTitle] = useState('Creatieve Inspiratiesessie');
  const [eventType, setEventType] = useState<'online' | 'own_location' | 'rented_location'>('own_location');
  
  // 2. Prijs & Deelnemers
  const [ticketPrice, setTicketPrice] = useState<number>(65);
  const [priceType, setPriceType] = useState<'incl' | 'excl'>('incl'); // Particulier (incl) vs Zakelijk (excl)
  const [vatRate, setVatRate] = useState<number>(21);
  const [isKor, setIsKor] = useState<boolean>(false);
  const [participants, setParticipants] = useState<number>(10);

  // 3. Ureninvestering (voorbereiding + het echte doen)
  const [prepHours, setPrepHours] = useState<number>(4); // Voorbereiding, inkopen, appjes, afstemmen
  const [eventHours, setEventHours] = useState<number>(4); // Uren tijdens het geven / de sessie zelf
  const totalHours = Math.max(0.5, prepHours + eventHours);

  // 4. Gewenste beloning (Optioneel fair uurtarief)
  const [targetHourlyRate, setTargetHourlyRate] = useState<number | ''>(''); // Mag open gelaten worden!

  // 5. Vrije kostenlijst (helemaal vrij in te vullen!)
  const [costs, setCosts] = useState<FreeCostItem[]>([
    { id: '1', name: 'Materialen & werkboeken', amount: 80 },
    { id: '2', name: 'Koffie, thee & lekkers', amount: 35 },
  ]);

  // Snelle toevoeging invoerveld
  const [newCostName, setNewCostName] = useState('');
  const [newCostAmount, setNewCostAmount] = useState<number | ''>('');

  // ==================== BEREKENINGEN ====================
  // Omzet berekenen
  const isVatLiable = !isKor && vatRate > 0;
  let priceExclVat = ticketPrice;
  let vatPerTicket = 0;

  if (priceType === 'incl') {
    if (isVatLiable) {
      priceExclVat = ticketPrice / (1 + vatRate / 100);
      vatPerTicket = ticketPrice - priceExclVat;
    } else {
      priceExclVat = ticketPrice;
      vatPerTicket = 0;
    }
  } else {
    priceExclVat = ticketPrice;
    if (isVatLiable) {
      vatPerTicket = ticketPrice * (vatRate / 100);
    } else {
      vatPerTicket = 0;
    }
  }

  const totalInflow = ticketPrice * participants; // Wat klanten in totaal overmaken
  const totalRevenueExclVat = priceExclVat * participants; // Netto omzet
  const totalVatToPay = vatPerTicket * participants; // Naar de belastingdienst

  // Totale geplande kosten
  const totalPlannedCosts = costs.reduce((sum, item) => sum + (Number.isFinite(item.amount) ? item.amount : 0), 0);

  // Werkelijke Winst & Uurloon met geplande kosten
  const actualNetProfit = totalRevenueExclVat - totalPlannedCosts;
  const actualHourlyRate = totalHours > 0 ? actualNetProfit / totalHours : 0;

  // HET UITGAVENBUDGET (Omgekeerde Berekening!)
  const hasTargetRate = typeof targetHourlyRate === 'number' && targetHourlyRate > 0;
  const budgetHourlyBaseline = hasTargetRate ? targetHourlyRate : 50;
  const desiredProfit = budgetHourlyBaseline * totalHours;
  const maxCostBudget = Math.max(0, totalRevenueExclVat - desiredProfit);
  const costBudgetRemaining = maxCostBudget - totalPlannedCosts;

  // "KAN DIT UIT?" Oordeel
  let status: 'go' | 'warning' | 'nogo' = 'go';
  let statusMessage = '';
  let statusDetail = '';

  if (actualHourlyRate < 12 || actualNetProfit <= 0) {
    status = 'nogo';
    statusMessage = 'NEE, DIT KAN ZO NIET UIT';
    statusDetail = actualNetProfit <= 0 
      ? 'Je draait verlies. Je kosten zijn hoger dan je netto omzet!'
      : `Je verdient hiermee slechts € ${actualHourlyRate.toFixed(2)} per uur. Dit kost je veel energie voor te weinig resultaat.`;
  } else if (hasTargetRate && actualHourlyRate < targetHourlyRate) {
    status = 'warning';
    statusMessage = 'PAS OP: ONDER JE DOEL';
    statusDetail = `Je verdient € ${actualHourlyRate.toFixed(2)} per uur (onder je streefbeloning van € ${targetHourlyRate}/u). Kijk of je kosten kunt verlagen of de prijs kunt verhogen.`;
  } else if (!hasTargetRate && actualHourlyRate < 30) {
    status = 'warning';
    statusMessage = 'PAS OP: KRAPPE MARGE';
    statusDetail = `Je verdient € ${actualHourlyRate.toFixed(2)} per uur. Dat kan leuk zijn als hobby, maar is krap als volwaardig ondernemersinkomen.`;
  } else {
    status = 'go';
    statusMessage = 'JA, DIT KAN ZEKER UIT!';
    statusDetail = `Je houdt netto € ${Math.round(actualNetProfit)} winst over en verdient een mooie € ${actualHourlyRate.toFixed(2)} per uur voor al je ${totalHours} uur werk.`;
  }

  // Handlers voor vrije kosten
  const handleAddCost = () => {
    if (!newCostName.trim() || !newCostAmount) return;
    setCosts([
      ...costs,
      {
        id: `cost-${Date.now()}`,
        name: newCostName.trim(),
        amount: Number(newCostAmount),
      },
    ]);
    setNewCostName('');
    setNewCostAmount('');
  };

  const handleRemoveCost = (id: string) => {
    setCosts(costs.filter(c => c.id !== id));
  };

  const updateCostItemAmount = (id: string, amount: number) => {
    setCosts(costs.map(c => c.id === id ? { ...c, amount: Math.max(0, amount) } : c));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              ⚡
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 leading-tight block">
                Kan Dit Uit?
              </span>
              <span className="text-xs text-slate-400">
                Snelle haalbaarheidscheck voor nieuwe plannen & events
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIdeaTitle('Nieuw Idee');
                setTicketPrice(50);
                setParticipants(6);
                setCosts([]);
                setPrepHours(2);
                setEventHours(4);
              }}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Schone lei
            </button>
            <button
              onClick={() => window.print()}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Afdrukken</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">

        {/* ================= HET DIRECTE "KAN DIT UIT?" OORDEEL ================= */}
        <div className={`rounded-2xl p-5 sm:p-6 border-2 transition-all shadow-sm ${
          status === 'go' 
            ? 'bg-emerald-50/60 border-emerald-400' 
            : status === 'warning' 
            ? 'bg-amber-50/60 border-amber-300' 
            : 'bg-rose-50/70 border-rose-400'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Status & Uurloon */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {status === 'go' && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
                {status === 'warning' && <AlertTriangle className="w-6 h-6 text-amber-600" />}
                {status === 'nogo' && <XCircle className="w-6 h-6 text-rose-600" />}
                <span className={`text-base font-extrabold uppercase tracking-wide ${
                  status === 'go' ? 'text-emerald-800' : status === 'warning' ? 'text-amber-800' : 'text-rose-700'
                }`}>
                  {statusMessage}
                </span>
              </div>

              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-slate-900">
                  € {actualHourlyRate > 0 ? actualHourlyRate.toFixed(2) : '0,00'}
                </span>
                <span className="text-sm font-semibold text-slate-600">
                  / uur verdiend
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ({totalHours} uur werk)
                </span>
              </div>

              <p className="text-xs text-slate-600 max-w-xl pt-0.5 leading-relaxed">
                {statusDetail}
              </p>
            </div>

            {/* De 2 Grote Antwoorden: Vrij Te Besteden Budget vs Jouw Winst */}
            <div className="grid grid-cols-2 gap-3 border-t md:border-t-0 md:border-l border-slate-200/80 pt-3 md:pt-0 md:pl-6 text-xs shrink-0">
              
              {/* Uitgavenbudget */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-slate-500 block text-[11px] font-medium">
                  Wat mag je maximaal uitgeven?
                </span>
                <strong className="text-xl font-mono text-blue-700 block mt-0.5">
                  € {Math.round(maxCostBudget)}
                </strong>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  om {hasTargetRate ? `€${targetHourlyRate}` : `€${Math.round(budgetHourlyBaseline)}`}/u over te houden
                </span>
              </div>

              {/* Jouw Winst */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-slate-500 block text-[11px] font-medium">
                  Wat hou je netto over?
                </span>
                <strong className={`text-xl font-mono block mt-0.5 ${actualNetProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  € {Math.round(actualNetProfit)}
                </strong>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  vóór inkomstenbelasting
                </span>
              </div>

            </div>

          </div>

          {/* Waarschuwing als geplande kosten het budget overschrijden */}
          {totalPlannedCosts > maxCostBudget && (
            <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                <strong>Let op:</strong> Je geplande kosten (€{totalPlannedCosts}) zijn <strong>€{Math.round(totalPlannedCosts - maxCostBudget)} hoger</strong> dan je budget. Hierdoor verdien je minder dan {hasTargetRate ? `€${targetHourlyRate}` : `€${Math.round(budgetHourlyBaseline)}`} per uur.
              </span>
            </div>
          )}
        </div>

        {/* ================= 2 KOLOMMEN: INVOER & FLEXIBEL BUDGET ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LINKER KOLOM: JOUW IDEE (7 kolommen) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* BLOK 1: HET IDEE & DE VORM */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  1. Jouw Idee
                </span>
                <input
                  type="text"
                  value={ideaTitle}
                  onChange={(e) => setIdeaTitle(e.target.value)}
                  placeholder="Bijv. Workshop, Masterclass, Traject, Training..."
                  className="w-full px-3 py-2 text-base font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                />
              </div>

              {/* Snelle Format Keuze (Online vs Eigen Locatie vs Gehuurd) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Wat voor soort activiteit is het?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEventType('online');
                      // Bij online: optioneel lege of minimale kosten
                      setCosts([{ id: 'c-soft', name: 'Software / Zoom / Licentie', amount: 15 }]);
                    }}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      eventType === 'online'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>Online / Digitaal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEventType('own_location');
                      setCosts([
                        { id: 'c-mat', name: 'Materialen / Spullen', amount: 50 },
                        { id: 'c-koffie', name: 'Koffie, thee & lekkers', amount: 25 },
                      ]);
                    }}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      eventType === 'own_location'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    <span>Eigen ruimte</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEventType('rented_location');
                      setCosts([
                        { id: 'c-loc', name: 'Locatie- / Zaalhuur', amount: 250 },
                        { id: 'c-lunch', name: 'Lunch & catering', amount: 150 },
                      ]);
                    }}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      eventType === 'rented_location'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    <span>Externe locatie</span>
                  </button>
                </div>
              </div>

              {/* Ticketprijs & Deelnemers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Prijs per ticket / klant
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {priceType === 'incl' ? 'inclusief btw' : 'exclusief btw'}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold text-sm">€</span>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={ticketPrice || ''}
                      onChange={(e) => setTicketPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full pl-8 pr-3 py-2 text-sm font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Aantal deelnemers / verkopen
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={participants || ''}
                      onChange={(e) => setParticipants(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 text-sm font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-900"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">personen</span>
                  </div>
                </div>
              </div>

              {/* Ureninvestering: Voorbereiding vs Het Echte Doen */}
              <div className="pt-2 border-t border-slate-150 space-y-3">
                <span className="text-xs font-bold text-slate-800 block">
                  Hoeveel uren ben je er echt mee bezig?
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      1. Uren voorbereiding
                    </label>
                    <p className="text-[10px] text-slate-500 mb-1.5 leading-tight">
                      Plannen, inkopen, appjes, afstemmen.
                    </p>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={prepHours || ''}
                        onChange={(e) => setPrepHours(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg text-slate-900"
                      />
                      <span className="absolute right-3 top-1.5 text-xs text-slate-400 font-medium">uur</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      2. Uren tijdens het geven
                    </label>
                    <p className="text-[10px] text-slate-500 mb-1.5 leading-tight">
                      Het echte doen (de workshop of dag zelf).
                    </p>
                    <div className="relative">
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={eventHours || ''}
                        onChange={(e) => setEventHours(Math.max(0.5, parseFloat(e.target.value) || 0))}
                        className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg text-slate-900"
                      />
                      <span className="absolute right-3 top-1.5 text-xs text-slate-400 font-medium">uur</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                  <span>Totale uren ({prepHours}u voorbereiding + {eventHours}u geven):</span>
                  <strong className="font-mono text-slate-900 font-bold">{totalHours} uur werk</strong>
                </div>

                {/* Optioneel Fair Uurtarief */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Wat vind jij een faire beloning per uur? <span className="font-normal text-slate-400">(Optioneel)</span>
                    </label>
                    {hasTargetRate && (
                      <button
                        type="button"
                        onClick={() => setTargetHourlyRate('')}
                        className="text-[10px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                      >
                        Wissen / open laten
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold text-sm">€</span>
                    <input
                      type="number"
                      min="10"
                      step="5"
                      value={targetHourlyRate}
                      placeholder={actualHourlyRate > 0 ? `Bv. € ${Math.round(actualHourlyRate)} (huidig berekend)` : 'Bv. € 50'}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value));
                        setTargetHourlyRate(val);
                      }}
                      className="w-full pl-8 pr-12 py-2 text-sm font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">/ uur</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {hasTargetRate
                      ? `We berekenen je uitgavenbudget op basis van jouw € ${targetHourlyRate}/u.`
                      : `Je mag dit open laten. In het lichtgrijs zie je je huidige berekende uurloon (${actualHourlyRate > 0 ? `€ ${Math.round(actualHourlyRate)}/u` : '€ 50/u'}).`}
                  </span>
                </div>
              </div>

              {/* Btw toggle & KOR */}
              <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Prijs is:</span>
                  <button
                    type="button"
                    onClick={() => setPriceType(priceType === 'incl' ? 'excl' : 'incl')}
                    className="font-semibold text-slate-900 underline cursor-pointer"
                  >
                    {priceType === 'incl' ? 'Inclusief BTW (Particulieren)' : 'Exclusief BTW (Bedrijven)'}
                  </button>
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isKor}
                    onChange={(e) => setIsKor(e.target.checked)}
                    className="rounded text-emerald-600 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>KOR (geen btw)</span>
                </label>
              </div>

            </div>

            {/* BLOK 2: VRIJE KOSTEN INVOEREN (VRIJ & FLEXIBEL) */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    2. Jouw Kosten (Vrij In Te Vullen)
                  </span>
                  <p className="text-xs text-slate-500">
                    Typ gewoon in wat je van plan bent uit te geven. Heb je geen kosten? Laat het gerust leeg!
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                  Totaal: € {totalPlannedCosts}
                </span>
              </div>

              {/* Nieuwe kostenpost toevoegen (super snel) */}
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="text"
                  placeholder="Wat geef je uit? (bv. Lunch, Zoom, Knutselspullen)"
                  value={newCostName}
                  onChange={(e) => setNewCostName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCost()}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />

                <div className="relative w-28">
                  <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">€</span>
                  <input
                    type="number"
                    placeholder="Bedrag"
                    min="0"
                    step="any"
                    value={newCostAmount}
                    onChange={(e) => setNewCostAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCost()}
                    className="w-full pl-6 pr-2 py-1.5 text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddCost}
                  disabled={!newCostName.trim() || !newCostAmount}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
                >
                  + Toevoegen
                </button>
              </div>

              {/* Bestaande kostenlijst */}
              {costs.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {costs.map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between gap-3 px-3 py-2 bg-slate-50 hover:bg-slate-100/70 rounded-lg border border-slate-200 transition-colors"
                    >
                      <span className="text-xs font-medium text-slate-800 flex-1">
                        {item.name}
                      </span>

                      <div className="flex items-center gap-2">
                        <div className="relative w-24">
                          <span className="absolute left-2 top-1 text-xs text-slate-400 font-bold">€</span>
                          <input
                            type="number"
                            value={item.amount || ''}
                            onChange={(e) => updateCostItemAmount(item.id, parseFloat(e.target.value) || 0)}
                            className="w-full pl-5 pr-2 py-0.5 text-xs font-mono font-bold bg-white border border-slate-200 rounded-md text-right text-slate-900"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveCost(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Wissen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-2">
                  Nog geen kosten ingevoerd.
                </p>
              )}

            </div>

          </div>

          {/* RECHTER KOLOM: HET VRIJE BUDGET & DE GELDVERDELING (5 kolommen) */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-20">
            
            {/* HET VRIJE UITGAVENBUDGET (Omgekeerd Inzicht) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Jouw Vrije Uitgavenbudget
                </span>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  Hoeveel mag je maximaal uitgeven aan dit idee?
                </h3>
              </div>

              {/* De Budget Meter */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-600">Maximaal budget:</span>
                  <span className="font-mono text-base font-extrabold text-blue-700">
                    € {Math.round(maxCostBudget)}
                  </span>
                </div>

                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-600">Jouw geplande kosten:</span>
                  <span className="font-mono font-bold text-slate-800">
                    € {Math.round(totalPlannedCosts)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-xs font-semibold">
                  <span>Nog over in budget:</span>
                  <span className={`font-mono text-base font-extrabold ${
                    costBudgetRemaining >= 0 ? 'text-emerald-700' : 'text-rose-600'
                  }`}>
                    {costBudgetRemaining >= 0 ? `€ ${Math.round(costBudgetRemaining)} over` : `€ ${Math.round(Math.abs(costBudgetRemaining))} tekort!`}
                  </span>
                </div>

                {/* Voortgangsbalkje */}
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 rounded-full ${
                      costBudgetRemaining >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ 
                      width: maxCostBudget > 0 ? `${Math.min(100, (totalPlannedCosts / maxCostBudget) * 100)}%` : '100%' 
                    }}
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-500 leading-relaxed">
                💡 <strong>Zo werkt het:</strong> Bij {participants} deelnemers van €{ticketPrice} komt er netto €{Math.round(totalRevenueExclVat)} binnen. Als je jezelf {hasTargetRate ? `€${targetHourlyRate}` : `€${Math.round(budgetHourlyBaseline)}`}/uur gunt voor {totalHours} uur werk ({prepHours}u voorbereiding + {eventHours}u geven), mag je maximaal <strong>€{Math.round(maxCostBudget)}</strong> uitgeven aan spullen, lunch of zaal.
              </div>
            </div>

            {/* WAAR GAAT ELKE EURO NAARTOE? (EENVOUDIG OVERZICHT) */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
              <span className="font-bold text-slate-900 block">
                Waar gaat het geld naartoe?
              </span>

              <div className="space-y-2 text-slate-600">
                <div className="flex justify-between">
                  <span>Totale klantbetalingen:</span>
                  <strong className="font-mono text-slate-900">€ {Math.round(totalInflow)}</strong>
                </div>

                {!isKor && isVatLiable && (
                  <div className="flex justify-between text-blue-700">
                    <span>- BTW (voor de Belastingdienst):</span>
                    <strong className="font-mono">- € {Math.round(totalVatToPay)}</strong>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>- Totale kosten die je maakt:</span>
                  <strong className="font-mono">- € {Math.round(totalPlannedCosts)}</strong>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-emerald-700 text-sm">
                  <span>= Jouw Echte Winst:</span>
                  <span className="font-mono">€ {Math.round(actualNetProfit)}</span>
                </div>
              </div>

              {!isKor && totalVatToPay > 0 && (
                <div className="p-2.5 bg-blue-50 rounded-lg text-[11px] text-blue-900 mt-2">
                  📌 <strong>BTW-tip:</strong> Zet direct <strong>€ {Math.round(totalVatToPay)}</strong> op je spaarrekening. Dat bedrag is van de fiscus en moet je bij de kwartaalaangifte afdragen.
                </div>
              )}
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
