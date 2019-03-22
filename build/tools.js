var glob = require('glob')
var path = require('path')
var net  = require('net')
const yargs = require("yargs");
var ExtractTextPlugin = require('extract-text-webpack-plugin')

var getRoutes  = function (appName) {
  var globPath = './app/'+appName+'/routes/**/*.vue';
  var routes = new Array(),basename, tmp, pathname;
  var basePath = './app/'+appName+'/routes';
  glob.sync(globPath).forEach(function (entry) {
    basename = path.basename(entry, path.extname(entry));
    newentry = entry.replace('.vue',"");
    tmp = newentry.split('/')
    tmp.shift()
    tmp.shift()
    tmp.shift()
    tmp.shift()
    let pathInfo = new Object();
    pathInfo.pathName = '/'+tmp.join('/');
    getMainRoute(appName,entry)
    pathInfo.Name = tmp.join('-');
    pathInfo.component = '@/routes'+pathInfo.pathName+'.vue'; //import('@/routes/'+pathInfo.pathName+'.vue')
    routes.push(pathInfo);
  });
  return routes;
}

var getMainRoute = function (appName,pathName) {
  var basePath = './app/'+appName+'/routes'+pathName;
  // var globPath = basePath+'.vue';
  console.log('pathName:',pathName)
  var globPath = basePath+pathName+'.vue';
  // console.log('mainRoute path::',basePath, ' pathName:', pathName)
  // console.log('globPath:',globPath)
  // glob.sync(globPath).forEach(function (entry) {
  //   console.log('MAIN entry:',entry)
  //   if(entry){
  //   }
  // });
}

var getChildRoute = function (pathName) {
  glob.sync(globPath).forEach(function (entry) {
    
  });
}



const count = function (obj) {
  let cnt = 0
  for(let i in obj){
    cnt++
  }
  return cnt
}
const getEnv = function () {
	var params = new Object();
	params.envs = yargs.argv.NODE_ENV;
	params.appName = yargs.argv.app;
	params.sysPath = path.resolve(__dirname, '../');
	params.appPath = path.resolve(params.sysPath, './app/'+params.appName+'/');
    // params.prodPath =path.resolve(params.sysPath, '../app/webstatic/'+params.appName+'/'+params.envs);
    params.prodPath =path.resolve(params.sysPath, './node/webstatic/'+params.appName+'/'+params.envs);
    
  params.commonPath = path.resolve(params.sysPath, './app/common/');
  // console.log('PARAMS:',params);
	return params
}

var getin = function(arguments) {
	// var ins = process.argv.splice(2);
	ins = arguments
	var arg = new Object();
	for(var i in ins){
		var tmp = ins[i]
		tmp = tmp.replace('--','')
		var envs = tmp.split('=')
		if(count(envs)>=2){
			arg[envs[0]] = envs[1]
		}
	}
	return arg;
}

var setProcessEnv = function (params) {
	for(var i in params){
		process.env[i] = params[i]
	}
}

const getEntry = function (extName) {
  var env = getEnv()
  var appName = env.appName
	// var globPath = './src/'+entryPathName+'/**/*.js';
  var globPath = './app/' + appName + '/views/**/*.' + extName;
  // console.log('globpath: ',globPath)
  var entries = {},
    basename, tmp, pathname;
  glob.sync(globPath).forEach(function (entry) {
    basename = path.basename(entry, path.extname(entry));
    tmp = entry.split('/')
    tmp.shift()
    tmp.shift()
    tmp.shift()
    tmp.shift()
    tmp.pop()
    // tmp.pop()
    pathname = tmp.join('/')
    if(pathname===''){
      pathname = 'index'
    }
    entries[pathname] = entry;
  });
  return entries;
}

var getEntryPlug = function (modulesentry) {
  var entrys = getEntry('html')
  var pages = entrys
  var PathConfig = new Array();
  for (var pathname in pages) {
    var conf = {
      filename: pathname + '.html',
      template: pages[pathname],   // 模板路径
      inject: true              // js插入位置
    };
    if (pathname in modulesentry) {
      conf.chunks = ['manifest', 'vendor',pathname];
      conf.hash = true;
    }
    PathConfig.push(conf);
  }
  return PathConfig;
}

var probe = function (port, callback) {
    var server = net.createServer().listen(port)
    var calledOnce = false
    var timeoutRef = setTimeout(function () {
        calledOnce = true
        callback(false,port)
    }, 2000)
    timeoutRef.unref()
    var connected = false
    server.on('listening', function() {
        clearTimeout(timeoutRef)
        if (server)
            server.close()
        if (!calledOnce) {
            calledOnce = true
            callback(true,port)
        }
    })

    server.on('error', function(err) {
        clearTimeout(timeoutRef)
        var result = true
        if (err.code === 'EADDRINUSE')
            result = false
        if (!calledOnce) {
            calledOnce = true
            callback(result,port)
        }
    })
}



// 检测port是否被占用
exports.portable = function (port,callback) {
  probe(port,callback)
}
exports.count = count
exports.getin = getin
exports.setProcessEnv = setProcessEnv
exports.getEnv = getEnv
exports.getEntryPlug = function (modulesentry) {
	return getEntryPlug(modulesentry)
}
exports.getEntry = function (extName) {
	return getEntry(extName)
}
exports.getRoutes = getRoutes