const fs = require('fs');
const path = require('path');

let STEM = '';
try {
  STEM = fs.readFileSync(path.join(__dirname, 'stem.txt'), 'utf-8');
} catch (e) {
  console.error('stem.txt niet gevonden:', e.message);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { kortetermijn, langetermijn } = body || {};

  if (!kortetermijn || !langetermijn) {
    return res.status(400).json({ error: 'Beide intenties zijn nodig' });
  }

  const prompt = `${STEM ? `Hieronder staat mijn stem, mijn methodiek en mijn taalgebruik als Kirsten van Timebending®.\nGebruik dit als basis voor alles wat je schrijft.\n\n${STEM}\n\n---\n\n` : ''}

Een deelnemer van het LIV-traject heeft de volgende twee intenties beschreven:

KORTE TERMIJN (voor dit traject):
"${kortetermijn}"

LANGE TERMIJN (voor de verdere toekomst):
"${langetermijn}"

Schrijf nu twee afzonderlijke intentieteksten — één voor de korte termijn en één voor de lange termijn.

Elke intentie:
- Is geschreven in de ik-vorm, vanuit de toekomst alsof het al werkelijkheid is
- Is warm, specifiek en voelt energetisch krachtig
- Bevat de essentie van wat de deelnemer beschreef, maar concreter en belichaamd
- Is 3 tot 5 zinnen lang
- Gebruikt geen coaching-clichés of vage termen
- Klinkt als Kirstens stem: warm, direct, zonder zweverigheid

Geef de output als JSON in dit formaat:
{
  "kortetermijn": "...",
  "langetermijn": "..."
}

Geef alleen de JSON terug, geen uitleg of inleiding.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': (process.env.ANTHROPIC_API_KEY || '').trim(),
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const tekst = data?.content?.[0]?.text || '';

    const jsonMatch = tekst.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'Geen geldige intentie gegenereerd' });

    const intenties = JSON.parse(jsonMatch[0]);
    return res.status(200).json(intenties);

  } catch (error) {
    console.error('API fout:', error.message || error);
    return res.status(500).json({ error: 'Er ging iets mis', detail: error.message });
  }
};
