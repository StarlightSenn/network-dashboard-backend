require('dotenv').config();
const settingsRouter = require('./routes/settings');
const fs = require('fs');
const topologyRoutes = require('./routes/topologyRoutes');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./config/db');
const bcrypt = require('bcrypt');
const userRepo = require('./repos/userRepo');

// run migrations
const initSql = fs.readFileSync(
  path.join(__dirname, 'migrations', 'init.sql'),
  'utf8'
);
db.exec(initSql);

// seed default admin
(async () => {
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
  if (!row) {
    const hash = await bcrypt.hash('admin123', 10);
    userRepo.createUser('admin', hash, 'admin');
    console.log('Created default admin: admin / admin123');
  }
})();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');
const historyRoutes = require('./routes/history');
const monitoringService = require('./services/monitoringService');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.json({ message: 'Network Dashboard API running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/topology', topologyRoutes);
app.use('/api/settings', settingsRouter);

// socket.io
io.on('connection', (socket) => {
  console.log('client connected', socket.id);
  socket.on('disconnect', () => console.log('client disconnected', socket.id));
});

// start monitoring simulator
monitoringService.init(io);

const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
