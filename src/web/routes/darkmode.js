const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  req.session.darkmode != req.session.darkmode;
  return res.redirect('back');
});

module.exports = router;
