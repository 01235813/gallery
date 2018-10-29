
'use strict'

const request = require('request');
// request.debug = true;
const jsdom = require('jsdom').JSDOM;
const queries = require('./config').queries;


let ctrl = {};

let makeReq = (url, page=0) => new Promise((resolve, reject) => {
    if(typeof url !== 'string'){
        throw new Error('env.URL is not a string');
    }

    let requestObj = { url, qs: queries };
    if(page) requestObj.qs.page = page;
    
    console.log('requestion from: ', requestObj.url + ' | page: ', page);

    request.get(requestObj, (err, response, body) => {
        if(err) reject(err);
        else {
            resolve(body);
        }
    })
})

let wrapDOM = (req) => new jsdom(req).window.document

let genClientHTML = (data) => `
    <!DOCTYPE html>
    <html>
        <head></head>
        <body> 
            ${data.map(elem => `<a href=${elem.href}>
                <img src="${elem.image}" />
            </a>`).join('\n')} 
        </body>
    </html>
`

let getJSON = {
    frontPage: (document) => {

        let result = [];

        Array.from(document.getElementsByClassName('itd')).forEach((elem, i) => {
            if(
                typeof elem.getElementsByClassName('it2')[0] !== 'undefined' && 
                typeof elem.getElementsByClassName('it5')[0] !== 'undefined'
            ){
                let image_div = elem.getElementsByClassName('it2')[0];
                let key = image_div.innerHTML.split('~', 4);
                let proto = key[0] == 'init' ? 'http' : 'https';
        
                result.push({
                    image: `${proto}://${key[1]}/${key[2]}`,
                    href: elem.getElementsByClassName('it5')[0].children[0].href
                })
            }
        });
        return result;
    },
    articlePage: (html) => {

    }
}

ctrl.preScrapper = (option, req, res) => new Promise(resolve => {

    let helper = (...args) => new Promise(resolve => {
        let processJSON = getJSON[option];
        makeReq(...args).then(body => {
            let result = processJSON(wrapDOM(body));
            resolve(result);
        })
    })

    let promises = [];
    for(let i = 0; i < process.env.PAGES; i++){
        promises.push(helper(process.env.ROOT + req.url, i));
    }

    Promise.all(promises).then(data => {
        const responseHTML = genClientHTML([].concat(...data));
        resolve(responseHTML);
    });
});

ctrl.requester = (option) => (req, res) => {
    console.log('url = ', req.url);
    ctrl.preScrapper(option, req, res).then(data => {
        res.status(200).send(data)
    })
}


module.exports = ctrl;