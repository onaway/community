<template>
    <div class="topic">
        <header class="header"><i class="goback" @click="goBack"></i>发表话题<button @click="submit()" :disabled="disabled">发送</button></header>
        <p><textarea placeholder="话题内容在1~200字最佳哦" @input="descInput"  @click="setFocusIndex" v-model="form.content" ref="textarea"></textarea></p>
        
        <!-- 放图片的地方 -->
        <div v-if="photoHasBeenUploaded()" class="picture">
            <div class="pic-list" v-for="(photo,index) in photos" :key="photo.id">
                <i @click="removePhoto(index)" class="icon-close"></i>
                <img :src="'http://hotupdate.enjoymi.com/community/pic/'+photo">
            </div>
            <div class="add-pic" @click="triggerFileUpload" v-show="showAddBtn"></div>
        </div>

        <input ref="photoUpload" @change="handlePhotoUpload" type="file" accept="image/*" class="hide" value="file" multiple>

        <div class="publish-con" :class="{'on':isTrue,'publish-land':api.inGame()}">
            <div class="emoji-logo">
                <i class="icon-emoji" @click="showAllEmoji"></i>
                <span :class="{'to-red':changeColor}">{{count}}字符</span>

                <i class="icon-pic" :class="{'grey-pic':picStatus}" @click="triggerFileUpload" v-show="api.canUpload()"></i>
                <!-- <i class="icon-pic" :class="{'grey-pic':picStatus}" @click="triggerFileUpload"></i> -->

            </div>
            <!-- 循环表情 -->
            <div class="emoji-wrapper" v-show="isShow">
                <ul>
                    <li class="emoji-item" v-for="(list,index) in emojiData" :key="'list'+index" @click.stop="choseEmoji(list.title)">
                        <!-- <img :src="'/static/img/emoji/'+list.url" :alt="list.title"> -->
                        <span class="emoticon" :style="{backgroundPosition: list.url}"></span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import Toast from '@/components/toast/toast.js'
import {mapActions} from 'vuex'
export default {
    name: "TopicItem",
    data: function() {
        return {
            isTrue: false,      //是否添加on类名
            isShow:false,       //是否显示所有的表情
            form:{              //接口参数
                uid:'',
                game:1,
                content:'',
                pic:[],
                geo:[]
            },
            user:'',            //用户信息token
            emojiData:[],       //表情集合
            disabled:false,     //button可不可点
            count: 200,         //文字的剩余长度
            changeColor: false, //文字颜色是否变红
            photos: [],         //src路径数组
            pids:[],            //存图片对应的pid
            imgArr:[],          //存图片的宽高度数组
            picStatus: false,   //表情旁的图片按钮变灰
            showAddBtn: true,   //图片后的点击选取图片的框
            length: 0,
            num: 0
        };
    },
    created: function(){
        this.user = this.api.islogin();
        this.emojiData = this.api.emojiData;
        // console.log('this.emojiData:',this.emojiData);
        // console.log('this.photo:',this.photo);
    },
    methods: {
        ...mapActions(['changeHomeRefresh']),
        showAllEmoji:function(){     //显示所有表情
            this.isShow = this.isShow?false:true;
            if( this.isShow ){
                this.isTrue = true;
            }else{
                this.isTrue = false;
            }
        },  
        choseEmoji: function(title){ //点击表情事件
            let textarea = document.getElementsByTagName('textarea')[0];
            let n = textarea.selectionStart;        //光标的位置
            let startCon = this.form.content.substring(0,n);    //光标前的内容
            let endCon = this.form.content.substring(n);        //光标后的内容
            this.form.content = startCon + '['+ title +']' + endCon;
            let m = ('['+ title +']').length;
            let length = m + n;
            this.setCursorPosition(textarea,length);
            this.descInput();
        },
        setCursorPosition: function(el,index){  //光标位置
            let val = this.form.content;
            let len = val.length;
            if( len < index ) return;
            setTimeout(function(){
                if( el.setSelectionRange ){
                    el.setSelectionRange(index,index);
                }
            },30)
        },
        trim: function(str){        //去掉字符串首尾的空格
            return str.replace(/(^\s*)|(\s*$)/g, ""); 
        },
        submit: function () {       //发表话题
            this.form.uid = this.user;
            this.form.pic = this.pids;
            if( this.photos.length == 1 ){
                if( this.imgArr.length < 1 ) return false;
            }
            if( this.imgArr.length >= 1 && this.pids.length == 1 ){
                this.form.geo = this.imgArr;
            }
            if( this.form.uid == '' || this.form.uid == 0 )return false;
            if( this.form.content == '' ){
                Toast('请输入话题内容');
            }else{
                let flag = this.trim(this.form.content);
                if( flag.length == 0 ){
                    Toast('话题内容不能全为空格');
                }else if( flag.length > 200 ){
                    Toast('话题内容超过200字符');
                }else{
                    // console.log('this.form:',this.form);
                    this.api.post('community.lang.topic.say',this.form,this.CbTopic);
                    this.disabled = true;
                }
            }
        },
        CbTopic: function(res){     //发表话题的回调接口
            // console.log(res);
            if( res.code == 1 ){
                this.disabled = true;
                this.changeHomeRefresh(true);
                Toast('发表成功');
                setTimeout(() => {
                    this.$router.go(-1);
                    this.form.content = '';
                }, 300);
            }else if( res.code == -90007 ){
                this.disabled = false;
                Toast('当前为人工审核时间，审核通过后才能显示');
                setTimeout(() => {
                    this.$router.go(-1);
                    this.form.content = '';
                }, 300);
            }else{
                this.disabled = false;
                this.api.getmsg(res);
            }
        },
        goBack: function(){         //如果有历史记录则返回上一页，否则返回主页
            this.changeHomeRefresh(false);
            let ua = navigator.userAgent.toLowerCase();
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
        setFocusIndex: function(){  //点击输入框让表情框隐藏
            this.isShow = false;
            this.isTrue = false;
        },
        descInput: function(){      //'xx'字符显示的颜色
            this.count = 200 - this.form.content.length;
            if( this.form.content.length > 200 )this.changeColor = true;
            if( this.form.content.length < 200 )this.changeColor = false;
        },
        triggerFileUpload: function(){  //点击图片icon调用点击intut[type="file"]事件
            let count = this.photos.length;
            if( count >= 9 )return false;
            this.$refs.photoUpload.click();
        },
        handlePhotoUpload: function(e){  //存储图片的路径字符串及压缩
            let self = this;
            let files = e.target.files;
            // console.log('files.length',files.length);
            // console.log('type',files[0].type);
            let count = files.length + this.photos.length;
            if( count > 9 ){
                Toast('最多显示九张图片');
                return false;
            }
            if( count == 9 ){
                this.showAddBtn = false;    //'+' 不可点
                this.picStatus = true;      //'图片按钮'不可点
            }
            let Orientation = 1;
            this.length = files.length;
            // console.log('length:',this.length);
            this.disabled = true;   //发送不可点
            this.num = 0;           //每次点击选图片按钮重置num
            for (let i = 0; i < files.length; i++) {
                let imgSize = files[i].size; 
                if( /image\/gif/.test(files[i].type) || this.loweriphone()===false){     //如果是gif不压缩
                    self.api.upload('community.lang.up.postUploads',files[i],self.Cbupload);
                }else if( Math.ceil(imgSize/1024/1024) > 10 ){
                    Toast('图片不能大于10M');
                }else{
                    let name = files[i].name;       //文件名
                    let size = files[i].size;       //文件大小
                    // console.log('size:',size);
                    let reader = new FileReader();
                    reader.readAsDataURL(files[i]);
                    reader.onloadend = function (e) {
                        let dataURL = this.result;
                        // 这里的获取exif要将图片转ArrayBuffer对象，这里假设获取了图片的baes64
                        let arrayBuffer = self.api.base64ToArrayBuffer(dataURL);    // base64转ArrayBuffer对象
                        Orientation = self.api.getOrientation(arrayBuffer);         // 获取jpg图片的exif的角度（在ios体现最明显）
                        // console.log("Exif orientation:",Orientation); // 拍照方向

                        let img = new Image();
                        img.src = dataURL;
                        // console.log('size:',size);
                        if( size<= (500*1024) ){        //<500kb不压缩
                            // console.log('<500kb');
                            img.onload = function(){
                                let canvas = document.createElement('canvas');
                                let ctx = canvas.getContext('2d');
                                let width = img.width,
                                    height = img.height;
                                canvas.width = width;
                                canvas.height = height;
                                ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
                                // console.log('compress orientation<500:',Orientation);
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
                                self.api.upload('community.lang.up.postUploads',file,self.Cbupload);
                            }
                        }else{          //>500kb压缩
                            // console.log('>500kb');
                            img.onload = function(){        
                                let canvas = document.createElement('canvas');
                                let ctx = canvas.getContext('2d');
                                let w = 0, h = 0;
                                // 
                                if (this.width > this.height) {
                                    h = 1080;
                                    let scale = this.width / this.height;       //>1
                                    // console.log('scale1:',scale);
                                    h = h > this.height ? this.height : h;
                                    w = Math.round(h / scale);
                                }
                                else {
                                    w = 1080;
                                    let scale = this.width / this.height;       //<1
                                    // console.log('scale2:',scale);
                                    w = w > this.width ? this.width : w;
                                    h = Math.round(w / scale);
                                }
                                // console.log('w:',w,' h:',h);

                                let anw = document.createAttribute("width");
                                let anh = document.createAttribute("height");
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
                                // console.log('file',file);

                                self.api.upload('community.lang.up.postUploads',file,self.Cbupload);
                            }
                        }
                    }
                }
            }
            this.$refs.photoUpload.value = ''; 
        },
        loweriphone: function () {
            let ua= navigator.userAgent.toLowerCase(); 
            let ver=ua.match(/cpu iphone os (.*?) like mac os/);
            if(!ver){
                return true;
            }else{
                let versions = parseInt(ver[1].replace(/_/g,"."));
                if(versions>=11){
                    return true;
                }
                return false;
            }
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
        Cbupload: function (res) {          //上传图片接口回调
            // console.log('上传图片接口数据:',res);
            if( res.code == 1 ){
                this.num ++; 
                // console.log('length:',this.length,' this.num',this.num);
                if( this.num >= this.length ){
                    this.disabled = false;   //发送可点
                }

                let data = JSON.parse(res.data);
                this.photos.push(data.path);
                this.pids.push(data.pid);
                // console.log('this.photos',this.photos);
                // console.log('this.pid',this.pids);
                this.imgArr = [];       //先清空
                for( let i=0; i<this.photos.length; i++ ){
                    let img = new Image();
                    let obj = {};
                    img.src = 'http://hotupdate.enjoymi.com/community/pic/'+this.photos[i];
                    // console.log('img.src:',img.src);
                    img.onload = function(){
                        // obj.src = img.src;
                        obj.width = img.width;
                        obj.height = img.height;
                    }
                    this.imgArr.push(obj);
                }
                // console.log('upload imgArr:',this.imgArr);
            }else if(res.code == -70007){
                Toast('图片格式不对');
                this.disabled = false;
                this.showAddBtn = true;      //'+' 可点
                this.picStatus = false;      //'图片按钮'可点
            }else{
                this.api.getmsg(res);
            }
        },
        dataURLtoFile: function(dataURL,fileName){  //base64转成file文件
            let arr = dataURL.split(','), mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while(n--){
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr], fileName, {type:mime});
        },
        photoHasBeenUploaded: function(){    //判断是否显示图片
            return this.photos.length > 0;
        },
        removePhoto: function(index) {       //移除图片
            this.photos.splice(index, 1);
            this.pids.splice(index, 1);
            this.imgArr.splice(index, 1);
            // console.log('remove imgArr:',this.imgArr);
            this.$refs.photoUpload.value = '';     //将input value值置空，第二次选相同的图片有效
            if( this.photos.length < 9 ){
                this.showAddBtn = true;     //'+' 可点
                this.picStatus = false;     //'图片按钮'可点
            } else{
                this.showAddBtn = false;    //'+' 不可点
            }
        }
    },
    mounted(){
        // this.getua();
        setTimeout(()=>{
            this.$refs.textarea.focus();
        },200) 
        
        // let title = '三国战纪--社区';
        let desc = '20年经典，正版授权，热血格斗，纯正街机手游';
        let url = window.location.href;
        let imgUrl = 'http://hotupdate.enjoymi.com/images/guanerye.jpg';
        this.wxShare.wx_share(desc,url,imgUrl);
    }
};
</script>

<style lang="scss" scoped>
    @import '../css/topicItem.scss';    
</style>