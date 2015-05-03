/**
 * Async wrapper for XMLHttpRequest
 *
 * @param {string} url       URL to fetch
 * @param {Object} [options] Override any XHR properties (eg. responseType)
 *
 * @returns {Promise}
 */
function fetch(url, options) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();

        // Iterate through options, apply any writable properties to XHR object
        for (var property in options) {
            if (
                options.hasOwnProperty(property) &&
                xhr.hasOwnProperty(property) &&
                Object.getOwnPropertyDescriptor(xhr, property).writable
            ) {
                xhr[property] = options[property];
            }
        }

        // On load, resolve or reject based on HTTP Status Code
        xhr.addEventListener('load', function xhrLoad() {
            // Check for 2xx HTTP Status Code
            if (/^2\d\d$/.test(String(xhr.status))) {
                resolve(this.response);
            } else {
                reject(new Error(this.statusText));
            }
        });

        // On error, reject
        xhr.addEventListener('error', function xhrError() {
            reject(new Error('Failed loading "'+url+'"'));
        });

        xhr.open('get', url, true);
        xhr.send();
    });
}
