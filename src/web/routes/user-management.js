const express = require('express');
const router = express.Router();
const WebUser = require('../../models/WebUser');
const bcrypt = require('bcrypt');
const saltRounds = 10;

router.get('/', async (req, res) => {
  try {
    if (req.session.guildIds !== 'all') {
      req.session.message = 'Du bist dazu nicht berechtigt!';
      return res.redirect('/');
    }
    const allUsers = await WebUser.find({}).select('-password -__v').lean();
    return res.render('user-management', {
      allUsers: allUsers,
      error: null,
    });
  } catch (error) {
    console.log(error);
    return res.render('user-management', {
      allUsers: null,
      error: error.message,
    });
  }
});

router.post('/delete', async (req, res) => {
  const { userId } = req.body;
  await WebUser.findByIdAndDelete(userId);
  return res.redirect('/user-management');
});

router.post('/create', async (req, res) => {
  try {
    const { name, password, serverids } = req.body;
    const existing = await WebUser.findOne({ user: name });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const newUser = new WebUser({
        user: name,
        password: hashedPassword,
        guildIds: serverids,
        initialPWD: true,
      });
      await newUser.save();
      return res.redirect('/user-management');
    } else {
      const allUsers = await WebUser.find({}).select('-password -__v').lean();
      return res.render('user-management', {
        allUsers: allUsers,
        error: 'Der Nutzername ist bereits vergeben!',
      });
    }
  } catch (error) {
    console.log(error);
    return res.render('user-management', {
      allUsers: null,
      error: error.message,
    });
  }
});

module.exports = router;
