const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('calculator');
});

router.post('/', (req, res) => {
  const gesendeteZahl = Number(req.body.eingabeZahl);
  const geklickteAktion = req.body.aktion;
  let neueZahl;

  if (geklickteAktion === 'plus') {
    neueZahl = gesendeteZahl + 1;
  } else if (geklickteAktion === 'minus') {
    neueZahl = gesendeteZahl - 1;
  }

  res.render('calculator', { ergebnis: neueZahl });
});

module.exports = router;
