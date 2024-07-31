const express = require('express');
const router = express.Router();
const path = require('path');
const auth = require('../middleware/auth'); // 确保有auth中间件
const User = require('../models/User'); // 确保有User模型
const Transaction = require('../models/Transaction'); // 确保有Transaction模型
const bcrypt = require('bcryptjs');

// 提供静态HTML文件的路径
const publicDir = path.join(__dirname, '../public');

// 渲染添加资金页面
router.get('/top-up-account', auth, (req, res) => {
    res.sendFile(path.join(publicDir, 'topUpAccount.html'));
});

// 渲染转账页面
router.get('/transfer-money', auth, (req, res) => {
    res.sendFile(path.join(publicDir, 'transferMoney.html'));
});

// 处理添加资金请求
router.post('/top-up', auth, async (req, res) => {
    const { amount, transactionPassword } = req.body;

    try {
        const user = req.session.user;
        if (!user) {
            return res.status(401).send('User not authenticated');
        }

        // 验证交易密码
        const isMatch = await bcrypt.compare(transactionPassword, user.transactionPassword);
        if (!isMatch) {
            return res.status(400).send('Invalid transaction password');
        }

        // 更新用户余额
        user.balance += parseFloat(amount);
        await user.save();

        // 创建交易记录
        await Transaction.create({ userId: user.id, type: 'top-up', amount });

        res.redirect('/welcome');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// 处理转账请求
router.post('/transfer', auth, async (req, res) => {
    const { amount, receiverId, transactionPassword } = req.body;

    try {
        const user = req.session.user;
        if (!user) {
            return res.status(401).send('User not authenticated');
        }

        // 验证交易密码
        const isMatch = await bcrypt.compare(transactionPassword, user.transactionPassword);
        if (!isMatch) {
            return res.status(400).send('Invalid transaction password');
        }

        // 确保接收者存在
        const receiver = await User.findByPk(receiverId);
        if (!receiver) {
            return res.status(404).send('Receiver not found');
        }

        // 更新用户余额
        if (user.balance < amount) {
            return res.status(400).send('Insufficient balance');
        }
        user.balance -= parseFloat(amount);
        await user.save();

        // 更新接收者余额
        receiver.balance += parseFloat(amount);
        await receiver.save();

        // 创建交易记录
        await Transaction.create({ userId: user.id, type: 'transfer', amount, receiverId: receiver.id });

        res.redirect('/welcome');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
