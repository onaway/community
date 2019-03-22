// require('../common/check-versions')()
const yargs = require("yargs");
var glob = require('glob');
var tools = require('./tools')
var config = require('../common')
var opn = require('opn')
var path = require('path')
var express = require('express')
var webpack = require('webpack')
var proxyMiddleware = require('http-proxy-middleware')
var chalk = require('chalk')
var ora = require('ora')
var envs = yargs.argv.NODE_ENV;
var appName = yargs.argv.app;

var confName = 'dev'; // build or test
var env = tools.getEnv();
var webpackConfig = require('./webpack.test.conf')

// console.log(config.test)


// default port where dev server listens for incoming traffic
var port = process.env.PORT || config[confName].port
// automatically open browser, if not set will be false
var autoOpenBrowser = !!config[confName].autoOpenBrowser
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
var proxyTable = config[confName].proxyTable

var app = express()
// console.log('webpackConfig.output:',webpackConfig)
var compiler = webpack(webpackConfig)

var devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
})

var hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: false,
  heartbeat: 2000
})


// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({ action: 'reload' })
    cb()
  })
})

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
  var options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(options.filter || context, options))
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())
app.use(devMiddleware)
app.use(hotMiddleware)

// serve pure static assets
var staticPath = path.posix.join(config[confName].assetsPublicPath, config[confName].assetsSubDirectory)

app.use(staticPath, express.static('./static/'+env.appName))

var uri = 'http://localhost:' + port

var _resolve
var readyPromise = new Promise(resolve => {
  _resolve = resolve
})

console.log(chalk.cyan('> Starting ' + envs + ' server...\n'))
server(port);
function server(_port){
  var newport = Math.round(Math.random()*100,0)+9000;
  tools.portable(_port,function(portrst,_pt){
      if(portrst === true){
          var uri = 'http://localhost:' + _pt
            devMiddleware.waitUntilValid(() => {
            console.log(chalk.yellow('> Listening at ' + uri + '\n'))
            if (autoOpenBrowser && envs !== 'test') {
              opn(uri)
            }
            _resolve()
          })
          var server = app.listen(_pt)
      }else{
          var uri = 'http://localhost:' + newport
            devMiddleware.waitUntilValid(() => {
            console.log(chalk.yellow('> Listening at ' + uri + '\n'))
            if (autoOpenBrowser && envs !== 'test') {
              opn(uri)
            }
            _resolve()
          })
          var newport = Math.round(Math.random()*100,0)+9000;
          var server = app.listen(newport)
      }
  })
}

module.exports = {
  ready: readyPromise,
  close: () => {
    server.close()
  }
}
