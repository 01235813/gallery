'use strict';

// const requestSvc => requester service
// const scrollSvc => scroll service

(() => {

    document.$p = 0;

    let getImages = () => new Promise(async (resolve, reject) => {
        let data = await requestSvc.get(`/api${location.pathname}?p=${document.$p}`, true); // enable aggressive connection
        document.$p++;
        concatImageToPage(data.images);
        resolve(data);
    });

    let concatImageToPage = (data) => {
        document.getElementById('images').innerHTML = document.getElementById('images').innerHTML.concat(`${data.map(elem => `<img src=${elem.image} />`)}`);
    }

    document.$loadingGalleryFlag = false;

    document.addEventListener("DOMContentLoaded", async () => {

        const environment = await requestSvc.get('/environment');
        console.log('environment: ', environment);

        await getImages();

        window.addEventListener('scroll', async () => {
            if ( !document.$loadingGalleryFlag && window.innerHeight + window.scrollY > document.body.scrollHeight - 10000 ) {
                document.$loadingGalleryFlag = true;
                console.log('loading another page!')
                await getImages()
                document.$loadingGalleryFlag = false;
            }
        });
    });


    // requestSvc.get('https://jsonplaceholder.typicode.com/posts').then(console.log) // test


})();
