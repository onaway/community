<template>
    <div>
        <header class="header">手机认证</header>
        <p class="introdue">依据《网络安全法》，为保障您的帐号安全与正常使用，请尽快绑定您的手机号，感谢您的理解及支持！</p>
        <div class="form">
            <ul>
                <li>
                    <i class="icon-tel"></i>
                    <input type="tel" v-model="form.mobile_phone" placeholder="请输入11位手机号" maxlength="11">
                </li>
                <li>
                    <div class="input-box">
                        <i class="icon-yzm"></i>
                        <input class="input-yzm" type="tel" v-model="form.message_code" @keyup.enter="telBind" placeholder="请输入验证码" maxlength="6">
                    </div>
                    <button class="yzm-btn" @click="sendCode1" v-show="yzm1">获取验证码</button>
                    <button class="yzm-btn" @click="sendCode2" v-show="yzm2">重发验证码</button>
                    <span class="send" v-show="time"><em>{{count}}</em>s后重新发送</span>
                </li>
                <li><button class="bind" @click="bind" ref="bindbutton">确认绑定</button></li>
                <li>认证后可以使用手机号+验证码或手机号/账号+密码登录。</li>
            </ul>
        </div>
    </div>
</template>

<script>
import Toast from '@/components/toast/toast.js'
export default {
    name: "Authentication",
    data: function() {
        return {
            form:{              //手机号和验证码
                account: '',
                password: '',
                mobile_phone:'',
                message_code:'',
                message_type: 3
            },
            yzm1: true,         //是否显示获取验证码按钮
            yzm2: false,        //是否显示重发验证码按钮
            time: false,        //是否显示倒计时
            timer1: '',         //定时器
            count: 60,          //倒计时总时间60s
            flag: false,        //判断是否获取验证码
        };
    },
    created(){
        this.form.password = this.api.getCookie('password');
        this.form.account = this.api.getCookie('bind_phone_account');
        console.log('password:',this.form.password);
        console.log('account:',this.form.account);
    },
    methods: {
        sendCode1: function () {            //获取验证码
            var reg = /^1[3|4|5|7|8|9][0-9]{9}$/.test(this.form.mobile_phone);
            if( this.form.mobile_phone == '' ){   //手机号为空时
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
            var reg = /^1[3|4|5|7|8|9][0-9]{9}$/.test(this.form.mobile_phone);
            if( this.form.mobile_phone == '' ){   //手机号为空时
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
            this.api.post('community.user.login.sendMessage',this.form,this.CbSendCode);
        },
        CbSendCode: function (res){         //发送验证码回调的接口数据
            console.log('res:',res);
            if( res.code == 1 ){
                this.yzm1 = false;          //获取验证码按钮隐藏
                this.time = true;           //60s倒计时显示
                this.updateTime();          //开始倒计时
                this.flag = true;
            }else{
                this.api.getmsg(res);       //失败调用的函数
            }
        },
        bind: function () {                 //确认绑定
            let mobile = this.form.mobile_phone;
            let code = this.form.message_code;
            let regTel = /^1[3|4|5|7|8|9][0-9]{9}$/.test(mobile);
            let regCode = /^\d{6}$/.test(code);

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
                        if( !regCode ){         //验证码不对
                            Toast('请输入6位数字验证码');
                        }else{                  //验证码对
                            // console.log('form:',this.form);
                            this.api.post('community.user.login.bindMobilePhone',this.form,this.CbBind);
                        }
                    }
                }
            }
        },
        CbBind: function (res) {            //确认绑定回调的接口数据
            console.log('绑定手机数据:',res);
            if( res.code == 1 ){
                Toast('手机认证成功');
                this.$router.push({name: 'Home'});
            }else{
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
                    this.$router.push({name: 'Home'});
                }
            } else { //未知的浏览器 
                this.$router.go(-1);
            }
        },
        telBind: function(){               //手机号登录的input框的软键盘enter的keyup事件
            this.$refs.bindbutton.click();
        }
    }
};
</script>

<style lang="scss" scoped>
    @import '../css/authentication.scss';
</style>

