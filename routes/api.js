var express = require('express');
var router = express.Router();
var passport = require('passport');

var User = require('../models/user.js');
var defaultLayer = require('../models/defaultLayer.js');
var Project = require('../models/project.js');
var geojsonLayer=require('../models/geojson.js');
var layerStyle=require('../models/layerStyle.js');
var defaultLayerStyle=require('../models/defaultLayerStyle.js');
var turf=require('turf');
var GJV = require("geojson-validation");


//-------------POSTGIS---------------------


//postgres db:

/*var promise = require('bluebird');

var options = {
    // Initialization Options
    promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://localhost:5432/puppies';
var db = pgp(connectionString);

// add query functions

module.exports = {
    getAllLayers: getAllLayers,
    getSingleLayer: getSingleLayer,
    createNewLayer: createNewLayer,
    updateLayer: updateLayer,
    removeLayer: removeLayer
};*/



//-----------------TOOLS-----------------------


function saveGeoLayer(layer, username, projectName, newLayerName){
    console.log('save geolayer');
    console.log(projectName);
    var geo=new geojsonLayer();
    geo.features=layer.features;
    console.log('geo.features');
    console.log(geo.features);
    geo.layerName=newLayerName;
    geo.projectName=projectName;
    geo.username=username;
    geo.defaultLayer=false;

    geo.save(function(err){
        if(err){
            console.log('error in save geolayer');
        } else{
            console.log('geolayer saved');
        }
    });
}


function saveStyle(layerName, username, projectName, color){
    var styling={
        "color":color,
        "stroke":false
    };

    var style=new layerStyle();
    style.layerName=layerName;
    style.username=username;
    style.projectName=projectName;
    style.layerStyle=styling;

    style.save(function(err){
        if(err){
            console.log('error');
        }else{
            console.log('styling saved');
        }
    });
}



router.post("/within",function(req, res){
    var intersections=[];
    var inputCond={
        layerName: req.body.inputArea
    };
    if(req.body.inputDefault==false){
        inputCond.username=req.user.username;
        inputCond.projectName=req.body.projectName;
    }

    var outputCond={
        layerName:req.body.outputLayer
    };
    if(req.body.outputDefault==false){
        outputCond.username=req.user.username;
        outputCond.projectName=req.body.projectName;
    }

    console.log('input area');
    geojsonLayer.find(outputCond,function(err,outputData){
        geojsonLayer.find(inputCond, function(err, inputArea){
            console.log(req.body.inputType);

            var features1=inputArea[0].features;
            for(var i=0; i<features1.length;i++){ //go through polygons in multi
                console.log('iteration : '+i);
                var polygon=features1[i];

                //for all areas: check all points in all features of output data layer, if they are inside
                var features2=outputData[0].features;
                for(var j=0; j<features2.length; j++){ //for all features, check if any point is inside
                    if(intersectingPoint(polygon, features2[j], req.body.outputType) == true){ //at least one point inside
                        console.log('pushing feature');
                        intersections.push(features2[j]);
                    }
                }
            }
            console.log('All features');
            console.log(intersections);

            var resultLayer=new geojsonLayer();
            resultLayer.layerName=req.body.newLayerName;
            resultLayer.projectName=req.body.projectName;
            resultLayer.username=req.user.username;
            resultLayer.features=intersections;
            resultLayer.defaultLayer=false;

            resultLayer.save(function(err) {
                if (err) {
                    console.log('error');
                }
            });
            var withinObj={
                features:intersections
            };
            saveStyle(req.body.newLayerName,req.user.username, req.body.projectName, req.body.color);
            res.send(withinObj);
        });
    });

});

function intersectingPoint(polygon, feature, featuresDataType){


    var points=feature.geometry.coordinates;
    console.log('points');
    var intersectionFound=false;

    //POINTS
    if(featuresDataType==="Point"){
        console.log(points);
        console.log("type is point");
        if(turf.inside(feature, polygon)){
            console.log('INTERSECTION FOUND for this feature');
            intersectionFound=true;
        }
    //Polygons, lines ++
    }else{
        console.log('length: ');
        console.log(points[0].length);
        console.log(points[0]);
        console.log(points[0][0]);
        for(var k=0; k<points[0].length; k++){//for all set of points
            //create fake obj to send to turf intersection function
            var pointFeature={
                geometry:{
                    coordinates:points[0][k]
                }
            };
            console.log('i for loop: points[k]: ');
            if(turf.inside(pointFeature, polygon)){
                console.log('INTERSECTION FOUND');
                intersectionFound=true;
            }
        }
    }
    return intersectionFound;
}

router.post("/intersect",function(req, res){

    var inputCond={
        layerName: req.body.inputArea
    };
    if(req.body.inputDefault==false){
        inputCond.username=req.user.username;
        inputCond.projectName=req.body.projectName;
    }

    var outputCond={
        layerName:req.body.outputLayer
    };
    if(req.body.outputDefault==false){
        outputCond.username=req.user.username;
        outputCond.projectName=req.body.projectName;
    }

    console.log('input area');
     geojsonLayer.find(outputCond,function(err,outputData){
         geojsonLayer.find(inputCond, function(err, inputArea){
             console.log(req.body.inputType);

             var intersections=[];
             var features1=inputArea[0].features;

             for(var i=0; i<features1.length;i++){ //go through all features in input
                 var pol1=features1[i];

                 var features2 = outputData[0].features;
                 for (var j = 0; j < features2.length; j++) { //go through all features in output
                     var pol2 = features2[j];

                     //get intersection between the polygons
                     var intersection = turf.intersect(pol1, pol2);
                     if (intersection != null) {
                         intersections.push(intersection);
                     }
                 }
             }

             console.log('intersections');
             console.log(intersections);
             console.log(intersections[0]);

             var resultLayer=new geojsonLayer();
             resultLayer.layerName=req.body.newLayerName;
             resultLayer.projectName=req.body.projectName;
             resultLayer.username=req.user.username;
             resultLayer.features=intersections;
             resultLayer.defaultLayer=false;

             resultLayer.save(function(err) {
                 if (err) {
                     console.log('error');
                 }
             });

             saveStyle(req.body.newLayerName,req.user.username, req.body.projectName, req.body.color);
             res.send(resultLayer);
         });
     });

});



router.post("/difference", function(req, res){

    var cond1={
        layerName: req.body.layer1name
    };
    if(req.body.layer1default==false){
        cond1.username=req.user.username;
        cond1.projectName=req.body.projectName;
    }

    var cond2={
        layerName:req.body.layer2name
    };
    if(req.body.outputDefault==false){
        cond2.username=req.user.username;
        cond2.projectName=req.body.projectName;
    }

    geojsonLayer.find(
        cond1
    ,function(err, layer1){
        if(err){
            console.log('error');
        }else{

            //post layer to postgis:
            pg.connect(db_URL, function(err, client) {
                if(err){
                    console.log(err);
                }
                console.log('connected!!');
                client.query('INSERT INTO layers VALUES ('+layer1.layerName+', '+layer1.features+')');
            });

            geojsonLayer.find(
                cond2
            , function(err, layer2){
                    turf.erase(layer1, layer2);
                    saveStyle(req.body.newLayerName,req.user.username, req.body.projectName, req.body.color);
                    res.send(difference);
            });
        }
    });
});

router.post("/merge", function(req, res){

    var cond1={
        layerName: req.body.layer1
    };
    if(req.body.default1==false){
        cond1.username=req.user.username;
        cond1.projectName=req.body.projectName;
    }

    var cond2={
        layerName:req.body.layer2
    };
    if(req.body.default2==false){
        cond2.username=req.user.username;
        cond2.projectName=req.body.projectName;
    }

    geojsonLayer.find(
        cond1
        ,function(err, layer1){
            if(err){
                console.log('error');
            }else{
                geojsonLayer.find(
                    cond2
                    , function(err, layer2){
                        var mergedLayer=new geojsonLayer();
                        mergedLayer.layerName=req.body.newLayerName;
                        mergedLayer.username=req.user.username;
                        mergedLayer.projectName=req.body.projectName;
                        mergedLayer.defaultLayer=false;

                        var features=[];
                        console.log(layer1[0].features);
                        console.log(layer2[0].features);

                        for(var i=0; i<layer1[0].features.length; i++){
                            features.push(layer1[0].features[i]);
                        }
                        for(var j=0; j<layer2[0].features.length; j++){
                            features.push(layer2[0].features[j]);
                        }
                        mergedLayer.features=features;
                        mergedLayer.save(function(err) {
                            if (err) {
                                console.log('error');
                            }
                        });

                        saveStyle(req.body.newLayerName,req.user.username, req.body.projectName, req.body.color);
                        res.send(mergedLayer);
                    });
            }
        });
});


router.post("/BufferDefaultGeojson", function(req, res){
    console.log('bufferDefaultGeojson');
    geojsonLayer.find({
        layerName: req.body.layerName
    },function(err, data){
        if(err){
            res.send(err);
        } else{
            var geoJson=JSON.stringify(data[0]);
            var buffered=createBuffer(geoJson, req.body.bufferDistance, req.body.newLayerName, req.body.projectName, req.user.username);
            saveStyle(req.body.newLayerName,req.user.username, req.body.projectName, req.body.bufferColor);
            res.send(buffered);
        }
    });
});

router.post("/BufferGetGeojson", function(req, res){
    console.log('bufferGetGeojson - 109');
    geojsonLayer.find({
        layerName: req.body.layerName,
        username:req.user.username,
        projectName: req.body.projectName
    },function(err, data){
        if(err){
            res.send(err);
        }else{
            console.log("buffer-data");
            console.log(data);
            var geoJson=JSON.stringify(data[0]);
            var buffered=createBuffer(geoJson, req.body.bufferDistance, req.body.newLayerName, req.body.projectName, req.user.username);
            saveStyle(req.body.newLayerName,req.user.username, req.body.projectName, req.body.bufferColor);
            res.send(buffered);
        }
    });
});


function createBuffer(geoJ, distance, newLayerName, projectName, username){
    var geoJson=JSON.parse(geoJ);
    console.log("BUFFER!!!!!");
    console.log(JSON.stringify(geoJson));

    //var buffered=turf.buffer(geoJson.features[13], distance/1000, 'kilometers');
    var buffered=turf.buffer(geoJson, distance/1000, 'kilometers');

    //buffer each feature, create buffer that returns a feature(?), and then merge them

    //loop through features;
    var bufferedFeatures=[];
    for(var i=0; i<geoJson.features.length; i++){
        bufferedFeatures.push(turf.buffer(geoJson.features[i]));
    }
    console.log(bufferedFeatures[0]);

    var individuallyBuffered = turf.merge({
        "type": "FeatureCollection",
        "features": bufferedFeatures
    });

    console.log("buffered");
    console.log(buffered);
    saveGeoLayer(individuallyBuffered, username, projectName, newLayerName);
    return buffered;
}




//--------------STYLING-------------------

//copy default to user and project specific
router.post("/defaultStyling", function(req, res){
    defaultLayerStyle.find({},function(err, data){
        if(err){
            console.log('error');
        }else{

            for(var i=0; i<data.length; i++){
                var style=new layerStyle();
                style.username=req.user.username;
                style.projectName=req.body.projectName;
                style.layerName=data[i].layerName;
                style.layerStyle=data[i].layerStyle;

                style.save(function(err){
                     if(err){
                         console.log('error');
                     }
                 });
            }
        }
    });
});



//get layers styling for specific layer
router.post("/getStyling", function(req, res){
    layerStyle.find({
        username:req.user.username,
        projectName:req.body.projectName,
        layerName:req.body.layerName
    },function(err, data){
        if(err){
            return res.send(err);
        }
        res.json(data);
    });
});



//get layers styling for specific layer
router.delete("/deleteStyling", function(req, res){
    console.log("deleting style:");
    console.log(req.body.projectName);
    console.log(req.body.layerName);
    layerStyle.remove({
        username:req.user.username,
        projectName:req.body.projectName,
        layerName:req.body.layerName
    },function(err, data){
        if(err){
            return res.send(err);
        }
        res.json(data);
    });
});


router.post("/layerStyling", function(req, res){
    var style=new layerStyle();
    style.layerName=req.body.layerName;
    style.username=req.user.username;
    style.projectName=req.body.projectName;
    style.layerStyle=JSON.parse(req.body.layerStyle);


    style.save(function(err){
        if(err){
            res.send(err);
        } else{
            res.json({message: 'layer created'});
        }
    });
});


//------------GEOJSON-------------------


router.delete("/deleteLayer", function(req, res){
    console.log("Trying to delete: "+req.user.username+"_"+req.body.layerName);

    geojsonLayer.remove({
        username: req.user.username,
        layerName: req.body.layerName,
        projectName: req.body.projectName
    }, function(err){
        if(err)
            res.send(err);
        res.json({message: 'succesfully deleted'});
    });
});

router.post("/getGeojson", function(req, res){

    geojsonLayer.find({
        layerName: req.body.layerName,
        username: req.user.username,
        projectName: req.body.projectName

    },function(err, data){
        if(err){
            res.send(err);
        } else{
            res.json(data);
        }
    });

});

router.get("/defaultGeojsons", function(req, res){
    //console.log(req.body.layerName);
    geojsonLayer.find({
        defaultLayer:true
    }, function(err, data){
        if(err){
            return res.send(err);
        }
        res.json(data);
    });
});

//get all geojsons for project and user
router.post("/geojsons", function(req, res){
    //console.log(req.body.layerName);
    geojsonLayer.find({
        projectName: req.body.projectName,
        username: req.user.username
    }, function(err, data){
        if(err){
            return res.send(err);
        }
        res.json(data);
    });
});



router.post("/saveGeojson", function(req, res){
    console.log('save geojson');
    var geo = new geojsonLayer();
    geo.username=req.user.username;
    geo.projectName=req.body.projectName;
    geo.layerName=req.body.layerName;
    geo.defaultLayer= req.body.defaultLayer;
    //TODO: adding something to the prop feature to see if it makes a difference, if it is saved to db then?
    //or instead add in front end before sending to turf functions? In case it needs a properties variable to work correctly
    geo.features=JSON.parse(req.body.features);
    console.log("geo features er!!!!!: ");
    console.log(geo.features);
    console.log(geo.features[0].properties);

    //go through all features for layer and check that they are valid features
    var validJson=true;

    for(var i=0; i<geo.features.length; i++){
        if(!GJV.valid(geo.features[i])){ //finds if any of the features are invalid json
            console.log('feature is not valid');
            validJson=false;
        }
    }

    if(validJson==true){ //check if valid features
        console.log('valid json');
        geo.save(function(err){
            if(err){
                res.send(err);
            } else{
                res.send(geo);
            }
        });
    }else{
        res.send(false);
    }

});

//------------PROJECTS-------------------

router.get("/projects", function(req, res){
    Project.find({
        username:req.user.username
    }, function(err, data){
        if(err){
            return res.send(err);
        }
        res.json(data);
    });
});

router.post("/project", function(req, res){

    var project= new Project();
    project.username=req.user.username;
    project.projectName=req.body.projectName;

    project.save(function(err){
        if(err){
            res.send(err);
        } else{
            res.json({message: 'layer created'});
        }
    });
});

router.delete("/deleteProject", function(req, res){

    console.log('delete');
    layerStyle.remove({
        projectName: req.body.projectName,
        username: req.user.username
    },function(err){
        if(err){
            console.log(err);
        }
    });

    Project.remove({
        projectName:req.body.projectName,
        username: req.user.username
    },function(err){
        if(err){
            console.log(err);
        }
    });

    geojsonLayer.remove({
        projectName:req.body.projectName,
        username: req.user.username
    },function(err){
        if(err){
            console.log(err);
        }
    });

});



//------------------ LOG IN --------------------------



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
