// Proxy for all API routes - handles /api/* requests
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Extract the path after /api/ from the request URL
    const url = new URL(req.url, `http://${req.headers.host}`);
    const apiPath = url.pathname.replace(/^\/api/, ''); // Remove /api prefix
    const queryString = url.search; // Get query string with ?
    
    const apiUrl = `https://saavn.sumit.co${apiPath}${queryString}`;
    
    console.log('Proxying request to:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Lumeo-Music-App/2.0.0'
      }
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy error', message: error.message });
  }
}
