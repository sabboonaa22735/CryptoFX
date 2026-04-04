const express = require('express');
const router = express.Router();
const axios = require('axios');

const BINANCE_API = 'https://api.binance.com/api/v3';

const STOCKS_CONFIG = {
  'AAPL': { name: 'Apple Inc.', sector: 'Technology', exchange: 'NASDAQ', currency: 'USD' },
  'GOOGL': { name: 'Alphabet Inc.', sector: 'Technology', exchange: 'NASDAQ', currency: 'USD' },
  'MSFT': { name: 'Microsoft Corp.', sector: 'Technology', exchange: 'NASDAQ', currency: 'USD' },
  'AMZN': { name: 'Amazon.com Inc.', sector: 'Consumer Cyclical', exchange: 'NASDAQ', currency: 'USD' },
  'TSLA': { name: 'Tesla Inc.', sector: 'Automotive', exchange: 'NASDAQ', currency: 'USD' },
  'NVDA': { name: 'NVIDIA Corp.', sector: 'Technology', exchange: 'NASDAQ', currency: 'USD' },
  'META': { name: 'Meta Platforms', sector: 'Technology', exchange: 'NASDAQ', currency: 'USD' },
  'BRK.B': { name: 'Berkshire Hathaway', sector: 'Financial', exchange: 'NYSE', currency: 'USD' },
  'JPM': { name: 'JPMorgan Chase', sector: 'Financial', exchange: 'NYSE', currency: 'USD' },
  'V': { name: 'Visa Inc.', sector: 'Financial', exchange: 'NYSE', currency: 'USD' },
  'JNJ': { name: 'Johnson & Johnson', sector: 'Healthcare', exchange: 'NYSE', currency: 'USD' },
  'WMT': { name: 'Walmart Inc.', sector: 'Consumer Defensive', exchange: 'NYSE', currency: 'USD' },
  'PG': { name: 'Procter & Gamble', sector: 'Consumer Defensive', exchange: 'NYSE', currency: 'USD' },
  'XOM': { name: 'Exxon Mobil', sector: 'Energy', exchange: 'NYSE', currency: 'USD' },
  'UNH': { name: 'UnitedHealth', sector: 'Healthcare', exchange: 'NYSE', currency: 'USD' },
  'HD': { name: 'Home Depot', sector: 'Consumer Cyclical', exchange: 'NYSE', currency: 'USD' },
  'DIS': { name: 'Walt Disney', sector: 'Communication', exchange: 'NYSE', currency: 'USD' },
  'NFLX': { name: 'Netflix Inc.', sector: 'Communication', exchange: 'NASDAQ', currency: 'USD' },
  'PYPL': { name: 'PayPal Holdings', sector: 'Financial', exchange: 'NASDAQ', currency: 'USD' },
  'ADBE': { name: 'Adobe Inc.', sector: 'Technology', exchange: 'NASDAQ', currency: 'USD' }
};

const SECTORS = [
  { id: 'technology', name: 'Technology' },
  { id: 'financial', name: 'Financial' },
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'consumer-cyclical', name: 'Consumer Cyclical' },
  { id: 'consumer-defensive', name: 'Consumer Defensive' },
  { id: 'energy', name: 'Energy' },
  { id: 'communication', name: 'Communication' },
  { id: 'industrial', name: 'Industrial' }
];

router.get('/', async (req, res) => {
  try {
    const { sector, exchange, sort = 'market_cap', order = 'desc' } = req.query;
    
    let stocks = Object.entries(STOCKS_CONFIG).map(([symbol, config]) => ({
      symbol,
      ...config,
      ...generateMockStockData(symbol)
    }));
    
    if (sector) {
      stocks = stocks.filter(s => s.sector.toLowerCase().replace(' ', '-') === sector.toLowerCase());
    }
    
    if (exchange) {
      stocks = stocks.filter(s => s.exchange === exchange.toUpperCase());
    }
    
    stocks.sort((a, b) => {
      if (sort === 'price') {
        return order === 'desc' ? b.price - a.price : a.price - b.price;
      }
      if (sort === 'change') {
        return order === 'desc' ? b.changePercent - a.changePercent : a.changePercent - b.changePercent;
      }
      if (sort === 'volume') {
        return order === 'desc' ? b.volume - a.volume : a.volume - b.volume;
      }
      return order === 'desc' ? b.marketCap - a.marketCap : a.marketCap - b.marketCap;
    });
    
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/sectors', (req, res) => {
  res.json(SECTORS);
});

router.get('/trending', async (req, res) => {
  try {
    const stocks = ['AAPL', 'NVDA', 'TSLA', 'META', 'AMZN'];
    
    const trendingStocks = stocks.map(symbol => ({
      symbol,
      ...STOCKS_CONFIG[symbol],
      ...generateMockStockData(symbol)
    }));
    
    res.json(trendingStocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const config = STOCKS_CONFIG[symbol];
    
    if (!config) {
      return res.status(404).json({ message: 'Stock not found' });
    }
    
    const stockData = generateMockStockData(symbol);
    
    res.json({
      symbol,
      ...config,
      ...stockData,
      lastUpdate: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:symbol/chart', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '1h', limit = 100 } = req.query;
    
    const chartData = generateMockChartData(interval, limit);
    
    res.json(chartData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:symbol/orderbook', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { limit = 20 } = req.query;
    
    const stockData = generateMockStockData(symbol);
    const spread = stockData.price * 0.001;
    
    const bids = [];
    const asks = [];
    
    for (let i = 0; i < limit; i++) {
      bids.push({
        price: stockData.price - spread - (i * stockData.price * 0.0001),
        quantity: Math.random() * 1000 + 100
      });
      asks.push({
        price: stockData.price + spread + (i * stockData.price * 0.0001),
        quantity: Math.random() * 1000 + 100
      });
    }
    
    res.json({ bids, asks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:symbol/news', async (req, res) => {
  try {
    const { symbol } = req.params;
    const config = STOCKS_CONFIG[symbol];
    
    const news = generateMockNews(symbol, config?.name);
    
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function generateMockStockData(symbol) {
  const basePrices = {
    'AAPL': 185,
    'GOOGL': 140,
    'MSFT': 370,
    'AMZN': 175,
    'TSLA': 250,
    'NVDA': 480,
    'META': 350,
    'BRK.B': 360,
    'JPM': 170,
    'V': 270,
    'JNJ': 160,
    'WMT': 160,
    'PG': 155,
    'XOM': 105,
    'UNH': 520,
    'HD': 330,
    'DIS': 110,
    'NFLX': 450,
    'PYPL': 65,
    'ADBE': 580
  };
  
  const base = basePrices[symbol] || 100;
  const variation = (Math.random() - 0.5) * base * 0.05;
  const price = base + variation;
  const change = (Math.random() - 0.5) * base * 0.05;
  const changePercent = (change / price) * 100;
  
  return {
    price: price,
    change: change,
    changePercent: changePercent,
    high: price * (1 + Math.random() * 0.02),
    low: price * (1 - Math.random() * 0.02),
    open: price - change,
    volume: Math.floor(Math.random() * 50000000 + 10000000),
    avgVolume: Math.floor(Math.random() * 40000000 + 15000000),
    marketCap: price * (Math.random() * 1000000000 + 100000000),
    peRatio: Math.random() * 40 + 10,
    dividendYield: Math.random() * 3,
    week52High: price * 1.2,
    week52Low: price * 0.8,
    sharesOutstanding: Math.floor(Math.random() * 10000000000)
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
    '1d': 24 * 60 * 60 * 1000,
    '1w': 7 * 24 * 60 * 60 * 1000
  };
  
  const intervalMs = intervals[interval] || intervals['1h'];
  const data = [];
  let price = 150 + Math.random() * 100;
  
  for (let i = 0; i < limit; i++) {
    const time = now - (limit - i) * intervalMs;
    const volatility = price * 0.005;
    const open = price;
    const close = price + (Math.random() - 0.5) * volatility;
    const high = Math.max(open, close) + Math.random() * volatility * 0.3;
    const low = Math.min(open, close) - Math.random() * volatility * 0.3;
    
    data.push({
      time: Math.floor(time / 1000),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 5000000 + 500000)
    });
    
    price = close;
  }
  
  return data;
}

function generateMockNews(symbol, name) {
  const headlines = [
    `${name} reports quarterly earnings above expectations`,
    `Analysts upgrade ${name} to Buy rating`,
    `${name} announces new product launch`,
    `${name} expands into new markets`,
    `${name} faces regulatory scrutiny`,
    `${name} partners with major tech company`,
    `Breaking: ${name} stock surges on news`,
    `${name} CEO discusses future plans`
  ];
  
  return Array.from({ length: 10 }, (_, i) => ({
    id: `news-${symbol}-${i}`,
    symbol,
    title: headlines[Math.floor(Math.random() * headlines.length)],
    source: ['Bloomberg', 'Reuters', 'CNBC', 'WSJ', 'Yahoo Finance'][Math.floor(Math.random() * 5)],
    url: '#',
    publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
    sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)]
  }));
}

module.exports = router;
