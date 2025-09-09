require('dotenv').config();
// /functions/onthedex-proxy.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { createClient } = require('redis');

const app = express();
const PORT = 3004;

// Set up the Redis client
const redisClient = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: { host: '127.0.0.1', port: 6379 }
});
redisClient.on('error', err => console.log('Redis Client Error', err));
redisClient.connect();

app.use(cors());

// Helper function to create a predictable cache key
const createStableCacheKey = (prefix, params) => {
  const sortedParams = Object.keys(params).sort().reduce((obj, key) => {
    obj[key] = params[key];
    return obj;
  }, {});
  return `${prefix}_${JSON.stringify(sortedParams)}`;
};

app.get('/api/onthedex/ohlc', async (req, res) => {
  try {
    const clientParams = req.query;
    const cacheKey = createStableCacheKey('onthedex', clientParams);

    // Check Redis for cached data
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log(`Cache HIT for OnTheDEX: ${cacheKey}`);
      return res.status(200).json(JSON.parse(cachedData));
    }
    console.log(`Cache MISS for OnTheDEX: ${cacheKey}`);

    const apiUrl = 'https://api.onthedex.live/public/v1/ohlc';
    
    const response = await axios.get(apiUrl, { params: clientParams });

    // Save the successful response to Redis with a 5-minute expiration
    await redisClient.setEx(cacheKey, 300, JSON.stringify(response.data));
    
    res.status(200).json(response.data);

  } catch (error) {
    console.error('OnTheDEX Proxy Error:', error.message);
    const status = error.response ? error.response.status : 500;
    res.status(status).json(error.response?.data || { message: 'An internal error occurred.' });
  }
});

app.listen(PORT, () => {
  console.log(`OnTheDEX Proxy (Redis enabled) running on http://localhost:${PORT}`);
});