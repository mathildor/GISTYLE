//mongoose.connect('mongodb://heroku_xmpl1lg6:mgla64r400lt8sek0o6gmq6rlq@ds061248.mongolab.com:61248/heroku_xmpl1lg6');

// dependencies
var express = require('express');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var mongoose = require('mongoose');
var hash = require('bcrypt-nodejs');
var path = require('path');
var passport = require('passport');
var localStrategy = require('passport-local' ).Strategy;
// var favicon = require('express-favicon');
var favicon = require('serve-favicon');


// mongoose
mongoose.connect('mongodb://heroku_xmpl1lg6:mgla64r400lt8sek0o6gmq6rlq@ds061248.mongolab.com:61248/heroku_xmpl1lg6');

// user schema/model
var User = require('./models/user.js');
//var Layer = require('./models/layer.js');

// create instance of express
var app = express();
//app.use('/icon.png', express.static('images/icon.png'));
app.use(favicon(__dirname + '/public/images/favicon.ico'));

// require routes - allows for having api in other document
var routes = require('./routes/api.js');



// define middleware
app.use(express.static(path.join(__dirname,'public')));
app.use(logger('dev'));
app.use(bodyParser.json());
//Allow post requests with large size
app.use(bodyParser({limit: '5mb'}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));


// configure passport
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// routes
app.use('/user/', routes);
app.use('/', routes);

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// error handlers
app.use(function(req, res, next) {
    var err = new Error('Not Found, error 404');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.end(JSON.stringify({
        message: err.message,
        error: {}
    }));
});


module.exports = app;
