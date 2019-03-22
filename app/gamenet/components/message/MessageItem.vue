<template>
    <div class="message-item" v-if="showMessage">
        <div class="comment-user clearfix">
            <div @click="toPersonalCenter(msgData.uid,msgData.toid)"><img v-if="showPic(msgData.head.state)" :src="changeSrc()"></div>
            <div class="user-con">
                <h2 :class="{official:isMark}" @click="toPersonalCenter(msgData.uid,msgData.toid)">{{msgData.uname}}</h2>
                <p><span>{{updateTime(msgData.time*1000)[0]}}</span><span>{{updateTime(msgData.time*1000)[1]}}</span></p>
            </div>
            <button class="reply-btn" @click="toCommentBox(msgData)" v-if="isShow">回复</button>
        </div>
        <div class="reply-con"><span :style="{background:delColor}" v-html="analyzeEmoji(replyContent(msgData.cid_flag,msgData.content))"></span></div>
        <!-- <div class="reply-con" v-html="analyzeEmoji(writeCon(msgData.content))"></div> -->
        <div class="post-text" @click="toPostText(msgData.tid)" v-html="analyzeEmoji(msgData.becontent)"></div>
    </div>
</template>

<script>
import {mapActions} from 'vuex'
export default {
    name: "MessageItem",
    props:['msgData','mark'],
    data:function() {
        return {
            isMark:false,           //官方账号类名
            isShow:true,            //被删除评论隐藏回复按钮
            showMessage:true,       //是否显示消息
            user: '',               //用户信息token
            delColor: ''            //删除评论的背景色
        };
    },
    created:function(){
        this.user = this.api.islogin();
        this.watchMark();
        this.watchReplyButton();
        this.watchMessageItem();
    },
    watch:{
        mark(val){
            this.watchMark();
        },
        msgData:{
            handler(val){
                this.watchReplyButton();
                this.watchMessageItem();
            },
            deep:true
        }
    },
    methods: {
        ...mapActions(['setCommentData']),
        watchMark:function(){                   //监听是否是官方账号
            function in_array(search,array){       //判断字符串是否在数组中
                for(var i in array){
                    if(array[i]==search){
                        return true;
                    }
                } 
                return false;
            }
            if(in_array(this.msgData.uid,this.mark)){    
                this.isMark = true;
            }else{
                this.isMark = false;
            }
        },
        watchReplyButton:function(){
            if( this.msgData.uid == '' || this.msgData.cid_flag == false ){
                this.isShow = false;
            }
        },
        watchMessageItem: function(){
            if( this.msgData.tid_flag == false ){   //删除帖子
                this.showMessage = false;
            }
        },
        changeSrc: function(){                  //头像的路径
            let reg = /^wj/.test(this.msgData.head.img);
            if( reg ){
                return '/static/img/head/'+this.msgData.head.img;
            }else{
                return 'http://hotupdate.enjoymi.com/community/img/'+this.msgData.head.img;
            }
        },
        toCommentBox:function(data){            //跳转评论组件，传数据
            if( this.user ){
                let _data = {};
                _data.list = data;
                this.setCommentData(_data);   //提交数据到vuex中
                this.$router.push({path:'/commentbox'})
            }else{
                this.$router.push({path:'/login'})
            }
        },
        toPersonalCenter: function(uid,toid){   //跳转到个人中心的两种写法
            let urlJson = {};   
            if( uid && toid ){
                urlJson.uid = uid;
                let _url = this.api.encode(urlJson);       //通过base64加密传给个人中心
                let encodeUrl = encodeURIComponent(_url)   //将特殊的字符如‘：;/?:@&=+$,# ’进行替换
                this.$router.push({path: `/personalcenter/${encodeUrl}`});
            }else if( !uid ){
                urlJson.uid = toid;
                let _url = this.api.encode(urlJson);       
                let encodeUrl = encodeURIComponent(_url)   
                this.$router.push({path: `/personalcenter/${encodeUrl}`});
            }  
        },
        updateTime: function(timeValue){       //改变时间显示
            return this.api.getTime(timeValue);
        },
        toPostText :function(tid){             //进帖子详情页,传tid给详情页
            this.$router.push({path: '/posttext',query:{tid:tid}});
        },
        writeCon:function(content){
            var tmp = content.split('：');
            if( tmp.length >= 2 ){
                tmp.shift();
                return tmp.join(':');
            }else{
                return content;
            }
        },
        analyzeEmoji: function(cont) {         //编译表情替换成图片展示出来
            return this.api.analyzeEmoji(cont);
        },
        showPic: function(state){              //如果图片的state=0不显示，否则显示
            // console.log('state:',state);
            if( state == 0 ){
                return false;
            }else{
                return true;
            }
        },
        replyContent: function(flag,content){   //获取回复的内容
            if( flag == true ){
                let n = content.indexOf("@");
                return content.substr(n+1);
            }else{
                this.delColor = '#dbdbdb';
                return '该评论已被删除';
            }
        }
    },
};
</script>

<style lang="scss" scoped>
    .message-item{
        margin-top: 0.1rem;
        padding: 0 0.3rem 0.3rem;
        background: #fff;
        .comment-user{
            position: relative;
            height: 0.8rem;
            padding: 0.1rem 0;
            img{
                float: left;
                width: 0.8rem;
                height: 0.8rem;
                margin-right: 0.2rem;
                border-radius: 50%;
                object-fit: cover;
            }
            .user-con{
                float: left;
                display: flex;
                flex-direction: column;
                justify-content: center;
                height: 100%;
                line-height: 1.4;
                h2{
                    font-size: 14px;
                    font-weight: bold;
                    color: #727176;
                }
                .official{
                    color: #ff8200;
                }
                p{
                    font-size: 12px;
                    color: #949494;
                    span:first-child{
                        margin-right: 0.2rem;
                    }
                }
            }
            .reply-btn{
                position: absolute;
                right: 0;
                top: 0.2rem;
                width: 1.2rem;
                height: 0.6rem;
                border-radius: 5px;
                border: 1px solid #e2e2e2;
                outline: none;
                background: #fff;
                // box-shadow: 2px 3px 3px #999;
            }
        }
        .reply-con{
            word-break: break-all;
        }
        .post-text{
            text-indent: 0.2rem;
            line-height: 2.6;
            // padding: 0.15rem 0.2rem;
            margin-top: 0.1rem;
            background: #f2f2f2;
            border-radius: 5px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
    }
</style>
