/*jshint multistr: true ,node: true*/
"use strict";

var
    /* Node Intenal */
    REQUEST      = require('request'),
    UTIL         = require('util'),

    /* NPM Third Party */
    _            = require('lodash'),

    B           = require('./baseService.js');



function rpcOrderCreationPlugin() {

    var
        self = this;

    B.call(self);

}

UTIL.inherits(rpcOrderCreationPlugin, B);
/*
    Request Opts specific method ::

        * getRequestUrl      -> returns the request url
        * getRequestMethod   -> returns request method(default: POST)
        * getRequestTimeout  -> returns request timeout(default: 30 seconds)
        * getRequestHeaders  -> returns request headers(default: null)
        * getRequestBody     -> returns request body
        * getHttpRequestOpts -> returns a complete Http Request Options using the above functions.
*/


rpcOrderCreationPlugin.prototype.getRequestUrl = function() {
    /*
        * Extracts `settings.createRpcOrderUrl` key from this.getSettings() by default.

        * Override this to set any other key for returning Url.

        * NOTE:: That key should be available in the `manifest.json` file.
    */

    var
        self        = this;

    return _.get(self.getSettings(), 'settings.createRpcOrderUrl');

};

rpcOrderCreationPlugin.prototype.getRequestMethod = function() {
    /*
        * Extracts `settings.createRpcOrderRequestMethod` key from this.getSettings() by default.

        * Default return value is "POST" if `settings.createRpcOrderRequestMethod` is not found
          in this.getSettings().
    */

    var
        self        = this;

    return _.get(self.getSettings(), 'settings.createRpcOrderRequestMethod', 'POST');

};

rpcOrderCreationPlugin.prototype.getRequestTimeout = function () {
    /*
        * Extracts `settings.createRpcOrderRequestTimeout` key from this.getSettings() by default.

        * Default return value is 30 seconds if `settings.createRpcOrderRequestTimeout` is not found
          in this.getSettings().
    */

    var
        self        = this;

    return _.get(self.getSettings(), 'settings.createRpcOrderRequestTimeout', 30 * 1000);

};

rpcOrderCreationPlugin.prototype.getRequestHeaders = function() {
    /*
        * Extracts `settings.createRpcOrderHeaders` key from this.getSettings() by default.

        * Default return value is null.
    */

    var
        self        = this;

    return _.get(self.getSettings(), 'settings.createRpcOrderHeaders', null);

};

rpcOrderCreationPlugin.prototype.getRequestBody = function(rpcOrderCreationData) {

    /*
        * Override this function only to set key `body` on reqOpts.
        * By default this function will return null

        * Also `getRequestBody`, `getRequestJson`, `getRequestQueryString` and `getRequestForm` are mutually exclusive
        * At a time only one of them will be overridden and hence one of them
          must return data.

    */

    return null;

};

rpcOrderCreationPlugin.prototype.getRequestForm = function(rpcOrderCreationData) {

    /*
        * Override this function only to set key `form` on reqOpts.
        * By default this function will return null

        * Also `getRequestBody`, `getRequestJson`, `getRequestQueryString` and `getRequestForm` are mutually exclusive
        * At a time only one of them will be overridden and hence one of them
          must return data.

    */

    return null;

};

rpcOrderCreationPlugin.prototype.getRequestJson = function(rpcOrderCreationData) {

    /*
        * Override this function only to set key `json` on reqOpts.
        * By default this function will return null

        * Also `getRequestBody`, `getRequestJson`, `getRequestQueryString` and `getRequestForm` are mutually exclusive
        * At a time only one of them will be overridden and hence one of them
          must return data.

    */

    return null;

};

rpcOrderCreationPlugin.prototype.getRequestQueryString = function(rpcOrderCreationData) {

    /*
        * Override this function only to set key `json` on reqOpts.
        * By default this function will return null

        * Also `getRequestBody`, `getRequestJson`, `getRequestQueryString` and `getRequestForm` are mutually exclusive
        * At a time only one of them will be overridden and hence one of them
          must return data.

    */

    return null;

};



rpcOrderCreationPlugin.prototype.getPostHttpExtraOpts = function() {

    /*
        * This function will be used when certain additional keys are required
          to be set on the reqOpts, For eg ::

                {
                    json: true
                }

        * By default it will return null, meaning that no extra keys are required
          to be set on the reqOpts.

        * Since it returns a object, `getHttpRequestOpts` will iterate over the keys
          of the returned object and for each key it will set a value in the main
          reqOpts.
    */

    return null;

};

rpcOrderCreationPlugin.prototype.getHttpRequestOpts = function (callback, rpcOrderCreationData) {

    /*
        This function will create request options
        Though this is a function which creates data in a particular format,
        it expects a callback to allow it to easily extend it in future, hence keeping it as async.
        A use case where callback may be required is creating a hash or crypt something.
    */

    var
        self            = this,
        additionalOpts  = null,
        err             = null,
        headers         = null,
        reqBody         = null,
        reqJsonData     = null,
        reqQueryString  = null,
        reqFormData     = null,
        reqOpts         = {
            url             : self.getRequestUrl(),
            method          : self.getRequestMethod(),
            timeout         : self.getRequestTimeout()
        };

    /*
        * Check if there is body for this request
        * If yes, then set the key to reqOpts as `body`

        * NOTE:: At a time, only one of them should be overridden.
    */

    reqBody = self.getRequestBody(rpcOrderCreationData);
    if (reqBody) {
        reqOpts.body = reqBody;
    }

    /*
        * Check if there is form for this request
        * If yes, then set the key to reqOpts as `form`
    */

    reqFormData = self.getRequestForm(rpcOrderCreationData);
    if (reqFormData) {
        reqOpts.form = reqFormData;
    }

    /*
        * Check if there is json for this request
        * If yes, then set the key to reqOpts as `json`
    */

    reqJsonData = self.getRequestJson(rpcOrderCreationData);
    if (reqJsonData) {
        reqOpts.json = reqJsonData;
    }

    /*
        * Check if there is qs for this request
        * If yes, then set the key to reqOpts as `qs`
    */

    reqQueryString = self.getRequestQueryString(rpcOrderCreationData);
    if (reqQueryString) {
        reqOpts.qs = reqQueryString;
    }


    /*
        check if there is header key
    */
    headers = self.getRequestHeaders();
    if (headers){
        reqOpts.headers = headers;
    }

    /*
        * Check if the reqOpts requires some additional Http Opts.
    */

    additionalOpts = self.getPostHttpExtraOpts();

    if (additionalOpts && Object.keys(additionalOpts).length) {

        Object.keys(additionalOpts).forEach(function(addOnKey){

            reqOpts[addOnKey] = additionalOpts[addOnKey];

        });

    }

    return callback(err, reqOpts);

};


rpcOrderCreationPlugin.prototype.hitHttpApi = function(rpcOrderCreationData, reqOpts) {

    /*
        This function will hit shipper to create Order.
    */

    var
        self            = this;

    /* LOG what is being sent over network */
    self.logger.log('Rpc Order create request sent with reqOpts', JSON.stringify(reqOpts));

    REQUEST(reqOpts, self.parseHttpResponse.bind(self, rpcOrderCreationData));

};


rpcOrderCreationPlugin.prototype.parseHttpResponse = function(rpcOrderCreationData, error, response, body) {
    /*
        This function decides the flow depending upon the response status code

        If response.statusCode is 200, it will call `successOrderCreation`
        Else it will call `failureOrderCreation`
    */

    var
        self        = this;

    if( error || (!response) || ( response  && response.statusCode !== 200) ){

        self.failureOrderCreation(rpcOrderCreationData, _.get(response, 'statusCode', null), error);

    }

    if ( !error && response.statusCode === 200 ) {

        self.successOrderCreation(rpcOrderCreationData, response.statusCode, body);

    }

};


rpcOrderCreationPlugin.prototype.failureOrderCreation = function(rpcOrderCreationData, statusCode, error) {

    var self = this;

    self.orderCreationOver(false, rpcOrderCreationData, statusCode, _.get(error, 'message') || error);

};


rpcOrderCreationPlugin.prototype.successOrderCreation = function(rpcOrderCreationData, statusCode, body) {

    var self = this;

    self.orderCreationOver(true, rpcOrderCreationData, statusCode, body);

};


rpcOrderCreationPlugin.prototype.orderCreationOver = function(isOrderSuccessfullyCreated, rpcOrderCreationData, code, body){

    /*
        This will be the last function called.
    */

    var self = this;

    if( isOrderSuccessfullyCreated === true ) {
        self.logger.log('Success in creating rpc order', body);
    } else {
        self.logger.error('Failure in creating rpc order for data ', JSON.stringify(rpcOrderCreationData), ', Error is ' +  body + ', Status code is', code);
    }

    self.emit('rpcOrderCreationComplete', isOrderSuccessfullyCreated, rpcOrderCreationData, body);

};


rpcOrderCreationPlugin.prototype.initContext = function(callback){
    /*
        This function can be used to do any asynchronous task.

        Eg: Need to fetch authorization token from a courier, which is valid for 1 hours.
            Create http opts to be requested at the courier, get the response and set it in the
            plugin context `contextObj`.
    */

    if (callback!==  undefined && typeof callback === 'function'){
        callback();
    }

};


rpcOrderCreationPlugin.prototype.initiateOrderCreation = function(rpcOrderCreationData){

    var
        self        = this;

    /*
        Idea is to call only a single function `getHttpRequestOpts`
        This function will internally handle and create all the required
        attributes on its own.
    */

    self.getHttpRequestOpts(function(error, reqOpts){

        /*
            After the request options are successfully created,
            proceed to hit shipper to initiate cancel

        */

        self.hitHttpApi(rpcOrderCreationData, reqOpts);

    }, rpcOrderCreationData);

};

rpcOrderCreationPlugin.prototype.createRpcOrderInit = function(rpcOrderCreationData){

    var
        self    = this;


    /*
        Initially this used to directly call `getHttpRequestOpts`, but to incorpate
        asynchronous taks into account, like generate headers valid for 1 hours, etc, `initContext`
        is called, and then `getHttpRequestOpts` flow is passed as a callback
    */

    self.initContext(self.initiateOrderCreation.bind(self, rpcOrderCreationData));


};


module.exports = rpcOrderCreationPlugin;
