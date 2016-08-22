/*jshint multistr: true ,node: true*/
"use strict";

var
    /* Node Intenal */
    REQUEST          = require('request'),
    UTIL             = require('util'),

    /* NPM Third Party */
    _                = require('lodash'),

    /* NPM Paytm */
    B                = require('./baseService.js');

function pullPlugin() {

    var
        self            = this;

    B.call(self);

}

UTIL.inherits(pullPlugin, B);

/*
    Request Opts specific method ::

        * getRequestUrl      -> returns the request url
        * getRequestMethod   -> returns request method(default: POST)
        * getRequestTimeout  -> returns request timeout(default: 30 seconds)
        * getRequestHeaders  -> returns request headers(default: null)
        * getRequestBody     -> returns request body
        * getHttpRequestOpts -> returns a complete Http Request Options using the above functions.
*/

pullPlugin.prototype.getRequestUrl = function() {
    /*
        * Extracts `pullFetchUrl` key from this.getSettings() by default.

        * Override this to set any other key for returning Url.

        * NOTE:: That key should be available in the `manifest.json` file.
    */

    var
        self        = this;

    return _.get(self.getSettings(), 'pullFetchUrl');

};

pullPlugin.prototype.getRequestMethod = function() {
    /*
        * Extracts `pullFetchRequestMethod` key from this.getSettings() by default.

        * Default return value is "GET" if `pullFetchRequestMethod` is not found
          in this.getSettings().
    */

    var
        self        = this;

    return _.get(self.getSettings(), 'pullFetchRequestMethod', 'GET');

};

pullPlugin.prototype.getRequestTimeout = function () {
    /*
        * Extracts `pullFetchRequestTimeout` key from this.getSettings() by default.

        * Default return value is 30 seconds if `pullFetchRequestTimeout` is not found
          in this.getSettings().
    */

    var
        self        = this;

    return _.get(self.getSettings(), 'pullFetchRequestTimeout', 30 * 1000);

};

pullPlugin.prototype.getRequestHeaders = function() {
    /*
        * Extracts `pullFetchHeaders` key from this.getSettings() by default.

        * Default return value is null.
    */

    var
        self        = this;

    return _.get(self.getSettings(), 'pullFetchHeaders', null);

};

pullPlugin.prototype.getRequestBody = function(pullData) {

    /*
        * Override this function only to set key `body` on reqOpts.
        * By default this function will return null

        * Also `getRequestBody`, `getRequestForm`, `getRequestJson` and `getRequestQueryString`
          are mutually exclusive. At a time only one of them will be overridden and hence one of them
          must return data.

    */

    return null;

};

pullPlugin.prototype.getRequestForm = function(pullData) {

    /*
        * Override this function only to set key `form` on reqOpts.
        * By default this function will return null

        * Also `getRequestBody`, `getRequestForm`, `getRequestJson` and `getRequestQueryString`
          are mutually exclusive. At a time only one of them will be overridden and hence one of them
          must return data.

    */

    return null;

};

pullPlugin.prototype.getRequestJson = function(pullData) {

    /*
        * Override this function only to set key `json` on reqOpts.
        * By default this function will return null

        * Also `getRequestBody`, `getRequestForm`, `getRequestJson` and `getRequestQueryString`
          are mutually exclusive. At a time only one of them will be overridden and hence one of them
          must return data.

    */

    return null;

};

pullPlugin.prototype.getRequestQueryString = function(pullData) {

    /*
        * Override this function only to set key `qs` on reqOpts.
        * By default this function will return null

        * Also `getRequestBody`, `getRequestForm`, `getRequestJson` and `getRequestQueryString`
          are mutually exclusive. At a time only one of them will be overridden and hence one of them
          must return data.

    */

    return null;

};

pullPlugin.prototype.getPostHttpExtraOpts = function() {

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

pullPlugin.prototype.getHttpRequestOpts = function (callback, pullData) {

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
        reqFormData     = null,
        reqJsonData     = null,
        reqQueryString  = null,
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

    reqBody = self.getRequestBody(pullData);
    if (reqBody) {
        reqOpts.body = reqBody;
    }

    /*
        * Check if there is form for this request
        * If yes, then set the key to reqOpts as `form`
    */

    reqFormData = self.getRequestForm(pullData);
    if (reqFormData) {
        reqOpts.form = reqFormData;
    }

    /*
        * Check if there is json for this request
        * If yes, then set the key to reqOpts as `json`
    */

    reqJsonData = self.getRequestJson(pullData);
    if (reqJsonData) {
        reqOpts.json = reqJsonData;
    }

    /*
        * Check if there is qs for this request
        * If yes, then set the key to reqOpts as `qs`
    */

    reqQueryString = self.getRequestQueryString(pullData);
    if (reqQueryString) {
        reqOpts.qs = reqQueryString;
    }

    /*
        check if there is header key in manifestOpts
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


pullPlugin.prototype.hitHttpApi = function(pullData, reqOpts) {

    /*
        This function will hit shipper to track awbs.
    */

    var
        self            = this;

    /* LOG what is being sent over network */
    self.logger.log('Tracking data request sent with reqOpts', reqOpts);

    REQUEST(reqOpts, self.parseHttpResponse.bind(self, pullData));

};


pullPlugin.prototype.parseHttpResponse = function(pullData, error, response, body) {
    /*
        This function decides the flow depending upon the response status code

        If response.statusCode is 200, it will call `markDelivered`
        Else it will call `failurePullFetch`

        Calling `markDelivered` is just to give a complete skeleton to this
        function so that the whole flow can be tested.
    */


    var
        self        = this;

    if( error || (!response) || (response && response.statusCode !== 200) ){

        self.logger.log('Error in fetching tracking data at shipper for ', pullData);
        self.failurePullFetch(pullData, response.statusCode, error);
    }

    if ( !error && response.statusCode === 200 ) {

        /*
            Here you can call any of the following functions
              * markShipped
              * markDelivered
              * returnPicked
              * returnDelivered
              * rtoInitiated
        */

        self.logger.log('Success in fetching tracking details for ', pullData);
        self.markDelivered(pullData, response.statusCode, body);
    }

};


pullPlugin.prototype.failurePullFetch = function(pullData, statusCode, error) {

    var self = this;

    self.trackingComplete(false, pullData, statusCode, error.message);

};

pullPlugin.prototype.markshipped = function(pullData, statusCode, body) {

    var self = this;

    self.trackingComplete(true, pullData, statusCode, body);

};

pullPlugin.prototype.markDelivered = function(pullData, statusCode, body) {

    var self = this;

    self.trackingComplete(true, pullData, statusCode, body);

};

pullPlugin.prototype.returnPicked = function(pullData, statusCode, body) {

    var self = this;

    self.trackingComplete(true, pullData, statusCode, body);

};

pullPlugin.prototype.returnDelivered = function(pullData, statusCode, body) {

    var self = this;

    self.trackingComplete(true, pullData, statusCode, body);

};

pullPlugin.prototype.rtoInitiated = function(pullData, statusCode, body) {

    var self = this;

    self.trackingComplete(true, pullData, statusCode, body);

};


pullPlugin.prototype.trackingComplete = function(trackingSuccessful, pullData, code, body){

    /*
        This will be the last function called.
    */


    if( trackingSuccessful === true ) {
        self.logger.log('Tracking details successfully fetched', body);
    } else {
        self.logger.log('Failure in in fetching tracking details', body);
    }

    eventEmitter.emit('trackingComplete', trackingSuccessful, pullData, body);

};


pullPlugin.prototype.pullTrackDetails = function(pullData){

    var
        self    = this;

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

        self.hitHttpApi(pullData, reqOpts);

    }, pullData);

};


module.exports = pullPlugin;
