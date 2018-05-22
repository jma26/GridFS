const mongoose = require('mongoose');
const Image = mongoose.model('Image');
const Images = require('../controllers/images.js');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');

module.exports = function(app) {
    // Set up multer-gridfs-storage
    const storage = new GridFsStorage({
        url: 'mongodb://localhost:27017/gridFS',
        file: function(request, file) {
            return 'file_' + Date.now();
        }
    })

    // Configure multer for single upload
    const upload = multer({
        storage: storage
    }).single('file');

    // Upload image
    app.post('/upload', function(request, response) {
        upload(request, response, function(error) {
            if (error) {
                console.log(error);
                response.json({status: 400, error: error});
            }
            console.log(request.file);
            response.json({status: 200});
        })
    });
};