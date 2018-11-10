
'use strict'

const jsdom = require('jsdom').JSDOM;

const scrapperSvc = require('./service/scrapper.service');
const request = require('./service/request.service');

const config = require('./config').queries;


let ctrl = {};

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

ctrl.preScrapper = (option, req, res) => new Promise((resolve, reject) => {

    let queries = { ...config[option] }

    let helper = (...args) => new Promise((resolve, reject) => {
        let processJSON = scrapperSvc[option];
        request.get(...args).then(body => processJSON(wrapDOM(body)).then(resolve).catch(reject))
    })

    let promises = [];
    for(let i = 0; i < process.env.PAGES; i++){
        promises.push(helper(process.env.ROOT + req.url, { page: i, p: i, ...queries }));
    }

    Promise.all(promises).then(data => {
        const responseHTML = genClientHTML([].concat(...data));
        resolve(responseHTML);
    }).catch(reject);
});

ctrl.requester = (option) => (req, res) => {

    const DEBUG = process.env.VIEW == 'html';

    if(DEBUG){
        request(process.env.ROOT + req.url).then(data => {
            data = data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            res.status(200).send(data);
        })
    } else {
        console.log('url = ', req.url);
        ctrl.preScrapper(option, req, res).then(data => {
            res.status(200).send(data)
        })
    }
}


module.exports = ctrl;