require('dotenv').config();
const express = require('express');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const NodeCache = require('node-cache');

const app = express();
const PORT = 3006;
const cache = new NodeCache({ stdTTL: 2592000 });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

app.use(cors());

app.get('/optimize', async (req, res) => {
  const imageUrl = req.query.image_url;
  if (!imageUrl) return res.status(400).send('image_url is required.');
  
  const cacheKey = `cld_img_${imageUrl}`;
  const cachedUrl = cache.get(cacheKey);
  if (cachedUrl) return res.redirect(302, cachedUrl);

  try {
    const result = await cloudinary.uploader.upload(imageUrl, { folder: 'token_logos' });
    const optimizedUrl = cloudinary.url(result.public_id, {
      transformation: [
        { width: 100, height: 100, crop: 'fill' },
        { fetch_format: 'auto', quality: 'auto' }
      ]
    });
    cache.set(cacheKey, optimizedUrl);
    res.redirect(302, optimizedUrl);
  } catch (error) {
    console.error('Cloudinary Error:', error.message);
    res.status(500).send('Failed to process image.');
  }
});

app.listen(PORT, () => console.log(`Cloudinary Proxy running on http://localhost:${PORT}`));