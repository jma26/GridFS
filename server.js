const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

// Initialize express
const app = express();

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Require mongoose.js to connect to mongoDB
require('./server/config/mongoose.js');

// Angular app
app.use(express.static(path.join(__dirname, '/gridfsAng/dist')));

// Require routes.js for server routing
const route = require('./server/config/routes.js')(app);

// Catch all route to Angular
app.all("*", function(request, response, next) {
    response.send(path.resolve("./gridfsAng/dist/index.html"))
});

// Port Number
const port = 8000;

// Server Port
app.listen(port, function() {
    console.log(`Listening to port ${port}`);
});