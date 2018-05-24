const Grid = require('gridfs-stream');
const GridFsStorage = require('multer-gridfs-storage');
const mongoose = require('mongoose');
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
        url: 'mongodb://localhost:27017/gridFS'
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
                response.render('home', {files : false});
                console.log('No files round');
            } else {
                console.log(files);
                response.render('home', {files: files});
            }
        });
    });
    // @route POST /upload
    app.post('/upload', function(request, response) {
        upload(request, response, function(error) {
            if (error) {
                response.json({status: 400, error: error});
            } else {
                if (request.file && request.file.id) {
                    let title = request.body.title;
                    let author = request.body.author;
                    gfs.files.update({
                        _id: request.file.id
                    }, {$set: {
                        metadata: {
                            author: author,
                            title: title
                        }
                    }}, function(error, update) {
                        if (error) {
                            console.log('Update error');
                        } else {
                            console.log('Update successful');
                        }
                    })
                }
                console.log(`File successfully uploaded`);
                response.redirect('/');
            }
        })
    });
};