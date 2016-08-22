/*jshint multistr: true ,node: true*/
"use strict";

var
    FS               = require('fs'),
    REQUEST          = require('request'),

    _                = require('lodash'),
    JSONMINIFY       = require('jsonminify'),

    PLUGIN           = require('../put-plugin-code-here-to-test');


describe('Order Creation', function() {
    
    it('Should call createOrder function and create a manifest', function(done){

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

        PLUGIN.createOrder.getSettings = function() {
            return manifestFileData;
        };


        PLUGIN.createOrder.on('manifestOver', function(isManifestSuccess, manifestData, body){
            console.log('Order Creation successful flag :: ', isManifestSuccess);
            done();

        });

        PLUGIN.createOrder.createOrderInit();

    });
       
});


