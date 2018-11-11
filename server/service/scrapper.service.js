
'use strict'

const request = require('./request.service');
const imageSvc = require('./image.service');

let svc = {};

svc.frontPage = (document) => new Promise(resolve => {

    let result = [];

    Array.from(document.getElementsByClassName('itd')).forEach((elem, i) => {
        if (
            typeof elem.getElementsByClassName('it2')[0] !== 'undefined' &&
            typeof elem.getElementsByClassName('it5')[0] !== 'undefined'
        ) {
            let image_div = elem.getElementsByClassName('it2')[0];
            let key = image_div.innerHTML.split('~', 4);
            let proto = key[0] == 'init' ? 'http' : 'https';

            result.push({
                image: `${proto}://${key[1]}/${key[2]}`,
                href: elem.getElementsByClassName('it5')[0].children[0].href
            })
        }
    });
    resolve(result);
})

svc.articlePage = (document, req) => new Promise(async (resolve, reject) => {

    let max_pages = parseInt(document.getElementsByClassName('ptb')[0].children[0].lastElementChild.lastElementChild.previousElementSibling.lastElementChild.innerHTML);
    if(!max_pages || max_pages < parseInt(req.query.p) + 1) return reject('requested page exceeds max page');

    try {
        let latest = document.getElementById('gnd') && document.getElementById('gnd').lastElementChild.previousElementSibling.href;
        console.log('redirecting to latest page...')
        if(latest) document = await request.getDOC(latest);
    } catch(err) {
        console.log('already on latest page!')
    }

    let article = {
        id: req.url.split('/')[2].split('-')[0],
        name: document.getElementById('gn').innerHTML,
    }

    console.log('article is: ', article);

    let getImage = (href) => new Promise(async (resolve, reject) => {
        console.log('getting next page: ', href);
        let document = await request.getDOC(href);
        let loadfail = document.getElementById('loadfail').href;
        if((/https?:\/\//).test(loadfail)) document = await request.getDOC(loadfail)

        resolve(galleryPageInterface(document, href));
    })

    let helper = (document) => new Promise((resolve, reject) => {
        let promises = Array.from(document.getElementsByClassName('gdtm')).map(elem => getImage(elem.getElementsByTagName('a')[0].href));
        Promise.all(promises).then(async galleries => {
            // await Promise.all(galleries.map(elem => elem.imageDownload)) //downloads the images
            resolve(galleries.map(elem => elem.gallery_result));
        })
    });

    helper(document).then(result => resolve({ article, images: result})).catch(reject);
})

let galleryPageInterface = (document, href) => {
    href = href.replace(process.env.ROOT, '');
    let gallery = {
        id: href.split('/')[3].split('-')[0],
        name: document.getElementsByTagName('h1')[0].innerHTML,
    }

    let id = href.split('/')[2];
    let image = document.getElementById('img').src;
    let max_page = document.getElementsByClassName('sn')[0].getElementsByTagName('div')[0].getElementsByTagName('span')[1].innerHTML;
    let page = href.split('/')[3].split('-')[1];
    let ext = image.match(/\.[a-z]{3,4}$/)[0];

    let local_image = imageSvc.resolveFileName(gallery.id + '/' + page + '-' + id + ext);
    let imageDownload = imageSvc.downloadImage(image, local_image).catch(console.error);

    // let gallery_result = { image: imageSvc.localToWeb(local_image) } // local images not loading in html... need to fix this
    let gallery_result = { image }
    let result = { imageDownload, gallery_result }; 

    return result;
}

svc.galleryPage = (document, req) => new Promise((resolve, reject) => {
    let gallery = galleryPageInterface(document, req.url);
    gallery.imageDownload.then(() => resolve(gallery.result));
})

module.exports = svc;