export const dashboardSeed = {
  "generatedAt": "2026-02-25T16:48:45.146Z",
  "calibration": {
    "profile": "balanced",
    "thresholds_used": {
      "min_mcap_usd": 30000000,
      "min_fdv_usd": 30000000,
      "min_est_liquidity_usd": 5000000,
      "min_tier1_cex_count": 1,
      "weights": {
        "market_strength": 0.33,
        "venue_liquidity": 0.3,
        "solana_demand": 0.27,
        "migration_feasibility": 0.1
      },
      "tier1_cex": [
        "Binance",
        "Coinbase",
        "OKX",
        "Bybit",
        "Kraken"
      ]
    },
    "counts": {
      "total": 28,
      "eligible": 17,
      "borderline": 1,
      "rejected": 11
    }
  },
  "meta": {
    "total_candidates": 28,
    "evaluated_candidates": 28,
    "eligible_count": 17,
    "borderline_count": 1,
    "rejected_count": 11,
    "validation_error_count": 0
  },
  "thresholds": {
    "min_mcap_usd": 30000000,
    "min_fdv_usd": 30000000,
    "min_est_liquidity_usd": 5000000,
    "min_tier1_cex_count": 1,
    "weights": {
      "market_strength": 0.33,
      "venue_liquidity": 0.3,
      "solana_demand": 0.27,
      "migration_feasibility": 0.1
    },
    "tier1_cex": [
      "Binance",
      "Coinbase",
      "OKX",
      "Bybit",
      "Kraken"
    ]
  },
  "topRanked": [
    {
      "rank": 1,
      "assetId": "chainlink",
      "name": "Chainlink",
      "symbol": "LINK",
      "chain": "Ethereum",
      "status": "pass",
      "score": 69.74,
      "confidence": 79.63,
      "reasons": []
    },
    {
      "rank": 2,
      "assetId": "sui",
      "name": "Sui",
      "symbol": "SUI",
      "chain": "Sui",
      "status": "pass",
      "score": 66.95,
      "confidence": 75.63,
      "reasons": [
        "missing_origin_token_address"
      ]
    },
    {
      "rank": 3,
      "assetId": "avalanche",
      "name": "Avalanche",
      "symbol": "AVAX",
      "chain": "Avalanche",
      "status": "pass",
      "score": 66.02,
      "confidence": 75.63,
      "reasons": [
        "missing_origin_token_address"
      ]
    },
    {
      "rank": 4,
      "assetId": "uniswap",
      "name": "Uniswap",
      "symbol": "UNI",
      "chain": "Ethereum",
      "status": "pass",
      "score": 63.73,
      "confidence": 75.63,
      "reasons": []
    },
    {
      "rank": 5,
      "assetId": "pepe",
      "name": "Pepe",
      "symbol": "PEPE",
      "chain": "Ethereum",
      "status": "pass",
      "score": 60.94,
      "confidence": 75.63,
      "reasons": []
    },
    {
      "rank": 6,
      "assetId": "aave",
      "name": "Aave",
      "symbol": "AAVE",
      "chain": "Ethereum",
      "status": "pass",
      "score": 59.68,
      "confidence": 75.63,
      "reasons": []
    },
    {
      "rank": 7,
      "assetId": "near",
      "name": "NEAR",
      "symbol": "NEAR",
      "chain": "Near",
      "status": "pass",
      "score": 55.6,
      "confidence": 75.63,
      "reasons": [
        "missing_origin_token_address"
      ]
    },
    {
      "rank": 8,
      "assetId": "ethena",
      "name": "Ethena",
      "symbol": "ENA",
      "chain": "Ethereum",
      "status": "pass",
      "score": 54.3,
      "confidence": 75.63,
      "reasons": []
    },
    {
      "rank": 9,
      "assetId": "worldcoin",
      "name": "Worldcoin",
      "symbol": "WLD",
      "chain": "Optimism",
      "status": "pass",
      "score": 54.24,
      "confidence": 75.63,
      "reasons": []
    },
    {
      "rank": 10,
      "assetId": "aptos",
      "name": "Aptos",
      "symbol": "APT",
      "chain": "Aptos",
      "status": "pass",
      "score": 53.21,
      "confidence": 75.63,
      "reasons": [
        "missing_origin_token_address"
      ]
    },
    {
      "rank": 11,
      "assetId": "arbitrum",
      "name": "Arbitrum",
      "symbol": "ARB",
      "chain": "Arbitrum",
      "status": "pass",
      "score": 52.24,
      "confidence": 75.63,
      "reasons": []
    },
    {
      "rank": 12,
      "assetId": "optimism",
      "name": "Optimism",
      "symbol": "OP",
      "chain": "Optimism",
      "status": "pass",
      "score": 49.52,
      "confidence": 75.63,
      "reasons": []
    }
  ],
  "rejected": [
    {
      "assetId": "maker",
      "name": "Maker",
      "symbol": "MKR",
      "chain": "Ethereum",
      "reasons": [
        "insufficient_estimated_liquidity"
      ]
    },
    {
      "assetId": "pendle",
      "name": "Pendle",
      "symbol": "PENDLE",
      "chain": "Ethereum",
      "reasons": [
        "insufficient_estimated_liquidity"
      ]
    },
    {
      "assetId": "compound",
      "name": "Compound",
      "symbol": "COMP",
      "chain": "Ethereum",
      "reasons": [
        "insufficient_estimated_liquidity"
      ]
    },
    {
      "assetId": "base-ecosystem-proxy",
      "name": "Aerodrome",
      "symbol": "AERO",
      "chain": "Base",
      "reasons": [
        "insufficient_estimated_liquidity"
      ]
    },
    {
      "assetId": "polygon",
      "name": "Polygon",
      "symbol": "POL",
      "chain": "Polygon",
      "reasons": [
        "insufficient_estimated_liquidity"
      ]
    },
    {
      "assetId": "wormhole",
      "name": "Wormhole",
      "symbol": "W",
      "chain": "Solana",
      "reasons": [
        "insufficient_estimated_liquidity"
      ]
    },
    {
      "assetId": "jupiter",
      "name": "Jupiter",
      "symbol": "JUP",
      "chain": "Solana",
      "reasons": [
        "insufficient_estimated_liquidity"
      ]
    },
    {
      "assetId": "dogecoin",
      "name": "Dogecoin",
      "symbol": "DOGE",
      "chain": "Dogecoin",
      "reasons": [
        "unsupported_origin_chain"
      ]
    },
    {
      "assetId": "lido-dao",
      "name": "Lido DAO",
      "symbol": "LDO",
      "chain": "Ethereum",
      "reasons": [
        "insufficient_estimated_liquidity"
      ]
    },
    {
      "assetId": "brett",
      "name": "Brett",
      "symbol": "BRETT",
      "chain": "Base",
      "reasons": [
        "insufficient_estimated_liquidity"
      ]
    },
    {
      "assetId": "kaspa",
      "name": "Kaspa",
      "symbol": "KAS",
      "chain": "Kaspa",
      "reasons": [
        "unsupported_origin_chain",
        "insufficient_estimated_liquidity"
      ]
    }
  ]
};
