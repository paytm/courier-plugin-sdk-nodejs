/*jshint multistr: true ,node: true*/
"use strict";

var
    /* Node Intenal */
    UTIL                = require('util'),

    /* NPM Third Party */
    _                   = require('lodash'),

    CORE_ORDER_CANCELLATION = require('../../core/index.js').cancelOrder;

function testCourierCancel () {

    var self            = this;

    // calling super class
    CORE_ORDER_CANCELLATION.call(self);

}

UTIL.inherits(testCourierCancel, CORE_ORDER_CANCELLATION);

testCourierCancel.prototype.getRequestUrl = function(){
    var
        self            = this ,
        url             = _.get(self.getSettings(), 'settings.Base');

    return url;
};

testCourierCancel.prototype.getRequestBody = function(cancelData){

    var order           = 'format=json&data="data-here"';
    return order;

};

module.exports = testCourierCancel;
