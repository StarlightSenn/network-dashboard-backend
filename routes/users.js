const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const userRepo = require('../repos/userRepo');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

// all /api/users routes require auth + admin
router.use(authMiddleware, adminOnly);

// GET /api/users
router.get('/', (req, res) => {
  const users = userRepo.listUsers();
  res.json(users);
});

// POST /api/users
router.post('/', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'username and password required' });
  }

  const existing = userRepo.getUserByUsername(username);
  if (existing) {
    return res.status(409).json({ message: 'username exists' });
  }

  const hash = await bcrypt.hash(password, 10);
  const user = userRepo.createUser(username, hash, role || 'user');
  res.status(201).json(user);
});

// PUT /api/users/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  userRepo.updateUserRole(id, role);
  res.json({ message: 'updated' });
});

// DELETE /api/users/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  userRepo.deleteUser(id);
  res.json({ message: 'deleted' });
});

module.exports = router;
