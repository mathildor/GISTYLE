/**
 * Created by mathilde on 23/02/16.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');


var User = new Schema({
    username: String,
    password: String
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('user', User);