const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const historyRepo = require('../repos/historyRepo');

/**
 * Very simple "topology detection" based on recent metrics.
 * This matches the requirement: identify Switch vs Hub vs Unknown.
 *
 * - If avg latency < 80 ms  -> "switch"
 * - If avg latency >= 80 ms -> "hub"
 * - If no data              -> "unknown"
 */
router.get('/', authMiddleware, (req, res) => {
  try {
    // Get the latest 20 samples (you already use getLatest in dashboard)
    const rows = historyRepo.getLatest ? historyRepo.getLatest(20) : [];

    if (!rows || rows.length === 0) {
      return res.json({
        deviceId: 'demo-device',
        topology: 'unknown',
        reason: 'no data available yet',
      });
    }

    const avgLatency =
      rows.reduce((sum, r) => sum + (r.latency_ms || 0), 0) / rows.length;
    const avgIn =
      rows.reduce((sum, r) => sum + (r.in_bps || 0), 0) / rows.length;

    let topology = 'unknown';

    if (avgLatency < 80 && avgIn > 2_000_000) {
      topology = 'switch';
    } else if (avgLatency >= 80) {
      topology = 'hub';
    }

    res.json({
      deviceId: rows[0].device_id || rows[0].deviceId || 'demo-device',
      topology,
      avgLatency,
      avgIn,
    });
  } catch (err) {
    console.error('Error determining topology:', err);
    res.status(500).json({ message: 'Failed to determine topology' });
  }
});

module.exports = router;
