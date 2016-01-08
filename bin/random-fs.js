"use strict";
var fs              = require('./fs-promise');
var loremIpsum      = require('lorem-ipsum');
var path            = require('path');
var randomString    = require('randomstring');
var randomWord      = require('random-word');
var schemata        = require('object-schemata');

module.exports = makeRandomFileStructure;


var rfsSchema = schemata({
  depth: {
    description: 'The deepest number of sub-directories to create.',
    defaultValue: 2,
    help: 'This must be a non-negative number.',
    transform: Math.round,
    validate: nonNegative
  },
  number: {
    description: 'The number of files to generate.',
    defaultValue: 25,
    help: 'This must be a non-negative number.',
    transform: Math.round,
    validate: nonNegative
  },
  path: {
    description: 'The directory where the random file structure should be stored.',
    help: 'This must be a string.',
    validate: function(value, is) {
      return is.string(value) && value;
    },
    required: true
  },
  wipe: {
    description: 'Whether to wipe the current file structure at that directory.',
    defaultValue: false,
    transform: function(value) {
      return !!value;
    }
  }
});

// add a file at the specified path
function addFile(filepath, content) {
  var dirPath = path.dirname(filepath);
  return mkdir(dirPath)
    .then(function() {
      return fs.writeFileAsync(filepath, content, 'utf8');
    })
    .then(function() {
      console.log('Wrote file: ' + filepath);
    })
    .catch(function(e) {
      console.error('Could not add file: ' + filepath + '\n' + e.stack);
    });
}

function makeRandomFileStructure(configuration) {
  var config = rfsSchema.normalize(configuration);
  var promise = config.wipe ? rmdir(config.path) : Promise.resolve();

  return promise
    .catch(function(e) {
      if (e.code === 'ENOENT' && e.errno === -2) return;
      console.error('Could not wipe directory: ' + config.path + '\n' + e.stack);
    })
    .then(function() {
      var ar;
      var content;
      var depth;
      var directories = {};
      var dirPath;
      var filepath;
      var i;
      var index;
      var j;
      var name;
      var promise;
      var promises = [];

      for (i = 0; i < config.number; i++) {
        depth = Math.round(Math.random() * config.depth);

        //generate the directory path
        dirPath = [];
        for (j = 0; j < depth; j++) {
          if (directories.hasOwnProperty('' + j)) {
            ar = directories['' + j];
            index = Math.ceil(Math.random() * ar.length);
            if (index === ar.length) {
              name = randomName(2);
              ar.push(name);
            } else {
              name = ar[index];
            }
          } else {
            name = randomName(2);
            directories['' + j] = [name];
          }
          dirPath.push(name);
        }
        dirPath = dirPath.join(path.sep);

        //generate content
        content = loremIpsum({
          count: Math.round(Math.random() * 15) + 3,
          units: 'paragraphs'
        });

        //generate the file path
        filepath = path.resolve(process.cwd(), config.path, dirPath, randomName(2)) + '.' +
            randomString.generate({ length: Math.ceil(Math.random() * 2) + 1, charset: 'alphabetic' }).toLowerCase();

        //write the file
        //console.log(filepath);
        promise = addFile(filepath, content)
            .catch(function(e) {
              console.error(e.stack);
            });
        promises.push(promise);
      }

      return Promise.all(promises);

    });
}

// make a directory and it's sub directories
function mkdir(filepath) {
  return fs.mkdirAsync(filepath)
    .catch(function(e) {
      if (e.code === 'EEXIST' && e.errno === -17) return;
      if (e.code === 'ENOENT' && e.errno === -2) {
        return mkdir(path.dirname(filepath))
            .then(function() {
              return fs.mkdirAsync(filepath)
            })
            .catch(function(e) {
              if (e.code === 'EEXIST') return;
              throw e;
            });
      }
      console.error(e.code, e.errno);
      throw e;
    });
}

function nonNegative(value, is) {
  return !is.nan(value) && is.number(value) && value >= 0;
}

// get a random name
function randomName(wordCount) {
  var result = [];
  while (wordCount-- > 0) {
    result.push(randomWord());
  }
  return result.join('-');
}

// remove a directory and all of its contents
function rmdir(filepath) {
  return fs.readdirAsync(filepath)
    .then(function(filepaths) {
      var promises = [];
      filepaths.forEach(function(fp) {
        var absPath = path.resolve(filepath, fp);
        var promise = fs.statAsync(absPath)
          .then(function(stat) {
            if (stat.isDirectory()) {
              return rmdir(absPath);
            } else {
              return fs.unlinkAsync(absPath);
            }
          })
          .then(function() {
            console.log('Deleted: ' + absPath);
          });
        promises.push(promise);
      });
      return Promise.all(promises)
        .then(function() {
          return fs.rmdir(filepath);
        })
        .then(function() {
          console.log('Deleted: ' + filepath);
        });
    });
}
