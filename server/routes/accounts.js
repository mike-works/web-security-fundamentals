const express = require('express');
const router = express.Router();
const Db = require('../db').instance;

const Account = Db.models.account;

const { bounceOutIfLoggedOut } = require('../utils/auth');

router.get('/', function(req, res, next) {
  bounceOutIfLoggedOut(req, res, () => {
    Account.findAll({
      where: {
        userId: req.session.currentUser.id,
      }
    }).then(accounts => {
      res.render('accounts', { title: 'Strawbank: Accounts', accounts });
    });
  });
});

router.post('/:id/delete', function(req, res, next) {
  let { id } = req.params;
  bounceOutIfLoggedOut(req, res, () => {
    Account.findOne({
      where: {
        id,
        userId: req.session.currentUser.id
      }
    }).then(account => {
      let message = `Deleted account ${account.name}`;
      req.session.sessionFlash = {
        type: 'success',
        message
      }
      return account.destroy();
    }).then(() => {
      res.redirect('/accounts');
    }).catch((e) => {
      if (e.name.startsWith('Sequelize')) {
        let message = e.message.replace(/\n/g, '<br>');
        req.session.sessionFlash = {
          type: 'danger',
          message
        }
        res.redirect('/accounts');
      } else {
        next(e);
      }
    })
  });
});

router.post('/', function(req, res, next) {
  bounceOutIfLoggedOut(req, res, () => {
    let { name } = req.body;
    Account.create({
      userId: req.session.currentUser.id,
      name
    }).then((account) => {
      req.session.sessionFlash = {
        type: 'success',
        message: `Created new account ${account.name}`
      }
      res.redirect('accounts');
    })
    .catch((e) => {
      if (e.name.startsWith('Sequelize')) {
        let message = e.message.replace(/\n/g, '<br>');
        req.session.sessionFlash = {
          type: 'danger',
          message
        }
        res.redirect('accounts');
      } else {
        next(e);
      }   
    })
  });
});

module.exports = router;
