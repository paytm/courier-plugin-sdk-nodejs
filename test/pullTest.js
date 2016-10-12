/*jshint multistr: true ,node: true, mocha:true*/
"use strict";

var
    FS               = require('fs'),

    JSONMINIFY       = require('jsonminify'),
    SHOULD           = require('should'),

    PLUGIN           = require('../plugin/put-plugin-code-here-to-test');


describe('Pull', function() {

    this.timeout(10000);

    it('Should check forward tracking flow', function(done){

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

        PLUGIN.pull.getSettings = function() {
            return manifestFileData;
        };

        PLUGIN.pull.contextObj = {};

        PLUGIN.pull.on('trackingComplete', function(trackingSuccessful, pullData, body){
            console.log('Tracking details fetched with flag :: ', trackingSuccessful);
            SHOULD(trackingSuccessful).be.equal(true);
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

        PLUGIN.pull.pullTrackDetails(dummyData);

    });

});


