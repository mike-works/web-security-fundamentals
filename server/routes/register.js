const express = require('express');
const router = express.Router();
const Db = require('../db').instance;

const User = Db.models.user;

function registrationError(req, res, message) {
  req.session.sessionFlash = {
    type: 'danger',
    message
  }
  res.render('auth/register', { title: 'Strawbank: Register', message });
}

/* GET home page. */
router.get('/', function(req, res/*, next*/) {
  res.render('auth/register', { title: 'Strawbank: Register' });
});

router.post('/', function(req, res, next) {
  let { username, password, password_confirmation: passwordConfirmation } = req.body;
  if (password !== passwordConfirmation) {
    registrationError(req, res, 'This email address has already been registered');
    return;
  }
  return User.create({
    username,
    password,
    passwordConfirmation
  })
  .then(() => {
    req.session.sessionFlash = {
      type: 'success',
      message: 'Successfully registered! Please login'
    }
    res.redirect(301, '/auth/login');
  })
  .catch((e) => {
    if (e.name.startsWith('Sequelize')) {
      let message = e.message.replace(/\n/g, '<br>');
      registrationError(req, res, message);
    } else {
      next(e);
    }      
  });
});

module.exports = router;
