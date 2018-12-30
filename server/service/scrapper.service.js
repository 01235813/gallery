
'use strict'

const request = require('./request.service');
const imageSvc = require('./image.service');

let svc = {};

svc.frontPage = (document) => new Promise(resolve => {
    console.log('hit!')

    const getRating = (elem) => {
        const data = elem.style['background-position'].replace('px', '');
        const x = parseInt(data.split(' ')[0]);
        const y = parseInt(data.split(' ')[1]);

        let result = 5 - Math.round(Math.abs(x) / 16, 0);
        if(y < -10) result -= 0.5;
        
        return result;
    }

    // console.log('document: ', Array.from(document.getElementsByClassName('id1')));

    let result = Array.from(document.getElementsByClassName('id1')).map((elem, i) => {

        const elem_title = elem.getElementsByClassName('id2')[0]
        const elem_image = elem.getElementsByClassName('id3')[0]
        const elem_subtitle = elem.getElementsByClassName('id4')[0]

        let result_obj = {};

        // elem_title
        try {
            result_obj = { 
                ...result_obj,
                title: elem_title.children[0].innerHTML,
                href: elem_title.children[0].href,
            }
        } catch(err) {
            console.error('elem_title is not available, please reconfigure...\nERROR: ', err);
        }
        
        // cccccc
        try {
            result_obj = { 
                ...result_obj,
                image: elem_image.children[0].children[0].src,
            }
        } catch(err) {
            console.error('elem_image is not available, please reconfigure...\nERROR: ', err);
        }
        
        // elem_subtitle
        try {
            result_obj = { 
                ...result_obj,
                type: elem_subtitle.children[0].title,
                count: parseInt(elem_subtitle.children[1].innerHTML.replace(/[^\d]/g, '')),
                rating: getRating(elem_subtitle.children[2]),
            }
        } catch(err) {
            console.error('elem_subtitle is not available, please reconfigure...\nERROR: ', err);
        }

        return result_obj;
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