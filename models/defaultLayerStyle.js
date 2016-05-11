/**
 * Created by mathilde on 02/05/16.
 */

// user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var defaultLayerStyle = new Schema({
    layerName: String,
    layerStyle:{
        color: String,
        lineColor: String,
        opacity: Number,
        weight: Number,
        radius: Number
    }
});


module.exports = mongoose.model('defaultLayerStyle', defaultLayerStyle);