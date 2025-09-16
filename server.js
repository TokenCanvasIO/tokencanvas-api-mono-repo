const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 10000;

app.use((req, res, next) => {
  console.log(`[MAIN PROXY] Routing request for: ${req.path}`);
  next();
});

// --- NEW RULE FOR XRPL SEARCH ---
// This rule forwards requests to your new xrpl-search-proxy.js service
app.use('/api/xrpl/search', createProxyMiddleware({ 
  target: 'http://localhost:3016', 
  changeOrigin: true,
  pathRewrite: {
    '^/api/xrpl': '', // Strips '/api/xrpl' so the target receives '/search'
  },
}));

// This rule now includes a logger to confirm it's being used.
app.use('/api/search', createProxyMiddleware({ 
  target: 'http://localhost:3003', // This points to your 'coingecko' service
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    // If you see this log, the rule is working.
    console.log('✅ [MAIN PROXY] Forwarding /api/search to CoinGecko service...');
  }
}));


app.use('/api/bithomp/nft', createProxyMiddleware({
  target: 'http://localhost:3002', 
  changeOrigin: true,
  pathRewrite: {
    '^/api/bithomp/nft': '',
  },
}));

// All other proxy rules remain the same.
app.use('/api/coingecko', createProxyMiddleware({ target: 'http://localhost:3003', changeOrigin: true }));
app.use('/api/onthedex', createProxyMiddleware({ target: 'http://localhost:3004', changeOrigin: true }));
app.use('/api/bithomp/main', createProxyMiddleware({ target: 'http://localhost:3005', changeOrigin: true }));
app.use('/api/cloudinary', createProxyMiddleware({ target: 'http://localhost:3006', changeOrigin: true }));
app.use('/api/twitter', createProxyMiddleware({ target: 'http://localhost:3007', changeOrigin: true }));
app.use('/api/xrpscan', createProxyMiddleware({ target: 'http://localhost:3008', changeOrigin: true }));
app.use('/api/nfts', createProxyMiddleware({ target: 'http://localhost:3010', changeOrigin: true }));
app.use('/api/bithomp/advanced', createProxyMiddleware({ target: 'http://localhost:3011', changeOrigin: true }));
app.use('/api/xrpl/tokenomics', createProxyMiddleware({ target: 'http://localhost:3012', changeOrigin: true }));
app.use('/api/coingecko/coins', createProxyMiddleware({ target: 'http://localhost:3013', changeOrigin: true }));
app.use('/api/google-search', createProxyMiddleware({ target: 'http://localhost:3015', changeOrigin: true }));


app.listen(PORT, () => {
  console.log(`Main proxy server listening on port ${PORT}`);
});