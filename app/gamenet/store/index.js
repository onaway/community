import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

import scroll_store from './scroll_store.js'
import home_store from './home_store.js'
import wx_store from './wx_store.js'
import post_store from './post_store.js'
import comment_store from './comment_store.js'
import message_store from './message_store.js'
import personal_store from './personal_store.js'
import common_store from './common_store.js'

// export default new Vuex.Store({
//     modules:{
//         scroll_y: scroll_store,         //存滚动条高度
//         home: home_store,               //存首页数据
//         wx: wx_store,                   //存微信分享的状态
//         post: post_store,               //存帖子详情页数据
//         comment: comment_store,         //存评论详情页数据
//         message: message_store,         //存消息中心数据
//         personal: personal_store,       //存个人中心数据
//         common: common_store,           //存通用的数据
//     }
// })

//vuex解决缓存溢出问题
export default () => {
    return new Vuex.Store({
        modules:{
            scroll_y: scroll_store,         //存滚动条高度
            home: home_store,               //存首页数据
            wx: wx_store,                   //存微信分享的状态
            post: post_store,               //存帖子详情页数据
            comment: comment_store,         //存评论详情页数据
            message: message_store,         //存消息中心数据
            personal: personal_store,       //存个人中心数据
            common: common_store,           //存通用的数据
        }
    })
}