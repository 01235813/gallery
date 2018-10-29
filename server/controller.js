
const request = require('request');
// request.debug = true;
const jsdom = require('jsdom').JSDOM;
const queries = require('./config').queries;


ctrl = {};

let makeHTMLReq = (url, page=0) => new Promise((resolve, reject) => {
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
    frontpage: (html) => {
        const dom = new jsdom(html);
        const document = dom.window.document;

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
    }
}

let scrapper = (option, ...args) => new Promise(resolve => {
    let processJSON = getJSON[option];
    makeHTMLReq(...args).then(html => {
        let result = processJSON(html);
        resolve(result);
    })
})

ctrl.preScrapper = (req, res) => new Promise(resolve => {
    let option = 'frontpage';

    promises = [scrapper(option, process.env.ROOT + req.url)]
    for(let i = 1; i < process.env.PAGES; i++){
        promises.push(scrapper(option, process.env.ROOT + req.url, i))
    }
    Promise.all(promises).then(data => {

        const responseHTML = genClientHTML([].concat(...data));
        resolve(responseHTML);
    });
});

ctrl.frontPage = (req, res) => {
    console.log('url = ', req.url);
    // res.status(200).send('ok');

    ctrl.preScrapper(req, res).then(data => {
        res.status(200).send(data)
    })
}

ctrl.articlePage = (req, res) => {
    res.status(200).send('ok')
}

ctrl.galleryPage = (req, res) => {

}






module.exports = ctrl;