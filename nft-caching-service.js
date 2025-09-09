require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { createClient } = require('redis');

const app = express();
const PORT = 3010;

const redisClient = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: { host: '127.0.0.1', port: 6379 }
});
redisClient.on('error', err => console.log('Redis Client Error', err));
redisClient.connect();

app.use(cors());

async function getAndCacheNftDetails(tokenId) {
  const apiKey = process.env.BITHOMP_API_KEY;
  if (!apiKey) throw new Error('Bithomp API Key is not configured.');
  
  const apiUrl = `https://bithomp.com/api/v2/nft/${tokenId}?uri=true&metadata=true&sellOffers=true&buyOffers=true&history=true&assets=true`;
  const response = await axios.get(apiUrl, { headers: { 'x-bithomp-token': apiKey } });

  // --- THE FIX ---
  // Validate the response from Bithomp before caching it.
  // We check for the data object and a nested property that should always exist.
  if (!response.data || !response.data.nftokenID) {
    // If the data is empty or incomplete, treat it as an error.
    // This prevents us from caching a bad response.
    throw new Error(`Incomplete data received from Bithomp for ${tokenId}`);
  }
  // --- END FIX ---

  await redisClient.setEx(`bithomp_nft_full_${tokenId}`, 3600, JSON.stringify(response.data));
  return response.data;
}

// Handles: fetchSingleNftDetails
app.get('/:tokenId', async (req, res) => {
    const { tokenId } = req.params;
    const cacheKey = `bithomp_nft_full_${tokenId}`;
    
    try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            console.log(`Cache HIT for NFT: ${tokenId}`);
            return res.status(200).json(JSON.parse(cachedData));
        }

        console.log(`Cache MISS for NFT: ${tokenId}`);
        const liveData = await getAndCacheNftDetails(tokenId);
        res.status(200).json(liveData);

    } catch (error) {
        console.error(`Error fetching details for NFT ${tokenId}:`, error.message);
        // On error, send a failure response instead of letting the request hang
        res.status(502).json({ error: 'Failed to fetch NFT details from the upstream provider.' });
    }
});

app.listen(PORT, () => {
  console.log(`NFT Caching Service running on http://localhost:${PORT}`);
});