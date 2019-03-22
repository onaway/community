<template>
    <div class="feedback">
        <header class="header">
            <i class="goback" @click="goBack"></i>
            意见反馈
        </header>
        <div class="form">
            <p>问题和描述：</p>
            <p><textarea placeholder="简要描述您要反馈的问题和意见（仅针对社区）" @input="descInput" v-model="form.content" maxlength="200"></textarea></p>
            <p class="font-blue">{{count}}字符</p>
            <div class="pic clearfix">
                <p>图片（选填，提供问题截图）<span class="font-b">{{photoNum}}/4</span></p>
                <div class="pic-list" v-for="(photo,index) in photos" :key="photo.id">
                    <i @click="removePhoto(index)" class="icon-close"></i>
                    <img :src="'http://hotupdate.enjoymi.com/community/pic/'+photo">
                </div>
                <div class="add-pic" @click="triggerFileUpload" v-show="showAddBtn"></div>
            </div>
            <div class="submit"><button @click="submit" :disabled="disabled">提交</button></div>
        </div>

        <input ref="photoUpload" @change="handlePhotoUpload" type="file" accept="image/*" class="hide" value="file" multiple>
    </div>
</template>

<script>
import Toast from '@/components/toast/toast.js'
export default {
    name: "FeedBack",
    data:function() {
        return {    
            user:'',                //用户token
            photos: [],             //存图片的数组
            photoNum: 0,            //图片的数量
            pids:[],                //存图片对应的pid
            count: 200,             //200字
            showAddBtn:true,        //'+'添加图片按钮可不可点
            disabled: false,
            form:{
                content: '',
                uid: '',
                game: 1,
                pic: [],
                uname:''
            }
        };
    },
    created: function(){
        this.user = this.api.islogin();
        this.form.uname = this.$route.query.uname;
    },
    methods: {
        goBack: function(){         //返回上一页
            this.$router.go(-1);
        },
        descInput: function(){      //'xx'字符显示的颜色
            this.count = 200 - this.form.content.length;
        },
        triggerFileUpload: function(){  //点击图片icon调用点击intut[type="file"]事件
            let count = this.photos.length;
            if( count >= 4 )return false;
            this.$refs.photoUpload.click();
        },
        handlePhotoUpload: function(e){ //存储图片的路径字符串
            var self = this;
            var files = e.target.files;
            // console.log(files);  

            let count = files.length + this.photos.length;
            
            this.photoNum = count;
            
            if(count > 4){
                this.photoNum = this.photos.length;
                Toast('最多显示4张图片');
                return false;
            }
            if( count == 4 ){
                this.showAddBtn = false;    //'+' 不可点
            }
            for(let i = 0; i < files.length; i++) {
                let size = files[i].size; 
                if( /image\/gif/.test(files[i].type) ){     //如果是gif不压缩
                    this.api.upload('community.lang.up.suggUploads',files[i],this.Cbupload);
                }else if( Math.ceil(size/1024/1024) > 10 ){
                    Toast('图片不能大于10M');
                }else{
                    this.api.upload('community.lang.up.suggUploads',files[i],this.Cbupload);
                }
            } 
            this.$refs.photoUpload.value = ''; 
        },
        Cbupload: function (res) {      //图片接口回调
            // console.log('上传图片接口数据:',res);
            if( res.code == 1 ){
                let data = JSON.parse(res.data);
                this.photos.push(data.path);
                this.pids.push(data.pid);
                // console.log('this.pid',this.pids);
                // console.log('this.photos',this.photos);
            }else{
                this.api.getmsg(res);
            }
        },
        removePhoto: function(index) {  //移除图片
            this.photos.splice(index, 1);
            this.pids.splice(index, 1);
            this.photoNum --;
            this.$refs.photoUpload.value = '';     //将input value值置空，第二次选相同的图片有效
            if( this.photos.length < 4 ){
                this.showAddBtn = true;     //'+' 可点
            } else{
                this.showAddBtn = false;    //'+' 不可点
            }
        },
        trim: function(str){            //去掉字符串首尾的空格
            return str.replace(/(^\s*)|(\s*$)/g, ""); 
        },
        submit: function(){
            this.form.uid = this.user;
            this.form.pic = this.pids;
            if( this.form.uid == '' )return false;
            if( this.form.content == '' ){
                Toast('内容不能为空');
            }else{
                var flag = this.trim(this.form.content);
                if( flag.length == 0 ){
                    Toast('话题内容不能全为空格');
                }else{
                    this.api.post('community.lang.topic.suggestion',this.form,this.CbFeedBack);
                } 
            }
        },
        CbFeedBack: function(res){
            // console.log(res);
            if( res.code == 1 ){
                this.disabled = true;
                Toast('提交成功，感谢你的反馈');
                setTimeout(() => {
                    this.$router.go(-1);
                }, 300);
            }else if( res.code == -66665 ){
                Toast('登录已过期，请重新登录');
                this.api.setCookie('myuser','',-1);     //清除登录存的token
                this.api.setCookie('uid','',-1);        //清除登录存的uid
                this.$router.push('/login');
            }else{
                this.api.getmsg(res);
            }
        }   
    },
    mounted(){
        // let title = '三国战纪--社区';
        let desc = '20年经典，正版授权，热血格斗，纯正街机手游';
        let url = window.location.href;
        let imgUrl = 'http://hotupdate.enjoymi.com/images/guanerye.jpg';
        this.wxShare.wx_share(desc,url,imgUrl);
    },
};
</script>

<style lang="scss" scoped>
    .feedback{
        i{
            background-size: 6.4rem 4.8rem;
            background-image: url(/static/img/icon.png);
        }
    }
    .header{
        position: relative;
        height: 0.88rem;
        text-align: center;
        line-height: 0.88rem;
        font-size: 18px;
        color: #fff;
        background: #c70019;
        .goback{
            position: absolute;
            top: 50%;
            left: 0.3rem;
            margin-top: -0.21rem;
            width: 0.48rem;
            height: 0.42rem;
            margin-top: -0.21rem;
            background-position: -0.17rem -1.8rem;
        }
    }
    .form{
        padding: 0.1rem 0.3rem;
        p:first-child{
            font-size: 16px;
            font-weight: bold;
        }
        textarea{
            box-sizing: border-box;
            width: 100%;
            height: 2.2rem;
            text-indent: 0.1rem;
            margin-top: 0.1rem;
            padding: 0.1rem;
            outline: none;
            resize: none;
            border: 1px solid #e2e2e2;
        }
        .font-blue{
            color: #2E9FFE;
            text-align: right;
        }
        .pic{
            p{
                color: #949494;
                margin-bottom: 0.3rem;
                .font-b{
                    float: right;
                    color: #2E9FFE;
                }
            }
            .pic-list{
                position: relative;
                float: left;
                width: 2.2rem;
                height: 2.2rem;
                margin: 0.05rem;
                .icon-close{
                    position: absolute;
                    top: 0.04rem;
                    right: 0.04rem;
                    width: 0.4rem;
                    height: 0.4rem;
                    background-position: -1rem -3.4rem;
                }
                img{
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            }
            .add-pic{
                position: relative;
                box-sizing: border-box;
                float: left;
                width: 2.2rem;
                height: 2.2rem;
                margin: 0.05rem;
                border: 1px dashed #cbd1d7;
                &:before,&:after{
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    content: "";
                    width: 0.875rem;
                    height: 1px;
                    background-color: #cbd1d7;
                    transform: translate(-50%,-50%);
                }
                &:after{
                    transform: translate(-50%,-50%) rotate(90deg);
                }
            }
        }
        .submit{
            text-align: center;
        }
        button{
            width: 3.2rem;
            height: 0.8rem;
            color: #fff;
            font-size: 16px;
            line-height: 0.8rem;
            margin-top: 1rem;
            outline: none;
            border: none;
            border-radius: 5px;
            background: #c70019;
        }
    }
    .hide{
        display: none;
    }
</style>
