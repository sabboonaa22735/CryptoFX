const express = require('express');
const router = express.Router();
const axios = require('axios');
const FutureContract = require('../models/FutureContract');

const BINANCE_API = 'https://api.binance.com/api/v3';

const FUTURES_CONTRACTS = {
  crypto: [
    { symbol: 'BTCUSDT', name: 'Bitcoin', underlying: 'BTC', contractType: 'perpetual' },
    { symbol: 'ETHUSDT', name: 'Ethereum', underlying: 'ETH', contractType: 'perpetual' },
    { symbol: 'BNBUSDT', name: 'BNB', underlying: 'BNB', contractType: 'perpetual' },
    { symbol: 'SOLUSDT', name: 'Solana', underlying: 'SOL', contractType: 'perpetual' },
    { symbol: 'XRPUSDT', name: 'XRP', underlying: 'XRP', contractType: 'perpetual' },
    { symbol: 'ADAUSDT', name: 'Cardano', underlying: 'ADA', contractType: 'perpetual' },
    { symbol: 'DOGEUSDT', name: 'Dogecoin', underlying: 'DOGE', contractType: 'perpetual' },
    { symbol: 'AVAXUSDT', name: 'Avalanche', underlying: 'AVAX', contractType: 'perpetual' }
  ],
  indices: [
    { symbol: 'US30USDT', name: 'Wall Street 30', underlying: 'DJI', contractType: 'perpetual' },
    { symbol: 'US100USDT', name: 'US Tech 100', underlying: 'NDX', contractType: 'perpetual' },
    { symbol: 'US500USDT', name: 'S&P 500', underlying: 'SPX', contractType: 'perpetual' }
  ],
  commodities: [
    { symbol: 'XAUUSDT', name: 'Gold', underlying: 'XAU', contractType: 'perpetual' },
    { symbol: 'XAGUSDT', name: 'Silver', underlying: 'XAG', contractType: 'perpetual' },
    { symbol: 'XTIUSDT', name: 'Crude Oil WTI', underlying: 'WTI', contractType: 'perpetual' },
    { symbol: 'XBRUSDT', name: 'Brent Crude', underlying: 'XBR', contractType: 'perpetual' }
  ]
};

const LEVERAGE_TIERS = [
  { maxPosition: 50000, maxLeverage: 125 },
  { maxPosition: 250000, maxLeverage: 100 },
  { maxPosition: 1000000, maxLeverage: 50 },
  { maxPosition: 5000000, maxLeverage: 20 },
  { maxPosition: Infinity, maxLeverage: 5 }
];

router.get('/', async (req, res) => {
  try {
    const { category = 'all' } = req.query;
    
    if (category === 'crypto') {
      const futures = await Promise.all(
        FUTURES_CONTRACTS.crypto.map(async (contract) => ({
          ...contract,
          assetType: 'crypto',
          ...await getFuturesData(contract.symbol)
        }))
      );
      return res.json(futures);
    }
    
    if (category === 'indices') {
      const futures = await Promise.all(
        FUTURES_CONTRACTS.indices.map(async (contract) => ({
          ...contract,
          assetType: 'index',
          ...await getFuturesData(contract.symbol)
        }))
      );
      return res.json(futures);
    }
    
    if (category === 'commodities') {
      const futures = await Promise.all(
        FUTURES_CONTRACTS.commodities.map(async (contract) => ({
          ...contract,
          assetType: 'commodity',
          ...await getFuturesData(contract.symbol)
        }))
      );
      return res.json(futures);
    }
    
    const allFutures = [
      ...FUTURES_CONTRACTS.crypto.map(c => ({ ...c, assetType: 'crypto' })),
      ...FUTURES_CONTRACTS.indices.map(c => ({ ...c, assetType: 'index' })),
      ...FUTURES_CONTRACTS.commodities.map(c => ({ ...c, assetType: 'commodity' }))
    ];
    
    const futuresWithData = await Promise.all(
      allFutures.map(async (contract) => ({
        ...contract,
        ...await getFuturesData(contract.symbol)
      }))
    );
    
    res.json(futuresWithData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/categories', (req, res) => {
  res.json([
    { id: 'crypto', name: 'Crypto Futures', icon: '₿' },
    { id: 'indices', name: 'Index Futures', icon: '📊' },
    { id: 'commodities', name: 'Commodity Futures', icon: '🛢️' }
  ]);
});

router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const allContracts = [
      ...FUTURES_CONTRACTS.crypto,
      ...FUTURES_CONTRACTS.indices,
      ...FUTURES_CONTRACTS.commodities
    ];
    
    const contract = allContracts.find(c => c.symbol === symbol);
    
    if (!contract) {
      return res.status(404).json({ message: 'Futures contract not found' });
    }
    
    const futuresData = await getFuturesData(symbol);
    const fundingRate = await getFundingRate(symbol);
    
    res.json({
      ...contract,
      ...futuresData,
      fundingRate: fundingRate.rate,
      nextFundingTime: fundingRate.nextFundingTime,
      maxLeverage: calculateMaxLeverage(futuresData.price || 0),
      marginRequirement: calculateMarginRequirement(futuresData.price || 0),
      lastUpdate: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:symbol/orderbook', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { limit = 20 } = req.query;
    
    try {
      const response = await axios.get(`${BINANCE_API}/depth`, {
        params: { symbol: symbol.toUpperCase(), limit: parseInt(limit) }
      });
      
      const midPrice = await getMidPrice(symbol);
      
      res.json({
        bids: response.data.bids.map(b => ({
          price: parseFloat(b[0]),
          quantity: parseFloat(b[1]),
          total: parseFloat(b[0]) * parseFloat(b[1])
        })),
        asks: response.data.asks.map(a => ({
          price: parseFloat(a[0]),
          quantity: parseFloat(a[1]),
          total: parseFloat(a[0]) * parseFloat(a[1])
        })),
        spread: response.data.asks[0] && response.data.bids[0] 
          ? parseFloat(response.data.asks[0][0]) - parseFloat(response.data.bids[0][0])
          : 0
      });
    } catch {
      const mockData = generateMockFuturesOrderbook(symbol);
      res.json(mockData);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:symbol/funding', async (req, res) => {
  try {
    const { symbol } = req.params;
    const fundingData = await getFundingRate(symbol);
    res.json(fundingData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:symbol/liquidation', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { leverage = 10, side = 'long', entryPrice } = req.query;
    
    const price = parseFloat(entryPrice) || await getMidPrice(symbol);
    const leverageNum = parseInt(leverage);
    
    const liquidationPrice = side === 'long'
      ? price * (1 - 1 / leverageNum)
      : price * (1 + 1 / leverageNum);
    
    const marginRequired = price / leverageNum;
    const maxLoss = price * 0.9;
    
    res.json({
      symbol,
      leverage: leverageNum,
      side,
      entryPrice: price,
      liquidationPrice: parseFloat(liquidationPrice.toFixed(2)),
      marginRequired: parseFloat(marginRequired.toFixed(2)),
      maxLoss: parseFloat(maxLoss.toFixed(2)),
      riskLevel: leverageNum > 50 ? 'extreme' : leverageNum > 20 ? 'high' : 'moderate'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:symbol/open-interest', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const openInterest = Math.random() * 100000000;
    const longOI = openInterest * (0.5 + Math.random() * 0.1);
    const shortOI = openInterest - longOI;
    
    res.json({
      symbol,
      totalOpenInterest: parseFloat(openInterest.toFixed(2)),
      longOpenInterest: parseFloat(longOI.toFixed(2)),
      shortOpenInterest: parseFloat(shortOI.toFixed(2)),
      longShortRatio: parseFloat((longOI / shortOI).toFixed(2)),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

async function getFuturesData(symbol) {
  try {
    const response = await axios.get(`${BINANCE_API}/ticker/24hr`, {
      params: { symbol: symbol.toUpperCase() }
    });
    
    return {
      price: parseFloat(response.data.lastPrice),
      change: parseFloat(response.data.priceChange),
      changePercent: parseFloat(response.data.priceChangePercent),
      high: parseFloat(response.data.highPrice),
      low: parseFloat(response.data.lowPrice),
      volume: parseFloat(response.data.volume),
      quoteVolume: parseFloat(response.data.quoteVolume)
    };
  } catch {
    return generateMockFuturesData(symbol);
  }
}

async function getFundingRate(symbol) {
  try {
    const response = await axios.get(`https://fapi.binance.com/fapi/v1/premiumIndex`, {
      params: { symbol: symbol.replace('USDT', 'USDT').toUpperCase() }
    });
    
    return {
      rate: parseFloat(response.data.lastFundingRate) * 100,
      nextFundingTime: new Date(parseInt(response.data.nextFundingTime)).toISOString(),
      predictedRate: parseFloat(response.data.interestRate) * 100
    };
  } catch {
    return {
      rate: (Math.random() - 0.5) * 0.1,
      nextFundingTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      predictedRate: (Math.random() - 0.5) * 0.1
    };
  }
}

async function getMidPrice(symbol) {
  try {
    const response = await axios.get(`${BINANCE_API}/ticker/price`, {
      params: { symbol: symbol.toUpperCase() }
    });
    return parseFloat(response.data.price);
  } catch {
    return 100;
  }
}

function generateMockFuturesData(symbol) {
  const basePrices = {
    'BTCUSDT': 43000,
    'ETHUSDT': 2300,
    'BNBUSDT': 310,
    'SOLUSDT': 98,
    'XRPUSDT': 0.62,
    'ADAUSDT': 0.58,
    'DOGEUSDT': 0.082,
    'AVAXUSDT': 38,
    'US30USDT': 38000,
    'US100USDT': 17000,
    'US500USDT': 5000,
    'XAUUSDT': 2050,
    'XAGUSDT': 24.5,
    'XTIUSDT': 75,
    'XBRUSDT': 80
  };
  
  const base = basePrices[symbol] || 100;
  const price = base * (1 + (Math.random() - 0.5) * 0.02);
  const change = (Math.random() - 0.5) * base * 0.05;
  
  return {
    price: price,
    change: change,
    changePercent: (change / price) * 100,
    high: price * 1.02,
    low: price * 0.98,
    volume: Math.floor(Math.random() * 1000000000),
    quoteVolume: Math.floor(Math.random() * 50000000000)
  };
}

function generateMockFuturesOrderbook(symbol) {
  const price = 100;
  const spread = price * 0.001;
  
  const bids = Array.from({ length: 20 }, (_, i) => ({
    price: price - spread - i * price * 0.0001,
    quantity: Math.random() * 100 + 10,
    total: (price - spread - i * price * 0.0001) * (Math.random() * 100 + 10)
  }));
  
  const asks = Array.from({ length: 20 }, (_, i) => ({
    price: price + spread + i * price * 0.0001,
    quantity: Math.random() * 100 + 10,
    total: (price + spread + i * price * 0.0001) * (Math.random() * 100 + 10)
  }));
  
  return { bids, asks, spread };
}

function calculateMaxLeverage(price) {
  for (const tier of LEVERAGE_TIERS) {
    if (price <= tier.maxPosition) {
      return tier.maxLeverage;
    }
  }
  return 5;
}

function calculateMarginRequirement(price) {
  return price * 0.02;
}

module.exports = router;
