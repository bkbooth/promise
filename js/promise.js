/**
 * Promise constructor
 *
 * @param {function} deferred
 *
 * @constructor
 */
function Promise(deferred) {
    this._success = null;
    this._failure = null;

    deferred(
        function resolve(value) {
            if (this._success) {
                this._success(value);
            }
        }.bind(this),
        function reject(error) {
            if (this._failure) {
                this._failure(error);
            }
        }.bind(this)
    )
}

/**
 * Handle success and/or failure of deferred action
 *
 * @param {function} success
 * @param {function} failure
 */
Promise.prototype.then = function(success, failure) {
    if (success) {
        this._success = success;
    }
    if (failure) {
        this._failure = failure;
    }
};
