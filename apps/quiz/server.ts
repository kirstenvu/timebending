import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Allow embedding in iframes
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Content-Security-Policy', "frame-ancestors *");
    next();
  });

  // Health check for the server
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // MailerLite Subscription API Route (Public Form Submission)
  app.post('/api/subscribe', async (req, res) => {
    const { name, email, archetype_id } = req.body;

    // Mapping van archetype naar MailerLite Form ID (gebaseerd op jouw links)
    const FORM_MAPPING: Record<string, string> = {
      'FLOW_CREATOR': '185274412404048908',
      'TEMPO_TACTICUS': '185274421849621862',
      'VISIONARY_ARCHITECT': '185274439198311570',
      'HARMONY_SEEKER': '185272815516124607',
    };

    const formId = FORM_MAPPING[archetype_id];
    const accountId = '1098350'; // Gehaald uit jouw links

    if (!formId) {
      console.error('Onbekend archetype:', archetype_id);
      return res.status(400).json({ error: 'Onbekend archetype' });
    }

    try {
      // We bootsen een formulier-submissie na naar de publieke MailerLite endpoint.
      // Dit omzeilt CORS problemen en werkt zonder API-key.
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
        console.error('MailerLite Form error:', text);
        return res.status(response.status).json({ error: 'MailerLite weigert de aanvraag' });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Subscription error:', error);
      return res.status(500).json({ error: 'Server fout bij inschrijven' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
