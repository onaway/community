<template>
    <div class="comment-item">
        <div class="comment-first-user clearfix">
            <div @click="toPersonalCenter(reps.uid)"><img :src="changeSrc()"></div>
            <div class="user-con">
                <h2 :class="{official:isMark}" @click="toPersonalCenter(reps.uid)">{{reps.uname}}</h2>
                <p><span>{{updateTime(reps.time*1000)[0]}}</span><span>{{updateTime(reps.time*1000)[1]}}</span></p>
            </div>
            <i class="icon-lz ico" v-if="uid==reps.uid"></i>
            <i class="icon-hot ico" v-if="reps.hot==1"></i>
            <ul>
                <!-- <li @click="praise('comment','')"><i class="icon-zan" :class="{on:showtopic(reps.cid)}"></i> <span>{{reps.zan}}</span></li> -->
                <li @click="praise('comment','','')"><i class="icon-zan" :class="{on:isShow}"></i><span>{{reps.zan}}</span></li>
                <li @click="toCommentBox"><i class="icon-comment"></i><span>{{reps.comment}}</span></li>
            </ul>
        </div>
        <p class="comment-con" @click="showReplyBox(reps,'',num)" v-html="analyzeEmoji(reps.content)"></p>

        <div class="comment-container">
            <div class="comment-sec-user" v-for="(reply,index) in replies" :key="reply.id">
                <ul class="clearfix comment-user-box">
                    <li><h3 class="comment-user-name"  @click="toPersonalCenter(reply.uid)">{{reply.uname}}</h3></li>
                    <li class="day">{{updateTime(reply.time*1000)[0]}}</li>
                    <li class="hour">{{updateTime(reply.time*1000)[1]}}</li>
                    <li v-if="uid==reply.uid"><i class="icon-lz"></i></li>
                    <li class="comment-zan">
                        <i class="icon-zan" :class="{on:showReplyZan(reply.cid)}" @click="praise('reply',index,reply.cid)"></i><span>{{getZanCount(reply.cid)}}</span>
                    </li>
                </ul>

                <p class="reply" :class="{active:twoLine}" @click="showReplyBox(reply,index,num)" v-if="showSentence(reply.type)" >
                    <span>回复</span><span class="on" @click="toPersonalCenter(replyUid(reply.content))">{{"@"+(reply.toname)}}</span><span v-html="'：'+analyzeEmoji(replyContent(reply.content))"></span>
                </p>
                <p class="reply" :class="{active:twoLine}" @click="showReplyBox(reply,index,num)" v-else v-html="analyzeEmoji(reply.content)"></p>
            </div>
        </div>
        <div class="more-comment" v-if="showMoreComment(reps.len)" @click="toCommentDetail(reps.cid)">查看全部{{reps.len}}条回复</div>
    </div>
</template>

<script>
import Toast from '@/components/toast/toast.js'
import {mapActions} from 'vuex'
export default {
    name: "CommentItem",
    props:[
        'reps',
        'replies',
        'zan',
        'mark',     //官方账号
        'num',      //循环评论索引值
        'uid',      //用户uid
        'tid'       //帖子id，传给评论详情页，微信分享链接用
    ],
    data: function() {
        return {
            twoLine:false,          //评论的回复显示两条
            isBlue:false,           //是否显示蓝色字体
            isShow:false,           //评论的赞和取消赞
            isTrue:false,           //帖子的赞和取消赞
            isMark:false,           //官方账号类名
            praiseForm:{            //赞的参数
                action: 'c',
                tid:'',
                cid:'',
                type: 1,
                uid:''
            },
            user: '',               //用户token       
            praiseList:{},          //初始化赞为true的集合
            cidNumberList:{},       //初始化每个评论的每个回复（cid）赞的数量
        };
    },
    created: function(){
        this.user = this.api.islogin();
        this.watchZan();
        this.watchMark();
        this.initReplyState(); 
    },
    watch: {
        zan(newVal,oldVal){
            this.watchZan();
        },
    },
    methods: {
        ...mapActions(['setCommentData','changePostPraise']),
        changeSrc: function(){              //头像的路径
            if( typeof(this.reps.head.img) === 'undefined' ){
                return '/static/img/failed.jpg';
            }else{
                let reg = /^wj/.test(this.reps.head.img);
                if( reg ){
                    return '/static/img/head/'+this.reps.head.img;
                }else{
                    return 'http://hotupdate.enjoymi.com/community/img/'+this.reps.head.img;
                }
            }
        },
        watchZan:function(){                //监听赞的变化
            this.api.in_array;
            if(this.api.in_array(this.reps.cid,this.zan)){    
                this.isShow = true;
            }else{
                this.isShow = false;
            }
        },
        watchMark:function(){               //监听是否是官方账号
            this.api.in_array;
            if(this.api.in_array(this.reps.uid,this.mark)){    
                this.isMark = true;
            }else{
                this.isMark = false;
            }
        },
        showReplyZan: function (cid) {      //回复点赞是否变红
            if(this.praiseList[cid]===undefined)return false;
            // console.log('zan cid:',this.praiseList[cid],' checking cid:',cid);
            return this.praiseList[cid];
        },
        setReplyZan:function (cid) {        //改变回复点赞是否变红的变量的状态
            if(typeof(this.praiseList[cid])==='undefined'){
                this.praiseList[cid] = false;
            }
            if(this.praiseList[cid]==true){
                this.praiseList[cid] = false;
            }else{
                this.praiseList[cid] = true;
            }
        },
        initReplyState: function () {       //初始化数据
            let nb = {};
            let ns = {};
            if(typeof(this.user)==='undefined' || this.user==false)return false;
            for(let i in this.zan) {
                nb[this.zan[i]] = true;
            }
            for(let j in this.replies){
                let reply = this.replies[j];
                ns[reply.cid] = parseInt(reply.zan);
            }
            // console.log('praiseList:',nb , ' cidNumberList: ',ns);
            this.cidNumberList = ns;
            this.praiseList = nb;
        },
        getZanCount: function (cid) {       //回复赞的数量
            return this.cidNumberList[cid];
        },
        praise: function(str,index,cid){    //赞和取消赞
            if( this.user ){
                if( str == 'comment' ){
                    this.praiseForm.tid = this.reps.tid;
                    this.praiseForm.cid = this.reps.cid;
                    this.praiseForm.uid = this.user;
                    this.praiseForm.type = this.isShow?2:1;
                    // console.log('comment praiseForm',this.praiseForm);
                    if(  this.praiseForm.tid==''|| this.praiseForm.cid==''|| this.praiseForm.uid=='' )return false;
                    this.api.post('community.lang.topic.zan',this.praiseForm,this.CbCommentPraise);

                }else if( str == 'reply' ){
                    console.log('this.replies:',this.replies[index],' index:',index,' cid:',cid)
                    this.praiseForm.tid = this.replies[index].tid;
                    this.praiseForm.cid = cid;
                    this.praiseForm.uid = this.user;
                    if(  this.praiseForm.tid==''|| this.praiseForm.cid==''|| this.praiseForm.uid=='' )return false;
                    let replyZanstate = this.showReplyZan(cid);
                    if(replyZanstate===true){
                        this.praiseForm.type = 2;
                        this.cidNumberList[cid] = this.cidNumberList[cid]-1;
                    }else{
                        this.praiseForm.type = 1;
                        this.cidNumberList[cid] = this.cidNumberList[cid]+1;
                    }
                    this.setReplyZan(cid);
                    this.api.post('community.lang.topic.zan',this.praiseForm,this.CbReplyPraise);
                }
            }else{
                this.$router.push({path:'/login'});
            }
        },
        CbCommentPraise: function(res){     //评论赞的回调接口数据
            // console.log('评论赞的接口数据:',res);
            if( res.data == 1 ){
                this.changePostPraise(this.reps.cid);
                this.isShow = !this.isShow;
            }else{
                this.api.getmsg(res);
            }
        },
        CbReplyPraise:function(res){        //回复赞的回调接口数据
            console.log('回复赞的接口数据: ',res);
            if( res.data == 1 ){}
        },
        toCommentBox:function(){            //跳转评论组件，传数据
            if( this.user ){
                let _data = {};
                _data.list = this.reps;
                this.setCommentData(_data);   //提交数据到vuex中
                this.$router.push({path:'/commentbox'})
            }else{
                this.$router.push({path:'/login'})
            }
        },
        commentDetail: function(){          //跳转展开评论页面
            this.$router.push({path:'/commentdetail'});
        },
        showMoreComment: function (length) {  //显示和隐藏查看全部回复那一行
            if( length >= 2 ){
                this.twoLine = true;
                return true;
            }else{  
                this.twoLine = false;
                return false;
            }
        },
        showReplyBox: function(rep,index,num){//显示回复和举报组件,
            let _data = {};
            _data.list = rep;
            _data.index = index;
            _data.num = num;
            this.$emit('toolbox');          //绑定父组件toolbox事件，父子通信 
            this.setCommentData(_data);     //提交数据到vuex中
        },
        toPersonalCenter: function(uid){    //跳转到个人中心
            let urlJson = {};       
            urlJson.uid = uid;
            let _url = this.api.encode(urlJson);       //通过base64加密传给个人中心
            let encodeUrl = encodeURIComponent(_url)   //将特殊的字符如‘：;/?:@&=+$,# ’进行替换
            this.$router.push({path: `/personalcenter/${encodeUrl}`});
        },
        updateTime: function(timeValue){    //改变时间显示
            return this.api.getTime(timeValue);
        },
        toCommentDetail: function(cid){     //跳转评论详情页,传tid及加密的uid对象
            let uidJson = {};
            uidJson.uid = this.uid;
            let _url = this.api.encode(uidJson);        //base64加密
            let encodeUrl = encodeURIComponent(_url);   //将特殊的字符如‘：;/?:@&=+$,# ’进行替换
            this.$router.push({path: '/commentdetail',query:{cid:cid,tid:this.tid,uid:encodeUrl}});
        },
        showSentence: function(type){       //是否显示 ‘回复@xxx’ 的句子
            if( type == 3 ) {
                return true;
            };
        },
        analyzeEmoji: function(cont) {      //编译表情替换成图片展示出来
            return this.api.analyzeEmoji(cont);
        },
        replyUid: function(content){        //获取回复的用户uid
            let n = content.indexOf("@");
            return content.substring(0,n);
        },
        replyContent: function(content){    //获取回复的内容
            let n = content.indexOf("@");
            return content.substr(n+1);
        }
    }
};
</script>

<style lang="scss" scoped>
    @import '../css/commentItem.scss';
</style>
