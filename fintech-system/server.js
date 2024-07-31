const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const transactionRouter = require('./routes/transactions');
const { sequelize } = require('./config/db'); // Ensure the sequelize instance is configured

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public')); // Serve static files before routes

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Remove EJS view engine setup since we're using static HTML
// app.set('view engine', 'ejs');
// app.set('views', __dirname + '/views');

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/transaction', transactionRouter);

// Serve static HTML files from the public directory
app.get('/top-up-account', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'topUpAccount.html'));
});

app.get('/transfer-money', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'transferMoney.html'));
});

sequelize.sync().then(() => {
  app.listen(5000, () => {
    console.log('Server is running on port 5000');
  });
});
