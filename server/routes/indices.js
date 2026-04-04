const express = require('express');
const router = express.Router();
const axios = require('axios');

const BINANCE_API = 'https://api.binance.com/api/v3';
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

const INDICES_CONFIG = {
  'US30': { name: 'US Wall Street 30', underlying: 'DJI', type: 'index' },
  'US100': { name: 'US Tech 100', underlying: 'NDX', type: 'index' },
  'US500': { name: 'US SPX 500', underlying: 'SPX', type: 'index' },
  'UK100': { name: 'UK FTSE 100', underlying: 'UKX', type: 'index' },
  'DE40': { name: 'Germany 40', underlying: 'DAX', type: 'index' },
  'FR40': { name: 'France 40', underlying: 'CAC', type: 'index' },
  'JP225': { name: 'Japan 225', underlying: 'NI225', type: 'index' },
  'AUS200': { name: 'Australia 200', underlying: 'AS51', type: 'index' }
};

const COMMODITIES = {
  'XAUUSD': { name: 'Gold', type: 'commodity' },
  'XAGUSD': { name: 'Silver', type: 'commodity' },
  'XTIUSD': { name: 'Crude Oil WTI', type: 'commodity' },
  'XBRUSD': { name: 'Brent Crude', type: 'commodity' },
  'NATGAS': { name: 'Natural Gas', type: 'commodity' }
};

router.get('/', async (req, res) => {
  try {
    const { category = 'all' } = req.query;
    const indices = Object.entries(INDICES_CONFIG).map(([symbol, config]) => ({
      symbol,
      ...config
    }));
    
    if (category === 'indices') {
      return res.json(indices);
    }
    
    const commodities = Object.entries(COMMODITIES).map(([symbol, config]) => ({
      symbol,
      ...config
    }));
    
    if (category === 'commodities') {
      return res.json(commodities);
    }
    
    res.json({ indices, commodities });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/indices', async (req, res) => {
  try {
    const indices = Object.entries(INDICES_CONFIG).map(([symbol, config]) => ({
      symbol,
      ...config
    }));
    res.json(indices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/commodities', async (req, res) => {
  try {
    const commodities = Object.entries(COMMODITIES).map(([symbol, config]) => ({
      symbol,
      ...config
    }));
    res.json(commodities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/indices/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const config = INDICES_CONFIG[symbol];
    
    if (!config) {
      return res.status(404).json({ message: 'Index not found' });
    }
    
    let priceData = { price: 0, change: 0, changePercent: 0, high: 0, low: 0, volume: 0 };
    
    try {
      const response = await axios.get(`${BINANCE_API}/ticker/24hr`, {
        params: { symbol: symbol.replace('US', 'US') }
      });
      
      priceData = {
        price: parseFloat(response.data.lastPrice),
        change: parseFloat(response.data.priceChange),
        changePercent: parseFloat(response.data.priceChangePercent),
        high: parseFloat(response.data.highPrice),
        low: parseFloat(response.data.lowPrice),
        volume: parseFloat(response.data.volume)
      };
    } catch {
      priceData = generateMockIndexData(symbol);
    }
    
    res.json({
      symbol,
      ...config,
      ...priceData,
      lastUpdate: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/commodities/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const config = COMMODITIES[symbol];
    
    if (!config) {
      return res.status(404).json({ message: 'Commodity not found' });
    }
    
    let priceData = { price: 0, change: 0, changePercent: 0, high: 0, low: 0, volume: 0 };
    
    try {
      const response = await axios.get(`${BINANCE_API}/ticker/24hr`, {
        params: { symbol: symbol.replace('USD', 'USDT') }
      });
      
      priceData = {
        price: parseFloat(response.data.lastPrice),
        change: parseFloat(response.data.priceChange),
        changePercent: parseFloat(response.data.priceChangePercent),
        high: parseFloat(response.data.highPrice),
        low: parseFloat(response.data.lowPrice),
        volume: parseFloat(response.data.volume)
      };
    } catch {
      priceData = generateMockCommodityData(symbol);
    }
    
    res.json({
      symbol,
      ...config,
      ...priceData,
      lastUpdate: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/indices/:symbol/chart', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '1h', limit = 100 } = req.query;
    
    const mockKlines = generateMockChartData(interval, limit);
    
    res.json(mockKlines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/commodities/:symbol/chart', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '1h', limit = 100 } = req.query;
    
    const mockKlines = generateMockChartData(interval, limit);
    
    res.json(mockKlines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function generateMockIndexData(symbol) {
  const basePrices = {
    'US30': 38000,
    'US100': 17000,
    'US500': 5000,
    'UK100': 7800,
    'DE40': 18000,
    'FR40': 8000,
    'JP225': 38000,
    'AUS200': 7800
  };
  
  const base = basePrices[symbol] || 1000;
  const variation = (Math.random() - 0.5) * base * 0.02;
  const price = base + variation;
  
  return {
    price: price,
    change: (Math.random() - 0.5) * 200,
    changePercent: (Math.random() - 0.5) * 3,
    high: price * 1.01,
    low: price * 0.99,
    volume: Math.floor(Math.random() * 1000000)
  };
}

function generateMockCommodityData(symbol) {
  const basePrices = {
    'XAUUSD': 2050,
    'XAGUSD': 24.5,
    'XTIUSD': 75,
    'XBRUSD': 80,
    'NATGAS': 2.5
  };
  
  const base = basePrices[symbol] || 100;
  const variation = (Math.random() - 0.5) * base * 0.03;
  const price = base + variation;
  
  return {
    price: price,
    change: (Math.random() - 0.5) * base * 0.05,
    changePercent: (Math.random() - 0.5) * 5,
    high: price * 1.02,
    low: price * 0.98,
    volume: Math.floor(Math.random() * 500000)
  };
}

function generateMockChartData(interval, limit) {
  const now = Date.now();
  const intervals = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000
  };
  
  const intervalMs = intervals[interval] || intervals['1h'];
  const data = [];
  let price = 5000;
  
  for (let i = 0; i < limit; i++) {
    const time = now - (limit - i) * intervalMs;
    const volatility = price * 0.002;
    const open = price;
    const close = price + (Math.random() - 0.5) * volatility;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    
    data.push({
      time: Math.floor(time / 1000),
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 100000)
    });
    
    price = close;
  }
  
  return data;
}

module.exports = router;
