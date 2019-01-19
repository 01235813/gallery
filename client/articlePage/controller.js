'use strict';

// const requestSvc => requester service
// const scrollSvc => scroll service

const $ctrl = (() => {

    let $ctrl = {};

    $ctrl.$p = 0;
    $ctrl.images = [];

    $ctrl.debugMode = () => {
        window.location = window.location = '?debug=1';
    }



    const getImages = () => new Promise(async (resolve, reject) => {
        let data = await requestSvc.get(`/api${location.pathname}?p=${$ctrl.$p}`, true); // enable aggressive connection
        $ctrl.$p++;
        $ctrl.images = $ctrl.images.concat(data.images);
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
            $ctrl.images = $ctrl.images.concat(data.images);
            console.log('images are: ', $ctrl.images);
            concatImageToPage(data.images);
            resolve(data);
        })
    })

    const handleScrollImages = async () => {
        if (!$ctrl.$loadingGalleryFlag && window.innerHeight + window.scrollY > document.body.scrollHeight - 10000) {
            $ctrl.$loadingGalleryFlag = true;
            console.log('loading another page!')
            await processImages();

            $ctrl.$loadingGalleryFlag = false;
        }
    }

    $ctrl.$loadingGalleryFlag = false;

    document.addEventListener("DOMContentLoaded", async () => {

        const environment = await requestSvc.get('/environment');
        console.log('environment: ', environment);

        await processImages();

        window.addEventListener('scroll', handleScrollImages);
    });


    // requestSvc.get('https://jsonplaceholder.typicode.com/posts').then(console.log) // test


    return $ctrl;

})();