import Vue from 'vue'
import Router from 'vue-router'
import routes from './routes'
import abroad from './abroadRoutes'
import path from '../api/packingPath.js'
Vue.use(Router)

// console.log('build:',path.build);
let build = path.build;
let router = {};         //router只能外部定义
if( build == 'abroad' || build == 'abroadprod' ){
    router = new Router({
        mode: 'history',
        base: '/',
        routes: abroad,
        scrollBehavior(to, form, savedPosition) {
            if (savedPosition) {
                return savedPosition;
            }else{
                return { x: 0, y: 0 };
            }
        },
    })
    // console.log('国外');
}else{
    router = new Router({
        mode: 'history',
        base: '/',
        routes: routes,
        scrollBehavior(to, form, savedPosition) {
            if (savedPosition) {
                return savedPosition;
            }else{
                return { x: 0, y: 0 };
            }
        },
    })
    // console.log('国内');
}

// router.beforeEach((to, from, next) => {
//     if (to.name === 'PersonalCenter') {
//         // 再次进入时，强制滚动到顶部
//         window.scrollTo(0, 0);
//     }
//     if (to.name === 'PostText') {
//         window.scrollTo(0, 0);
//     }
//     next();
// });
export default router  
