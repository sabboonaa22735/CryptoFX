require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const marketRoutes = require('./routes/markets');
const tradeRoutes = require('./routes/trades');
const walletRoutes = require('./routes/wallet');
const supportRoutes = require('./routes/support');
const aiRoutes = require('./routes/ai');
const indicesRoutes = require('./routes/indices');
const stocksRoutes = require('./routes/stocks');
const futuresRoutes = require('./routes/futures');
const copytradingRoutes = require('./routes/copytrading');
const superadminRoutes = require('./routes/superadmin');
const depositsRoutes = require('./routes/deposits');
const cryptoRoutes = require('./routes/crypto');
const portfolioRoutes = require('./routes/portfolio');
const { initializeSocket } = require('./sockets');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500
});
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/indices', indicesRoutes);
app.use('/api/stocks', stocksRoutes);
app.use('/api/futures', futuresRoutes);
app.use('/api/copytrading', copytradingRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/deposits', depositsRoutes);
app.use('/api/crypto', cryptoRoutes);
app.use('/api/portfolio', portfolioRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

initializeSocket(io);

const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cryptofx';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = { app, io };