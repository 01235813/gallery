
'use strict'

let svc = {};

svc.frontPage = (document) => new Promise(resolve => {

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
    resolve(result);
})

svc.articlePage = (document) => new Promise(resolve => {
    
    let promises = [];

    // promises = Array.from(document.getElementsByClassName('gdtm')).map(elem => {

    // })
})

svc.galleryPage = (document) => new Promise(resolve => {
    
})


module.exports = svc;