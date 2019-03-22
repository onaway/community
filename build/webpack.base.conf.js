var path = require('path')
var utils = require('./utils')
var config = require('../common')
// var config = require('../config')
var vueLoaderConfig = require('./vue-loader.conf')
var glob = require('glob');
var tools = require('./tools')
var webpack = require('webpack')

// var entries = utils.getPathEntry('views');
const yargs = require("yargs");
var envs = yargs.argv.NODE_ENV;
var env = tools.getEnv();
var appName = yargs.argv.app;

var sysPath = path.resolve(__dirname, '../');
var appPath = path.resolve(env.sysPath, './app/' + appName + '/');
// var api_url= path.resolve(env.sysPath, './config/'+appName+'.'+envs+'.js')
var api = path.resolve(env.commonPath, './api/api.js')
var api_url = path.resolve(env.commonPath, './config/' + appName + '.' + envs + '.js')


process.env.NODE_ENV = envs //'prod'
// console.log('appPath:',appPath)
// console.log('api path::',api)
// console.log('env.commonPath::',env.commonPath)
var env = tools.getEnv();
var entries = tools.getEntry('js');
// node/testback/app/webtest/views/home
// console.log('api_url',api_url)
function resolve(dir) {
    return path.join(__dirname, '..', dir)
}
// console.log('config.dev.assetsPublicPath:',config.dev.assetsPublicPath)
// return false;
module.exports = {
    entry: entries,
    output: {
        path: config.build.assetsRoot,
        filename: '[name].js',
        publicPath: process.env.NODE_ENV === 'prod' ?
            config.build.assetsPublicPath :
            config.dev.assetsPublicPath
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            '@': env.appPath,
            'commonapi': api,
            // 'globalconf': api_url
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            jquery: "jquery",
            "window.jQuery": "jquery"
        })
    ],
    module: {
        rules: [{
                test: /\.vue$/,
                loader: 'vue-loader',
                options: vueLoaderConfig
            },
            {
                test: /\.less$/,
                loader: 'style-loader!css-loader!less-loader'
            },
            {
                test: /\.s[a|c]ss$/,
                loader: 'style!css!sass'
            },
            {
                test: /\.js$/,
                use:{
                    loader: 'babel-loader',
                },
                // include: [resolve('src'), resolve('test'), resolve('app')],
                exclude:/node_modules/
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: utils.assetsPath('img/[name].[hash:7].[ext]')
                }
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: utils.assetsPath('media/[name].[hash:7].[ext]')
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
                }
            }
        ]
    }
}