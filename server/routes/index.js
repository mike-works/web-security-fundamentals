const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../utils/auth');

/* GET home page. */
router.all('/', function(req, res, next) {
  if (isAuthenticated(req)) {
    res.redirect(307, '/accounts');
  } else {
    res.render('index', { title: 'Strawbank' });
  }
});

module.exports = router;
