const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 10000;

const routes = {
  '/api/bithomp/nft/': 'http://localhost:3002',
  '/api/coingecko/': 'http://localhost:3003',
  '/api/onthedex/': 'http://localhost:3004',
  '/api/bithomp/main/': 'http://localhost:3005',
  '/api/cloudinary/': 'http://localhost:3006',
  '/api/twitter/': 'http://localhost:3007',
  '/api/xrpscan/': 'http://localhost:3008',
  '/api/nfts/': 'http://localhost:3010'
};

for (const route in routes) {
  const target = routes[route];
  app.use(route, createProxyMiddleware({ 
    target: target, 
    changeOrigin: true
    // The incorrect pathRewrite line has been removed
  }));
}

app.listen(PORT, () => {
  console.log(`Master proxy listening on port ${PORT}`);
});