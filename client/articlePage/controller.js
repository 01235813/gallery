'use strict';

// const requestSvc => requester service

document.$p = 0;

let getImages = () => new Promise(async (resolve, reject) => {
    let data = await requestSvc.get(`/api${location.pathname}?p=${document.$p}`);
    document.$p++;
    concatImageToPage(data);
    resolve(data);
});

let concatImageToPage = (data) => {
    document.getElementById('app').innerHTML = document.getElementById('app').innerHTML.concat(`${data.map(elem => `<img src=${elem.image} />`)}`);
}

document.$loadingGalleryFlag = false;

document.addEventListener("DOMContentLoaded", async () => {
    const environment = await requestSvc.get('/environment');
    console.log('environment: ', environment);

    await getImages();

    window.addEventListener('scroll', async () => {
        if ( !document.$loadingGalleryFlag && window.innerHeight + window.scrollY > document.body.scrollHeight - 2000 ) {
            document.$loadingGalleryFlag = true;
            console.log('loading another page!')
            await getImages()
            document.$loadingGalleryFlag = false;
        }
    });
});


// requestSvc.get('https://jsonplaceholder.typicode.com/posts').then(console.log) // test



