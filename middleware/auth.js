const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DeliveryBoy = require('../models/DeliveryBoy');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if user exists
    let user = await User.findById(decoded.id);
    
    if (!user) {
      // Check if delivery boy exists
      user = await DeliveryBoy.findById(decoded.id);
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth; 