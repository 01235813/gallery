
'use strict'

const express = require('express');
const path = require('path');
const serveIndex = require('serve-index')

const controller = require('./controller');

require('dotenv').config(); // load dotenv constants

const app = express();
const PORT = process.env.PORT;

app.get('/g*', controller.requester('articlePage'));
app.get('/s*', controller.requester('galleryPage'));
app.get('/', controller.requester('frontPage'));

app.use('/public', express.static('public'), serveIndex('public', {'icons': true}));

app.listen(PORT);
console.log('server running on port:', PORT);