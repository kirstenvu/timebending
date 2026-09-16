import { Transaction, BudgetPlanning, BudgetCategory, STANDARD_CATEGORIES } from "../types";

export interface BudgetForecastOptions {
  revenueGrowthPct?: number; // e.g. +5%
  inflationPct?: number; // e.g. +3%
  sector?: string;
  categoryAdjustments?: Record<string, number>; // custom per-category percentage overrides
}

const SECTOR_BENCHMARKS: Record<string, {
  advice: string[];
  categoryTips: Record<string, string>;
  categoryJustifications: Record<string, string>;
}> = {
  dienstverlening: {
    advice: [
      "Verhoog uurtarieven jaarlijks: Indexeer je tarieven aan het begin van elk jaar met minimaal 3-5% om inflatie en hogere kosten direct te compenseren.",
      "Beperk software-licenties: Voer elk kwartaal een abonnements-audit uit. Ongebruikte SaaS-tools kosten een gemiddelde ZZP'er €50-€150 per maand.",
      "Zet 30% direct apart: Sluis bij elke betaalde factuur direct 21% BTW en circa 25-30% inkomstenbelasting door naar een aparte spaarrekening."
    ],
    categoryTips: {
      "Inkomsten (Omzet)": "Focus op retainers of vaste maandcontracten voor stabielere en voorspelbaardere inkomstenstromen.",
      "Huisvesting": "Overweeg hybride werken of flexplekken als vaste kantoorhuur te zwaar op je marge drukt.",
      "Kantoor & IT": "Zet maandelijkse software-abonnementen (Microsoft, Adobe) om naar jaarcontracten voor 10-15% korting.",
      "Marketing & Verkoop": "Meet je conversie per advertentiekanaal en schrap kanalen die geen rendabele leads opleveren.",
      "Personeel & Inhuur": "Huur specialistische freelancers alleen projectmatig in en koppel hun kosten direct aan klantfacturen.",
      "Reiskosten": "Declareer zakelijke kilometers altijd aan €0,23/km (of werkelijk) en gebruik NS Business Card voor OV-reizen.",
      "Verzekeringen & Advies": "Controleer of je AOV-premie fiscaal aftrekbaar is en vergelijk jaarlijks je beroepsaansprakelijkheid.",
      "Belastingen": "Reserveer automatisch per kwartaal voor de BTW en de voorlopige aanslag inkomstenbelasting.",
      "Overige Bedrijfskosten": "Onderhandel over bankkosten en kies een scherp zakelijk rekeningpakket.",
      "Privé (Onttrekkingen/Stortingen)": "Keer jezelf een vast maandelijks ondernemersloon uit en laat de rest als zakelijke buffer staan."
    },
    categoryJustifications: {
      "Inkomsten (Omzet)": "Geprojecteerd op basis van je historische omzet met een groeidoelstelling voor het komende jaar.",
      "Huisvesting": "Gebaseerd op vaste huur- en energielasten met correctie voor gemeentelijke heffingen en indexering.",
      "Kantoor & IT": "Aansluitend bij je softwarelicenties, telefonie, hosting en kantoorbehoeften.",
      "Marketing & Verkoop": "Budget om zichtbaar te blijven bij je doelgroep en nieuwe opdrachten binnen te halen.",
      "Personeel & Inhuur": "Reservering voor payroll, ingeschakelde ZZP'ers of onderaanneming.",
      "Reiskosten": "Brandstof, OV en parkeerkosten voor klantbezoeken.",
      "Verzekeringen & Advies": "Noodzakelijke zakelijke dekking en begeleiding door je boekhouder/accountant.",
      "Belastingen": "Schatting van BTW en belastingafdrachten gerelateerd aan je omzetniveau.",
      "Overige Bedrijfskosten": "Kleine operationele uitgaven, bankkosten en vakliteratuur.",
      "Privé (Onttrekkingen/Stortingen)": "Gelijkmatige privé-onttrekking ter ondersteuning van je levensonderhoud."
    }
  },

  manege: {
    advice: [
      "Stro & Hooi Seizoensinkoop: Koop ruwvoer en stro zoveel mogelijk direct in tijdens de oogstperiode (juni-augustus) om winterpiekprijzen te voorkomen.",
      "Indexeer Pensionstalling: Koppel de pensionprijzen in je contracten aan de CBS-consumentenprijsindex of voerkostenindex.",
      "Onderhoudsfonds Gebouwen: Reserveer minimaal 5% van de omzet voor periodiek herstel van omheiningen, bodems en stalgebouwen."
    ],
    categoryTips: {
      "Inkomsten (Omzet)": "Vul pensionboxen optimaal en overweeg extra diensten zoals paddockservice of trainingslessen.",
      "Huisvesting": "Pacht- en stalhuur vooraf vastleggen in langlopende contracten om onverwachte verhogingen te voorkomen.",
      "Overige Bedrijfskosten": "Koop krachtvoer en zaagsel/vlas in bulk in via coöperatieve inkoop om volumekorting te bedingen.",
      "Kantoor & IT": "Gebruik een eenvoudig stalbeheer-programma om facturen voor hoefsmid en extra lessen automatisch te innen.",
      "Personeel & Inhuur": "Zet in de piekmonden (bijv. oogst of evenementen) flexibele weekendhulpen in.",
      "Reiskosten": "Onderhoud je tractor en trailer preventief om dure noodreparaties tijdens het seizoen te voorkomen.",
      "Verzekeringen & Advies": "Zorg voor een waterdichte aansprakelijkheidsverzekering (manegebruikers & pensionpaarden)."
    },
    categoryJustifications: {
      "Inkomsten (Omzet)": "Opbrengsten uit pensionstalling, lesgelden en kantine-activiteiten.",
      "Huisvesting": "Stalhuur, weidepacht, waterverbruik en elektra voor verlichting en pompinstallaties.",
      "Overige Bedrijfskosten": "Voer, strooisel, hoefsmid, veeartskosten en onderhoud van de weiden en rijbodem.",
      "Kantoor & IT": "Administratiekosten, stalsoftware en pinautomaat.",
      "Personeel & Inhuur": "Stalmedewerkers en instructeurs voor de lessen.",
      "Reiskosten": "Brandstof voor het transport van paarden, voer en machinegebruik.",
      "Verzekeringen & Advies": "Bedrijfsaansprakelijkheid manegebedrijf en accountantskosten."
    }
  },

  landbouw: {
    advice: [
      "Samenwerking & Collectieve Inkoop: Bespaar op zaaigoed, meststoffen en gewasbescherming door samen te werken binnen studieclubs of coöperaties.",
      "Diesel & Machine-efficiëntie: Plan ritten en bewerkingen strak om brandstofverbruik en machine-uren te optimaliseren.",
      "Risicospreiding Gewassen & Contractteelt: Dek afzetprijzen vooraf deels af met voorverkoopcontracten om marktschommelingen te dempen."
    ],
    categoryTips: {
      "Inkomsten (Omzet)": "Maak gebruik van GLB-toeslagen en stem oogstplanning af op marktvensters met hogere prijzen.",
      "Huisvesting": "Onderhoud drainagesystemen en bewaarplaatsen preventief om gewasverlies te voorkomen.",
      "Overige Bedrijfskosten": "Vergelijk leveranciers van meststoffen en reserveer tijdig voor loonwerkers.",
      "Personeel & Inhuur": "Zet seizoensarbeid strak in tijdens zaai- en oogstpieken.",
      "Reiskosten": "Zakelijke brandstof (diesel/GTL) en transportkosten naar veilingen of afnemers."
    },
    categoryJustifications: {
      "Inkomsten (Omzet)": "Verkoop van gewassen, melk, vee en agrarische subsidies (RVO/GLB).",
      "Huisvesting": "Pachtgrond, schuren, erfverharding en nutsvoorzieningen.",
      "Overige Bedrijfskosten": "Zaaigoed, meststoffen, veevoer, gewasbescherming en machine-onderhoud.",
      "Personeel & Inhuur": "Loonwerkers en tijdelijke krachten.",
      "Reiskosten": "Tractorbrandstof en logistiek.",
      "Verzekeringen & Advies": "Brede weersverzekering, agrarisch advies en milieurapportages."
    }
  },

  generiek: {
    advice: [
      "Bouw een buffer van 3 tot 6 maanden vaste lasten op voor maximale rust en onafhankelijkheid.",
      "Beoordeel je marges per product of dienst: Schrap verlieslatende opdrachten en richt je op je best renderende klanten.",
      "Spreid grote jaarlijkse rekeningen maandelijks via de Gemoedsrust Calculator om liquiditeitsschommelingen op te vangen."
    ],
    categoryTips: {
      "Inkomsten (Omzet)": "Stuur facturen binnen 24 uur na oplevering en hanteer een strakke betalingstermijn van 14 dagen.",
      "Huisvesting": "Controleer energiecontracten en bespaar op verlichting en verwarming.",
      "Kantoor & IT": "Voorkom dubbele abonnementen en kies alles-in-één zakelijke software.",
      "Marketing & Verkoop": "Mond-tot-mondreclame en tevreden vaste klanten leveren de hoogste ROI op.",
      "Reiskosten": "Combineer afspraken in dezelfde regio om reistijd en brandstof te besparen."
    },
    categoryJustifications: {
      "Inkomsten (Omzet)": "Gerealiseerde verkopen en diensten, verhoogd met de gewenste jaarlijkse groeidoelstelling.",
      "Huisvesting": "Huisvestingslasten, nutsvoorzieningen en bijkomende heffingen.",
      "Kantoor & IT": "Software, telecommunicatie en kantoorbenodigdheden.",
      "Marketing & Verkoop": "Promotie, website, advertenties en representatie.",
      "Personeel & Inhuur": "Salarissen en externe inhuur.",
      "Reiskosten": "Zakelijk vervoer, brandstof en parkeren.",
      "Verzekeringen & Advies": "Risicodekkingen, boekhouding en juridische bijstand.",
      "Belastingen": "Omzetbelasting, winstbelasting en heffingen.",
      "Overige Bedrijfskosten": "Algemene operationele overhead en bankkosten.",
      "Privé (Onttrekkingen/Stortingen)": "Maandelijkse privé-opnames voor levensonderhoud."
    }
  }
};

/**
 * Generates an instant, highly accurate forecast budget
 */
export function generateForecastBudget(
  transactions: Transaction[],
  options: BudgetForecastOptions = {}
): BudgetPlanning {
  const {
    revenueGrowthPct = 5,
    inflationPct = 3,
    sector = "generiek"
  } = options;

  const sectorKey = sector.toLowerCase().includes("manege")
    ? "manege"
    : sector.toLowerCase().includes("landbouw") || sector.toLowerCase().includes("agrar")
    ? "landbouw"
    : sector.toLowerCase().includes("dienst")
    ? "dienstverlening"
    : "generiek";

  const benchmark = SECTOR_BENCHMARKS[sectorKey] || SECTOR_BENCHMARKS.generiek;

  // Calculate actual spending and revenue per category
  const actualsByCategory: Record<string, number> = {};
  STANDARD_CATEGORIES.forEach(cat => {
    actualsByCategory[cat] = 0;
  });

  transactions.forEach(t => {
    const cat = t.category || "Overige Bedrijfskosten";
    if (actualsByCategory[cat] === undefined) {
      actualsByCategory[cat] = 0;
    }
    actualsByCategory[cat] += t.amount;
  });

  // Calculate allocated forecast
  const categories: BudgetCategory[] = STANDARD_CATEGORIES.map(cat => {
    const spent = Math.round(actualsByCategory[cat] || 0);
    const isIncome = cat === "Inkomsten (Omzet)";
    const isPrivate = cat === "Privé (Onttrekkingen/Stortingen)";

    let multiplier = 1 + (inflationPct / 100);
    if (isIncome) {
      multiplier = 1 + (revenueGrowthPct / 100);
    } else if (isPrivate) {
      multiplier = 1 + ((inflationPct * 0.5) / 100);
    }

    // Default allocated
    let allocated = Math.round(spent * multiplier);
    if (allocated === 0) {
      allocated = isIncome ? 25000 : 600;
    }

    const tip = benchmark.categoryTips[cat] || "Houd maandelijks grip op deze kosten door vaste contracten jaarlijks te vergelijken.";
    const just = benchmark.categoryJustifications[cat] || `Gebaseerd op €${spent.toLocaleString("nl-NL")} aan historische boekingen met ${multiplier >= 1 ? "+" : ""}${Math.round((multiplier - 1) * 100)}% begrotingsindexatie.`;

    return {
      category: cat,
      allocated,
      spent,
      justification: just,
      savingTips: tip
    };
  });

  return {
    year: new Date().getFullYear() + 1,
    categories,
    strategicAdvice: benchmark.advice,
    createdAt: new Date().toLocaleDateString("nl-NL")
  };
}
