require('dotenv').config();
const express = require('express');
const session = require('express-session');
const calculatorRouter = require('./routes/calculator');
const channelsRouter = require('./routes/channels');
const readDatabaseRouter = require('./routes/read-database');
const userManagement = require('./routes/user-management');
const changePassword = require('./routes/change-password');
const userActivity = require('./routes/user-activity');
const logs = require('./routes/logs');
const jobs = require('./routes/jobs');
const app = express();
const port = 3000;
const WebUser = require('../models/WebUser');
const bcrypt = require('bcrypt');

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.WEBSECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  }),
);

function requireLogin(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect('/login');
  }
  if (req.session.initialPWD) {
    if (req.originalUrl.startsWith('/change-password')) {
      return next();
    }
    return res.redirect('/change-password');
  }
  next();
}

function startWebsite(client) {
  app.use((req, res, next) => {
    req.discordClient = client;
    next();
  });
  app.get('/login', (req, res) => {
    res.render('login');
  });
  app.post('/login', async (req, res) => {
    const submittedPassword = req.body.password;
    const submittedName = req.body.user;
    const user = await WebUser.findOne({ user: submittedName });
    if (user && (await bcrypt.compare(submittedPassword, user.password))) {
      req.session.userId = user._id;
      req.session.userName = user.user;
      req.session.guildIds = user.guildIds;
      req.session.initialPWD = user.initialPWD;
      if (user.initialPWD) {
        return res.redirect('/change-password');
      }
      res.redirect('/');
    } else {
      res.render('login', { error: 'Falsches Passwort!' });
    }
  });
  app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
  });

  //geschützte routen
  app.get('/', requireLogin, (req, res) => {
    const message = req.session.message || null;
    req.session.message = null;
    res.render('index', { message: message, guildIds: req.session.guildIds });
  });
  app.use('/rechner', requireLogin, calculatorRouter);
  app.use('/kanaele', requireLogin, channelsRouter);
  app.use('/read-database', requireLogin, readDatabaseRouter);
  app.use('/user-management', requireLogin, userManagement);
  app.use('/jobs', requireLogin, jobs);
  app.use('/change-password', requireLogin, changePassword);
  app.use('/user-activity', requireLogin, userActivity);
  app.use('/logs', requireLogin, logs);

  app.get(/(.*)/, (req, res) => {
    res.redirect('/');
  });
  app.listen(port, () => {
    console.log(`[Dashboard] Webserver läuft auf http://localhost:${port}`);
  });
}

module.exports = { startWebsite };
