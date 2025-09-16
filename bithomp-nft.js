// This is your new /edge-functions/bithomp-nft.js file

// This is the standard entry point for an Edge function.
// It receives the 'request' object, which contains the URL.
export default async (request) => {
  try {
    // 1. Get the NFT ID from the request URL
    const url = new URL(request.url);
    const nftId = url.searchParams.get('nftId');

    // Simple validation
    if (!nftId) {
      return new Response(JSON.stringify({ success: false, error: 'NFT ID is missing.' }), {
        status: 400, // Bad Request
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Get your secret Bithomp API Key
    // This is the secure, modern way to handle secrets on Edge.
    // It reads a variable that we will set up in the Edge dashboard later.
    const apiKey = process.env.BITHOMP_API_KEY;
    if (!apiKey) {
        throw new Error('BITHOMP_API_KEY is not configured on the server.');
    }

    // 3. Build the external API URL to call Bithomp
    const externalUrl = `https://bithomp.com/api/v2/nft/${encodeURIComponent(nftId)}`;

    // 4. Make the request to the Bithomp API
    const response = await fetch(externalUrl, {
      headers: {
        'x-bithomp-token': apiKey // Bithomp uses this specific header for the key
      }
    });

    if (!response.ok) {
      throw new Error(`Bithomp API responded with status: ${response.status}`);
    }
    const data = await response.json();

    // 5. Send the successful data back to the browser
    return new Response(JSON.stringify({ success: true, data: data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in bithomp-nft function:', error);
    return new Response(JSON.stringify({ success: false, error: 'An internal server error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};