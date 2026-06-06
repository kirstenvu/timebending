const fs = require('fs');
const path = require('path');

let STEM = '';
try {
  STEM = fs.readFileSync(path.join(__dirname, 'stem.txt'), 'utf-8');
} catch (e) {
  console.error('stem.txt niet gevonden:', e.message);
}

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
    ? `Je werkt vanuit de stem, het taalgebruik en de methodiek van Kirsten van Timebending®.\n\n${STEM}\n\n---\n\n`
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

      const prompt = `${stemPrefix()}Iemand werkt met de Timebending® methodiek en beschrijft deze situatie:
"${situatie}"

Schrijf 3 korte, gerichte vragen die helpen te voelen wat er werkelijk speelt. De vragen gaan dieper in op de situatie, zonder de zes sleutels te noemen. Schrijf in de stijl van Kirsten: warm, direct, zonder jargon. Geen liggend streepje (—).

Geef per vraag ook 3 antwoordopties die specifiek aansluiten bij de beschreven situatie. De opties zijn kort (max 12 woorden), herkenbaar en eerlijk. Geen mooie woorden, maar wat mensen echt denken of voelen.

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

      const prompt = `${stemPrefix()}Iemand werkt met de Timebending® methodiek.

Situatie: "${situatie}"

${antwoordTekst}

De zes sleutels van Timebending® zijn:
${sleutelLijst}

Welke sleutel vraagt hier het meest om aandacht? Kies er één op basis van de situatie en de antwoorden.

Schrijf daarna een persoonlijke reflectie die direct aansluit op wat deze persoon beschrijft en beantwoordt. Gebruik de stem van Kirsten: warm, direct, zonder jargon, echte zinnen. Geen liggend streepje (—).

Geef alleen dit JSON terug:
{
  "sleutel": "de sleutelcode (M, E, A1, V, I of A2)",
  "sleutelnaam": "naam van de sleutel",
  "kern": "2 tot 3 zinnen die laten zien wat deze sleutel onthult in deze specifieke situatie",
  "vragen": [
    "Eerste vervolgvraag om mee te zitten, direct gerelateerd aan de beschreven situatie",
    "Tweede vraag",
    "Derde vraag"
  ],
  "beweging": "2 zinnen over wat er mag bewegen of wat een eerste stap kan zijn"
}`;

      const data = await callClaude(prompt, 1024);
      return res.status(200).json(data);
    }

    // Modus 3: Persoonlijke reflectie bij bekende sleutel
    if (type === 'reflectie') {
      if (!situatie || !sleutel) return res.status(400).json({ error: 'Situatie en sleutel verplicht' });

      const s = sleutelContext[sleutel];
      if (!s) return res.status(400).json({ error: 'Onbekende sleutel' });

      const prompt = `${stemPrefix()}Iemand werkt met de Timebending® methodiek en kiest de sleutel ${s.naam}.

Kern van deze sleutel: ${s.kern}

Wat de persoon beschrijft: "${situatie}"

Schrijf een persoonlijke reflectie die direct aansluit op wat deze persoon beschrijft. Gebruik de stem van Kirsten: warm, direct, zonder jargon, echte zinnen. Geen liggend streepje (—).

Geef alleen dit JSON terug:
{
  "kern": "2 tot 3 zinnen die laten zien wat deze sleutel onthult in deze specifieke situatie",
  "vragen": [
    "Eerste vraag om mee te zitten, direct gerelateerd aan de situatie",
    "Tweede vraag",
    "Derde vraag"
  ],
  "beweging": "2 zinnen over wat er mag bewegen of wat een eerste stap kan zijn"
}`;

      const data = await callClaude(prompt, 1024);
      return res.status(200).json(data);
    }

    return res.status(400).json({ error: 'Onbekend type' });

  } catch (error) {
    console.error('API fout:', error.message || error);
    return res.status(500).json({ error: 'Er ging iets mis', detail: error.message });
  }
};
