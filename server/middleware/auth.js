const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Coordinator = require('../models/Coordinator');

module.exports = async function (req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    
    // Try to find student first
    let user = await Student.findById(decoded._id || decoded.id);
    let userType = 'student';
    
    // If not a student, try to find coordinator
    if (!user) {
      user = await Coordinator.findById(decoded._id || decoded.id);
      userType = 'coordinator';
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Attach both user and user type to the request
    req.user = user;
    req.userType = userType;
    req.token = token;
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token. Please authenticate.' });
  }
};