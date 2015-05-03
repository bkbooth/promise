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
            // At the end of the chain, this._success will be null
            if (this._success) {
                this._success(value);
            }
        }.bind(this),
        function reject(error) {
            // At the end of the chain, this._failure will be null
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
    return new Promise(function(resolve, reject) {
        // Always define this._success() to forward success value if not handled locally
        this._success = function(value) {
            if (success) {
                // Handle success value locally, then pass on new success value
                resolve(success(value));
            } else {
                // No local success handler, pass on success value
                resolve(value);
            }
        };

        // Always define this._failure() to forward error if not handled locally
        this._failure = function(error) {
            if (failure) {
                // Handle error locally, then pass on new success value
                resolve(failure(error));
            } else {
                // No local failure handler, pass on error
                reject(error);
            }
        };
    }.bind(this));
};

/**
 * Catch is a shorthand for .then(undefined, function())
 *
 * @param {function} failure
 */
Promise.prototype.catch = function (failure) {
    return this.then(void 0, failure);
};
