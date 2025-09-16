require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { createClient } = require('redis');

const app = express();
const PORT = 3012;

app.use(cors());
app.use(express.json());

const redisClient = createClient({
  url: process.env.REDIS_CONNECTION_URL
});
redisClient.on('error', err => console.log('Redis Client Error', err));
redisClient.connect();

app.get('/api/xrpl/tokenomics/:issuer/:currency', async (req, res) => {
  const { issuer, currency } = req.params;
  const cacheKey = `tokenomics_xrpscan_${issuer}_${currency}`;

  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    const apiUrl = `https://api.xrpscan.com/api/v1/account/${issuer}/ioust`;
    const response = await axios.get(apiUrl);

    if (!response.data || !Array.isArray(response.data.ious)) {
      throw new Error('IOUs data not found or in unexpected format on XRPL Scan.');
    }
    
    const token = response.data.ious.find(iou => iou.currency === currency);

    if (!token) {
        throw new Error(`Currency ${currency} not found for issuer ${issuer} on XRPL Scan.`);
    }

    const tokenomicsData = {
      issuer: token.issuer,
      currency: token.currency,
      total_supply: token.total_supply,
      circulating_supply: token.circulating_supply,
      max_supply: null,
      holders: token.holders,
      trustlines: token.trustlines,
    };

    await redisClient.setEx(cacheKey, 900, JSON.stringify(tokenomicsData));
    
    res.status(200).json(tokenomicsData);

  } catch (error) {
    const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error('XRPL Tokenomics Error:', errorMessage);
    res.status(error.response?.status || 500).json({ message: `Request failed: ${errorMessage}` });
  }
});

app.listen(PORT, () => {
  console.log(`XRPL Tokenomics service running on port ${PORT}`);
});