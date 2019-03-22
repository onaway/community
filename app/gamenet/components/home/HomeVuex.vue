<template>
    <div class="community" @touchmove="touchmove" @touchend="touchmend">
        <div class="space"></div>
        <header class="header">
            <i class="my ico-top" @click="toPersonalCenter(uid)"></i>
            欢动游戏厅
            <i class="notice ico-top" @click="toNotice"><em class="hint" v-show="isBright"></em></i>
        </header>

        <!-- 遍历帖子列表 -->
        <scroller class="wrapper" :on-refresh="refresh" :on-infinite="infinite" ref="scroller" :noDataText="noDataText">
            <div v-if="judgeTop()" ref="top">
                <div class="set-top" v-for="item in homeData.top" :key="item.id">
                    <em>置顶</em><span></span>
                    <p @click="toPostText(item.topic)" :style="{color:item.color,fontWeight:isBold(item.single)}" v-html="analyzeEmoji(newContent(item.title))"></p>
                </div>
            </div>
            <div v-else-if="judgeCream()==true" ref="cream">
                <div class="cream" v-for="item in homeData.cream" :key="item.id">
                    <em>精华</em><span></span>
                    <p @click="toPostText(item.topic)" :style="{color:item.color,fontWeight:isBold(item.single)}" v-html="analyzeEmoji(newContent(item.title))"></p>
                </div>
            </div>
            <div v-else-if="judgeBoth()==true" ref="both">
                <div class="set-top" v-for="item in homeData.top" :key="item.id">
                    <em>置顶</em><span></span>
                    <p @click="toPostText(item.topic)" :style="{color:item.color,fontWeight:isBold(item.single)}" v-html="analyzeEmoji(newContent(item.title))"></p>
                </div>
                <div class="cream" v-for="item in homeData.cream" :key="item.id">
                    <em>精华</em><span></span>
                    <p @click="toPostText(item.topic)" :style="{color:item.color,fontWeight:isBold(item.single)}" v-html="analyzeEmoji(newContent(item.title))"></p>
                </div>
            </div>
            <post-item v-for="(list,index) in tz" :key="list.id" :lists="list" :index="index" :t_zan="homeData.t_zan"
            :collection="homeData.myCollection" :mark="homeData.hd" :postTid="postTid" :spotStatus="spotStatus" homeTipItemShow="homeTipItemShow"
            @changeTip="changeTipStatus" @parentshow="showReport" @deletetop="deleteTopic"></post-item>
        </scroller>
        
        <!-- 发表话题按钮 -->
        <div class="publish" @click.stop="publish"></div>

        <!-- 举报组件 -->
        <transition name="fade" mode="out-in">
            <report v-show="isSee" :repData="postTmp" @parentcancel="cancelReport" ></report>
        </transition>

        <!-- 分享组件 -->
        <!-- <share></share> -->
    </div>
</template>

<script>
import PostItem from '@/components/common/PostItem.vue'
import Report from '@/components/common/Report.vue'
import Share from '@/components/common/Share.vue'
import {mapState,mapGetters,mapActions} from 'vuex'
export default {
    name: "index",
    components: {
        PostItem,
        Report,
        Share,
    },
    data: function() {
        return {
            postTmp : {},            //点击的帖子数据
            isSee: false,            //举报组件是否显示 
            isBright:false,          //是否有消息类名
            spotStatus: true,        // "···" 的开关
            user: '',                //用户token
            uid: '',                 //用户uid
            form: {                  //接口参数
                uid: '',
                page: 1,
                game: 1
            },
            // homeData: {              //接口数据
            //     cream:[],
            //     top:[],
            //     hd:[],
            //     tz:[],
            //     myCollection:[],
            //     msg:'',
            //     t_zan:[]
            // },    
            postTid:'',              //postItem中点击"···"将tid传过来
            initPage:false,          //第一页开关
            noDataText: '',          //加载时提示区域的文字
            done: null,              //done()函数
        };
    },
    beforeRouteLeave(to, from, next) {
        var position = this.$refs.scroller.getPosition();     //记录离开页面的位置
        console.log('position:',position);
        this.$store.commit('changeHomeScrollY', position.top); //离开路由时把位置存起来
        next();
    },
    created() {
        console.log('creared tz:',this.tz.length);
        this.user = this.api.islogin();
        this.uid = this.api.getCookie('uid');   //用户uid对象数据
        this.form.uid = this.user;
        if( this.form.uid === '' || this.form.game === '' )return false;
        
        if( this.tz.length == 0 ){   //数据为空
            console.log('数据为空');
            this.getDataList();
        }else{      //有数据
            console.log('有数据');
            this.initPage = true;
        }
        this.watchNotice();
    },
    mounted(){
        // let title = '三国战纪--社区';
        let desc = '20年经典，正版授权，热血格斗，纯正街机手游';
        let url = window.location.href;
        let imgUrl = 'http://hotupdate.enjoymi.com/images/guanerye.jpg';
        this.wxShare.wx_share(desc,url,imgUrl);

        // let position = this.$store.state.scroll_y.homeScrollY; //返回页面滚动位置取出来
        // console.log('scroll position:',position);
         
        // setTimeout(()=>{
        //     this.$refs.scroller.scrollTo(0,position,false);
        // },10)
    },
    computed:{
        ...mapGetters(['homeData','tz'])
    },
    watch:{
        homeData:{
            handler(val){
                this.watchNotice();
            },
            deep:true
        },
        //watch '$route'一定是要在使用了keep-alive组件后，和本路由中设置了keepAlive：true才生效
        '$route' (to, from) {
            console.log('to:',to,' from:',from);
            if(to.name === 'HomeVuex') {
                let position = this.$store.state.scroll_y.homeScrollY;
                setTimeout(()=>{
                    this.$refs.scroller.scrollTo(0,position,false);
                },10)
            }
        }
    },
    methods:{
        ...mapActions(['saveHomeData']),
        infinite(done) {            //上拉加载
            console.log('infinite');
            this.done = done;
            console.log('this.noDataText:',this.noDataText);
            if( this.noDataText ){
                setTimeout(() => {
                    this.$refs.scroller.finishInfinite(2);
                })
                return;
            }
            console.log('this.initPage:',this.initPage);
            if(!this.initPage)return false;
            setTimeout(() => {
                if(this.form.page >= 1){
                    this.form.page++;
                    this.api.post('community.data.detail.index',this.form,this.CbHomeData);
                }
            }, 500);
        },
        refresh(done) {             //下拉刷新
            setTimeout(() => {
                this.getDataList();
                // done();
            }, 800);
        },
        getDataList: function(){            //获取接口数据
            this.form.page = 1;
            this.api.post('community.data.detail.index',this.form,this.CbHomeData);
        },
        CbHomeData: function(res){          //有uid回调的接口数据
            console.log('主页接口数据:',res.data);
            if (res.code == 1) {            // 如果查询结果为真
                for( let key in res.data.cream ){       //如果帖子被删除，则删除数组中空白的数据
                    if (Object.keys( res.data.cream[key] ).length == 0) {       //判断空对象
                        res.data.cream.splice(key,1);           //移除数组中空白的对象
                    }
                }
                for( let key in res.data.top ){
                    if (Object.keys( res.data.top[key] ).length == 0) {
                        res.data.top.splice(key,1);
                    }
                }
                console.log('page:',this.form.page);

                this.initPage = true;
                if (res.data.tz.length) {       // 如果有数据则进入将新的数据与老的数据拼接
                    if(this.form.page==1){
                        this.saveHomeData({data:res.data,type:'refresh'});
                        //下拉刷新，刷新完毕，loading动画一直存在不消失。需要手动调用finishPullToRefresh。停止下拉刷新。
                        this.$refs.scroller.finishPullToRefresh();
                        if( res.data.tz.length < 10 ){
                            this.noDataText = '已经到底了~';
                        }else{
                            this.noDataText = '';
                        }
                    }else{
                        this.saveHomeData({data:res.data,type:'loadmore'});
                    }   
                    this.watchNotice();
                    if( this.done !== null )this.done();
                    console.log('home tz:',this.tz);

                    if( this.tz.length < (10*this.form.page) ){        //如果帖子总条数小于10*页数则数据加载完成
                        this.noDataText = '已经到底了~';
                        this.$refs.scroller.finishInfinite(true);
                    } 
                }else{
                    this.noDataText = '已经到底了~';
                    this.$refs.scroller.finishInfinite(true);
                    //下拉刷新，刷新完毕，loading动画一直存在不消失。需要手动调用finishPullToRefresh。停止下拉刷新。
                    this.$refs.scroller.finishPullToRefresh();
                }
            }
        },
        toPersonalCenter: function(uid){    //用户按钮
            if( this.user ){
                let _url = encodeURIComponent(uid);
                this.$router.push({path: `/personalcenter/${_url}`});
            }else{
                this.$router.push({path: '/login'});
            }
        },
        toNotice :function(){               //跳转消息中心
            if( this.user ){
                this.$router.push({path:'/messagecenter'});
            }else{
                this.$router.push({path:'/login'});
            }
        },
        publish: function(){                //发表话题按钮
            if( this.user ){
                this.$router.push({path: '/topicitem'});
            }else{
                this.$router.push({path: '/login'});
            }
        },
        watchNotice: function(){            //监听是否有消息
            // console.log('msg',this.homeData.msg);
            if( parseInt(this.homeData.msg) ){
                this.isBright = true;
            }else{
                this.isBright = false;
            }
        },
        newContent: function(contentstr){   //处理置顶和精华的内容
            if(!contentstr){
                return '';
            }
            if( contentstr.search(/\W/g) == -1 ){           //如果没有标点符号和空格则显示内容
                return contentstr;
            }else{          //有标点符号
                if( /[\n\r]/.test(contentstr) ){            //匹配第一个换行符
                    var str = contentstr.replace(/[\n\r]/,'');
                    // console.log('str',str);
                    if( /([。！？.])/i.test(contentstr) ){
                        var n = contentstr.search(/([。！？.])/i);     //获取标点符号的索引值
                        return contentstr.substring(0,n);
                    }
                }else if( /([。！？. ])/i.test(contentstr) ){
                    var n = contentstr.search(/([。！？. ])/i);     //获取标点符号的索引值
                    return contentstr.substring(0,n);
                }else{
                    return contentstr;
                }
            }
        },
        analyzeEmoji: function(cont) {      //编译表情替换成图片展示出来
            return this.api.analyzeEmoji(cont);
        },
        showReport:function(data){          //显示举报组件
            this.isSee = true;
            this.postTmp = data;
        },
        cancelReport: function(){           //隐藏举报组件
            this.isSee = false;
        },
        judgeTop: function(){               //判断置顶的长度是否为2
            if(typeof(this.homeData.top)==='undefined'){
                return false;
            }
            if( this.homeData.cream.length == 0 ){
                return true;
            }
        },
        judgeCream: function(){             //判断精华的长度是否为2
            if(typeof(this.homeData.cream)==='undefined'){
                return false;
            }
            if( this.homeData.top.length == 0 ){
                return true;
            }
        },
        judgeBoth: function(){              //判断置顶和精华的长度是否都为1
            if(typeof(this.homeData.top)==='undefined' && typeof(this.homeData.cream)==='undefined'){
                return false;
            }
            if( this.homeData.top.length && this.homeData.cream.length ){
                return true;
            }
        },
        toPostText :function(tid){          //进帖子详情页,传tid给详情页
            this.$router.push({path: '/posttext',query:{tid:tid}});
        },
        changeTipStatus:function(tid){      //postItem中点击"···"将tid传过来
            this.postTid = tid;
        },
        deleteTopic: function(index){       //删除选中的帖子
            // setTimeout(()=>{
            //     this.homeData.tz.splice(index,1);
            // },500)
            this.homeData.tz.splice(index,1);
        },
        isBold: function(str){              //置顶和精华是否加粗
            if( str == 'true' )return 'bold';
        },
        touchmove: function(){
            this.spotStatus = false;
        },
        touchmend: function(){
            this.spotStatus = true;
        },
    },
    
    
    //activated,deactivated这两个生命周期函数一定是要在使用了keep-alive组件后才会有的，否则则不存在
    //created:在模板渲染成html前调用，即通常初始化某些属性值，然后再渲染成视图。
    //mounted:在模板渲染成html后调用，通常是初始化页面完成后，再对html的dom节点进行一些需要的操作。
};
</script>

<style lang="scss" scoped>
    @import '../css/home.scss';
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
<style lang="">
    ._v-container{
        position: static!important;
        /* overflow: auto!important; */
    }
</style>




