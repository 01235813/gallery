
'use strict'

const express = require('express');
const path = require('path');
const routes = require('./routes')

require('dotenv').config(); // load dotenv constants

const app = express();
const PORT = process.env.PORT;

routes(app);

app.listen(PORT);
console.log('server running on port:', PORT);