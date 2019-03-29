<template>
    <div class="tip-item">
        <span @click="collect" v-show="isShow">{{collectContent}}</span>
        <span @click="share">分享</span>
        <span @click="report" v-if="showReport(tipData.uid)">举报</span>
        <span @click="del" v-else>删除</span>
    </div>
</template>

<script>
import Toast from '@/components/toast/toast.js'
import { MessageBox } from 'mint-ui';
import {mapActions} from 'vuex'
export default {
    name: "TipItem",
    components:{MessageBox},
    props: ['tipData','collection','index','homeTipItemShow'],             //父级帖子的信息
    data:function() {
        return {
            isShow: true,           //是否显示收藏
            isYourself: true,       //显示举报还是删除
            uid:'',                 //用户uid
            user: '',               //用户token
            collectForm:{           //收藏参数
                tid:'',
                uid:'',
                type: 1,
                game: 1
            },
            delForm: {              //删除参数
                tid:'',
                uid:'',
                game:1,
                type:1,
                cid:'',
                becid:'',
                ctype:''
            },
            hdAccount: {},          //登录记住我的账号和勾的状态
            collectContent:'收藏',
            message:'确定删除这条话题吗？',
            watchArr: []
        };
    },
    created:function (){
        this.user = this.api.islogin();
        let _uid = this.api.getCookie('uid');   //获取uid对象数据
        // console.log('tipData:',this.tipData);
        let uidJson = this.api.decode(_uid);    //解密uid对象数据
        this.uid = uidJson.uid;
        this.watchCollection();
    },
    watch:{
        collection(val){
            this.watchCollection();
        },
    },
    methods: {
        ...mapActions(['changeWxStatus','setCommentData','delOneHomeData','delOnePersonalData','delOnePostData',
        'delMessageData','changeHomeCollect','changePersonalCollect','delMessageReply']),
        watchCollection: function(){//监听是否收藏
            this.api.in_array;
            if( this.collection == undefined ){
                this.isShow = false;
            }else{
                this.isShow = true;
                if(this.api.in_array(this.tipData.tid,this.collection)){
                    setTimeout(()=>{
                        this.collectContent = '取消收藏';
                    },500)
                }else{
                    setTimeout(()=>{
                        this.collectContent = '收藏';
                    },500)
                }
            }
        },
        collect: function(){        //收藏
            if( this.user ){
                this.collectForm.tid = this.tipData.tid;
                this.collectForm.uid = this.user;
                this.collectForm.type = this.collectContent == '收藏'?1:2;
                if( this.collectForm.tid =='' || this.collectForm.uid == '' )return false;
                this.api.post('community.lang.topic.collection',this.collectForm,this.CbCollectionData);
            }else{
                this.$router.push({path:'/login'});
            } 
        },
        CbCollectionData: function(res){
            // console.log('点击收藏接口数据：',res);
            if( res.code == 1 ){
                this.changeHomeCollect(this.tipData.tid);           //改变首页收藏的文字
                this.changePersonalCollect(this.tipData.tid);       //改变个人中心页收藏的文字
                if( this.collectContent == "收藏" ){
                    setTimeout(()=>{
                        this.collectContent = '取消收藏';
                    },500);
                    
                    this.$emit('hidetip');      //隐藏本组件
                    this.$emit('addcol');       //个人中心我（他）的收藏的数量+1
                    Toast('收藏成功');
                }else{
                    setTimeout(()=>{
                        this.collectContent = '收藏';
                    },500);
                    
                    this.$emit('hidetip');
                    this.$emit('reducecol');    //个人中心我（他）的收藏的数量-1
                    Toast('取消收藏成功');
                }
            }else{
                this.api.getmsg(res);
            }
        },
        share: function(){          //分享
            if( this.homeTipItemShow ){     // 'homeTipItemShow'是首页传来的，辨别是不是首页的数据，则不用微信分享
                let localUrl = 'http://bbs.shmoak.com';
                let tid = this.tipData.tid;
                let game = this.api.getCookie('game');
                if( !game ) game = 1;
                let url = localUrl+'/posttext?tid='+tid+'&game='+game;
                this.api.copyStr(url);
                Toast('链接已复制，快去粘贴吧');
            }else{
                let ua = window.navigator.userAgent.toLowerCase();
                if(ua.match(/MicroMessenger/i) == 'micromessenger'){
                    this.changeWxStatus(true);
                }else{
                    let localUrl = 'http://bbs.shmoak.com';
                    let tid = this.tipData.tid;
                    let game = this.api.getCookie('game');
                    if( !game ) game = 1;
                    let url = localUrl+'/posttext?tid='+tid+'&game='+game;
                    this.api.copyStr(url);
                    Toast('链接已复制，快去粘贴吧');
                }
            }
            this.$emit('hidetip');      //隐藏本组件
        },
        report: function(){         //举报
            if( this.user ){
                let _data = {};
                _data.list = this.tipData;
                this.setCommentData(_data);     //提交数据到vuex中
                this.$emit('transferval');      //触发父级举报组件显示事件

            }else{
                this.$router.push({path:'/login'});
            }
        },      
        del: function(){            //删除
            this.$emit('hidetip');      //隐藏本组件
            if( this.tipData.cid ){     //删除评论详情页数据
                MessageBox.confirm('',{
                    title:'',
                    message: '确定删除这条评论吗？',
                    confirmButtonText: '确定', 
                    cancelButtonText: '取消'
                }).then(action=>{
                    if( action == 'confirm' ){
                        this.delForm.tid = this.tipData.tid;
                        this.delForm.uid = this.user;
                        this.delForm.type = 2;
                        this.delForm.cid = this.tipData.cid;
                        this.delForm.ctype = this.tipData.type;
                        this.delForm.becid = this.tipData.becid;
                        if( this.delForm.tid==''||this.delForm.uid==''||this.delForm.ctype==''||this.delForm.becid==='')return false;
                        this.api.post('community.lang.topic.mydel',this.delForm,this.CbDelData);
                    }
                }).catch(err=>{
                    if( err == 'cancel' ){}
                })  
            }else{          //删除帖子详情页数据
                MessageBox.confirm('',{     
                    title:'',
                    message: '确定删除这条话题吗？',
                    confirmButtonText: '确定', 
                    cancelButtonText: '取消'
                }).then(action=>{
                    if( action == 'confirm' ){
                        this.delForm.tid = this.tipData.tid;
                        this.delForm.uid = this.user;
                        this.delForm.type = 1;
                        this.delForm.cid = '';
                        this.delForm.ctype = '';
                        this.delForm.becid = '';
                        if( this.delForm.tid==''||this.delForm.uid=='' )return false;
                        this.api.post('community.lang.topic.mydel',this.delForm,this.CbDelData);
                    }
                }).catch(err=>{
                    if( err == 'cancel' ){}
                })
            }
        },
        CbDelData: function(res){
            // console.log('del:',res);
            if( res.code == 1 ){
                Toast('删除成功');
                if( this.$route.path == '/' ){
                    // console.log('index1:',this.index);
                    this.$emit('deltop',this.index);     //帖子删除的自定义事件
                }else if(this.$route.name == 'PersonalCenter'){
                    // console.log('index2:',this.index);
                    this.$emit('deltop',this.index);
                    this.$emit('reducetop');             //个人中心我的话题数量减一的自定义事件
                    this.delOneHomeData(this.tipData.tid);
                }else{
                    if( this.$route.name == 'PostText' ){
                        this.delOneHomeData(this.tipData.tid);
                        this.delOnePersonalData(this.tipData.tid);
                        this.delMessageData(this.tipData.tid);
                    }
                    if( this.$route.name == 'CommentDetail' ){
                        this.delOnePostData(this.tipData.cid);  //删除帖子详情页的评论
                        this.delMessageReply(this.tipData.cid);
                    }
                    setTimeout(()=>{
                        this.$router.go(-1);
                    },500)
                }
            }else{
                this.api.getmsg(res);
            }
        },
        showReport: function(uid){  //显示删除还是举报
            if( uid == this.uid ){
                return false;
            }else{
                return true;
            }
        } 
    }
};
</script>

<style lang="scss" scoped>
    .tip-item{
        // position: fixed;
        right: 0.1rem;
        top: 1rem;
        width: 1.6rem;
        // height: 2.4rem;
        font-size: 16px;
        color: #000;
        // padding: 0 0.2rem;
        border: 1px solid #e2e2e2;
        border-radius: 3px;
        background: #fff;
        box-shadow: 0 1px 1px #ccc;
        z-index: 10;
        span{
            display: block;
            height: 0.8rem;
            line-height: 0.8rem;
            text-align: center;
            border-bottom: 1px solid #e2e2e2;
            
            &:nth-child(3){
                border-bottom: none;
            }
        } 
    }
</style>


