const express = require('express');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');
const { getDb } = require('../services/database');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password, name, role = 'forensic' } = req.body;
    
    if (!username || !password || !name) {
      return res.status(400).json({ error: '请填写完整信息' });
    }

    const db = getDb();
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    
    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = db.prepare(
      'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)'
    ).run(username, hashedPassword, name, role);

    const token = generateToken({
      id: result.lastInsertRowid,
      username,
      role,
      name
    });

    res.json({
      message: '注册成功',
      token,
      user: { id: result.lastInsertRowid, username, name, role }
    });
  } catch (error) {
    res.status(500).json({ error: '注册失败' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '请输入用户名和密码' });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const token = generateToken(user);

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: '登录失败' });
  }
});

router.get('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ valid: false });
  }

  const jwt = require('jsonwebtoken');
  const { JWT_SECRET } = require('../middleware/auth');
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ valid: false });
  }
});

module.exports = router;
