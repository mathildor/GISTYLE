//BASE SETUP
// =====================================================

//Call the packages we need:
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
//var bodyParser = require('body-parser');

var app = express(); //DEFINE THE APP


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

//Think this is for using SCSS:
app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  intendetSyntax: true,
  sourceMap: true
}));


app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));

//Configure app to use bodyParser()
//This will let us get the data from a POST
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


// error handlers:

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
});

module.exports = app;



//FOR TESTING:
//var port = process.env.PORT || 8080;        // set our port


//CONNECT TO DATABASE!
//==========================================================================================================
// Retrieve
var MongoClient = require('mongodb').MongoClient;


// Connect to the db
var uri="mongodb://heroku_5dxc4nxv:ujhacelafa84d4fh7l8vofpa5g@ds039404.mongolab.com:39404/heroku_5dxc4nxv"
MongoClient.connect(uri, function(err, db) {
  if(err){
    console.log("Unable to connect to mongoDB server. Error: ",err);
  }else{
    console.log("We are connected");
    //Insert the rest of the database queries here:


    /*//Get the documents collection:
    var collection = db.collection('users');

    //Create user:
    var user1 = {name: 'test user 2', age:'2', roles: ['admin', 'moderator', 'user']};
    //insert user:
    collection.insert([user1], function(err, result){
      if (err) {
        console.log(err);
      } else {
        console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
      }
      //close connection
      db.close();
    });*/

    // Get the documents collection
    var collection = db.collection('map-layers');

    collection.find({type: 'FeatureCollection'}).toArray(function (err, result) {
      if (err) {
        console.log(err);
      } else if (result.length) {
        console.log('Found:', result);
      } else {
        console.log('No document(s) found with defined "find" criteria!');
      }
      //Close connection
      db.close();
    });

    geojsonFeature=result;

  }
});