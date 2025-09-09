const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 10000;

// This new setup explicitly defines each proxy rule for clarity and correctness.

app.use('/api/bithomp/nft', createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: {'^/api/bithomp/nft' : ''}
}));

app.use('/api/coingecko', createProxyMiddleware({
    target: 'http://localhost:3003',
    changeOrigin: true,
    pathRewrite: {'^/api/coingecko' : ''}
}));

app.use('/api/onthedex', createProxyMiddleware({
    target: 'http://localhost:3004',
    changeOrigin: true,
    pathRewrite: {'^/api/onthedex' : ''}
}));

app.use('/api/bithomp/main', createProxyMiddleware({
    target: 'http://localhost:3005',
    changeOrigin: true,
    pathRewrite: {'^/api/bithomp/main' : ''}
}));

app.use('/api/cloudinary', createProxyMiddleware({
    target: 'http://localhost:3006',
    changeOrigin: true,
    pathRewrite: {'^/api/cloudinary' : ''}
}));

app.use('/api/twitter', createProxyMiddleware({
    target: 'http://localhost:3007',
    changeOrigin: true,
    pathRewrite: {'^/api/twitter' : ''}
}));

app.use('/api/xrpscan', createProxyMiddleware({
    target: 'http://localhost:3008',
    changeOrigin: true,
    pathRewrite: {'^/api/xrpscan' : ''}
}));

app.use('/api/nfts', createProxyMiddleware({
    target: 'http://localhost:3010',
    changeOrigin: true,
    pathRewrite: {'^/api/nfts' : ''}
}));


app.listen(PORT, () => {
  console.log(`Master proxy listening on port ${PORT}`);
});