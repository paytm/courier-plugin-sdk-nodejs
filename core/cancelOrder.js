/*jshint multistr: true ,node: true*/
"use strict";

var
    /* Node Intenal */
    REQUEST          = require('request'),
    UTIL             = require('util'),

    /* NPM Third Party */
    _                = require('lodash'),

    B                = require('./baseService.js');



function cancelPlugin() {

    var
        self            = this;

    B.call(self);

}

UTIL.inherits(cancelPlugin, B);

/*
    Request Opts specific method ::

        * getRequestUrl      -> returns the request url
        * getRequestMethod   -> returns request method(default: POST)
        * getRequestTimeout  -> returns request timeout(default: 30 seconds)
        * getRequestHeaders  -> returns request headers(default: null)
        * getRequestBody     -> returns request body
        * getHttpRequestOpts -> returns a complete Http Request Options using the above functions.
*/

cancelPlugin.prototype.getRequestUrl = function() {
    /*
        * Extracts `settings.cancelNotifyUrl` key from this.getSettings() by default.

        * Override this to set any other key for returning Url.

        * NOTE:: That key should be available in the `manifest.json` file.
    */

    var
        self        = this;

    return _.get(self.getSettings(), 'settings.cancelNotifyUrl');

};

cancelPlugin.prototype.getRequestMethod = function() {
    /*
        * Extracts `settings.cancelNotifyRequestMethod` key from this.getSettings() by default.

        * Default return value is "POST" if `settings.cancelNotifyRequestMethod` is not found
          in this.getSettings().
    */

    var
        self        = this;

    return _.get(self.getSettings(), 'settings.cancelNotifyRequestMethod', 'POST');

};

cancelPlugin.prototype.getRequestTimeout = function () {
    /*
        * Extracts `settings.cancelNotifyRequestTimeout` key from this.getSettings() by default.

        * Default return value is 30 seconds if `settings.cancelNotifyRequestTimeout` is not found
          in this.getSettings().
    */

    var
        self        = this;

    return _.get(self.getSettings(), 'settings.cancelNotifyRequestTimeout', 30 * 1000);

};

cancelPlugin.prototype.getRequestHeaders = function() {
    /*
        * Extracts `settings.cancelNotifyHeaders` key from this.getSettings() by default.

        * Default return value is null.
    */

    var
        self        = this;

    return _.get(self.getSettings(), 'settings.cancelNotifyHeaders', null);

};

cancelPlugin.prototype.getRequestBody = function(cancelData) {

    /*
        * Override this function only to set key `body` on reqOpts.
        * By default this function will return null

        * Also `getRequestBody`, `getRequestForm` and `getRequestJson` are mutually
          exclusive. At a time only one of them will be overridden and hence one of them
          must return data.

    */

    return null;

};

cancelPlugin.prototype.getRequestForm = function(cancelData) {

    /*
        * Override this function only to set key `form` on reqOpts.
        * By default this function will return null

        * Also `getRequestBody`, `getRequestForm` and `getRequestJson` are mutually
          exclusive. At a time only one of them will be overridden and hence one of them
          must return data.

    */

    return null;

};

cancelPlugin.prototype.getRequestJson = function(cancelData) {

    /*
        * Override this function only to set key `json` on reqOpts.
        * By default this function will return null

        * Also `getRequestBody`, `getRequestForm` and `getRequestJson` are mutually
          exclusive. At a time only one of them will be overridden and hence one of them
          must return data.

    */

    return null;

};

cancelPlugin.prototype.getRequestQueryString = function(cancelData) {

    /*
        * Override this function only to set key `qs` on reqOpts.
        * By default this function will return null

        * Also `getRequestBody`, `getRequestForm`, `getRequestJson` and `getRequestQueryString`
          are mutually exclusive. At a time only one of them will be overridden and hence one of them
          must return data.

    */

    return null;

};

cancelPlugin.prototype.getPostHttpExtraOpts = function() {

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

cancelPlugin.prototype.getHttpRequestOpts = function (callback, cancelData) {

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

    reqBody = self.getRequestBody(cancelData);
    if (reqBody) {
        reqOpts.body = reqBody;
    }

    /*
        * Check if there is form for this request
        * If yes, then set the key to reqOpts as `form`
    */

    reqFormData = self.getRequestForm(cancelData);
    if (reqFormData) {
        reqOpts.form = reqFormData;
    }

    /*
        * Check if there is json for this request
        * If yes, then set the key to reqOpts as `json`
    */

    reqJsonData = self.getRequestJson(cancelData);
    if (reqJsonData) {
        reqOpts.json = reqJsonData;
    }

    /*
        * Check if there is qs for this request
        * If yes, then set the key to reqOpts as `qs`
    */

    reqQueryString = self.getRequestQueryString(cancelData);
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


cancelPlugin.prototype.hitHttpApi = function(cancelData, reqOpts) {

    /*
        This function will hit shipper to notify Cancel.
    */

    var
        self            = this;

    /* LOG what is being sent over network */
    self.logger.log('Cancel order request sent with reqOpts', reqOpts);

    REQUEST(reqOpts, self.parseHttpResponse.bind(self, cancelData));

};


cancelPlugin.prototype.parseHttpResponse = function(cancelData, error, response, body) {
    /*
        This function decides the flow depending upon the response status code

        If response.statusCode is 200, it will call `successNotifyCancel`
        Else it will call `failureNotifyCancel`
    */

    var
        self        = this;

    if( error || (!response) || (response && response.statusCode !== 200) ){
        self.failureNotifyCancel(cancelData, _.get(response, 'statusCode', null), error);
    }

    if ( !error && response.statusCode === 200 ) {
        self.successNotifyCancel(cancelData, response.statusCode, body);
    }

};


cancelPlugin.prototype.failureNotifyCancel = function(cancelData, statusCode, error) {

    var self = this;

    self.cancelNotificationOver(false, cancelData, statusCode, _.get(error, 'message', null));

};


cancelPlugin.prototype.successNotifyCancel = function(cancelData, statusCode, body) {

    var self = this;

    self.cancelNotificationOver(true, cancelData, statusCode, body);

};


cancelPlugin.prototype.cancelNotificationOver = function(isCancelSuccessfullyNotified, cancelData, code, body){

    /*
        This will be the last function called.
    */

   var self = this;


    if( isCancelSuccessfullyNotified === true ) {
        self.logger.log('Cancel successfully notified', body);
    } else {
        self.logger.error('Cancel notification failed for data ', JSON.stringify(cancelData), ', Error is ' +  body + ', Status code is', code);
    }

    self.emit('cancelNotified', isCancelSuccessfullyNotified, cancelData, body);

};

cancelPlugin.prototype.initContext = function(callback){
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

cancelPlugin.prototype.initiateCancellation = function(cancelData) {

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

        self.hitHttpApi(cancelData, reqOpts);

    }, cancelData);

};


cancelPlugin.prototype.notifyCancel = function(cancelData){

    var
        self    = this;

    /*
        Initially this used to directly call `getHttpRequestOpts`, but to incorpate
        asynchronous taks into account, like generate headers valid for 1 hours, etc, `initContext`
        is called, and then `getHttpRequestOpts` flow is passed as a callback
    */

    self.initContext(self.initiateCancellation.bind(self, cancelData));


};


module.exports = cancelPlugin;
