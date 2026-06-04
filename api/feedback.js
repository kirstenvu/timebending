module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { naam, onderwerp, cijfer, review, beter, overig, toestemming } = body || {};

  const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSevDF6rZ6DuzncGKC2LW5gmlaBiApe74mnyf_DLBY-lLbsXHw/formResponse';

  const params = new URLSearchParams();
  params.append('entry.431895249', naam || '');
  params.append('entry.946278155', onderwerp || '');
  params.append('entry.776613450', cijfer || '');
  params.append('entry.1468011716', review || '');
  params.append('entry.573494669', beter || '');
  params.append('entry.2145780264', overig || '');
  params.append('entry.1368210254', toestemming || '');

  try {
    await fetch(FORM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Feedback fout:', error.message);
    return res.status(500).json({ error: 'Er ging iets mis' });
  }
}
