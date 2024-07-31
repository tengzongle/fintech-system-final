// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { User, Transaction } = require('../models');

exports.register = async (req, res) => {
  console.log('Register form data:', req.body);

  const { name, email, phone, password, transactionPassword } = req.body;
  try {
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).send('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const hashedTransactionPassword = await bcrypt.hash(transactionPassword, salt);

    user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      transactionPassword: hashedTransactionPassword,
      balance: 0.00
    });

    const payload = { user: { id: user.id } };
    jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.cookie('token', token, { httpOnly: true });
      req.session.user = user;
      res.redirect('/welcome');
    });
  } catch (err) {
    console.error('Error details:', err.errors);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  console.log('Login form data:', req.body);

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).send('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }

    const payload = { user: { id: user.id } };
    jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.cookie('token', token, { httpOnly: true });
      req.session.user = user;
      res.redirect('/welcome');
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(404).send('User not found');
    }

    const userWithTransactions = await User.findByPk(user.id, {
      include: [
        {
          model: Transaction,
          as: 'transactionsSent'
        },
        {
          model: Transaction,
          as: 'transactionsReceived'
        }
      ]
    });

    if (!userWithTransactions) {
      return res.status(404).send('User not found');
    }

    res.json({
      id: userWithTransactions.id,
      name: userWithTransactions.name,
      balance: userWithTransactions.balance,
      transactionsSent: userWithTransactions.transactionsSent,
      transactionsReceived: userWithTransactions.transactionsReceived
    });
  } catch (err) {
    console.error('Error in /api/current-user:', err.message);
    res.status(500).send('Server error');
  }
};
