require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = 3007;

app.use(cors());

// THE FIX: Path changed to /tweets/:userId
app.get('/tweets/:userId', async (req, res) => {
  const { userId } = req.params;
  const maxResults = req.query.max_results || 10;
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;

  if (!bearerToken) {
    return res.status(500).json({ message: 'Twitter API Bearer Token is not configured.' });
  }

  const url = `https://api.twitter.com/2/users/${userId}/tweets?max_results=${maxResults}`;
  
  try {
    const response = await axios.get(url, {
      headers: { 'Authorization': `Bearer ${bearerToken}` }
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Twitter Proxy Error:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'An error occurred.' });
  }
});

app.listen(PORT, () => console.log(`Twitter Proxy running on http://localhost:${PORT}`));