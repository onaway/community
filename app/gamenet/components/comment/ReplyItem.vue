<template>
    <div class="reply-item">
        <div class="comment-second-user clearfix">
            <div @click="toPersonalCenter(replies.uid)"><img :src="changeSrc()"></div>
            <div class="user-con">
                <h2 :class="{official:isMark}" @click="toPersonalCenter(replies.uid)">{{replies.uname}}</h2>
                <p><span>{{updateTime(replies.time*1000)[0]}}</span><span>{{updateTime(replies.time*1000)[1]}}</span></p>
            </div>
            <i class="icon-lz" v-if="uid==replies.uid"></i>
            <div class="praise" @click="praise"><i class="icon-zan" :class="{on:isTrue}"></i><span>{{replies.zan}}</span></div>
        </div>
        <p class="comment-con" @click="showReplyBox(replies,index)" v-if="showSentence(replies.type)">
            <span>回复</span><span class="change-color" @click="toPersonalCenter(replyUid(replies.content))">{{"@"+(replies.toname)}}</span><span v-html="'：'+analyzeEmoji(replyContent(replies.content))"></span>
        </p>
        <p class="comment-con" @click="showReplyBox(replies,index)" v-else v-html="analyzeEmoji(replies.content)"></p>
    </div>
</template>

<script>
import Toast from '@/components/toast/toast.js'
import {mapActions} from 'vuex'
export default {
    name: "ReplyItem",
    props:['replies','zan','mark','index','uid'],
    data: function() {
        return {
            isTrue:false,       //点赞是否变红
            isMark:false,       //官方账号类名
            hdAccount: {},      //登录记住我的账号和勾的状态
            form:{              //赞的参数
                action: 'c',
                tid:'',
                cid:'',
                type: 1,
                uid:''
            },
            user:''             //用户信息token
        };
    },
    created: function(){
        this.user = this.api.islogin();
        this.watchZan();
        this.watchMark();
        // console.log(this.uid);
    },
    watch:{
        zan(newval,oldval){
            this.watchZan();
        },
        mark(newval,oldval){
            this.watchMark();
        }
    },
    methods: {
        ...mapActions(['setCommentData','changePostReplyPraise']),
        in_array: function(search,array){     //判断字符串是否在数组中
            for(var i in array){
                if(array[i]==search){
                    return true;
                }
            } 
            return false;
        },
        watchZan:function(){                  //监听赞的变化  
            this.in_array();
            if(this.in_array(this.replies.cid,this.zan)){    
                this.isTrue = true;
            }else{
                this.isTrue = false;
            }
        },
        watchMark:function(){                 //监听是否是官方账号
            this.in_array();
            if(this.in_array(this.replies.uid,this.mark)){    
                this.isMark = true;
            }else{
                this.isMark = false;
            }
        },
        changeSrc: function(){                  //头像的路径
            if( typeof(this.replies.head.img) === 'undefined' ){
                return '/static/img/failed.jpg';
            }else{
                let reg = /^wj/.test(this.replies.head.img);
                if( reg ){
                    return '/static/img/head/'+this.replies.head.img;
                }else{
                    return 'http://hotupdate.enjoymi.com/community/img/'+this.replies.head.img;
                }
            }
        },
        praise: function(){                   //赞和取消赞
            if( this.user ){
                this.form.tid = this.replies.tid;
                this.form.cid = this.replies.cid;
                this.form.uid = this.user;
                this.form.type = this.isTrue?2:1;
                if( this.form.tid==''||this.form.cid==''|| this.form.uid=='' )return false;
                // console.log('reply form',this.form);
                this.api.post('community.lang.topic.zan',this.form,this.CbReplyPraise);
            }else{
                this.$router.push({path:'/login'});
            }
        },
        CbReplyPraise: function(res){
            // console.log('res:',res);
            if( res.code == 1 ){
                let reply = {};
                reply.cid = this.replies.cid;
                reply.becid = this.replies.becid;
                this.changePostReplyPraise(reply);
                if( this.isTrue ){
                    this.replies.zan = parseInt(this.replies.zan) - 1;
                }else{
                    this.replies.zan = parseInt(this.replies.zan) + 1;
                }
                this.isTrue = !this.isTrue;
            }else{
                this.api.getmsg(res);
            }
        },
        showReplyBox: function(rep,index){        //显示（回复和举报）组件
            let _data = {};
            _data.list = rep;
            _data.index = index;
            this.setCommentData(_data);   //提交数据到vuex中
            this.$emit('toolbox');          //绑定父组件toolbox事件，父子通信 
        },
        toPersonalCenter: function(uid){    //跳转个人中心
            let urlJson = {};       
            urlJson.uid = uid;
            let _url = this.api.encode(urlJson);       //通过base64加密传给个人中心
            let encodeUrl = encodeURIComponent(_url)   //将特殊的字符如‘：;/?:@&=+$,# ’进行替换
            // this.$router.push({name:'PersonalCenter',params:{uid:encodeUrl}});
            this.$router.push({path: `/personalcenter/${encodeUrl}`});
        },
        updateTime: function(timeValue){    //改变时间显示
            return this.api.getTime(timeValue);
        }, 
        showSentence: function(type){          //是否显示 ‘回复@xxx’ 的句子
            if( type == 3 ) {
                return true;
            };
        },
        analyzeEmoji: function(cont) {     //编译表情替换成图片展示出来
            return this.api.analyzeEmoji(cont);
        },  
        replyUid: function(content){          //获取回复的用户uid
            let n = content.indexOf("@");
            return content.substring(0,n);
        },
        replyContent: function(content){      //获取回复的内容
            let n = content.indexOf("@");
            return content.substr(n+1);
        }
    },
};
</script>

<style lang="scss" scoped>
    .reply-item{
        background: #f3f3f3;
        i{
            background-image: url('/static/img/icon.png');
            background-size: 6.4rem 4.8rem;
        }
        /*二级用户信息*/
        .comment-second-user{
            position: relative;
            height: 0.8rem;
            padding: 0.2rem 0.3rem 0.1rem;
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
                line-height: 1;
                h2{
                    font-size: 14px;
                    font-weight: bold;
                    color: #727176;
                    margin: 0.05rem 0;
                }
                .official{
                    color: #ff8200;
                }
                p{
                    font-size: 12px;
                    color: #949494;
                    margin: 0.05rem 0;
                    span:first-child{
                        margin-right: 0.2rem;
                    }
                }
            }
            .icon-lz{
                float: left;
                width: 0.56rem;
                height: 0.34rem;
                margin: 0.05rem 0 0 0.1rem;
                background-position: -1.71rem -1.88rem;
            }
            .praise{
                position: absolute;
                right: 0;
                top: 0.2rem;
                height: 0.34rem;
                font-size: 13px;
                .icon-zan{
                    display: inline-block;
                    width: 0.34rem;
                    height: 100%;
                    background-position: -5.84rem -0.25rem;
                    &.on{
                        background-position: -5.84rem -1.05rem;
                    }
                }
                span{
                    color: #949494;
                    vertical-align: 20%;
                    &:last-child{
                        margin-right: 0.2rem;
                    }
                }
            }
        }
        .comment-con{
            word-break: break-all;
            padding: 0 0.3rem 0.2rem;
            border-bottom: 1px solid #e2e2e2;
        }
        .change-color{
            color: #2e9ffe;
        }
    }
</style>