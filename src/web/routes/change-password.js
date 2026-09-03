const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const WebUser = require('../../models/WebUser');

router.get('/', (req, res) => {
  res.render('change-password', {
    guildIds: req.session.guildIds,
    error: null,
    message: null,
    initial: req.session.initialPWD,
  });
});

router.post('/change', async (req, res) => {
  const { oldpassword, password, confirm_password } = req.body;
  if (password === confirm_password) {
    if (oldpassword !== password) {
      try {
        const user = await WebUser.findById(req.session.userId);
        if (user && (await bcrypt.compare(oldpassword, user.password))) {
          let wasInitial = req.session.initialPWD;
          const hashedPassword = await bcrypt.hash(password, saltRounds);
          user.password = hashedPassword;
          if (user.initialPWD) {
            user.initialPWD = false;
            req.session.initialPWD = false;
          }
          user.save();
          console.log(`User ${user.user} changed password.`);
          if (wasInitial) {
            req.session.message = 'Passwort erfolgreich geändert!';
            return res.redirect('/');
          }
          return res.render('change-password', {
            error: null,
            message: 'Passwort erfolgreich geändert!',
            initial: req.session.initialPWD,
          });
        } else {
          console.log(
            `User ${user.user} failed to change password, incorrect old password.`,
          );
          return res.render('change-password', {
            guildIds: req.session.guildIds,
            error: 'Falsches altes Passwort!',
            message: null,
            initial: req.session.initialPWD,
          });
        }
      } catch (error) {
        console.log(error);
        return res.render('change-password', {
          guildIds: req.session.guildIds,
          error: error.message,
          message: null,
          initial: req.session.initialPWD,
        });
      }
    } else {
      return res.render('change-password', {
        guildIds: req.session.guildIds,
        error: 'Neues Passwort darf nicht das alte sein.',
        message: null,
        initial: req.session.initialPWD,
      });
    }
  } else {
    return res.render('change-password', {
      guildIds: req.session.guildIds,
      error: 'Passwörter stimmen nicht überein.',
      message: null,
      initial: req.session.initialPWD,
    });
  }
});

module.exports = router;
