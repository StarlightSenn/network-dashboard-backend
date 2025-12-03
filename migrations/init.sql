-- users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin','user')),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

-- settings
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- metrics history
CREATE TABLE IF NOT EXISTS metrics (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  device_id TEXT,
  in_bps REAL,
  out_bps REAL,
  latency_ms REAL,
  status TEXT
);

-- alerts log
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  type TEXT NOT NULL,
  value REAL,
  message TEXT
);
