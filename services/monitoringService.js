const { exec } = require('child_process');
const historyRepo = require('../repos/historyRepo');

let ioInstance = null;
let timer = null;

function init(io) {
  ioInstance = io;
  start();
}

function start() {
  stop();

  // run every 3 seconds
  timer = setInterval(async () => {
    const metric = await simulateMetric();
    const id = historyRepo.saveMetric(
      metric.deviceId,
      metric.in_bps,
      metric.out_bps,
      metric.latency_ms,
      metric.status
    );
    const payload = { ...metric, id };

    if (ioInstance) ioInstance.emit('metric', payload);
    console.log('metric', payload);
  }, 3000);
}

function stop() {
  if (timer) clearInterval(timer);
  timer = null;
}

// 🔹 Real ping-based latency to 8.8.8.8 (Windows-style output)
function getRealLatency() {
  return new Promise((resolve) => {
    // On Windows: "-n 1" → send 1 echo request
    exec('ping -n 1 8.8.8.8', (error, stdout, stderr) => {
      if (error) {
        // Ping failed (no internet, DNS issue, etc.)
        return resolve(null);
      }

      // Try typical Windows "Average = 27ms"
      let match = stdout.match(/Average = (\d+)ms/i);
      if (!match) {
        // Fallback: "time=27ms" or "time<1ms"
        match = stdout.match(/time[=<]\s*(\d+)ms/i);
      }

      if (match && match[1]) {
        const ms = parseFloat(match[1]);
        return resolve(ms);
      }

      // Couldn’t parse → treat as no result
      resolve(null);
    });
  });
}

// 🔹 Use real latency + simulated bandwidth
async function simulateMetric() {
  const in_bps = 5_000_000 + Math.random() * 2_000_000;  // 5–7 Mbps
  const out_bps = 2_000_000 + Math.random() * 1_000_000; // 2–3 Mbps

  const realLatency = await getRealLatency();

  // If ping failed, we set latency to null and status = 'unknown'
  const latency_ms = realLatency !== null ? realLatency : null;

  let status = 'ok';
  if (latency_ms === null) {
    status = 'unknown';
  } else if (latency_ms > 80) {
    status = 'high_latency';
  }

  return {
    timestamp: new Date().toISOString(),
    deviceId: 'demo-device',
    in_bps,
    out_bps,
    latency_ms,
    status
  };
}

module.exports = { init, start, stop };
