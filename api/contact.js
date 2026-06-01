module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { naam, email } = body || {};

  if (!naam || !email) return res.status(400).json({ error: 'Naam en e-mail zijn verplicht' });

  const API_KEY = process.env.MAILERLITE_API_KEY;
  const GROUP_ID = process.env.MAILERLITE_GROUP_ID;

  if (!API_KEY) return res.status(500).json({ error: 'MailerLite niet geconfigureerd' });

  try {
    // Subscriber toevoegen aan MailerLite
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        email: email,
        fields: { name: naam },
        groups: GROUP_ID ? [GROUP_ID] : []
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('MailerLite fout:', data);
      return res.status(500).json({ error: 'Inschrijving mislukt' });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Contact fout:', error.message);
    return res.status(500).json({ error: 'Er ging iets mis' });
  }
}
