<template>
    <div class="mydata">
        <header class="header">
            <i class="goback" @click="goBack"></i>
            我的资料
        </header>
        <div class="form">
            <ul>
                <li class="head" @click="fileUpload">
                    <em>头像</em>
                    <i class="icon-next"></i>
                    <img :src="changeSrc()">
                    <input ref="photoUpload" @change="handlePhotoUpload" type="file" accept="image/*" class="hide" value="file">
                </li>
                <li><em>账号</em><span class="tel">{{ showAccount(form.passport) }}</span></li>
                <li><em>手机号</em><span class="tel">{{ showTel(form.phone) }}</span></li>
                <!-- <li> -->
                <router-link :to="{ name:'MyName',query:{ uname:form.uname } }" tag="li">   <!-- tag="li"会渲染为li标签 -->
                    <em>用户名</em>
                    <i class="icon-next"></i>
                    <span>{{form.uname}}</span>
                </router-link>
                <!-- </li> -->
                <router-link :to="{ path:'/mydata/bindid' }" tag="li">
                    <em>绑定角色ID</em>
                    <i class="icon-next"></i>
                    <span class="role">{{roleid}}</span>
                </router-link>
            </ul>
        </div>
        <div class="form">
            <ul>
                <li @click="chooseSex">
                    <em>性别</em>
                    <i class="icon-next"></i>
                    <span>{{sex}}</span>
                </li>
                <!-- <router-link :to="{ path:'/mydata/setbirthday' }" tag="li"> -->
                <li @click="goBirthday">
                    <em>生日</em>
                    <i class="icon-next" v-if="showNext()"></i>
                    <span :class="{'birth':birthStatus}">{{birthday}}</span>
                <!-- </router-link> -->
                </li>
            </ul>
        </div>
        <div class="sex" v-show="showSex" @click.self="hideSexBox">
            <div class="radio-box">
                <input type="radio" id="item1" value="1" v-model="form.sex" @change="hideSexWrap">
                <label for="item1" class="radio-core">
                    <div class="radio-wrap"><span>男</span><em></em></div>
                </label>
                <input type="radio" id="item2" value="2" v-model="form.sex" @change="hideSexWrap">
                <label for="item2" class="radio-core">
                    <div class="radio-wrap"><span>女</span><em></em></div>
                </label>
            </div>
        </div>
        <button class="exit" @click="exit" v-show="api.showExit()">退出账号</button>
    </div>
</template>

<script>
import { MessageBox } from 'mint-ui';
import Toast from '@/components/toast/toast.js'
import {mapActions} from 'vuex'
export default {
    name: "MyData",
    data:function() {
        return {
            user:'',            //用户token
            phono: null,        //图片
            showSex: false,     //显示性别选择
            sexStatus: 0,       //默认显示男性
            birthStatus:false,  //生日的右间距
            form: {
                head:'',
                game: 1,
                rid: '',
            },
            sexForm:{
                uid: '',
                game: 1,
                sex: 0
            },
            hdAccount: {},       //登录记住我的账号和勾的状态
            login_account: '',   //登录的账号 
            login_mobile: '',    //登录的手机号 
        };
    },
    created: function(){
        this.user = this.api.islogin();
        if( !this.user )return false;
        this.api.post('community.data.detail.mydata',{uid:this.user},this.CbMyDada);
    },
    computed: {
        roleid:function(){        
            if( this.form.rid1 == '' ){
                return this.form.rid1 = '去绑定';
            }else{
                return this.form.rid1;
            }
        },
        sex: function(){        //若sex字段存在，则根据1/2显示男女，否则根据是否点击设置
            if( this.form.sex ){
                if( this.form.sex == 1 ){
                    return '男';
                }else{
                    return '女';
                }
            }else{
                if( !this.form.sex ){
                    return '未设置';
                }
            }
        },
        birthday: function(){    //若birthday字段存在，则显示生日，否则根据是否选择生日设置
            if( this.form.birthday ){
                let birth = this.form.birthday.split('/');
                return birth[0] +'年'+birth[1]+'月'+birth[2]+'日';
            }else{
                if( typeof(this.yy) === 'undefined' ){
                    return '未设置';
                }else{
                    return this.yy+'年'+this.mm+'月'+this.dd+'日';
                }
            }
        },
    },
    methods: {
        ...mapActions(['clearPersonalData','clearHomeData','clearPersonalData']),
        CbMyDada: function(res){        //我的资料接口数据
            // console.log('我的资料数据',res.data);
            if( res.code == 1 ){
                this.form = res.data;
            }else if( res.code == -66665 ){
                Toast('登录已过期，请重新登录');
                this.hdAccount = this.api.getCookie('hdAccount');
                let version = this.api.getCookie('version');
                this.api.clearAllCookie();      //清除所有cookie
                this.$router.push({path:'/login'});
                this.api.setCookie('version',version,3);
                this.api.setCookie('hdAccount',this.hdAccount,7);
            }else{
                this.api.getmsg(res);
            }
        },
        goBack: function(){           
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
        fileUpload: function(){         //点击图片调用点击intut[type="file"]事件
            this.$refs.photoUpload.click();
        },
        handlePhotoUpload: function(e){ //存储图片的路径字符串及压缩
            var self = this;
            var files = e.target.files;

            var Orientation = 1;
            // console.log('file',files[0]);
            if( /image\/gif/.test(files[0].type) ){     //如果是gif不压缩
                self.api.upload('community.lang.up.headUploads',files[0],self.Cbupload);
            }else{
                let name = files[0].name;       //文件名
                let size = files[0].size;       //文件大小
                let reader = new FileReader();
                reader.readAsDataURL(files[0]);
                    reader.onloadend = function (e) {
                    let dataURL = this.result;
                    // 这里的获取exif要将图片转ArrayBuffer对象，这里假设获取了图片的baes64
                    let arrayBuffer = self.api.base64ToArrayBuffer(dataURL);    // base64转ArrayBuffer对象
                    Orientation = self.api.getOrientation(arrayBuffer);         // 获取jpg图片的exif的角度（在ios体现最明显）
                    // console.log("Exif orientation:",Orientation); // 拍照方向

                    let img = new Image();
                    img.src = dataURL;
                    // console.log('size:',size);
                    if( size<= (100*1024) ){        //<100kb不压缩
                        // console.log('<100kb');
                        img.onload = function(){
                            let canvas = document.createElement('canvas');
                            let ctx = canvas.getContext('2d');
                            let width = img.width,
                                height = img.height;
                            canvas.width = width;
                            canvas.height = height;
                            ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
                            // console.log('compress orientation<100:',Orientation);
                            //修复上传图片的时候 被旋转的问题
                            if(Orientation != "" && Orientation != 1){
                                switch(Orientation){
                                    case 6:     //需要顺时针（向左）90度旋转
                                        self.rotateImg(img,'left',canvas);
                                        break;
                                    case 8:     //需要逆时针（向右）90度旋转
                                        self.rotateImg(img,'right',canvas);
                                        break;
                                    case 3:     //需要180度旋转
                                        self.rotateImg(img,'right',canvas);     //转两次
                                        self.rotateImg(img,'right',canvas);
                                        break;
                                }
                            }
                            let urlData = canvas.toDataURL('image/jpeg',0.8);
                            // console.log(urlData,name);
                            let file = self.dataURLtoFile(urlData,name);    //base64转成file文件
                            self.api.upload('community.lang.up.headUploads',file,self.Cbupload);
                        }
                    }else{
                        // console.log('>100kb');
                        img.onload = function(){        
                            let canvas = document.createElement('canvas');
                            let ctx = canvas.getContext('2d');
                            let w = 0, h = 0;
                            // 
                            if (this.width > this.height) {
                                h = 1080;
                                var scale = this.width / this.height;       //>1
                                h = h > this.height ? this.height : h;
                                w = Math.round(h / scale);
                            }
                            else {
                                w = 1080;
                                var scale = this.width / this.height;       //<1
                                w = w > this.width ? this.width : w;
                                h = Math.round(w / scale);
                            }
                            // console.log('w:',w,' h:',h);

                            var anw = document.createAttribute("width");
                            var anh = document.createAttribute("height");
                            if (this.width > this.height) {
                                anw.value = h;
                                anh.value = w;
                            }
                            else {
                                anw.value = w;
                                anh.value = h;
                            }
                            // console.log('anw:',anw,' anh:',anh);
                            canvas.setAttributeNode(anw);
                            canvas.setAttributeNode(anh);

                            if (this.width > this.height) {
                                ctx.translate(0, 0);
                                // ctx.rotate(90 * Math.PI / 180);
                                ctx.drawImage(this, 0, 0, h, w);
                                ctx.restore();
                            }
                            else {
                                ctx.drawImage(this, 0, 0, w, h);
                            }
                            
                            // console.log('compress orientation>500:',Orientation);
                            //修复上传图片的时候 被旋转的问题
                            if(Orientation != "" && Orientation != 1){
                                switch(Orientation){
                                    case 6:     //需要顺时针（向左）90度旋转
                                        self.rotateImg(img,'left',canvas);
                                        break;
                                    case 8:     //需要逆时针（向右）90度旋转
                                        self.rotateImg(img,'right',canvas);
                                        break;
                                    case 3:     //需要180度旋转
                                        self.rotateImg(img,'right',canvas);     //转两次
                                        self.rotateImg(img,'right',canvas);
                                        break;
                                }
                            }
                            let urlData = canvas.toDataURL('image/jpeg',0.8);  
                            // console.log(urlData); 

                            let file = self.dataURLtoFile(urlData,name);    //base64转成file文件
                            self.api.upload('community.lang.up.headUploads',file,self.Cbupload);
                        }
                    }  
                }
            }
            this.$refs.photoUpload.value = '';  //使点击相同的图片可以唤起onchange事件
        },
        rotateImg: function (img, direction,canvas) {   //canvas旋转图片
            //最小与最大旋转方向，图片旋转4次后回到原方向
            const min_step = 0;
            const max_step = 3;
            if (img == null)return;
            //img的高度和宽度不能在img元素隐藏后获取，否则会出错
            let height = img.height;
            let width = img.width;
            // console.log('rotateimg width:',width,' height:',height);
            let step = 2;
            if (step == null) {
                step = min_step;
            }
            if (direction == 'right') {
                step++;
                //旋转到原位置，即超过最大值
                step > max_step && (step = min_step);
            } else {
                step--;
                step < min_step && (step = max_step);
            }
            // console.log('step:',step);
            //旋转角度以弧度值为参数
            let degree = step * 90 * Math.PI / 180;
            let ctx = canvas.getContext('2d');
            switch (step) {
                case 0:
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0);
                    break;
                case 1:
                    canvas.width = height;
                    canvas.height = width;
                    // console.log('canvas.width:',canvas.width,' canvas.height:',canvas.height);
                    ctx.rotate(degree);
                    ctx.drawImage(img, 0, -height);
                    break;
                case 2:
                    canvas.width = width;
                    canvas.height = height;
                    ctx.rotate(degree);
                    ctx.drawImage(img, -width, -height);
                    break;
                case 3:
                    canvas.width = height;
                    canvas.height = width;
                    ctx.rotate(degree);
                    ctx.drawImage(img, -width, 0);
                    break;
            }
        },
        Cbupload: function(res){                //接口回调
            // console.log('pic res:',res);
            if( res.code == 1 ){
                Toast('修改成功');
                this.clearHomeData();
                this.clearPersonalData();
                this.form.head = res.data;
                this.form.pid_state = 1;
                this.changeSrc();
            }else{
                this.api.getmsg(res);
            }
        },
        dataURLtoFile: function(dataURL,fileName){  //base64转成file文件
            var arr = dataURL.split(','), mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while(n--){
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr], fileName, {type:mime});
        },
        changeSrc: function(){                  //头像的路径
            if( this.form.pid_state == 0 ){
                return '/static/img/failed.jpg';
            }else{
                if( this.form.head ){
                    let reg = /^wj/.test(this.form.head);
                    if( reg ){
                        return '/static/img/head/'+this.form.head;
                    }else{
                        return 'http://hotupdate.enjoymi.com/community/img/'+this.form.head;
                    }
                }
                return '';
            }
        },
        showAccount: function(account){ //显示账号
            if( account ) return account;
        },
        showTel: function(tel){         //显示手机号
            if( tel ) return tel.substr(0,3) + "****" + tel.substr(7);
        },
        chooseSex: function(){          //显示选择性别盒子
            this.showSex = true;
        },
        hideSexBox: function(){         //隐藏选择性别盒子
            this.showSex = false;
        },
        hideSexWrap: function(){        //发送选择性别接口
            this.sexForm.uid = this.user;
            this.sexForm.sex = this.form.sex;
            if( this.sexForm.uid == '' || this.sexForm.sex == '' ) return false;
            this.api.post('community.data.detail.setsex',this.sexForm,this.CbSexData);
        },  
        CbSexData: function(res){       //选择性别接口回调
            // console.log('sex res:',res);
            if( res.code == 1 ){
                Toast('修改成功');
                this.showSex = false;
            }else{
                this.api.getmsg(res);
            }
        },
        goBirthday: function(){         //跳转设置生日页面
            if( this.form.birthday ){
                return false;
            }else{
                this.$router.push({ path:'/mydata/setbirthday' });
            }
        },
        showNext: function(){           //若birthday字段存在不显示右箭头，同时给文字右间距
            if( !this.form.birthday ){
                this.birthStatus = false;
                return true;
            }else{
                this.birthStatus = true;
                return false;
            }
        },
        exit:function(){                //退出当前账号
            MessageBox.confirm('',{
                title:'',
                message: '确定退出当前账号吗？',
                confirmButtonText: '确定', 
                cancelButtonText: '取消'
            }).then(action=>{
                if( action == 'confirm' ){
                    this.clearPersonalData();       //清除个人中心数据
                    this.login_account = this.api.getCookie('login_account');   
                    this.login_mobile = this.api.getCookie('login_mobile');
                    let version = this.api.getCookie('version');
                    this.api.clearAllCookie();      //清除所有cookie
                    this.$router.push({path:'/'});
                    this.api.setCookie('version',version,7);
                    if( this.login_account != '' )this.api.setCookie('login_account',this.login_account,7);
                    if( this.login_mobile != '' )this.api.setCookie('login_mobile',this.login_mobile,7);
                }
            }).catch(err=>{
                if( err == 'cancel' ){}
            })
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
    @import '../css/mydataIndex.scss';
</style>
<style>
    .mint-msgbox-wrapper .mint-msgbox{width: 70%;border-radius: 5px;}
    .mint-msgbox-wrapper .mint-msgbox .mint-msgbox-content{padding: 25px 20px 25px; }
    .mint-msgbox-wrapper .mint-msgbox .mint-msgbox-message{color: #000;}
    .mint-msgbox-wrapper .mint-msgbox .mint-msgbox-btn {font-size: 16px;}
</style>
