'use strict';

// const requestSvc => requester service
// const scrollSvc => scroll service

(() => {

    document.$p = 0;

    let images = [];

    const getImages = () => new Promise(async (resolve, reject) => {
        let data = await requestSvc.get(`/api${location.pathname}?p=${document.$p}`, true); // enable aggressive connection
        document.$p++;
        images = images.concat(data.images);
        resolve(data);
    });

    const concatImageToPage = (data) => {
        let targetElement = document.getElementById('images');

        data
            .map(elem => {
                let result = document.createElement('img');
                result.src = elem.image;
                return result;
            })
            .map(elem => targetElement.appendChild(elem));
    }

    const processImages = () => new Promise(resolve => {
        getImages().then(data => {
            images = images.concat(data.images);
            console.log('images are: ', images);
            concatImageToPage(data.images);
            resolve(data);
        })
    })

    const handleScrollImages = async () => {
        if (!document.$loadingGalleryFlag && window.innerHeight + window.scrollY > document.body.scrollHeight - 10000) {
            document.$loadingGalleryFlag = true;
            console.log('loading another page!')
            await processImages();

            document.$loadingGalleryFlag = false;
        }
    }

    document.$loadingGalleryFlag = false;

    document.addEventListener("DOMContentLoaded", async () => {

        const environment = await requestSvc.get('/environment');
        console.log('environment: ', environment);

        await processImages();

        window.addEventListener('scroll', handleScrollImages);
    });


    // requestSvc.get('https://jsonplaceholder.typicode.com/posts').then(console.log) // test


})();