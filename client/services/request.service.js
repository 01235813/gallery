'use strict';

const requestSvc = (() => {
    let svc = {};

    svc.makeReq = (method, url) => new Promise((resolve, reject) => {
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

    svc.get     = (url) => svc.makeReq("GET", url);
    svc.put     = (url) => svc.makeReq("PUT", url);
    svc.post    = (url) => svc.makeReq("POST", url);
    svc.delete  = (url) => svc.makeReq("DELETE", url);
    
    return svc;

})()