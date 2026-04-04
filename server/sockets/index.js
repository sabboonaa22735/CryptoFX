const axios = require('axios');
const User = require('../models/User');

const BINANCE_WS = 'wss://stream.binance.com:9443/ws';
const BINANCE_API = 'https://api.binance.com/api/v3';
const BINANCE_FUTURES_API = 'https://fapi.binance.com/fapi/v1';

let io;
let priceCache = new Map();
let stockCache = new Map();
let indexCache = new Map();
let futuresCache = new Map();
let commodityCache = new Map();
let priceUpdateInterval;

const CRYPTO_SYMBOLS = ['btcusdt', 'ethusdt', 'bnbusdt', 'solusdt', 'xrpusdt', 'adausdt', 'dogeusdt', 'avaxusdt'];
const FUTURES_SYMBOLS = ['btcusdt', 'ethusdt', 'bnbusdt', 'solusdt'];
const STOCK_BASE_PRICES = {
  'AAPL': 185, 'GOOGL': 140, 'MSFT': 370, 'AMZN': 175, 'TSLA': 250,
  'NVDA': 480, 'META': 350, 'JPM': 170, 'V': 270, 'TSLA': 250
};
const INDEX_BASE_PRICES = {
  'US30': 38000, 'US100': 17000, 'US500': 5000, 'UK100': 7800, 'DE40': 18000
};
const COMMODITY_BASE_PRICES = {
  'XAUUSD': 2050, 'XAGUSD': 24.5, 'XTIUSD': 75, 'XBRUSD': 80, 'NATGAS': 2.5
};

const initializeSocket = (socketIO) => {
  io = socketIO;

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('subscribe', (channels) => {
      if (Array.isArray(channels)) {
        channels.forEach(channel => {
          if (['prices', 'crypto', 'stocks', 'indices', 'futures', 'commodities', 'trades', 'news', 'chat'].includes(channel)) {
            socket.join(channel);
          }
        });
      }
    });

    socket.on('unsubscribe', (channels) => {
      if (Array.isArray(channels)) {
        channels.forEach(channel => {
          socket.leave(channel);
        });
      }
    });

    socket.on('subscribe-symbol', (data) => {
      const { symbol, type } = data;
      if (symbol && type) {
        socket.join(`${type}-${symbol}`);
      }
    });

    socket.on('unsubscribe-symbol', (data) => {
      const { symbol, type } = data;
      if (symbol && type) {
        socket.leave(`${type}-${symbol}`);
      }
    });

    socket.on('join-room', (room) => {
      socket.join(room);
    });

    socket.on('leave-room', (room) => {
      socket.leave(room);
    });

    socket.on('send-message', async (data) => {
      const { room, message, userId } = data;
      const user = await User.findById(userId).select('name avatar');
      
      io.to(room).emit('new-message', {
        id: Date.now(),
        user: { _id: userId, name: user?.name || 'Anonymous', avatar: user?.avatar },
        message,
        timestamp: new Date()
      });
    });

    socket.on('trade-signal', (data) => {
      io.emit('trade-alert', {
        ...data,
        timestamp: new Date()
      });
    });

    socket.on('copy-trade', (data) => {
      io.emit('copy-trade-update', {
        ...data,
        timestamp: new Date()
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  startPriceUpdates();
  startStockUpdates();
  startIndexUpdates();
  startFuturesUpdates();
  startCommodityUpdates();

  return io;
};

const startPriceUpdates = () => {
  const updatePrices = async () => {
    try {
      const prices = await Promise.all(
        CRYPTO_SYMBOLS.map(async (symbol) => {
          try {
            const response = await axios.get(`${BINANCE_API}/ticker/24hr`, {
              params: { symbol: symbol.toUpperCase() }
            });
            
            const data = {
              symbol: symbol.replace('usdt', '').toUpperCase(),
              fullSymbol: symbol.toUpperCase(),
              price: parseFloat(response.data.lastPrice),
              change: parseFloat(response.data.priceChangePercent),
              high: parseFloat(response.data.highPrice),
              low: parseFloat(response.data.lowPrice),
              volume: parseFloat(response.data.volume),
              timestamp: Date.now()
            };

            priceCache.set(symbol, data);
            return data;
          } catch (error) {
            return priceCache.get(symbol) || null;
          }
        })
      );

      const validPrices = prices.filter(p => p !== null);
      
      if (io) {
        io.to('prices').emit('crypto-update', validPrices);
        io.to('crypto').emit('crypto-update', validPrices);
        
        validPrices.forEach(price => {
          io.emit(`crypto-${price.symbol.toLowerCase()}`, price);
        });
      }
    } catch (error) {
      console.error('Crypto price update error:', error.message);
    }
  };

  updatePrices();
  setInterval(updatePrices, 2000);
};

const startStockUpdates = () => {
  const updateStocks = () => {
    const stocks = Object.entries(STOCK_BASE_PRICES).map(([symbol, basePrice]) => {
      const variation = (Math.random() - 0.5) * basePrice * 0.001;
      const price = basePrice + variation;
      const change = (Math.random() - 0.5) * 2;
      
      const data = {
        symbol,
        price: parseFloat(price.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat((change / price * 100).toFixed(2)),
        volume: Math.floor(Math.random() * 5000000 + 1000000),
        timestamp: Date.now()
      };
      
      stockCache.set(symbol, data);
      return data;
    });

    if (io) {
      io.to('stocks').emit('stocks-update', stocks);
      stocks.forEach(stock => {
        io.to(`stocks-${stock.symbol}`).emit('stock-update', stock);
      });
    }
  };

  setInterval(updateStocks, 3000);
};

const startIndexUpdates = () => {
  const updateIndices = () => {
    const indices = Object.entries(INDEX_BASE_PRICES).map(([symbol, basePrice]) => {
      const variation = (Math.random() - 0.5) * basePrice * 0.001;
      const price = basePrice + variation;
      const change = (Math.random() - 0.5) * 50;
      
      const data = {
        symbol,
        price: parseFloat(price.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat((change / price * 100).toFixed(2)),
        timestamp: Date.now()
      };
      
      indexCache.set(symbol, data);
      return data;
    });

    if (io) {
      io.to('indices').emit('indices-update', indices);
      indices.forEach(index => {
        io.to(`indices-${index.symbol}`).emit('index-update', index);
      });
    }
  };

  setInterval(updateIndices, 5000);
};

const startFuturesUpdates = () => {
  const updateFutures = async () => {
    try {
      const futures = await Promise.all(
        FUTURES_SYMBOLS.map(async (symbol) => {
          try {
            const response = await axios.get(`${BINANCE_FUTURES_API}/ticker24hr`, {
              params: { symbol: symbol.toUpperCase() }
            });
            
            const data = {
              symbol: symbol.replace('usdt', '').toUpperCase(),
              fullSymbol: symbol.toUpperCase(),
              price: parseFloat(response.data.lastPrice),
              change: parseFloat(response.data.priceChangePercent),
              high: parseFloat(response.data.highPrice),
              low: parseFloat(response.data.lowPrice),
              volume: parseFloat(response.data.volume),
              fundingRate: parseFloat(response.data.fundingRate) * 100 || 0,
              timestamp: Date.now()
            };

            futuresCache.set(symbol, data);
            return data;
          } catch {
            return futuresCache.get(symbol) || null;
          }
        })
      );

      const validFutures = futures.filter(f => f !== null);
      
      if (io) {
        io.to('futures').emit('futures-update', validFutures);
        validFutures.forEach(future => {
          io.emit(`futures-${future.symbol.toLowerCase()}`, future);
        });
      }
    } catch (error) {
      console.error('Futures update error:', error.message);
    }
  };

  updateFutures();
  setInterval(updateFutures, 3000);
};

const startCommodityUpdates = () => {
  const updateCommodities = () => {
    const commodities = Object.entries(COMMODITY_BASE_PRICES).map(([symbol, basePrice]) => {
      const variation = (Math.random() - 0.5) * basePrice * 0.002;
      const price = basePrice + variation;
      const change = (Math.random() - 0.5) * basePrice * 0.01;
      
      const data = {
        symbol,
        price: parseFloat(price.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat((change / price * 100).toFixed(2)),
        timestamp: Date.now()
      };
      
      commodityCache.set(symbol, data);
      return data;
    });

    if (io) {
      io.to('commodities').emit('commodities-update', commodities);
      io.to('futures').emit('commodities-update', commodities);
    }
  };

  setInterval(updateCommodities, 4000);
};

const emitToRoom = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
  }
};

const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

const notifyUser = (userId, event, data) => {
  if (io) {
    io.to(`user-${userId}`).emit(event, data);
  }
};

const stopPriceUpdates = () => {
  if (priceUpdateInterval) {
    clearInterval(priceUpdateInterval);
  }
};

module.exports = {
  initializeSocket,
  emitToRoom,
  emitToAll,
  notifyUser,
  stopPriceUpdates
};
