const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const diagnosisRoutes = require('./routes/diagnosis');
const userRoutes = require('./routes/users');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/diagnosis', authenticateToken, diagnosisRoutes);
app.use('/api/users', authenticateToken, userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`司法助手后端服务运行在端口 ${PORT}`);
});
