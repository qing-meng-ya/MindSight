const express = require('express');
const { getAllUsers } = require('../services/database');

const router = express.Router();

router.get('/', (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '仅管理员可访问' });
  }
  
  try {
    const users = getAllUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

module.exports = router;
