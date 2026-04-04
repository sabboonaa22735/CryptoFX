const express = require('express');
const router = express.Router();
const axios = require('axios');
const TradeSettings = require('../models/TradeSettings');

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const BINANCE_API = 'https://api.binance.com/api/v3';

const cache = new Map();
const CACHE_TTL = 60000;

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

const MOCK_COINS = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', image: 'https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png', current_price: 71500, market_cap: 1400000000000, market_cap_rank: 1, total_volume: 25000000000, high_24h: 72000, low_24h: 69000, price_change_24h: 500, price_change_percentage_24h: 0.7 },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', image: 'https://coin-images.coingecko.com/coins/images/279/large/ethereum.png', current_price: 2150, market_cap: 260000000000, market_cap_rank: 2, total_volume: 12000000000, high_24h: 2200, low_24h: 2100, price_change_24h: 30, price_change_percentage_24h: 1.4 },
  { id: 'tether', symbol: 'usdt', name: 'Tether', image: 'https://coin-images.coingecko.com/coins/images/325/large/Tether.png', current_price: 1.00, market_cap: 95000000000, market_cap_rank: 3, total_volume: 50000000000, high_24h: 1.01, low_24h: 0.99, price_change_24h: 0, price_change_percentage_24h: 0 },
  { id: 'binancecoin', symbol: 'bnb', name: 'BNB', image: 'https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png', current_price: 640, market_cap: 88000000000, market_cap_rank: 4, total_volume: 800000000, high_24h: 650, low_24h: 630, price_change_24h: 8, price_change_percentage_24h: 1.2 },
  { id: 'ripple', symbol: 'xrp', name: 'XRP', image: 'https://coin-images.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png', current_price: 1.40, market_cap: 75000000000, market_cap_rank: 5, total_volume: 2000000000, high_24h: 1.45, low_24h: 1.38, price_change_24h: 0.01, price_change_percentage_24h: 0.5 },
  { id: 'usd-coin', symbol: 'usdc', name: 'USD Coin', image: 'https://coin-images.coingecko.com/coins/images/6319/large/USDC.png', current_price: 1.00, market_cap: 32000000000, market_cap_rank: 6, total_volume: 5000000000, high_24h: 1.01, low_24h: 0.99, price_change_24h: 0, price_change_percentage_24h: 0 },
  { id: 'solana', symbol: 'sol', name: 'Solana', image: 'https://coin-images.coingecko.com/coins/images/4128/large/solana.png', current_price: 92, market_cap: 40000000000, market_cap_rank: 7, total_volume: 3000000000, high_24h: 94, low_24h: 88, price_change_24h: 2, price_change_percentage_24h: 2.2 },
  { id: 'cardano', symbol: 'ada', name: 'Cardano', image: 'https://coin-images.coingecko.com/coins/images/975/large/cardano.png', current_price: 0.65, market_cap: 23000000000, market_cap_rank: 8, total_volume: 800000000, high_24h: 0.68, low_24h: 0.62, price_change_24h: 0.01, price_change_percentage_24h: 1.5 }
];

router.get('/coins', async (req, res) => {
  try {
    const { page = 1, per_page = 50 } = req.query;
    const cacheKey = `coins_${page}_${per_page}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const response = await axios.get(`${COINGECKO_API}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: parseInt(per_page),
        page: parseInt(page),
        sparkline: false,
        price_change_percentage: '1h,24h,7d'
      },
      timeout: 5000
    });
    setCache(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    const mockData = MOCK_COINS.slice(0, parseInt(req.query.per_page) || 50);
    res.json(mockData);
  }
});

router.get('/coins/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${COINGECKO_API}/coins/${id}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: true
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/coins/:id/chart', async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 1 } = req.query;
    const response = await axios.get(`${COINGECKO_API}/coins/${id}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: parseInt(days)
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/coins/:id/market', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${COINGECKO_API}/coins/${id}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: 1
      }
    });
    const prices = response.data.prices;
    const latest = prices[prices.length - 1];
    const oldest = prices[0];
    const change24h = ((latest[1] - oldest[1]) / oldest[1]) * 100;
    
    res.json({
      price: latest[1],
      change24h,
      high24h: Math.max(...prices.map(p => p[1])),
      low24h: Math.min(...prices.map(p => p[1])),
      volume24h: response.data.total_volumes?.[prices.length - 1]?.[1] || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/trending', async (req, res) => {
  try {
    const response = await axios.get(`${COINGECKO_API}/search/trending`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const response = await axios.get(`${COINGECKO_API}/search`, {
      params: { query: q }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/global', async (req, res) => {
  try {
    const response = await axios.get(`${COINGECKO_API}/global`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/forex', async (req, res) => {
  try {
    const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF'];
    const forexData = await Promise.all(
      pairs.map(async (pair) => {
        try {
          const response = await axios.get(`${BINANCE_API}/ticker/24hr`, {
            params: { symbol: pair }
          });
          return {
            symbol: pair,
            price: parseFloat(response.data.lastPrice),
            change: parseFloat(response.data.priceChangePercent),
            high: parseFloat(response.data.highPrice),
            low: parseFloat(response.data.lowPrice),
            volume: parseFloat(response.data.volume)
          };
        } catch {
          return { symbol: pair, error: 'Failed to fetch' };
        }
      })
    );
    res.json(forexData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/stocks', async (req, res) => {
  try {
    const stocks = [
      { symbol: 'AAPL', name: 'Apple Inc.' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.' },
      { symbol: 'MSFT', name: 'Microsoft Corp.' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.' },
      { symbol: 'TSLA', name: 'Tesla Inc.' },
      { symbol: 'NVDA', name: 'NVIDIA Corp.' }
    ];
    
    const mockData = stocks.map(stock => ({
      ...stock,
      price: Math.random() * 500 + 50,
      change: (Math.random() - 0.5) * 10,
      volume: Math.floor(Math.random() * 10000000)
    }));
    
    res.json(mockData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/bonds', async (req, res) => {
  try {
    const bonds = [
      { symbol: 'US10Y', name: 'US 10-Year Treasury' },
      { symbol: 'US2Y', name: 'US 2-Year Treasury' },
      { symbol: 'US30Y', name: 'US 30-Year Treasury' },
      { symbol: 'DE10Y', name: 'Germany 10-Year' },
      { symbol: 'UK10Y', name: 'UK 10-Year' }
    ];
    
    const mockData = bonds.map(bond => ({
      ...bond,
      yield: Math.random() * 5,
      change: (Math.random() - 0.5) * 0.5,
      price: 100 - Math.random() * 10
    }));
    
    res.json(mockData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/binance/klines', async (req, res) => {
  try {
    const { symbol = 'BTCUSDT', interval = '1h', limit = 500 } = req.query;
    const response = await axios.get(`${BINANCE_API}/klines`, {
      params: { symbol: symbol.toUpperCase(), interval, limit: parseInt(limit) }
    });
    
    const klines = response.data.map(k => ({
      time: k[0] / 1000,
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5])
    }));
    
    res.json(klines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/binance/ticker', async (req, res) => {
  try {
    const { symbol = 'BTCUSDT' } = req.query;
    const response = await axios.get(`${BINANCE_API}/ticker/24hr`, {
      params: { symbol: symbol.toUpperCase() }
    });
    res.json({
      symbol: response.data.symbol,
      price: parseFloat(response.data.lastPrice),
      change: parseFloat(response.data.priceChangePercent),
      high: parseFloat(response.data.highPrice),
      low: parseFloat(response.data.lowPrice),
      volume: parseFloat(response.data.volume),
      quoteVolume: parseFloat(response.data.quoteVolume)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/binance/orderbook', async (req, res) => {
  try {
    const { symbol = 'BTCUSDT', limit = 20 } = req.query;
    const response = await axios.get(`${BINANCE_API}/depth`, {
      params: { symbol: symbol.toUpperCase(), limit: parseInt(limit) }
    });
    res.json({
      bids: response.data.bids.map(b => ({ price: parseFloat(b[0]), quantity: parseFloat(b[1]) })),
      asks: response.data.asks.map(a => ({ price: parseFloat(a[0]), quantity: parseFloat(a[1]) }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/trade-settings', async (req, res) => {
  try {
    const settings = await TradeSettings.getSettings();
    res.json({
      durations: settings.durations.filter(d => d.isActive),
      leverage: settings.leverage,
      fees: settings.fees,
      limits: settings.limits,
      isEnabled: settings.isEnabled,
      maintenanceMode: settings.maintenanceMode
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
