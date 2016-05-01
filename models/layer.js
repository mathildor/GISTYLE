// user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Layer = new Schema({

    username: String,
    name:String,
    sql: String,
    cartocss: String,
    active: Boolean,
    defaultLayer: Boolean,
    type: String,
    tool: String,
    projectName: String
});


module.exports = mongoose.model('layer', Layer);
