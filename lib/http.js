export function corsHeaders(origin = '*') {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json; charset=utf-8'
  };
}

export function json(status, payload, origin = '*') {
  return new Response(JSON.stringify(payload), {
    status,
    headers: corsHeaders(origin)
  });
}

export function noContent(origin = '*') {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin)
  });
}

export function getAllowedOrigin(request) {
  const envOrigin = process.env.ALLOWED_ORIGIN?.trim();
  if (envOrigin) return envOrigin;

  const requestOrigin = request.headers.get('origin');
  return requestOrigin || '*';
}
