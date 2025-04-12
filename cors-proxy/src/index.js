export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Build target URL by removing `/proxy` from the path
    const targetUrl = `https://api.swiftsensors.net${url.pathname.replace(/^\/proxy/, '')}${url.search}`;

    // Clone and forward the request
    const newRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
      redirect: 'follow'
    });

    const response = await fetch(newRequest);

    // Add CORS headers to the response
    const modified = new Response(response.body, response);
    modified.headers.set('Access-Control-Allow-Origin', '*');
    modified.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    modified.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return modified;
  }
}

