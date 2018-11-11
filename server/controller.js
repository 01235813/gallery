
'use strict'

const path = require('path');
const jsdom = require('jsdom').JSDOM;

const scrapperSvc = require('./service/scrapper.service');
const request = require('./service/request.service');

const config = require('./config');


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

    // let queries = { ...config.queries, ...req.query }
    let queries = { ...req.query }

    console.log('req queries: ', req.query)


    let helper = (...args) => new Promise((resolve, reject) => {
        let processJSON = scrapperSvc[option];
        request.get(...args).then(body => {
            processJSON(wrapDOM(body), req).then(resolve).catch(reject)
        }).catch(reject)
    })

    let promises = [];

    switch(option){
        case 'frontPage':
            for(let i = 0; i < process.env.PAGES; i++){
                promises.push(helper(process.env.ROOT + req.url, { page: i, p: i, ...queries }));
            }
        default:
            promises.push(helper(process.env.ROOT + req.url, { ...queries }));
    }

    Promise.all(promises).then(data => {
        // const responseHTML = genClientHTML([].concat(...data));
        resolve([].concat(...data));
    }).catch(reject);
});

ctrl.sendEnv = (req, res) => res.status(200).json(config); //not sure if needed

ctrl.requester = (option) => (req, res) => {
    req.url = req.url.replace(/^\/api/, ''); //scrubs api route
    console.log('url = ', req.url);
    ctrl.preScrapper(option, req, res).then(data => {
        res.status(200).json(data)
    }).catch(err => {
        res.status(400).send(err);
    })
}

ctrl.serveHTML = (option) => (req, res) => {
    const DEBUG = req.query.debug;
    console.log('DEBUG: ', req.query)
    if(DEBUG){
        request.get(process.env.ROOT + req.url).then(data => {
            data = data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            res.status(200).send(data);
        })
    } else {
        let html = '';
        switch(option){
            case 'frontPage':
            case 'articlePage':
            case 'galleryPage':
                html = path.join(__dirname + '/../client/' + option + '/index.html');
                res.status(200).sendFile(html);
                break;
            default:
                res.status(500).send('error');
                break;
        }
    }
}


module.exports = ctrl;