/*jshint multistr: true ,node: true*/
"use strict";

var
    /* Project itself */
    C             = require('./createOrder.js'),
    CR            = require('./createOrderReverse.js'),
    CNCLOR        = require('./cancelOrder.js'),
    P             = require('./pull.js'),
    PR            = require('./pullReverse.js');


module.exports = {

    /* keep on adding objects of service here */

    // always Create a new object for manifest or whatever service plugin is providing
    cancelOrder             : new CNCLOR(),
    createOrder             : new C(),
    createOrderReverse      : new CR(),
    pull                    : new P(),
    pullReverse             : new PR()
};
