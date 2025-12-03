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
    const metric = await measureMetric();

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

// ✅ NEW: real latency using ping, works on Windows + Linux
function getRealLatency() {
  return new Promise((resolve) => {
    const isWin = process.platform === 'win32';
    // Windows uses -n, Linux uses -c
    const cmd = isWin ? 'ping -n 1 8.8.8.8' : 'ping -c 1 8.8.8.8';

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('Ping error:', error.message);
        return resolve(null);
      }

      let match;

      if (isWin) {
        // Typical Windows output: Average = 27ms  OR  time=27ms / time<1ms
        match =
          stdout.match(/Average = (\d+)ms/i) ||
          stdout.match(/time[=<]\s*(\d+)ms/i);
      } else {
        // Typical Linux output: time=27.3 ms
        match = stdout.match(/time[=<]?\s*([\d.]+)\s*ms/i);
      }

      if (match && match[1]) {
        const ms = parseFloat(match[1]);
        if (!Number.isNaN(ms)) {
          return resolve(ms);
        }
      }

      // couldn't parse → just return null
      resolve(null);
    });
  });
}

// build one metric using real latency + simulated bandwidth
async function measureMetric() {
  const latency_ms = await getRealLatency();

  const in_bps = 5_000_000 + Math.random() * 2_000_000;  // 5–7 Mbps
  const out_bps = 2_000_000 + Math.random() * 1_000_000; // 2–3 Mbps

  let status = 'ok';
  if (latency_ms == null) {
    status = 'no_ping';
  } else if (latency_ms > 80) {
    status = 'high_latency';
  }

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
