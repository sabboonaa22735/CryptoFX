require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images and PDFs are allowed'));
  }
});

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
const notificationRoutes = require('./routes/notifications');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

const { initializeSocket, emitAdminUpdate, invalidateCache } = require('./sockets');
initializeSocket(io);

app.use(helmet());
app.set('trust proxy', 1);
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20
});

const loginSkip = (req) => {
  return req.path.includes('/login');
};

app.use('/api/superadmin/login', (req, res, next) => next());
app.use('/api/superadmin', superadminRoutes);
app.use('/api/auth/login', (req, res, next) => next());
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/', limiter);
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
app.use('/api/deposits', depositsRoutes);
app.use('/api/crypto', cryptoRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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

module.exports = { app, io, emitAdminUpdate, invalidateCache, upload };