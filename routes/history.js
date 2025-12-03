const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const historyRepo = require('../repos/historyRepo');

router.get('/', authMiddleware, (req, res) => {
  const rows = historyRepo.getLatest(100);
  res.json(rows);
});

module.exports = router;
