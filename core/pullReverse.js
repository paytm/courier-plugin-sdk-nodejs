/*jshint multistr: true ,node: true*/
"use strict";

var
    /* Node Intenal */
    REQUEST          = require('request'),
    UTIL             = require('util'),

    /* NPM Third Party */
    _                = require('lodash'),

    B                = require('./baseService.js');



function pullRevPlugin() {

    var
        self            = this;

    B.call(self);

}

UTIL.inherits(pullRevPlugin, B);

/*
    Request Opts specific method ::

        * getRequestUrl      -> returns the request url
        * getRequestMethod   -> returns request method(default: POST)
        * getRequestTimeout  -> returns request timeout(default: 30 seconds)
        * getRequestHeaders  -> returns request headers(default: null)
        * getRequestBody     -> returns request body
        * getHttpRequestOpts -> returns a complete Http Request Options using the above functions.
*/

pullRevPlugin.prototype.getRequestUrl = function() {
    /*
        * Extracts `pullRevFetchUrl` key from this.getSettings() by default.
        * Override this to set any other key for returning Url.

    */

    var
        self        = this;

    return _.get(self.getSettings(), 'settings.pullRevFetchUrl');

};

pullRevPlugin.prototype.getRequestMethod = function() {
    /*
        * Extracts `pullRevFetchRequestMethod` key from this.getSettings() by default.
        * Default return value is `GET` if `pullRevFetchRequestMethod` is not found
          in this.getSettings().

    */

    var
        self        = this;

    return _.get(self.getSettings(), 'settings.pullRevFetchRequestMethod', 'GET');

};

pullRevPlugin.prototype.getRequestTimeout = function () {
    /*
        * Extracts `pullRevFetchRequestTimeout` key from this.getSettings() by default.

        * Default return value is 75 seconds if `pullRevFetchRequestTimeout` is not found
          in this.getSettings().

    */

    var
        self        = this;

    return _.get(self.getSettings(), 'settings.pullRevFetchRequestTimeout', 75 * 1000);

};

pullRevPlugin.prototype.getRequestHeaders = function() {
    /*
        * Extracts `pullRevFetchHeaders` key from this.getSettings() by default.

        * Default return value is null.
    */

    var
        self        = this;

    return _.get(self.getSettings(), 'settings.pullRevFetchHeaders', null);

};

pullRevPlugin.prototype.getRequestBody = function(pullRevData) {

    /*
        * Override this function only to set key `body` on reqOpts.
        * By default this function will return null

        * Also `getRequestBody`, `getRequestForm`, `getRequestJson` and `getRequestQueryString`
          are mutually exclusive. At a time only one of them will be overridden and hence one of them
          must return data.

    */

    return null;

};

pullRevPlugin.prototype.getRequestForm = function(pullRevData) {

    /*
        * Override this function only to set key `form` on reqOpts.
        * By default this function will return null

        * Also `getRequestBody`, `getRequestForm`, `getRequestJson` and `getRequestQueryString`
          are mutually exclusive. At a time only one of them will be overridden and hence one of them
          must return data.

    */

    return null;


};

pullRevPlugin.prototype.getRequestJson = function(pullRevData) {

    /*
        * Override this function only to set key `json` on reqOpts.
        * By default this function will return null

        * Also `getRequestBody`, `getRequestForm`, `getRequestJson` and `getRequestQueryString`
          are mutually exclusive. At a time only one of them will be overridden and hence one of them
          must return data.

    */

    return null;

};

pullRevPlugin.prototype.getRequestQueryString = function(pullRevData) {

    /*
        * Override this function only to set key `qs` on reqOpts.
        * By default this function will return null

        * Also `getRequestBody`, `getRequestForm`, `getRequestJson` and `getRequestQueryString`
          are mutually exclusive. At a time only one of them will be overridden and hence one of them
          must return data.

    */

    return null;

};

pullRevPlugin.prototype.getPostHttpExtraOpts = function() {

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

pullRevPlugin.prototype.getHttpRequestOpts = function (callback, pullRevData) {

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

    reqBody = self.getRequestBody(pullRevData);
    if (reqBody) {
        reqOpts.body = reqBody;
    }

    /*
        * Check if there is form for this request
        * If yes, then set the key to reqOpts as `form`
    */

    reqFormData = self.getRequestForm(pullRevData);
    if (reqFormData) {
        reqOpts.form = reqFormData;
    }

    /*
        * Check if there is json for this request
        * If yes, then set the key to reqOpts as `json`
    */

    reqJsonData = self.getRequestJson(pullRevData);
    if (reqJsonData) {
        reqOpts.json = reqJsonData;
    }

    /*
        * Check if there is qs for this request
        * If yes, then set the key to reqOpts as `qs`
    */

    reqQueryString = self.getRequestQueryString(pullRevData);
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


pullRevPlugin.prototype.hitHttpApi = function(pullRevData, reqOpts) {

    /*
        This function will hit shipper to track awbs.
    */

    var
        self            = this;

    /* Log what is being sent over the network */

    self.logger.log('Tracking data reverse flow request sent with reqOpts ' + JSON.stringify(reqOpts));

    REQUEST(reqOpts, self._parseRawHttpResponse.bind(self, pullRevData, reqOpts));

};


pullRevPlugin.prototype.parseHttpResponse = function(pullRevData, error, response, body) {
    /*
        This function decides the flow depending upon the response status code

        If response.statusCode is 200, it will call `updateStatus`
        Else it will call `failurePullFetch`

        Calling `updateStatus` is just to give a complete skeleton to this
        function so that the whole flow can be tested.

    */


    var
        self                = this;

    if( error || (!response) || (response && response.statusCode !== 200) ){

        self.logger.log('Error in fetching tracking data reverse flow at shipper for ' + JSON.stringify(pullRevData) + ', Error ' + error);
        self.failurePullFetch(pullRevData, _.get(response, 'statusCode', null), error);
    }

    if ( !error && response.statusCode === 200 ) {

        self.logger.log('Success in fetching tracking details for reverse flow with ', pullRevData);

        /*
            Here response body should be parsed depending upon the format
        */

        self.updateStatus(pullRevData, body);

    }

};


pullRevPlugin.prototype.failurePullFetch = function(pullRevData, statusCode, error) {
    /*
        Whenever there is a failure, insert data into Es. Response status code should be `0002`.
    */

    var
        self                = this;

   self.trackingComplete(false, pullRevData, statusCode, _.get(error, 'message', null));

};


pullRevPlugin.prototype.updateStatus = function (pullRevData, parsedResponse) {

    /*
        This function is used to extract necessary details from the response.

        This function REQUIRES a parsed response, which means it receives the response
        after it is parsed from json or xml. Hence it becomes the sole responsibility of
        `parseHttpResponse` to parse the response.

    */

    var
        self            = this,
        awb             = null,
        status          = null;

    // parsedResponse should be an array
    if ( _.isArray(parsedResponse) === false )
        parsedResponse  = [parsedResponse];

    parsedResponse.forEach(function(eachData){

        awb             = self.getAwbFromResponse(eachData);
        status          = self.getStatusCodeFromResponse(eachData);

        self.logger.log('Awb : ' + awb + ', Status : ' + status );
    });

    self.trackingComplete(true, pullRevData, 200, parsedResponse);
};

pullRevPlugin.prototype.getAwbFromResponse = function (shipment) {

    var
        self        = this;

    return null;

};

pullRevPlugin.prototype.getStatusCodeFromResponse = function (shipment) {

    var
        self            = this;

    return null;

};


pullRevPlugin.prototype.trackingComplete = function(trackingSuccessful, pullRevData, code, body){

    /*
        This will be the last function called.
    */

    var
        self = this;


    if( trackingSuccessful === true ) {
        self.logger.log('Tracking details for reverse flow successfully fetched' + body);
    } else {
        self.logger.log('Failure in fetching tracking details for reverse' + body);
    }

    self.emit('revTrackingComplete', trackingSuccessful, pullRevData, body);

};

pullRevPlugin.prototype.initContext = function(callback){
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

pullRevPlugin.prototype.initiateTrackingWithShipper = function(pullRevData){


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
            proceed to hit shipper to begin tracking

        */

        self.hitHttpApi(pullRevData, reqOpts);

    }, pullRevData);

};


pullRevPlugin.prototype.pullRevTrackDetails = function(pullRevData){

    var
        self    = this;

    /*
        Initially this used to directly call `getHttpRequestOpts`, but to incorpate
        asynchronous taks into account, like generate headers valid for 1 hours, etc, `initContext`
        is called, and then `getHttpRequestOpts` flow is passed as a callback
    */

    self.initContext(self.initiateTrackingWithShipper.bind(self, pullRevData));

};


module.exports = pullRevPlugin;
