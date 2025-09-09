const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 10000;

// This is the simplest possible proxy. It forwards the path untouched.
app.use('/api/bithomp/nft', createProxyMiddleware({ target: 'http://localhost:3002', changeOrigin: true }));
app.use('/api/coingecko', createProxyMiddleware({ target: 'http://localhost:3003', changeOrigin: true }));
app.use('/api/onthedex', createProxyMiddleware({ target: 'http://localhost:3004', changeOrigin: true }));
app.use('/api/bithomp/main', createProxyMiddleware({ target: 'http://localhost:3005', changeOrigin: true }));
app.use('/api/cloudinary', createProxyMiddleware({ target: 'http://localhost:3006', changeOrigin: true }));
app.use('/api/twitter', createProxyMiddleware({ target: 'http://localhost:3007', changeOrigin: true }));
app.use('/api/xrpscan', createProxyMiddleware({ target: 'http://localhost:3008', changeOrigin: true }));
app.use('/api/nfts', createProxyMiddleware({ target: 'http://localhost:3010', changeOrigin: true }));

app.listen(PORT, () => {
  console.log(`Master proxy listening on port ${PORT}`);
});