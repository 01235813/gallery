'use strict'

const request = require('request');
const jsdom = require('jsdom').JSDOM;

const headers = require('../config').headers;

// request.debug = true;

let svc = {};

svc.get = (url, queries = {}) => new Promise((resolve, reject) => {
    if (typeof url !== 'string') {
        throw new Error('env.URL is not a string');
    }

    let requestObj = {
        url,
        qs: queries,
        headers
    };
    request.get(requestObj, (err, response, body) => {
        if (err) {
            console.error(err);
            reject(err);
        } else {
            resolve(body);
        }
    })
})

svc.getDOC = (url, queries = {}) => {
    let wrapDOM = (req) => new jsdom(req).window.document
    return svc.get(url, queries).then(body => wrapDOM(body));
}

module.exports = svc;