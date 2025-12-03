const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      logger.info('No token, authorization denied');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      logger.info('Token is not valid');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Error in auth middleware', { error: error.message, stack: error.stack });
    res.status(401).json({ message: 'Token is not valid' });
  }
};



module.exports = { auth };