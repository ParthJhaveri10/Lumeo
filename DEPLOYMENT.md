# Lumeo Music App - Deployment Guide

## Deploy to Vercel (Recommended for bypassing restrictions)

### Why Vercel?
- Free hosting with HTTPS
- Serverless functions act as proxy
- Your own domain hides the API source
- Fast CDN delivery worldwide

### Steps:

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel
```

4. **For production:**
```bash
vercel --prod
```

### How the bypass works:
1. All API calls go through `/api/proxy` endpoint
2. This runs as a serverless function on YOUR domain
3. The function fetches from Saavn API server-side
4. Schools/offices only see requests to your domain, not the music API
5. All traffic is HTTPS encrypted

### Configuration:
The app is configured to:
- Use proxy routes for all API calls
- Route `/api/*` through the serverless proxy
- Serve the React app from the root
- Enable CORS for all requests

### After Deployment:
You'll get a URL like: `https://lumeo-xyz.vercel.app`

This URL will work even in restricted networks because:
- It's just a regular HTTPS website
- API calls are proxied through YOUR domain
- No direct calls to music services

### Optional - Custom Domain:
Add your own domain in Vercel dashboard for even better anonymity.

### Environment Variables (if needed):
No environment variables required - it works out of the box!

## Alternative: Netlify

If you prefer Netlify:
1. Create `netlify.toml` 
2. Deploy with: `netlify deploy`
3. Same proxy concept applies

## Alternative: Railway/Render

For full control:
1. Deploy as a Node.js app
2. Use the included proxy endpoint
3. Configure reverse proxy rules
