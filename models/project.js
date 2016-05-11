// project model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Project = new Schema({
    username: String,
    projectName: String
});


module.exports = mongoose.model('project', Project);
