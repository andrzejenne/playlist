var webpack = require('./node_modules/@ionic/app-scripts/dist/webpack');
var watch = require('./node_modules/@ionic/app-scripts/dist/watch');
var copy = require('./node_modules/@ionic/app-scripts/dist/copy');
var copyConfig = require('./node_modules/@ionic/app-scripts/config/copy.config');

// this is a custom dictionary to make it easy to extend/override
// provide a name for an entry, it can be anything such as 'srcFiles' or 'copyConfig'
// then provide an object with the paths, options, and callback fields populated per the Chokidar docs
// https://www.npmjs.com/package/chokidar

// delay to let the lib's build complete

const DELAY_IN_SEC = 5;
let nextRefreshHandle;
// let myLinkedLibs = ['{{SRC}}/../my-lib/*']
let allPaths = ['{{SRC}}/**/*.(ts|html|s(c|a)ss)']; //.join(myLinkedLibs);

module.exports = {
  srcFiles: {
    paths: allPaths,
    options: { ignored: ['{{SRC}}/**/*.spec.ts', '{{SRC}}/**/*.e2e.ts', '**/*.DS_Store', '{{SRC}}/index.html'] },
    callback: (event, path, context) => {
      if (nextRefreshHandle) {
        clearTimeout(nextRefreshHandle);
        nextRefreshHandle = null;
      }

      // If the modification happens in the project itself
      if (path && path.indexOf('/node_modules') === -1) {
        return watch.buildUpdate(event, path, context);
      }
      
      console.log(`reloading in ${DELAY_IN_SEC} secs from now...`)

      return new Promise((resolve, reject) => {
        nextRefreshHandle = setTimeout(() => {
          nextRefreshHandle = null;

          let config = webpack.getWebpackConfig(context, './webpack.config.js');
          webpack.runWebpackFullBuild(config)
            .then(res =>{
              // I'm not sure if that would be required or not, but it would perform a full rebuild from
              // what I've read
              // context.transpileState = 'RequiresBuild';
              return watch.buildUpdate(event, path, context);
            })
            .then(res => {
              resolve(true)
            })
            .catch(reject);

        }, DELAY_IN_SEC * 1000)
      });
    }
  },
  copyConfig: copy.copyConfigToWatchConfig()
};