
const express = require('express');
const path = require('path');

const controller = require('./controller');

require('dotenv').config(); // load dotenv constants

const app = express();
const PORT = process.env.PORT;

app.get('/g*', controller.articlePage);
app.get('/s*', controller.galleryPage);
app.get('/', controller.frontPage);

app.listen(PORT);
console.log('server running on port:', PORT);