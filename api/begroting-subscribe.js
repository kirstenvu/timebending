// Vercel serverless function: neemt naam + e-mailadres van de opt-in gate in
// de Begrotingsplanner (timebending.vercel.app/begroting) en zet ze door naar
// MailerLite, los van (en zonder enig contact met) de financiële data die de
// deelnemer verderop in de app invoert, die blijft altijd lokaal in de browser.
//
// Vereiste omgevingsvariabele (instellen in het Vercel-project "timebending",
// nooit in de code of git zetten):
//   MAILERLITE_API_KEY    te vinden in MailerLite onder
//                         Integrations -> API (Bearer token)
//   MAILERLITE_GROUP_ID   (optioneel) ID van de groep waar nieuwe
//                         aanmeldingen aan toegevoegd moeten worden

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { name, email } = body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'Ongeldig e-mailadres' });
  }

  const apiKey = process.env.MAILERLITE_API_KEY;
  const groupId = process.env.MAILERLITE_GROUP_ID;

  if (!apiKey) {
    console.warn('MailerLite niet geconfigureerd (MAILERLITE_API_KEY ontbreekt).');
    return res.status(200).json({ ok: true, synced: false });
  }

  try {
    const subscriberBody = {
      email,
      fields: { name: name || '' },
    };
    if (groupId) {
      subscriberBody.groups = [groupId];
    }

    const subRes = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(subscriberBody),
    });

    if (!subRes.ok) {
      const text = await subRes.text().catch(() => '');
      console.error('MailerLite subscribers mislukt:', subRes.status, text);
      return res.status(200).json({ ok: true, synced: false });
    }

    return res.status(200).json({ ok: true, synced: true });
  } catch (error) {
    console.error('MailerLite koppeling error:', error.message);
    return res.status(200).json({ ok: true, synced: false });
  }
}
