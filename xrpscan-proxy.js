require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = 3008;

app.use(cors());

// THE FIX: Path changed to /trustlines/:issuer
app.get('/trustlines/:issuer', async (req, res) => {
    const { issuer } = req.params;
    const currencyCode = req.query.currency_code;
    const url = `https://api.xrpscan.com/api/v1/account/${issuer}/trustlines`;

    try {
        const response = await axios.get(url);
        const data = response.data;
        let result = { holders: 0, trustlines: 0 };
        if (data && Array.isArray(data.trustlines)) {
            const filteredTrustlines = data.trustlines.filter(line => line.currency === currencyCode);
            result.trustlines = filteredTrustlines.length;
            result.holders = result.trustlines;
        }
        res.status(200).json(result);
    } catch (error) {
        console.error('XRPSCAN Proxy Error:', error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'An error occurred.' });
    }
});

app.listen(PORT, () => console.log(`XRPSCAN Proxy running on http://localhost:${PORT}`));