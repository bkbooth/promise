var imgUrl = '//lorempixel.com/500/500/',
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
        fetch(imgUrl, { responseType: 'blob' })
            .then(function(result) {
                console.info('Got an image, create Object URL');
                return URL.createObjectURL(result);
            })
            .then(function(result) {
                console.info('Got Object URL for image, apply to <img>.src');
                img.src = result;
            })
            .catch(function(error) {
                console.error('Got no image!', error);
            })
            .then(function() {
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
