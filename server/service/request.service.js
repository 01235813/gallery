'use strict'

const request = require('request');
const jsdom = require('jsdom').JSDOM;
// request.debug = true;

let svc = {};

svc.get = (url, queries={}) => new Promise((resolve, reject) => {
    if(typeof url !== 'string'){
        throw new Error('env.URL is not a string');
    }

    let requestObj = { url, qs: queries };

    request.get(requestObj, (err, response, body) => {
        if(err) reject(err);
        else {
            resolve(body);
        }
    })
})

svc.getDOC = (url, queries={}) => new Promise((resolve, reject) => {
    let wrapDOM = (req) => new jsdom(req).window.document
    svc.get(url, queries).then(body => wrapDOM(body)).then(resolve);
})

module.exports = svc;