// functions/google-search-proxy.cjs# --- START OF SCRIPT ---
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

// Correctly locate the .env file from the project root
dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });

const app = express();
const PORT = 3013;

// This service does not need app.use(cors()) because Nginx handles it.

app.get('/api/google-search', async (req, res) => {
  const { query } = req.query;
  const apiKey = process.env.GOOGLE_API_KEY;
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !searchEngineId) {
    return res.status(500).json({ message: 'API Key or Search Engine ID is not configured.' });
  }

  if (!query) {
    return res.status(400).json({ message: 'Search query is required.' });
  }

  const apiUrl = 'https://www.googleapis.com/customsearch/v1';

  try {
    const response = await axios.get(apiUrl, {
      params: {
        key: apiKey,
        cx: searchEngineId,
        q: query,
        num: 10
      }
    });

    const items = response.data.items?.map(item => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      displayLink: item.displayLink
    })) || [];

    res.status(200).json({ items });

  } catch (error) {
    console.error('Google Search API Error:', error.response?.data?.error || error.message);
    res.status(500).json({ message: 'Failed to fetch search results.' });
  }
});

app.listen(PORT, () => {
  console.log(`Google Search Proxy running on http://localhost:${PORT}`);
});