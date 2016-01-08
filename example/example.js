"use strict";
var path        = require('path');
var randomFs    = require('./../bin/random-fs');

var directoryPath = path.resolve(__dirname, 'temp');
return randomFs({ path: directoryPath, depth: 3, number: 100, wipe: true })
    .then(function(result) {
        summary(result, 'added',   'Added   ');
        summary(result, 'deleted', 'Deleted ');
        summary(result, 'errors',  'Errors  ');
        if (result.deleted.length > 0) console.log('Deleted:\n  ' + result.deleted.join('\n  '));
        console.log('Added:\n  ' + result.added.join('\n  '));
        if (result.errors.length > 0) console.error('Errors:\n  ' + result.errors.join('\n  '));
    })
    .catch(function(e) {
        console.error(e.stack);
    })
    .finally(function() {
        process.exit(0);
    })
;

function summary(data, key, prefix) {
    var str = prefix + ' ';
    str += countType(data[key], 'FILE') + ' files / ';
    str += countType(data[key], 'DIR') + ' directories.';
    console.log(str);
}

function countType(data, type) {
    return data
        .filter(function(log) {
            return log.indexOf('[' + type + ']') === 0;
        })
        .length;
}