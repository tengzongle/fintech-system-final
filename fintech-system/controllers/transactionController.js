const User = require('../models/User');
const Transaction = require('../models/Transaction');
const bcrypt = require('bcryptjs');

exports.topUp = async (req, res) => {
  const { amount, transactionPassword } = req.body;
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(401).send('User not authenticated');
    }

    const isMatch = await bcrypt.compare(transactionPassword, user.transactionPassword);
    if (!isMatch) {
      return res.status(400).send('Invalid transaction password');
    }

    user.balance += parseFloat(amount);
    await user.save();

    await Transaction.create({ userId: user.id, type: 'top-up', amount });

    res.redirect('/welcome');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.transfer = async (req, res) => {
  const { amount, receiverId, transactionPassword } = req.body;
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(401).send('User not authenticated');
    }

    const isMatch = await bcrypt.compare(transactionPassword, user.transactionPassword);
    if (!isMatch) {
      return res.status(400).send('Invalid transaction password');
    }

    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).send('Receiver not found');
    }

    if (user.balance < amount) {
      return res.status(400).send('Insufficient balance');
    }
    user.balance -= parseFloat(amount);
    await user.save();

    receiver.balance += parseFloat(amount);
    await receiver.save();

    await Transaction.create({ userId: user.id, type: 'transfer', amount, receiverId: receiver.id });

    res.redirect('/welcome');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
exports.topUp = async (req, res) => {
  const { amount, transactionPassword } = req.body;
  const userId = req.session.user.id;

  try {
    const user = await User.findByPk(userId);
    console.log(user);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const isMatch = await bcrypt.compare(transactionPassword, user.transactionPassword);
    if (!isMatch) {
      return res.status(400).send('Invalid transaction password');
    }

    user.balance = parseFloat(user.balance) + parseFloat(amount); // 在现有余额基础上增加
    await user.save();

    await Transaction.create({
      senderId: user.id,
      receiverId: user.id,
      type: 'top-up',
      amount: parseFloat(amount)
    });

    console.log('User Data After Top-Up:', {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      balance: user.balance
    });

    res.status(200).send('Top up successful');
  } catch (err) {
    console.error('Top up error:', err);
    res.status(500).send('Server error');
  }
};
exports.transfer = async (req, res) => {
  const { receiverId, amount, transactionPassword } = req.body;
  const senderId = req.session.user.id;

  try {
    const sender = await User.findByPk(senderId);
    const receiver = await User.findByPk(receiverId);

    if (!receiver) {
      return res.status(400).json({ message: 'Receiver does not exist' });
    }

    // 验证交易密码
    const isMatch = await bcrypt.compare(transactionPassword, sender.transactionPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid transaction password' });
    }

    // 检查余额是否充足
    if (sender.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // 扣减发送者余额
    sender.balance -= parseFloat(amount);
    await sender.save();

    // 获取接收者的当前余额，并在此基础上增加
    const receiverBalanceBefore = parseFloat(receiver.balance);
    const receiverBalanceAfter = receiverBalanceBefore + parseFloat(amount);
    receiver.balance = receiverBalanceAfter;
    await receiver.save(); // 确保接收者的变更被保存

    // 记录交易
    await Transaction.create({
      senderId: senderId,
      receiverId: receiverId,
      amount: parseFloat(amount),
      date: new Date()
    });

    res.status(200).json({ message: 'Transfer successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

