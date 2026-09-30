import 'dotenv/config';
import express from 'express';
import { Dropbox } from 'dropbox';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT || 5175);

const {
  DROPBOX_APP_KEY,
  DROPBOX_APP_SECRET,
  DROPBOX_REFRESH_TOKEN,
} = process.env;

function requireEnv(name, value) {
  if (!value) throw new Error(`Missing required env var: ${name}`);
}

requireEnv('DROPBOX_APP_KEY', DROPBOX_APP_KEY);
requireEnv('DROPBOX_APP_SECRET', DROPBOX_APP_SECRET);
requireEnv('DROPBOX_REFRESH_TOKEN', DROPBOX_REFRESH_TOKEN);

async function getAccessToken() {
  const basicAuth = Buffer.from(`${DROPBOX_APP_KEY}:${DROPBOX_APP_SECRET}`, 'utf8').toString('base64');

  const res = await fetch('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: DROPBOX_REFRESH_TOKEN,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Dropbox token refresh failed (${res.status}): ${text || res.statusText}`);
  }

  const data = await res.json();
  if (!data.access_token) throw new Error('Dropbox token refresh returned no access_token');
  return data.access_token;
}

async function getDropboxClient() {
  const accessToken = await getAccessToken();
  return new Dropbox({ accessToken });
}

const app = express();

// ---- API routes ----
app.get('/api/dropbox/token', async (_req, res) => {
  try {
    const accessToken = await getAccessToken();
    res.json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).send(err?.message || 'Failed to get Dropbox token');
  }
});

// For raw binary uploads (screen recordings can be large).
app.post(
  '/api/dropbox/upload',
  express.raw({ type: '*/*', limit: process.env.UPLOAD_LIMIT || '2048mb' }),
  async (req, res) => {
    try {
      const filenameHeader = req.header('X-Dropbox-Filename');
      const filename = filenameHeader ? decodeURIComponent(filenameHeader) : null;
      if (!filename) return res.status(400).send('Missing X-Dropbox-Filename header');

      const body = req.body;
      if (!body || !(body instanceof Buffer) || body.length === 0) {
        return res.status(400).send('Empty upload body');
      }

      const dbx = await getDropboxClient();
      const fullPath = `/${filename}`; // root only (no subfolders)

      const response = await dbx.filesUpload({
        path: fullPath,
        contents: body,
        mode: 'overwrite',
      });

      res.json(response.result);
    } catch (err) {
      console.error(err);
      res.status(500).send(err?.message || 'Upload failed');
    }
  }
);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// ---- Static frontend (production) ----
// In production we serve the built Vite app from /dist.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

app.use(express.static(distDir));
// Express v5 doesn't accept "*" as a path pattern.
app.get(/^(?!\/api\/).*/, (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

