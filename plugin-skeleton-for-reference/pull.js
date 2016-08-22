/*jshint multistr: true ,node: true*/
"use strict";

var
    /* Node Intenal */
    REQUEST             = require('request'),
    UTIL                = require('util'),

    /* NPM Third Party */
    _                   = require('lodash'),

    CORE_ORDER_CREATION = require('../core/index.js').pull;

function testCourierPull () {

    var self            = this;

    // calling super class
    CORE_ORDER_CREATION.call(self);

}

UTIL.inherits(testCourierPull, CORE_ORDER_CREATION);

module.exports = testCourierPull