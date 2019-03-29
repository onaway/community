<template>
    <div class="comment-box">
        <header class="header" v-if="showTitle()"><i class="goback" @click="goBack"></i>评论话题<button @click="submit()" :disabled="disabled">发送</button></header>
        <header class="header" v-else><i class="goback" @click="goBack"></i>回复评论<button @click="submit()" :disabled="disabled">发送</button></header>
        <p><textarea :placeholder="holdercontent" @input="descInput" @click="setFocusIndex" v-model="content" ref="textarea"></textarea></p>
        <div class="publish-con" :class="{on:isTrue}">
            <div class="emoji-logo">
                <i class="icon-emoji" @click="showAllEmoji"></i>
                <span :class="{tored:changeColor}">{{count}}字符</span>
                <!-- <i class="pic"></i> -->
            </div>
            <div class="emoji-wrapper" v-show="isShow">
                <ul>
                    <li class="emoji-item" v-for="(list,index) in emojiData" :key="'list'+index" @click="choseEmoji(list.title)">
                        <!-- <img :src="'/static/img/emoji/'+list.url" :alt="list.title"> -->
                        <span class="emoticon" :style="{backgroundPosition: list.url}"></span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import Toast from '@/components/toast/toast.js'
import {mapGetters,mapActions} from 'vuex'
export default {
    name: "CommentBox",
    data: function(){
        return {
            isTrue: false,          //是否添加on类名
            isShow: false,          //是否显示所有的表情
            holdercontent:'',       //textarea输入框的placeholder
            content: '',            //回复内容
            form:{
                tid: '',
                uid: '',            //用户的uid
                toid: '',           //被评论的uid
                becid: '',
                type: '',
                content: '',
                game: 1,
            },
            comments:{},            //本页数据，vuex中获取的
            user:'',                //用户信息token
            disabled:false,         //button可不可点
            emojiData:[],           //表情集合
            count:200,              //文字的剩余长度
            changeColor: false,     //文字颜色是否变红
        };
    },
    computed:{
        ...mapGetters(['commentData','comingRouter'])  //vuex获取数据
    },
    mounted() {
        // console.log('this.comingRouter:',this.comingRouter);
        this.user = this.api.islogin();
        this.emojiData = this.api.emojiData;
        this.comments = this.commentData.list;
        // console.log('评论组件数据:',this.comments);
        setTimeout(()=>{
            this.$refs.textarea.focus();
        },200)
        
        // let title = '三国战纪--社区';
        let desc = '20年经典，正版授权，热血格斗，纯正街机手游';
        let url = window.location.href;
        let imgUrl = 'http://hotupdate.enjoymi.com/images/guanerye.jpg';
        this.wxShare.wx_share(desc,url,imgUrl);
    },
    methods: {
        ...mapActions(['changePostRefresh','setComReplyData','setPostReplyData','addHomeComment']),
        showAllEmoji:function(){       //显示所有表情
            this.isShow = this.isShow?false:true;
            if( this.isShow ){
                this.isTrue = true;
            }else{
                this.isTrue = false;
            }
        }, 
        choseEmoji: function(title){   //点击表情事件
            var textarea = document.getElementsByTagName('textarea')[0];
            var n = textarea.selectionStart;
            var startCon = this.content.substring(0,n);
            var endCon = this.content.substring(n);
            this.content = startCon + '['+ title +']' + endCon;
            var m = ('['+ title +']').length;
            var length = m + n;
            this.setCursorPosition(textarea,length);
            this.descInput();
        },
        setCursorPosition:function(el,index){
            var val = this.content;
            var len = val.length;
            if( len < index ) return;
            setTimeout(function(){
                if( el.setSelectionRange ){
                    el.setSelectionRange(index,index);
                }
            },30)
        },
        trim: function(str){           //去掉字符串首尾的空格
            return str.replace(/(^\s*)|(\s*$)/g, ""); 
        },
        submit: function () {          //提交评论
            // console.log('type',this.comments.type);
            
            if( !this.comments.type && !this.comments.cid ){
                this.form.type = 1;
                this.form.becid = 0;
            }else if( this.comments.type == 1 ){
                this.form.type = 2;
                this.form.becid = this.comments.cid;
            }else if( this.comments.type == 2 ){
                this.form.type = 3;
                this.form.becid = this.comments.becid;
                this.form.type_3_cid = this.comments.cid;
            }else if( this.comments.type == 3 ){
                this.form.type = 3;
                this.form.becid = this.comments.becid;
                this.form.type_3_cid = this.comments.cid;
            }
            this.form.tid = this.comments.tid;
            this.form.uid = this.user;
            this.form.toid = this.comments.uid;
            // this.form.uname = this.user.uname;
            // console.log('form:',this.form);
            if( this.form.uid == '' || this.form.uid == 0 )return false;
            if( this.form.tid===''||this.form.toid===''||this.form.becid==='' )return false;
            var flag = this.trim(this.content);
            if( this.content == ''|| flag.length < 1 ){
                Toast('还没有输入评论');
            }else {
                if( flag.length > 200 ){
                    Toast('话题内容超过200字符');
                }else{
                    if( !this.comments.type || this.comments.type == 1 ){        
                        this.form.content = this.content;
                    }else if( this.comments.type == 2 || this.comments.type == 3 ){   
                        this.form.content = this.comments.uid+'@'+this.content;
                    }
                    // console.log('this.form.content:',this.form.content);
                    this.api.post('community.lang.topic.comment',this.form,this.Cbcomments);
                }  
            }
        },
        Cbcomments: function(res){     //评论回调接口
            // console.log('评论接口数据：',res.data);
            if( res.code == 1 ){
                this.disabled = true;
                res.data.cid = res.data.cid.toString();
                if( this.comingRouter == 'PostText' ){
                    if( this.holdercontent == '说说你的看法...' ){  //若是评论帖子则清除数据否则不清除
                        this.changePostRefresh(true);
                    }else{
                        this.changePostRefresh(false);
                        this.setPostReplyData(res.data);
                    }
                }else if( this.comingRouter == 'CommentDetail' ){
                    this.setComReplyData(res.data);     //保存评论成功数据到vuex中
                    this.setPostReplyData(res.data);
                }
                // this.addHomeComment(this.comments.tid); //保存评论成功tid到vuex中
                Toast('评论成功');
                setTimeout(()=>{
                    this.$router.go(-1);
                },300)
            }else if( res.code == -90007 ){
                Toast('当前为人工审核时间，审核通过后才能显示');
                setTimeout(() => {
                    this.$router.go(-1);
                    this.content = '';
                }, 300);
            }else if( res.code == -20010 ){
                Toast('评论不存在');
                this.$router.go(-1);
            }else{
                this.api.getmsg(res);
            }
        },
        goBack: function(){            //如果有历史记录则返回上一页，否则回到主页
            this.changePostRefresh(false);
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
        showTitle: function(){         //显示评论话题还是回复评论
            if( !this.comments.type ){
                this.holdercontent = '说说你的看法...'
                return true;
            }else if( this.comments.type ){
                this.holdercontent = '回复@'+this.comments.uname;
                return false;
            }
        },
        setFocusIndex: function(){     //点击输入框让表情框隐藏
            this.isShow = false;
            this.isTrue = false;
        },
        descInput: function(){         //'xx'字符显示的颜色
            this.count = 200 - this.content.length;
            if( this.content.length > 200 )this.changeColor = true;
            if( this.content.length < 200 )this.changeColor = false;
        }
    },
    
};
</script>

<style lang="scss" scoped>
    @import '../css/commentBox.scss';
</style>
