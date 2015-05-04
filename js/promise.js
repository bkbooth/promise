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
                if (value instanceof Promise) {
                    // Resolve/reject this Promise after the passed in Promise is resolved/rejected
                    value.then(function(result) {
                        // Handle resulting value locally, then pass on new success value
                        resolve(success(result));
                    }, function(error) {
                        // Pass on resulting error
                        reject(error);
                    });
                } else {
                    // Handle success value locally, then pass on new success value
                    resolve(success(value));
                }
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

/**
 * Resolve with the first of a set of promises to resolve/reject
 *
 * @param {Promise[]} promises
 *
 * @returns {Promise}
 */
Promise.race = function(promises) {
    var settled = false; // Keep track if any Promises have been settled

    return new Promise(function(resolve, reject) {
        promises.forEach(function(promise) {
            promise.then(function(result) {
                if (!settled) {
                    // First Promise to resolve/reject, resolve with result and set settled flag
                    resolve(result);
                    settled = true;
                }
            }, function(error) {
                if (!settled) {
                    // First Promise to resolve/reject, reject with error and set settled flag
                    reject(error);
                    settled = true;
                }
            });
        });
    });
};

/**
 * Resolve with an array of a set of promises to resolve
 * If any promise rejects, .all() rejects immediately
 *
 * @param {Promise[]} promises
 *
 * @returns {Promise}
 */
Promise.all = function(promises) {
    var settled = 0,  // Keep track of the number of Promises settled
        results = []; // Keep track of Promise resolutions

    return new Promise(function(resolve, reject) {
        promises.forEach(function(promise, index) {
            promise.then(function (result) {
                // Add resolution to the same index as the Promises array
                results[index] = result;
                // Increment number of settled Promises, resolve when all are resolved
                if (++settled === promises.length) {
                    resolve(results);
                }
            }, function (error) {
                // Reject immediately if any Promises reject
                reject(error);
            });
        });
    });
};
