module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { naam, onderwerp, cijfer, review, beter, overig, toestemming } = body || {};

  const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfHli6_VF2NEpCKd2C24oQt_aJ3pL1Sr4M0dyd1qVTpy5p59g/formResponse';

  const params = new URLSearchParams();
  params.append('entry.1877454650', naam || '');
  params.append('entry.1930566545', onderwerp || '');
  params.append('entry.544612005', cijfer || '');
  params.append('entry.1892157306', review || '');
  params.append('entry.1768337614', beter || '');
  params.append('entry.1736839042', overig || '');
  params.append('entry.379637694', toestemming || '');

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
