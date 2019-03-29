<template>
    <div class="msg-center">
        <header class="header"><i class="goback" @click="goBack" ></i>消息中心</header>
        <div class="space"></div>

        <!-- 遍历消息组件 -->
        <mt-loadmore :top-method="loadTop" ref="loadmore" @top-status-change="handleTopChange">
            <message-item v-for="item in notice" :key="item.id" :msgData="item" :mark="noticeData.hd"></message-item>
            <div slot="top" class="mint-loadmore-top">
                <span v-show="topStatus !== 'loading'" :class="{ 'rotate': topStatus === 'drop' }">↓下拉刷新</span>
                <span v-show="topStatus === 'loading'"><img src="/static/img/loading.gif"></span>
            </div>
        </mt-loadmore>

        <infinite-loading @infinite="onInfinite" ref="infiniteLoading" spinner="bubbles">
            <span slot="no-more">已经到底了~</span>
            <span slot="no-results">您还没有消息哦</span>
        </infinite-loading>
        <!-- 上拉下载，放在循环体下，当到此位置时会执行onInfinite方法 -->
        
    </div>
</template>

<script>
import MessageItem from '@/components/message/MessageItem.vue'
import InfiniteLoading from 'vue-infinite-loading'
import {Loadmore} from 'mint-ui';
import {mapGetters,mapActions} from 'vuex'
export default {
    name: "Password",
    components:{
        MessageItem,
        InfiniteLoading,
        Loadmore
    },
    data: function() {
        return {
            isMark:false,             //官方账号类名
            user:'',                  //用户token
            form:{
                uid:'',
                game:1,
                page:1
            },
            initPage:false,           //第一页开关
            topStatus: '',            //加载时提示区域的文字
        };
    },
    beforeRouteLeave(to, from, next) {
        if( to.name == 'CommentBox' )this.setComingRouter('MessageCenter');
        if( to.name == 'Home' )this.clearNoticeData();
        next();
    },
    computed: {
        ...mapGetters(['noticeData','notice','noticePage','isMsgLoadmore'])  
    },
    created() {
        this.user = this.api.islogin();
        this.form.uid = this.user;
    },
    mounted(){
        if( this.notice.length == 0 ){   //数据为空
            this.getDataList();
        }else{      //有数据
            this.initPage = true;
            this.form.page = this.noticePage;
            if( this.isMsgLoadmore ){       //若本来就到底了，则返回时不上拉加载
                this.$refs.infiniteLoading.$emit('$InfiniteLoading:loaded');
                this.$refs.infiniteLoading.$emit('$InfiniteLoading:complete');
            }
        }
        this.watchMark();
        setTimeout(()=>{        //发送消息，给后端提示清除已被删除的评论
            this.api.post('community.data.detail.clearMsg',{uid:this.user,game:1},this.CbClearMsg);
        },3000)

        // let title = '三国战纪--社区';
        let desc = '20年经典，正版授权，热血格斗，纯正街机手游';
        let url = window.location.href;
        let imgUrl = 'http://hotupdate.enjoymi.com/images/guanerye.jpg';
        this.wxShare.wx_share(desc,url,imgUrl);
    },
    watch:{
        mark(val){
            this.watchMark();
        }
    },
    methods: {
        ...mapActions(['setNoticeData','clearNoticeData','setComingRouter','setMessageLoadStatus']),
        CbClearMsg: function(res){},
        getDataList: function(){            //获取接口数据
            this.form.page = 1;
            this.api.post('community.data.detail.msgIndex',this.form,this.CbNoticeData);
        },
        onInfinite: function(){             //触发上拉加载方法
            if(!this.initPage)return false;
            setTimeout(()=>{
                if(this.form.page >= 1){  
                    this.form.page++;
                    this.api.post('community.data.detail.msgIndex',this.form,this.CbNoticeData);
                }
            },500)
        },
        CbNoticeData:function(res){         //接口数据
            // console.log('消息中心数据：',res.data);
            if (res.code == 1) {            // 如果查询结果为真
                this.initPage = true;
                if (res.data.return.length) {       // 如果有数据则进入将新的数据与老的数据拼接
                    if(this.form.page==1){
                        this.setNoticeData({data:res.data,type:'refresh',page:this.form.page});
                        this.$refs.infiniteLoading.$emit('$InfiniteLoading:reset');  //重置组件处于最初状态
                    }else{
                        this.setNoticeData({data:res.data,type:'loadmore',page:this.form.page});
                    }
                    // console.log('上拉加载的总数据:',this.noticeData.return)
                    this.$refs.infiniteLoading.$emit('$InfiniteLoading:loaded');     //$emit触发$InfiniteLoading:loaded事件
                    if( this.notice.length < (10*this.form.page) ){       //如果帖子总条数小于10*页数则数据加载完成
                        this.$refs.infiniteLoading.$emit('$InfiniteLoading:complete');
                        this.setMessageLoadStatus();
                    }
                }else{
                    if( this.notice.length > 0 ){
                        this.$refs.infiniteLoading.$emit('$InfiniteLoading:loaded');
                    }
                    this.$refs.infiniteLoading.$emit('$InfiniteLoading:complete'); //没有数据显示没有更多
                }

                // if( this.notice.length < (10*this.form.page) ){      
                //     this.$refs.infiniteLoading.$emit('$InfiniteLoading:loaded');
                //     this.$refs.infiniteLoading.$emit('$InfiniteLoading:complete');
                // }
            }
        },
        loadTop: function(){                //组件提供的下拉触发方法
            setTimeout(() => {
                this.getDataList();
                this.$refs.loadmore.onTopLoaded();// 固定方法，查询完要调用一次，用于重新定位
            }, 500);
        },
        handleTopChange: function(status){  //改变加载时提示区域的文字
            this.topStatus = status;
        },
        goBack: function(){                 //当页面没有浏览历史记录的时候返回主页，否则返回上一页
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
        watchMark:function(){               //监听是否是官方账号
            this.api.in_array;
            if(this.api.in_array(this.noticeData.return.uid,this.noticeData.hd)){    
                this.isMark = true;
            }else{
                this.isMark = false;
            }
        },
    },
};
</script>

<style lang="scss" scoped>
    .msg-center{
        .header{
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            z-index: 9;
        }
        .space{
            height: 1px;
            margin-top: 0.78rem;
        }
    }
    .mint-loadmore{
        overflow: visible;
    }
    //下拉刷新转圈图片样式
    .mint-loadmore-top img{
        width: 0.6rem;
        height: 0.6rem;
    }
</style>

