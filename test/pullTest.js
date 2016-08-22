/*jshint multistr: true ,node: true*/
"use strict";

var
    FS               = require('fs'),
    REQUEST          = require('request'),

    _                = require('lodash'),
    JSONMINIFY       = require('jsonminify'),

    PLUGIN           = require('../put-plugin-code-here-to-test');


describe('Track', function() {
    
    it('Should call pullTrackDetails function and fetch tracking details', function(done){

        /* load settings in function we wish to use */
        var
            manifestFilePath = __dirname + '/../put-plugin-code-here-to-test/manifest.json',
            eventEmitter     = null,
            manifestFileData = null ;

        try {
            manifestFileData = JSON.parse(JSONMINIFY(FS.readFileSync(manifestFilePath, 'utf8')));
        } catch (error) {
            console.log("Error in reading/parsing manifest.json file ", error);
        }

        PLUGIN.pull.getSettings = function() {
            return manifestFileData;
        };


        PLUGIN.pull.on('trackingComplete', function(trackingSuccessful, pullData, body){
            console.log('Tracking details fetched with flag :: ', trackingSuccessful);
            done();

        });

        PLUGIN.pull.pullTrackDetails();

    });
       
});


