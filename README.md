# community
## 社区

## vue 单页 可以多项目混合 Vue开发框架 
### 账号中心
#### 增加项目:
>package.json 中 修改增加:   scripts=>  
>sample:  
>>--app 项目名称，相对于: static,app中相应目录  
>>--NODE_ENV  项目环境变量 根据实际环境变量读取对应config目录中的指定配置文件  
```javascript
	"lco": "node build/local-dev.js --NODE_ENV=local --app=gamenet",  
	"bco": "node build/build.js --NODE_ENV=prod --app=gamenet",  
```

本地调试，生产环境打包
例如：  
* (开启本地调试)npm run local     

所有项目共享一个node_modules 模块安装方法 npm install --save ModuleName  

由于axios的upload技术性问题无法解决 暂时先用Vue-resource的post方法。  
调用方式:  
```javascript
let query = new Object();  
query.username = 'asdfasdf';  
query.pass = '123456';  
this.api.post('community.front.user.login', query, callbackFunction);  
```
接口地址在config中配置,  
方法名称及返回参数由后端提供 

## 项目目录结构
```javascript
├─build				// 项目构建(webpack)相关代码
│      build.js			// 生产环境构建代码
│      local-dev.js		// 本地环境构建代码
│      tools.js
│      utils.js			// 构建工具相关
│      vue-loader.conf.js
│      webpack.base.conf.js	// webpack基础配置
│      webpack.prod.conf.js	// webpack生产环境配置
│      webpack.test.conf.js	
├─app
│  └─accountcenter		//项目名称
│      ├─api			//公用api
│      │      adminApi.js	//具体api.js	
│      ├─components		//vue全部组件
│      ├─conf
│      │      config.js
│      ├─router			//路由
│      ├─store			//vuex
│      ├─views
│      │       index.html	//入口页面
│      │       index.js		//程序入口文件，加载各种公共组件
│      │       index.vue        //页面入口文件
│      ├─wx_share       //微信分享
├─common			//一些配置
│      check-version.js		// 检查node、npm等版本
│      dev-reload.js
│      index.js
│      tool.js
├─config			// 项目开发环境配置
│      index.js			// 项目一些配置变量
│      prod.env.js		// 生产环境变量
├─static			// 静态文件，比如一些图片，css等
│     └─accountcenter		//相应的项目
│         └─img			//图片
│-- .babelrc			// ES6语法编译配置
│-- .editorconfig		// 定义代码格式
│-- .gitignore			// git上传需要忽略的文件格式
│--  package.json		// 项目基本信息
│--  README.md			// 项目说明
```

