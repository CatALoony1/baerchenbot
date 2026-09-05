const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  console.log(req.session.darkmode);
  req.session.darkmode = !req.session.darkmode;
  console.log(req.session.darkmode);
  return res.redirect('back');
});

module.exports = router;
