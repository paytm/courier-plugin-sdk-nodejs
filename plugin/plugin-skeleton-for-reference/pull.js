/*jshint multistr: true ,node: true*/
"use strict";

var
    /* Node Intenal */
    REQUEST             = require('request'),
    UTIL                = require('util'),

    /* NPM Third Party */
    _                   = require('lodash'),

    CORE_ORDER_PULL = require('../../core/index.js').pull;

function testCourierPull () {

    var self            = this;

    // calling super class
    CORE_ORDER_PULL.call(self);

}

UTIL.inherits(testCourierPull, CORE_ORDER_PULL);

testCourierPull.prototype.getRequestUrl = function(){
    /*
        This overrides `getRequestUrl` and returns the value of `settings.Base` from `manifest.json` file.
    */

    var
        self            = this ,
        url             = _.get(self.getSettings(), 'settings.Base');

    return url;
};


module.exports = testCourierPull;
