// Require gridfs
const Grid = require('gridfs-stream');
// Require mongoose
var mongoose = require('mongoose');
// require the fs module for loading model files
var fs = require('fs');
// require path for getting the models path
var path = require('path');
// Connect to mongoose
mongoose.connect('mongodb://localhost:27017/gridFS');
Grid.mongo = mongoose.mongo;
// Listen for mongoose connection and send connection status
// If connection is open
mongoose.connection.on('open', function() {
  console.log('Successful connection to MongoDB server');
  // Connect gridFS-stream to mongodb
  var gfs = Grid(mongoose.connection.db);
});
// If connection is closed
mongoose.connection.on('error', function(error) {
  console.log('Could not connect to MongoDB server');
});
// create a variable that points to the path where all of the models live
var models_path = path.join(__dirname, './../models');
// Use native promises
mongoose.Promise = global.Promise;
// read all of the files in the models_path and require (run) each of the javascript files
fs.readdirSync(models_path).forEach(function(file) {
  if(file.indexOf('.js') >= 0) {
    // require the file (this runs the model file which registers the schema)
    require(models_path + '/' + file);
  }
});