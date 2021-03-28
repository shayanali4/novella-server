const express = require('express');
var cors = require('cors')
var app = express()

app.use(cors())

// Startup
require('dotenv').config();
require('./startup/init')(app);
require('./startup/middleware')(app);
require('./startup/routes')(app);
