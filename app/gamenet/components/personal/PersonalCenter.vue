<template>
    <div class="personal-center" @touchmove="touchmove" @touchend="touchmend">
        <header class="header">
            <i class="goback" @click="goBack"></i>
            <i class="feedback" @click="toFeedback" v-show="showFeedBack"></i>
        </header>
        <div class="personal-msg">
            <!-- <img class="user-pic" :src="changeSrc()" @click.stop="openPicViewer(topicData.hehead,1,0)"> -->
            <img class="user-pic" :src="changeSrc()" preview=1>
            <h2>{{topicData.uname}}</h2>
            <i class="icon-edit" @click="toMyData" v-show="showRoleId"></i>
            <!-- <p v-show="showRoleId()">角色ID：<em @click="tobind">{{ roleid }}</em></p> -->
        </div>
        
        <div class="nav">
            <span :class="{on:showTab===true}" @click="tabShow('topic')">{{topicCon(myuid,comingUid)}} {{topicData.len}}</span>
            <span :class="{on:showTab===false}" @click="tabShow('collection')">{{collectionCon(myuid,comingUid)}} {{topicData.collectionNums}} </span>
        </div>

        <mt-tab-container class="page-tabbar-tab-container" v-model="active" value="collection">
            <mt-tab-container-item id="topic">
                <!-- 遍历帖子列表 -->
                <post-item v-for="(list,index) in topic" :key="list.id" :lists="list" :index="index" :t_zan="topicData.tzan" 
                :spotStatus="spotStatus" :collection="topicData.myCollection" :mark="topicData.hd" :postTid="postTid"
                homeTipItemShow="homeTipItemShow" @parentshow="showReport" @changeTip="changeTipStatus"
                @reducetopicnum="reduceNum" @addcollectionnum="addNum" @reducecolnum="reduceCollectionNum" @deletetop="deleteTopic"></post-item>

                <infinite-loading @infinite="onInfinite" ref="infiniteLoading" spinner="bubbles">
                    <span slot="no-more">已经到底了~</span>
                    <span slot="no-results">{{noMoreTopic(myuid,comingUid)}}</span>
                </infinite-loading>
                <!-- 放在循环体下，当到此位置时会执行onInfinite方法 -->
            </mt-tab-container-item>
            <mt-tab-container-item id="collection">
                <!-- 遍历收藏列表 -->
                <post-item v-for="(list,index) in collect" :key="list.id" :lists="list" :index="index" :spotStatus="spotStatus"
                :t_zan="collectionData.tzan" flag="collect" :collection="collectionData.myCollection" :comingUid="comingUid"
                :mark="collectionData.hd" :postTid="postTid" homeTipItemShow="homeTipItemShow" 
                @parentshow="showReport" @changeTip="changeTipStatus" @delcol="delCollect"></post-item>

                <infinite-loading @infinite="infinite" ref="infiniteLoad" spinner="bubbles">
                    <span slot="no-more">已经到底了~</span>
                    <span slot="no-results">{{noMoreCollection(myuid,comingUid)}}</span>
                </infinite-loading>
                <!-- 放在循环体下，当到此位置时会执行onInfinite方法 -->
            </mt-tab-container-item>
        </mt-tab-container>

        <!-- 举报组件 -->
        <transition name="fade" mode="out-in">
            <report v-show="isSee" :repData="postTmp" @parentcancel="cancelReport" ></report>
        </transition>

        <!-- 404组件 -->
        <error-item v-if="showError"></error-item>
    </div>
</template>

<script>
import PostItem from '@/components/common/PostItem.vue'
import Report from '@/components/common/Report.vue'
import ErrorItem from '@/components/error/ErrorItem.vue'
import InfiniteLoading from 'vue-infinite-loading'
import { TabContainer, TabContainerItem } from 'mint-ui';
import {mapGetters,mapActions} from 'vuex'
export default {
    name: "PersonalCenter",
    components:{
        PostItem,
        Report,
        ErrorItem,
        InfiniteLoading,
        TabContainer, 
        TabContainerItem
    },
    data: function() {
        return {
            isSee: false,            //举报组件是否显示 
            showError:false,         //是否显示404页面
            showFeedBack:false,      //是否显示反馈图标
            showRoleId:false,        //是否显示编辑图标
            spotStatus: true,        // "···" 显示的开关
            postTmp: {},             //点击的帖子数据
            user: '',                //用户token
            myuid:'',                //用户的uid
            form: {                  //话题接口参数
                uid: '',
                myuid:'',
                page: 1,
                game: 1
            },
            comingUid:'',            //传来的uid
            collectionForm:{         //收藏接口参数
                uid:'',
                myuid:'',
                page: 1,
                game: 1
            },
            initPage: false,         //第一页开关
            postTid:'',              //postItem中点击的tid传过来的值
            showTab: true,           //点击选项卡显示的类名
            active: 'topic',         //选择的选项卡内容   
        };
    },
    beforeRouteLeave(to, from, next) {
        if( to.name == 'Home' ){
            this.clearPersonalData();
        }
        next();
    },
    computed: {
        ...mapGetters(['topicData','topic','topicPage','collectionData','collect','collectionPage','delStatus','isPerLoadmore'])  
    },
    created() {
        // window.scrollTo(0, 0);
        let _comingUid = this.$route.params.uid;
        let comingJson = this.api.decode(_comingUid);    //解密传进来的uid对象数据
        let inUid = comingJson.uid;
        this.comingUid = inUid; 
        // console.log('this.comingUid:',this.comingUid);

        let _myuid = this.api.getCookie('uid');   //获取用户uid对象数据
        let myuidJson = this.api.decode(_myuid);  //解密用户uid对象数据
        this.myuid = myuidJson.uid;
        this.user = this.api.islogin();
        if( this.myuid == this.comingUid ){
            this.showFeedBack = true;
            this.showRoleId = true;
        }
        this.form.uid = this.comingUid;
        this.form.myuid = this.user;
        if( !this.form.myuid )this.form.myuid = '';
        if( this.form.uid == '' )return false;
    },
    mounted(){
        if( this.topic.length == 0 ){   //数据为空
            this.getDataList();
        }else{      //有数据
            // console.log('有数据');
            this.initPage = true;
            this.form.page = this.topicPage;
            if( this.isPerLoadmore ){       //若本来就到底了，则返回时不上拉加载
                this.$refs.infiniteLoading.$emit('$InfiniteLoading:loaded');
                this.$refs.infiniteLoading.$emit('$InfiniteLoading:complete');
            }
        }

        // let title = '三国战纪--社区';
        let desc = '20年经典，正版授权，热血格斗，纯正街机手游';
        let url = window.location.href;
        let imgUrl = 'http://hotupdate.enjoymi.com/images/guanerye.jpg';
        this.wxShare.wx_share(desc,url,imgUrl);
    },
    methods: {
        ...mapActions(['setTopicData','setCollectionData','clearPersonalData','clearTopicData','clearCollectData','setPersonalLoadStatus']),
        getDataList: function(){        //获取接口数据
            this.form.page = 1;
            this.api.post('community.data.detail.myindex',this.form,this.CbTopicData);
        },
        onInfinite: function(){         //触发上拉加载方法
            if(!this.initPage)return false;
            setTimeout(()=>{
                if(this.form.page >= 1){  
                    this.form.page++;
                    this.api.post('community.data.detail.myindex',this.form,this.CbTopicData);
                }
            },500)
        },
        CbTopicData: function(res){          //接口数据
            // console.log('个人中心数据:',res.data);
            if (res.code == 1) {           
                this.initPage = true;
                if (res.data.f_data.length) {       // 如果有数据则进入将新的数据与老的数据拼接
                    if( this.form.page == 1 ){
                        this.setTopicData({data:res.data,type:'refresh',page:this.form.page});
                    }else{
                        this.setTopicData({data:res.data,type:'loadmore',page:this.form.page});
                    }
                    // console.log('上拉加载的总数据:',this.topicData.f_data);
                    this.$refs.infiniteLoading.$emit('$InfiniteLoading:loaded');    //$emit触发$InfiniteLoading:loaded事件
                    if( this.topic.length < (10*this.form.page) ){        //如果帖子总条数小于10*页数则数据加载完成
                        this.$refs.infiniteLoading.$emit('$InfiniteLoading:complete');
                        this.setPersonalLoadStatus();
                    }
                }else{
                    if( this.topic.length > 0 ){
                        this.$refs.infiniteLoading.$emit('$InfiniteLoading:loaded');
                    }else{
                        this.setTopicData({data:res.data,type:'refresh',page:this.form.page});
                    }
                    this.$refs.infiniteLoading.$emit('$InfiniteLoading:complete'); //没有数据显示没有更多
                }

                // if( this.topic.length < (10*this.form.page) ){        
                //     this.$refs.infiniteLoading.$emit('$InfiniteLoading:loaded');
                //     this.$refs.infiniteLoading.$emit('$InfiniteLoading:complete');
                // }
            }
        },
        getCollectionData:function(){
            this.collectionForm.page = 1;
            this.api.post('community.data.detail.myCollection',this.collectionForm,this.CbCollectionData);
        },
        infinite: function(){
            if(!this.initPage)return false;
            setTimeout(()=>{
                if(this.collectionForm.page >= 1){  
                    this.collectionForm.page++;
                    this.api.post('community.data.detail.myCollection',this.collectionForm,this.CbCollectionData);
                }
            },500)
        },
        CbCollectionData:function(res){
            // console.log('收藏接口数据:',res);
            if (res.code == 1) {           
                this.initPage = true;
                if (res.data.f_data.length) {       // 如果有数据则进入将新的数据与老的数据拼接
                    if( this.collectionForm.page == 1 ){
                        this.setCollectionData({data:res.data,type:'refresh',page:this.form.page});
                        this.$refs.infiniteLoad.$emit('$InfiniteLoading:reset'); //重置组件处于最初状态
                    }else{
                        this.setCollectionData({data:res.data,type:'loadmore',page:this.form.page});
                    }
                    this.$refs.infiniteLoad.$emit('$InfiniteLoading:loaded');    //$emit触发$InfiniteLoading:loaded事件
                    if( this.collect.length < (10*this.collectionForm.page) ){        //如果帖子总条数小于10*页数则数据加载完成
                        this.$refs.infiniteLoad.$emit('$InfiniteLoading:complete');
                    }
                }else{
                    if( this.topic.length > 0 ){
                        this.$refs.infiniteLoad.$emit('$InfiniteLoading:loaded');
                    }
                    this.$refs.infiniteLoad.$emit('$InfiniteLoading:complete'); //没有数据显示没有更多
                }
            }
        },
        goBack: function(){             //如果有历史记录则返回上一页，否则返回主页
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
            if(parseInt(this.topicData.hehead.state) === 0 ){
                return '/static/img/failedHeader.jpg';
            }else if(parseInt(this.topicData.hehead.state) === 2 ){
                return '/static/img/verifyingHeader.jpg';
            }else{
                if( this.topicData.hehead.img ){
                    let reg = /^wj/.test(this.topicData.hehead.img);
                    if( reg ){
                        return '/static/img/head/'+this.topicData.hehead.img;
                    }else{
                        return 'http://hotupdate.enjoymi.com/community/img/'+this.topicData.hehead.img;
                    }
                }
            }
            return '';
        },
        toFeedback: function(){         //到反馈页面
            this.$router.push({
                name:'FeedBack',
                query:{uname:this.topicData.uname}
            })
        },
        toMyData: function(){           //到我的资料编辑页面
            this.$router.push({path:'/mydata'})
        },
        showReport: function(data){     //显示举报组件
            this.isSee = true;
            this.postTmp = data;
        },
        cancelReport: function(){       //隐藏举报组件
            this.isSee = false;
        },
        changeTipStatus:function(tid){  //postItem中点击"···"将tid传过来
            this.postTid = tid;
        },
        tabShow: function(type){        //点击改变tab的样式
            this.active = type;
            // this.showTab = (type == "topic")?true:false;
            if( type == "topic" ){      //点击话题，清除收藏数据 
                this.showTab = true;
                this.clearCollectData();
                this.getDataList();
            }else{                      //点击收藏，清除话题数据
                this.showTab = false;
                if( this.collect.length == 0 ){   //数据为空,则获取接口
                    this.collectionForm.uid = this.comingUid;
                    this.collectionForm.myuid = this.user;
                    if( this.collectionForm.uid=='' )return false;
                    this.getCollectionData();
                    this.getDataList();
                }else{      //有数据，则用缓存数据
                    this.initPage = true;
                    this.collectionForm.page = this.collectionPage;
                    if( this.collect.length < (10*this.collectionForm.page) ){        
                        this.$refs.infiniteLoad.$emit('$InfiniteLoading:loaded');
                        this.$refs.infiniteLoad.$emit('$InfiniteLoading:complete');
                    }
                }
            }
        },
        topicCon: function(uid,comingUid){          //根据传进来的uid判断是自己的还是他人的，改变话题文字
            if( uid == comingUid ){
                return '我的话题'
            }else{
                return '他的话题'
            }
        },
        collectionCon: function(uid,comingUid){     //根据传进来的uid判断是自己的还是他人的，改变收藏文字
            if( uid == comingUid ){
                return '我的收藏'
            }else{
                return '他的收藏'
            }
        },
        noMoreCollection: function(uid,comingUid){  //根据传进来的uid判断是自己的还是他人的，改变收藏底部文字
            if( uid == comingUid ){
                return '您还没有收藏话题哦'
            }else{
                return '他还没有收藏话题哦'
            }
        },
        noMoreTopic: function(uid,comingUid){       ////根据传进来的uid判断是自己的还是他人的，改变话题底部文字
            if( uid == comingUid ){
                return '您还没有发表话题哦'
            }else{
                return '他还没有发表话题哦'
            }
        },
        reduceNum: function(){          //我的话题数量减一
            this.topicData.len --;
        },
        addNum: function(){             //我的收藏数量加一
            if( this.comingUid == this.myuid ){
                this.topicData.collectionNums ++;
            }
        },
        reduceCollectionNum: function(){ //我的收藏数量减一
            if( this.comingUid == this.myuid ){
                this.topicData.collectionNums --;
            }
        },
        deleteTopic: function(index){   //删除选中的帖子
            this.topic.splice(index,1);
        },
        delCollect: function(index){    //删除被删除话题的通知
            this.collectionData.f_data.splice(index,1);
            this.topicData.collectionNums --;
        },
        showPic: function(state){       //如果图片state=0不显示，否则显示
            // console.log('state:',state);
            if( state == 0 ){
                return false;
            }else{
                return true;
            }
        },
        openPicViewer: function(allPic,all,index){  //组件中提交(commit) mutation
            let totalPic = [];
            if( parseInt(allPic.state) == 0 ){
                totalPic.push('/static/img/failed.jpg');
            }else{
                totalPic.push('http://hotupdate.enjoymi.com/community/img/'+allPic.img);
            }
            
            this.$store.commit("openPicViewer", { 
                all: all,
                index: index,
                totalPic:totalPic
            });
        },
        touchmove: function(){
            this.spotStatus = false;
        },
        touchmend: function(){
            this.spotStatus = true;
        },
    },
};
</script>

<style lang="scss" scoped>
    .header{
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        z-index: 9;
        i{
            position: absolute;
            top: 50%;
        }
        .feedback{
            right: 0.3rem;
            width: 0.58rem;
            height: 0.4rem;
            margin-top: -0.2rem;
            background-position: -4.91rem -3.4rem;
        }
    }
    .personal-msg{
        position: relative;
        display: flex;
        height: 3.6rem;
        color: #fff;
        font-size: 16px;
        margin-top: 0.88rem;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background: url(/static/img/top-bg.jpg) no-repeat left top/cover;
        .user-pic{
            width: 1.4rem;
            height: 1.4rem;
            border-radius: 50%;
            object-fit: cover;
        }
        h2{
            margin: 0.3rem 0 0.1rem;
        }
        .icon-edit{
            position: absolute;
            right: 1rem;
            bottom: 0.76rem;
            width: 1.04rem;
            height: 0.44rem;
            background-position: -1.88rem -3.38rem;
        }
    }
    .nav{
        display: flex;
        font-size: 16px;
        // color: #2E9FFE;
        line-height: 2;
        margin-top: 0.1rem;
        margin-bottom: -0.1rem;
        background: #fff;
        span{
            width: 50%;
            text-align: center;
            border-bottom: 1px solid #e2e2e2;
        }
        .on{
            color: #2E9FFE;
            border-bottom: 1px solid #2E9FFE;
        }
    }
    .mint-tab-container{
        overflow: visible;
    }

    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s;
    }
    .fade-enter, .fade-leave-active {
        opacity: 0;
    }

    .scale-enter-active, .scale-leave-active {
        transition: transform .3s;
    }
    .scale-enter,.scale-leave-to{
        transform:  scale(0);
    }
    .scale-enter-to,.scale-leave{
        transform:  scale(1);
    }
</style>
