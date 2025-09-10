require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { createClient } = require('redis');

const app = express();
const PORT = 3003;

const redisClient = createClient({
  url: process.env.REDIS_URL 
});
redisClient.on('error', err => console.log('Redis Client Error', err));
redisClient.connect();

app.use(express.json()); 
app.use(cors());

// NEW: Helper function to create a predictable cache key
const createStableCacheKey = (prefix, params) => {
  const sortedParams = Object.keys(params).sort().reduce((obj, key) => {
    obj[key] = params[key];
    return obj;
  }, {});
  return `${prefix}_${JSON.stringify(sortedParams)}`;
};

app.post('/coins/markets', async (req, res) => {
  try {
    const params = { ...req.body };
    const cacheKey = createStableCacheKey('coingecko_markets', params);

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('Cache HIT');
      return res.status(200).json(JSON.parse(cachedData));
    }
    console.log('Cache MISS');

    const apiUrl = 'https://pro-api.coingecko.com/api/v3/coins/markets';
    const response = await axios.get(apiUrl, {
      params: { ...params, x_cg_pro_api_key: process.env.COINGECKO_API_KEY }
    });
    
    await redisClient.setEx(cacheKey, 300, JSON.stringify(response.data));
    res.status(200).json(response.data);
  } catch (error) {
    console.error('CoinGecko Proxy POST Error:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'An internal error occurred.' });
  }
});
    
app.get(/\/api\/coingecko\/.*/, async (req, res) => {
  try {
    const endpoint = req.path.substring('/api/coingecko/'.length);
    const params = { ...req.query };
    const cacheKey = createStableCacheKey(`coingecko_${endpoint}`, params);

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('Cache HIT');
      return res.status(200).json(JSON.parse(cachedData));
    }
    console.log('Cache MISS');
    
    const apiUrl = `https://pro-api.coingecko.com/api/v3/${endpoint}`;
    const response = await axios.get(apiUrl, {
      params: { ...params, x_cg_pro_api_key: process.env.COINGECKO_API_KEY }
    });
    
    await redisClient.setEx(cacheKey, 300, JSON.stringify(response.data));
    res.status(200).json(response.data);
  } catch (error) {
    console.error('CoinGecko Proxy GET Error:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'An internal error occurred.' });
  }
});

app.listen(PORT, () => {
  console.log(`CoinGecko Proxy server (Redis Fixed) running on http://localhost:${PORT}`);
});