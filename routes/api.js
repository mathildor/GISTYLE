var express = require('express');
var router = express.Router();
var passport = require('passport');

var User = require('../models/user.js');
var Layer = require('../models/layer.js');
var defaultLayer = require('../models/defaultLayer.js');


router.get("/defaultLayers", function(req, res){
    console.log('default layers');
    defaultLayer.find({},function(err, data){
        if(err){
            return res.send(err);
        }
        res.json(data);
    });
});

router.post("/defaultLayer", function(req, res){
    var layer=new defaultLayer();
    layer.name="Water";
    layer.sql="SELECT * FROM water";
    layer.cartocss="#water {line-color: #272CB9; line-width: 3; line-opacity: 0.4;}";
    layer.active=true;
    layer.type="polygon";

    layer.save(function(err){
        if(err){
            res.send(err);
        } else{
            res.json({message: 'layer created'});
        }
    });
});


router.put("/updateCss", function(req, res){
    console.log(req.body.name);

    Layer.find( {name:req.body.name, username: req.user.username}, function(err, layer) {
        if (err) {
            console.log('error');
            return res.send(err);
        }
        layer[0].cartocss = req.body.cartocss;

        //Save the layer
        layer[0].save(function (err) {
            if (err) {
                res.send(err);
            }
            res.send({message: 'layer updated'});
        });
    })
});

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

    var layer= new Layer();
    layer.username=req.user.username;
    layer.name=req.body.name;
    layer.sql=req.body.sql;
    layer.cartocss=req.body.cartocss;
    layer.active=req.body.active;
    layer.type=req.body.type;
    layer.defaultLayer=req.body.defaultLayer;
    layer.tool=req.body.tool;

    layer.save(function(err){
        if(err){
            res.send(err);
        } else{
            res.json({message: 'layer created'});
        }
    });
});

router.delete("/deleteLayer", function(req, res){
   console.log("Trying to delete: "+req.user.username+"_"+req.body.name);

    Layer.remove({
        username: req.user.username,
        name: req.body.name
   }, function(err){
       if(err)
           res.send(err);
       res.json({message: 'succesfully deleted'});
   });

});


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