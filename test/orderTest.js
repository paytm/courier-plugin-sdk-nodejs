/*jshint multistr: true ,node: true, mocha:true*/
"use strict";

var
    FS               = require('fs'),

    JSONMINIFY       = require('jsonminify'),
    SHOULD           = require('should'),

    PLUGIN           = require('../plugin/put-plugin-code-here-to-test');


describe('forwardOrder', function() {

    this.timeout(10000);

    it('Should check forward order creation flow', function(done){

        /* load settings in function we wish to use */
        var
            dummyData        = null,
            manifestFilePath = __dirname + '/../plugin/put-plugin-code-here-to-test/manifest.json',
            manifestFileData = null;

        try {
            manifestFileData = JSON.parse(JSONMINIFY(FS.readFileSync(manifestFilePath, 'utf8')));
        } catch (error) {
            console.log("Error in reading/parsing manifest.json file ", error);
        }

        PLUGIN.createOrder.getSettings = function() {
            return manifestFileData;
        };

        PLUGIN.createOrder.contextObj = {};

        PLUGIN.createOrder.on('orderCreationComplete', function(isOrderSuccessfullyCreated, orderCreationData, body){
            console.log('Order Creation complete with flag :: ', isOrderSuccessfullyCreated, 'body :: ', body);
            SHOULD(isOrderSuccessfullyCreated).be.equal(true);
            done();

        });

        /*
            Insert tracking_number here for which you want to check. You can create multiple objects.
        */

        dummyData = {
                tracking_number: ''
        };

        PLUGIN.createOrder.createOrderInit(dummyData);

    });

});


