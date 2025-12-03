const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'network_dashboard.db');
const db = new Database(dbPath);

module.exports = db;
