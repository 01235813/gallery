'use strict';

const requestSvc = (() => {
    let svc = {};

    let makeReqInterface = (method, url) => new Promise((resolve, reject) => {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status >= 200 && xmlhttp.status < 400) {
                // console.log('responseText:' + xmlhttp.responseText);
                try {
                    var data = JSON.parse(xmlhttp.responseText);
                } catch(err) {
                    console.log(err.message + " in " + xmlhttp.responseText);
                    reject(err);
                }
                resolve(data);
            }
        };
     
        xmlhttp.open(method, url, true);
        xmlhttp.send();
    })
    
    svc.makeReq = (method, url, aggressive = false) => new Promise((resolve, reject) => {
        console.log('making request at: ', url);
        if(!aggressive) makeReqInterface(method, url).then(resolve).catch(reject);
        else {
            let helper = (method, url, timeout=40000) => new Promise((resolve, reject) => {
                //after 2 minutes, connection will reject
                if(timeout > 2 * 360000){
                    console.error("could not establish connection... operation will now be halted.");
                    reject('could not establish connection...');
                }
                new Promise((resolve, reject) => {
                    let FLAG = true;
                    let timer = setTimeout(() => {
                        if(FLAG){
                            FLAG = false;
                            reject(`connection timedout after ${timeout / 1000} seconds...`)
                        }
                    }, timeout);

                    makeReqInterface(method, url).then(result => {
                        if(FLAG){
                            FLAG = false;
                            console.log('connection was successful!');
                            clearTimeout(timer);
                            resolve(result);
                        }
                    }).catch(err => {
                        if(FLAG){
                            FLAG = false;
                            reject(err);
                        }
                    })
                }).then(resolve).catch(err => {
                    console.error("connection failed to complete...");
                    console.error(err);
                    setTimeout(() => {
                        timeout *= 1.5;
                        console.error("retrying now...")
                        helper(method, url, timeout).then(resolve);
                    }, 2000)
                })
            })
            helper(method, url).then(resolve)
        }
    })

    svc.get     = (...args) => svc.makeReq("GET", ...args);
    svc.put     = (...args) => svc.makeReq("PUT", ...args,);
    svc.post    = (...args) => svc.makeReq("POST", ...args);
    svc.delete  = (...args) => svc.makeReq("DELETE", ...args);
    
    return svc;

})()