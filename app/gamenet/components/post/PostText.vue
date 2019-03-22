<template>
    <div class="post-text" @touchmove="touchmove">
        <header class="header">
            <i class="goback" @click="goBack"></i>
            <i class="point" @click="tipShow"></i>
            帖子详情
        </header>

        <!-- 举报分享收藏删除组件 -->
        <transition name="fade" mode="out-in">
            <tip-item v-show="isShow" :tipData="postData.main" :collection="postData.myCollection" @transferval="transferValue" @hidetip="hideTipItem"></tip-item>
        </transition>

        <!-- <share></share> -->
        
        <!-- 举报组件 -->
        <transition name="fade" mode="out-in">
            <report v-show="isSee" @parentcancel="cancelReport"></report>
        </transition>

        <!-- 帖子正文组件 -->
        <post-header :headerData="postData.main" :pics="postData.pic" :zan="postData.t_zan" :mark="postData.hd"></post-header>
        <p class="gray-space"></p>
        <p class="all-comment">评论（{{postData.main.comment}}）</p>

        <!-- 遍历回复组件 -->
        <comment-item v-for="(item,index) in comment" :key="item.id" :mark="postData.hd" :num="index" :uid="postData.main.uid"
        :reps="item" :replies="postReply[index]" :zan="postData.zan" :tid="postData.main.tid" @toolbox="showBox"></comment-item>
        
        <infinite-loading @infinite="onInfinite" ref="infiniteLoading" spinner="circles">
            <span slot="no-more">已经到底了~</span>
            <span slot="no-results">暂无评论</span>
        </infinite-loading>
        <!-- 放在循环体下，当到此位置时会执行onInfinite方法 -->

        <!-- (回复和举报/删除)组件 -->
        <transition name="fade" mode="out-in">
            <reply-box v-show="replyBoxStatus" @hidereplybox="changeReplyBoxStatus" @showreport="showReportBox" @delcom="delComment"></reply-box>
        </transition>
        
        <div class="footer-space"></div>
        <footer class="footer" @click="showComment">
            <div class="f-comment"><i class="icon-comment"></i>说说你的看法...</div>
        </footer>

        <!-- 微信分享引导图 -->
        <transition name="fade" mode="out-in">
            <wx-share v-show="wxShareShow"></wx-share>
        </transition>

        <!-- 404页面 -->
        <error-item v-if="showError"></error-item>
    </div>
</template>

<script>

import Report from '@/components/common/Report.vue'
import Share from '@/components/common/Share.vue'
import WxShare from '@/components/common/WxShare.vue'
import TipItem from '@/components/common/TipItem.vue'
import PostHeader from '@/components/post/PostHeader.vue'
import commentItem from '@/components/post/commentItem.vue'
import ReplyBox from '@/components/common/ReplyBox.vue'
import ErrorItem from '@/components/error/ErrorItem.vue'
import InfiniteLoading from 'vue-infinite-loading'
import {mapGetters,mapActions} from 'vuex'
export default {
    name: "postText",
    components:{
        ReplyBox,
        Report,
        Share,
        WxShare,
        TipItem,
        PostHeader,
        commentItem,
        ErrorItem,
        InfiniteLoading
    },
    data: function() {
        return {
            replyBoxStatus:false,       //（回复和举报）组件的状态
            isShow: false,              //（收藏分享和举报删除）按钮的状态
            isSee: false,               //举报组件是否显示
            showError:false,            //是否显示404页面
            form:{
                uid:'',
                tid:'',
                page:1,
                game:1
            },              
            user:'',                    //用户信息token
            count:'',
            initPage:false,             //第一页开关
        };
    },
    beforeRouteLeave(to, from, next) {      //当帖子详情页返回首页时，则清除帖子详情页存在vuex中的数据
        if( to.name == 'Home' ) this.clearPostData();
        if( to.name == 'CommentBox' ) this.setComingRouter('PostText');
        next();
    },
    computed:{          //vuex获取数据
        ...mapGetters(['wxShareShow','postData','comment','postReply','commentData','postPage','isRefreshPostData'])
    },
    created () {
        this.user = this.api.islogin();
        this.form.tid = this.$route.query.tid;
        this.form.uid = this.user;
        if( this.form.tid === '' || this.form.uid === '' ) return false;
        if( this.isRefreshPostData ) this.clearPostData();      //通过是否评论成功‘帖子’给的状态判断是否清除缓存数据
    },
    mounted() {
        if( this.comment.length == 0 ){   //数据为空
            console.log('数据为空');
            this.getDataList();
        }else{      //有数据
            console.log('有数据 initPage:',this.initPage);
            this.initPage = true;
            this.form.page = this.postPage;
            if( this.comment.length < (10*this.form.page) ){
                this.$refs.infiniteLoading.$emit('$InfiniteLoading:loaded'); 
                this.$refs.infiniteLoading.$emit('$InfiniteLoading:complete');
            }
        }

        // let title = '三国战纪--社区';
        let desc = '',
            imgUrl = '';
        setTimeout(()=>{
            desc = this.postData.main.content;
            let url = window.location.href;
            if( typeof(this.postData.pic) == 'undefined' ){
                imgUrl = 'http://hotupdate.enjoymi.com/images/guanerye.jpg';
            }else if( this.postData.pic.length > 0 ){
                imgUrl = 'http://hotupdate.enjoymi.com/community/pic/'+this.postData.pic[0].img;
            }
            this.wxShare.wx_share(desc,url,imgUrl);
        },300)
    },
    methods: {
        ...mapActions(['setCommentData','setPostData','clearPostData','setComingRouter']),
        getDataList: function(){        //获取接口数据
            this.form.page = 1;
            this.api.post('community.data.detail.get',this.form,this.CbPostData);
        },
        onInfinite: function(){         //触发上拉加载方法
            console.log('loadmore');
            if(!this.initPage)return false;
            setTimeout(()=>{
                if(this.form.page >= 1){  
                    this.form.page++;
                    this.api.post('community.data.detail.get',this.form,this.CbPostData);
                }
            },500)
        },
        CbPostData: function(res){      //帖子详情页的接口数据
            console.log('帖子页数据：',res.data);
    
            if (res.code == 1) {            // 如果查询结果为真
                this.initPage = true;
                if (res.data.comment.length) {       // 如果有数据则进入将新的数据与老的数据拼接
                    if(this.form.page==1){
                        this.setPostData({data:res.data,type:'refresh',page:this.form.page});
                    }else{
                        this.setPostData({data:res.data,type:'loadmore',page:this.form.page});
                    }
                    this.$refs.infiniteLoading.$emit('$InfiniteLoading:loaded');    //$emit触发$InfiniteLoading:loaded事件
                    console.log('post comment:',this.comment);
                    console.log('post reply:',this.postReply);
                    if( this.comment.length < (10*this.form.page) ){        //如果帖子总条数小于10*页数则数据加载完成
                        this.$refs.infiniteLoading.$emit('$InfiniteLoading:complete');
                    }
                }else{
                    if( this.comment.length > 0 ){
                        this.$refs.infiniteLoading.$emit('$InfiniteLoading:loaded');
                    }else{
                        this.setPostData({data:res.data,type:'refresh',page:this.form.page})      //只有帖子正文，没有评论的情况
                    }
                    this.$refs.infiniteLoading.$emit('$InfiniteLoading:complete'); //没有数据显示没有更多
                }
            }else if( res.code === -20004 ){
                this.showError = true;
            }
        },
        goBack:function(){              //如果有历史记录则返回上一页，否则返回主页
            var ua = navigator.userAgent.toLowerCase();
            if (ua.indexOf('firefox') != -1 || ua.indexOf('opera') != -1 || ua.indexOf('safari') != -1 ||
            ua.indexOf('chrome') != -1 || ua.indexOf('webKit') != -1 || ua.match(/MicroMessenger/i) == 'micromessenger'|| 
            ua.indexOf('uc') != -1 || ua.indexOf('baidu') != -1 || ua.indexOf('qq') != -1 ) { 
                if (window.history.length > 1) {
                    this.$router.go(-1);
                } else {
                    this.$router.push({path:'/'});
                }
            } else { //未知的浏览器 
                this.$router.go(-1);
            }
        },
        tipShow :function(){            //显示隐藏（分享和举报）按钮
            this.isShow = this.isShow?false:true;
        },
        share :function(){              //显示分享组件
            // alert(1)
        },
        transferValue :function(){      //显示举报组件并隐藏（分享和举报）按钮
            this.isSee = true;
            this.isShow = false;
        },
        showBox: function () {           //显示（回复和举报）组件
            this.replyBoxStatus = true;
        },
        changeReplyBoxStatus: function () {   //隐藏（回复和举报）组件
            this.replyBoxStatus = false;
        },
        cancelReport :function(){       //隐藏举报组件
            this.isSee = false;
        },
        showComment :function(){        //点击底部显示评论组件
            if( this.user ){
                let _data = {};
                _data.list = this.postData.main;
                this.setCommentData(_data);       //提交数据到vuex中
                this.$router.push({path:'/commentbox'});
            }else{
                this.$router.push({path:'/login'});
            }
        },
        showReportBox:function(){       //显示举报组件
            this.isSee = true;
        },
        hideTipItem: function(){        //隐藏 收藏 组件
            this.isShow = false;
        },
        delComment: function(data){     //删除评论，对缓存的数据进行相应的变化
            if( data.list.type == 1 ){
                let allComment = (this.comment[data.num].len + 1);
                this.comment.splice(data.num,1);
                this.postReply.splice(data.num,1);
                this.postData.main.comment = parseInt(this.postData.main.comment) - allComment;
            }else{
                this.postReply[data.num].splice(data.index,1);
                this.comment[data.num].len --;
                this.comment[data.num].comment = parseInt(this.comment[data.num].comment) - 1;
                this.postData.main.comment = parseInt(this.postData.main.comment) - 1;
            }
        },
        touchmove: function(){
            this.isShow = false;
        },
    },
};
</script>

<style lang="scss" scoped>
    .post-text{
        .header{
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            z-index: 99;
            .point{
                position: absolute;
                top: 50%;
                width: 0.56rem;
                height: 0.4rem;
                right: 0.3rem;
                margin-top: -0.2rem;
                background-position: -0.9rem -0.2rem;
            }
        }
        .gray-space{
            height: 0.1rem;
            background: #f2f2f2;
        }
        .all-comment{
            height: 0.6rem;
            line-height: 0.6rem;
            // margin-top: 0.1rem;
            padding-left: 0.3rem;
            color: #c70019;
            background: #fff;
            border-bottom: 1px solid #f2f2f2;
        }
        .footer-space{
            height: 0.68rem;
        }
        .footer{
            position: fixed;
            left: 0;
            bottom: 0;
            width: 100%;
            height: 0.8rem;
            line-height: 0.8rem;
            background: #f8f8f8;
            .f-comment{
                box-sizing: border-box;
                height: 0.6rem;
                line-height: 0.6rem;
                font-size: 12px;
                color: #727176;
                margin: 0.1rem 0.2rem 0.1rem;
                background: #fff;
                border-radius: 5px;
                border: 1px solid #e2e2e2;
                .icon-comment{
                    float: left;
                    width: 0.32rem;
                    height: 0.32rem;
                    margin: 0.14rem 0.1rem 0 0.1rem;
                    background-size: 6.4rem 4.8rem;
                    background-image: url('/static/img/icon.png');
                    background-position: -4.25rem -2.65rem;
                }
            }
        }
    }
    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s
    }
    .fade-enter, .fade-leave-active {
        opacity: 0
    }
</style>
