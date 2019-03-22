/**
 * Created by hasee on 2018/5/11.
 */
import 'es6-promise/auto';
import Index from './Index.vue';
import Vue from 'vue';
import router from '../router'
import store from '../store';
import Mint from 'mint-ui'
import config from '../conf/config'
import commonapi from 'commonapi'
import preview from 'vue-photo-preview'
import 'vue-photo-preview/dist/skin.css'
import adminApi from '../api/adminApi'
import wxShare from '../wx_share/wxShare'
import crypt from 'crypto-js'
import 'mint-ui/lib/style.css'
import 'swiper/dist/css/swiper.css'
import VueScroller from "vue-scroller"
Vue.use(VueScroller);

var options = {
    fullscreenEl:false //关闭全屏按钮
}
Vue.use(Mint)
Vue.use(preview,options)

Vue.prototype.crypt = crypt
Vue.prototype.api = adminApi
Vue.prototype.wxShare = wxShare

new Vue({
    el: '#app',
    router,
    store,
    config,
    commonapi,
    render: mod => mod(Index),
    components: {}
});