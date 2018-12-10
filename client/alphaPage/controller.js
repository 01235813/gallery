'use strict';

// const requestSvc => requester service
// const scrollSvc => scroll service

(() => {

    // document.$p = 0;

    let getVideos = () => new Promise(async (resolve, reject) => {
        let data = await requestSvc.get(`/api/avideo`); // enable aggressive connection
        console.log('data: ', data);
        document.$p++;
        concatImageToPage(data.videos);
        resolve(data);
    });

    let concatImageToPage = (data) => {
        let targetElement = document.getElementById('videos');
        
        data
            .map(elem => {
                let result = document.createElement('video');
                result.src = elem;
                return result;
            })
            .map(elem => targetElement.appendChild(elem));
    }

    // document.$loadingGalleryFlag = false;

    setTimeout(getVideos, 100);

    // document.addEventListener("DOMContentLoaded", async () => {

    //     const environment = await requestSvc.get('/environment');
    //     console.log('environment: ', environment);

    //     await getImages();

    //     window.addEventListener('scroll', async () => {
    //         if ( !document.$loadingGalleryFlag && window.innerHeight + window.scrollY > document.body.scrollHeight - 10000 ) {
    //             document.$loadingGalleryFlag = true;
    //             console.log('loading another page!')
    //             await getImages()
    //             document.$loadingGalleryFlag = false;
    //         }
    //     });
    // });


    // requestSvc.get('https://jsonplaceholder.typicode.com/posts').then(console.log) // test


})();
