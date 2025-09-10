module.exports = {
  apps : [
    // --- ADD THIS NEW PROXY SERVER AT THE TOP ---
    {
      name: 'main-proxy',
      script: 'server.js'
    },
    // ------------------------------------------
    
    { name: "coingecko", script: "./coingecko-proxy.js" },
    { name: "bithomp-details", script: "./bithomp-nft-details.js" },
    { name: "bithomp-main", script: "./bithomp-nft.js" },
    { name: "cloudinary", script: "./cloudinary-proxy.js" },
    { name: "onthedex", script: "./onthedex-proxy.js" },
    { name: "nft-caching", script: "./nft-caching-service.js" },
    { name: "twitter", script: "./twitter-proxy.js" },
    { name: "xrpscan", script: "./xrpscan-proxy.js" }
  ]
};