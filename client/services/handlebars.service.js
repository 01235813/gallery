'use strict';

const handlebarsSvc = (() => {

    let svc = {};

    svc.setter = (obj, prop, value) => {
        console.log('setting obj!', obj);

        document.getElementsByTagName('body')[0].innerHTML = document.getElementsByTagName('body')[0].innerHTML
            .replace(/\{\{([^\}]+)\}\}/g, (...values) => {
                console.log('Im replacing', values[1]);
                const result = eval(values[1]);

                switch (typeof result) {
                    case 'object':
                        return JSON.stringify(result);
                    default:
                        return result;
                }
            });
    }

    svc.wrapper = (elem) => new Proxy(elem, {
        set(obj, prop, value) {
            svc.setter(obj, prop, value);
            return Reflect.set(...arguments);
        },
        // get(obj, prop, value) {
        //     svc.setter(obj, prop, value);
        //     return Reflect.get(...arguments);
        // }
    })

    return svc;
})()