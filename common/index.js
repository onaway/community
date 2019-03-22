// see http://vuejs-templates.github.io/webpack for documentation.
var path = require('path');
const yargs = require("yargs");
var envs = yargs.argv.NODE_ENV;
var appName = yargs.argv.app;
var sysPath = path.resolve(__dirname, '../app/');
var appPath = path.resolve(sysPath, './'+appName+'/');
// var prodPath =path.resolve(sysPath, '../../app/webstatic/'+appName+'/'+envs);
var prodPath =path.resolve(sysPath, '../../node/webstatic/'+appName+'/'+envs);
var assetsRoot = prodPath;
// console.log('appName:', appName)
// console.log('appPath:',appPath)
// console.log('prodPath:',prodPath)
/*
    pathrule:
        app/webstatic/{appName}/{envdir}
    sample
        app/webstatic/clubfront/test
        app/webstatic/clubfront/prod
// console.log('__dirname:',__dirname);
console.log('sysPath:',sysPath)
console.log('appName:', appName)
console.log('appPath:',appPath)

*/
// console.log('appName:', appName)
module.exports = {
  build: {
    env: envs,
    // index: path.resolve(__dirname, '../'+'index.html'),
    assetsRoot: prodPath,
    // assetsRoot: apppath,
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    productionSourceMap: true,
    productionGzip: true,
    productionGzipExtensions: ['js', 'css'],
    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    // bundleAnalyzerReport: process.env.npm_config_report
    bundleAnalyzerReport: false
  },
  dev: {
    env: envs,
    port: 8081,
    host: 'ts.clubfront.flash.ltd',
    autoOpenBrowser: false,
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {},
    cssSourceMap: false
  }
};
