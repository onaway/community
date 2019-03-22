<template>
    <div class="comment-detail" @touchmove="touchmove">
        <header class="header">
            <i class="goback" @click="goBack"></i>
            <i class="point" @click="tipShow"></i>
            评论详情
        </header>

        <!-- 举报分享收藏删除组件 -->
        <transition name="fade" mode="out-in">
            <tip-item v-show="isShow" :tipData="detailData.main" @transferval="transferValue" @hidetip="hideTipItem"></tip-item>
        </transition>

        <!-- <share></share> -->

        <!-- 举报组件 -->
        <transition name="fade" mode="out-in">
            <report v-show="isSee" @parentcancel="cancelReport"></report>
        </transition>

        <div class="comment-first-user clearfix">
            <div @click="toPersonalCenter(detailData.main.uid)"><img :src="changeSrc()"></div>
            <div class="user-con">
                <h2 :class="{official:isMark}" @click="toPersonalCenter(detailData.main.uid)">{{detailData.main.uname}}</h2>
                <p><span>{{updateTime(detailData.main.time*1000)[0]}}</span><span>{{updateTime(detailData.main.time*1000)[1]}}</span></p>
                <!-- <i class="icon-official" v-show="showOfficialIcon"></i> -->
            </div>
            <i class="icon-lz" v-if="uid==detailData.main.uid"></i>
            <ul>
                <li @click="praise"><i class="icon-zan" :class="{on:isTrue}"></i><span>{{detailData.main.zan}}</span></li>
                <li @click="toCommentBox"><i class="icon-comment"></i><span>{{detailData.main.comment}}</span></li>
            </ul>
        </div>
        <p class="comment-con-top" v-html="analyzeEmoji(detailData.main.content)"></p>

        <!-- 遍历回复组件 -->
        <reply-item v-for="(item,index) in detailReply" :key="item.id" :replies="item" :index="index"
        :zan="detailData.zan" :mark="detailData.hd" :uid="uid" @toolbox="showBox"></reply-item>
        
        <infinite-loading @infinite="onInfinite" ref="infiniteLoading" spinner="circles">
            <span slot="no-more">已经到底了~</span>
            <span slot="no-results">暂无回复</span>
        </infinite-loading>
        <!-- 放在循环体下，当到此位置时会执行onInfinite方法 -->

        <div class="space"></div>
        <footer class="footer" @click="toCommentBox">
            <div class="f-comment"><i class="icon-comment"></i>说说你的看法...</div>
        </footer>

        <!-- (回复和举报)组件 -->
        <transition name="fade" mode="out-in">
            <reply-box v-show="replyBoxStatus" @hidereplybox="changeReplyBoxStatus" @showreport="showReportBox" @delcom="delComment"></reply-box>
        </transition>

        <!-- 微信分享引导图 -->
        <transition name="fade" mode="out-in">
            <wx-share v-show="wxShareShow"></wx-share>
        </transition>

        <!-- 404组件 -->
        <error-item v-if="showError"></error-item>
    </div>
</template>

<script>
import Report from '@/components/common/Report.vue'
import Share from '@/components/common/Share.vue'
import WxShare from '@/components/common/WxShare.vue'
import TipItem from '@/components/common/TipItem.vue'
import ReplyItem from '@/components/comment/ReplyItem.vue'
import ReplyBox from '@/components/common/ReplyBox.vue'
import ErrorItem from '@/components/error/ErrorItem.vue'
import InfiniteLoading from 'vue-infinite-loading'
import {mapGetters,mapActions} from 'vuex'
import Toast from '@/components/toast/toast.js'
export default {
    name: "CommentDetail",
    components:{
        Report,
        Share,
        WxShare,
        TipItem,
        ReplyItem,
        ReplyBox,
        ErrorItem,
        InfiniteLoading
    },
    data: function() {
        return {
            isShow: false,          //（收藏，分享和举报）组件的状态
            isSee: false,           //举报组件是否显示
            isTrue: false,          //点赞变红的类名
            isMark:false,           //官方账号类名
            showError:false,        //是否显示404页面
            replyBoxStatus:false,   //（回复和举报）组件的状态
            showOfficialIcon:false, //是否显示删除按钮
            hdAccount: {},          //登录记住我的账号和勾的状态
            commentForm:{           //接口参数
                uid:'',
                cid:'',
                page:1
            }, 
            praiseForm:{            //赞的参数
                action: 'c',
                tid:'',
                cid:'',
                type: 1,
                uid:''
            },         
            user:'',                //用户信息token
            uid:'',                 //用户uid
            tid: '',                //帖子id，微信分享链接用
            initPage: false         //第一页开关
        };
    },
    beforeRouteLeave(to, from, next) {      //当帖子详情页返回首页时，则清除帖子详情页存在vuex中的数据
        if( to.name == 'PostText' ) this.clearDetailData();
        if( to.name == 'CommentBox' ) this.setComingRouter('CommentDetail');
        next();
    },
    computed:{
        ...mapGetters(['wxShareShow','detailData','detailReply','datailPage'])
    },
    created () {
        let _url = this.$route.query.uid;            //获取uid对象数据
        let decodeUrl = decodeURIComponent(_url)     //传过来之前encodeURIComponent，此时decodeURIComponent
        let uidJson = this.api.decode(decodeUrl);    //解密uid对象数据
        this.uid = uidJson.uid;
        this.user = this.api.islogin();
        this.tid = this.$route.query.tid;
        this.commentForm.cid = this.$route.query.cid;
        this.commentForm.uid = this.user;
        if( this.commentForm.uid ==='' || this.commentForm.cid === '' ) return false;
        this.watchZan();
        this.watchMark();
    },
    mounted(){
        if( this.detailReply.length == 0 ){   //数据为空
            this.getDataList();
        }else{      //有数据
            this.initPage = true;
            this.commentForm.page = this.datailPage;
            if( this.detailReply.length < (10*this.commentForm.page) ){     
                this.$refs.infiniteLoading.$emit('$InfiniteLoading:loaded');  
                this.$refs.infiniteLoading.$emit('$InfiniteLoading:complete');
            } 
        }

        let desc = '';
        setTimeout(()=>{
            desc = this.detailData.main.content;
            let url = 'http://bbs.shmoak.com/posttext?tid='+this.tid;
            let imgUrl = 'http://hotupdate.enjoymi.com/images/guanerye.jpg';
            this.wxShare.wx_share(desc,url,imgUrl);
        },300)
    },
    methods: {
        ...mapActions(['setCommentData','setDetailData','clearDetailData','setComingRouter','reduceComment','changePostCommentPraise']),
        getDataList: function(){
            this.commentForm.page = 1;
            this.api.post('community.data.detail.getcomm',this.commentForm,this.CbDetailData);
        },
        onInfinite: function(){
            if(!this.initPage)return false;
            setTimeout(()=>{
                if(this.commentForm.page >= 1){  
                    this.commentForm.page++;
                    this.api.post('community.data.detail.getcomm',this.commentForm,this.CbDetailData);
                }
            },500)
        },
        CbDetailData:function(res){     //接口数据
            console.log('评论详情页数据：',res.data);
            
            if (res.code == 1) {            // 如果查询结果为真
                this.initPage = true;
                if (res.data.reply.length) {       // 如果有数据则进入将新的数据与老的数据拼接
                    if(this.commentForm.page==1){
                        this.setDetailData({data:res.data,type:'refresh',page:this.commentForm.page})
                    }else{
                        this.setDetailData({data:res.data,type:'loadmore',page:this.commentForm.page})
                    }
                    this.watchZan();
                    this.watchMark();
                    this.watchOfficial();
                    console.log('detailReply:',this.detailReply);
                    this.$refs.infiniteLoading.$emit('$InfiniteLoading:loaded');    //$emit触发$InfiniteLoading:loaded事件
                    if( this.detailReply.length < (10*this.commentForm.page) ){        //如果帖子总条数小于10*页数则数据加载完成
                        this.$refs.infiniteLoading.$emit('$InfiniteLoading:complete');
                    }  
                }else{
                    if( this.detailReply.length > 0 ){
                        this.$refs.infiniteLoading.$emit('$InfiniteLoading:loaded');
                    }
                    this.$refs.infiniteLoading.$emit('$InfiniteLoading:complete'); //没有数据显示没有更多
                }
            }else if( res.code == -20010 ){
                this.showError = true;
            }
        },
        watchZan:function(){            //监听赞的变化
            this.api.in_array;
            if(this.api.in_array(this.detailData.main.cid,this.detailData.zan)){
                this.isTrue = true;
            }else{
                this.isTrue = false;
            }
        },
        watchMark:function(){           //监听是否是官方账号
            this.api.in_array;
            if(this.api.in_array(this.detailData.main.uid,this.detailData.hd)){    
                this.isMark = true;
            }else{
                this.isMark = false;
            }
        },
        watchOfficial: function(){      //监听是否显示删除按钮
            this.api.in_array;
            if(this.api.in_array(this.detailData.main.uid,this.detailData.hd)){    
                this.showOfficialIcon = true;
            }else{
                this.showOfficialIcon = false;
            }
        },
        goBack: function(){             //如果有历史记录则返回上一页，否则回到主页
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
        changeSrc: function(){          //头像的路径
            if( typeof(this.detailData.main.head.img) === 'undefined' ){
                return '/static/img/failed.jpg';
            }else{
                let reg = /^wj/.test(this.detailData.main.head.img);
                if( reg ){
                    return '/static/img/head/'+this.detailData.main.head.img;
                }else{
                    return 'http://hotupdate.enjoymi.com/community/img/'+this.detailData.main.head.img;
                }
            }
        },
        tipShow :function(){            //显示隐藏（分享和举报or删除）组件
            this.isShow = this.isShow?false:true;
        },
        share :function(){              //显示分享组件
            // console.log(111);
        },
        transferValue :function(){      //显示举报组件并隐藏（分享和举报）按钮
            this.isSee = true;
            this.isShow = false;
        },
        cancelReport :function(){       //隐藏举报组件
            this.isSee = false;
        },
        praise: function(){             //赞和取消赞
            if( this.user ){
                this.praiseForm.tid = this.detailData.main.tid;
                this.praiseForm.cid = this.detailData.main.cid;
                this.praiseForm.uid = this.user;
                this.praiseForm.type = this.isTrue?2:1;
                if( this.praiseForm.tid===''||this.praiseForm.cid===''||this.praiseForm.uid==='' )return false;
                // console.log('comment praiseForm',this.praiseForm);
                this.api.post('community.lang.topic.zan',this.praiseForm,this.CbCommentPraise);
            }else{
                this.$router.push({path:'/login'});
            }
        },
        CbCommentPraise: function(res){  //评论赞的接口数据
            // console.log(res);
            if( res.data == 1 ){
                this.changePostCommentPraise(this.detailData.main.cid);     //将cid存至vuex中进行数据操作
                if( this.isTrue ){
                    this.detailData.main.zan = parseInt(this.detailData.main.zan) - 1;
                }else{
                    this.detailData.main.zan = parseInt(this.detailData.main.zan) + 1;
                }
                this.isTrue = !this.isTrue;
            }else{
                this.api.getmsg(res);
            }
        },
        toCommentBox:function(){         //跳转评论组件，传数据
            if( this.user ){
                let _data = {};
                _data.list = this.detailData.main;
                this.setCommentData(_data);       //提交数据到vuex中
                this.$router.push({path:'/commentbox'})
            }else{
                this.$router.push({path:'/login'})
            }
        },
        changeReplyBoxStatus: function () {   //隐藏（回复和举报）组件
            this.replyBoxStatus = false;
        },
        showBox:function(){             //显示（回复和举报）组件
            this.replyBoxStatus = true;
        },
        showReportBox:function(){       //显示举报组件
            this.isSee = true;
        },
        toPersonalCenter: function(uid){    //跳转个人中心
            let urlJson = {};       
            urlJson.uid = uid;
            let _url = this.api.encode(urlJson);       //通过base64加密传给个人中心
            let encodeUrl = encodeURIComponent(_url)   //将特殊的字符如‘：;/?:@&=+$,# ’进行替换
            // this.$router.push({name:'PersonalCenter',params:{uid:_url}});
            this.$router.push({path: `/personalcenter/${encodeUrl}`});
        },
        updateTime: function(timeValue){    //改变时间显示
            return this.api.getTime(timeValue);
        },
        analyzeEmoji: function(cont) {      //编译表情替换成图片展示出来
            return this.api.analyzeEmoji(cont);
        }, 
        hideTipItem: function(){            //隐藏 收藏 组件
            this.isShow = false;
        },
        delComment: function(data){         //删除评论
            // console.log('data:',data);
            this.reduceComment(data.list.becid);           //删除回复帖子详情页的总评论数-1,相应评论的评论数-1
            this.detailReply.splice(data.index,1);
            this.detailData.main.comment = parseInt(this.detailData.main.comment) - 1;
        },
        touchmove: function(){
            this.isShow = false;
        },
    },
};
</script>

<style lang="scss" scoped>
    @import '../css/commentDetail.scss';
    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s
    }
    .fade-enter, .fade-leave-active {
        opacity: 0
    }
</style>

