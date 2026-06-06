const fs = require('fs');
const path = require('path');

const STEM = `Je schrijft in de stem van Kirsten van Ulden, oprichter van Timebending®.

Haar toon: warm, direct, eerlijk, zonder jargon. Ze stelt scherpe vragen maar oordeelt niet. Ze helpt mensen zien wat er werkelijk speelt, niet wat ze zouden moeten voelen of doen. Ze geeft geen adviezen of oplossingen, maar opent ruimte zodat mensen zelf tot inzicht komen.

Haar taal: gewone Nederlandse zinnen. Geen opsommingen. Geen liggend streepje (—). Geen cursustaal zoals "lessen", "weken", "het traject" of "de academie". De persoon die deze tool gebruikt doet dat zelfstandig, los van welk programma dan ook.

De 6 sleutels van Timebending® (MEAVIA) zijn het kompas. Ze geven geen antwoorden maar laten zien wat er speelt.`;


const sleutelContext = {
  M:  { naam: 'Mindset',     kern: 'De positie van waaruit iemand naar het leven kijkt. Patronen, overtuigingen, hoe je jezelf leest.' },
  E:  { naam: 'Efficiëntie', kern: 'Weten waar energie naartoe gaat en of dat klopt. Bewegen vanuit je bron, niet vanuit uitputting.' },
  A1: { naam: 'Aanpassen',   kern: 'Voelen wanneer iets veranderd is en daarop reageren vanuit jezelf. Loslaten van wat niet meer past.' },
  V:  { naam: 'Visueel',     kern: 'Richting zien en toelaten. Een beeld of gevoel van waar je naartoe wilt, ook als het nog vaag is.' },
  I:  { naam: 'Integer',     kern: 'Trouw zijn aan jezelf. Eerlijk over wat je voelt, wilt en wat voor jou klopt.' },
  A2: { naam: 'Actie',       kern: 'De juiste beweging op het juiste moment, vanuit afstemming. Onderscheiden of je uitstelt vanuit wijsheid of angst.' }
};

async function callClaude(prompt, maxTokens) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': (process.env.ANTHROPIC_API_KEY || '').trim(),
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await response.json();
  const tekst = data.content?.[0]?.text || '';
  const match = tekst.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) throw new Error('Geen geldige JSON in respons');
  return JSON.parse(match[0]);
}

function stemPrefix() {
  return STEM
    ? `Hieronder staat de stem, het taalgebruik en de methodiek van Kirsten van Timebending®.\nGebruik dit ALLEEN voor toon, stijl en aanpak. Gebruik de inhoud NOOIT als informatie over de persoon of hun situatie. Wat de persoon doet, ervaart of bedoelt staat alleen in wat zij zelf schrijven, nergens anders.\n\n${STEM}\n\n---\n\n`
    : '';
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { type, situatie, sleutel, antwoorden } = body || {};

  try {

    // Modus 1: Genereer ontdekvragen op basis van de situatie
    if (type === 'vragen') {
      if (!situatie) return res.status(400).json({ error: 'Situatie verplicht' });

      const prompt = `${stemPrefix()}Iemand beschrijft deze situatie:
"${situatie}"

Schrijf 3 vragen die echt dieper gaan op wat hier speelt. Niet breed of open, maar specifiek gericht op deze situatie. De vragen mogen iets raken wat de persoon misschien nog niet heeft gezien. Geen Timebending-jargon, geen vragen over energie of afstemming. Gewoon eerlijke vragen die helpen om de kern te vinden.

Geef per vraag 3 antwoordopties. De opties zijn kort (max 12 woorden) en herkenbaar eerlijk. Ze klinken als wat mensen echt denken, niet als mooie antwoorden. Ze mogen ook een beetje oncomfortabel zijn als dat klopt bij de situatie.

Schrijf in de stijl van Kirsten van Timebending: direct, warm, geen liggend streepje (—).

Geef alleen dit JSON terug:
{
  "vragen": [
    {
      "vraag": "De eerste vraag",
      "opties": ["Optie A", "Optie B", "Optie C"]
    },
    {
      "vraag": "De tweede vraag",
      "opties": ["Optie A", "Optie B", "Optie C"]
    },
    {
      "vraag": "De derde vraag",
      "opties": ["Optie A", "Optie B", "Optie C"]
    }
  ]
}`;

      const data = await callClaude(prompt, 800);
      return res.status(200).json(data);
    }

    // Modus 2: Bepaal sleutel op basis van antwoorden, geef persoonlijke reflectie
    if (type === 'ontdek') {
      if (!situatie || !antwoorden) return res.status(400).json({ error: 'Situatie en antwoorden verplicht' });

      const sleutelLijst = Object.entries(sleutelContext)
        .map(([k, s]) => `- ${s.naam} (${k}): ${s.kern}`)
        .join('\n');

      const antwoordTekst = antwoorden
        .map((a, i) => `Vraag ${i+1}: ${a.vraag}\nAntwoord: ${a.antwoord}`)
        .join('\n\n');

      const prompt = `${stemPrefix()}Iemand beschrijft deze situatie:
"${situatie}"

Op basis van deze situatie zijn de volgende vragen gesteld en zo beantwoord:
${antwoordTekst}

De zes sleutels van Timebending® zijn:
${sleutelLijst}

Kies de sleutel die het meest raakt aan wat hier werkelijk speelt.

Schrijf daarna een reflectie die echt ingaat op de situatie. Niet algemeen, niet breed. Benoem wat er werkelijk aan de hand is in deze specifieke situatie. Wat ziet de persoon nog niet? Wat is het patroon of de kern die hier zichtbaar wordt? Wees concreet en direct.

De drie vervolgvragen moeten verder gaan dan wat de persoon al beschreef. Ze mogen iets scherps of onverwachts raken. Geen vragen als "waar gaat je energie naartoe" of "wat heeft aandacht nodig", maar vragen die echt iets openen in deze situatie.

De beweging is geen open uitnodiging maar een concrete richting: wat is de eigenlijke verschuiving of eerste stap die hier past?

Schrijf in de stem van Kirsten: warm, direct, geen jargon, echte zinnen, geen liggend streepje (—). Minimaal 3 volle zinnen voor kern en beweging.

Geef alleen dit JSON terug:
{
  "sleutel": "de sleutelcode (M, E, A1, V, I of A2)",
  "sleutelnaam": "naam van de sleutel",
  "kern": "Minimaal 3 zinnen die benoemen wat er werkelijk speelt in deze situatie",
  "vragen": [
    "Eerste scherpe vervolgvraag die verder gaat dan de situatie",
    "Tweede vraag",
    "Derde vraag"
  ],
  "beweging": "Minimaal 2 concrete zinnen over de werkelijke verschuiving die hier past"
}`;

      const data = await callClaude(prompt, 2048);
      return res.status(200).json(data);
    }

    // Modus 3: Persoonlijke reflectie bij bekende sleutel
    if (type === 'reflectie') {
      if (!situatie || !sleutel) return res.status(400).json({ error: 'Situatie en sleutel verplicht' });

      const s = sleutelContext[sleutel];
      if (!s) return res.status(400).json({ error: 'Onbekende sleutel' });

      const prompt = `${stemPrefix()}Iemand beschrijft deze situatie:
"${situatie}"

De sleutel die hier aandacht vraagt is: ${s.naam}
Wat deze sleutel betekent: ${s.kern}

Jouw rol is niet om dit op te lossen of adviezen te geven. De sleutel is een lens waardoor je laat zien wat er onder de situatie zit, zodat de persoon zelf tot inzicht komt.

Lees de situatie goed. Neem alles wat de persoon zegt serieus en ga er niet tegenin. Ga niet veronderstellen wat er mis is of wat er moet veranderen. Gebruik de sleutel ${s.naam} om te benoemen wat er hier speelt op een dieper niveau, iets wat de persoon misschien nog niet zo heeft gezien.

De kern benoemt wat de sleutel zichtbaar maakt in deze situatie. Niet wat de persoon moet doen, maar wat er te zien is. Concreet, herkenbaar, zonder oordeel.

De drie vragen openen iets. Ze helpen de persoon zelf verder te kijken in hun eigen situatie. Geen adviezen verpakt als vraag. Geen "heb je al geprobeerd om...". Echte vragen die iets openen wat de persoon zelf nog niet heeft gezien.

De beweging is een uitnodiging, geen instructie. Wat mag de persoon zelf gaan zien of onderzoeken? Niet wat ze moeten doen.

Schrijf in de stem van Kirsten: warm, direct, geen jargon, echte zinnen, geen liggend streepje (—). Minimaal 3 volle zinnen voor kern en beweging.

Geef alleen dit JSON terug:
{
  "kern": "Minimaal 3 zinnen die benoemen wat de sleutel zichtbaar maakt in deze specifieke situatie",
  "vragen": [
    "Een vraag die iets opent wat de persoon zelf nog niet heeft gezien",
    "Tweede vraag",
    "Derde vraag"
  ],
  "beweging": "Minimaal 2 zinnen als uitnodiging om verder te kijken, niet als instructie"
}`;

      const data = await callClaude(prompt, 2048);
      return res.status(200).json(data);
    }

    // Modus 4: Verdieping op basis van het antwoord van de persoon
    if (type === 'verdieping') {
      if (!situatie || !sleutel || !antwoorden) return res.status(400).json({ error: 'Situatie, sleutel en antwoord verplicht' });

      const s = sleutelContext[sleutel];
      if (!s) return res.status(400).json({ error: 'Onbekende sleutel' });

      // antwoorden bevat hier de gespreksgeschiedenis
      const geschiedenis = antwoorden.map((a, i) =>
        `${a.rol === 'tool' ? 'Tool' : 'Persoon'}: ${a.tekst}`
      ).join('\n\n');

      const prompt = `${stemPrefix()}Dit is een lopend gesprek binnen de Timebending® methodiek.

De oorspronkelijke situatie: "${situatie}"
De sleutel die hier speelt: ${s.naam} - ${s.kern}

Het gesprek tot nu toe:
${geschiedenis}

Ga dieper in op wat de persoon zojuist heeft gezegd. Neem hun antwoord serieus en bouw daarop verder. Ga niet herhalen wat al gezegd is. Zoek naar wat er onder hun antwoord zit of wat er nog niet benoemd is.

Jouw rol is niet om op te lossen of te adviseren. Help de persoon zelf verder te zien. Gebruik de sleutel ${s.naam} als lens.

Als het antwoord van de persoon al een duidelijke richting of inzicht bevat, benoem dat dan en help hen het te verankeren. Als er nog iets onder zit, ga daar dan op in.

Sluit af met maximaal 2 gerichte vragen of één concrete uitnodiging om verder mee te gaan. Niet meer dan dat.

Schrijf in de stem van Kirsten: warm, direct, geen jargon, echte zinnen, geen liggend streepje (—). Minimaal 3 volle zinnen.

Geef alleen dit JSON terug:
{
  "verdieping": "Minimaal 3 zinnen die ingaan op wat de persoon zei en verder openen",
  "vragen": [
    "Maximaal één of twee vervolgvragen, of laat dit leeg als er een duidelijk inzicht is"
  ]
}`;

      const data = await callClaude(prompt, 2048);
      return res.status(200).json(data);
    }

    return res.status(400).json({ error: 'Onbekend type' });

  } catch (error) {
    console.error('API fout:', error.message || error);
    return res.status(500).json({ error: 'Er ging iets mis', detail: error.message });
  }
};
