/**
 * Created by mathilde on 23/02/16.
 */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors');
var io = require('./io');
var jsts = require('jsts');
var passport = require('passport');
var jwt = require('jwt-simple');

//Mongoose
var uri="mongodb://heroku_5dxc4nxv:ujhacelafa84d4fh7l8vofpa5g@ds039404.mongolab.com:39404/heroku_5dxc4nxv";
mongoose.connect(uri);
var User = require('./models/user.js');


//Create instance of express
var app = express();

//Serve the static folder and the index file
app.use(require('node-sass-middleware')({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true,
    sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// require routes
var routes = require('./routes/api.js');

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('keyboard cat'));
app.use(passport.initialize());

// configure passport
passport.use(User.createStrategy());

// routes
app.use('/user/', routes);

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Ikke funnet');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {

    //Connect to dev db.
    //mongoose.connect('mongodb://localhost:27017/gisdb');
}

module.exports = app;

