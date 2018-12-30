
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
    if(document.body.innerHTML.search("This gallery has been removed or is unavailable.") > -1) {
        console.warn('gallery has been removed and is no longer available');
        resolve({});
    }

    try {
        let latest = document.getElementById('gnd') && document.getElementById('gnd').lastElementChild.previousElementSibling.href;
        if(latest) {
            console.log('redirecting to latest page...')
            document = await request.getDOC(latest);
        }
    } catch(err) {
        console.log('on latest page!')
    }

    let current_page = parseInt(req.query.p) + 1;
    let tags = [];
    
    try {
        tags = [].concat.apply(
            [], 
            Array.from(document.getElementById('taglist').children[0].children[0].children)
                .map(row => Array.from(row.children[1].children)
                    .map(col => col.id)
                )
        )
    } catch(err){
        console.warn("there were no tags found for this library");
    }

    let artist = tags.find(elem => (/artist/g).test(elem))
    artist = artist ? artist.replace(/.*artist\:/, '') : '';

    let article = {
        id: req.url.split('/')[2].split('-')[0],
        name: document.getElementById('gn').innerHTML,
        artist,
        tags,
        max_pages: parseInt(document.getElementsByClassName('ptb')[0].children[0].lastElementChild.lastElementChild.previousElementSibling.lastElementChild.innerHTML),
        max_items: parseInt(document.getElementsByClassName('gpc')[0].innerHTML.match(/\d+/g)[2]),
    }
    
    if(!article.max_pages || article.max_pages < current_page) return reject('requested page exceeds max page');

    console.log('article is: ', article, '\n');

    let getImage = (href) => new Promise(async (resolve, reject) => {
        let document = await request.getDOC(href);

        console.log('getting next page: ', href);

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

    // let local_image = imageSvc.resolveFileName(`${gallery.id}-${gallery.name.replace(/[^a-zA-Z0-9\[\] ]/g, '')}/${page}-${id}${ext}`);
    // let imageDownload = imageSvc.downloadImage(image, local_image).catch(console.error);

    // let gallery_result = { image: imageSvc.localToWeb(local_image) }

    let gallery_result = { image }
    let result = { gallery_result }; 

    return result;
}

svc.galleryPage = (document, req) => new Promise((resolve, reject) => {
    let gallery = galleryPageInterface(document, req.url);
    resolve(gallery.result);
})

module.exports = svc;