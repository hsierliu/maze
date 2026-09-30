export const config = {
  runtime: 'nodejs',
};

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

async function getAccessToken() {
  const appKey = requireEnv('DROPBOX_APP_KEY');
  const appSecret = requireEnv('DROPBOX_APP_SECRET');
  const refreshToken = requireEnv('DROPBOX_REFRESH_TOKEN');

  const basicAuth = Buffer.from(`${appKey}:${appSecret}`, 'utf8').toString('base64');

  const res = await fetch('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Dropbox token refresh failed (${res.status}): ${text || res.statusText}`);
  }

  const data = await res.json();
  if (!data.access_token) throw new Error('No access_token returned from Dropbox');
  return data.access_token;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const accessToken = await getAccessToken();
    // Keep the response minimal; client uses this token to upload directly to Dropbox.
    res.status(200).json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err?.message || 'Failed to get Dropbox token' });
  }
}

