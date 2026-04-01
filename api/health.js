import { query } from '../lib/db.js';
import { getAllowedOrigin, sendJson, sendNoContent } from '../lib/http.js';

export default async function handler(req, res) {
  const origin = getAllowedOrigin(req);

  if (req.method === 'OPTIONS') {
    return sendNoContent(res, origin);
  }

  if (req.method !== 'GET') {
    return sendJson(res, 405, { success: false, error: 'Method not allowed' }, origin);
  }

  try {
    await query('select 1');
    return sendJson(res, 200, { success: true, status: 'ok' }, origin);
  } catch (error) {
    console.error('Health check failed', error);
    return sendJson(res, 500, { success: false, status: 'db_error', error: error.message }, origin);
  }
}
