const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

const marketInsights = {
  bitcoin: 'Bitcoin (BTC) is the leading cryptocurrency by market cap. Current trends show increased institutional adoption. Key support levels around $60K, resistance at $75K.',
  ethereum: 'Ethereum (ETH) powers DeFi and NFTs. The network continues transitioning to proof-of-stake. Watch for layer-2 solutions and upcoming upgrades.',
  solana: 'Solana offers high-speed, low-cost transactions. Growing ecosystem of DeFi and NFT projects. Watch for network uptime and validator updates.',
  default: 'For detailed analysis on specific assets, please ask about particular cryptocurrencies, stocks, or forex pairs.'
};

const tradingStrategies = {
  scalping: 'Scalping involves making small profits from minor price movements. Requires quick execution and high liquidity. Best for volatile assets with tight spreads.',
  dayTrading: 'Day trading involves opening and closing positions within the same day. Avoids overnight risk. Requires technical analysis skills and discipline.',
  swingTrading: 'Swing trading captures medium-term price movements over days to weeks. Combines technical and fundamental analysis.',
  hodling: 'Long-term holding strategy based on belief in asset fundamentals. Reduces stress from volatility but requires patience.'
};

router.post('/chat', auth, async (req, res) => {
  try {
    const { message, context } = req.body;
    
    const lowerMessage = message.toLowerCase();
    let response = '';
    let suggestions = [];

    if (lowerMessage.includes('bitcoin') || lowerMessage.includes('btc')) {
      response = marketInsights.bitcoin;
      suggestions = ['How to buy Bitcoin?', 'Bitcoin price prediction', 'Bitcoin wallet setup'];
    } else if (lowerMessage.includes('ethereum') || lowerMessage.includes('eth')) {
      response = marketInsights.ethereum;
      suggestions = ['How to buy Ethereum?', 'Ethereum gas fees', 'ETH staking'];
    } else if (lowerMessage.includes('solana') || lowerMessage.includes('sol')) {
      response = marketInsights.solana;
      suggestions = ['Solana vs Ethereum', 'SOL price prediction', 'Solana NFT'];
    } else if (lowerMessage.includes('strategy') || lowerMessage.includes('trade')) {
      response = 'I can explain various trading strategies. Which interests you?';
      suggestions = ['Scalping', 'Day Trading', 'Swing Trading', 'HODLing'];
    } else if (lowerMessage.includes('scalping')) {
      response = tradingStrategies.scalping;
      suggestions = ['Best pairs for scalping', 'Scalping indicators', 'Risk management'];
    } else if (lowerMessage.includes('day trading')) {
      response = tradingStrategies.dayTrading;
      suggestions = ['Day trading indicators', 'Best times to trade', 'Position sizing'];
    } else if (lowerMessage.includes('swing')) {
      response = tradingStrategies.swingTrading;
      suggestions = ['Swing trading setup', 'Trend analysis', 'Stop loss placement'];
    } else if (lowerMessage.includes('hodl') || lowerMessage.includes('hold')) {
      response = tradingStrategies.hodling;
      suggestions = ['Best long-term coins', 'Portfolio diversification', 'Tax implications'];
    } else if (lowerMessage.includes('predict') || lowerMessage.includes('forecast')) {
      response = 'AI predictions are based on historical data and technical indicators. Remember that markets are inherently unpredictable. Would you like me to analyze a specific asset?';
      suggestions = ['BTC prediction', 'ETH prediction', 'Technical analysis'];
    } else if (lowerMessage.includes('help')) {
      response = 'I can help you with: Trading strategies, Market analysis, Cryptocurrency information, Technical analysis basics, Portfolio tips. What would you like to know?';
      suggestions = ['Trading strategies', 'Market analysis', 'Getting started'];
    } else if (lowerMessage.includes('beginner') || lowerMessage.includes('start')) {
      response = 'Welcome to CryptoFX! I recommend starting with: 1) Learning basic trading concepts 2) Starting with small amounts 3) Using demo accounts 4) Understanding risk management. What would you like to explore first?';
      suggestions = ['Risk management', 'Basic trading', 'First trade'];
    } else {
      response = marketInsights.default;
      suggestions = ['Bitcoin analysis', 'Trading strategies', 'Getting started'];
    }

    res.json({
      response,
      suggestions,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/analyze', auth, async (req, res) => {
  try {
    const { symbol, timeframe = '1d' } = req.body;
    
    const mockAnalysis = {
      symbol: symbol.toUpperCase(),
      timeframe,
      trend: Math.random() > 0.5 ? 'bullish' : 'bearish',
      confidence: Math.floor(Math.random() * 30) + 70,
      support: (Math.random() * 0.8 + 0.1).toFixed(2),
      resistance: (Math.random() * 0.2 + 1.1).toFixed(2),
      indicators: {
        rsi: Math.floor(Math.random() * 40) + 40,
        macd: Math.random() > 0.5 ? 'bullish' : 'bearish',
        movingAverage: Math.random() > 0.5 ? 'above' : 'below'
      },
      sentiment: {
        social: Math.floor(Math.random() * 40) + 30,
        news: Math.floor(Math.random() * 40) + 30,
        overall: Math.floor(Math.random() * 40) + 40
      },
      prediction: {
        next24h: (Math.random() * 10 - 5).toFixed(2) + '%',
        next7d: (Math.random() * 20 - 10).toFixed(2) + '%'
      }
    };

    res.json(mockAnalysis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/signals', auth, async (req, res) => {
  try {
    const { pairs = ['BTC', 'ETH', 'SOL', 'BNB'] } = req.body;
    
    const signals = pairs.map(pair => ({
      symbol: pair,
      signal: Math.random() > 0.6 ? 'buy' : Math.random() > 0.5 ? 'sell' : 'hold',
      entryPrice: (Math.random() * 1000 + 100).toFixed(2),
      targetPrice: (Math.random() * 200 + 1000).toFixed(2),
      stopLoss: (Math.random() * 50 + 50).toFixed(2),
      confidence: Math.floor(Math.random() * 30) + 60,
      timeframe: ['1h', '4h', '1d'][Math.floor(Math.random() * 3)]
    }));

    res.json({ signals, generatedAt: new Date() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/news', async (req, res) => {
  try {
    const { category = 'crypto' } = req.query;
    
    const mockNews = [
      { id: 1, title: 'Bitcoin Reaches New Heights Amid Institutional Adoption', source: 'CryptoNews', category: 'bitcoin', timestamp: new Date(), sentiment: 'positive' },
      { id: 2, title: 'Ethereum Network Upgrade Scheduled for Next Month', source: 'BlockchainDaily', category: 'ethereum', timestamp: new Date(), sentiment: 'neutral' },
      { id: 3, title: 'DeFi Total Value Locked Surpasses $100B', source: 'DeFiWatch', category: 'defi', timestamp: new Date(), sentiment: 'positive' },
      { id: 4, title: 'Regulatory Concerns Impact Asian Crypto Markets', source: 'AsianCrypto', category: 'regulation', timestamp: new Date(), sentiment: 'negative' },
      { id: 5, title: 'New NFT Collection Breaks Sales Records', source: 'NFTInsider', category: 'nft', timestamp: new Date(), sentiment: 'positive' }
    ];

    res.json(mockNews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/portfolio/insights', auth, async (req, res) => {
  try {
    const { portfolio } = req.body;
    
    const insights = {
      diversification: Math.floor(Math.random() * 40) + 50,
      riskScore: Math.floor(Math.random() * 30) + 30,
      suggestions: [
        'Consider adding more stablecoins for stability',
        'Your Bitcoin allocation is above 50%, consider rebalancing',
        'Good diversification across different sectors'
      ],
      performance: {
        daily: (Math.random() * 10 - 3).toFixed(2),
        weekly: (Math.random() * 20 - 5).toFixed(2),
        monthly: (Math.random() * 50 - 10).toFixed(2)
      }
    };

    res.json(insights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
