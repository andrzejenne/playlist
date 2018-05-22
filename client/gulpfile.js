var gulp = require('gulp');
var fs = require('fs');
require('dotenv').config({path: '../.env'});

function isString(x) {
  return Object.prototype.toString.call(x) === "[object String]"
}

function replaceForEnv(obj) {
  var key;
  // console.info('replaceForEnv', obj);
  for (var p in obj) {
    key = obj[p];
    // console.info(p, key);
    if (isString(key)) {
      if (process.env[key]) {
        obj[p] = process.env[key];
        // console.info('replacing', p);
      }
    }
    else if (Array.isArray(key)) {
      for (var j = 0; i < key.length; j++) {
        replaceForEnv(key[j]);
      }
    }
    else if (typeof key === "object") {
      replaceForEnv(obj[p]);
    }
  }
}

gulp.task('config', function (cb) {
  var jsonStr = fs.readFileSync('./src/config.json').toString();

  if (!jsonStr) {
    console.error('ERROR:', 'invalid config.json');
    return cb();
  }

  if (!process.env.PLATFORM) {
    console.error('ERROR:', 'PLATFORM not defined');
    return cb();
  }

  var platform = process.env.PLATFORM.toUpperCase();

  jsonStr = jsonStr.replace('%PLATFORM%', platform);

  var json = JSON.parse(jsonStr);

  // console.info(process.env);

  replaceForEnv(json);

  // console.info(json);

  fs.writeFile(
    './src/config.ts',
    ['export default ', JSON.stringify(json, null, 2)]
      .join('\n'),
    cb
  );
});

gulp.task('default', ['config']);
