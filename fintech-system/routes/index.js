const express = require('express');
const router = express.Router();
const path = require('path');
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');
const transactionController = require('../controllers/transactionController');
// 提供静态HTML文件的路径
const publicDir = path.join(__dirname, '../public');

// 现有的路由
router.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'home.html'));
});

router.get('/about', (req, res) => {
    res.sendFile(path.join(publicDir, 'about.html'));
});

router.get('/pricing', (req, res) => {
    res.sendFile(path.join(publicDir, 'pricing.html'));
});

router.get('/compliance', (req, res) => {
    res.sendFile(path.join(publicDir, 'compliance.html'));
});

router.get('/contact', (req, res) => {
    res.sendFile(path.join(publicDir, 'contact.html'));
});

// 添加新的登录和注册路由
router.get('/login', (req, res) => {
    res.sendFile(path.join(publicDir, 'login.html'));
});

router.post('/login', authController.login);

router.get('/register', (req, res) => {
    res.sendFile(path.join(publicDir, 'register.html'));
});

router.post('/register', authController.register);

router.get('/welcome', auth, (req, res) => {
    res.sendFile(path.join(publicDir, 'welcome.html'));
});

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});
// 添加新的获取当前用户信息的路由
// 添加获取当前用户数据的路由
router.get('/api/current-user', authController.getCurrentUser);
router.post('/transaction/top-up', auth, transactionController.topUp);
router.post('/transaction/transfer', auth, transactionController.transfer);

module.exports = router;
