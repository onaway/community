<template>
    <div class="login">
        <header class="header"><i class="goback" @click="goBack"></i>登录</header>
        <!-- 密码登录or验证码登录 -->
        <div class="login-wrapper">
            <div class="huandong" v-if="showLogin">
                <p class="login-txt">密码登录</p>
                <p class="detail-login-txt">使用账号/手机号+密码登录</p>
                <div class="input-box">
                    <i class="icon-user"></i>
                    <input type="url" v-model="hdForm.account" placeholder="账号/手机号" maxlength="20">
                </div>
                <div class="psd-box input-box">
                    <i class="icon-psd"></i>
                    <input class="input-psw" :type="inputType" v-model="password" @keyup.enter="hdLogin" placeholder="密码" maxlength="16">
                    <i class="icon-close" v-if="showEye" @click="showPass('close')"></i>
                    <i class="icon-open" v-else @click="showPass('open')"></i>
                </div>
                <p class="forget-password"><span @click="toPassword">忘记密码？</span></p>
                <button class="sign-in" @click="submitAccount" :disabled="disabled" ref="hdbutton">登录</button>
            </div>
            <div class="tel" v-else>
                <p class="login-txt">验证码登录</p>
                <p class="detail-login-txt">使用手机号+验证码登录</p>
                <div class="input-box">
                    <i class="icon-tel"></i>
                    <input type="tel" v-model="telForm.mobile_phone" placeholder="请输入11位手机号" maxlength="11">
                </div>
                <div>
                    <div class="yzm-box input-box">
                        <i class="icon-yzm"></i>
                        <input class="input-yzm" type="tel" v-model="telForm.message_code" @keyup.enter="telLogin" placeholder="请输入验证码" maxlength="4">
                    </div>
                    <button class="yzm-btn" @click="sendCode1" v-show="yzm1">获取验证码</button>
                    <button class="yzm-btn" @click="sendCode2" v-show="yzm2">重发验证码</button>
                    <span class="send" v-show="time"><em>{{count}}</em>s后重新发送</span>
                </div>
                <button class="sign-in" @click="submitMobile" :disabled="disabled" ref="telbutton">登录</button>
            </div>
        </div>
        <p class="user-agreement">登录即表示同意<span @click="toUserAgreement">《用户协议》</span></p>

        <!-- 登录方式 -->
        <div class="other-login" v-show="isOriginHei">
            <div class="other-mode">
                <span class="line-left line"></span>
                <em>其他登录方式</em>
                <span class="line right line"></span>
            </div>
            <div class="login-mode" v-if="loginMode">
                <div class="l-m-container" @click="loginType('tel',1)">
                    <div class="circle">
                        <i class="icon-yzm"></i>
                    </div>
                    <p>验证码登录</p>
                </div>
            </div>
            <div class="login-mode" v-else>
                <div class="l-m-container" @click="loginType('huandong',1)">
                    <div class="circle">
                        <i class="icon-psw"></i>
                    </div>
                    <p>密码登录</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Toast from '@/components/toast/toast.js'
export default {
    name: "Login",
    data: function() {
        return {
            showLogin: true,            //显示手机登录或欢动账号登录
            loginMode: true,            //显示密码登录/验证码账号登录的图标及文字
            showEye: true,              //是否明文密码
            disabled: false,
            isOriginHei: true,          //软键盘弹起是否显示底部固定定位的元素
            screenHeight: '',           //软键盘弹起和落下变化的屏幕宽度
            originHeight: '',           //屏幕宽度
            inputType: 'password',      //密码输入框的type类型
            telForm:{                   //手机号和验证码
                mobile_phone:'',
                message_code:'',
                message_type: 1,
            },
            password: '',       //输入的欢动账号密码
            hdForm:{            //欢动账号和加密后的密码
                account:'',
                password:'',
            },
            yzm1: true,         //是否显示获取验证码按钮
            yzm2: false,        //是否显示重发验证码按钮
            time: false,        //是否显示倒计时
            timer1: '',         //定时器
            count: 60,          //倒计时总时间60s
            flag: false,        //判断是否获取验证码,
            hash: '',           //获取或设置页面的标签值
        };
    },
    beforeRouteLeave(to, from, next) {
        if( to.name == 'Password'||to.name == 'UserAgreement' ){    //存账号密码/手机号验证码信息，当点击忘记密码页面或者用户协议页面返回时需要取此数据
            let login_account = this.hdForm.account;
            let login_mobile = this.telForm.mobile_phone;
            this.api.password = this.password;
            this.api.code = this.telForm.message_code;
            if( login_account )this.api.setCookie('login_account',login_account,7);
            if( login_mobile )this.api.setCookie('login_mobile',login_mobile,7);
        }
        next();
    },
    created(){
        if( this.api.password ) this.password = this.api.password;      //取api存的密码信息
        if( this.api.code ) this.telForm.message_code = this.api.code;  //取api存的验证码信息
        this.screenHeight = document.documentElement.clientHeight;
        this.originHeight = document.documentElement.clientHeight;
        let login_account = this.api.getCookie('login_account'); 
        let login_mobile = this.api.getCookie('login_mobile');
        if( login_account ) this.hdForm.account = login_account;        //退出账号到登录页面时，自动保存登录的账号
        if( login_mobile ) this.telForm.mobile_phone = login_mobile;

        let token = this.api.getCookie('myuser');
        if( token ) this.$router.push({path:'/'});
    },
    mounted() {
        // let title = '三国战纪--社区';
        let desc = '20年经典，正版授权，热血格斗，纯正街机手游';
        let url = window.location.href;
        let imgUrl = 'http://hotupdate.enjoymi.com/images/guanerye.jpg';
        this.wxShare.wx_share(desc,url,imgUrl);

        let self = this;
        window.onresize = function() {
            return (function(){
                self.screenHeight = document.documentElement.clientHeight;
            })()
        }

        // this.hash = window.location.hash.split("#")[1];
        // this.getPopstate();
        // if( this.hash === undefined ){
        //     this.setState('huandong');
        // }
    },
    watch: {
        screenHeight (val) {
            if(this.originHeight > val + 100) {        //加100为了兼容华为的返回键
                this.isOriginHei = false;
            }else{
                this.isOriginHei = true;
            }
        }
    },
    methods: {
        sendCode1: function () {            //获取验证码
            var reg = /^1[3|4|5|7|8|9][0-9]{9}$/.test(this.telForm.mobile_phone);
            if( this.telForm.mobile_phone == '' ){   //手机号为空时
                Toast('请输入手机号');
            }else{              //手机号不为空时
                if( !reg ){     //手机号不对
                    Toast('请输入正确的11位手机号');
                }else{
                    this.sendYzm();
                }
            }
        },
        sendCode2: function(){              //重发验证码
            var reg = /^1[3|4|5|7|8|9][0-9]{9}$/.test(this.telForm.mobile_phone);
            if( this.telForm.mobile_phone == '' ){   //手机号为空时
                Toast('请输入手机号');
            }else{
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
            this.timer1 = setInterval(()=>{
                this.count --;
                if( this.count < 1 ){
                    clearInterval(this.timer1);
                    this.time = false;      //隐藏倒计时
                    this.yzm2 = true;       //显示重发验证码按钮
                }
            },1000)
        },
        sendYzm: function(){                //发送验证码
            this.api.post('community.user.login.sendMessage',this.telForm,this.CbSendCode);
        },
        CbSendCode: function (res){         //发送验证码回调的接口数据
            // console.log('res:',res);
            if( res.code == 1 ){
                this.yzm1 = false;          //获取验证码按钮隐藏
                this.time = true;           //60s倒计时显示
                this.updateTime();          //开始倒计时
                this.flag = true;
            }else{
                this.api.getmsg(res);       //失败调用的函数
            }
        },
        submitMobile: function () {         //手机号登录
            let mobile = this.telForm.mobile_phone;
            let code = this.telForm.message_code;
            let regTel = /^1[3|4|5|7|8|9][0-9]{9}$/.test(mobile);
            let regCode = /^\d{4}$/.test(code);
            if( mobile == '' ){         //手机号为空
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
                            this.api.post('community.user.login.messageCodeLogin',this.telForm,this.CbPhoneLogin);
                            this.disabled = true;
                        }
                    }
                }
            }
        },
        CbPhoneLogin: function (res) {      //手机号登录回调的接口数据
            console.log('手机号登录数据:',res);
            if( res.code == 1 ){
                this.disabled = true;   
                //加密uid 用base64,需要用对象形式加密
                let uidJson = {};
                uidJson.uid = res.data.uid;
                let _uidJson = this.api.encode(uidJson);       //base64加密
                this.api.setCookie('uid',_uidJson,7);          //设置uid cookie
                this.api.setCookie('myuser',res.data.token,7); //设置token cookie
                this.api.setCookie('login_mobile',this.telForm.mobile_phone,7)  //存登录成功的手机号
                if( res.data.new_account ){            //若账号强制修改
                    this.api.setCookie('login_info',res.data,7)    //存‘账号名已修改’页面需要的的信息
                    this.$router.push({name: 'ResetAccount'});
                }else{          //没改账号名
                    if (window.history.length > 1) {
                        this.$router.go(-1);
                    } else {
                        this.$router.push({path:'/'});
                    }
                }
            }else{
                this.disabled = false;
                this.api.getmsg(res);       //失败调用的函数
            }
        },
        submitAccount: function(){          //欢动账号登录
            let account = this.hdForm.account;
            let password = this.password;
            let regAcc = /^[a-zA-Z0-9]{6,20}$/.test(account);          //欢动账号情况下
            let regPsd = /^[a-zA-Z0-9]{6,16}$/.test(password);   
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
                            this.api.post('community.user.login.unionLogin',this.hdForm,this.CbAccountLogin);
                            this.disabled = true;
                        }
                    } 
                } 
            }
        },
        CbAccountLogin: function(res){      //欢动账号登录回调的接口数据
            console.log('欢动账号登录数据:',res);
            if( res.code == 1 ){
                this.disabled = true;
                this.api.setCookie('password',this.hdForm.password,1);      //存密码，在账号选择页面或者认证手机页面有用到
                if( res.data.many_account ){     //若账号手机号是同一个且uid不同，即many_account为true
                    this.api.setCookie('account_info',res.data.account_info,1);
                    this.api.setCookie('mobile_info',res.data.mobile_info,1);
                    this.$router.push({name:'ChooseAccount'});
                    this.api.setCookie('login_account',this.hdForm.account,7)  //存到‘选择账号’页面的账号，若密码错误返回可以记住账号
                }else{   
                    let uidJson = {};
                    uidJson.uid = res.data.uid;
                    let _uidJson = this.api.encode(uidJson);       //base64加密
                    this.api.setCookie('uid',_uidJson,7);          //设置uid cookie
                    this.api.setCookie('myuser',res.data.token,7); //设置token cookie
                    this.api.setCookie('bind_phone_account',res.data.account,1);    //绑定手机需要的账号
                    if( res.data.new_account ){         //若账号强制修改
                        this.api.setCookie('login_account',res.data.new_account,7)  //存修改过的账号
                        this.api.setCookie('login_info',res.data,7);       //存‘账号名已修改’页面需要的的信息
                        this.$router.push({name: 'ResetAccount'});
                    }else{          //没改账号名
                        this.api.setCookie('login_account',this.hdForm.account,7)   //存登录成功的账号（符合规则的）
                        if( res.data.bind_phone == 0 ){     //若未绑定手机
                            this.$router.push({name: 'Authentication'});
                        }else{      //已绑定手机
                            if (window.history.length > 1) {
                                this.$router.go(-1);
                            } else {
                                this.$router.push({path:'/'});
                            }
                        }
                    }
                }
            }else if( res.code == -20740 ){
                this.disabled = false;
                Toast('账号或密码错误，剩余'+res.msg+'次机会');
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
                    this.$router.push({path: '/'});
                }
            } else { //未知的浏览器 
                this.$router.go(-1);
            }
        },
        toPassword: function(){             //跳转忘记密码页面
            this.$router.push({name:'Password'});
        },
        showPass: function(type){           //显示密码睁眼or闭眼和密码input框的类型
            if( type == 'close' ){
                this.showEye = false;
                this.inputType = 'text';
            }else{
                this.showEye = true;
                this.inputType = 'password';
            }
        },
        loginType: function(type,flag){          // 手机号/欢动账号显示的点击事件
            if( type == 'tel' ){
                this.showLogin = false;
                this.loginMode = false;
            }else{
                this.showLogin = true;
                this.loginMode = true;
            }
            // let localUrl = window.location.href.split("#")[0];
            // if( flag == 1 )history.pushState({page: type}, null, localUrl + "#" + type);
        },
        // getPopstate: function(){            //监听popstate
        //     this.loginType( this.hash, 0);
        //     let self = this;
        //     window.addEventListener("popstate", function (e) {
        //         console.log('state.page',history.state.page,' event:',e.state.page);
        //         self.loginType( history.state.page, 0);
        //     }, false);
        // },
        // setState: function(_href){
        //     if (this.hash == _href) {
        //         this.loginType(this.hash, 1);
        //     } else {
        //         this.loginType(_href, 1);
        //     }
        // },
        toUserAgreement: function(){        //跳转用户协议页面
            this.$router.push({name:'UserAgreement'});
        },
        hdLogin: function(){                //欢动登录的input框的软键盘enter的keyup事件
            this.$refs.hdbutton.click();
        },
        telLogin: function(){               //手机号登录的input框的软键盘enter的keyup事件
            this.$refs.telbutton.click();
        }
    }
};
</script>

<style lang="scss" scoped>
    @import '../css/login.scss';
</style>

