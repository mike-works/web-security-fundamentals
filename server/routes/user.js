const express = require('express');
const router = express.Router();
const { bounceOutIfLoggedOut } = require('../utils/auth');
const Db = require('../db').instance;

router.get('/:username', function(req, res, next) {
  let { username } = req.params;
  bounceOutIfLoggedOut(req, res, () => {
    Db.query("SELECT id, username, createdAt FROM users WHERE username = '" + username + "';").spread((results) => {
      res.render('user', {title: 'User', user: results[0] || username });
    })
    .catch(() => {
      req.session.sessionFlash = {
        type: 'danger',
        message: `No user found: ${username}`
      }
      res.redirect('/accounts');
    });
  });
});

module.exports = router;
