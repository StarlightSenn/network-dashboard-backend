const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  saveMetric: (deviceId, in_bps, out_bps, latency_ms, status = 'ok') => {
    const id = uuidv4();
    db.prepare(
      'INSERT INTO metrics (id, timestamp, device_id, in_bps, out_bps, latency_ms, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      id,
      new Date().toISOString(),
      deviceId,
      in_bps,
      out_bps,
      latency_ms,
      status
    );
    return id;
  },

  getLatest: (limit = 10) => {
    return db
      .prepare('SELECT * FROM metrics ORDER BY timestamp DESC LIMIT ?')
      .all(limit);
  }
};
