/*jshint multistr: true ,node: true*/
"use strict";

var
    /* Node Intenal */
    UTIL                        = require('util'),

    /* NPM Third Party */
    _                           = require('lodash'),

    CORE_ORDER_PULL_REVERSE     = require('../core/index.js').pullReverse;

function testCourierPullReverse () {

    var self            = this;

    // calling super class
    CORE_ORDER_PULL_REVERSE.call(self);

}

UTIL.inherits(testCourierPullReverse, CORE_ORDER_PULL_REVERSE);

testCourierPullReverse.prototype.getRequestUrl = function(){
    /*
        This overrides `getRequestUrl` and returns the value of `settings.Base` from `manifest.json` file.
    */

    var
        self            = this ,
        url             = _.get(self.getSettings(), 'settings.Base');

    return url;
};


module.exports = testCourierPullReverse;