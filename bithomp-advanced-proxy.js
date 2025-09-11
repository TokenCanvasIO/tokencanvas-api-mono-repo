require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { createClient } = require('redis');

const app = express();
const PORT = 3011;

// --- Redis Connection (Conditional Password) ---
const redisOptions = {
  socket: { host: '127.0.0.1', port: 6379 }
};
if (process.env.NODE_ENV === 'production') {
  redisOptions.password = process.env.REDIS_PASSWORD;
}
const redisClient = createClient({
  url: process.env.REDIS_CONNECTION_URL 
});
redisClient.on('error', err => console.log('Redis Client Error', err));
redisClient.connect();

app.use(cors());

// --- ENDPOINT 1: Get Top Holders for an NFT Collection ---
app.get('/holders/:issuer/:taxon', async (req, res) => {
  const { issuer, taxon } = req.params;
  const cacheKey = `bithomp_holders_${issuer}_${taxon}`;
  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log(`Cache HIT for Bithomp Holders: ${cacheKey}`);
      return res.status(200).json(JSON.parse(cachedData));
    }
    console.log(`Cache MISS for Bithomp Holders: ${cacheKey}`);
    const apiKey = process.env.BITHOMP_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'API Key is not configured.' });

    const apiUrl = `https://bithomp.com/api/v2/nfts/holders`;
    const response = await axios.get(apiUrl, {
      headers: { 'x-bithomp-token': apiKey },
      params: { issuer, taxon, limit: 100 }
    });
    await redisClient.setEx(cacheKey, 900, JSON.stringify(response.data));
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Bithomp Holders Proxy Error:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'An internal error occurred.' });
  }
});

// --- NEW ENDPOINT 2: Get Issuer Activity ---
app.get('/activity/:issuer', async (req, res) => {
  const { issuer } = req.params;
  const cacheKey = `bithomp_activity_${issuer}`;
  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log(`Cache HIT for Bithomp Activity: ${cacheKey}`);
      return res.status(200).json(JSON.parse(cachedData));
    }
    console.log(`Cache MISS for Bithomp Activity: ${cacheKey}`);
    const apiKey = process.env.BITHOMP_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'API Key is not configured.' });

    const apiUrl = `https://bithomp.com/api/v2/nfts/issuer-activity`;
    const response = await axios.get(apiUrl, {
      headers: { 'x-bithomp-token': apiKey },
      params: { issuer, limit: 50 } // Fetch the last 50 activity events
    });
    await redisClient.setEx(cacheKey, 900, JSON.stringify(response.data));
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Bithomp Activity Proxy Error:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'An internal error occurred.' });
  }
});

app.listen(PORT, () => {
  console.log(`Bithomp Advanced Proxy running on http://localhost:${PORT}`);
});