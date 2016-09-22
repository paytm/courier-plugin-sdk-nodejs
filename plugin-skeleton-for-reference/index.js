/*jshint multistr: true ,node: true*/
"use strict";

var
    /* Project itself */
    C             = require('./createOrder.js'),
    P             = require('./pull.js'),
    PR            = require('./pullReverse.js');


module.exports = {

    /* keep on adding objects of service here */

    
    // always Create a new object for manifest or whatever service plugin is providing
    createOrder : new C(),
    pull        : new P(),
    pullReverse : new PR()
};
