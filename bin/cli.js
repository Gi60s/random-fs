#!/usr/bin/env node
"use strict";
var fs          = require('fs');
var path        = require('path');
var program     = require('commander');
var randomFs    = require('./random-fs');
var readline    = require('readline');

var actionPath;
var rl;

program
    .version('1.0.0')
    .usage('[options] <path>')
    .arguments('<path>')
    .option('-c, --confirm', 'Use this flag to confirm wipe without additional prompt.')
    .option('-d, --depth <n>', 'The maximum depth of sub-directories.', parseInt)
    .option('-n, --number <n>', 'The number of files to create.', parseInt)
    .option('-w, --wipe', 'Wipe the directory before creating new random files.')
    .action(function(filePath) {
        actionPath = path.resolve(process.cwd(), filePath);
    })
    .parse(process.argv);

// if there is no path specified then show the help and exit
if (!actionPath) program.help();

// if there is no wipe request or if we have confirmed wipe then just do it
if (!program.wipe || program.confirm) {
    callRandomFs();
} else {
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question(
        'You are about to completely remove the directory and it\'s contents for: \n' +
        '  ' + actionPath + '\n' +
        '  Confirm directory wipe: (y/N)',
        function(answer) {
            if (/^y/i.test(answer)) {
                callRandomFs();
            } else {
                console.log('Process aborted. No file system changes made.');
            }
            rl.close();
        }
    );
}


function callRandomFs() {
    var config = {};
}

/*

var absPath = path.resolve(process.cwd(), filePath);
var rl;

if (program.wipe && !program.confirm) {
    console.log('You are about to completely remove the directory and it\'s contents for: \n' + absPath);
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Confirm directory wipe: (y/N)', function(answer) {
        if (/^y/i.test(answer))

            console.log('Answer: ' + answer);
        rl.close();
    })
}


console.log(filePath);
console.log(program.confirm);
console.log(program.depth);
console.log(program.number);
console.log(program.wipe);

*/
