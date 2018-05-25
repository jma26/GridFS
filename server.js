const bodyParser = require('body-parser');
const express = require('express');
const Grid = require('gridfs-stream');
const GridFsStorage = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

// Initialize express
const app = express();

// Set View engine
app.set('view engine', 'ejs');
// Server static files
app.use(express.static(__dirname + '/public'));

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to mongoose
mongoose.connect('mongodb://localhost:27017/gridFS');

// If connection is open
mongoose.connection.on('open', function() {
    console.log('Successful connection to MongoDB server');
    // Set up multer-gridfs-storage
    const storage = new GridFsStorage({
        url: 'mongodb://localhost:27017/gridFS',
        file: function(request, response) {
            return {
                filename: `File_${Date.now()}`
            };
        }
    });
    
    // Configure multer for single upload
    const upload = multer({
        storage: storage
    }).single('file');
    
    // Initialize grid, gfs
    const gfs = Grid(mongoose.connection.db, mongoose.mongo);
    
    // @route GET /
    app.get('/', function(request, response) {
        gfs.files.find().toArray(function(error, files) {
            // Check if files exist
            if (!files || files.length === 0) {
                response.render('home', {files : false});
                console.log('No files found');
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
    // @route GET /images/:filename
    app.get('/image/:filename', function(request, response) {
        gfs.files.findOne({ filename: request.params.filename }, function(error, file) {
            // Check if file exist
            if (!file || file.length === 0) {
                return response.status(404).json({files: false})
                console.log('No files found');
            } else if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
                // Read output to browser
                console.log(file);
                const readstream = gfs.createReadStream(file.filename);
                readstream.pipe(response);
            }
        });
    });
    // @route GET /files/:filename
    app.get('/files/:filename', function(request, response) {
        gfs.files.findOne({ filename: request.params.filename }, function(error, file) {
            // Check if file exist
            if (!file || file.length === 0) {
                response.render('home', {files: false});
                console.log('No files found');
            } else {
                response.json(file);
            }
        })
    });
    // @route GET /files
    app.get('/files', function(request, response) {
        gfs.files.find().toArray(function(error, files) {
            // Check if files exist
            if (!files || files.length === 0) {
                response.render('home', {files: false });
            } else {
                response.json(files);
            }
        })
    })
});
// If connection is closed
mongoose.connection.on('error', function(error) {
    console.log('Could not connect to MongoDB server');
});
// Use native promises
mongoose.Promise = global.Promise;


// Port Number
const port = 8000;

// Server Port
app.listen(port, function() {
    console.log(`Listening to port ${port}`);
});