<template>
    <div class="p-h-post">
        <div class="p-h-user clearfix">
            <div @click="toPersonalCenter(headerData.uid)"><img :src="changeSrc()"></div>
            <div class="p-h-user-con">
                <h2 :class="{official:isMark}" @click="toPersonalCenter(headerData.uid)">{{headerData.uname}}</h2>
                <span>{{updateTime(headerData.time*1000)}}</span>
            </div>
        </div>

        <!-- 话题内容 -->
        <div class="p-h-content clearfix"> 
            <pre><p v-html="analyzeEmoji(headerData.content)">{{analyzeEmoji(headerData.content)}}</p></pre>

            <!-- 显示图片 -->
            <div v-if="pics">
                <ul class="single-pic" v-if="pics.length === 1">
                    <li v-if="showFailedImg(pics[0].state)" :class="showSingelPic(headerData.width,headerData.height)?'pic-height':'pic-width'">
                        <img :src="changeImgSrc(pics[0].img)" :preview="headerData.tid">
                    </li>
                    <li v-else class="failed-img"><img :src="changeImgSrc(pics[0].img,pics[0].state)"></li>
                </ul>
                <ul class="four-pic clearfix" v-else-if="pics.length === 4">
                    <li v-for="pic in pics" :key="pic.id">
                        <img :src="changeImgSrc(pic.img,pic.state)" :preview="headerData.tid">
                    </li>
                </ul>
                <ul class="pic-list clearfix" v-else>
                    <li v-for="pic in pics" :key="pic.id">
                        <img :src="changeImgSrc(pic.img,pic.state)" :preview="headerData.tid">
                    </li>
                </ul>
            </div>
        </div>
        <div class="p-h-box">
            <ul class="clearfix">
                <li @click="praise"><i class="icon-zan" :class="{on:isTrue}"></i>点赞</li>
                <!-- <li><i class="icon-wx"></i></li>
                <li><i class="icon-wxtimeline"></i></li>
                <li @click="showShareBox"><i class="icon-spot"></i></li> -->
            </ul>
        </div>
    </div>
</template>

<script>
import Toast from '@/components/toast/toast.js'
import {mapActions} from 'vuex'
export default {
    name: "PostHeader",
    props:['headerData','pics','zan','mark'],
    data: function() {
        return {
            isTrue: false,          //显示赞是否为红色图标
            isMark:false,           //官方账号类名
            praiseForm:{
                action: 't',
                tid:'',
                cid: 0,
                type: 1,
                uid:''
            },
            user: '',               //用户信息token
        };
    },
    created: function(){
        this.user = this.api.islogin();
        this.watchMark();
        this.$previewRefresh();     //preview框架重置用
    },
    watch:{
        zan:function(newVal,oldVal){
            this.watchZan();
        },
        mark(newval,oldval){
            this.watchMark();
        }
    },
    methods: {
        ...mapActions(['changeHomePraise','changePersonalPraise']),
        in_array: function(search,array){       //判断字符串是否在数组中
            for(var i in array){
                if(array[i]==search){
                    return true;
                }
            } 
            return false;
        },
        watchZan:function(){                    //监听赞的变化  
            this.in_array();
            if(this.in_array(this.headerData.tid,this.zan)){    
                this.isTrue = true;
            }else{
                this.isTrue = false;
            }
        },
        watchMark:function(){                   //监听是否是官方账号
            this.in_array();
            if(this.in_array(this.headerData.uid,this.mark)){    
                this.isMark = true;
            }else{
                this.isMark = false;
            }
        },
        praise :function(){                     //点赞
            if( this.user ){
                this.praiseForm.tid = this.headerData.tid;
                this.praiseForm.uid = this.user;
                this.praiseForm.type = this.isTrue?2:1;
                if(  this.praiseForm.tid==''|| this.praiseForm.uid=='' )return false;
                // console.log('praiseForm',this.praiseForm);
                this.api.post('community.lang.topic.zan',this.praiseForm,this.CbPraise);
            }else{
                this.$router.push({path:'/login'});
            }
        },
        CbPraise: function(res){
            // console.log('res:',res);
            if( res.code == 1 ){
                this.changeHomePraise(this.headerData.tid);     //将tid存至vuex中进行数据操作
                this.changePersonalPraise(this.headerData.tid);
                this.isTrue = !this.isTrue;
            }else{
                this.api.getmsg(res);
            }
        },
        changeSrc: function(){                  //头像的路径
            if( typeof(this.headerData.head.img) === 'undefined' ){
                return '/static/img/failed.jpg';
            }else{
                if(parseInt(this.headerData.head.state) === 0 ){
                    return '/static/img/failedHeader.jpg';
                }else if(parseInt(this.headerData.head.state) === 2 ){
                    return '/static/img/verifyingHeader.jpg';
                }else{
                    let reg = /^wj/.test(this.headerData.head.img);
                    if( reg ){
                        return '/static/img/head/'+this.headerData.head.img;
                    }else{
                        return 'http://hotupdate.enjoymi.com/community/img/'+this.headerData.head.img;
                    }
                }
            }
        },
        showFailedImg: function(state){     //若违规，显示违规图片
            if( parseInt(state) == 0 ){
                return false;
            }else if(parseInt(state) == 2){
                return false;
            }else{
                return true;
            }
        },
        updateTime: function(timeValue){        //改变时间显示
            return this.api.changeTime(timeValue);
        },
        showShareBox: function(){               //显示分享盒子

        },
        toPersonalCenter: function(uid){
            let urlJson = {};       
            urlJson.uid = uid;
            let _url = this.api.encode(urlJson);       //通过base64加密传给个人中心
            let encodeUrl = encodeURIComponent(_url)   //将特殊的字符如‘：;/?:@&=+$,# ’进行替换
            this.$router.push({path: `/personalcenter/${encodeUrl}`});
        },
        analyzeEmoji: function(cont) {          //编译表情替换成图片展示出来
            return this.api.analyzeEmoji(cont);
        },
        showSingelPic:function(width,height){            //根据图片的宽高度显示图片
            if( parseInt(width) > parseInt(height) ){
                return false;
            }else if( parseInt(width) < parseInt(height) ){
                return true;
            }
            return true;
        },
        changeImgSrc: function(src,state){        //根据state来生成图片的路径1/2为数据路径，0为默认路径
            // console.log('src:',src);
            if( parseInt(state) == 0 ){
                return '/static/img/failed.jpg';
            } else if(parseInt(state) == 2){
                return '/static/img/verifying.jpg';
            }
            return 'http://hotupdate.enjoymi.com/community/pic/'+src;
        },
    },
};
</script>

<style lang="scss" scoped>
    @import '../css/postHeader.scss';    
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
