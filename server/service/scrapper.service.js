
'use strict'

const request = require('./request.service');

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
    console.log('first image href is: ', first_image);

    let getHref = (document) => document.getElementById('next').href
    let getNextImage = (href, result = []) => new Promise(resolve => {
        console.log('getting next page: ', href);
        request.getDOC(href).then(document => {
            let new_href = getHref(document);
            let image = document.getElementById('img').src
            result.push({ image });
            if (href == new_href) resolve(result);
            else {
                getNextImage(new_href, result).then(resolve);
            }
        })
    });
    getNextImage(first_image).then(resolve);
})

svc.galleryPage = (document) => new Promise(resolve => {

})


module.exports = svc;