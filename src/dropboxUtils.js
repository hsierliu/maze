import { Dropbox } from 'dropbox';

async function getDropboxAccessToken() {
  const res = await fetch('/api/dropbox/token', { method: 'GET' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to get Dropbox token (${res.status}): ${text || res.statusText}`);
  }
  const data = await res.json();
  if (!data?.accessToken) throw new Error('Dropbox token endpoint returned no accessToken');
  return data.accessToken;
}

async function uploadSmallFile(dbx, file) {
  return await dbx.filesUpload({
    path: `/${file.name}`,
    contents: file,
    mode: 'overwrite',
  });
}

async function uploadLargeFileWithSession(dbx, file) {
  // Dropbox upload sessions: https://www.dropbox.com/developers/documentation/http/documentation#files-upload_session-start
  // Use an 8MB chunk size (must be a multiple of 4MB).
  const CHUNK_SIZE = 8 * 1024 * 1024;
  let offset = 0;

  const firstChunk = file.slice(0, CHUNK_SIZE);
  const startRes = await dbx.filesUploadSessionStart({
    close: false,
    contents: await firstChunk.arrayBuffer(),
  });
  const sessionId = startRes.result.session_id;
  offset += firstChunk.size;

  while (offset + CHUNK_SIZE < file.size) {
    const chunk = file.slice(offset, offset + CHUNK_SIZE);
    await dbx.filesUploadSessionAppendV2({
      cursor: { session_id: sessionId, offset },
      close: false,
      contents: await chunk.arrayBuffer(),
    });
    offset += chunk.size;
  }

  const lastChunk = file.slice(offset, file.size);
  const finishRes = await dbx.filesUploadSessionFinish({
    cursor: { session_id: sessionId, offset },
    commit: {
      path: `/${file.name}`,
      mode: 'overwrite',
      autorename: false,
      mute: false,
      strict_conflict: false,
    },
    contents: await lastChunk.arrayBuffer(),
  });

  return finishRes;
}

// Upload a file directly from the browser to Dropbox (production-safe on Vercel).
// Vercel Functions are used only to mint a short-lived access token.
export const uploadToDropbox = async (file) => {
  const accessToken = await getDropboxAccessToken();
  const dbx = new Dropbox({ accessToken });

  // `filesUpload` supports up to 150MB; use sessions for larger recordings.
  const SINGLE_UPLOAD_LIMIT = 140 * 1024 * 1024;
  const res =
    file.size <= SINGLE_UPLOAD_LIMIT
      ? await uploadSmallFile(dbx, file)
      : await uploadLargeFileWithSession(dbx, file);

  return res.result;
};

// Download a file from Dropbox
export const downloadFromDropbox = async (path) => {
  try {
    const accessToken = await getDropboxAccessToken();
    const dbx = new Dropbox({ accessToken });
    const response = await dbx.filesDownload({ path });
    return response.result;
  } catch (error) {
    console.error('Error downloading from Dropbox:', error);
    throw error;
  }
};

// List files in a Dropbox folder
export const listDropboxFiles = async (path = '/') => {
  try {
    const accessToken = await getDropboxAccessToken();
    const dbx = new Dropbox({ accessToken });
    const response = await dbx.filesListFolder({ path });
    return response.result.entries;
  } catch (error) {
    console.error('Error listing Dropbox files:', error);
    throw error;
  }
};

// Delete a file from Dropbox
export const deleteFromDropbox = async (path) => {
  try {
    const accessToken = await getDropboxAccessToken();
    const dbx = new Dropbox({ accessToken });
    const response = await dbx.filesDeleteV2({ path });
    return response.result;
  } catch (error) {
    console.error('Error deleting from Dropbox:', error);
    throw error;
  }
};

// Create a shared link for a file
export const createSharedLink = async (path) => {
  try {
    const accessToken = await getDropboxAccessToken();
    const dbx = new Dropbox({ accessToken });
    const response = await dbx.sharingCreateSharedLinkWithSettings({
      path,
      settings: { requested_visibility: 'public' },
    });
    return response.result;
  } catch (error) {
    console.error('Error creating shared link:', error);
    throw error;
  }
};
