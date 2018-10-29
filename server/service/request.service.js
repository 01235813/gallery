'use strict'

const request = require('request');
// request.debug = true;

module.exports = (url, queries={}) => new Promise((resolve, reject) => {
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