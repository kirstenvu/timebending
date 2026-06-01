const fs = require('fs');
const path = require('path');

// Laad de stem van Kirsten (eenmalig bij opstart)
let STEM = '';
try {
  STEM = fs.readFileSync(path.join(__dirname, 'stem.txt'), 'utf-8');
} catch (e) {
  console.error('stem.txt niet gevonden:', e.message);
}

module.exports = async function handler(req, res) {
  // CORS-headers altijd instellen (ook voor OPTIONS preflight)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS preflight afhandelen
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { prompt } = body || {};

  if (!prompt) {
    return res.status(400).json({ error: 'Geen prompt meegestuurd' });
  }

  // Bouw het volledige bericht op met de stem als context
  const volledigePrompt = STEM
    ? `Hieronder staat mijn stem, mijn methodiek en mijn taalgebruik als Kirsten van Timebending®.\nGebruik dit als basis voor alles wat je schrijft.\n\n${STEM}\n\n---\n\n${prompt}`
    : prompt;

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
        max_tokens: 2000,
        messages: [{ role: 'user', content: volledigePrompt }]
      })
    });

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('API fout:', error.message || error);
    return res.status(500).json({ error: 'Er ging iets mis met de analyse', detail: error.message });
  }
}
