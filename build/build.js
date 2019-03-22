// require('../common/check-versions')()
const yargs = require("yargs");
var envs = yargs.argv.NODE_ENV;
process.env.NODE_ENV = yargs.argv.NODE_ENV //'prod'
var config = require('../common')
// var glob = require('glob');
var ora = require('ora')
var rm = require('rimraf')
var path = require('path')
var chalk = require('chalk')
var webpack = require('webpack')

var webpackConfig = require('./webpack.prod.conf')



var spinner = ora('building for production...')
spinner.start()
// console.log('config:',config.build)
// console.log('webpackConfig:',webpackConfig)
// console.log('config.build.assetsSubDirectory:',config.build.assetsSubDirectory)
// return true;
rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
  if (err) throw err
  webpack(webpackConfig, function (err, stats) {
    spinner.stop()
    if (err) throw err
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n\n')

    console.log(chalk.cyan('  Build complete.\n'))
    console.log(chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n' +
      '  Opening index.html over file:// won\'t work.\n'
    ))
  })
})