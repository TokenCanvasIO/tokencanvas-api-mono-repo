module.exports = {
  apps : [
    {
      name: 'main-proxy',
      script: 'server.js',
      node_args: "-r dotenv/config",
      env: { PORT: 10000 }
    },
    {
      name: "coingecko",
      script: "./coingecko-proxy.js",
      node_args: "-r dotenv/config",
      env: { PORT: 3001 }
    },
    {
      name: "bithomp-details",
      script: "./bithomp-nft-details.js",
      node_args: "-r dotenv/config",
      env: { PORT: 3002 }
    },
    {
      name: "bithomp-main",
      script: "./bithomp-nft.js",
      node_args: "-r dotenv/config",
      env: { PORT: 3003 }
    },
    {
      name: "cloudinary",
      script: "./cloudinary-proxy.js",
      node_args: "-r dotenv/config",
      env: { PORT: 3004 }
    },
    {
      name: "onthedex",
      script: "./onthedex-proxy.js",
      node_args: "-r dotenv/config",
      env: { PORT: 3005 }
    },
    {
      name: "nft-caching",
      script: "./nft-caching-service.js",
      node_args: "-r dotenv/config",
      env: { PORT: 3006 }
    },
    {
      name: "twitter",
      script: "./twitter-proxy.js",
      node_args: "-r dotenv/config",
      env: { PORT: 3007 }
    },
    {
      name: "xrpscan",
      script: "./xrpscan-proxy.js",
      node_args: "-r dotenv/config",
      env: { PORT: 3008 }
    },
     {
      name: "xrpl-search",
      script: "./xrpl-search-proxy.js",
      node_args: "-r dotenv/config",
      env: { PORT: 3009 }
    },
    {
      name: "bithomp-advanced",
      script: "./bithomp-advanced-proxy.js",
      node_args: "-r dotenv/config",
      env: { PORT: 3010 }
    },
    {
      name: "xrpl-tokenomics",
      script: "./xrpl-tokenomics-proxy.js",
      node_args: "-r dotenv/config",
      env: { PORT: 3011 }
    },
    {
      name: "coingecko-details",
      script: "./coingecko-details-proxy.js",
      node_args: "-r dotenv/config",
      env: { PORT: 3012 }
    },
    {
      name: "google-search",
      script: "./google-search-proxy.js",
      node_args: "-r dotenv/config",
      env: { PORT: 3013 }
    }
  ]
};