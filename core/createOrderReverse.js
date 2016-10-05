/*jshint multistr: true ,node: true*/
"use strict";

var
    /* Node Intenal */
    REQUEST      = require('request'),
    UTIL         = require('util'),

    /* NPM Third Party */
    _            = require('lodash'),

    B           = require('./baseService.js');



function revOrderCreationPlugin() {

    var
        self = this;

    B.call(self);

}

UTIL.inherits(revOrderCreationPlugin, B);
/*
    Request Opts specific method ::

        * getRequestUrl      -> returns the request url
        * getRequestMethod   -> returns request method(default: POST)
        * getRequestTimeout  -> returns request timeout(default: 30 seconds)
        * getRequestHeaders  -> returns request headers(default: null)
        * getRequestBody     -> returns request body
        * getHttpRequestOpts -> returns a complete Http Request Options using the above functions.
*/


revOrderCreationPlugin.prototype.getRequestUrl = function() {
    /*
        * Extracts `settings.createRevOrderUrl` key from this.getSettings() by default.

        * Override this to set any other key for returning Url.

        * NOTE:: That key should be available in the `manifest.json` file.
    */

    var
        self        = this;

    return _.get(self.getSettings(), 'settings.createRevOrderUrl');

};

revOrderCreationPlugin.prototype.getRequestMethod = function() {
    /*
        * Extracts `settings.createRevOrderRequestMethod` key from this.getSettings() by default.

        * Default return value is "POST" if `settings.createRevOrderRequestMethod` is not found
          in this.getSettings().
    */

    var
        self        = this;

    return _.get(self.getSettings(), 'settings.createRevOrderRequestMethod', 'POST');

};

revOrderCreationPlugin.prototype.getRequestTimeout = function () {
    /*
        * Extracts `settings.createRevOrderRequestTimeout` key from this.getSettings() by default.

        * Default return value is 30 seconds if `settings.createRevOrderRequestTimeout` is not found
          in this.getSettings().
    */

    var
        self        = this;

    return _.get(self.getSettings(), 'settings.createRevOrderRequestTimeout', 30 * 1000);

};

revOrderCreationPlugin.prototype.getRequestHeaders = function() {
    /*
        * Extracts `settings.createRevOrderHeaders` key from this.getSettings() by default.

        * Default return value is null.
    */

    var
        self        = this;

    return _.get(self.getSettings(), 'settings.createRevOrderHeaders', null);

};

revOrderCreationPlugin.prototype.getRequestBody = function(revOrderCreationData) {

    /*
        * Override this function only to set key `body` on reqOpts.
        * By default this function will return null

        * Also `getRequestBody`, `getRequestJson`, `getRequestQueryString` and `getRequestForm` are mutually exclusive
        * At a time only one of them will be overridden and hence one of them
          must return data.

    */

    return null;

};

revOrderCreationPlugin.prototype.getRequestForm = function(revOrderCreationData) {

    /*
        * Override this function only to set key `form` on reqOpts.
        * By default this function will return null

        * Also `getRequestBody`, `getRequestJson`, `getRequestQueryString` and `getRequestForm` are mutually exclusive
        * At a time only one of them will be overridden and hence one of them
          must return data.

    */

    return null;

};

revOrderCreationPlugin.prototype.getRequestJson = function(revOrderCreationData) {

    /*
        * Override this function only to set key `json` on reqOpts.
        * By default this function will return null

        * Also `getRequestBody`, `getRequestJson`, `getRequestQueryString` and `getRequestForm` are mutually exclusive
        * At a time only one of them will be overridden and hence one of them
          must return data.

    */

    return null;

};

revOrderCreationPlugin.prototype.getRequestQueryString = function(revOrderCreationData) {

    /*
        * Override this function only to set key `json` on reqOpts.
        * By default this function will return null

        * Also `getRequestBody`, `getRequestJson`, `getRequestQueryString` and `getRequestForm` are mutually exclusive
        * At a time only one of them will be overridden and hence one of them
          must return data.

    */

    return null;

};



revOrderCreationPlugin.prototype.getPostHttpExtraOpts = function() {

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

revOrderCreationPlugin.prototype.getHttpRequestOpts = function (callback, revOrderCreationData) {

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

    reqBody = self.getRequestBody(revOrderCreationData);
    if (reqBody) {
        reqOpts.body = reqBody;
    }

    /*
        * Check if there is form for this request
        * If yes, then set the key to reqOpts as `form`
    */

    reqFormData = self.getRequestForm(revOrderCreationData);
    if (reqFormData) {
        reqOpts.form = reqFormData;
    }

    /*
        * Check if there is json for this request
        * If yes, then set the key to reqOpts as `json`
    */

    reqJsonData = self.getRequestJson(revOrderCreationData);
    if (reqJsonData) {
        reqOpts.json = reqJsonData;
    }

    /*
        * Check if there is qs for this request
        * If yes, then set the key to reqOpts as `qs`
    */

    reqQueryString = self.getRequestQueryString(revOrderCreationData);
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


revOrderCreationPlugin.prototype.hitHttpApi = function(revOrderCreationData, reqOpts) {

    /*
        This function will hit shipper to create Order.
    */

    var
        self            = this;

    /* LOG what is being sent over network */
    self.logger.log('Reverse Order create request sent with reqOpts', JSON.stringify(reqOpts));

    REQUEST(reqOpts, self.parseHttpResponse.bind(self, revOrderCreationData));

};


revOrderCreationPlugin.prototype.parseHttpResponse = function(revOrderCreationData, error, response, body) {
    /*
        This function decides the flow depending upon the response status code

        If response.statusCode is 200, it will call `successOrderCreation`
        Else it will call `failureOrderCreation`
    */

    var
        self        = this;

    if( error || (!response) || ( response  && response.statusCode !== 200) ){

        self.failureOrderCreation(revOrderCreationData, _.get(response, 'statusCode', null), error);

    }

    if ( !error && response.statusCode === 200 ) {

        self.successOrderCreation(revOrderCreationData, response.statusCode, body);

    }

};


revOrderCreationPlugin.prototype.failureOrderCreation = function(revOrderCreationData, statusCode, error) {

    var self = this;

    self.orderCreationOver(false, revOrderCreationData, statusCode, error.message);

};


revOrderCreationPlugin.prototype.successOrderCreation = function(revOrderCreationData, statusCode, body) {

    var self = this;

    self.orderCreationOver(true, revOrderCreationData, statusCode, body);

};


revOrderCreationPlugin.prototype.orderCreationOver = function(isOrderSuccessfullyCreated, revOrderCreationData, code, body){

    /*
        This will be the last function called.
    */

    var self = this;

    if( isOrderSuccessfullyCreated === true ) {
        self.logger.log('Success in creating reverse order', body);
    } else {
        self.logger.error('Failure in creating reverse order for data ', JSON.stringify(revOrderCreationData), ', Error is ' +  body + ', Status code is', code);
    }

    self.emit('revOrderCreationComplete', isOrderSuccessfullyCreated, revOrderCreationData, body);

};


revOrderCreationPlugin.prototype.initContext = function(callback){
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


revOrderCreationPlugin.prototype.initiateOrderCreation = function(revOrderCreationData){

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

        self.hitHttpApi(revOrderCreationData, reqOpts);

    }, revOrderCreationData);

};

revOrderCreationPlugin.prototype.createRevOrderInit = function(revOrderCreationData){

    var
        self    = this;


    /*
        Initially this used to directly call `getHttpRequestOpts`, but to incorpate
        asynchronous taks into account, like generate headers valid for 1 hours, etc, `initContext`
        is called, and then `getHttpRequestOpts` flow is passed as a callback
    */

    self.initContext(self.initiateOrderCreation.bind(self, revOrderCreationData));


};


module.exports = revOrderCreationPlugin;
