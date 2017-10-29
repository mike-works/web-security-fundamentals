const express = require('express');
const viewEngine = require('ejs-mate');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');

const index = require('./routes/index');
const accounts = require('./routes/accounts');
const transfers = require('./routes/transfers');
const auth = require('./routes/auth');
const register = require('./routes/register');
const user = require('./routes/user');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const { flashMiddleware } = require('./flash');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', viewEngine);
app.set('view options', { layout: true });

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, '..', 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(cors());

///////////////////////////////////////////
//// ↓ EXERCISE 2 SOLUTION GOES HERE ↓ ////
///////////////////////////////////////////
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('secret'));
app.use(session({
  name: 'strawbank',
  cookie: { maxAge: 60000 },
  store: new SQLiteStore({
    dir: path.join(__dirname, '..', 'db'),
    db: 'development.sqlite',
    table: 'sessions'
  }),
  saveUninitialized: true,
  resave: 'true',
  secret: 'secret'
}));

///////////////////////////////////////////
//// ↓ EXERCISE 7 SOLUTION GOES HERE ↓ ////
///////////////////////////////////////////

app.use(flashMiddleware);

///////////////////////////////////////////
//// ↓ EXERCISE 10 SOLUTION GOES HERE ↓ ////
///////////////////////////////////////////

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(function(req, res, next){
  res.locals.sessionFlash = req.session.sessionFlash;
  delete req.session.sessionFlash;
  next();
});

app.use(function(req, res, next){
  res.locals.currentUser = req.session.currentUser || null;
  next();
});

app.use('/', index);
app.use('/accounts', accounts);
app.use('/transfers', transfers);
app.use('/auth', auth);
app.use('/register', register);
app.use('/user', user);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
