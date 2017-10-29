const Sequelize = require('sequelize');
const express = require('express');
const router = express.Router();
const collection = require('lodash/collection'); 

const Db = require('../db').instance;
const Account = Db.models.account;
const User = Db.models.user;

const { bounceOutIfLoggedOut } = require('../utils/auth');

function errorAndReload(req, res, message) {
  req.session.sessionFlash = {
    type: 'danger',
    message
  }
  res.redirect('/transfers');
}
//////////////////////////////////////////////////////////////
//// ↓ EXERCISE 5 SOLUTION GOES HERE
////   - Add CSRF protection to this route
router.get('/', function(req, res/*, next*/) {
  bounceOutIfLoggedOut(req, res, () => {
    let { accountTo, accountFrom, amount } = req.query;
    Account.findAll({
      attributes: ['id', 'number', 'name', 'userId', 'balance'],
      include: [{
        model: User,
        where: { id: Sequelize.col('userId') }
      }]
    }).then(allAccounts => {
      let myAccounts = allAccounts.filter((a) => a.userId === req.session.currentUser.id);
      let userAccounts = collection.groupBy(
        allAccounts.map(a => a.get({plain: true})), acc => acc.user.username);
      //////////////////////////////////////////////////////////////
      //// ↓ EXERCISE 5 SOLUTION GOES HERE
      ////   - Pass req.csrfToken() to template so it can be rendered
      res.render('transfers', { title: 'Strawbank: Transfers', myAccounts, userAccounts, accountTo, accountFrom, amount });
    });
  });
});

//////////////////////////////////////////////////////////////
//// ↓ EXERCISE 5 SOLUTION GOES HERE
////   - Add CSRF protection to this route
////   - Limit this route to only POST requests
router.all('/perform', function(req, res) {
  bounceOutIfLoggedOut(req, res, () => {
    let { accountFrom, accountTo, amount } = Object.assign(Object.assign({}, req.body), req.query);
    amount = parseFloat(amount);
    if (!accountFrom || !accountTo) {
      errorAndReload(req, res, 'Must specify accounts to transfer from and to');
      return;
    }
    if (accountFrom === accountTo) {
      errorAndReload(req, res, 'Cannot transfer funds from an account to its self');
      return;
    }
    if (!amount || isNaN(amount) || amount <= 0) {
      errorAndReload(req, res, 'Must specify a valid, positive amount to transfer');
      return;
    }

    Promise.all(
      [accountFrom, accountTo]
        .map(accountId => Account.findById(accountId))
    ).then(([aFrom, aTo]) => {
      if (!aFrom || !aTo) {
        errorAndReload(req, res, 'One or more account IDs are invalid');
        return;  
      }
      if (aFrom.balance < amount) {
        errorAndReload(req, res, 'Nonsufficient funds in account');
        return; 
      }
      return Db.transaction(t => {
        return aFrom.update({
          balance: Math.round(100 * (aFrom.balance - amount)) / 100
        }, { transaction: t }).then(() => {
          return aTo.update({
            balance: Math.round(100 * (aTo.balance + amount)) / 100
          }, { transaction: t });
        });
      }).then(() => {
        res.redirect('/transfers');
      });
    }).catch((e) => {
      errorAndReload(req, res, e.message);
    });
  });
});

module.exports = router;
