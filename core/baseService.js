/*jshint multistr: true ,node: true*/
"use strict";

var
    /* Node Intenal */
    EVENTEMITTER = require('events').EventEmitter,
    UTIL         = require('util');

function baseService() {

    var
        self = this;

    self.logger = console;

    EVENTEMITTER.call(self);
}

UTIL.inherits(baseService, EVENTEMITTER);


module.exports = baseService;