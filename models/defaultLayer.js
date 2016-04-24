var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var defaultLayer = new Schema({
    name:String,
    sql: String,
    cartocss: String,
    active: Boolean,
    type: String,
    defaultLayer: Boolean
});


module.exports = mongoose.model('defaultLayers', defaultLayer);
