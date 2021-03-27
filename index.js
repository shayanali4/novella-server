const express = require('express');
const app = express();

// Startup
require('dotenv').config();
require('./startup/init')(app);
require('./startup/middleware')(app);
require('./startup/routes')(app);
