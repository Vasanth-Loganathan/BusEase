const jwt = require('jsonwebtoken');
require('dotenv').config(); // Make sure environment variables are loaded
const SECRET_KEY = process.env.JWT_SECRET || 'default_secret_key';
// General authentication middleware
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token missing' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;  // decoded contains { userId, role } if you add role in token
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
// Admin-only middleware
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'administrator') {
        return res.status(403).json({ message: 'Access forbidden: Admins only' });
    }
    next();
};
module.exports = {
    authenticate,
    isAdmin
};
