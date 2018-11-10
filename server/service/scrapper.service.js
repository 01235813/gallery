
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

svc.articlePage = (document) => new Promise(resolve => {
    let first_image = document.getElementsByClassName('gdtm')[0].getElementsByTagName('a')[0].href;
    let gallery = {
        id: first_image.split('.org')[1].split('/')[3].split('-')[0], //a bit messy but can't be bothered to pass the req object to fetch id
        name: document.getElementById('gn').innerHTML,
    }

    console.log('first image href is: ', first_image);

    let getHref = (document) => document.getElementById('next').href
    let getNextImage = (href, result = [], page = 1) => new Promise(resolve => {

        console.log('getting next page: ', href);
        request.getDOC(href).then(document => {
            let id = href.split('.org')[1].split('/')[2]
            let new_href = getHref(document);
            let image = document.getElementById('img').src;
            let ext = image.match(/\.[a-z]{3,4}/)[0]

            imageSvc.downloadImage(image, gallery.id + '/' + page + '-' + id + ext);
            result.push({ image });
            if (href == new_href) resolve(result);
            else {
                page++;
                getNextImage(new_href, result, page).then(resolve);
            }
        })
    });
    getNextImage(first_image).then(resolve);
})

svc.galleryPage = (document) => new Promise(resolve => {

})


module.exports = svc;