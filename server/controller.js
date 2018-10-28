
// const https = require('https');
const request = require('request');
// request.debug = true;
const jsdom = require('jsdom').JSDOM;



ctrl = {};

let makeHTMLReq = (url, page) => new Promise((resolve, reject) => {
    if(typeof url !== 'string'){
        throw new Error('env.URL is not a string');
    }

    let requestObj = { url };
    if(page) requestObj.qs = { page };
    
    console.log('requestion from: ', requestObj)

    request.get(requestObj, (err, response, body) => {
        if(err) reject(err);
        else {
            resolve(body);
        }
    })
})

// let makeHTMLReqv2 = (url) => new Promise((resolve, reject) => {
//     const dom = (new jsdom.JSDOM(`<!--scripts go here-->`, {
//         url: url,
//         referrer: url,
//         contentType: "text/html",
//         includeNodeLocations: true,
//         // storageQuota: 50000000
//     })).window.document
//     console.log('document is: ', dom);
//     resolve(dom);
// })

ctrl.genClientHTML = (data) => `
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

ctrl.processJSON = (html) => {
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
    })

    return result;

    // return Array.from(document.getElementsByClassName('id3')).map(elem => {
    //     return {
    //         image: elem.children.item(0).children.item(0).src,
    //         href: elem.children.item(0).href,
    //     }
    // });
}

ctrl.scrapeFrontpage = (cb) => {
    makeHTMLReq(process.env.ROOT, 5).then(html => {

        const html2 = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

        const images = ctrl.processJSON(html);
        const responseHTML = ctrl.genClientHTML(images);

        cb(responseHTML);
    })
}





module.exports = ctrl;