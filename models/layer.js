// user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Layer = new Schema({

    username: {type: String},
    layername:{type: String},
    sqlString: {type: String},
    cartoCss: {type: String}
});


/*
var Layer = new Schema({
    name: String,
    features:[]
});*/

/*
var Layer = new Schema({
    properties: {
        title:       { type: String, required: true },
        description: { type: String, required: true },
        date:        { type:Date, default:Date.now }
    },
    geometry: {
        coordinates: { type: [Number], index: '2dsphere'}
    }
});
*/

module.exports = mongoose.model('layer', Layer);
