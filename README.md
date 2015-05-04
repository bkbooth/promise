# Promise library with demo

This repository is a companion to a [blog post](http://bkbooth.me/writing-a-javascript-promises-library/)
that I wrote about implementing a Promise library. It contains the final source code for the
library, a demonstration page, and branches to demonstrate the different steps of getting to the
final solution.

## Final library implementation

You can see the finished library code here:
[promise.js](https://github.com/bkbooth/promise/blob/master/js/promise.js)

## Demonstration

The demonstration is in [index.html](https://github.com/bkbooth/promise/blob/master/index.html),
you'll need to clone this repository and then host using something like python2's `SimpleHTTPServer`
module (eg. `python -m SimpleHTTPServer`) or python3's `http.server` module (eg.
`python3 -m http.server`). It needs to be hosted for Cross-Origin Resource Sharing (CORS) to request
an external image from [lorempixel.com](http://lorempixel.com/)

## Step branches

Look at the branches named `step#` for the progression of getting to the final solution:

* [step0](https://github.com/bkbooth/promise/tree/step0):
Initial setup of demo, Promise library is empty stub
