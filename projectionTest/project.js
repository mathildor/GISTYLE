var turf=require('../GIS/GISTYLE/public/turf.min.js');
// var turf=require("../turf-buffer-master/index.js");
var proj4=require('../GIS/GISTYLE/public/bower_components/proj4js/dist/proj4.js');
var buffer=require('../turf-buffer/index.js');



var point={
    "_id": {
        "$oid": "57cebd3272d38a1627811c88"
    },
    "defaultLayer": false,
    "username": "mathilde.oerstavik@gmail.com",
    "projectName": "FOSS4G-DEMO",
    "layerName": "POINT",
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "id": "node/130124423",
            "properties": {
                "@id": "node/130124423",
                "amenity": "pub",
                "created_by": "Potlatch 0.5c",
                "name": "Rosendal pub"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    11.026414,
                    -0.778160

                ]
            }
        }
        ,
        {
            "type": "Feature",
            "id": "node/576557075",
            "properties": {
                "opening_hours": "Mo-Th 14:00-23:00; Fr-Sa 13:00-24:00; Su 13:00-23:00",
                "name": "Lucas",
                "amenity": "pub",
                "@id": "node/576557075"
            },
            "geometry": {
                "coordinates": [
                    10.3995318,
                    63.4221396
                ],
                "type": "Point"
            }
        },
        {
            "type": "Feature",
            "id": "node/576557075",
            "properties": {
                "opening_hours": "Mo-Th 14:00-23:00; Fr-Sa 13:00-24:00; Su 13:00-23:00",
                "name": "Lucas",
                "amenity": "pub",
                "@id": "node/576557075"
            },
            "geometry": {
                "coordinates": [
                    9.261885,
                    48.575484
                ],
                "type": "Point"
            }
        }
    ],
    "__v": 0
};


// var web_mercator=proj4.defs('EPSG:3857');
var web_mercator="+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs";
// var unprojected=proj4.defs('EPSG:4326');
var EPSG4326="+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
var UTM="+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
// var UTM=proj4.defs["EPSG:32632"] = "+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";



projectCoordinates=function(json, fromProj, toProj){
  // console.log(json.features);
  // var json=turf.flip(json);
  for(var i=0; i<json.features.length; i++){
    var featureProjCoords=[];
    var coords=json.features[i].geometry.coordinates;
    if(coords[0][0]!==undefined){//multiple coordinates per feature
      // console.log("Different layout- multiple coords");
      // console.log("length of loop is: "+coords[0].length);
      // console.log("for-loop starting");
      for(var k=0; k<coords[0].length; k++){
        var featuerCoords=coords[0][k];
         //console.log("Coords is:");
        // console.log(featuerCoords);
        var projCoord=proj4(fromProj, toProj ,featuerCoords);
        json.features[i].geometry.coordinates[0][k]=projCoord;
      }

    }else{ //single coordinate per feature
      var projCoord=proj4(fromProj, toProj ,coords);
      json.features[i].geometry.coordinates=projCoord;
    }

    // console.log(projCoords);
  }
  // console.log(json.features[0].geometry.coordinates);
  // return turf.flip(json);
  return json;
}

//var utmProjected=projectCoordinates(point, web_mercator, EPSG4326);

// console.log("unprojectedCoordinates");
// console.log(JSON.stringify(unprojectedCoordinates));
// var buffered=turf.buffer(unprojectedCoordinates, 70, 'meters');
var buffered=buffer(point, 70, 'meters');
//var buffered=turf.buffer(point, 70, 'meters');
console.log("buffered:");
console.log(JSON.stringify(buffered));

// console.log(JSON.stringify(unprojectedCoordinates));
//var projectBack=projectCoordinates(buffered, EPSG4326, web_mercator);
//console.log("Projecting back");
//console.log(JSON.stringify(projectBack));
