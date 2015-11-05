
var extname = require('path').extname;
var yaml = require('js-yaml');
var fs = require('fs');

/**
 * Expose `plugin`.
 */

module.exports = plugin;

/**
 * Supported metadata parsers.
 */

var parsers = {
  '.json': JSON.parse,
  '.yaml': yaml.safeLoad,
  '.yml': yaml.safeLoad
};

/**
 * Metalsmith plugin to hide drafts from the output.
 *
 * @param {Object} opts
 * @return {Function}
 */

function plugin(opts){
  opts = opts || {};

  return function(files, metalsmith, done){
    var metadata = metalsmith.metadata();
    var exts = Object.keys(parsers);

    for (var key in opts) {
      var file = opts[key];
      var ext = extname(file);
      if (!~exts.indexOf(ext)) throw new Error('unsupported metadata type "' + ext + '"');
      var filepath = metalsmith.dir + '/' + metalsmith._src + '/' + file;
      var exists = fs.existsSync(filepath);
      if (! exists) throw new Error('file "' + filepath + '" not found');

      var parse = parsers[ext];
      var str = files[file].contents.toString();
      delete files[file];

      try {
        var data = parse(str);
      } catch (e) {
        return done(new Error('malformed data in "' + file + '"'));
      }

      metadata[key] = data;
    }

    done();
  };
}
