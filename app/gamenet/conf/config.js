import adminApi from '../api/adminApi'
import Vue from 'vue'
import crypt from 'crypto-js'

var ajx = function () {
  this.test = function () {
    console.log('ajx test')
  }
  console.log('this is a ajax test')
}
let interceptor = function (callback, afcb) {
  Vue.http.interceptors.push(function (request, next) {
    callback()
    next(function (response) {
      afcb()
      // console.log('vue resource after push')
      return response
    })
  })
}
Vue.prototype.$config = {
  request_prefix: 'http://localhost:10003',
  base_img: 'http://www.baidu.com'
}
Vue.prototype.$urllist = {
  Detail: '/Detail',
  Index: '/',
  My: '/my',
  List: '/list'
}

Vue.prototype.interceptor = interceptor
Vue.prototype.ajax = ajx
Vue.prototype.crypt = crypt
Vue.prototype.adminHttp = adminApi
// Vueproto
export default {
  Vue
}
// exports.install = function (Vue, options) {
//   var ajx = function () {
//     this.test = function () {
//       console.log('ajx test')
//       // console.log(test)
//     }
//     console.log('this is a ajax test')
//   }
//   Vue.prototype.$config = {
//     request_prefix: 'http://localhost:10003',
//     base_img: 'http://www.baidu.com'
//   }
//   Vue.prototype.adminHttp = adminApi
//   Vue.prototype.ajax = ajx
//   // Vue.prototype.ajax = function () {
//   //   var test = function (){
//   //     console.log ('this is a test')
//   //   }
//   //   return test;
//   // }
// }
