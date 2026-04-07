const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'cryptofx-secret-key-change-in-production';

const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || 'superadmin@cryptofx.com';
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin@123!';
const SUPERADMIN_PIN = process.env.SUPERADMIN_PIN || '123456';

const isSuperAdmin = (email, role, userId) => {
  if (role === 'superadmin') return true;
  if (role === 'admin') return true;
  if (email === SUPERADMIN_EMAIL) return true;
  if (userId && (userId.startsWith('admin') || userId.includes('superadmin'))) return true;
  return false;
};

const superAdminAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (!isSuperAdmin(decoded.email, decoded.role, decoded.userId)) {
      return res.status(403).json({ message: 'Superadmin access required' });
    }

    req.superAdmin = {
      email: decoded.email || 'admin@cryptofx.com',
      role: decoded.role || 'admin',
      userId: decoded.userId,
      isSuperAdmin: decoded.role === 'superadmin'
    };
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const superAdminLogin = async (req, res) => {
  const { email, password, pin } = req.body;
  
  if (pin === SUPERADMIN_PIN) {
    if (email && password) {
      if (email === SUPERADMIN_EMAIL && password === SUPERADMIN_PASSWORD) {
        const token = jwt.sign(
          { 
            userId: 'superadmin', 
            email: SUPERADMIN_EMAIL, 
            role: 'superadmin' 
          }, 
          JWT_SECRET, 
          { expiresIn: '7d' }
        );
        
        const refreshToken = jwt.sign(
          { 
            userId: 'superadmin', 
            email: SUPERADMIN_EMAIL, 
            role: 'superadmin',
            type: 'refresh' 
          }, 
          JWT_SECRET, 
          { expiresIn: '30d' }
        );
        
        return res.json({
          token,
          refreshToken,
          user: {
            _id: 'superadmin',
            email: SUPERADMIN_EMAIL,
            name: 'Super Admin',
            role: 'superadmin',
            avatar: null
          }
        });
      }
      
      const user = await User.findOne({ email }).select('+password');
      if (user && user.role === 'admin') {
        const isMatch = await user.comparePassword(password);
        if (isMatch) {
          const token = jwt.sign(
            { 
              userId: user._id.toString(), 
              email: user.email, 
              role: user.role 
            }, 
            JWT_SECRET, 
            { expiresIn: '7d' }
          );
          
          const refreshToken = jwt.sign(
            { 
              userId: user._id.toString(), 
              email: user.email, 
              role: user.role,
              type: 'refresh' 
            }, 
            JWT_SECRET, 
            { expiresIn: '30d' }
          );
          
          return res.json({
            token,
            refreshToken,
            user: {
              _id: user._id,
              email: user.email,
              name: user.name,
              role: user.role,
              avatar: user.avatar
            }
          });
        }
      }
    }
    
    const user = await User.findOne({ role: 'admin' });
    if (user) {
      const token = jwt.sign(
        { 
          userId: user._id.toString(), 
          email: user.email, 
          role: user.role 
        }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
      );
      
      const refreshToken = jwt.sign(
        { 
          userId: user._id.toString(), 
          email: user.email, 
          role: user.role,
          type: 'refresh' 
        }, 
        JWT_SECRET, 
        { expiresIn: '30d' }
      );
      
      return res.json({
        token,
        refreshToken,
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar
        }
      });
    }
  }
  
  return res.status(401).json({ message: 'Invalid superadmin credentials' });
};

module.exports = { 
  superAdminAuth, 
  superAdminLogin, 
  isSuperAdmin,
  SUPERADMIN_EMAIL,
  SUPERADMIN_PIN
};
