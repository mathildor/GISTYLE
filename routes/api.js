var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    jwt = require('jwt-simple');
User = require('../models/user.js');


router.get('/logout', function(req, res) {
    //res.send('Hello world');
    req.logout();
    res.status(200).json({status: 'Hadebra!'});
});


router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return res.status(500).json({err: err});
        }
        if (!user) {
            return res.status(401).json({err: info});
        }

        var token = jwt.encode(user, 'hemmelig');
        return res.status(200).json({token: token});

    })(req, res, next);
});


/*
router.post('/register', function(req, res) {
    User.register(new User({ username: req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.status(500).json({err: err});
        }
        passport.authenticate('local')(req, res, function () {
            return res.status(200).json({status: 'Brukeren er registrert!'});
        });
    });
});

router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return res.status(500).json({err: err});
        }
        if (!user) {
            return res.status(401).json({err: info});
        }

        var token = jwt.encode(user, 'hemmelig');
        return res.status(200).json({token: token});

    })(req, res, next);
});



router.post('/userInfo', function(req,res){
    //Get the token from the request
    var token = getToken(req.headers);
    if(token){
        //Decode token to retreive the user object
        var decoded = jwt.decode(token, 'hemmelig');
        //Search for the user in the db.
        User.findOne({
            username: decoded.username
        }, function(err, user) {
            if (err) throw err;

            if (!user) {
                return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
            } else {
                //We found a user, and thus the user is authenticated with the current token.
                res.status(200).json({success: true, msg: 'Welcome in the member area ' + user.name + '!'});
            }
        });
    }else{
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }

});

//Strip the authorization header and get the token
getToken = function (headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};
*/

module.exports = router;