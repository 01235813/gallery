
'use strict'

const path = require('path');

const scrapperSvc = require('./service/scrapper.service');
const requestSvc = require('./service/request.service');

const config = require('./config');


let ctrl = {};

ctrl.preScrapper = (option, req, res) => new Promise((resolve, reject) => {

    let queries = { ...config[option].queries, ...req.query }
    // let queries = { ...req.query }

    let helper = (...args) => new Promise((resolve, reject) => {
        let processJSON = scrapperSvc[option];
        requestSvc.getDOC(...args).then(document => {
            processJSON(document, req).then(resolve).catch(reject)
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
        if(data.length == 1) resolve(data[0]);
        else resolve([].concat(...data));
    }).catch(reject);
});

ctrl.sendEnv = (req, res) => res.status(200).json(config); //not sure if needed

ctrl.requester = (option) => (req, res) => {
    req.url = req.url.replace(/^\/api/, ''); //scrubs api route
    console.log('url = ', req.url);
    ctrl.preScrapper(option, req, res).then(data => {
        console.log('\n\nrequest complete!\n\n')
        res.status(200).json(data)
    }).catch(err => {
        res.status(400).send(err);
    })
}

ctrl.serveDebug = (req, res) => {
    const url = req.url.replace(/^\/debug/, '');
    requestSvc.get(process.env.ROOT + url).then(data => {
        data = data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        res.status(200).send(data);
    })
}

ctrl.serveHTML = (option) => (req, res) => {
    const DEBUG = req.query.debug;
    if(DEBUG){
        ctrl.serveDebug(req, res);
    } else {
        let html = '';
        switch(option){
            case 'frontPage':
            case 'articlePage':
            case 'galleryPage':
            case 'alphaPage':
                html = path.join(__dirname + '/../client/' + option + '/index.html');
                res.status(200).sendFile(html);
                break;
            default:
                res.status(500).send('error');
                break;
        }
    }
}

ctrl.avideo = (req, res) => {
    requestSvc.getDOC(process.env.AROOT).then(doc => {
        Promise.all(
            Array.from(doc.querySelectorAll('a[itemprop=url]'))
                .map(elem => elem.href)
                .splice(0, 16)
                .map(href => new Promise(resolve => (
                    requestSvc.getDOC(href)
                        .then(doc => {
                            // console.log('fetching video from: ', href);
                            resolve(doc.getElementsByTagName('video')[0].lastChild.src)
                        })
                )))
        ).then(videos => {
            console.log('results: ', videos);
            res.status(200).json({ videos });
        })
    })
};

module.exports = ctrl;