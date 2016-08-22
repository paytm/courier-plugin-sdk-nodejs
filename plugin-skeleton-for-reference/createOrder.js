/*jshint multistr: true ,node: true*/
"use strict";

var
    /* Node Intenal */
    REQUEST             = require('request'),
    UTIL                = require('util'),

    /* NPM Third Party */
    _                   = require('lodash'),

    CORE_ORDER_CREATION = require('../core/index.js').createOrder;

function testCourierManifest () {

    var self            = this;

    // calling super class
    CORE_ORDER_CREATION.call(self);

}

UTIL.inherits(testCourierManifest, CORE_ORDER_CREATION);

testCourierManifest.prototype.getRequestUrl = function(){
    var
        self            = this ,
        url             = _.get(self.getSettings(), 'settings.Base');

    return url;
};

testCourierManifest.prototype.getRequestBody = function(manifestData){
    var order           = 'format=json&data="data-here"'
    return order;
};

module.exports = testCourierManifest