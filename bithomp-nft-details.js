require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { createClient } = require('redis');

const app = express();
const PORT = 3002;

const redisClient = createClient({
  url: process.env.REDIS_CONNECTION_URL 
});
redisClient.on('error', err => console.log('Redis Client Error', err));
redisClient.connect();

app.use(cors());

// --- THIS IS THE NEW LOGGING MIDDLEWARE ---
// It will run for every request that reaches this server.
app.use((req, res, next) => {
  console.log(`[Bithomp NFT Details Service] Received request for path: ${req.originalUrl}`);
  next(); // Continue to the next route handler
});
// --- END OF NEW MIDDLEWARE ---


// Helper function to create a predictable cache key
const createStableCacheKey = (prefix, params) => {
  const sortedParams = Object.keys(params).sort().reduce((obj, key) => {
    obj[key] = params[key];
    return obj;
  }, {});
  return `${prefix}_${JSON.stringify(sortedParams)}`;
};

app.get('/:nftId', async (req, res) => {
  try {
    const { nftId } = req.params;
    if (!nftId) {
      return res.status(400).json({ message: 'Error: NFTokenID is required.' });
    }

    const cacheKey = `bithomp_nft_full_${nftId}`;
    
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        console.log(`Cache HIT for Bithomp NFT: ${cacheKey}`);
        return res.status(200).json(JSON.parse(cachedData));
    }
    console.log(`Cache MISS for Bithomp NFT: ${cacheKey}`);

    const apiKey = process.env.BITHOMP_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Bithomp API Key is not configured.' });
    }

    const apiUrl = `https://bithomp.com/api/v2/nft/${nftId}?uri=true&metadata=true&sellOffers=true&buyOffers=true&history=true&assets=true`;
    
    const response = await axios.get(apiUrl, {
      headers: { 'x-bithomp-token': apiKey }
    });

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(response.data));

    res.status(200).json(response.data);

  } catch (error) {
    console.error('Bithomp Proxy Error:', error.message);
    const status = error.response ? error.response.status : 500;
    res.status(status).json(error.response?.data || { message: 'An internal error occurred.' });
  }
});

app.listen(PORT, () => {
  console.log(`Bithomp NFT Proxy (Redis enabled) running on http://localhost:${PORT}`);
});
