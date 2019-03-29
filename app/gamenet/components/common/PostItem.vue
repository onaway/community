<template>
    <div class="post-item">
        <div class="hasdata" v-if="topicStatus(lists)">
            <div class="post-user clearfix">
                <div @click="toPersonalCenter(lists.uid)"><img :src="changeSrc()"></div>
                <div class="post-user-con">
                    <h2 :class="{official:isMark}" @click="toPersonalCenter(lists.uid)">{{lists.uname}}</h2>
                    <span>{{updateTime(lists.time*1000)}}</span>
                </div>
                <i class="icon-official" v-if="showOfficialIcon"></i>
                <i class="icon-hot" v-if="lists.hot==1"></i>
                <span class="spot" v-show="showSpot" @touchend="tipShow(lists.tid,$event)"></span>
            </div>

            <!-- 举报分享收藏删除组件 -->
            <transition name="fade" mode="out-in">
                <tip-item class="tip-item" v-show="isShow" :tipData="lists" :index="index" :collection="collection" :homeTipItemShow="homeTipItemShow" @transferval="transferValue" 
                @hidetip="hideTipItem" @reducetop="reduceTopic" @deltop="delTopic" @addcol="addCollection" @reducecol="reduceCollection"></tip-item>
            </transition>

            <div class="post-content clearfix" @click="toPostText(lists.tid)"> 
                <pre><p class="con" v-html="analyzeEmoji(lists.content)"></p></pre> 
                <div v-if="lists.pic">
                    <ul class="single-pic" v-if="lists.pic.length === 1">
                        <li v-if="showFailedImg(lists.pic[0].state)" :class="showSingelPic(lists.width,lists.height)==true?'pic-height':'pic-width'" >
                            <img :src="changeImgSrc(lists.pic[0].img)" :preview="lists.tid" @click.stop="openPicViewer()">
                        </li>
                        <li v-else class="failed-img" @click.stop="openPicViewer()"><img :src="changeImgSrc(lists.pic[0].img,lists.pic[0].state)"></li>
                    </ul>
                    <ul class="four-pic clearfix" v-else-if="lists.pic.length === 4">
                        <li v-for="pic in lists.pic" :key="pic.id" @click.stop="openPicViewer()">
                            <img :src="changeImgSrc(pic.img,pic.state)" :preview="lists.tid">
                        </li>
                    </ul>
                    <ul class="pic-list clearfix" v-else>
                        <li v-for="pic in lists.pic" :key="pic.id" @click.stop="openPicViewer()">
                            <img :src="changeImgSrc(pic.img,pic.state)" :preview="lists.tid">
                        </li>
                    </ul>
                </div>
            </div>
            <div class="post-box">
                <ul class="clearfix">
                    <li @click="share"><i class="icon-share"></i><span>分享</span></li>
                    <li @click="toPostText(lists.tid)"><i class="icon-comment"></i><span>{{changeComment(lists.comment)}}</span></li>
                    <li @click="praise"><i class="icon-zan" :class="{on:isTrue}"></i><span>{{changeZan(lists.zan)}}</span></li>
                </ul>
            </div>
        </div>
        <div class="nodata" v-else>
            <span>抱歉，此话题已被删除</span><input type="button" value="删除" v-show="showDel" @click="del(index)">
        </div>
    </div>
</template>

<script>
import Report from './Report.vue'
import Share from './Share.vue'
import TipItem from './TipItem.vue'
import Toast from '@/components/toast/toast.js'
import {mapActions} from 'vuex'
export default {
    name: "postItem",
    components:{
        Report,
        Share,
        TipItem
    },
    props:[
        'lists',
        't_zan',
        'mark',
        'postTid',
        'collection',
        'index',
        'flag',
        'comingUid',
        'spotStatus',
        'homeTipItemShow'   
    ],
    data: function() {
        return {
            timeflag:false,
            isShow: false,          //‘收藏和分享’组件是否显示
            isTrue: false,          //点赞变红的类名
            isMark:false,           //官方账号类名
            showSpot: true,         //三个点‘tip’
            showDel:true,           //是否显示删除按钮
            showOfficialIcon:false, //是否显示官方图标
            showHot: true,          //是否显示热门标签
            praiseForm:{            //点赞传的参数
                action:'t',
                tid:'',
                cid: 0,
                uid:'',
                type: 1,
            },
            shareForm:{             //分享的参数
                tid:'',
                uid:''
            },
            delForm:{               //删除话题通知的参数
                uid:'',
                tid:'',
                game: 1
            },
            hdAccount: {},          //登录记住我的账号和勾的状态
            user: '',               //用户信息token
            uid: '',                //用户uid
        };
    },
    created: function(){
        let _uid = this.api.getCookie('uid');   //获取uid对象数据
        let uidJson = this.api.decode(_uid);    //解密uid对象数据
        this.uid = uidJson.uid;
        this.user = this.api.islogin();
        this.watchZan();
        this.watchMark();
        this.watchOfficial();
        this.showTip();
        // console.log('collection1:',this.collection);
        // console.log('lists:',this.lists);
    },
    watch:{
        t_zan(val){
            this.watchZan();
        },
        mark(val){
            this.watchMark();
            this.watchOfficial();
        },
        postTid(val){
            // console.log(val == this.lists.tid);
            if( val == this.lists.tid ){
                this.isShow = true;
            }else{
                this.isShow = false;
            }
        },
        spotStatus(val){    //touchmove为false，touchend为true，监听bool值变化，让收藏和分享组件隐藏
            if( !val ){
                this.isShow = false;
            }
        }
    },
    methods: {
        ...mapActions(['changeWxStatus','changeHomePraise','changePersonalPraise','changeCollectPraise']),
        watchZan:function(){                //监听赞的变化  
            this.api.in_array;
            if(this.api.in_array(this.lists.tid,this.t_zan)){    
                this.isTrue = true;
            }else{
                this.isTrue = false;
            }
        },
        watchMark:function(){               //监听是否是官方账号
            this.api.in_array;
            if(this.api.in_array(this.lists.uid,this.mark)){    
                this.isMark = true;
            }else{
                this.isMark = false;
            }
        },
        watchOfficial: function(){
            this.api.in_array;
            if(this.api.in_array(this.lists.uid,this.mark)){    
                this.showOfficialIcon = true;
            }else{
                this.showOfficialIcon = false;
            }
        },
        tipShow :function(tid,e){           //显示分享和举报按钮
            this.$emit('changeTip',tid);
            if( this.isShow ){
                if(this.postTid == tid){
                    this.isShow = false;
                }
            }else{
                if(this.postTid == tid){
                    this.isShow = true
                }
            }
            e.stopPropagation();    //阻止冒泡
        },
        share :function(){                  //显示分享组件
            let localUrl = 'http://bbs.shmoak.com';
            let tid = this.lists.tid;
            let game = this.api.getCookie('game');
            if( !game ) game = 1;
            let url = localUrl+'/posttext?tid='+tid+'&game='+game;
            this.api.copyStr(url);
            Toast('链接已复制，快去粘贴吧');
        },
        changeSrc: function(){              //头像的路径
            // console.log('src:',typeof(this.lists.head.img));
            if( typeof(this.lists.head.img) === 'undefined' ){
                return '/static/img/failedHeader.jpg';
            }else{
                if(parseInt(this.lists.head.state) === 0 ){
                    return '/static/img/failedHeader.jpg';
                }else if(parseInt(this.lists.head.state) === 2 ){
                    return '/static/img/verifyingHeader.jpg';
                }else{
                    let reg = /^wj/.test(this.lists.head.img);
                    if( reg ){
                        return '/static/img/head/'+this.lists.head.img;
                    }else{
                        return 'http://hotupdate.enjoymi.com/community/img/'+this.lists.head.img;
                    }
                }
            }
        },
        transferValue :function(){          //举报组件
            this.isShow = false;
            this.$emit('parentshow');       //触发父级举报组件显示事件
        },
        toPostText :function(tid){          //进帖子详情页,传tid给详情页
            this.$router.push({path: '/posttext',query:{tid:tid}});
            // this.$router.push({name:'PostText',params:{tid:tid}});
        },
        praise :function(){                 //赞和取消赞
            if( this.user ){
                this.praiseForm.tid = this.lists.tid;
                this.praiseForm.uid = this.user;
                this.praiseForm.type = this.isTrue?2:1;
                // console.log('praiseForm',this.praiseForm);
                if( this.praiseForm.tid==''||this.praiseForm.uid=='' )return false;
                this.api.post('community.lang.topic.zan',this.praiseForm,this.CbPraise);
            }else{
                this.$router.push({path:'/login'});
            }
        },
        CbPraise: function(res){            //赞和取消赞返回的接口数据
            // console.log('postItem:',res);
            if( res.code == 1 ){
                this.changeHomePraise(this.lists.tid);      //将tid存至vuex中进行数据操作
                this.changePersonalPraise(this.lists.tid);
                this.changeCollectPraise(this.lists.tid);
                // if( this.isTrue ){
                //     this.lists.zan --;
                // }else{
                //     this.lists.zan ++;
                // }
                // this.isTrue = !this.isTrue;
            }else{
                this.api.getmsg(res);
            }
        },
        updateTime: function(timeValue){    //改变时间显示
            return this.api.changeTime(timeValue);
        },
        toPersonalCenter: function(uid){    //跳转到个人中心的两种写法
            // this.$router.push({path: `/personalcenter/${uid}`});
            // console.log('path:',this.$route.path);
            let urlJson = {};       
            urlJson.uid = uid;
            let _url = this.api.encode(urlJson);       //通过base64加密传给个人中心
            let encodeUrl = encodeURIComponent(_url)   //将特殊的字符如‘：;/?:@&=+$,# ’进行替换
            if( this.$route.path == '/' ||  this.$route.path == '/homevuex' ){
                // this.$router.push({name:'PersonalCenter',params:{uid:encodeUrl}});
                this.$router.push({path: `/personalcenter/${encodeUrl}`});
            }
        },
        analyzeEmoji: function(cont) {      //编译表情替换成图片展示出来
            return this.api.analyzeEmoji(cont);
        },
        hideTipItem: function(){            //隐藏 收藏 组件
            this.isShow = false;
        },
        reduceTopic: function(){            //tipItem触发的我的话题数量减一的自定义事件
            this.$emit('reducetopicnum');
        },
        topicStatus: function(data){        //如果帖子被删除为空，则显示删除完的样式
            if( data != '' ){
                return true;
            }else{
                return false;
            }
        },
        del: function(index){               //删除已经被删除的话题的通知
            this.delForm.uid = this.user;
            this.delForm.tid = this.collection[index];
            // console.log('tid:',this.delForm.tid);
            this.collection.splice(index,1);
            if( this.delForm.uid =='' || this.delForm.tid =='' )return false;
            this.api.post('community.lang.topic.delLose',this.delForm,this.CbDelData);
        },
        CbDelData: function(res){           //接口数据
            // console.log('del:',res);
            if( res.code == 1 ){
                this.$emit('reducecolnum');  //个人中心我（他）的收藏的数字-1
                this.$emit('delcol',this.index);        //删除收藏
            }else if( res.code == -66665 ){
                Toast('登录已过期，请重新登录');
                this.hdAccount = this.api.cookieGet('hdAccount');
                let version = this.api.cookieGet('version');
                this.api.clearAllCookie();      //清除所有cookie
                this.$router.push({path:'/login'});
                this.api.setCookie('version',version,3);
                this.api.setCookie('hdAccount',this.hdAccount,7);
            }else{
                this.api.getmsg(res);
            }
        },
        showTip: function(){                //若是在我（他）的收藏中，则不显示 ‘···’
            // console.log('flag:',this.flag);
            if( this.flag == 'collect' ){
                this.showSpot = false;
                if( this.comingUid == this.uid ){
                    this.showDel = true;
                }else{
                    this.showDel = false;
                }
            }
        },
        delTopic:function(index){           //话题删除的自定义事件（tipItem中自定义）
            this.$emit('deletetop',index);
        },
        addCollection: function(){          //个人中心我（他）的收藏的数字+1（tipItem中自定义）
            this.$emit('addcollectionnum');
        },
        reduceCollection: function(){       //个人中心我（他）的收藏的数字-1（tipItem中自定义）
            this.$emit('reducecolnum');
        },
        showSingelPic: function(width,height){        //根据图片的宽高度显示图片
            // console.log('width:', parseInt(width),' height:',parseInt(height));
            if( parseInt(width) < parseInt(height) ){
                return true;
            }else if(  parseInt(width) > parseInt(height) ){
                return false;
            }
            return true;
        },
        changeImgSrc: function(src,state){        //根据state来生成图片的路径1/2为数据路径，0为默认路径
            // console.log('src:',src);
            if( parseInt(state) == 0 ){
                return '/static/img/failed.jpg';
            } else if(parseInt(state) == 2){
                return '/static/img/verifying.jpg';
            }
            return 'http://hotupdate.enjoymi.com/community/pic/'+src;
        },
        showFailedImg: function(state){     //若违规，显示违规图片
            if( parseInt(state) == 0 || parseInt(state) == 2 ){
                return false;
            }else{
                return true;
            }
        },
        changeComment: function(comment){   //若评论是0；改为评论
            if( comment == 0 ){
                return '评论';
            }else{
                return comment;
            }
        },
        changeZan: function(zan){           //若赞是0，改为赞
            if( zan == 0 ){
                return '赞';
            }else{
                return zan;
            }
        },
        openPicViewer: function(){},        //点击图片可预览图片，不写次事件则会进入帖子详情页，无需操作此事件
    }
};
</script>

<style lang="scss" scoped>
    @import '../css/postItem.scss';
    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s
    }
    .fade-enter, .fade-leave-active {
        opacity: 0
    }
    .tip-item{
        position: absolute;
    }
</style>
