require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { createClient } = require('redis');

const app = express();
const PORT = 3013; // Using a new port

app.use(cors());
app.use(express.json());

// --- Redis Connection ---
const redisClient = createClient({
  url: process.env.REDIS_CONNECTION_URL
});
redisClient.on('error', err => console.log('Redis Client Error', err));
redisClient.connect();

// --- API Endpoint for Coin Details ---
app.get('/api/coingecko/coins/:id', async (req, res) => {
  const { id } = req.params;
  const cacheKey = `coingecko_details_${id}`;

  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log(`[CoinGecko Details] Cache HIT for: ${id}`);
      return res.status(200).json(JSON.parse(cachedData));
    }

    console.log(`[CoinGecko Details] Cache MISS for: ${id}`);

    const apiUrl = `https://pro-api.coingecko.com/api/v3/coins/${id}`;
    const response = await axios.get(apiUrl, {
      params: {
        x_cg_pro_api_key: process.env.COINGECKO_API_KEY,
        localization: false,
        tickers: false,
        market_data: false, // We only need the contract address and basic info
        community_data: false,
        developer_data: false,
        sparkline: false
      }
    });

    // Save to cache for 1 hour (3600 seconds)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(response.data));
    
    res.status(200).json(response.data);

  } catch (error) {
    console.error('[CoinGecko Details] Error:', error.response ? error.response.data : error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'An internal error occurred.' });
  }
});

app.listen(PORT, () => {
  console.log(`CoinGecko Details service running on port ${PORT}`);
});