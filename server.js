const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 10000;

// This debug line will show us the incoming request path
app.use((req, res, next) => {
  console.log(`[PROXY] Request received for path: ${req.path}`);
  next();
});

// Helper function to create proxy options with path rewriting
const createProxyOptions = (target, path) => ({
  target,
  changeOrigin: true,
  pathRewrite: {
    [`^${path}`]: '', // Strips the base path from the request
  },
});

// Configure proxies using the helper
app.use('/api/bithomp/nft', createProxyMiddleware(createProxyOptions('http://localhost:3002', '/api/bithomp/nft')));
app.use('/api/coingecko', createProxyMiddleware(createProxyOptions('http://localhost:3003', '/api/coingecko')));
app.use('/api/onthedex', createProxyMiddleware(createProxyOptions('http://localhost:3004', '/api/onthedex')));
app.use('/api/bithomp/main', createProxyMiddleware(createProxyOptions('http://localhost:3005', '/api/bithomp/main')));
app.use('/api/cloudinary', createProxyMiddleware(createProxyOptions('http://localhost:3006', '/api/cloudinary')));
app.use('/api/twitter', createProxyMiddleware(createProxyOptions('http://localhost:3007', '/api/twitter')));
app.use('/api/xrpscan', createProxyMiddleware(createProxyOptions('http://localhost:3008', '/api/xrpscan')));
app.use('/api/nfts', createProxyMiddleware(createProxyOptions('http://localhost:3010', '/api/nfts')));

// --- ADDED THIS NEW LINE FOR THE ADVANCED BITHOMP SERVICE ---
app.use('/api/bithomp/advanced', createProxyMiddleware(createProxyOptions('http://localhost:3011', '/api/bithomp/advanced')));

app.listen(PORT, () => {
  console.log(`Main proxy server listening on port ${PORT}`);
});