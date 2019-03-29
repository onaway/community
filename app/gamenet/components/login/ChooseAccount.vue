<template>
   <div>
        <header class="header"><i class="goback" @click="goBack"></i>账号选择</header>
        <p>哪个是你的账号？</p>
        <div class="form">
            <ul>
                <li :class="{on:border1}">
                    <div class="account">账号：{{account_info.account}}</div>
                    <div class="time">注册时间：{{api.timestampToTime(account_info.create_time)}}</div>
                    <label class="radio-core">
                    <input type="radio" value="account" v-model="choose" @change="setAccount">
                        <em></em>
                    </label>
                </li>
                <li :class="{on:border2}">
                    <div class="account">手机号：{{mobile_info.mobile_phone}}</div>
                    <div class="time">注册时间：{{api.timestampToTime(mobile_info.create_time)}}</div>
                    <label class="radio-core">
                        <input type="radio" value="tel" v-model="choose" @change="setMobile">
                        <em></em>
                    </label>
                </li>
                <li><button @click="confirm">确定</button></li>
            </ul>
        </div>
   </div>
</template>

<script>
import Toast from '@/components/toast/toast.js'
export default {
    name: "ChooseAccount",
    data: function() {
        return {
            choose: 'account',
            account_info: {},       //账号信息
            mobile_info: {},        //手机号信息
            border1: true,          //第一个li边框变红的变量
            border2: false,         //第二个li边框变红的变量
            telForm: {
                mobile_phone: '',
                password: ''
            },
            hdForm: {
                account: '',
                password: ''
            }
        };
    },
    created() {
        this.account_info = this.api.getCookie('account_info');
        this.mobile_info = this.api.getCookie('mobile_info');
        this.telForm.mobile_phone = this.mobile_info.mobile_phone;
        this.hdForm.account = this.account_info.account;
        let password = this.api.getCookie('password');
        this.telForm.password = password;
        this.hdForm.password = password;
    },
    methods: {
        goBack: function(){         //如果有历史记录则返回上一页，否则返回主页
            var ua = navigator.userAgent.toLowerCase();
            if (ua.indexOf('firefox') != -1 || ua.indexOf('opera') != -1 || ua.indexOf('safari') != -1 ||
            ua.indexOf('chrome') != -1 || ua.indexOf('webKit') != -1 || ua.match(/MicroMessenger/i) == 'micromessenger'|| 
            ua.indexOf('uc') != -1 || ua.indexOf('baidu') != -1 || ua.indexOf('qq') != -1 ) { 
                if (window.history.length > 1) {
                    this.$router.go(-1);
                } else {
                    this.$router.push({name: 'Home'});
                }
            } else { //未知的浏览器 
                this.$router.go(-1);
            }
        },
        setAccount(){               //选择账号
            this.border1 = true;
            this.border2 = false;
        },
        setMobile(){                //选择手机号
            this.border1 = false;
            this.border2 = true;
        },
        confirm(){                  //确定登录
            if( this.choose == 'account' ){
                this.api.post('community.user.login.accountLogin',this.hdForm,this.CbAccountLogin);
            }else{
                this.api.post('community.user.login.mobileLogin',this.telForm,this.CbTelLogin);
            }
        },
        CbAccountLogin(res){        //账号登录接口回调
            // console.log('res:',res);
            if( res.code == 1 ){    
                let uidJson = {};
                uidJson.uid = res.data.uid;
                let _uidJson = this.api.encode(uidJson);       //base64加密
                this.api.setCookie('uid',_uidJson,7);          //设置uid cookie
                this.api.setCookie('myuser',res.data.token,7); //设置token cookie
                this.api.setCookie('bind_phone_account',res.data.account,1);  //绑定手机需要的账号
                /*if( res.data.new_account ){         //若账号强制修改
                    this.api.setCookie('login_account',res.data.new_account,7)   //存修改过的账号
                    this.api.setCookie('login_info',res.data,7)       //存‘账号名已修改’页面需要的的信息
                    this.$router.push({name: 'ResetAccount'});
                }*/
                this.api.setCookie('login_account',res.data.account,7)   //存修改过的账号
                if( res.data.bind_phone == 0 ){ 
                    this.$router.push({name: 'Authentication'});
                }else{
                    this.$router.push({name: 'Home'});
                }
            }else{
                this.api.getmsg(res);
            }
        },
        CbTelLogin(res){            //手机号登录接口回调
            // console.log('res:',res);
            if( res.code == 1 ){    
                let uidJson = {};
                uidJson.uid = res.data.uid;
                let _uidJson = this.api.encode(uidJson);       //base64加密
                this.api.setCookie('uid',_uidJson,7);          //设置uid cookie
                this.api.setCookie('myuser',res.data.token,7); //设置token cookie
                this.api.setCookie('login_account',res.data.phone_num,7)   //存登录的手机号
                /*if( res.data.new_account ){         //若账号强制修改
                    this.api.setCookie('login_info',res.data,7)       //存‘账号名已修改’页面需要的的信息
                    this.$router.push({name: 'ResetAccount'});
                }else{          //若本身的账号没有修改
                    this.$router.push({name: 'Home'});
                }*/
                this.$router.push({name: 'Home'});
            }else{
                this.api.getmsg(res);
            }
        }
    }
};
</script>

<style lang="scss" scoped>
    p{
        color: #1a0003;
        font-size: 18px;
        padding-top: 0.5rem;
        margin: 0 0 0.45rem 0.4rem;
    }
    .form{
        margin: 0 0.4rem;
        li{
            position: relative;
            &:nth-child(1),&:nth-child(2){
                box-sizing: border-box;
                height: 1.4rem;
                padding: 0.25rem 0 0.2rem 0.2rem;
                border: 1px solid #727176;
                border-radius: 8px;
            }
            &:nth-child(2){
                margin: 0.3rem 0 0.9rem 0;
            }
            &.on{
                border: 1px solid #c70019;
            }
            .account{
                font-size: 16px;
                color: #727176;
            }
            .time{
                font-size: 13px;
                color: #bfbfbf;
            }
            button{
                width: 6.7rem;
                height: 0.88rem;
                font-size: 18px;
                color: #fff;
                border: none;
                border-radius: 10px;
                outline: none;
                background-image: -webkit-linear-gradient(left, #c70019, #fd3d24);
            }
            @at-root .radio-core{
                position: absolute;
                width: 0.32rem;
                height:0.32rem;
                right: 0.2rem;
                top: 50%;
                margin-top: -0.16rem;
                input[type="radio"]{
                    // display: none;
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    z-index: 1;
                    opacity: 0;
                }
                em{
                    display: block;
                    position: relative;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    border: 1px solid #727176;
                    background: #fff;
                    &:after{
                        position: absolute;
                        top: 3px;
                        left: 3px;
                        width: 8px;
                        height: 8px;
                        content: " ";
                        background-color: #c70019;
                        border-radius: 100%;
                        transition: transform .2s;
                        -webkit-transform: scale(0);
                        transform: scale(0);
                    }
                }
            }
            input[type="radio"]:checked + em {
                background-color: #fff;
                border: 1px solid #c70019;
            }
            input[type="radio"]:checked + em:after {
                transform: scale(1);
            }
        }
    }
</style>