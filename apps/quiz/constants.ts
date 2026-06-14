
import { Archetype, Question } from './types';

export const ARCHETYPES: Record<string, Archetype> = {
  FLOW_CREATOR: {
    id: 'FLOW_CREATOR',
    name: 'Flow Creator',
    title: 'Intuïtief & Creatief',
    description: 'Jij leeft op energie en intuïtie. Als de flow er is, verzet je bergen, maar structuren en strakke tijdsplanningen voelen vaak als een keurslijf dat je creativiteit verstikt.',
    characteristics: [
      'Beschikt over enorme explosieve energie',
      'Vaart blind op een sterk innerlijk kompas',
      'Kan in korte tijd bergen werk verzetten',
      'Brengt vernieuwing en beweging'
    ],
    advice: 'Stel je voor:\nje wordt wakker en voelt precies waar je energie vandaag naartoe wil.\n\nIn plaats van te vechten tegen een strakke planning, surf je op je eigen golven van inspiratie. Je knalt in een paar uur meer werk weg dan anderen in een dag, om daarna zonder schuldgevoel te genieten van de zon of een goed boek.\n\nJe bent niet langer de slaaf van de klok, maar de meester van je eigen flow.\n\nDit is geen chaos, dit is Timebending®.\nOntdek hoe je jouw pieken en dalen niet als zwakte, maar als jouw grootste superkracht inzet.',
    ctaLink: 'https://www.meavia.nu/liv',
    image: '/assets/archetype-flow.png',
    videoUrl: '/assets/video-flow.mp4',
    fullReport: {
      challenges: 'Je grootste valkuil is het "alles-of-niets" patroon. Je staat "aan" als een tornado, of je ligt volledig plat. Omdat de wereld consistentie beloont, voel je je vaak schuldig over je rustmomenten. Hierdoor laad je nooit écht op, en ligt uitpassing op de loer door pure energieschommelingen.',
      growthPath: 'Stop met jezelf te forceren in een lineair 9-tot-5 ritme; dat doodt jouw vuur. Jouw goud ligt in werken op jouw hartslag: intensief creëren (sprinten), gevolgd door diepgaand herstellen. Jouw groei zit in het volledig omarmen van je cyclische natuur zonder excuses.',
      strategy: 'De Rivierbedding Strategie. Water (jouw energie) heeft oevers nodig om krachtig te stromen, anders wordt het een moeras. Bouw een minimale, rotsvaste structuur (de bedding) die jouw wilde, creatieve water richting geeft zonder het in te dammen.'
    }
  },
  TEMPO_TACTICUS: {
    id: 'TEMPO_TACTICUS',
    name: 'Tempo Tacticus',
    title: 'Gestructureerd & Efficiënt',
    description: 'Je bent de meester in lijstjes en de agenda. Je krijgt veel gedaan en bent betrouwbaar. Maar onverwachte wendingen of emotionele golfbewegingen kunnen je uit balans brengen.',
    characteristics: [
      'Meester in efficiëntie en overzicht',
      'Betrouwbaar als een rots in de branding',
      'Schept orde waar anderen chaos zien',
      'Realiseert doelen met militaire precisie'
    ],
    advice: 'Meesterschap over jouw tijd.\n\nStel je voor:\nje vinkt je laatste to-do af en voelt... rust. Geen onrust over wat er morgen moet, maar pure tevredenheid en voldoening.\n\nNiet om wat je hebt gedaan, maar om wie je bent geweest. Je werkt met laserfocus, maar zonder de gejaagdheid. Je durft de controle los te laten en te vertrouwen op het proces.\n\nJe bent veranderd van een efficiënte machine in een bezielde leider over je eigen tijd.\n\nDit is vrijheid. Dit is Timebending®.\nOntdek hoe je van "altijd aan" naar "bewust zijn" schakelt, zonder je daadkracht te vernielen.',
    ctaLink: 'https://www.meavia.nu/liv',
    image: '/assets/archetype-tempo.png',
    videoUrl: '/assets/video-tempo.mp4',
    fullReport: {
      challenges: "Je identiteit hangt sterk samen met je prestaties. 'Niets doen' voelt als falen of tijdverspilling. Je bent een ster in doorpakken, maar hierdoor ren je vaak voorbij aan wat je écht voelt. Je loopt het risico op een 'bore-out' of uitputting, niet door gebrek aan tijd, maar door gebrek aan zingeving in de rust. Je grootste gevaar is dat je aan de finishlijn staat en je leeg voelt. Controle is je kooi geworden.",
      growthPath: 'Jouw volgende niveau is niet méér doen in minder tijd, maar vertragen om te versnellen. Durf de controle los te laten. Je mag leren dat de wereld doordraait, ook als jij even pauzeert. Van Human Doing naar Human Being. Jouw groei zit in het diepe besef dat je juist méér bereikt door de teugels soms te laten vieren en te vertrouwen op de stroom.',
      strategy: 'Strategische Stilte. Voor jou ligt de echte winst niet in een nóg vollere agenda, maar in de witruimte die je durft open te laten. Zie die ruimte niet als een leegte die \'nuttig\' gevuld moet worden, maar als de strategische plek waar jouw intuïtie en wijsheid eindelijk weer spreken. Hier herstel je de verbinding tussen je ratio en je gevoel. In deze bewuste vertraging ontstaat de ruimte voor jouw meest briljante ingevingen. Dáár pakt de leider de regie terug.'
    }
  },
  VISIONARY_ARCHITECT: {
    id: 'VISIONARY_ARCHITECT',
    name: 'Visie Architect',
    title: 'Groots Denker & Dromer',
    description: 'Je ziet het grote plaatje glashelder. Je hebt dromen en ambities die reiken tot de sterren. Waar anderen obstakels zien, zie jij de weg vooruit. Jouw unieke kracht ligt in je verbeeldingskracht, maar je mag leren om jouw verre visie als een fundament te gebruiken voor je aanwezigheid in het hier en nu.',
    characteristics: [
      'Onbegrensde verbeeldingskracht',
      'Opent deuren die voor anderen gesloten lijken',
      'Pionier pur sang',
      'Inspireert anderen met een groter perspectief'
    ],
    advice: "Stel je voor:\ndie briljante visie in je hoofd is niet langer een bron van onrust, maar een fundament van waaruit je met volledige presentie handelt.\n\nJe voelt niet langer de druk om 'daar' te komen, want je bent er energetisch al. Je bent de architect die vanuit rust de realiteit vormgeeft.\n\nDit is manifestatiekracht. Dit is Timebending®.\nOntdek hoe je de frequentie van je succes nu al belichaamt, zodat de wereld zich moeiteloos naar jouw visie vouwt.",
    ctaLink: 'https://www.meavia.nu/liv',
    image: '/assets/archetype-visionary.png',
    videoUrl: '/assets/video-visionary.mp4',
    fullReport: {
      challenges: 'Je grootste valkuil is misschien wel dat je ver voor de troepen uit loopt. Jij ziet het eindresultaat al zo scherp dat je er met grote stappen op af stormt, maar je vergeet anderen er in mee te nemen. Zonder die aansluiting ontstaat er onbegrip en weerstand, waardoor mensen afhaken.',
      growthPath: 'Jouw magie mag landen Jouw groei zit in het besef dat de hoogste vorm van leiderschap niet het bereiken van de finish is, maar de kwaliteit van je aanwezigheid in het nu. Jouw meesterschap ligt in het bouwen van context: de brug slaan tussen jouw verre visie en de eerste tastbare stap voor jezelf en anderen. Vanuit die verbinding ontstaat gedragen beweging zonder jagen.',
      strategy: 'De Energetische Verankering. Jij bezit de zeldzame gave om de toekomst al als voldongen feit te ervaren. Energetisch sta jij vaak al aan de finishlijn. Jouw strategie is De Energetische Verankering: de kunst om de voldoening van die voltooide visie nu al volledig in je systeem te laten landen. Je buigt tijd door de diepe rust van het eindresultaat als jouw dagelijkse vertrekpunt te nemen, in plaats van als een punt waar je naartoe moet jagen. Door je visie te aarden in de kleinste, tastbare stap van vandaag, valt de druk van het \'moeten bereiken\' weg. Je bouwt niet langer náár je droom, maar vanuit de zekerheid dat hij er al is.'
    }
  },
  HARMONY_SEEKER: {
    id: 'HARMONY_SEEKER',
    name: 'Harmonie Zoeker',
    title: 'Verbindend & Zorgzaam',
    description: 'Jij bezit de gave om zonder woorden te voelen wat er in een ruimte speelt. Je bent de stille kracht die ervoor zorgt dat mensen zich gezien en veilig voelen. Maar doordat je antennes altijd "aan" staan voor de ander, sneeuwt jouw eigen frequentie soms onder.',
    characteristics: [
      'Voelt haarfijn aan wat een ander nodig heeft',
      'Creëert natuurlijk rust en veiligheid',
      'Meester in het lezen van onuitgesproken emoties',
      'Verbindt mensen en ideeën moeiteloos'
    ],
    advice: 'Stel je voor:\nde avond valt en je ploft niet uitgeblust op de bank, maar voelt nog energie bruisen.\n\nJe beweegt door je dag met een kalme regie, waarin jíj bepaalt waar je tijd heen gaat. De vrouw die luistert met volle aandacht en geeft vanuit overvloed.\n\nDit is geen verre droom, dit is Timebending®.\nOntdek hoe je de 6 sleutels inzet om niet alleen je grenzen te bewaken, maar voluit jouw mooiste leven te leven.\n\nZodat je stopt met leeglopen en de liefdevolle krachtpatser wordt die je in potentie al bent.',
    ctaLink: 'https://www.meavia.nu/liv',
    image: '/assets/archetype-harmony.png',
    videoUrl: '/assets/video-harmony.mp4',
    fullReport: {
      challenges: 'Jouw valkuil is niet zozeer dat je wilt pleasen, maar dat je energieën absorbeert. Je voelt de stress of het verlangen van een ander zo sterk, dat het voelt als jouw eigen urgentie. Hierdoor stap je onbewust in de actiestand voor een ander. Je raakt niet uitgeput door je eigen taken, maar door het dragen van de emotionele rugzak van je omgeving.',
      growthPath: 'Je mag leren dat jouw aanwezigheid krachtiger is als jij in je eigen centrum blijft. Het inzicht voor jou is paradoxaal: begrenzen is juist verbinden. Door selectiever te zijn in waar je \'ja\' op zegt, wordt jouw energie meer waard. Mensen hebben niets aan een uitgebluste versie van jou. Jouw groei zit in het besef dat jij de fontein bent, niet de emmer. Niet wachten tot je leeg bent, maar geven vanuit overvloed.',
      strategy: 'De Koninklijke Poortwachter. Jij bent de bewaker van jouw energiepoort. Dit betekent niet dat je mensen buiten sluit, maar dat je bewust kiest wie je wanneer binnenlaat door vertraging in te bouwen. Jouw gouden truc is de "adempauze". Leer jezelf aan om nooit direct "ja" te zeggen, maar: "Ik voel even of dit past, ik kom erop terug." Zo bescherm je je energie zonder de verbinding te verbreken.'
    }
  }
};

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Hoe begon jouw dag vandaag?",
    options: [
      { id: 'A', text: "To-do lijst, koffie erbij en gáán! Ik vloog er meteen in.", points: { TEMPO_TACTICUS: 3, VISIONARY_ARCHITECT: 1 } },
      { id: 'B', text: "Ik startte rustig, even landen voor de dag echt begon.", points: { FLOW_CREATOR: 3, HARMONY_SEEKER: 2 } },
    ]
  },
  {
    id: 2,
    text: "Op een doorsnee dag, hoe is jouw energie?",
    options: [
      { id: 'A', text: "Mijn energie voelt vrij stabiel door de dag, al is het wat vlak.", points: { TEMPO_TACTICUS: 3 } },
      { id: 'B', text: "Ik heb één duidelijk piekmoment en daar plan ik het liefst alles omheen.", points: { VISIONARY_ARCHITECT: 3, FLOW_CREATOR: 1 } },
      { id: 'C', text: "Mijn energie is vaak onvoorspelbaar, ik laat me leiden door de flow van de dag.", points: { FLOW_CREATOR: 3, HARMONY_SEEKER: 1 } },
      { id: 'D', text: "Eerlijk gezegd start ik vaak al moe, alsof mijn batterij nooit helemaal oplaadt.", points: { HARMONY_SEEKER: 3, VISIONARY_ARCHITECT: 1 } },
    ]
  },
  {
    id: 3,
    text: "Er valt onverwacht een half uurtje vrij. Wat doe je meestal?",
    options: [
      { id: 'A', text: "Ik pak meteen iets praktisch op: een taakje wegwerken voelt goed.", points: { TEMPO_TACTICUS: 3 } },
      { id: 'B', text: "Ik kies bewust voor rust: kop thee, frisse neus, gewoon even opladen.", points: { HARMONY_SEEKER: 3, FLOW_CREATOR: 1 } },
      { id: 'C', text: "Ik gebruik het voor iets dat mij blij maakt: lezen, schrijven, creatief of even iemand bellen.", points: { VISIONARY_ARCHITECT: 2, FLOW_CREATOR: 2 } },
    ]
  },
  {
    id: 4,
    text: "Een deadline komt opeens wel héél dichtbij. Hoe reageer jij?",
    options: [
      { id: 'A', text: "Rustig, want ik heb mijn werk meestal ruim voor de deadline af.", points: { TEMPO_TACTICUS: 3 } },
      { id: 'B', text: "Ik probeer de rust en harmonie te bewaren. Die zijn belangrijker dan prestatiedruk.", points: { HARMONY_SEEKER: 3, FLOW_CREATOR: 1 } },
      { id: 'C', text: "Ik vertrouw op last-minute inspiratie; die piekt vaak vlak vóór de klok slaat.", points: { VISIONARY_ARCHITECT: 3, FLOW_CREATOR: 2 } },
    ]
  },
  {
    id: 5,
    text: "Je hebt een nieuw idee of plan. Hoe streef je dit na?",
    options: [
      { id: 'A', text: "Mijn fantasie creëert erop los. Ik zie het in geuren en kleuren voor me, alsof ik er al ben.", points: { VISIONARY_ARCHITECT: 3, FLOW_CREATOR: 1 } },
      { id: 'B', text: "Ik schrijf een tijdlijn uit met details om te controleren hoe ik dat doel bereik.", points: { TEMPO_TACTICUS: 3 } },
      { id: 'C', text: "Ik kijk met wiens belangen ik ook rekening moet houden op weg naar mijn doel.", points: { HARMONY_SEEKER: 3 } },
    ]
  },
  {
    id: 6,
    text: "Hoe staat het met de tijd die je voor jezelf neemt?",
    options: [
      { id: 'A', text: "Oeps... vaak is het het eerste dat sneuvelt. Er komt altijd wel iets of iemand tussen door.", points: { HARMONY_SEEKER: 3 } },
      { id: 'B', text: "Eerlijk gezegd plan ik nooit bewust tijd voor mezelf.", points: { VISIONARY_ARCHITECT: 2, FLOW_CREATOR: 2 } },
      { id: 'C', text: "Mijn me-time is heilig!", points: { FLOW_CREATOR: 3, TEMPO_TACTICUS: 1 } },
    ]
  },
  {
    id: 7,
    text: "Je merkt dat iets op je werk of privéleven niet meer goed voor je werkt. Wat doe je dan meestal?",
    options: [
      { id: 'A', text: "Ik luister naar mijn onderbuikgevoel, en kies wat beter bij me past.", points: { FLOW_CREATOR: 3, VISIONARY_ARCHITECT: 1 } },
      { id: 'B', text: "Ik blijf wat doormodderen en pas was kleine dingen aan, tot ik echt moet ingrijpen.", points: { HARMONY_SEEKER: 3 } },
      { id: 'C', text: "Ik hou me eraan vast, want loslaten vind ik te lastig.", points: { TEMPO_TACTICUS: 2, VISIONARY_ARCHITECT: 2 } },
    ]
  },
  {
    id: 8,
    text: "Hoe ondersteun jij jezelf nu om te leven op jouw voorwaarden?",
    options: [
      { id: 'A', text: "Met lijstjes, plannen en duidelijke structuur.", points: { TEMPO_TACTICUS: 3 } },
      { id: 'B', text: "Met rituelen of momenten van zelfzorg die ik belangrijk vind.", points: { HARMONY_SEEKER: 2, FLOW_CREATOR: 2 } },
      { id: 'C', text: "Door te vertrouwen op mijn gevoel en intuïtie.", points: { VISIONARY_ARCHITECT: 3, FLOW_CREATOR: 1 } },
      { id: 'D', text: "Eerlijk gezegd: ik heb nog geen vaste manier die voor mij werkt.", points: { HARMONY_SEEKER: 1, VISIONARY_ARCHITECT: 1 } },
    ]
  },
  {
    id: 9,
    text: "Stel je voor dat jij een sleutel in handen krijgt om tijd écht naar je hand te zetten... Waar zou je die het liefst voor gebruiken?",
    options: [
      { id: 'A', text: "Meer rust en balans in mijn dagen.", points: { HARMONY_SEEKER: 3, FLOW_CREATOR: 1 } },
      { id: 'B', text: "Meer focus en resultaat zonder mezelf voorbij te rennen.", points: { TEMPO_TACTICUS: 3 } },
      { id: 'C', text: "Meer ruimte om te leven en werken op mijn eigen voorwaarden.", points: { VISIONARY_ARCHITECT: 3, FLOW_CREATOR: 2 } },
    ]
  }
];
