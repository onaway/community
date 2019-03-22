<template>
    <div class="sg-share">
        <div class="share">
            <h2>分享给好友</h2>
            <div id="share"></div>
        </div>
    </div>
</template>

<!--<script src="/static/js/soshm.js"></script>-->
<script>
import soshm from 'soshm'
export default {
    name: "share",
    data:function() {
        return {
            
        };
    },
    created:function (){
        this.test()
    },
    methods: {
        test: function () {
            // soshm.popIn({
            //     title: '弹窗分享',
            //     sites: ['weixin','weixintimeline', 'weibo', 'qq','qzone']
            // });
        }
    },
    mouted:function(){
        soshm('#share', {
            url: window.location.href,
            title: document.title,
            digest: '',     // 分享的图片，默认获取本页面第一个img元素的src
            pic: '',
            sites: ['weixin', 'weixintimeline', 'weibo', 'qq', 'qzone']
        })
    }
};
</script>

<style lang="scss" scoped>
    .sg-share{
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,.3);
        z-index: 99;
    }
    .share{
        box-sizing: border-box;
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        padding: 0 0.3rem;
        background: #fff;
        h2{
            height: 0.8rem;
            line-height: 0.8rem;
            text-align: center;
            font-size: 16px;
            border-bottom: 1px solid #e2e2e2;
        }
    }
</style>
