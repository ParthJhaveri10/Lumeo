// Catch-all proxy for all API routes
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
    // Get the path from the URL (everything after /api/)
    const pathSegments = req.query.path || [];
    const apiPath = Array.isArray(pathSegments) ? `/${pathSegments.join('/')}` : `/${pathSegments}`;
    
    // Construct the full API URL with query parameters
    const queryString = new URLSearchParams(req.query);
    queryString.delete('path'); // Remove the path param
    const queryPart = queryString.toString() ? `?${queryString.toString()}` : '';
    
    const apiUrl = `https://saavn.sumit.co${apiPath}${queryPart}`;
    
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
    res.status(500).json({ error: 'Proxy error', message: error.message });
  }
}
