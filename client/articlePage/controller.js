'use strict';

// const requestSvc => requester service

let getImages = (page) => new Promise(async (resolve, reject) => {
    let data = await requestSvc.get(`/api${location.pathname}?p=${page}`);
    concatImageToPage(data);
    resolve(data);
});

let concatImageToPage = (data) => {
    document.getElementById('app').innerHTML = document.getElementById('app').innerHTML.concat(`${data.map(elem => `<img src=${elem.image} />`)}`);
}

document.addEventListener("DOMContentLoaded", async () => {

    const environment = await requestSvc.get('/environment');
    console.log('environment: ', environment);

    await getImages(0);
    await getImages(1);
    console.log('done!')
});


// requestSvc.get('https://jsonplaceholder.typicode.com/posts').then(console.log) // test



