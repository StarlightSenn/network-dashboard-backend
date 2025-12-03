// routes/settings.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// File to store settings persistently
const SETTINGS_FILE = path.join(__dirname, '..', 'settings.json');

// Load settings from file or use defaults
function loadSettings() {
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    // Default settings (match your app defaults)
    return {
      refreshSeconds: 3,
      latencyThreshold: 120,
      alertsEnabled: true,
      themeMode: 'light',
    };
  }
}

// Save settings to file
function saveSettings(settings) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

// GET /api/settings  → return current settings
router.get('/', (req, res) => {
  const settings = loadSettings();
  res.json(settings);
});

// PUT /api/settings  → update settings
router.put('/', (req, res) => {
  const { refreshSeconds, latencyThreshold, alertsEnabled, themeMode } = req.body;

  const current = loadSettings();

  const updated = {
    ...current,
    ...(refreshSeconds !== undefined ? { refreshSeconds } : {}),
    ...(latencyThreshold !== undefined ? { latencyThreshold } : {}),
    ...(alertsEnabled !== undefined ? { alertsEnabled } : {}),
    ...(themeMode !== undefined ? { themeMode } : {}),
  };

  saveSettings(updated);
  res.json(updated);
});

module.exports = router;
