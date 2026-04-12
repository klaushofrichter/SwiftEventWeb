const ALLOWED_ORIGINS = [
  'https://klaushofrichter.github.io',
];

function getCorsOrigin(request) {
  const origin = request.headers.get('Origin');
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return origin;
  }
  return ALLOWED_ORIGINS[0];
}

export default {
  async fetch(request, env, ctx) {
    const corsOrigin = getCorsOrigin(request);

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': corsOrigin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const url = new URL(request.url);

    // Build target URL by removing `/proxy` from the path
    const targetUrl = `https://api.swiftsensors.net${url.pathname.replace(/^\/proxy/, '')}${url.search}`;

    // Clone and forward the request
    const newRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' ? request.body : null,
      redirect: 'follow'
    });

    const response = await fetch(newRequest);

    // Add CORS headers to the response
    const modified = new Response(response.body, response);
    modified.headers.set('Access-Control-Allow-Origin', corsOrigin);
    modified.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    modified.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');

    return modified;
  }
}
