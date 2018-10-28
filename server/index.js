
const express = require('express');
const path = require('path');

const controller = require('./controller');

require('dotenv').config(); // load dotenv constants

const app = express();
const PORT = process.env.PORT;

app.get('/', (req, res) => {
    // res.status(200).send('hello world');
    controller.scrapeFrontpage(data => {
        res.status(200).send(data)
    })
})

app.listen(PORT);
console.log('server running on port:', PORT);