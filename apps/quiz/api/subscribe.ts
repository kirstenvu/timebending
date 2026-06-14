import type { VercelRequest, VercelResponse } from '@vercel/node';

const FORM_MAPPING: Record<string, string> = {
  'FLOW_CREATOR': '185274412404048908',
  'TEMPO_TACTICUS': '185274421849621862',
  'VISIONARY_ARCHITECT': '185274439198311570',
  'HARMONY_SEEKER': '185272815516124607',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, archetype_id } = req.body;
  const accountId = process.env.MAILERLITE_ACCOUNT_ID;
  const formId = FORM_MAPPING[archetype_id];

  if (!formId) {
    return res.status(400).json({ error: 'Onbekend archetype' });
  }

  if (!accountId) {
    return res.status(500).json({ error: 'MailerLite account niet geconfigureerd' });
  }

  try {
    const url = `https://assets.mailerlite.com/jsonp/${accountId}/forms/${formId}/subscribe`;

    const formData = new URLSearchParams();
    formData.append('fields[name]', name);
    formData.append('email', email);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('MailerLite error:', text);
      return res.status(response.status).json({ error: 'MailerLite weigert de aanvraag' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({ error: 'Server fout bij inschrijven' });
  }
}
