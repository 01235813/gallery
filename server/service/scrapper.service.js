
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

svc.articlePage = (document, req) => new Promise((resolve, reject) => {

    let max_pages = parseInt(document.getElementsByClassName('ptb')[0].children[0].lastElementChild.lastElementChild.previousElementSibling.lastElementChild.innerHTML) - 1;
    if(!max_pages || max_pages < parseInt(req.query.p)) return reject('requested page exceeds max page');

    let imagePromises = [];
    let images = [];
    let result = [];

    let gallery = {
        id: req.url.split('/')[3].split('-')[0],
        name: document.getElementById('gn').innerHTML,
    }

    console.log('gallery is: ', gallery);
    let getImage = (href) => new Promise(async (resolve, reject) => {
        console.log('getting next page: ', href);
        let document = await request.getDOC(href);
        let loadfail = document.getElementById('loadfail').href;
        if((/https?:\/\//).test(loadfail)) document = await request.getDOC(loadfail)

        resolve(galleryPageInterface(document, req.url));
    })

    let helper = (document) => new Promise((resolve, reject) => {
        let promises = Array.from(document.getElementsByClassName('gdtm')).map(elem => getImage(elem.getElementsByTagName('a')[0].href));
        Promise.all(promises).then(async galleries => {
            await Promise.all(galleries.map(elem => elem.imageDownload)) //downloads the images
            resolve(galleries.map(elem => elem.gallery_result));
        })
    })

    helper(document).then(resolve).catch(reject);
})

let galleryPageInterface = (document, href) => {

    let gallery = {
        id: href.split('/')[3].split('-')[0],
        name: document.getElementsByTagName('h1')[0].innerHTML,
    }

    let id = href.split('/')[2];
    let image = document.getElementById('img').src;
    let page = document.getElementsByClassName('sn')[0].getElementsByTagName('div')[0].getElementsByTagName('span')[1].innerHTML;
    let ext = image.match(/\.[a-z]{3,4}$/)[0]

    let local_image = imageSvc.resolveFileName(gallery.id + '/' + page + '-' + id + ext);
    let imageDownload = imageSvc.downloadImage(image, local_image);

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