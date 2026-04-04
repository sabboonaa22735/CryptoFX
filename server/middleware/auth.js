const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'cryptofx-secret-key-change-in-production';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ message: 'Admin authorization failed' });
  }
};

const generateToken = (user) => {
  const userId = typeof user === 'object' ? user._id : user;
  const email = typeof user === 'object' ? user.email : null;
  const role = typeof user === 'object' ? user.role : 'user';
  
  return jwt.sign({ 
    userId, 
    email,
    role 
  }, JWT_SECRET, { expiresIn: '7d' });
};

const generateRefreshToken = (user) => {
  const userId = typeof user === 'object' ? user._id : user;
  const email = typeof user === 'object' ? user.email : null;
  const role = typeof user === 'object' ? user.role : 'user';
  
  return jwt.sign({ 
    userId, 
    email,
    role,
    type: 'refresh' 
  }, JWT_SECRET, { expiresIn: '30d' });
};

module.exports = { auth, adminAuth, generateToken, generateRefreshToken, JWT_SECRET };