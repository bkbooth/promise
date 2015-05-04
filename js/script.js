var imgUrl = '//lorempixel.com/500/500/',
    defaultImgUrl = 'img/fry-aaargh.gif',
    errorUrl = 'nothing-here',
    button,
    loading,
    img;

/**
 * Called on window.load
 * Gets <button> and <img> elements and sets up click handler
 */
function init() {
    button = document.querySelector('#getImage');
    loading = document.querySelector('#loading');
    img = document.querySelector('img');

    button.addEventListener('click', function clickListener() {
        setLoading(true);
        Promise.all([
            fetch(imgUrl, { responseType: 'blob' }),
            fetch(imgUrl, { responseType: 'blob' }),
            fetch(imgUrl, { responseType: 'blob' })
        ]).catch(function(error) {
            console.error('Got no image!', error);
            console.info('Getting default image');
            return Promise.all([ fetch(defaultImgUrl, { responseType: 'blob' }) ]);
        }).then(function(results) {
            console.info('Got images, create Object URLs');
            return results.map(function(image) {
                return URL.createObjectURL(image);
            });
        }).then(function(results) {
            console.info('Got Object URLs for images, create and add new <img>s');
            // Remove all previous images
            Array.prototype.forEach.call(document.querySelectorAll('img'), function(img) {
                img.parentNode.removeChild(img);
            });
            // Create and add new images
            results.forEach(function(image) {
                var img = document.createElement('img');
                img.src = image;
                document.querySelector('#images').appendChild(img);
            });
        }).then(function() {
            console.info('Cleaning up');
            setLoading(false);
        });
    });
}

/**
 * Show/hide loading spinner
 *
 * @param {boolean} show
 */
function setLoading(show) {
    loading.style.display = Boolean(show) ? 'inline-block' : 'none';
}

window.addEventListener('load', init);
