const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
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

// Require mongoose.js to connect to mongoDB
require('./server/config/mongoose.js');

// Require routes.js for server routing
const route = require('./server/config/routes.js')(app);

// Port Number
const port = 8000;

// Server Port
app.listen(port, function() {
    console.log(`Listening to port ${port}`);
});