var path = require('path');
var count = function (obj) {
  let cnt = 0
  for(let i in obj){
    cnt++
  }
  return cnt
}
exports.getin = function(arguments) {
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
		// console.log('i:',i,' val:',ins[i],' envs:',envs)
	}
	return arg;
}

exports.setProcessEnv = function (params) {
	for(var i in params){
		process.env[i] = params[i]
	}
}
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

