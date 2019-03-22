<template>
    <div class="community" @touchmove="touchmove" @touchend="touchmend">
        <div class="space"></div>
        <header class="header">
            <i class="my ico-top" @click="toPersonalCenter(uid)"></i>
            欢动游戏厅
            <i class="notice ico-top" @click="toNotice"><em class="hint" v-show="isBright"></em></i>
        </header>

        <div v-if="judgeTop()">
            <div class="set-top" v-for="item in homeData.top" :key="item.id">
                <em>置顶</em><span></span>
                <p @click="toPostText(item.topic)" :style="{color:item.color,fontWeight:isBold(item.single)}" v-html="analyzeEmoji(newContent(item.title))"></p>
            </div>
        </div>
        <div v-else-if="judgeCream()==true">
            <div class="cream" v-for="item in homeData.cream" :key="item.id">
                <em>精华</em><span></span>
                <p @click="toPostText(item.topic)" :style="{color:item.color,fontWeight:isBold(item.single)}" v-html="analyzeEmoji(newContent(item.title))"></p>
            </div>
        </div>
        <div v-else-if="judgeBoth()==true">
            <div class="set-top" v-for="item in homeData.top" :key="item.id">
                <em>置顶</em><span></span>
                <p @click="toPostText(item.topic)" :style="{color:item.color,fontWeight:isBold(item.single)}" v-html="analyzeEmoji(newContent(item.title))"></p>
            </div>
            <div class="cream" v-for="item in homeData.cream" :key="item.id">
                <em>精华</em><span></span>
                <p @click="toPostText(item.topic)" :style="{color:item.color,fontWeight:isBold(item.single)}" v-html="analyzeEmoji(newContent(item.title))"></p>
            </div>
        </div>

        <!-- 遍历帖子列表 -->
        <mt-loadmore :top-method="loadTop" ref="loadmore" @top-status-change="handleTopChange">
            <post-item v-for="(list,index) in homeData.tz" :key="list.id" :lists="list" :index="index" :t_zan="homeData.t_zan" 
            :collection="homeData.myCollection" :mark="homeData.hd" :postTid="postTid" :spotStatus="spotStatus" homeTipItemShow="homeTipItemShow"
            @changeTip="changeTipStatus" @parentshow="showReport" @deletetop="deleteTopic"></post-item>
            <div slot="top" class="mint-loadmore-top">
                <span v-show="topStatus !== 'loading'" :class="{ 'rotate': topStatus === 'drop' }">↓下拉刷新</span>
                <!-- <span v-show="topStatus === 'loading'">加载中...</span> -->
                <span v-show="topStatus === 'loading'">加载中...</span>
            </div>
        </mt-loadmore>

        <!-- 旋转器写法为<infinite-loading :spinner="spinner"></infinite-loading> data添加 spinner:'bubbles'  -->
        <infinite-loading @infinite="onInfinite" ref="infiniteLoading">
            <span slot="no-more">已经到底了~</span>
            <span slot="no-results">暂无话题</span>
        </infinite-loading>
        <!-- 放在循环体下，当到此位置时会执行onInfinite方法 -->
        
        <!-- 发表话题按钮 -->
        <div class="publish" @click="publish"></div>

        <!-- 举报组件 -->
        <transition name="fade" mode="out-in">
            <report v-show="isSee" @parentcancel="cancelReport" ></report>
        </transition>

        <!-- 分享组件 -->
        <!-- <share></share> -->
    </div>
</template>

<script>
import PostItem from '@/components/common/PostItem.vue'
import Report from '@/components/common/Report.vue'
import Share from '@/components/common/Share.vue'
import InfiniteLoading from 'vue-infinite-loading'
import {Loadmore} from 'mint-ui';
export default {
    name: "index",
    components: {
        PostItem,
        Report,
        Share,
        InfiniteLoading,
        Loadmore,
    },
    data: function() {
        return {
            postTmp : {},            //点击的帖子数据
            isSee: false,            //举报组件是否显示 
            isBright:false,          //是否有消息类名
            spotStatus: true,        // "···" 显示的开关
            user: '',                //用户token
            uid: '',                 //用户uid
            form: {                  //接口参数
                uid: '',
                page: 1,
                game: 1
            },
            homeData: {              //接口数据
                cream:[],
                top:[],
                hd:[],
                tz:[],
                myCollection:[],
                msg:'',
                t_zan:[]
            },    
            postTid:'',              //postItem中点击"···"将tid传过来
            initPage:false,          //第一页开关
            topStatus: '',           //加载时提示区域的文字
        };
    },
    watch:{
        homeData:{
            handler(val){
                this.watchNotice();
            },
            deep:true
        },
        //watch '$route'一定是要在使用了keep-alive组件后，和本路由中设置了keepAlive：true才生效
        '$route' (to, from) {}
    },
    beforeRouteLeave(to, from, next) {
        let position = window.scrollY;          //记录离开页面的位置
        if (position == null) position = 0;
        // console.log('position:',position);
        this.$store.commit('changeHomeScrollY', position); //离开路由时把位置存起来
        next();
    },
    created () {
        this.user = this.api.islogin();
        // console.log('token:',this.user);
        this.uid = this.api.getCookie('uid');   //用户uid对象数据
        // console.log('this.uid:',this.uid);
        this.form.uid = this.user;
        if( this.form.uid === '' || this.form.game === '' )return false;

        // 是否有历史记录，有load所有之前浏览的分页数据，否则走正常刷新页面获取数据
        if(this.api.homeData.isHistory==1){
            this.getAllpage(this.api.homeData.currentPage);
        }else{
            this.getDataList();
        }
        this.watchNotice();
    },
    mounted(){
        // let title = '三国战纪--社区';
        let desc = '20年经典，正版授权，热血格斗，纯正街机手游';
        let url = window.location.href;
        let imgUrl = 'http://hotupdate.enjoymi.com/images/guanerye.jpg';
        this.wxShare.wx_share(desc,url,imgUrl);
    },
    methods:{
        getDataList: function(){            //获取接口数据
            this.form.page = 1;
            this.api.post('community.data.detail.index',this.form,this.CbHomeData);
        },
        onInfinite: function(){             //触发上拉加载方法
            // setTimeout(() => {
                if(!this.initPage)return false;
                if(this.form.page >= 1){  
                    this.form.page++;
                    this.api.post('community.data.detail.index',this.form,this.CbHomeData);
                }
            // }, 500);
        },
        loadTop: function(){                //组件提供的下拉触发方法
            setTimeout(()=>{
                this.getDataList();
                this.$refs.loadmore.onTopLoaded();// 固定方法，查询完要调用一次，用于重新定位
            },300)
        },
        getPage:async function (pageNum) {    //同步获取数据 async await 获取数据api也要同步，保证第一页获取完再获取第二页
            this.form.page = pageNum;
            await this.api.wpost('community.data.detail.index',this.form,this.CbHomeData);
        },
        getAllpage: async function (pages) {//load已经浏览过的分页数据  
            for( let i=0; i<pages; i++ ){
                await this.getPage(i+1);
            }
        },      
        setPageScroll: function () {        //当存储的页数和loading页一致时，触发滚动到原先的位置
            let position = this.$store.state.scroll_y.homeScrollY; //返回页面滚动位置取出来
            // console.log('scroll position:',position);
            this.api.homeData.isHistory = 0;    
            setTimeout(()=>{
                window.scrollTo(0, position);
            },30)
        },
        CbHomeData: function(res){          //有uid回调的接口数据
            // console.log('主页接口数据:',res.data);
            if (res.code == 1) {            // 如果查询结果为真
                for( let key in res.data.cream ){       //如果帖子被删除，则删除数组中空白的数据
                    if (Object.keys( res.data.cream[key] ).length == 0) {       //判断空对象
                        res.data.cream.splice(key,1);           //移除数组中空白的对象
                    }
                }
                this.homeData.cream = res.data.cream;
                for( let key in res.data.top ){
                    if (Object.keys( res.data.top[key] ).length == 0) {
                        res.data.top.splice(key,1);
                    }
                }
                
                this.homeData.top = res.data.top;
                this.homeData.hd = res.data.hd;
                this.homeData.myCollection = res.data.myCollection;
                this.homeData.msg = res.data.msg;
                this.homeData.t_zan = res.data.t_zan;
                this.initPage = true;
                if (res.data.tz.length) {       // 如果有数据则进入将新的数据与老的数据拼接
                    if(this.form.page==1){
                        this.homeData.tz = res.data.tz;
                        this.$refs.infiniteLoading.$emit('$InfiniteLoading:reset'); //重置组件处于最初状态
                    }else{
                        this.homeData.tz = this.homeData.tz.concat(res.data.tz);
                    }
                    // console.log('上拉加载的总数据:',this.homeData.tz);
                    //$emit触发$InfiniteLoading:loaded事件 或$state.loaded();$state从onInfinite($state)函数参数中传
                    this.$refs.infiniteLoading.$emit('$InfiniteLoading:loaded');   
                    this.watchNotice();
                    if( this.homeData.tz.length < (10*this.form.page) ){        //如果帖子总条数小于10*页数则数据加载完成
                        this.$refs.infiniteLoading.$emit('$InfiniteLoading:complete');
                    }
                }else{
                    this.$refs.infiniteLoading.$emit('$InfiniteLoading:complete'); //没有数据显示没有更多
                }
            }
            
            if(this.api.homeData.isHistory==1){     //下一页返回来时
                if(this.api.homeData.currentPage==this.form.page){
                    this.setPageScroll();
                }
            }else{      //没有跳转下一页时
                this.api.homeData.currentPage = this.form.page;
            }
            // console.log('currentPage:',this.api.homeData.currentPage);
            // console.log('this.form.page:',this.form.page);
        },
        handleTopChange: function(status){  //改变加载时提示区域的文字
            this.topStatus = status;
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
            return contentstr;
        },
        analyzeEmoji: function(cont) {      //编译表情替换成图片展示出来
            // console.log('this.api.analyzeEmoji(cont):',this.api.analyzeEmoji(cont))
            return this.api.analyzeEmoji(cont);
        },
        showReport:function(){              //显示举报组件
            this.isSee = true;
        },
        cancelReport: function(){           //隐藏举报组件
            this.isSee = false;
        },
        judgeTop: function(){               //判断置顶的长度是否大于0
            if(typeof(this.homeData.top)==='undefined'){
                return false;
            }
            if( this.homeData.cream.length == 0 ){
                return true;
            }
        },
        judgeCream: function(){             //判断精华的长度是否大于0
            if(typeof(this.homeData.cream)==='undefined'){
                return false;
            }
            if( this.homeData.top.length == 0 ){
                return true;
            }
        },
        judgeBoth: function(){              //判断置顶和精华的长度是否都为大于0
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
    .mint-loadmore{
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





