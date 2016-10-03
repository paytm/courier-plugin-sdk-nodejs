/*jshint multistr: true ,node: true, mocha:true*/
"use strict";

var
    FS               = require('fs'),

    JSONMINIFY       = require('jsonminify'),

    PLUGIN           = require('../put-plugin-code-here-to-test');


describe('reverseOrder', function() {

    this.timeout(10000);

    it('Should check reverse order creation flow', function(done){

        /* load settings in function we wish to use */
        var
            dummyData        = null,
            manifestFilePath = __dirname + '/../put-plugin-code-here-to-test/manifest.json',
            manifestFileData = null;

        try {
            manifestFileData = JSON.parse(JSONMINIFY(FS.readFileSync(manifestFilePath, 'utf8')));
        } catch (error) {
            console.log("Error in reading/parsing manifest.json file ", error);
        }

        PLUGIN.createOrderReverse.getSettings = function() {
            return manifestFileData;
        };

        PLUGIN.createOrderReverse.contextObj = {};

        PLUGIN.createOrderReverse.on('revOrderCreationComplete', function(isOrderSuccessfullyCreated, orderCreationData, body){
            console.log('Reverse Order Creation complete with flag :: ', isOrderSuccessfullyCreated);
            done();

        });

        /*
            Insert tracking_number here for which you want to check. You can create multiple objects.
        */

        dummyData = [
            {
                tracking_number: ''
            }
        ];

        PLUGIN.createOrderReverse.createRevOrderInit(dummyData);

    });

});


