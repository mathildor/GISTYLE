var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user.js');
var defaultLayer = require('../models/defaultLayer.js');
var Project = require('../models/project.js');
var geojsonLayer = require('../models/geojson.js');
var layerStyle = require('../models/layerStyle.js');
var defaultLayerStyle = require('../models/defaultLayerStyle.js');
var turf = require('../public/turf.min.js');
var GJV = require("geojson-validation");
var buffer = require("../routes/buffer-turf.js");

//-----------------TOOLS-----------------------

function saveGeoLayer(layer, username, projectName, newLayerName) {
    var geo = new geojsonLayer();
    var feature = layer.features;
    feature.properties = {};

    geo.type = "FeatureCollection";
    geo.features = feature;
    geo.features.properties = {};
    geo.layerName = newLayerName;
    geo.projectName = projectName;
    geo.username = username;
    geo.defaultLayer = false;
    geo.save(function(err) {
        if (err) {
            console.log('error in save geolayer');
        } else {
            console.log('geolayer saved');
        }
    });
}

function saveStyle(layerName, username, projectName, color) {
    var styling = {
        color: color,
        weight: 3,
        opacity: 0.4,
        lineColor: color,
        stroke: false
    };

    var style = new layerStyle();
    style.layerName = layerName;
    style.username = username;
    style.projectName = projectName;
    style.layerStyle = styling;

    style.save(function(err) {
        if (err) {
            console.log('error');
        } else {
            console.log('styling saved');
        }
    });
}

router.post("/within", function(req, res) {
    var intersections = [];
    var inputCond = {
        layerName: req.body.inputArea
    };
    if (req.body.inputDefault == false) {
        inputCond.username = req.user.username;
        inputCond.projectName = req.body.projectName;
    }

    var outputCond = {
        layerName: req.body.outputLayer
    };
    if (req.body.outputDefault == false) {
        outputCond.username = req.user.username;
        outputCond.projectName = req.body.projectName;
    }

    geojsonLayer.find(outputCond, function(err, outputData) {
        geojsonLayer.find(inputCond, function(err, inputArea) {

            var features1 = inputArea[0].features;
            for (var i = 0; i < features1.length; i++) { //go through polygons in multi
                var polygon = features1[i];

                //for all areas: check all points in all features of output data layer, if they are inside
                var features2 = outputData[0].features;
                for (var j = 0; j < features2.length; j++) { //for all features, check if any point is inside
                    if (intersectingPoint(polygon, features2[j], req.body.outputType) === true) { //at least one point inside
                        intersections.push(features2[j]);
                    }
                }
            }
            var withinObj = {
                type: "FeatureCollection",
                features: intersections
            };
            if (intersections.length > 0) {
                saveGeoLayer(withinObj, req.user.username, req.body.projectName, req.body.newLayerName);
                saveStyle(req.body.newLayerName, req.user.username, req.body.projectName, req.body.color);
            }
            res.send(withinObj);
        });
    });
});

function intersectingPoint(polygon, feature, featuresDataType) {

    var points = feature.geometry.coordinates;
    var intersectionFound = false;
    //POINTS
    if (featuresDataType === "Point") {
        if (turf.inside(feature, polygon)) {
            intersectionFound = true;
        }
        //Polygons, LineString ++
    } else {
        if (featuresDataType === "LineString") {
            points = [points]; //Making the Linestring coordinates list similar to polygon list, has more brackets
        }
        for (var k = 0; k < points[0].length; k++) { //for all set of points
            //create dummy obj to send to turf.inside function
            var pointFeature = {
                type: "Feature",
                properties: {},
                geometry: {
                    type: "Point",
                    coordinates: points[0][k]
                }
            };
            if (turf.inside(pointFeature, polygon)) {
                intersectionFound = true;
            }
        }
    }
    return intersectionFound;
}

router.post("/intersect", function(req, res) {

    var inputCond = {
        layerName: req.body.inputArea
    };
    if (req.body.inputDefault == false) {
        inputCond.username = req.user.username;
        inputCond.projectName = req.body.projectName;
    }

    var outputCond = {
        layerName: req.body.outputLayer
    };
    if (req.body.outputDefault == false) {
        outputCond.username = req.user.username;
        outputCond.projectName = req.body.projectName;
    }

    geojsonLayer.find(outputCond, function(err, outputData) {
        geojsonLayer.find(inputCond, function(err, inputArea) {
            var intersections = [];
            var features1 = inputArea[0].features;
            for (var i = 0; i < features1.length; i++) { //go through all features in input
                var pol1 = features1[i];

                var features2 = outputData[0].features;
                for (var j = 0; j < features2.length; j++) { //go through all features in output
                    var pol2 = features2[j];

                    //get intersection between the polygons
                    var intersection = turf.intersect(pol1, pol2);
                    if (intersection !== null && intersection !== undefined) {
                        intersections.push(intersection);
                    }
                }
            }
            var intObj = {
                type: "FeatureCollection",
                features: intersections
            };
            if (intersections.length > 0) { //if intersection exist:
                saveStyle(req.body.newLayerName, req.user.username, req.body.projectName, req.body.color);
                saveGeoLayer(intObj, req.user.username, req.body.projectName, req.body.newLayerName);
            }
            res.send(intObj);
        });
    });
});

router.post("/difference", function(req, res) {
    var cond1 = {
        layerName: req.body.layer1name
    };
    if (req.body.layer1default == false) {
        cond1.username = req.user.username;
        cond1.projectName = req.body.projectName;
    }

    var cond2 = {
        layerName: req.body.layer2name
    };
    if (req.body.outputDefault == false) {
        cond2.username = req.user.username;
        cond2.projectName = req.body.projectName;
    }

    geojsonLayer.find(cond1, function(err, layer1) {
        if (err) {
            console.log('error');
        } else {
            var allDiffPol = [];
            geojsonLayer.find(cond2, function(err, layer2) {
                for (var i = 0; i < layer1[0].features.length; i++) {
                    var currentFeature = layer1[0].features[i];
                    for (var j = 0; j < layer2[0].features.length; j++) {
                        var difference = turf.difference(currentFeature, layer2[0].features[j]);
                        if (difference !== undefined) {
                            allDiffPol.push(difference);
                        }
                    }
                }
                if (difference === "undefined") {
                    res.send(false);
                } else {
                    res.send({
                        features: allDiffPol
                    });
                }
            });
        }
    });
});

router.post("/merge", function(req, res) {
    var cond1 = {
        layerName: req.body.layer1
    };
    if (req.body.default1 == false) {
        cond1.username = req.user.username;
        cond1.projectName = req.body.projectName;
    }
    var cond2 = {
        layerName: req.body.layer2
    };
    if (req.body.default2 == false) {
        cond2.username = req.user.username;
        cond2.projectName = req.body.projectName;
    }
    geojsonLayer.find(cond1, function(err, layer1) {
        if (err) {
            console.log('error');
        } else {
            geojsonLayer.find(cond2, function(err, layer2) {
                var mergedLayer = new geojsonLayer();
                mergedLayer.layerName = req.body.newLayerName;
                mergedLayer.username = req.user.username;
                mergedLayer.projectName = req.body.projectName;
                mergedLayer.defaultLayer = false;

                var features = [];
                for (var i = 0; i < layer1[0].features.length; i++) {
                    features.push(layer1[0].features[i]);
                }
                for (var j = 0; j < layer2[0].features.length; j++) {
                    features.push(layer2[0].features[j]);
                }
                mergedLayer.features = features;
                mergedLayer.save(function(err) {
                    if (err) {
                        console.log('error');
                    }
                });
                saveStyle(req.body.newLayerName, req.user.username, req.body.projectName, req.body.color);
                res.send(mergedLayer);
            });
        }
    });
});

router.post("/BufferDefaultGeojson", function(req, res) {
    geojsonLayer.find({
        layerName: req.body.layerName
    }, function(err, data) {
        if (err) {
            res.send(err);
        } else {
            var geoJson = JSON.stringify(data[0]);
            var buffered = createBuffer(geoJson, req.body.bufferDistance, req.body.newLayerName, req.body.projectName, req.user.username);
            saveStyle(req.body.newLayerName, req.user.username, req.body.projectName, req.body.bufferColor);
            res.send(buffered);
        }
    });
});

router.post("/BufferGeojson", function(req, res) {
    geojsonLayer.find({
        layerName: req.body.layerName,
        username: req.user.username,
        projectName: req.body.projectName
    }, function(err, data) {
        if (err) {
            res.send(err);
        } else {
            var geoJson = JSON.stringify(convertedGeoJson);
            var buffered = createBuffer(geoJson, req.body.bufferDistance, req.body.newLayerName, req.body.projectName, req.user.username);
            saveStyle(req.body.newLayerName, req.user.username, req.body.projectName, req.body.bufferColor);
            res.send(buffered);
        }
    });
});

function createBuffer(geoJ, distance, newLayerName, projectName, username) {
    var geoJson = JSON.parse(geoJ);
    var buffered = buffer(geoJson, distance, 'meters');
    if (buffered.type === "Feature") {
        buffered = {
            type: "FeatureCollection",
            features: [buffered]
        }
    }
    saveGeoLayer(buffered, username, projectName, newLayerName);
    return buffered;
}

//--------------STYLING-------------------

//copy default to user and project specific
router.post("/defaultStyling", function(req, res) {
    defaultLayerStyle.find({}, function(err, data) {
        if (err) {
            console.log('error');
        } else {
            for (var i = 0; i < data.length; i++) {
                var style = new layerStyle();
                style.username = req.user.username;
                style.projectName = req.body.projectName;
                style.layerName = data[i].layerName;
                style.layerStyle = data[i].layerStyle;

                style.save(function(err) {
                    if (err) {
                        console.log('error');
                    }
                });
            }
        }
    });
});

//get layers styling for specific layer
router.post("/getStyling", function(req, res) {
    layerStyle.find({
        username: req.user.username,
        projectName: req.body.projectName,
        layerName: req.body.layerName
    }, function(err, data) {
        if (err) {
            return res.send(err);
        }
        res.json(data);
    });
});

//get layers styling for specific layer
router.delete("/deleteStyling", function(req, res) {
    layerStyle.remove({
        username: req.user.username,
        projectName: req.body.projectName,
        layerName: req.body.layerName
    }, function(err, data) {
        if (err) {
            return res.send(err);
        }
        res.json(data);
    });
});

router.post("/layerStyling", function(req, res) {
    var style = new layerStyle();
    style.layerName = req.body.layerName;
    style.username = req.user.username;
    style.projectName = req.body.projectName;
    style.layerStyle = JSON.parse(req.body.layerStyle);
    style.save(function(err) {
        if (err) {
            res.send(err);
        } else {
            res.json({
                message: 'layer created'
            });
        }
    });
});

//------------GEOJSON-------------------

router.delete("/deleteLayer", function(req, res) {
    geojsonLayer.remove({
        username: req.user.username,
        layerName: req.body.layerName,
        projectName: req.body.projectName
    }, function(err) {
        if (err)
            res.send(err);
        res.json({
            message: 'succesfully deleted'
        });
    });
});

router.post("/getGeojson", function(req, res) {
    geojsonLayer.find({
        layerName: req.body.layerName,
        username: req.user.username,
        projectName: req.body.projectName

    }, function(err, data) {
        if (err) {
            res.send(err);
        } else {
            res.json(data);
        }
    });
});

router.get("/defaultGeojsons", function(req, res) {
    geojsonLayer.find({
        defaultLayer: true
    }, function(err, data) {
        if (err) {
            return res.send(err);
        }
        res.json(data);
    });
});

//get all geojsons for project and user
router.post("/geojsons", function(req, res) {
    geojsonLayer.find({
        projectName: req.body.projectName,
        username: req.user.username
    }, function(err, data) {
        if (err) {
            return res.send(err);
        }
        res.json(data);
    });
});

router.post("/saveGeojson", function(req, res) {

    var geo = new geojsonLayer();
    var feature = JSON.parse(req.body.features);
    feature.properties = {};

    geo.type = "FeatureCollection";
    geo.features = feature;
    geo.features.properties = {};
    geo.layerName = req.body.layerName;
    geo.projectName = req.body.projectName;
    geo.username = req.user.username;
    geo.defaultLayer = false;

    //go through all features for layer and check that they are valid features
    var validJson = true;
    for (var i = 0; i < geo.features.length; i++) {
        if (!GJV.valid(geo.features[i])) { //finds if any of the features are invalid json
            console.log('feature is not valid');
            validJson = false;
        }
    }

    if (validJson == true) { //check if valid features
        geo.save(function(err) {
            if (err) {
                res.send(err);
            } else {
                res.send(geo);
            }
        });
    } else {
        res.send(false);
    }
});

//------------PROJECTS-------------------

router.get("/projects", function(req, res) {
    Project.find({
        username: req.user.username
    }, function(err, data) {
        if (err) {
            return res.send(err);
        }
        res.json(data);
    });
});

router.post("/project", function(req, res) {

    var project = new Project();
    project.username = req.user.username;
    project.projectName = req.body.projectName;

    project.save(function(err) {
        if (err) {
            res.send(err);
        } else {
            res.json({
                message: 'layer created'
            });
        }
    });
});

router.delete("/deleteProject", function(req, res) {
    layerStyle.remove({
        projectName: req.body.projectName,
        username: req.user.username
    }, function(err) {
        if (err) {
            console.log(err);
        }
    });

    Project.remove({
        projectName: req.body.projectName,
        username: req.user.username
    }, function(err) {
        if (err) {
            console.log(err);
        }
    });

    geojsonLayer.remove({
        projectName: req.body.projectName,
        username: req.user.username
    }, function(err) {
        if (err) {
            console.log(err);
        }
    });

});

//------------------ LOG IN --------------------------

router.post('/register', function(req, res) {
    User.register(new User({
            username: req.body.username
        }),
        req.body.password,
        function(err, account) {
            if (err) {
                return res.status(500).json({
                    err: err
                });
            }
            passport.authenticate('local')(req, res, function() {
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
