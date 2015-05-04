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
        Promise.race([
            fetch(imgUrl, { responseType: 'blob' }),
            fetch(imgUrl, { responseType: 'blob' })
        ]).catch(function(error) {
            console.error('Got no image!', error);
            console.info('Getting default image');
            return fetch(defaultImgUrl, { responseType: 'blob' });
        }).then(function(result) {
            console.info('Got an image, create Object URL');
            return URL.createObjectURL(result);
        }).then(function(result) {
            console.info('Got Object URL for image, apply to <img>.src');
            img.src = result;
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
