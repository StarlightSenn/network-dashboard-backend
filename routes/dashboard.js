const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const historyRepo = require('../repos/historyRepo');

// GET /api/dashboard/current
router.get('/current', authMiddleware, (req, res) => {
  const rows = historyRepo.getLatest(1);
  res.json(rows.length ? rows[0] : null);
});

module.exports = router;
