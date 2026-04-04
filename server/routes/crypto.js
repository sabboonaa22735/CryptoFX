const express = require('express');
const router = express.Router();
const axios = require('axios');
const mongoose = require('mongoose');

const cache = new Map();
const CACHE_TTL = 30000;

const getCached = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

router.get('/prices', async (req, res) => {
  try {
    const cached = getCached('crypto_prices');
    if (cached) {
      return res.json(cached);
    }

    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'eur',
        order: 'market_cap_desc',
        per_page: 20,
        page: 1,
        sparkline: false,
        price_change_percentage: '1h,24h,7d'
      },
      timeout: 10000
    });

    const normalizedData = response.data.map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      price_eur: coin.current_price,
      change_24h: coin.price_change_percentage_24h,
      change_1h: coin.price_change_percentage_1h_in_currency,
      change_7d: coin.price_change_percentage_7d_in_currency,
      market_cap: coin.market_cap,
      volume: coin.total_volume,
      high_24h: coin.high_24h,
      low_24h: coin.low_24h,
      image: coin.image,
      rank: coin.market_cap_rank
    }));

    setCache('crypto_prices', normalizedData);
    res.json(normalizedData);
  } catch (error) {
    console.error('CoinGecko API Error:', error.message);
    
    const fallbackData = [
      { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc', price_eur: 67000, change_24h: 2.5, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
      { id: 'ethereum', name: 'Ethereum', symbol: 'eth', price_eur: 3500, change_24h: 1.8, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
      { id: 'binancecoin', name: 'BNB', symbol: 'bnb', price_eur: 600, change_24h: -0.5, image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png' },
      { id: 'solana', name: 'Solana', symbol: 'sol', price_eur: 145, change_24h: 5.2, image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
      { id: 'ripple', name: 'XRP', symbol: 'xrp', price_eur: 0.52, change_24h: 0.8, image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png' },
    ];
    res.json(fallbackData);
  }
});

router.get('/prices/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const cacheKey = `crypto_price_${symbol}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${symbol}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: true
      },
      timeout: 10000
    });

    const coin = response.data;
    const data = {
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      price_eur: coin.market_data.current_price.eur,
      change_24h: coin.market_data.price_change_percentage_24h,
      change_7d: coin.market_data.price_change_percentage_7d,
      market_cap: coin.market_data.market_cap.eur,
      volume: coin.market_data.total_volume.eur,
      high_24h: coin.market_data.high_24h.eur,
      low_24h: coin.market_data.low_24h.eur,
      image: coin.image.large,
      sparkline: coin.market_data.sparkline_7d?.price || []
    };

    setCache(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error('CoinGecko API Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch coin data' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const response = await axios.get('https://api.coingecko.com/api/v3/search', {
      params: { query: q },
      timeout: 10000
    });

    const results = response.data.coins.slice(0, 10).map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      market_cap_rank: coin.market_cap_rank,
      thumb: coin.thumb,
      large: coin.large
    }));

    res.json(results);
  } catch (error) {
    console.error('Search API Error:', error.message);
    res.status(500).json({ message: 'Search failed' });
  }
});

router.get('/trending', async (req, res) => {
  try {
    const cached = getCached('trending_coins');
    if (cached) {
      return res.json(cached);
    }

    const response = await axios.get('https://api.coingecko.com/api/v3/search/trending', {
      timeout: 10000
    });

    const trending = response.data.coins.slice(0, 7).map(item => ({
      id: item.item.id,
      name: item.item.name,
      symbol: item.item.symbol,
      market_cap_rank: item.item.market_cap_rank,
      thumb: item.item.thumb,
      price_eur: item.item.price_btc * 67000
    }));

    setCache('trending_coins', trending);
    res.json(trending);
  } catch (error) {
    console.error('Trending API Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch trending coins' });
  }
});

module.exports = router;
