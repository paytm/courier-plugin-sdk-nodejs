/*jshint multistr: true ,node: true*/
"use strict";

var
    /* Node Intenal */
    REQUEST                         = require('request'),
    UTIL                            = require('util'),

    /* NPM Third Party */
    _                               = require('lodash'),

    CORE_REV_ORDER_CREATION         = require('../core/index.js').createOrderReverse;

function testRevCourierManifest () {

    var self            = this;

    // calling super class
    CORE_REV_ORDER_CREATION.call(self);

}

UTIL.inherits(testRevCourierManifest, CORE_REV_ORDER_CREATION);

testRevCourierManifest.prototype.getRequestUrl = function(){
    var
        self            = this ,
        url             = _.get(self.getSettings(), 'settings.Base');

    return url;
};

testRevCourierManifest.prototype.getRequestBody = function(manifestData){
    var order           = 'format=json&data="data-here"'
    return order;
};

module.exports = testRevCourierManifest
