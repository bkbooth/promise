# Learning JavaScript Promises by Writing a Promise Library

My first exposure to JavaScript Promises was at a JavaScript [meetup](http://www.sydjs.com/) a couple of years ago and despite being a talk by a very good presenter, it was an early stage in my JavaScript understanding and most of the topic went over my head. Nowadays Promises are quite common and most developers will probably have had some level of exposure, whether they understand them or not. They're part of the EcmaScript 6 (ES6) specification so if you don't understand them, now is a great time to learn.

We're going to write an implementation of a Promise library, and hopefully this helps you reading it and me writing it to better understand the workings of Promises. Let's dive right into the example and a bit of an explanation of how Promises are used. For more information, check out [Dr. Axel Rauschmayer](https://twitter.com/rauschma)'s article on [ES6 Promises](http://www.2ality.com/2014/10/es6-promises-api.html) or [Jake Archibald](http://twitter.com/jaffathecake)'s article on [Javascript Promises](http://www.html5rocks.com/en/tutorials/es6/promises/).

## Using Promises and the demo app

The basic usage of Promises is something like below, so that's where we're going to start. `doSomething()` is going to do something asynchronous and then if it succeeds, we want to be able to use or manipulate the resulting value (if any) from `doSomething()` in the success function. If something goes wrong in `doSomething()` we want to be able to handle the error in the failure function.

```javascript
doSomething().then(function(value) {
    // success
}, function(error) {
    // failure
});
```

Take a look at [script.js](https://github.com/bkbooth/promise/blob/step0/js/script.js) in the demonstration repository at branch `step0` for how we'll use the Promise library for the initial implementation.

```javascript
button.addEventListener('click', function clickListener() {
    setLoading(true);
    fetch(imgUrl, { responseType: 'blob' })
        .then(function(result) {
            setLoading(false);
            img.src = URL.createObjectURL(result);
        }, function(error) {
            setLoading(false);
            console.error('Got no image!', error);
        });
});
```

We're fetching an image, then on success we stop the loading spinner and set the `<img>.src` to an Object URL containing the loaded image data. On failure we still stop the loading spinner and log the error. We'll improve on this and remove the duplication as we improve the Promise library.

Inside `doSomething()` is where we'll actually setup our Promise, start an asynchronous task and then 'resolve' (execute the success handler function) or 'reject' (execute the failure handler function) the Promise. A Promise can only be 'settled' (either 'resolved' or 'rejected') once. For the ES6 standard of Promises, we pass a function to the `new Promise()` constructor. The function has two parameters `resolve` and `reject` which are both functions that we use to resolve or reject the Promise after our asynchronous task. In the example below, `AsyncTask()` is a fictional utility that we can attach success and error handler functions to the `onSuccess` and `onError` properties.

```javascript
function doSomething() {
    return new Promise(function(resolve, reject) {
        var task = new AsyncTask();
        
        task.onSuccess = function(value) {
            resolve(value);
        };
        
        task.onError = function(error) {
            reject(error);
        };
        
        task.start();
    });
}
```

Looking at [fetch.js](https://github.com/bkbooth/promise/blob/step0/js/fetch.js) in the demonstration repository at branch `step0` you'll see how I've wrapped an [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) with an asynchronous `fetch()` function that returns a Promise. I won't explain this in any detail and it won't be changing through this article, just take note of where we create the `new Promise()` and where we `resolve` and `reject` the Promise.

The demonstration is just a placeholder image and a 'Get Random Image!' button. Clicking the button downloads a random 500x500 image from [lorempixel.com](http://lorempixel.com/) and replaces the placeholder image with the downloaded image data.

To run the demonstration you'll need to clone the git repository, `git checkout` the correct branch (in this case `step0`) and then serve the files using a HTTP server. If you have [Python 2](https://www.python.org/downloads/) or [Python 3](https://www.python.org/downloads/) installed, the easiest is to just run `python -m SimpleHTTPServer` or `python3 -m http.server` respectively from the command line inside the cloned git repository.

## Basic success/failure handling

If you try running the demonstration now, you'll get an error because [promise.js](https://github.com/bkbooth/promise/blob/step0/js/promise.js) is just an empty stub at the moment. To get the demonstration working, we'll need to flesh out the constructor function and implement the `.then()` method. The constructor just needs to initialise two internal properties to store the success and failure handler functions that are passed into `.then()`, and then it needs to call the deferred function that is passed into the constructor. We'll need to provide the `resolve` and `reject` methods that will be called from inside the deferred function that was passed into the constructor. Our initial, very basic implementation looks like this.

```javascript
// promise.js

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

Promise.prototype.then = function(success, failure) {
    if (success) {
        this._success = success;
    }
    if (failure) {
        this._failure = failure;
    }
};
```

This will get the current demonstration application working. In the demo repository, `git checkout step1` to see it working. At the moment, you can only place a single `.then()` after the returned Promise from `fetch()`, so we just log the error if you have no network connection or request a bad URL. Change `fetch(imgUrl, { responseType: 'blob' });` to `fetch(errorUrl, { responseType: 'blob' });` to demonstrate this. Don't forget to change it back!

## Handler chaining

One of the great strengths of the Promise pattern is being able to chain operations to happen after an asynchronous operation, and eventually be able to perform a number of asynchronous operations in a style that looks synchronous, or is at least easier for us to understand and reason with. We want to be able to do something like this.

```javascript
method()
    .then(...)
    .then(...)
    .catch(...)
    .then(...);
```

Have a quick look at [script.js](https://github.com/bkbooth/promise/blob/step2/js/script.js) on branch `step2` to see how the demo has been changed. We don't need to duplicate the `setLoading(false)` calls anymore, we can do that at the end of the chain. We've separated some of the processing and notice the new `.catch()` method. We'll start by quickly implementing `.catch()` in the Promise library, it's just a convenience function for `.then(undefined, failure())`.

```javascript
Promise.prototype.catch = function (failure) {
    return this.then(void 0, failure);
};
```

The `Promise()` constructor doesn't need to change at all, we'll even keep the `if (this._success) { ... }` and `if (this._failure) { ... }` checks around the handler calls because at the end of the chain the handler functions won't be defined. Our `.then()` method needs to change quite substantially, the first and most important change is that to facilitate chaining `.then()` and `.catch()` handlers, we must always return a `new Promise()`. Next we'll always need to define `this._success()` and `this._failure()` methods. If `.then()` provides a success handler we'll call `success()` with the passed in value, then resolve the new Promise with the result of `success(value)`, otherwise we'll just resolve the new Promise with the passed in value which just hands the passed in value along to the next handler in the chain. If `.then()` provides a failure handler the processing is quite similar, we'll call `failure()` with the passed in error and then because the error should be handled after the failure handler, we resolve the new Promise with the result of `failure(error)`. If there's not a failure handler provide, we just pass the error down the chain. The revised `.then()` method looks like this.

```javascript
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
```

If you `git checkout step2` and run the demonstration now, the functionality is unchanged, but the code to achieve it is a bit nicer.

## Promises in the handler chain

One of the best things you can do with Promises is return a Promise within a handler, this lets you flatten out a chain of asynchronous operations. Take a look at [script.js](https://github.com/bkbooth/promise/blob/step3/js/script.js) on branch `step3` and you'll notice that we've moved the `.catch()` handler to the top of the chain and we're returning a new Promise via another call to `fetch()`, this time fetching a local fallback image.

```javascript
fetch(imgUrl, { responseType: 'blob' })
    .catch(function(error) {
        console.error('Got no image!', error);
        console.info('Getting default image');
        return fetch(defaultImgUrl, { responseType: 'blob' });
    })
    //...
    ;
```

We only need to make one change to our `this._success()` handler inside the `.this()` method. It now needs to check if the passed in value is an instance of `Promise`, call `.then()` on it if it is a Promise and resolve/reject the outer Promise based on the result/error of the passed in Promise. Replace the line `resolve(success(value));` with the following block to handle Promises as a value.

```javascript
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
```

If you `git checkout step3` and run the demonstration now, there's one major change to the functionality. If the initial request to fetch `imgUrl` fails, the `.catch()` handler returns a new fetch request for `defaultImgUrl`, this is a local fallback image so loading it shouldn't fail. Try replacing the first `fetch(imgUrl, { responseType: 'blob' });` with `fetch(errorUrl, { responseType: 'blob' });` to demonstrate loading the fallback image and then continuing down the chain of handlers.

## Slightly more advanced

Two very useful utility functions that a Promise library should provide are `Promise.race()` and `Promise.all()`. Both of these functions take an array of Promises and return a single Promise. `Promise.race()` resolves or rejects it's single returned Promise with the result or error from the first of it's passed in Promises to resolve or reject. The rest of the passed in Promises are ignored, regardless if they resolve or reject. `Promise.all()` resolves it's single returned Promise with an array of results resolved from all of the passed in Promises. The indexes of the results array match the index of the Promise that resolved the result from the passed in array of Promises. If any of the Promises passed into `Promise.all()` are rejected, the single returned Promise is immediately rejected with the error and all other passed in Promises are ignored, regardless if they are resolved or rejected. `Promise.all()` looks like this.

```javascript
Promise.all([
    fetch(imgUrl, { responseType: 'blob' }), // fetch 0
    fetch(imgUrl, { responseType: 'blob' })  // fetch 1
]).then(function(results) {
    // results[0] will contain the result of fetch 0
    // results[1] will contain the result of fetch 1
});
```

Try and think about how you might implement `Promise.race()` and `Promise.all()`. Take a look at [script.js](https://github.com/bkbooth/promise/blob/step4/js/script.js) at branches [`step4`](https://github.com/bkbooth/promise/blob/step4/js/script.js) and [`step5`](https://github.com/bkbooth/promise/blob/step5/js/script.js) for the demonstration examples of `Promise.race()` and `Promise.all()` respectively. (`git checkout step4` and `git checkout step5`) to run them. Below are my implementations.

`Promise.race()`

```javascript
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
```

`Promise.all()`

```javascript
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
```
