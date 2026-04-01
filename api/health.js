import { query } from '../lib/db.js';
import { getAllowedOrigin, json, noContent } from '../lib/http.js';

export default async function handler(request) {
  const origin = getAllowedOrigin(request);

  if (request.method === 'OPTIONS') {
    return noContent(origin);
  }

  if (request.method !== 'GET') {
    return json(405, { success: false, error: 'Method not allowed' }, origin);
  }

  try {
    await query('select 1');
    return json(200, { success: true, status: 'ok' }, origin);
  } catch (error) {
    console.error('Health check failed', error);
    return json(500, { success: false, status: 'db_error' }, origin);
  }
}
