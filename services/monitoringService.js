// services/monitoringService.js
// Simple simulated metrics (no real ping/ICMP), safe for Render & local

const historyRepo = require('../repos/historyRepo');

let ioInstance = null;
let timer = null;

function init(io) {
  ioInstance = io;
  start();
}

function start() {
  stop();

  // generate a metric every 3 seconds
  timer = setInterval(() => {
    const metric = simulateMetric();

    const id = historyRepo.saveMetric(
      metric.deviceId,
      metric.in_bps,
      metric.out_bps,
      metric.latency_ms,
      metric.status
    );

    const payload = { ...metric, id };

    if (ioInstance) {
      ioInstance.emit('metric', payload);
    }

    console.log('metric', payload);
  }, 3000);
}

function stop() {
  if (timer) {
    clearInterval(timer);
  }
  timer = null;
}

// Simulated metric: random bandwidth + random latency
function simulateMetric() {
  const in_bps = 5_000_000 + Math.random() * 2_000_000;  // 5–7 Mbps
  const out_bps = 2_000_000 + Math.random() * 1_000_000; // 2–3 Mbps
  const latency_ms = 20 + Math.random() * 80;            // 20–100 ms

  const status = latency_ms > 80 ? 'high_latency' : 'ok';

  return {
    timestamp: new Date().toISOString(),
    deviceId: 'demo-device',
    in_bps,
    out_bps,
    latency_ms,
    status,
  };
}

module.exports = { init, start, stop };
