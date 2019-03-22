var utils = require('./utils')
var webpack = require('webpack')
// var config = require('../config')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
var yargs = require("yargs");
var envs = yargs.argv.NODE_ENV;
var tools = require('./tools')
var env = tools.getEnv();
// console.log('baseWebpackConfig:',baseWebpackConfig);


// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach(function (name) {
  baseWebpackConfig.entry[name] = ['./common/dev-reload'].concat(baseWebpackConfig.entry[name])
});
// console.log('baseWebpackConfig.entry-------------------------------------->')
// console.log(baseWebpackConfig.entry)
// console.log('baseWebpackConfig.entry-------------------------------------->')

// var entrys = utils.entryPlug('views',baseWebpackConfig.entry);
var entrys = tools.getEntryPlug(baseWebpackConfig.entry);
var plugins = new Array();
plugins.push(new webpack.DefinePlugin({
            'process.env': {NODE_ENV:'"'+envs+'"'}
          }))
plugins.push(new webpack.HotModuleReplacementPlugin())
plugins.push(new webpack.NoEmitOnErrorsPlugin())
plugins.push(new FriendlyErrorsPlugin())
for(var i in entrys){
  plugins.push(new HtmlWebpackPlugin(entrys[i]));
}
module.exports = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: false })
  },
  devtool: '#cheap-module-eval-source-map',
  plugins: plugins
})
