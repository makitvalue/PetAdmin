var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('morgan');
var mysql = require('mysql');
var MySQLStore = require('express-mysql-session') (session);
var moment = require('moment');
var dotenv = require('dotenv');
dotenv.config();


var indexRouter = require('./routes/index');
var webapiRouter = require('./routes/webapi');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json({
    limit : "5mb"
}));
app.use(express.urlencoded({ 
    limit : "5mb",
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.MYSQL_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWD,
        database: process.env.MYSQL_DATABASE
    })
}));

app.use('/', indexRouter);
app.use('/webapi', webapiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

global.o = {}; // 객체
global.f = {}; // 함수
global.c = {}; // 상수


// random id
global.f.generateRandomId = function() {
    var rand = Math.floor(Math.random() * 9999) + '';
    var pad = rand.length >= 4 ? rand : new Array(4 - rand.length + 1).join('0') + rand;
    var random_id = moment().format("YYMMDDHHmmss") + pad;
    return random_id;
};

global.f.isNone = function(value) {
    if (typeof value === 'undefined' || value === null || value === '') return true;
    return false;
};


module.exports = app;

