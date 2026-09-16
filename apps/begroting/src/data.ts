import { Transaction } from "./types";

export interface DemoSectorData {
  companyName: string;
  subTitle: string;
  fileName: string;
  transactions: Omit<Transaction, "id">[];
  budgetProposal: {
    budgetProposals: {
      category: string;
      recommendedAnnualBudget: number;
      justification: string;
      savingTips: string;
    }[];
    strategicAdvice: string[];
  };
}

export const SECTOR_DEMO_DATA: Record<string, DemoSectorData> = {
  dienstverlening: {
    companyName: "Creative Studio NL",
    subTitle: "Een modern digitaal bureau met retainers en flexibele overhead",
    fileName: "Creative_Studio_NL_2025.csv",
    transactions: [
      // INKOMSTEN (OMZET)
      { date: "2025-01-05", description: "Betaling Factuur 2025-001 - Janssen & Partners BV", amount: 2450.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-01-15", description: "Maandelijkse Retainer - Pietersen Media Groep", amount: 1500.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-02-02", description: "Betaling Factuur 2025-004 - Bakker Logistiek", amount: 3750.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-02-15", description: "Maandelijkse Retainer - Pietersen Media Groep", amount: 1500.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-03-04", description: "Betaling Factuur 2025-008 - De Vries Consultancy", amount: 1890.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-03-15", description: "Maandelijkse Retainer - Pietersen Media Groep", amount: 1500.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-04-06", description: "Betaling Factuur 2025-012 - TechStart NL", amount: 5200.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-04-15", description: "Maandelijkse Retainer - Pietersen Media Groep", amount: 1500.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-05-10", description: "Betaling Factuur 2025-015 - Van de Berg Mode", amount: 1250.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-05-15", description: "Maandelijkse Retainer - Pietersen Media Groep", amount: 1500.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-06-05", description: "Betaling Factuur 2025-019 - Groen & Co.", amount: 4300.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-06-15", description: "Maandelijkse Retainer - Pietersen Media Groep", amount: 1500.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-07-08", description: "Betaling Factuur 2025-022 - Horeca Groep Utrecht", amount: 2950.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-07-15", description: "Maandelijkse Retainer - Pietersen Media Groep", amount: 1500.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-08-12", description: "Betaling Factuur 2025-025 - SmartHome Solutions", amount: 3100.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-08-15", description: "Maandelijkse Retainer - Pietersen Media Groep", amount: 1500.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-09-05", description: "Betaling Factuur 2025-028 - Janssen & Partners BV", amount: 2450.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-09-15", description: "Maandelijkse Retainer - Pietersen Media Groep", amount: 1500.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-10-10", description: "Betaling Factuur 2025-031 - Bakker Logistiek", amount: 3750.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-10-15", description: "Maandelijkse Retainer - Pietersen Media Groep", amount: 1500.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-11-05", description: "Betaling Factuur 2025-035 - De Vries Consultancy", amount: 1890.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-11-15", description: "Maandelijkse Retainer - Pietersen Media Groep", amount: 1500.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-12-08", description: "Betaling Factuur 2025-040 - TechStart NL", amount: 4800.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-12-15", description: "Maandelijkse Retainer - Pietersen Media Groep", amount: 1500.00, type: "income", category: "Inkomsten (Omzet)" },

      // HUISVESTING
      { date: "2025-01-02", description: "Huur kantoorruimte - Coburg Business Center", amount: 850.00, type: "expense", category: "Huisvesting" },
      { date: "2025-01-20", description: "Vattenfall - Maandelijks voorschot Gas & Licht", amount: 145.00, type: "expense", category: "Huisvesting" },
      { date: "2025-02-02", description: "Huur kantoorruimte - Coburg Business Center", amount: 850.00, type: "expense", category: "Huisvesting" },
      { date: "2025-02-20", description: "Vattenfall - Maandelijks voorschot Gas & Licht", amount: 145.00, type: "expense", category: "Huisvesting" },
      { date: "2025-03-02", description: "Huur kantoorruimte - Coburg Business Center", amount: 850.00, type: "expense", category: "Huisvesting" },
      { date: "2025-03-20", description: "Vattenfall - Maandelijks voorschot Gas & Licht", amount: 145.00, type: "expense", category: "Huisvesting" },
      { date: "2025-04-02", description: "Huur kantoorruimte - Coburg Business Center", amount: 850.00, type: "expense", category: "Huisvesting" },
      { date: "2025-04-20", description: "Vattenfall - Maandelijks voorschot Gas & Licht", amount: 145.00, type: "expense", category: "Huisvesting" },
      { date: "2025-05-02", description: "Huur kantoorruimte - Coburg Business Center", amount: 850.00, type: "expense", category: "Huisvesting" },
      { date: "2025-05-20", description: "Vattenfall - Maandelijks voorschot Gas & Licht", amount: 145.00, type: "expense", category: "Huisvesting" },
      { date: "2025-06-02", description: "Huur kantoorruimte - Coburg Business Center", amount: 850.00, type: "expense", category: "Huisvesting" },
      { date: "2025-06-20", description: "Vattenfall - Maandelijks voorschot Gas & Licht", amount: 145.00, type: "expense", category: "Huisvesting" },
      { date: "2025-07-02", description: "Huur kantoorruimte - Coburg Business Center", amount: 850.00, type: "expense", category: "Huisvesting" },
      { date: "2025-07-20", description: "Vattenfall - Maandelijks voorschot Gas & Licht", amount: 145.00, type: "expense", category: "Huisvesting" },
      { date: "2025-08-02", description: "Huur kantoorruimte - Coburg Business Center", amount: 850.00, type: "expense", category: "Huisvesting" },
      { date: "2025-08-20", description: "Vattenfall - Maandelijks voorschot Gas & Licht", amount: 145.00, type: "expense", category: "Huisvesting" },
      { date: "2025-09-02", description: "Huur kantoorruimte - Coburg Business Center", amount: 850.00, type: "expense", category: "Huisvesting" },
      { date: "2025-09-20", description: "Vattenfall - Maandelijks voorschot Gas & Licht", amount: 145.00, type: "expense", category: "Huisvesting" },
      { date: "2025-10-02", description: "Huur kantoorruimte - Coburg Business Center", amount: 850.00, type: "expense", category: "Huisvesting" },
      { date: "2025-10-20", description: "Vattenfall - Maandelijks voorschot Gas & Licht", amount: 145.00, type: "expense", category: "Huisvesting" },
      { date: "2025-11-02", description: "Huur kantoorruimte - Coburg Business Center", amount: 850.00, type: "expense", category: "Huisvesting" },
      { date: "2025-11-20", description: "Vattenfall - Maandelijks voorschot Gas & Licht", amount: 145.00, type: "expense", category: "Huisvesting" },
      { date: "2025-12-02", description: "Huur kantoorruimte - Coburg Business Center", amount: 850.00, type: "expense", category: "Huisvesting" },
      { date: "2025-12-20", description: "Vattenfall - Maandelijks voorschot Gas & Licht", amount: 145.00, type: "expense", category: "Huisvesting" },

      // KANTOOR & IT
      { date: "2025-01-10", description: "Adobe Creative Cloud - Jaarabonnement Design suite", amount: 725.00, type: "expense", category: "Kantoor & IT" },
      { date: "2025-01-14", description: "KPN Glasvezel Zakelijk - Maandelijks internet & VoIP", amount: 65.00, type: "expense", category: "Kantoor & IT" },
      { date: "2025-02-14", description: "KPN Glasvezel Zakelijk - Maandelijks internet & VoIP", amount: 65.00, type: "expense", category: "Kantoor & IT" },
      { date: "2025-03-14", description: "KPN Glasvezel Zakelijk - Maandelijks internet & VoIP", amount: 65.00, type: "expense", category: "Kantoor & IT" },
      { date: "2025-03-18", description: "Apple Store Amsterdam - iPad Air & Apple Pencil", amount: 849.00, type: "expense", category: "Kantoor & IT" },
      { date: "2025-04-14", description: "KPN Glasvezel Zakelijk - Maandelijks internet & VoIP", amount: 65.00, type: "expense", category: "Kantoor & IT" },
      { date: "2025-04-22", description: "Hosting24 B.V. - Domeinregistratie & VPS Hosting", amount: 240.00, type: "expense", category: "Kantoor & IT" },
      { date: "2025-05-14", description: "KPN Glasvezel Zakelijk - Maandelijks internet & VoIP", amount: 65.00, type: "expense", category: "Kantoor & IT" },
      { date: "2025-06-14", description: "KPN Glasvezel Zakelijk - Maandelijks internet & VoIP", amount: 65.00, type: "expense", category: "Kantoor & IT" },
      { date: "2025-07-14", description: "KPN Glasvezel Zakelijk - Maandelijks internet & VoIP", amount: 65.00, type: "expense", category: "Kantoor & IT" },
      { date: "2025-08-14", description: "KPN Glasvezel Zakelijk - Maandelijks internet & VoIP", amount: 65.00, type: "expense", category: "Kantoor & IT" },
      { date: "2025-08-19", description: "Albert Heijn - Koffiebonen & Lunch kantoor", amount: 84.50, type: "expense", category: "Kantoor & IT" },
      { date: "2025-09-14", description: "KPN Glasvezel Zakelijk - Maandelijks internet & VoIP", amount: 65.00, type: "expense", category: "Kantoor & IT" },
      { date: "2025-10-14", description: "KPN Glasvezel Zakelijk - Maandelijks internet & VoIP", amount: 65.00, type: "expense", category: "Kantoor & IT" },
      { date: "2025-11-14", description: "KPN Glasvezel Zakelijk - Maandelijks internet & VoIP", amount: 65.00, type: "expense", category: "Kantoor & IT" },
      { date: "2025-12-14", description: "KPN Glasvezel Zakelijk - Maandelijks internet & VoIP", amount: 65.00, type: "expense", category: "Kantoor & IT" },
      { date: "2025-12-18", description: "Coolblue - Ergonomische Bureaustoel", amount: 349.00, type: "expense", category: "Kantoor & IT" },

      // MARKETING & VERKOOP
      { date: "2025-01-28", description: "Google Ads - Advertentiekosten januari", amount: 250.00, type: "expense", category: "Marketing & Verkoop" },
      { date: "2025-02-28", description: "Google Ads - Advertentiekosten februari", amount: 300.00, type: "expense", category: "Marketing & Verkoop" },
      { date: "2025-03-25", description: "Drukwerkdeal.nl - Folders en visitekaartjes", amount: 185.00, type: "expense", category: "Marketing & Verkoop" },
      { date: "2025-03-28", description: "Google Ads - Advertentiekosten maart", amount: 250.00, type: "expense", category: "Marketing & Verkoop" },
      { date: "2025-04-28", description: "Google Ads - Advertentiekosten april", amount: 400.00, type: "expense", category: "Marketing & Verkoop" },
      { date: "2025-05-28", description: "Google Ads - Advertentiekosten mei", amount: 350.00, type: "expense", category: "Marketing & Verkoop" },
      { date: "2025-06-20", description: "Mailchimp Newsletter - Jaarplan marketing mailings", amount: 220.00, type: "expense", category: "Marketing & Verkoop" },
      { date: "2025-06-28", description: "Google Ads - Advertentiekosten juni", amount: 300.00, type: "expense", category: "Marketing & Verkoop" },
      { date: "2025-07-28", description: "Google Ads - Advertentiekosten juli", amount: 250.00, type: "expense", category: "Marketing & Verkoop" },
      { date: "2025-08-28", description: "Google Ads - Advertentiekosten augustus", amount: 200.00, type: "expense", category: "Marketing & Verkoop" },
      { date: "2025-09-28", description: "Google Ads - Advertentiekosten september", amount: 300.00, type: "expense", category: "Marketing & Verkoop" },
      { date: "2025-10-28", description: "Google Ads - Advertentiekosten oktober", amount: 450.00, type: "expense", category: "Marketing & Verkoop" },
      { date: "2025-11-28", description: "Google Ads - Advertentiekosten november", amount: 500.00, type: "expense", category: "Marketing & Verkoop" },
      { date: "2025-12-28", description: "Google Ads - Advertentiekosten december", amount: 400.00, type: "expense", category: "Marketing & Verkoop" },

      // REISKOSTEN
      { date: "2025-01-08", description: "NS Reiziger B.V. - Factuur reishistorie zakelijk kaart", amount: 112.40, type: "expense", category: "Reiskosten" },
      { date: "2025-01-22", description: "Shell Amersfoort - Brandstof tankbeurt", amount: 78.50, type: "expense", category: "Reiskosten" },
      { date: "2025-02-08", description: "NS Reiziger B.V. - Factuur reishistorie zakelijk kaart", amount: 95.10, type: "expense", category: "Reiskosten" },
      { date: "2025-02-22", description: "Shell Amersfoort - Brandstof tankbeurt", amount: 81.20, type: "expense", category: "Reiskosten" },
      { date: "2025-12-08", description: "NS Reiziger B.V. - Factuur reishistorie zakelijk kaart", amount: 89.00, type: "expense", category: "Reiskosten" },
      { date: "2025-12-23", description: "Shell Utrecht - Brandstof tankbeurt", amount: 88.90, type: "expense", category: "Reiskosten" },

      // VERZEKERINGEN & ADVIES
      { date: "2025-01-12", description: "Allianz Nederland - Bedrijfsaansprakelijkheid AVB", amount: 35.00, type: "expense", category: "Verzekeringen & Advies" },
      { date: "2025-01-18", description: "Boekhoudbureau De Cijfers - Maandelijkse administratie", amount: 110.00, type: "expense", category: "Verzekeringen & Advies" },
      { date: "2025-02-12", description: "Allianz Nederland - Bedrijfsaansprakelijkheid AVB", amount: 35.00, type: "expense", category: "Verzekeringen & Advies" },
      { date: "2025-02-18", description: "Boekhoudbureau De Cijfers - Maandelijkse administratie", amount: 110.00, type: "expense", category: "Verzekeringen & Advies" },
      { date: "2025-12-12", description: "Allianz Nederland - Bedrijfsaansprakelijkheid AVB", amount: 35.00, type: "expense", category: "Verzekeringen & Advies" },
      { date: "2025-12-18", description: "Boekhoudbureau De Cijfers - Maandelijkse administratie", amount: 110.00, type: "expense", category: "Verzekeringen & Advies" },

      // BELASTINGEN
      { date: "2025-01-28", description: "Belastingdienst - Afdracht BTW Q4 2024", amount: 1420.00, type: "expense", category: "Belastingen" },
      { date: "2025-04-28", description: "Belastingdienst - Afdracht BTW Q1 2025", amount: 1840.00, type: "expense", category: "Belastingen" },
      { date: "2025-07-28", description: "Belastingdienst - Afdracht BTW Q2 2025", amount: 2150.00, type: "expense", category: "Belastingen" },
      { date: "2025-10-28", description: "Belastingdienst - Afdracht BTW Q3 2025", amount: 1690.00, type: "expense", category: "Belastingen" },

      // OVERIGE BEDRIJFSKOSTEN
      { date: "2025-01-01", description: "Bunq Zakelijk - Maandelijkse bankkosten", amount: 12.50, type: "expense", category: "Overige Bedrijfskosten" },
      { date: "2025-02-01", description: "Bunq Zakelijk - Maandelijkse bankkosten", amount: 12.50, type: "expense", category: "Overige Bedrijfskosten" },
      { date: "2025-12-01", description: "Bunq Zakelijk - Maandelijkse bankkosten", amount: 12.50, type: "expense", category: "Overige Bedrijfskosten" },

      // PRIVÉ
      { date: "2025-01-25", description: "Prive-opname naar spaarrekening", amount: 2000.00, type: "expense", category: "Privé (Onttrekkingen/Stortingen)" },
      { date: "2025-04-25", description: "Prive-opname naar spaarrekening", amount: 2000.00, type: "expense", category: "Privé (Onttrekkingen/Stortingen)" }
    ],
    budgetProposal: {
      budgetProposals: [
        {
          category: "Inkomsten (Omzet)",
          recommendedAnnualBudget: 55000,
          justification: "Gebaseerd op de historische omzet van €52.180 over het afgelopen jaar. We adviseren een gezonde groei van 5%, wat haalbaar is door de retainers van €1.500 door te zetten en nieuwe klanten te acquireren.",
          savingTips: "Overweeg je uurtarief met 5% tot 10% te verhogen bij nieuwe offertes. Probeer meer vaste retainers af te sluiten voor stabiele inkomsten."
        },
        {
          category: "Huisvesting",
          recommendedAnnualBudget: 11940,
          justification: "De historische kosten waren exact €11.940 (€10.200 huur en €1.740 energie). De huurovereenkomst staat vast, dus we raden aan dit budget gelijk te houden.",
          savingTips: "Controleer of er een zakelijk energiecontract is met vaste tarieven om onverwachte stijgingen op te vangen. Zet de verwarming in het weekend omlaag."
        },
        {
          category: "Kantoor & IT",
          recommendedAnnualBudget: 2200,
          justification: "Historische kosten bedroegen €2.753, inclusief incidentele hardware aankopen (iPad van €849). Voor volgend jaar begroten we €2.200, wat voldoende is voor de vaste internetabonnementen en software licenties, met een buffer voor kleine kantoorartikelen.",
          savingTips: "Review al je software-abonnementen jaarlijks. Betaal licenties per jaar in plaats van per maand om 10-15% korting te krijgen."
        },
        {
          category: "Marketing & Verkoop",
          recommendedAnnualBudget: 4200,
          justification: "Afgelopen jaar is er €4.205 uitgegeven aan marketing, voornamelijk Google Ads en Mailchimp. Dit is een vitale bron van leads en adviseren we op hetzelfde niveau te behouden.",
          savingTips: "Optimaliseer je advertentiecampagnes door wekelijks negatieve zoekwoorden toe te voegen om onnodige ad-spend te voorkomen."
        },
        {
          category: "Personeel & Inhuur",
          recommendedAnnualBudget: 6000,
          justification: "Er is afgelopen jaar €6.350 uitgegeven aan specialistische inhuur (web development en copywriting). Dit was cruciaal voor de oplevering van projecten en raden we aan op €6.000 te zetten voor incidentele pieken.",
          savingTips: "Maak duidelijke vaste prijsafspraken met je freelancers per project in plaats van uurtarieven, om budgetoverschrijdingen te voorkomen."
        },
        {
          category: "Reiskosten",
          recommendedAnnualBudget: 2200,
          justification: "Historische kosten waren €1.815 (NS-reizen en brandstof). Gezien de stijgende brandstofprijzen adviseren we dit budget licht te verhogen naar €2.200.",
          savingTips: "Reis waar mogelijk buiten de spits met de trein om gebruik te maken van het NS-dalurenabonnement (40% korting)."
        },
        {
          category: "Verzekeringen & Advies",
          recommendedAnnualBudget: 1740,
          justification: "De vaste kosten voor de boekhouder (€1.320 per jaar) en bedrijfsaansprakelijkheid AVB (€420 per jaar) zijn stabiel en staan vast op €1.740.",
          savingTips: "Vraag je boekhouder of er automatiseringen mogelijk zijn in je facturatie, wat administratieve uren en dus kosten kan besparen."
        },
        {
          category: "Belastingen",
          recommendedAnnualBudget: 7100,
          justification: "Dit betreft de afgedragen BTW (€7.100). Dit is een doorgeefpost en rechtstreeks gekoppeld aan de gemaakte omzet. Zorg dat dit bedrag gereserveerd blijft op een aparte spaarrekening.",
          savingTips: "Open een aparte zakelijke spaarrekening en boek bij elke ontvangen klantbetaling direct 21% BTW en 30% inkomstenbelasting over naar deze rekening."
        },
        {
          category: "Overige Bedrijfskosten",
          recommendedAnnualBudget: 150,
          justification: "De vaste bankkosten bedragen €150 per jaar (€12,50 per maand bij Bunq).",
          savingTips: "Evalueer of je het juiste bankpakket hebt en of er onnodige extra passen of functionaliteiten aanstaan."
        },
        {
          category: "Privé (Onttrekkingen/Stortingen)",
          recommendedAnnualBudget: 24000,
          justification: "Je hebt afgelopen jaar €8.500 overgeboekt naar privé. Voor het komende jaar adviseren we om maandelijks een vast privé-salaris van €2.000 in te plannen (€24.000 per jaar) om je privé financiën meer rust en stabiliteit te geven.",
          savingTips: "Door jezelf een vast salaris uit te keren in plaats van willekeurige opnames, voorkom je dat je zakelijke werkkapitaal onverwacht te laag wordt."
        }
      ],
      strategicAdvice: [
        "Reserveer belastinggelden direct: Maak er een vaste gewoonte van om bij elke ontvangen factuur direct 21% (BTW) plus 30% (voor inkomstenbelasting) apart te zetten op een zakelijke spaarrekening.",
        "Optimaliseer softwarelicenties: Vaste terugkerende abonnementen vormen een flink deel van de overheadkosten. Door deze jaarlijks te reviewen of om te zetten naar jaarlicenties bespaar je direct honderden euro's.",
        "Borg retainers voor stabiliteit: De retainer van €1.500 per maand dekt al je vaste operationele kantoorkosten. Richt je verkoopstrategie erop om nog één extra retainer-klant te werven voor optimale rust."
      ]
    }
  },
  manege: {
    companyName: "Manege & Pensionstal De Gouden Hoef",
    subTitle: "Recreatie en sportbedrijf met pensionstalling, rijlessen en kantine",
    fileName: "Manege_De_Gouden_Hoef_2025.csv",
    transactions: [
      // INKOMSTEN (OMZET)
      { date: "2025-01-01", description: "Incasso Maandelijkse Pensionstalling (32 paarden)", amount: 14400.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-01-10", description: "Maandabonnementen Groepslessen & Leskaarten", amount: 3250.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-01-25", description: "Manegebar De Rijhal - Kantineomzet pinbetalingen", amount: 1850.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-02-01", description: "Incasso Maandelijkse Pensionstalling (32 paarden)", amount: 14400.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-02-10", description: "Maandabonnementen Groepslessen & Leskaarten", amount: 3100.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-02-25", description: "Manegebar De Rijhal - Kantineomzet pinbetalingen", amount: 1620.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-03-01", description: "Incasso Maandelijkse Pensionstalling (32 paarden)", amount: 14400.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-03-10", description: "Maandabonnementen Groepslessen & Leskaarten", amount: 3400.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-03-20", description: "Inschrijfgelden Clubwedstrijd & Ponykamp aanbetaling", amount: 1950.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-04-01", description: "Incasso Maandelijkse Pensionstalling (32 paarden)", amount: 14400.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-04-10", description: "Maandabonnementen Groepslessen & Leskaarten", amount: 3600.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-05-01", description: "Incasso Maandelijkse Pensionstalling (32 paarden)", amount: 14400.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-06-01", description: "Incasso Maandelijkse Pensionstalling (32 paarden)", amount: 14400.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-07-01", description: "Incasso Maandelijkse Pensionstalling (32 paarden)", amount: 14400.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-08-01", description: "Incasso Maandelijkse Pensionstalling (32 paarden)", amount: 14400.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-09-01", description: "Incasso Maandelijkse Pensionstalling (32 paarden)", amount: 14400.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-10-01", description: "Incasso Maandelijkse Pensionstalling (32 paarden)", amount: 14400.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-11-01", description: "Incasso Maandelijkse Pensionstalling (32 paarden)", amount: 14400.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-12-01", description: "Incasso Maandelijkse Pensionstalling (32 paarden)", amount: 14400.00, type: "income", category: "Inkomsten (Omzet)" },

      // HUISVESTING (STALLEN, GROND, ENERGIE, WATER)
      { date: "2025-01-02", description: "Pacht weidegrond & stallencomplex - Rentmeesterij", amount: 3200.00, type: "expense", category: "Huisvesting" },
      { date: "2025-01-18", description: "Vitens - Waterverbruik stallen en sproeisysteem", amount: 185.00, type: "expense", category: "Huisvesting" },
      { date: "2025-01-20", description: "Vattenfall - Gas & Elektra (stallen + kantine)", amount: 550.00, type: "expense", category: "Huisvesting" },
      { date: "2025-02-02", description: "Pacht weidegrond & stallencomplex - Rentmeesterij", amount: 3200.00, type: "expense", category: "Huisvesting" },
      { date: "2025-02-20", description: "Vattenfall - Gas & Elektra (stallen + kantine)", amount: 550.00, type: "expense", category: "Huisvesting" },
      { date: "2025-03-02", description: "Pacht weidegrond & stallencomplex - Rentmeesterij", amount: 3200.00, type: "expense", category: "Huisvesting" },
      { date: "2025-04-02", description: "Pacht weidegrond & stallencomplex - Rentmeesterij", amount: 3200.00, type: "expense", category: "Huisvesting" },
      { date: "2025-05-02", description: "Pacht weidegrond & stallencomplex - Rentmeesterij", amount: 3200.00, type: "expense", category: "Huisvesting" },
      { date: "2025-06-02", description: "Pacht weidegrond & stallencomplex - Rentmeesterij", amount: 3200.00, type: "expense", category: "Huisvesting" },
      { date: "2025-07-02", description: "Pacht weidegrond & stallencomplex - Rentmeesterij", amount: 3200.00, type: "expense", category: "Huisvesting" },
      { date: "2025-08-02", description: "Pacht weidegrond & stallencomplex - Rentmeesterij", amount: 3200.00, type: "expense", category: "Huisvesting" },
      { date: "2025-09-02", description: "Pacht weidegrond & stallencomplex - Rentmeesterij", amount: 3200.00, type: "expense", category: "Huisvesting" },
      { date: "2025-10-02", description: "Pacht weidegrond & stallencomplex - Rentmeesterij", amount: 3200.00, type: "expense", category: "Huisvesting" },
      { date: "2025-11-02", description: "Pacht weidegrond & stallencomplex - Rentmeesterij", amount: 3200.00, type: "expense", category: "Huisvesting" },
      { date: "2025-12-02", description: "Pacht weidegrond & stallencomplex - Rentmeesterij", amount: 3200.00, type: "expense", category: "Huisvesting" },

      // KANTOOR & IT
      { date: "2025-01-14", description: "KPN Internet & Bellen - Stallen & Kantine wifi", amount: 55.00, type: "expense", category: "Kantoor & IT" },
      { date: "2025-02-14", description: "KPN Internet & Bellen - Stallen & Kantine wifi", amount: 55.00, type: "expense", category: "Kantoor & IT" },
      { date: "2025-04-12", description: "ManegePlan Software - Administratie & planning software", amount: 480.00, type: "expense", category: "Kantoor & IT" },

      // MARKETING & VERKOOP
      { date: "2025-03-25", description: "Drukwerkdeal.nl - Reclamemateriaal ponykamp & posters", amount: 165.00, type: "expense", category: "Marketing & Verkoop" },
      { date: "2025-06-15", description: "Flyers & Lokale Courant - Advertentieruimte open dag", amount: 250.00, type: "expense", category: "Marketing & Verkoop" },

      // PERSONEEL & INHUUR (INSTRUCTEURS, STALHULPEN, EN KANTINEMEDEWERKERS)
      { date: "2025-01-25", description: "Maandsalarissen Personeel (Groom, instructeur, bar)", amount: 5200.00, type: "expense", category: "Personeel & Inhuur" },
      { date: "2025-02-25", description: "Maandsalarissen Personeel (Groom, instructeur, bar)", amount: 5200.00, type: "expense", category: "Personeel & Inhuur" },
      { date: "2025-03-25", description: "Maandsalarissen Personeel (Groom, instructeur, bar)", amount: 5200.00, type: "expense", category: "Personeel & Inhuur" },
      { date: "2025-04-25", description: "Maandsalarissen Personeel (Groom, instructeur, bar)", amount: 5600.00, type: "expense", category: "Personeel & Inhuur" },
      { date: "2025-05-25", description: "Maandsalarissen Personeel (Groom, instructeur, bar)", amount: 5600.00, type: "expense", category: "Personeel & Inhuur" },
      { date: "2025-06-25", description: "Maandsalarissen Personeel (Groom, instructeur, bar)", amount: 6100.00, type: "expense", category: "Personeel & Inhuur" },
      { date: "2025-07-25", description: "Maandsalarissen Personeel (Groom, instructeur, bar)", amount: 6100.00, type: "expense", category: "Personeel & Inhuur" },
      { date: "2025-08-25", description: "Maandsalarissen Personeel (Groom, instructeur, bar)", amount: 6100.00, type: "expense", category: "Personeel & Inhuur" },
      { date: "2025-09-25", description: "Maandsalarissen Personeel (Groom, instructeur, bar)", amount: 5600.00, type: "expense", category: "Personeel & Inhuur" },
      { date: "2025-10-25", description: "Maandsalarissen Personeel (Groom, instructeur, bar)", amount: 5200.00, type: "expense", category: "Personeel & Inhuur" },
      { date: "2025-11-25", description: "Maandsalarissen Personeel (Groom, instructeur, bar)", amount: 5200.00, type: "expense", category: "Personeel & Inhuur" },
      { date: "2025-12-25", description: "Maandsalarissen Personeel (Groom, instructeur, bar)", amount: 5200.00, type: "expense", category: "Personeel & Inhuur" },

      // REISKOSTEN (DIESEL VOOR TRACTOR EN REISKOSTEN MEDEWERKERS)
      { date: "2025-01-15", description: "Oliehandel Van Der Heide - Levering Rode Diesel tractor", amount: 480.00, type: "expense", category: "Reiskosten" },
      { date: "2025-04-15", description: "Oliehandel Van Der Heide - Levering Rode Diesel tractor", amount: 420.00, type: "expense", category: "Reiskosten" },
      { date: "2025-08-15", description: "Oliehandel Van Der Heide - Levering Rode Diesel tractor", amount: 510.00, type: "expense", category: "Reiskosten" },
      { date: "2025-11-15", description: "Oliehandel Van Der Heide - Levering Rode Diesel tractor", amount: 450.00, type: "expense", category: "Reiskosten" },

      // VERZEKERINGEN & ADVIES (AANSPRAKELIJKHEIDSVERZEKERINGEN, VEEARTS & HOEFSMID CONSULT)
      { date: "2025-01-12", description: "Interpolis ManegePolis - Bedrijfsaansprakelijkheid & Opstal", amount: 420.00, type: "expense", category: "Verzekeringen & Advies" },
      { date: "2025-01-18", description: "Boekhoudbureau Agro & Co - Maandelijkse administratie", amount: 185.00, type: "expense", category: "Verzekeringen & Advies" },
      { date: "2025-02-12", description: "Interpolis ManegePolis - Bedrijfsaansprakelijkheid & Opstal", amount: 420.00, type: "expense", category: "Verzekeringen & Advies" },
      { date: "2025-02-18", description: "Boekhoudbureau Agro & Co - Maandelijkse administratie", amount: 185.00, type: "expense", category: "Verzekeringen & Advies" },
      { date: "2025-04-10", description: "Dierenkliniek De Singel - Jaarlijkse influenza vaccinatie paarden", amount: 1850.00, type: "expense", category: "Verzekeringen & Advies" },
      { date: "2025-05-15", description: "Hoefsmid Van Elst - Bekappen en beslaan schoolpaarden", amount: 980.00, type: "expense", category: "Verzekeringen & Advies" },
      { date: "2025-10-15", description: "Hoefsmid Van Elst - Bekappen en beslaan schoolpaarden", amount: 920.00, type: "expense", category: "Verzekeringen & Advies" },

      // BELASTINGEN
      { date: "2025-01-28", description: "Belastingdienst - Afdracht BTW Q4 2024", amount: 2840.00, type: "expense", category: "Belastingen" },
      { date: "2025-04-28", description: "Belastingdienst - Afdracht BTW Q1 2025", amount: 3100.00, type: "expense", category: "Belastingen" },
      { date: "2025-07-28", description: "Belastingdienst - Afdracht BTW Q2 2025", amount: 3350.00, type: "expense", category: "Belastingen" },
      { date: "2025-10-28", description: "Belastingdienst - Afdracht BTW Q3 2025", amount: 2980.00, type: "expense", category: "Belastingen" },

      // OVERIGE BEDRIJFSKOSTEN (HOOI, STRO, PAARDENVOER, STALONDERHOUD, INKOOP KANTINE)
      { date: "2025-01-05", description: "Fouragehandel V.d. Sluis - Levering 18 balen hooi en stro", amount: 1850.00, type: "expense", category: "Overige Bedrijfskosten" },
      { date: "2025-01-15", description: "Inkoop Sligro - Kantinevoorraad drank & snacks", amount: 620.00, type: "expense", category: "Overige Bedrijfskosten" },
      { date: "2025-01-28", description: "Havens Paardenvoeders - 1.5 ton sport- en basisbrok", amount: 1100.00, type: "expense", category: "Overige Bedrijfskosten" },
      { date: "2025-02-05", description: "Fouragehandel V.d. Sluis - Levering 18 balen hooi en stro", amount: 1850.00, type: "expense", category: "Overige Bedrijfskosten" },
      { date: "2025-02-28", description: "Havens Paardenvoeders - 1.5 ton sport- en basisbrok", amount: 1100.00, type: "expense", category: "Overige Bedrijfskosten" },
      { date: "2025-03-05", description: "Fouragehandel V.d. Sluis - Levering hooi en stro", amount: 1850.00, type: "expense", category: "Overige Bedrijfskosten" },
      { date: "2025-04-05", description: "Fouragehandel V.d. Sluis - Levering hooi en stro", amount: 1850.00, type: "expense", category: "Overige Bedrijfskosten" },
      { date: "2025-05-05", description: "Fouragehandel V.d. Sluis - Levering hooi en stro", amount: 1400.00, type: "expense", category: "Overige Bedrijfskosten" }, // lichter i.v.m. weidegang
      { date: "2025-05-18", description: "Loonwerker De Vries - Sleep- en weideonderhoud rijbaan", amount: 450.00, type: "expense", category: "Overige Bedrijfskosten" },
      { date: "2025-06-05", description: "Fouragehandel V.d. Sluis - Hooi en stro", amount: 1200.00, type: "expense", category: "Overige Bedrijfskosten" },
      { date: "2025-07-05", description: "Fouragehandel V.d. Sluis - Hooi en stro", amount: 1200.00, type: "expense", category: "Overige Bedrijfskosten" },
      { date: "2025-08-05", description: "Fouragehandel V.d. Sluis - Hooi en stro", amount: 1200.00, type: "expense", category: "Overige Bedrijfskosten" },
      { date: "2025-09-05", description: "Fouragehandel V.d. Sluis - Hooi en stro", amount: 1500.00, type: "expense", category: "Overige Bedrijfskosten" },
      { date: "2025-10-05", description: "Fouragehandel V.d. Sluis - Hooi en stro", amount: 1850.00, type: "expense", category: "Overige Bedrijfskosten" },
      { date: "2025-10-28", description: "Havens Paardenvoeders - 2 ton winterbrok", amount: 1450.00, type: "expense", category: "Overige Bedrijfskosten" },
      { date: "2025-11-05", description: "Fouragehandel V.d. Sluis - Hooi en stro", amount: 1850.00, type: "expense", category: "Overige Bedrijfskosten" },
      { date: "2025-12-05", description: "Fouragehandel V.d. Sluis - Hooi en stro", amount: 1850.00, type: "expense", category: "Overige Bedrijfskosten" },
      { date: "2025-12-15", description: "Mestafzet & Mestverwerking Coöperatie - Jaarlijkse mestafvoer", amount: 2400.00, type: "expense", category: "Overige Bedrijfskosten" },

      // PRIVÉ
      { date: "2025-01-25", description: "Privé-opname maandelijks - K. van Ulden", amount: 3500.00, type: "expense", category: "Privé (Onttrekkingen/Stortingen)" },
      { date: "2025-04-25", description: "Privé-opname maandelijks - K. van Ulden", amount: 3500.00, type: "expense", category: "Privé (Onttrekkingen/Stortingen)" }
    ],
    budgetProposal: {
      budgetProposals: [
        {
          category: "Inkomsten (Omzet)",
          recommendedAnnualBudget: 195000,
          justification: "Gebaseerd op de stabiele maandelijkse pensionstalling inkomsten van circa €14.400 en lesgelden. Door een geplande indexatie van de pensionstallingtarieven met 4% kan de omzet stijgen naar ca. €195.000.",
          savingTips: "Indexeer de pensionstallingtarieven jaarlijks om de stijgende hooi- en strokosten op te vangen. Overweeg specifieke clinics te organiseren in daluren voor extra omzet."
        },
        {
          category: "Huisvesting",
          recommendedAnnualBudget: 39500,
          justification: "De historische kosten voor de weide-pacht en huur van de opstallen bedroegen €38.400, aangevuld met water en elektra (€1.100). Er is weinig flexibiliteit in pacht, dus we adviseren dit budget stabiel te houden.",
          savingTips: "Controleer of het waterverbruik kan worden gedrukt door regenwateropvang voor het sproeien van de rijbanen te gebruiken. Dit scheelt aanzienlijk op de Vitens-rekening."
        },
        {
          category: "Kantoor & IT",
          recommendedAnnualBudget: 600,
          justification: "Geringe kantoorkosten aanwezig. Het betreft met name de manegeplanning software (€480) en internet. Dit is stabiel.",
          savingTips: "Controleer of de software-licentie kan worden omgezet naar een jaarbetaling voor extra korting."
        },
        {
          category: "Marketing & Verkoop",
          recommendedAnnualBudget: 500,
          justification: "De marketinguitgaven waren minimaal afgelopen jaar (€415). Dit is passend, daar de stalling via mond-tot-mondreclame vol zit.",
          savingTips: "Gebruik gratis sociale media kanalen om de open dag en de ponykampen te promoten in plaats van betaalde advertenties."
        },
        {
          category: "Personeel & Inhuur",
          recommendedAnnualBudget: 68000,
          justification: "Je loonlijst voor de vaste grooms, stalhulpen en rij-instructeurs bedroeg afgelopen jaar €66.400. Gezien de stijging van het minimumloon adviseren we dit budget te verhogen naar €68.000.",
          savingTips: "Maak gebruik van stagiaires van hippische opleidingen (MBO/HBO) voor ondersteuning in het stalbeheer."
        },
        {
          category: "Reiskosten",
          recommendedAnnualBudget: 2000,
          justification: "Betreft hoofdzakelijk diesel voor de tractor en shovel (€1.860). Essentieel voor het uitmesten en slepen van de bodem.",
          savingTips: "Zorg voor regelmatig onderhoud van de tractor (schone filters, juiste bandenspanning) om tot 10% te besparen op dieselverbruik."
        },
        {
          category: "Verzekeringen & Advies",
          recommendedAnnualBudget: 8500,
          justification: "Historische kosten bedroegen €8.690. Dit omvat de zware aansprakelijkheidsverzekering voor de manege, de boekhouder, en de jaarlijkse influenza/tetanus vaccinaties door de veearts voor de manegepaarden.",
          savingTips: "Informeer bij je hippische bond (bijv. KNHS of FNRS) of er collectieve kortingen zijn op de bedrijfsaansprakelijkheid."
        },
        {
          category: "Belastingen",
          recommendedAnnualBudget: 12500,
          justification: "Dit betreft de afgedragen BTW over stalling en diensten. Dit is een doorgeefpost en direct gelinkt aan je omzet.",
          savingTips: "Zet bij elke ontvangen pensionbetaling direct de BTW-component (voor pensionstalling deels 21%, lessen soms sporttarief) apart."
        },
        {
          category: "Overige Bedrijfskosten",
          recommendedAnnualBudget: 28500,
          justification: "Dit is de grootste kostenpost en bedroeg afgelopen jaar €29.600. Dit betreft de inkoop van hooi, stro, krachtvoer, mestafvoer (€2.400) en kantine-inkoop (€620).",
          savingTips: "Koop hooi en stro direct van de boer tijdens de oogsttijd (juni/juli) en sla dit in bulk op. Dit scheelt tot 30% ten opzichte van losse leveringen in de winter."
        },
        {
          category: "Privé (Onttrekkingen/Stortingen)",
          recommendedAnnualBudget: 42000,
          justification: "Je hebt afgelopen jaar €7.000 opgenomen. We adviseren een vast maandelijks ondernemersinkomen van €3.500 in te plannen om privélasten stabiel te kunnen dragen.",
          savingTips: "Houd privé-uitgaven en zakelijke manege-uitgaven (zoals paardenspullen) strikt gescheiden om fiscaal zuiver te blijven."
        }
      ],
      strategicAdvice: [
        "Inkoopoptimalisatie Fourage: De inkoop van hooi en stro is je grootste flexibele kostenpost. Maak meerjarige prijsafspraken met lokale akkerbouwers of koop uitsluitend in bulk tijdens de oogstperiode om schommelingen op te vangen.",
        "Indexatie Pensionprijzen: Door de aanhoudend hoge stro- en voerprijzen is een jaarlijkse tariefsindexatie van 3% tot 5% noodzakelijk om je marge per box gezond te houden.",
        "Kantine- & Evenementenmarge: De kantine heeft een hoge brutomarge. Het organiseren van extra onderlinge wedstrijden of ponykampen in de schoolvakanties verhoogt niet alleen de lesgelden, maar stimuleert direct de kantineomzet met minimale extra kosten."
      ]
    }
  },
  landbouw: {
    companyName: "Akkerbouwbedrijf & Veehouderij Veenstra",
    subTitle: "Agrarisch familiebedrijf met melkvee en akkerbouwgewassen",
    fileName: "Mts_Veenstra_Landbouw_2025.csv",
    transactions: [
      // INKOMSTEN (OMZET)
      { date: "2025-01-20", description: "FrieslandCampina B.V. - Maandelijkse melkgelden leverantie", amount: 18450.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-02-20", description: "FrieslandCampina B.V. - Maandelijkse melkgelden leverantie", amount: 17900.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-03-20", description: "FrieslandCampina B.V. - Maandelijkse melkgelden leverantie", amount: 19100.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-03-28", description: "RVO Nederland - GLB Directe inkomenssteun / Toeslagrechten", amount: 14200.00, type: "income", category: "Inkomsten (Omzet)" }, // EU SUBSIDIE
      { date: "2025-04-20", description: "FrieslandCampina B.V. - Maandelijkse melkgelden leverantie", amount: 18100.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-05-20", description: "FrieslandCampina B.V. - Maandelijkse melkgelden leverantie", amount: 18300.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-06-20", description: "FrieslandCampina B.V. - Maandelijkse melkgelden leverantie", amount: 18500.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-07-20", description: "FrieslandCampina B.V. - Maandelijkse melkgelden leverantie", amount: 17200.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-08-20", description: "FrieslandCampina B.V. - Maandelijkse melkgelden leverantie", amount: 17400.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-09-20", description: "FrieslandCampina B.V. - Maandelijkse melkgelden leverantie", amount: 18100.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-10-15", description: "Suikerunie - Voorschotbepaling levering suikerbieten", amount: 8900.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-10-20", description: "FrieslandCampina B.V. - Maandelijkse melkgelden leverantie", amount: 18900.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-11-10", description: "Czav - Afrekening verkoop brouwgerst & tarwe", amount: 12400.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-11-20", description: "FrieslandCampina B.V. - Maandelijkse melkgelden leverantie", amount: 18700.00, type: "income", category: "Inkomsten (Omzet)" },
      { date: "2025-12-20", description: "FrieslandCampina B.V. - Maandelijkse melkgelden leverantie", amount: 18950.00, type: "income", category: "Inkomsten (Omzet)" },

      // HUISVESTING (PACHT GROND, RECHTEN, STALENERGIE)
      { date: "2025-01-02", description: "Rentmeesterij Overijssel - Halfjaarlijkse pacht landbouwgrond", amount: 8500.00, type: "expense", category: "Huisvesting" },
      { date: "2025-01-20", description: "Vattenfall - Grootverbruik elektra melkkoeling & pompen", amount: 840.00, type: "expense", category: "Huisvesting" },
      { date: "2025-02-20", description: "Vattenfall - Grootverbruik elektra melkkoeling & pompen", amount: 840.00, type: "expense", category: "Huisvesting" },
      { date: "2025-07-02", description: "Rentmeesterij Overijssel - Halfjaarlijkse pacht landbouwgrond", amount: 8500.00, type: "expense", category: "Huisvesting" },

      // KANTOOR & IT
      { date: "2025-03-15", description: "Dacom Farm Intelligence - Software teeltregistratie & sensoren", amount: 540.00, type: "expense", category: "Kantoor & IT" },
      { date: "2025-05-10", description: "RVO - Registratiegelden Gecombineerde Opgave en runderen", amount: 210.00, type: "expense", category: "Kantoor & IT" },

      // PERSOONLIJK & INHUUR (LOONWERK EN ADVISEURS)
      { date: "2025-04-18", description: "Loonbedrijf Schootstra - Ploegen, inzaaien suikerbieten & bemesting", amount: 4800.00, type: "expense", category: "Personeel & Inhuur" },
      { date: "2025-06-15", description: "Loonbedrijf Schootstra - Gras maaien, inkuilen eerste snede", amount: 3600.00, type: "expense", category: "Personeel & Inhuur" },
      { date: "2025-09-22", description: "Loonbedrijf Schootstra - Mais hakselen & inkuilen", amount: 5200.00, type: "expense", category: "Personeel & Inhuur" },

      // REISKOSTEN (TRACTOR BRANDSTOF / DIESEL)
      { date: "2025-02-15", description: "Oliehandel Agri-Petrol - Bulk levering 3000 liter Traxx Diesel", amount: 4200.00, type: "expense", category: "Reiskosten" },
      { date: "2025-06-15", description: "Oliehandel Agri-Petrol - Bulk levering 4000 liter Traxx Diesel", amount: 5600.00, type: "expense", category: "Reiskosten" },
      { date: "2025-10-15", description: "Oliehandel Agri-Petrol - Bulk levering 3000 liter Traxx Diesel", amount: 4300.00, type: "expense", category: "Reiskosten" },

      // VERZEKERINGEN & ADVIES (AGRARISCHE BOEKHOUDER, VEEARTS, BREDE WEERSVERZEKERING)
      { date: "2025-01-12", description: "ABAB Accountants - Fiscaal agrarisch advies & administratie", amount: 350.00, type: "expense", category: "Verzekeringen & Advies" },
      { date: "2025-01-18", description: "Dierenartsenpraktijk Noord - Begeleiding vruchtbaarheid melkvee", amount: 450.00, type: "expense", category: "Verzekeringen & Advies" },
      { date: "2025-02-18", description: "Dierenartsenpraktijk Noord - Medicijnen & uierbehandeling melkvee", amount: 380.00, type: "expense", category: "Verzekeringen & Advies" },
      { date: "2025-03-10", description: "Achmea Agro - Brede Weersverzekering gewassen & opstallen", amount: 3200.00, type: "expense", category: "Verzekeringen & Advies" },
      { date: "2025-05-18", description: "ABAB Accountants - Fiscaal agrarisch advies & administratie", amount: 350.00, type: "expense", category: "Verzekeringen & Advies" },

      // BELASTINGEN
      { date: "2025-01-28", description: "Belastingdienst - BTW afdracht Kwartaal 4", amount: 1100.00, type: "expense", category: "Belastingen" },
      { date: "2025-04-28", description: "Belastingdienst - BTW afdracht Kwartaal 1", amount: 1340.00, type: "expense", category: "Belastingen" },
      { date: "2025-07-28", description: "Belastingdienst - BTW afdracht Kwartaal 2", amount: 1540.00, type: "expense", category: "Belastingen" },

      // OVERIGE BEDRIJFSKOSTEN (VEEVOER, KUNSTMEST, ZAAIGOED, MACHINE-ONDERHOUD)
      { date: "2025-01-10", description: "Agrifirm B.V. - Bulkbestelling krachtvoer & melkpoeder", amount: 5800.00, type: "expense", category: "Overige Bedrijfskosten" },
      { date: "2025-02-10", description: "Agrifirm B.V. - Bulkbestelling krachtvoer", amount: 5800.00, type: "expense", category: "Overige Bedrijfskosten" },
      { date: "2025-03-05", description: "ForFarmers B.V. - Aanvullende mineralen & kalvermelk", amount: 1450.00, type: "expense", category: "Overige Bedrijfskosten" },
      { date: "2025-03-18", description: "Agrifirm B.V. - Levering kunstmest & zaaigoed mais", amount: 8400.00, type: "expense", category: "Overige Bedrijfskosten" }, // VOORJAAR INKOOP
      { date: "2025-04-10", description: "Agrifirm B.V. - Forceer- en krachtvoeders melkvee", amount: 5800.00, type: "expense", category: "Overige Bedrijfskosten" },
      { date: "2025-04-22", description: "Kraakman B.V. - Onderhoud melkrobot & tankcontrole", amount: 1950.00, type: "expense", category: "Overige Bedrijfskosten" },
      { date: "2025-05-10", description: "Agrifirm B.V. - Krachtvoer", amount: 5800.00, type: "expense", category: "Overige Bedrijfskosten" },
      { date: "2025-06-10", description: "Agrifirm B.V. - Krachtvoer", amount: 4200.00, type: "expense", category: "Overige Bedrijfskosten" }, // Lichter door weidegras
      { date: "2025-07-10", description: "Agrifirm B.V. - Krachtvoer", amount: 4200.00, type: "expense", category: "Overige Bedrijfskosten" },
      { date: "2025-08-10", description: "Agrifirm B.V. - Krachtvoer", amount: 4200.00, type: "expense", category: "Overige Bedrijfskosten" },
      { date: "2025-09-10", description: "Agrifirm B.V. - Krachtvoer", amount: 5800.00, type: "expense", category: "Overige Bedrijfskosten" },
      { date: "2025-10-10", description: "Agrifirm B.V. - Krachtvoer", amount: 5800.00, type: "expense", category: "Overige Bedrijfskosten" },
      { date: "2025-11-10", description: "Agrifirm B.V. - Krachtvoer", amount: 5800.00, type: "expense", category: "Overige Bedrijfskosten" },
      { date: "2025-12-10", description: "Agrifirm B.V. - Krachtvoer", amount: 5800.00, type: "expense", category: "Overige Bedrijfskosten" },

      // PRIVÉ
      { date: "2025-01-25", description: "Maandelijkse overboeking Privé-rekening", amount: 4000.00, type: "expense", category: "Privé (Onttrekkingen/Stortingen)" },
      { date: "2025-06-25", description: "Maandelijkse overboeking Privé-rekening", amount: 4000.00, type: "expense", category: "Privé (Onttrekkingen/Stortingen)" }
    ],
    budgetProposal: {
      budgetProposals: [
        {
          category: "Inkomsten (Omzet)",
          recommendedAnnualBudget: 255000,
          justification: "De melkgelden FrieslandCampina bedroegen ca. €220.450. Aangevuld met suikerbieten, tarwe en de EU GLB-toeslag (€14.200) kwam het totaal op €255.950. We adviseren dit stabiel te begroten.",
          savingTips: "Volg de melkprijsindex op de voet en optimaliseer het eiwit/vet-gehalte van je melk om maximale toeslagen per kilo te ontvangen van de zuivelcoöperatie."
        },
        {
          category: "Huisvesting",
          recommendedAnnualBudget: 27500,
          justification: "Bevat de pachtgelden (€17.000) en de zware energiekosten van de melkkoeling & robotbedrijf (€10.080). Dit is een vaste post.",
          savingTips: "Overweeg een zonneboiler of warmteterugwinning (WTW) op de melkkoeling. Hiermee verwarm je gratis het reinigingswater van de melkstal, wat direct elektra bespaart."
        },
        {
          category: "Kantoor & IT",
          recommendedAnnualBudget: 800,
          justification: "De kosten betreffen Dacom teeltregistratie en RVO registratiegelden (€750 totaal). Stabiel en wettelijk noodzakelijk.",
          savingTips: "Gebruik gecombineerde opgaves efficiënt om extra adviesuren bij bemestingsplannen te minimaliseren."
        },
        {
          category: "Marketing & Verkoop",
          recommendedAnnualBudget: 0,
          justification: "Geen marketingkosten noodzakelijk voor dit agrarisch bedrijf wegens rechtstreekse leveringscontracten met de coöperaties.",
          savingTips: "Bespaar dit budget volledig. Agrarische marketing verloopt via de coöperatieve verkoop."
        },
        {
          category: "Personeel & Inhuur",
          recommendedAnnualBudget: 14000,
          justification: "Loonwerk (ploegen, maaien, mais hakselen door Schootstra) bedroeg afgelopen jaar €13.600. Loonwerk is essentieel omdat eigen machines te duur in aanschaf zijn.",
          savingTips: "Vergelijk tarieven van naburige loonbedrijven of overweeg samenwerking in een machinecoöperatie met collega-boeren."
        },
        {
          category: "Reiskosten",
          recommendedAnnualBudget: 14500,
          justification: "Bulk dieselleveranties ten behoeve van tractoren en veldmachines bedroegen €14.100. Dit is sterk afhankelijk van de olieprijzen.",
          savingTips: "Schakel over op GPS-gestuurd rijden (precision farming). Dit voorkomt overlap bij het zaaien en spuiten, waardoor je direct tot 10% diesel én zaaigoed bespaart."
        },
        {
          category: "Verzekeringen & Advies",
          recommendedAnnualBudget: 5000,
          justification: "ABAB accountant (€700), dierenarts vruchtbaarheidsbegeleiding (€830) en de Achmea Brede Weersverzekering (€3.200). Essentiële risicoafdekking.",
          savingTips: "Controleer of de Brede Weersverzekering in aanmerking komt voor de 65% RVO-subsidie. Dit kan de netto premielast enorm verlagen!"
        },
        {
          category: "Belastingen",
          recommendedAnnualBudget: 4000,
          justification: "Dit betreft de BTW afdracht. Agrarische producten vallen onder het lage BTW-tarief, terwijl inkopen vaak belast zijn met 21%. Dit zorgt voor een relatief lage netto BTW-last.",
          savingTips: "Gebruik de agrarische regelingen van de Belastingdienst optimaal in overleg met je agrarisch accountant."
        },
        {
          category: "Overige Bedrijfskosten",
          recommendedAnnualBudget: 75000,
          justification: "De grootste kostenpost van je bedrijf: Krachtvoer en mineralen van Agrifirm en ForFarmers (€64.200 totaal over het jaar) en kunstmest/zaaigoed in het voorjaar (€8.400).",
          savingTips: "Maak gebruik van weidegang in de zomermaanden. Elke dag dat de koeien vers gras in de weide vreten, bespaar je direct op duur krachtvoer in de stal."
        },
        {
          category: "Privé (Onttrekkingen/Stortingen)",
          recommendedAnnualBudget: 48000,
          justification: "Privé-onttrekkingen waren afgelopen jaar €8.000. We raden een maandelijks ondernemersloon van €4.000 aan om de maatschap fiscaal optimaal te benutten.",
          savingTips: "Maak optimaal gebruik van de landbouwvrijstelling en de zelfstandigenaftrek via je fiscaal adviseur."
        }
      ],
      strategicAdvice: [
        "Subsidieregeling Brede Weersverzekering: De Brede Weersverzekering (€3.200) dekt klimaatschade aan gewassen. Zorg ervoor dat je de RVO-subsidie hiervoor aanvraagt; de overheid vergoedt namelijk tot 65% van deze premie.",
        "Voerefficiëntie & Weidegang: Krachtvoer van Agrifirm (€64.200) drukt zwaar op de marge per liter melk. Door weidegang maximaal in te zetten en te sturen op hoogwaardig eigen ruisvoer (kuilgras/mais), kan de krachtvoeraankoop met 10% tot 15% omlaag.",
        "Precisielandbouw (GPS): Brandstof (€14.100) en kunstmest zijn grote kosten. Door te investeren in eenvoudige GPS-systemen op de tractor voorkom je overlap bij het kunstmesten en spuiten, wat direct bespaart op grondstoffen én uren loonwerk."
      ]
    }
  }
};

// Backwards compatibility fallbacks
export const MOCK_TRANSACTIONS = SECTOR_DEMO_DATA.dienstverlening.transactions;
export const MOCK_BUDGET_PROPOSAL = SECTOR_DEMO_DATA.dienstverlening.budgetProposal;
