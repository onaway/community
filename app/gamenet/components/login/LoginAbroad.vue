<template>
    <div class="register">
        <header class="header"><i class="goback" @click="goBack" ></i>登录</header>
        <div class="account-number">
            <span :class="{on:showAccountNum===true}" @click="loginType('tel')">手机号登录</span>
            <span :class="{on:showAccountNum===false}" @click="loginType('huandong')">欢动账号登录</span>
        </div>
        <div class="login-wrapper">
            <ul>
                <li class="tel" v-if="showLogin">
                    <div class="wrapper">
                        <div class="input-box">
                            <i class="icon-user"></i>
                            <span class="select" v-if="showSelect" @click="chooseNation">{{country_code}}</span>
                            <input type="tel" v-model="telForm.phone" placeholder="手机号">
                        </div>
                        <div>
                            <div class="yzm-box input-box">
                                <i class="icon-yzm"></i>
                                <input class="input-yzm" type="tel" v-model="telForm.code" @keyup.enter="telLogin" placeholder="验证码" maxlength="4">
                            </div>
                            <button class="yzm-btn" @click="sendCode1" v-show="yzm1">获取验证码</button>
                            <button class="yzm-btn" @click="sendCode2" v-show="yzm2">重发验证码</button>
                            <span class="send" v-show="time"><em>{{count}}</em>s后重新发送</span>
                            <button class="login-in" @click="submitMobile" :disabled="disabled" ref="telbutton">登录</button>
                        </div>
                    </div>
                </li>
                <li class="huandong" v-else>
                    <div class="wrapper">
                        <div class="input-box">
                            <i class="icon-user"></i>
                            <input type="text" v-model="hdForm.account" placeholder="账号">
                        </div>
                        <div class="psd-box input-box">
                            <i class="icon-psd"></i>
                            <input class="input-psw" type="password" v-model="password" @keyup.enter="hdLogin" placeholder="密码">
                        </div>
                        <div class="password">
                            <input type="checkbox" id="checkbox" v-model="remember" @change="rememberAccount">
                            <label for="checkbox"><em></em><span>记住我</span></label>
                            <router-link to="/password"><span class="forget-psd fr">忘记密码？</span></router-link>
                        </div>
                        <button class="login-in" @click="submitAccount" :disabled="disabled" ref="hdbutton">登录</button>
                    </div>
                    <p class="prompt">如果你还没有欢动账号，建议你使用手机号+验证码的方式登录社区。</p>
                </li>
            </ul>
        </div>

        <!-- 选择国家组件 -->
        <transition name="fade" mode="out-in">
            <country v-if="showCountry" @choosecode="setCode" @hide="hideCountry"></country>
        </transition>
    </div>
</template>

<script>
import Country from '@/components/login/Country'
import Toast from '@/components/toast/toast.js'
export default {
    name: "Login",
    components: {
        Country
    },
    data: function() {
        return {
            showLogin: true,            //显示手机登录或欢动账号登录
            showAccountNum:true,        //手机登录/欢动账号登录加的类名
            disabled: false,
            showSelect: false,          //是否显示国家区号选择框
            showCountry: false,         //是否显示选择国家组件
            country_code: '+65',        //国家区号
            telForm:{                   //手机号和验证码
                phone:'',
                code:'',
                country_code: ''
            },
            password: '',       //输入的欢动账号密码
            hdForm:{            //欢动账号和密码
                account:'',
                password:''
            },
            remember: false,    //记住我
            yzm1: true,         //是否显示获取验证码按钮
            yzm2: false,        //是否显示重发验证码按钮
            time: false,        //是否显示倒计时
            timer1: '',         //定时器
            count: 60,          //倒计时总时间60s
            flag: false         //判断是否获取验证码
        };
    },
    mounted(){
        let hdJson = this.api.getCookie('hdAccount');   //记住我的信息
        if( typeof(hdJson)==='object' ){
            this.hdForm.account = hdJson.account;
            this.remember = hdJson.rememberMe;
        } 

        this.build = this.api.build();
        if( this.build == 'abroad' || this.build == 'abroadprod' ){
            this.showSelect = true;
        }
        
        // let title = '三国战纪--社区';
        let desc = '20年经典，正版授权，热血格斗，纯正街机手游';
        let url = window.location.href;
        let imgUrl = 'http://hotupdate.enjoymi.com/images/guanerye.jpg';
        this.wxShare.wx_share(desc,url,imgUrl);
    },
    methods: {
        sendCode1: function () {            //获取验证码
            this.telForm.action='login';
            // console.log('telForm:',this.telForm);
            var reg = /^1[3|4|5|7|8|9][0-9]{9}$/.test(this.telForm.phone);
            if( !reg ){
                Toast('请输入正确的11位手机号');
            }else{
                this.sendYzm();
            }
        },
        sendCode2: function(){              //重发验证码
            this.telForm.action='login';
            if( this.telForm.phone ){
                var reg = /^1[3|4|5|7|8|9][0-9]{9}$/.test(this.telForm.phone);
                if(!reg ){
                    Toast('请输入正确的11位手机号');
                }else{
                    this.yzm2 = false;      //重新获取验证码按钮隐藏
                    this.count = 60;        //时间调整为60s
                    this.time = true;       //倒计时显示
                    this.updateTime();      //开始倒计时
                    this.sendYzm();         //发送验证码
                }
            }
        },
        updateTime: function(){             //倒计时
            clearInterval(this.timer1);
            self = this;                    //this指向的问题
            this.timer1 = setInterval(function(){
                self.count --;
                if( self.count < 1 ){
                    clearInterval(self.timer1);
                    self.time = false;      //隐藏倒计时
                    self.yzm2 = true;       //显示重发验证码按钮
                }
            },1000)
        },
        sendYzm: function(){                //发送验证码
            this.telForm.country_code = parseInt(this.country_code);       //国家区号
            this.api.post('community.user.login.sendcode',this.telForm,this.CbSendCode);
        },
        CbSendCode: function (res){         //发送验证码回调的接口数据
            // console.log('res:',res);
            if( res.data == 1 ){
                this.yzm1 = false;          //获取验证码按钮隐藏
                this.time = true;           //60s倒计时显示
                this.updateTime();          //开始倒计时
                this.flag = true;
            }else{
                this.api.getmsg(res);       //失败调用的函数
            }
        },
        submitMobile: function () {         //手机号登录
            var phone = this.telForm.phone;
            var code = this.telForm.code;
            var regTel = /^1[3|4|5|6|7|8|9][0-9]{9}$/.test(phone);
            var regCode = /^\d{4}$/.test(code);

            if( phone == '' ){          //手机号为空
                Toast('请输入手机号');
            }else{                      //有手机号的情况下
                if( !regTel ){          //手机号不对
                    Toast('请输入正确的11位手机号');
                }else{                  //手机号对的情况下
                    if( code == '' ){   //验证码为空
                        if( this.flag ){        //已获取验证码
                            Toast('请输入验证码');
                        }else{                  //没有获取验证码
                            Toast('请获取验证码');
                        }
                    }else{                      //验证码有值的情况下
                        if( !regCode ){        //验证码不对
                            Toast('请输入4位数字验证码');
                        }else{                  //验证码对
                            this.telForm.country_code = parseInt(this.country_code);       //国家区号
                            this.api.post('community.user.login.dologin',this.telForm,this.CbPhoneLogin);
                            this.disabled = true;
                        }
                    }
                }
            }
        },
        CbPhoneLogin: function (res) {      //手机号登录回调的接口数据
            // console.log('手机号登录数据:',res.data);
            if( res.code == 1 ){
                this.disabled = true;
                var token = res.data.token;
                //加密uid 用base64,需要用对象形式加密
                let uidJson = {};
                uidJson.uid = res.data.uid;
                let _uidJson = this.api.encode(uidJson);   //base64加密
                this.api.setCookie('uid',_uidJson,7);      //设置uid cookie
                this.api.setCookie('myuser',token,7);      //设置token cookie
                if (window.history.length > 1) {
                    this.$router.go(-1);
                } else {
                    this.$router.push({path:'/'});
                }
                // this.$router.go(-1);        //回到之前的页面
            }else{
                this.disabled = false;
                this.api.getmsg(res);       //失败调用的函数
            }
        },
        submitAccount: function(){          //欢动账号登录
            // console.log('hdForm',this.hdForm);
            var account = this.hdForm.account;
            var password = this.password;
            var regAcc = /^[a-zA-Z0-9]{6,20}$/.test(account);
            var regPsd = /^[a-zA-Z0-9]{6,16}$/.test(password);
            if( typeof(account) == 'undefined' || account == '' ){      //账号为空时
                Toast('请输入账号');
            }else{               //账号有值时
                if( !regAcc ){             //账号不对情况下
                    Toast('请输入正确的账号或手机号');
                }else{           //账号对情况下
                    if( password == '' ){ //密码为空时
                        Toast('请输入密码');
                    }else{       //密码有值时
                        if( !regPsd ){         
                            Toast('密码为6-16位字符');
                        }else{      //格式都对时
                            this.hdForm.password = this.api.SHA1(password);
                            this.api.post('community.user.login.dologin',this.hdForm,this.CbAccountLogin);
                            this.disabled = true;
                        }
                    } 
                } 
            }
        },
        CbAccountLogin: function(res){      //欢动账号登录回调的接口数据
            // console.log('欢动账号登录数据:',res);
            if( res.code == 1 ){
                this.disabled = true;
                var token = res.data.token;
                let uidJson = {};
                uidJson.uid = res.data.uid;
                let _uidJson = this.api.encode(uidJson);    //base64加密
                this.api.setCookie('uid',_uidJson,7);      //设置uid cookie
                this.api.setCookie('myuser',token,7);      //设置token cookie
                if (window.history.length > 1) {
                    this.$router.go(-1);
                } else {
                    this.$router.push({path:'/'});
                }
                // this.$router.go(-1);        //回到之前的页面
            }else{
                this.disabled = false;
                this.api.getmsg(res);       //失败调用的函数
            }
        },
        goBack: function(){                 //如果有历史记录则返回上一页，否则返回主页
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
        telLogin: function(){               //手机号登录的input框的软键盘enter的keyup事件
            this.$refs.telbutton.click();
        },
        hdLogin: function(){                //欢动登录的input框的软键盘enter的keyup事件
            this.$refs.hdbutton.click();
        },
        chooseNation: function(){           //选择国家/地区组件显示
            this.showCountry = true;
        },
        setCode:function(data){             //设置国家的区号及隐藏‘选择国家/地区组件’
            this.country_code = data;
            // console.log('data:',this.country_code);
            this.showCountry = false;
        },
        hideCountry:function(){             //隐藏‘选择国家/地区组件’
            this.showCountry = false;
        },
        loginType: function(type){          // 手机号/欢动账号显示的点击事件
            if( type == 'tel' ){
                this.showLogin = true;
                this.showAccountNum = true;
            }else{
                this.showLogin = false;
                this.showAccountNum=false;
            }
        },
        rememberAccount: function(){        //点击记住我设置欢动账号和记住我的cookie
            if( this.remember ){
                let hdAccount = {};
                hdAccount.account = this.hdForm.account;
                hdAccount.rememberMe = this.remember;
                this.api.setCookie('hdAccount',hdAccount,7);
            }else{
                this.api.setCookie('hdAccount','',-1);
            }
        },
    }
};
</script>

<style lang="scss" scoped>
    .register{
        .account-number{
            width: 6.9rem;
            height: 0.88rem;
            line-height: 0.88rem;
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            margin: 0.9rem 0.3rem 0;
            span{
                box-sizing: border-box;
                float: left;
                // width: 3.45rem;
                width: 50%;
                border: 1px solid #e2e2e2;
                border-bottom: none;
            }
            .on{
                color: #fff;
                border: 1px solid #c70019;
                border-bottom: none;
                background: #c70019;
            }
        }
        .login-wrapper{
            width: 6.9rem;
            margin: 0 0.3rem 0.2rem;
            i{
                background-image: url('/static/img/icon.png');
                background-size: 6.4rem 4.8rem;
            }
            @at-root li{
                .wrapper{
                    padding: 0.3rem;
                    border: 1px solid #e2e2e2;
                     .input-box{
                        height: 0.8rem;
                        margin-bottom: 0.2rem;
                        border: 1px solid #e2e2e2;
                        border-radius: 5px;
                        i{
                            position: relative;
                            float: left;
                            width: 0.8rem;
                            height: 0.8rem;
                            &:after{
                                position: absolute;
                                right: 0;
                                top: 0.15rem;
                                width: 1px;
                                height: 0.5rem;
                                content: '';
                                background: #e2e2e2;
                            }
                        }
                        .icon-user{
                            background-position: 0 -0.8rem;
                        }
                        .select{
                            float: left;
                            width: 0.8rem;
                            height: 0.5rem;
                            color: #fff;
                            line-height: 0.5rem;
                            text-align: center;
                            margin: 0.15rem 0 0.15rem 0.1rem;
                            background: #c70019;
                            border-radius: 5px;
                        }
                        input{
                            width: 4.3rem;
                            height: 100%;
                            border: none;
                            outline: none;
                            text-indent: 0.2rem;
                        }
                    }
                    .yzm-btn{
                        float: right;
                        width: 2.0rem;
                        height: 0.8rem;
                        font-size: 15px;
                    }
                    .send{
                        float: right;
                        height: 0.8rem;
                        line-height: 0.8rem;
                        color: #949494;
                    }
                }
            }
            .tel{
                .input-yzm{
                    width: 3.1rem;
                    margin-right: 0.1rem;
                }
                .yzm-box{
                    display: inline-block;
                    margin-bottom: 0;
                }
                .icon-yzm{
                    background-position: -0.8rem -2.4rem;
                }
            }
            @at-root .huandong{
                .input-psw{
                    width: 5.3rem;
                }
                .psd-box{
                    margin-bottom: 0!important;
                }
                .icon-psd{
                    background-position: 0 -2.4rem;
                }
                .prompt{
                    font-size: 12px;
                    color: #949494;
                    margin-top: 0.1rem;
                }
                .password{
                    color: #727176;
                    margin-top: 0.1rem;
                    .forget-psd{
                        color: #727176;
                    }
                    input[type="checkbox"]{
                        display: none;
                    }
                    label{
                        em{
                            position: relative;
                            display: inline-block;
                            width: 0.26rem;
                            height: 0.26rem;
                            margin-right: 0.1rem;
                            border: 1px solid #ccc;
                            vertical-align: middle;
                            border-radius: 3px;
                        }
                        span{
                            vertical-align: -5%;
                        }
                    }
                    input[type="checkbox"]:checked + label em:after{
                        position: absolute;
                        left: 0;
                        bottom: 0;
                        width: 0.4rem;
                        height: 0.32rem;
                        background-image: url('/static/img/icon.png');
                        background-size: 6.4rem 4.8rem;
                        background-position: -1.81rem -2.64rem;
                        content: '';
                    }
                    span{
                        vertical-align: middle;
                    }
                }
            }
            button{
                color: #fff;
                border: none;
                border-radius: 5px;
                background: #c70019;
                outline: none;
            }
            .login-in{
                width: 6.3rem;
                height: 0.88rem;
                font-size: 18px;
                margin-top: 0.3rem;
            }
        }
    }
</style>