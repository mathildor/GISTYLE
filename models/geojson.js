
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var features=new Schema({
    type: String,
    id: String,
    properties: {},
    geometry:{
        //type: String, coordinates:[]
    }
});


var geoJson = new Schema({
    projectName: String,
    username: String,
    layerName: String,
    features:[features],
    defaultLayer: Boolean,
    type:String
});

module.exports = mongoose.model('geojson', geoJson);
