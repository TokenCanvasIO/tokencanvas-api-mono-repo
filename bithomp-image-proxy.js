require('dotenv').config();
const http = require('http');
const https = require('https');
const url = require('url');

const server = http.createServer((req, res) => {
    // --- CORS Headers: Allow requests from any origin ---
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // --- Handle pre-flight OPTIONS request for CORS ---
    if (req.method === 'OPTIONS') {
        res.writeHead(204); // No Content
        res.end();
        return;
    }
    
    // --- Main Proxy Logic ---
    const requestUrl = url.parse(req.url, true);

    // ✅ THIS IS THE ONLY LINE THAT CHANGES
    const imageId = requestUrl.pathname.replace('/image-proxy/', '');

    if (!imageId) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Bad Request: No image ID provided.');
        return;
    }

    const bithompUrl = `https://cdn.bithomp.com/image/${imageId}`;
    // console.log(`Proxying to: ${bithompUrl}`); // Optional: Uncomment for debugging

    https.get(bithompUrl, (bithompRes) => {
        // --- Forward Bithomp's headers (like Content-Type) to the client ---
        res.writeHead(bithompRes.statusCode, bithompRes.headers);
        // --- Pipe the image data directly to the client ---
        bithompRes.pipe(res);
    }).on('error', (e) => {
        console.error(`Proxy error: ${e.message}`);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    });
});

const PORT = 3010; // Use a new port for this service
server.listen(PORT, () => {
    console.log(`Bithomp Image Proxy running on http://localhost:${PORT}`);
});