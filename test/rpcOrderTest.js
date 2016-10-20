/*jshint multistr: true ,node: true, mocha:true*/
"use strict";

var
    FS               = require('fs'),

    JSONMINIFY       = require('jsonminify'),
    SHOULD           = require('should'),

    PLUGIN           = require('../plugin/put-plugin-code-here-to-test');


describe('rpcOrder', function() {

    this.timeout(10000);

    it('Should check rpc order creation flow', function(done){

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

        PLUGIN.createOrderRpc.getSettings = function() {
            return manifestFileData;
        };

        PLUGIN.createOrderRpc.contextObj = {};

        PLUGIN.createOrderRpc.on('rpcOrderCreationComplete', function(isOrderSuccessfullyCreated, rpcOrderCreationData, body){
            console.log('Rpc Order Creation complete with flag :: ', isOrderSuccessfullyCreated);
            SHOULD(isOrderSuccessfullyCreated).be.equal(true);
            done();

        });

        /*
            Insert tracking_number here for which you want to check. You can create multiple objects.
        */

        dummyData =  [{
            "tracking_number": ""
        }]

        PLUGIN.createOrderRpc.createRevOrderInit(dummyData);

    });

});


