'use strict'

const serveIndex = require('serve-index');
const express = require('express');

const controller = require('./controller');

module.exports = (app) => {

    //client routes
    app.get('/', controller.serveHTML('frontPage'));
    app.get('/g/*', controller.serveHTML('articlePage'));
    app.get('/s/*', controller.serveHTML('galleryPage'));
 
    //api routes
    app.get('/api/', controller.requester('frontPage'));
    app.get('/api/g/*', controller.requester('articlePage'));
    app.get('/api/s/*', controller.requester('galleryPage'));

    //static resources
    app.use('/client', express.static('client'));
    app.use('/public', express.static('public'), serveIndex('public', {'icons': true}));
}
