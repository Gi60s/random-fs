"use strict";
var path        = require('path');
var randomFs    = require('./../bin/random-fs');

var directoryPath = path.resolve(__dirname, 'temp');
randomFs({ path: directoryPath, depth: 3, number: 100, wipe: true })
    .then(function() {
        console.log('done');
        process.exit(0);
    })
    .catch(function(e) {
        console.error(e.stack);
    });
