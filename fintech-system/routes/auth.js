const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const path = require('path');

// 提供登录页面
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

// 处理登录请求
router.post('/login', authController.login);

// 提供注册页面
router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'register.html'));
});

// 处理注册请求
router.post('/register', authController.register);

module.exports = router;
