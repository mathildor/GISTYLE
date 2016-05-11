/**
 * Created by mathilde on 02/05/16.
 */
// user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var layerStyle = new Schema({
    username: String,
    layerName: String,
    projectName: String,
    layerStyle:{}
});


module.exports = mongoose.model('layerStyle', layerStyle);