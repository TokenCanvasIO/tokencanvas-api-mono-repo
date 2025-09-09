const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 10000;

// This is the key part: matching the paths to the final destinations
const routes = {
  '/api/bithomp/nft': 'http://localhost:3002', // Note: These will be updated later
  '/api/coingecko': 'http://localhost:3003',
  '/api/onthedex': 'http://localhost:3004',
  '/api/bithomp/main': 'http://localhost:3005',
  '/api/cloudinary': 'http://localhost:3006',
  '/api/twitter': 'http://localhost:3007',
  '/api/xrpscan': 'http://localhost:3008',
  '/api/nfts': 'http://localhost:3010'
};

for (const route in routes) {
  const target = routes[route];
  app.use(route, createProxyMiddleware({ 
    target: target, 
    changeOrigin: true,
    // This removes the '/api/service' prefix to match your setup
    pathRewrite: (path, req) => {
        return path.replace(route, '');
    }
  }));
}

app.listen(PORT, () => {
  console.log(`Master proxy listening on port ${PORT}`);
});