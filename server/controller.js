
// const https = require('https');
const request = require('request');
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

ctrl.scrapeFrontpage = (cb) => {
    makeHTMLReq(process.env.ROOT).then(html => {
        const dom = new jsdom(html);
        const document = dom.window.document;

        let images = Array.from(document.getElementsByClassName('id3')).map(elem => {
            return {
                image: elem.children.item(0).children.item(0).src,
                href: elem.children.item(0).href,
            }
        });

        // let images = Array.from(document.getElementsByClassName('itg').children).map(elem => {
        //     return {
        //         image: elem.children.item(1).children.item(0).children.item(0).src,
        //         href: elem.children.item(1).children.item(0).href,
        //     }
        // })

        const responseHTML = ctrl.genClientHTML(images);
        // console.log('responseHTML is: ', responseHTML);

        cb(responseHTML);
    })
}





module.exports = ctrl;