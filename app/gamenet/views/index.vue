<template>
    <div>
        <!-- <transition :name="transitionName">
            <router-view class="router"></router-view>
        </transition> -->
        <router-view class="router"></router-view>
        <button class="back-game" @click="backGame" v-if="api.inGame()">返回游戏</button>

        <!-- <keep-alive>
            <router-view class="router" v-if="$route.meta.keepAlive"></router-view>
        </keep-alive> -->
        <!-- <router-view class="router" v-if="!$route.meta.keepAlive"></router-view> -->
    </div>
</template>

<script>
export default {
    name: "index",
    data() {
        return {
            transitionName:'slide-left',
            game:1
        };
    },
    created(){
        this.api.clearVersionCookie();          //清除版本缓存
        this.setBgClass(this.$route.name);
        if(this.$route.query.game){
            this.game = this.$route.query.game;     //微信分享自定义链接设置game=1或其他的，这里获取存cookie，跳转1或2的社区
            this.api.setCookie('game',this.game,7);
        }
    },
    watch:{
        $route(to, from) {   
            this.setBgClass(to.name);
            if(to.meta.index > from.meta.index){
                //设置动画名称
                this.transitionName = 'slide-left';
            }else{
                this.transitionName = 'slide-right';
            } 
        }  
    },
    methods:{
        setBgClass: function (name) {
            if(name==='Login' || name==='LoginIndex' || name==='Password' || name==='BindId' || name==='CommentDetail' || name==='PostText' 
            || name==='FeedBack' || name==='UserAgreement' || name==='ChooseAccount' || name==='ResetAccount' || name==='Authentication' ){
                document.getElementsByTagName("body")[0].classList.remove("add_bg"); 
            }else{
                document.getElementsByTagName("body")[0].className = "add_bg";
            }
        },
        backGame: function(){
            window.location.href = 'returngame://action';
        }
    }
};
</script>

<style lang="scss">
    .add_bg{
        background: #f2f2f2;
    }
    .router{
        position: absolute;  
        left: 0;  
        top: 0;  
        width: 100%;  
        height: 100%;  
        transition: all .3s cubic-bezier(.55,0,.1,1);
        i{
            background-image: url('/static/img/icon.png');
            background-size: 6.4rem 4.8rem;
        }
        .header{
            position: relative;
            height: 0.88rem;
            line-height: 0.88rem;
            font-size: 18px;
            text-align: center;
            color: #fff;
            background: #c70019;
            .goback{
                position: absolute;
                top: 50%;
                left: 0.3rem;
                width: 0.48rem;
                height: 0.42rem;
                margin-top: -0.21rem;
                background-position: -0.17rem -1.8rem;
            }
        }
    }
    .back-game{
        position: fixed;
        bottom: 0.2rem;
        left: 0;
        width: 1.5rem;
        height: 0.6rem;
        // font-size: 16px;
        color: #fff;
        border: none;
        outline: none;
        background: rgba(219,29,6,.6);
        border-radius: 0 8px 8px 0; 
    }

    //各个选择国家组件淡入淡出的样式
    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s
    }
    .fade-enter, .fade-leave-active {
        opacity: 0
    }
    
    .slide-right-enter,.slide-left-leave-active {
        opacity: 0;
       -webkit-transform: translate(-100%, 0);
        transform: translate(-100%, 0);
    }
    .slide-left-enter,.slide-right-leave-active {
        opacity: 0;
        -webkit-transform: translate(100%, 0);
        transform: translate(100%, 0);
    }
    .mint-msgbox-wrapper .mint-msgbox{width: 70%;border-radius: 5px;}
    .mint-msgbox-wrapper .mint-msgbox .mint-msgbox-content{padding: 25px 20px 25px; }
    .mint-msgbox-wrapper .mint-msgbox .mint-msgbox-message{color: #000;}
    .mint-msgbox-wrapper .mint-msgbox .mint-msgbox-btn {font-size: 16px;}
</style>

