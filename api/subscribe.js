module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { name, email, archetype_id } = body || {};

  const FORM_MAPPING = {
    'FLOW_CREATOR': '185274412404048908',
    'TEMPO_TACTICUS': '185274421849621862',
    'VISIONARY_ARCHITECT': '185274439198311570',
    'HARMONY_SEEKER': '185272815516124607',
  };

  const formId = FORM_MAPPING[archetype_id];
  const accountId = process.env.MAILERLITE_ACCOUNT_ID || '1098350';

  if (!formId) return res.status(400).json({ error: 'Onbekend archetype' });

  try {
    const url = `https://assets.mailerlite.com/jsonp/${accountId}/forms/${formId}/subscribe`;
    const formData = new URLSearchParams();
    formData.append('fields[name]', name);
    formData.append('email', email);

    const response = await fetch(url, { method: 'POST', body: formData });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'MailerLite weigert de aanvraag' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Subscribe fout:', error.message);
    return res.status(500).json({ error: 'Er ging iets mis' });
  }
}
