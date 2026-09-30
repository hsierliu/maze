export const config = { api: { bodyParser: false }, maxDuration: 60 };

import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

export const CHUNK_SIZE = 4 * 1024 * 1024;
const MAX_SIZE = 2 * 1024 * 1024 * 1024;
const fail = (status, message) => Object.assign(new Error(message), { status });

function env(name) {
  const value = process.env[name];
  if (!value) throw fail(503, 'Recording storage is not configured.');
  return value;
}

function signature(payload) {
  return createHmac('sha256', env('DROPBOX_APP_SECRET'))
    .update(`maze-recording-upload-v1:${payload}`).digest();
}

function sign(state) {
  const payload = Buffer.from(JSON.stringify(state)).toString('base64url');
  return `${payload}.${signature(payload).toString('base64url')}`;
}

function verify(ticket) {
  if (typeof ticket !== 'string' || ticket.length > 4096) throw fail(400, 'Invalid upload.');
  const parts = ticket.split('.');
  if (parts.length !== 2) throw fail(400, 'Invalid upload.');
  const expected = signature(parts[0]);
  const actual = Buffer.from(parts[1], 'base64url');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    throw fail(400, 'Invalid upload.');
  }
  let state;
  try { state = JSON.parse(Buffer.from(parts[0], 'base64url').toString()); }
  catch { throw fail(400, 'Invalid upload.'); }
  if (state.expires < Date.now()) throw fail(410, 'Upload expired. Please upload again.');
  return state;
}

async function accessToken() {
  const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: env('DROPBOX_REFRESH_TOKEN'),
      client_id: env('DROPBOX_APP_KEY'),
      client_secret: env('DROPBOX_APP_SECRET'),
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw fail(502, 'Recording storage is unavailable.');
  const data = await response.json();
  if (!data.access_token) throw fail(502, 'Recording storage is unavailable.');
  return data.access_token;
}

async function upload(route, args, body) {
  const token = await accessToken();
  const response = await fetch(`https://content.dropboxapi.com/2/files/upload_session/${route}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify(args),
    },
    body,
    signal: AbortSignal.timeout(40000),
  });
  // Never expose upstream error bodies, credentials, or file metadata.
  if (!response.ok) throw fail(502, 'Recording upload failed. Please try uploading again.');
  return response;
}

async function readBody(req, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.from(chunk);
    size += buffer.length;
    if (size > limit) throw fail(413, 'Upload request is too large.');
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

async function uploadHandler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      throw fail(405, 'Method not allowed.');
    }
    // Defense in depth for browsers, not authentication or bot protection.
    if (req.headers['sec-fetch-site'] === 'cross-site') throw fail(403, 'Cross-site upload denied.');
    const action = new URL(req.url, 'http://localhost').searchParams.get('action');
    if (!['start', 'chunk', 'finish'].includes(action)) throw fail(400, 'Invalid upload action.');
    if (action === 'start') {
      if (req.headers['content-type'] !== 'application/json') throw fail(415, 'Expected JSON.');
      let input;
      try { input = JSON.parse((await readBody(req, 1024)).toString()); }
      catch (error) { if (error.status) throw error; throw fail(400, 'Invalid upload details.'); }
      const { name, size } = input || {};
      if (typeof name !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,179}\.(mp4|webm)$/.test(name) ||
          !Number.isSafeInteger(size) || size < 1 || size > MAX_SIZE) {
        throw fail(400, 'Use a valid MP4 or WebM filename and a recording no larger than 2 GB.');
      }
      const path = `/${randomUUID()}_${name}`;
      const response = await upload('start', { close: false }, Buffer.alloc(0));
      const { session_id: sessionId } = await response.json();
      if (!sessionId) throw fail(502, 'Recording upload could not start.');
      return res.status(200).json({ ticket: sign({ sessionId, path, size, offset: 0, expires: Date.now() + 6 * 60 * 60 * 1000 }) });
    }
    const state = verify(req.headers['x-upload-ticket']);
    if (req.headers['content-type'] !== 'application/octet-stream') throw fail(415, 'Expected recording data.');
    const body = await readBody(req, action === 'chunk' ? CHUNK_SIZE : 0);
    if (action === 'chunk') {
      if (!body.length || state.offset + body.length > state.size) throw fail(400, 'Invalid recording chunk size.');
      await upload('append_v2', { cursor: { session_id: state.sessionId, offset: state.offset }, close: false }, body);
      return res.status(200).json({ ticket: sign({ ...state, offset: state.offset + body.length }) });
    }
    if (state.offset !== state.size) throw fail(400, 'Recording upload is incomplete.');
    await upload('finish', {
      cursor: { session_id: state.sessionId, offset: state.offset },
      commit: { path: state.path, mode: { '.tag': 'add' }, autorename: false, strict_conflict: true },
    }, Buffer.alloc(0));
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(error.status || 502).json({ error: error.status ? error.message : 'Recording storage is unavailable. Please try again.' });
  }
}

// Keep the retired token URL closed while serving both URLs from one function.
export default function handler(req, res) {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (pathname === '/api/dropbox/upload') return uploadHandler(req, res);
  res.setHeader('Cache-Control', 'no-store');
  if (pathname === '/api/dropbox/token') {
    return res.status(410).json({ error: 'This endpoint has been removed. Reload the app to upload recordings.' });
  }
  return res.status(404).json({ error: 'Not found.' });
}
