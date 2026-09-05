require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');
const readDatabaseRouter = require('./routes/read-database');
const userManagement = require('./routes/user-management');
const changePassword = require('./routes/change-password');
const userActivity = require('./routes/user-activity');
const games = require('./routes/games');
const logs = require('./routes/logs');
const jobs = require('./routes/jobs');
const channelselection = require('./routes/channelselection');
const serverconfig = require('./routes/serverconfig');
const darkmode = require('./routes/darkmode');
const app = express();
const port = 3003;
const WebUser = require('../models/WebUser');
const bcrypt = require('bcrypt');
const fetchedGuilds = new Set();

app.set('view engine', 'ejs');
app.set('trust proxy', true);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../../public')));

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
    return res.render('login');
  });
  app.post('/login', async (req, res) => {
    const submittedPassword = req.body.password;
    const submittedName = req.body.user;
    const user = await WebUser.findOne({ user: submittedName });
    if (user && (await bcrypt.compare(submittedPassword, user.password))) {
      console.log(`User ${submittedName} logged in.`);
      req.session.userId = user._id;
      req.session.userName = user.user;
      req.session.guildIds = user.guildIds;
      req.session.initialPWD = user.initialPWD;
      req.session.darkmode = false;
      if (user.initialPWD) {
        return res.redirect('/change-password');
      }
      return res.redirect('/');
    } else {
      console.log(`User ${submittedName} failed to log in.`);
      const clientIp = req.ip || req.connection.remoteAddress;
      const logMessage = `${new Date().toISOString()} FAILED_LOGIN IP=${clientIp} user=${submittedName}\n`;
      fs.appendFile('/var/log/bot-login.log', logMessage, (err) => {
        if (err) console.error('Fehler beim Schreiben des Auth-Logs:', err);
      });
      return res.render('login', { error: 'Falsches Passwort!' });
    }
  });
  app.get('/logout', (req, res) => {
    console.log(`User ${req.session.userName} logged out.`);
    req.session.destroy();
    return res.redirect('/login');
  });

  //geschützte routen
  app.get('/', requireLogin, async (req, res) => {
    const client = req.discordClient;
    let servers = client.guilds.cache.map((guild) => ({
      id: guild.id,
      name: guild.name,
    }));
    const allowedGuilds = req.session.guildIds;
    if (allowedGuilds !== 'all') {
      const allowedIds = allowedGuilds.split(',').map((id) => id.trim());
      servers = servers.filter((server) => allowedIds.includes(server.id));
    }
    const selectedServerId = req.query.serverId || servers[0]?.id;
    let guild = client.guilds.cache.get(selectedServerId);
    if (!fetchedGuilds.has(selectedServerId)) {
      await guild.members.fetch({ withPresences: true });
      fetchedGuilds.add(selectedServerId);
    }
    const members = await guild.members.cache;
    const humanMemNum = members.filter((member) => !member.user.bot).size;
    const onlineMemNum = members.filter((member) => {
      if (member.user.bot) return false;
      const status = member.presence?.status;
      return status === 'online' || status === 'idle' || status === 'dnd';
    }).size;
    console.log(
      `Current online on Server ${selectedServerId}: ${onlineMemNum}`,
    );
    console.log(
      `Members without bot on Server ${selectedServerId}: ${humanMemNum}`,
    );
    const message = req.session.message || null;
    req.session.message = null;
    return res.render('index', {
      servers: servers,
      message: message,
      guildIds: req.session.guildIds,
      selectedServerId: selectedServerId,
      onlineMemNum: onlineMemNum,
      humanMemNum: humanMemNum,
      serverIcon: guild.iconURL(),
      darkmode: req.session.darkmode,
    });
  });
  app.use('/read-database', requireLogin, readDatabaseRouter);
  app.use('/user-management', requireLogin, userManagement);
  app.use('/jobs', requireLogin, jobs);
  app.use('/change-password', requireLogin, changePassword);
  app.use('/user-activity', requireLogin, userActivity);
  app.use('/logs', requireLogin, logs);
  app.use('/channelselection', requireLogin, channelselection);
  app.use('/serverconfig', requireLogin, serverconfig);
  app.use('/games', requireLogin, games);
  app.use('/darkmode', requireLogin, darkmode);

  app.get(/(.*)/, (req, res) => {
    return res.redirect('/');
  });
  app.listen(port, () => {
    console.log(`[Dashboard] Webserver läuft auf Port:${port}`);
  });
}

module.exports = { startWebsite };
