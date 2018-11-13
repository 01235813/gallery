'use strict'

const fs = require('fs');
const path = require('path');
const request = require('request');

let svc = {};

let escapeRegExp = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')

let handleDir = (filename) => {
    let directory = filename.match(/.*\//)[0];
    directory.split('/').map((elem, i) => {
        if(elem){
            let dir2 = directory.match(new RegExp('.*' + escapeRegExp(elem)))[0];
            if (!fs.existsSync(dir2)){
                fs.mkdirSync(dir2);
            }
        }
    })
}

svc.localToWeb = (pathName) => process.env.DOMAIN + '/' + pathName;

svc.resolveFileName = (filename) => "public/images/" + filename;

svc.downloadImage = (uri, savePath) => new Promise((resolve, reject) => {
    if (fs.existsSync(savePath)){
        resolve('history')
    } else {
        handleDir(savePath);
        request(uri)
            .on('error', err => {
                console.error('err downloading image: ', err);
                reject(err);
            })
            .pipe(fs.createWriteStream(savePath))
                .on('close', () => {
                    console.log('done: ', savePath);
                    resolve('saved');
                })
    }
});

module.exports = svc;