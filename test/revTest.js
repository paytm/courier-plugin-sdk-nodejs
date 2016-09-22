/*jshint multistr: true ,node: true, mocha:true*/
"use strict";

var
    FS               = require('fs'),

    JSONMINIFY       = require('jsonminify'),

    PLUGIN           = require('../put-plugin-code-here-to-test');


describe('reversePull', function() {

    this.timeout(10000);

    it('Should check reverse tracking flow', function(done){

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

        PLUGIN.pull.getSettings = function() {
            return manifestFileData;
        };


        PLUGIN.pull.on('revTrackingComplete', function(trackingSuccessful, pullRevData, body){
            console.log('Reverse Tracking details fetched with flag :: ', trackingSuccessful);
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

        PLUGIN.pullReverse.pullRevTrackDetails(dummyData);

    });

});


