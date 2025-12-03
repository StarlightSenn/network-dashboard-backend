const jwt = require('jsonwebtoken');
require('dotenv').config();

function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ message: 'Missing token' });

  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Invalid token' });

  jwt.verify(token, process.env.JWT_SECRET || 'change_me', (err, payload) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.user = payload;
    next();
  });
}

function adminOnly(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Requires admin' });
  next();
}

module.exports = { authMiddleware, adminOnly };
