require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { createClient } = require('redis');

const app = express();
const PORT = 3009; 

let redisClient;

if (process.env.REDIS_URL) {
  // Production environment (like Render)
  redisClient = createClient({ url: process.env.REDIS_URL });
} else {
  // Local development environment
  redisClient = createClient(); 
}

redisClient.on('error', err => console.log('[XRPL Search] Redis Client Error', err));
redisClient.connect();

app.use(cors());
app.use(express.json());

const ONTHEDEX_TOKEN_LIST_CACHE_KEY = 'onthedex_full_token_list';

async function getFullTokenList() {
  try {
    const cachedData = await redisClient.get(ONTHEDEX_TOKEN_LIST_CACHE_KEY);
    if (cachedData) {
      console.log('[XRPL Search] Cache HIT for full token list.');
      return JSON.parse(cachedData);
    }

    console.log('[XRPL Search] Cache MISS for full token list. Fetching from OnTheDEX...');
    const response = await axios.get('https://api.onthedex.live/api/v2/tokens');
    const tokens = response.data?.tokens || [];
    
    if (tokens.length > 0) {
      console.log('[XRPL Search] Sample token received from OnTheDEX:', JSON.stringify(tokens[0]));
    }
    
    await redisClient.setEx(ONTHEDEX_TOKEN_LIST_CACHE_KEY, 3600, JSON.stringify(tokens));
    
    return tokens;
  } catch (error) {
    console.error('[XRPL Search] Failed to fetch token list from OnTheDEX:', error.message);
    return [];
  }
}

app.get('/search', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Search query is missing.' });
  }

  try {
    const allTokens = await getFullTokenList();
    const searchTerm = query.toLowerCase();

    const filteredTokens = allTokens.filter(token => {
      const currencyMatch = token.currency && token.currency.toLowerCase().includes(searchTerm);
      const nameMatch = token.name && token.name.toLowerCase().includes(searchTerm);
      return currencyMatch || nameMatch;
    });

    console.log(`[XRPL Search] Found ${filteredTokens.length} matches for "${query}"`);

    const formattedAssets = filteredTokens.slice(0, 25).map(asset => ({
        id: `${asset.currency}.${asset.issuer}`,
        name: asset.name || asset.currency,
        symbol: asset.currency,
        image: `https://xumm.app/avatar/${asset.issuer}_200.png`,
        isXrpl: true
    }));

    res.status(200).json({ tokens: formattedAssets });

  } catch (error) {
    console.error('[XRPL Search] An error occurred during search:', error.message);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ XRPL Search service (using OnTheDEX) running on http://localhost:${PORT}`);
});