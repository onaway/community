<template>
    <div class="reply-box" @click="hideBox">
        <div class="reply-btn">
            <ul>
                <li @click.stop="toCommentBox()">回复</li>
                <li @click="report()" v-if="showReport()">举报</li>
                <li @click="del()" v-else>删除</li>
            </ul>
        </div>
    </div>
</template>

<script>
import Toast from '@/components/toast/toast.js'
import { MessageBox } from 'mint-ui';
import {mapGetters,mapActions} from 'vuex'
export default {
    name: "ReplyBox",
    components: {MessageBox},    
    data: function() {
        return {
            user:'',         //用户token
            uid:'',          //用户uid
            delForm: {       //删除参数
                tid:'',
                uid:'',
                game:1,
                type:1,
                cid:'',
                becid:'',
                ctype:''
            },
        };
    },
    created:function(){
        this.user = this.api.islogin();
        let _uid = this.api.getCookie('uid');   //获取uid对象数据
        let uidJson = this.api.decode(_uid);    //解密uid对象数据
        this.uid = uidJson.uid;
    },
    computed:{
        ...mapGetters(['commentData'])  //vuex获取数据
    },
    methods: {
        ...mapActions(['delPostReplyData','delMessageReply']),
        toCommentBox: function () {     //进入评论组件
            if( this.user ){
                this.$router.push({path:'/commentbox'});
            }else{
                this.$router.push({path:'/login'})
            }
        },
        hideBox: function(){       //隐藏（回复和举报）组件，通过父子通信在父组件上绑定事件操作
            this.$emit('hidereplybox');
        },
        report: function(){        //显示举报
            if( this.user ){
                this.$emit('showreport');
            }else{
                this.$router.push({path:'/login'})
            }
        },
        del: function(){           //删除
            this.$emit('hidereplybox');      //隐藏本组件
            MessageBox.confirm('',{
                title:'',
                message: '确定删除这条评论吗？',
                confirmButtonText: '确定', 
                cancelButtonText: '取消'
            }).then(action=>{
                if( action == 'confirm' ){
                    this.delForm.tid = this.commentData.list.tid;
                    this.delForm.uid = this.user;
                    if( this.commentData.list.cid ){
                        this.delForm.type = 2;
                        this.delForm.cid = this.commentData.list.cid;
                        this.delForm.ctype = this.commentData.list.type;
                        this.delForm.becid = this.commentData.list.becid;
                    }else{
                        this.delForm.type = 1;
                        this.delForm.cid = '';
                        this.delForm.ctype = '';
                        this.delForm.becid = '';
                    }
                    if( this.delForm.tid == '' || this.delForm.uid =='' )return false;
                    this.api.post('community.lang.topic.mydel',this.delForm,this.CbDelData);
                }
            }).catch(err=>{
                if( err == 'cancel' ){}
            })
        },
        CbDelData: function(res){  //删除接口回调
            // console.log('del:',res);
            if( res.code == 1 ){
                Toast('删除成功');
                let reply = {};
                reply.cid = this.commentData.list.cid;
                reply.becid = this.commentData.list.becid;
                if( this.$route.name == 'CommentDetail' )this.delPostReplyData(reply);
                if( this.$route.name == 'PostText' )this.delMessageReply(reply.cid);
                this.$emit('delcom',this.commentData);      //删除评论自定义事件
            }
        },
        showReport: function(){  //显示删除还是举报
            if(typeof(this.commentData.list)==='undefined')return false;
            if( this.commentData.list.uid == this.uid ){
                return false;
            }else{
                return true;
            }
        },
    },
};
</script>

<style lang="scss" scoped>
    .reply-box{
        display: flex;
        align-items: center;
        justify-content: center;
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,.2);
        z-index: 999;
        .reply-btn{
            width: 3rem;
            background: #fff;
            border-radius: 5px;
            ul{
                li{
                    position: relative;
                    box-sizing:  border-box;
                    height: 0.9rem;
                    text-indent: 0.4rem;
                    line-height: 0.9rem;
                    &:first-child:after{
                        position: absolute;
                        left: 0.3rem;
                        bottom: 0;
                        content: '';
                        height: 1px;
                        width: 2.4rem;
                        border-bottom: 1px solid #e2e2e2;
                    }
                }
            }
        }
    }
</style>
