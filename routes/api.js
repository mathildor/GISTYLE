var express = require('express');
var router = express.Router();
var passport = require('passport');

var User = require('../models/user.js');
var Layer = require('../models/layer.js');


router.get("/layers", function(req, res){
    Layer.find({
        "username":req.user.username
    }, function(err, data){
        if(err){
            return res.send(err);
        }

        res.json(data);
    });
});

router.post("/layer", function(req, res){
    console.log("in post layer");
    var layer= new Layer();
    console.log(req.user);
    layer.username=req.user.username;
    layer.layername=req.body.layername;
    //layer.id=req.user.username+"_"+req.body.layerName;
    layer.sqlString=req.body.sql;
    layer.cartoCss=req.body.carto;

    layer.save(function(err){
        if(err){
            res.send(err);
        } else{
            res.json({message: 'layer created'});
        }
    });
});

router.delete("/deleteLayer", function(req, res){
    console.log(req.body.layername);
   console.log("Trying to delete: "+req.user.username+"_"+req.body.layername);
    layerId=req.user.username+"_"+req.body.layername;
    Layer.remove({
        username: req.user.username,
        layername: req.body.layername
   }, function(err){
       if(err)
           res.send(err);
       res.json({message: 'succesfully deleted'});
   });

});


/*
router.get('/layer', function(req, res){
    console.log('in get /layer');
    Layer.find({name:buildings}, function(err, docs){
        res.json(docs);
        //res(docs);
        console.log(docs);
    });
    //console.log('res is: '+res);
});
*/

router.post('/register', function(req, res) {
    User.register(new User({ username: req.body.username }),
        req.body.password, function(err, account) {
            if (err) {
                return res.status(500).json({
                    err: err
                });
            }
            passport.authenticate('local')(req, res, function () {
                return res.status(200).json({
                    status: 'Registration successful!'
                });
            });
        });
});

router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({
                err: info
            });
        }
        req.logIn(user, function(err) {
            if (err) {
                return res.status(500).json({
                    err: 'Could not log in user'
                });
            }
            res.status(200).json({
                status: 'Login successful!'
            });
        });
    })(req, res, next);
});

router.get('/logout', function(req, res) {
    req.logout();
    res.status(200).json({
        status: 'Bye!'
    });
});

router.get('/status', function(req, res) {
    if (!req.isAuthenticated()) {
        console.log('not authenticated');
        return res.status(200).json({
            status: false
        });
    }
    res.status(200).json({
        status: true
    });
});


module.exports = router;