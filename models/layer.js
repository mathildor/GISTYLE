// user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Layer = new Schema({

    username: String,
    name:String,
    sql: String,
    cartocss: String,
    active: Boolean,
    type: String
});


module.exports = mongoose.model('layer', Layer);
