var path = require('path')
var config = require('../common')
var glob = require('glob');
var ExtractTextPlugin = require('extract-text-webpack-plugin')

exports.assetsPath = function (_path) {
  var assetsSubDirectory = process.env.NODE_ENV === 'prod'
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory
  return path.posix.join(assetsSubDirectory, _path)
}
var getEntry = function (entryPathName) {
  var globPath = './src/'+entryPathName+'/**/*.html';
  var entries = {},
    basename, tmp, pathname;
  glob.sync(globPath).forEach(function (entry) {
    basename = path.basename(entry, path.extname(entry));
    tmp = entry.split('/')
    tmp.shift()
    tmp.shift()
    tmp.shift()
    // console.log('tmp1:', tmp)
    // tmp = tmp.splice(-3);
    // pathname = tmp.splice(0, 1) + '/' + basename; // 正确输出js和html的路径
    tmp.pop()
    pathname = tmp.join('/')
    if(pathname===''){
      pathname = 'index'
    }
    entries[pathname] = entry;
  });
  // entries['app'] = 'main.js';
  // console.log('entries:', entries)
  return entries;
}
exports.entryPlug = function (path,modulesentry) {
  var entrys = getEntry(path)
  var pages = entrys
  var PathConfig = new Array();
  for (var pathname in pages) {
    // 配置生成的html文件，定义路径等
    // if(pathname==''){
    //   pathname='index'
    // }
    var conf = {
      filename: pathname + '.html',
      template: pages[pathname],   // 模板路径
      inject: true              // js插入位置
    };

    // console.log('conf',conf)
    if (pathname in modulesentry) {
      conf.chunks = ['manifest', 'vendor',pathname];
      conf.hash = true;
    }
    // console.log('conf', conf)
    // module.exports.plugins.push(new HtmlWebpackPlugin(conf));
    PathConfig.push(conf);
  }
  // console.log('plug:',PathConfig)
  return PathConfig;
}
// var pages = getEntry('./src/views/**/*.html');
exports.getPathEntry = function (entryPathName) {
  var globPath = './src/'+entryPathName+'/**/*.js';
  var entries = {},
    basename, tmp, pathname;
  glob.sync(globPath).forEach(function (entry) {
    basename = path.basename(entry, path.extname(entry));
    tmp = entry.split('/')
    tmp.shift()
    tmp.shift()
    tmp.shift()
    // console.log('tmp1:', tmp)
    // tmp = tmp.splice(-3);
    // pathname = tmp.splice(0, 1) + '/' + basename; // 正确输出js和html的路径
    tmp.pop()
    pathname = tmp.join('/')
    if(pathname===''){
      pathname = 'index'
    }
    entries[pathname] = entry;
  });
  // entries['app'] = 'main.js';
  // console.log('entries:', entries)
  return entries;
}

exports.cssLoaders = function (options) {
  options = options || {}

  var cssLoader = {
    loader: 'css-loader',
    options: {
      minimize: process.env.NODE_ENV === 'production',
      sourceMap: options.sourceMap
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders (loader, loaderOptions) {
    var loaders = [cssLoader]
    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: 'vue-style-loader'
      })
    } else {
      return ['vue-style-loader'].concat(loaders)
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  var output = []
  var loaders = exports.cssLoaders(options)
  for (var extension in loaders) {
    var loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }
  return output
}
