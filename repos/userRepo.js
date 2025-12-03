const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  createUser: (username, passwordHash, role = 'user') => {
    const id = uuidv4();
    const stmt = db.prepare(
      'INSERT INTO users (id, username, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run(id, username, passwordHash, role, new Date().toISOString());
    return { id, username, role };
  },

  getUserByUsername: (username) => {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  },

  listUsers: () => {
    return db
      .prepare('SELECT id, username, role, is_active, created_at FROM users')
      .all();
  },

  updateUserRole: (id, role) => {
    return db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
  },

  deleteUser: (id) => {
    return db.prepare('DELETE FROM users WHERE id = ?').run(id);
  }
};
