
import express from 'express';
import path from 'path';


const app = express();

app.get('/homepage', (req, res) => {
    res.status(400).send('hello world')
})
