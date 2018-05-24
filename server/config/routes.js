const Grid = require('gridfs-stream');
const GridFsStorage = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const mongoosery = require('./mongoose.js');
const multer = require('multer');

module.exports = function(app) {
    // Connect to mongoose
    mongoose.connect('mongodb://localhost:27017/gridFS');
    // If connection is open
    mongoose.connection.on('open', function() {
        console.log('Successful connection to MongoDB server');
    });
    // If connection is closed
    mongoose.connection.on('error', function(error) {
        console.log('Could not connect to MongoDB server');
    });
    // Use native promises
    mongoose.Promise = global.Promise;

    // Set up multer-gridfs-storage
    const storage = new GridFsStorage({
        url: 'mongodb://localhost:27017/gridFS',
        file: function(request, file) {
            return `File_${Date.now()}`;
        }
    })

    // Configure multer for single upload
    const upload = multer({
        storage: storage
    }).single('file');

    // Initialize grid, gfs
    let gfs = Grid(mongoose.connection, mongoose.mongo);

    // @route GET /
    app.get('/', function(request, response) {
        gfs.files.find().toArray(function(error, files) {
            // Check if files exist
            if (!files || files.length === 0) {
                response.json({error: error});
            }
            console.log(files);
        })
        response.render('home');
    });
    // @route POST /upload
    app.post('/upload', function(request, response) {
        upload(request, response, function(error) {
            if (error) {
                response.json({status: 400, error: error});
            } else {
                let title = request.body.title;
                let author = request.body.author;
                request.file.metadata = {
                    title: title,
                    author: author
                }
                console.log('Successful upload');
                response.render('home');
            }
        })
    });
};