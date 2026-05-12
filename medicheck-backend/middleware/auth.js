// middleware/auth.js
// FIX: Returns { tokenExpired: true } on expiry so the frontend
// ApiClient can call /api/auth/refresh-token instead of showing
// a generic "Token is not valid" and forcing re-login.

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      // Tell the frontend specifically that the token expired
      // so it can call /refresh-token instead of logging the user out
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired',
          tokenExpired: true   // ← ApiClient checks this flag
        });
      }
      // Invalid signature or malformed token — reject hard
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }

    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Token is not valid' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    req.user = user;
    next();

  } catch (error) {
    res.status(401).json({ 
      success: false,
      message: 'Token is not valid' 
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    if (!roles.includes(req.user.role) && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: `User role ${req.user.role} is not authorized` 
      });
    }
    next();
  };
};

// import jwt from 'jsonwebtoken';
// import User from '../models/User.js';

// export const auth = async (req, res, next) => {
//   try {
//     const token = req.header('Authorization')?.replace('Bearer ', '');
    
//     if (!token) {
//       return res.status(401).json({ message: 'No token provided' });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id).select('-password');
    
//     if (!user) {
//       return res.status(401).json({ message: 'Token is not valid' });
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     res.status(401).json({ message: 'Token is not valid' });
//   }
// };

// export const authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ 
//         message: `User role ${req.user.role} is not authorized` 
//       });
//     }
//     next();
//   };
// };
