export function getAllowedOrigin(req) {
  const envOrigin = process.env.ALLOWED_ORIGIN?.trim();
  if (envOrigin) return envOrigin;

  const requestOrigin = req.headers?.origin || req.headers?.['origin'];
  return requestOrigin || '*';
}

export function setCorsHeaders(res, origin = '*') {
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

export function sendJson(res, status, payload, origin = '*') {
  setCorsHeaders(res, origin);
  res.status(status).json(payload);
}

export function sendNoContent(res, origin = '*') {
  setCorsHeaders(res, origin);
  res.status(204).end();
}

export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  return await new Promise((resolve, reject) => {
    let data = '';

    req.on('data', chunk => {
      data += chunk;
    });

    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });

    req.on('error', reject);
  });
}
