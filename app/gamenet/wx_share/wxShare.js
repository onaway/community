import Vue from 'vue';
import VueResource from 'vue-resource'
import wx from 'weixin-js-sdk'
import api from '../api/adminApi'
import Toast from '@/components/toast/toast.js'

Vue.use(VueResource)

var game = api.getCookie('game');
if( !game ) game = 1;
var wx_share = function(desc,url,imgUrl){
    var http = Vue.http;
    var ua = window.navigator.userAgent.toLowerCase();
    
    if(ua.match(/MicroMessenger/i) == 'micromessenger'){
        http.post('http://bbs.shmoak.com:8040/share/conf.php',{url:url}).then(res=>{
            // console.log(res);
            var data = res.data;
            wx.config({
                debug: false,
                appId: data.appId,
                timestamp: data.timestamp,
                nonceStr: data.nonceStr,
                signature: data.signature,
                jsApiList: [
                    "onMenuShareTimeline",
                    "onMenuShareAppMessage",
                    "onMenuShareQQ",
                    "onMenuShareWeibo",
                    "onMenuShareQZone"
                ]
            })
        })
    }
    //改变分享的链接
    let link = '';
    let ptReg = /posttext/.test(url);
    let cdReg = /commentdetail/.test(url);
    if( ptReg || cdReg ){
        link = url + '&?game=' + game;
    }else{
        link = 'http://bbs.shmoak.com?game='+game;
    }
    
    var title = 'IGS授权《三国战纪》正版手游';
    wx.ready(function () {
        wx.onMenuShareAppMessage({
            title: title, // 分享标题
            desc: desc, // 分享描述
            link: link, 
            imgUrl: imgUrl, 
            type: 'link', 
            dataUrl: '',
            success: function () {},  // 用户确认分享后执行的回调函数
            cancel: function(){},     // 用户取消分享后执行的回调函数
        });
        wx.onMenuShareTimeline({
            title: title, 
            link: link, 
            imgUrl: imgUrl, 
            success: function () {},
            cancel: function(){}
        });
        wx.onMenuShareQQ({
            title: title,
            desc: desc, 
            link: link, 
            imgUrl: imgUrl, 
            success: function () {},
            cancel: function(){}
        });
        wx.onMenuShareWeibo({
            title: title, 
            desc: desc,
            link: link, 
            imgUrl: imgUrl, 
            success: function () {},
            cancel: function(){}
        });
        wx.onMenuShareQZone({
            title: title, 
            desc: desc, 
            link: link,
            imgUrl: imgUrl, 
            success: function () {},
            cancel: function(){}
        });
    });
}

export default ({
    wx_share,
})