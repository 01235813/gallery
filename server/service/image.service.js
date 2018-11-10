'use strict'

const fs = require('fs');
const path = require('path');
const request = require('request');

let svc = {};
let emptyFunc = () => null;
let handleWinPath = (pathname) => pathname.replace(new RegExp('\\' + path.sep, 'g'), '/');

let manageDir = (filename) => {
    let directory = filename.match(/.*\//)[0];
    directory.split('/').map((elem, i) => {
        if(i == 0) return;
        if(typeof elem == 'number') elem = String.valueOf(elem);
        let dir2 = directory.match(new RegExp('.*' + elem))[0];
        if (!fs.existsSync(dir2)){
            fs.mkdirSync(dir2);
        }
    })
}

svc.downloadImage = (uri, filename, callback = emptyFunc) => {
    let savePath = "content/images/" + filename;
    manageDir(savePath);
    request.head(uri, function(err, res, body){
        request(uri).pipe(fs.createWriteStream(savePath)).on('close', callback);
    });
};


// console.log('pathname here is: ', path.join(__dirname + '/../content/images/'));

module.exports = svc;