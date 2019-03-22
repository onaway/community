<template>
    <div>
        <header class="header"><i class="goback" @click="goBack"></i>密码重置</header>
        <p class="introdue">当前页面仅适用于已经绑定手机号的欢动账号。未绑定手机号的欢动账号需要联系客服人工重置。</p>
        <div class="form">
            <ul>
                <li>
                    <i class="icon-tel"></i>
                    <input type="tel" v-model="form.mobile_phone" placeholder="请输入11位手机号" maxlength="11">
                </li>
                <li>
                    <div class="input-box">
                        <i class="icon-yzm"></i>
                        <input class="input-yzm" type="tel" v-model="form.message_code" placeholder="请输入验证码" maxlength="6">
                    </div>
                    <button class="yzm-btn" @click="sendCode1" v-show="yzm1">获取验证码</button>
                    <button class="yzm-btn" @click="sendCode2" v-show="yzm2">重发验证码</button>
                    <span class="send" v-show="time"><em>{{count}}</em>s后重新发送</span>
                </li>
                <li>
                    <i class="icon-psd"></i>
                    <input type="password" v-model="password" @keyup.enter="confirmPsd" placeholder="新密码（6-16位字符，区分大小写）" maxlength="16">
                </li>
                <li><button class="revise" @click="confirm" ref="revisebutton">确认修改</button></li>
            </ul>
        </div>
    </div>
</template>

<script>
import Toast from '@/components/toast/toast.js'
export default {
    name: "Password",
    data: function() {
        return {
            form:{              //手机号和验证码
                mobile_phone:'',
                message_code:'',
                password: '',
                message_type: 2,
            },
            password: '',       //输入的欢动账号密码
            yzm1: true,         //是否显示获取验证码按钮
            yzm2: false,        //是否显示重发验证码按钮
            time: false,        //是否显示倒计时
            timer1: '',         //定时器
            count: 60,          //倒计时总时间60s
            flag: false,        //判断是否获取验证码
        };
    },
    created() {
        let token = this.api.getCookie('myuser');
        if( token ) this.$router.push({path:'/'});
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
                this.api.getmsg(res);           //失败调用的函数
            }
        },
        confirm: function () {              //确认修改
            let mobile = this.form.mobile_phone;
            let code = this.form.message_code;
            let password = this.password;
            let regTel = /^1[3|4|5|7|8|9][0-9]{9}$/.test(mobile);
            let regCode = /^\d{6}$/.test(code);
            let regPsd = /^[a-zA-Z0-9]{6,16}$/.test(password);  

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
                    }else{                     //验证码有值的情况下
                        if( !regCode ){        //验证码不对
                            Toast('请输入6位数字验证码');
                        }else{                 //验证码对
                            if( password == '' ){   //密码为空时
                                Toast('请输入密码');
                            }else{                  //密码有值时
                                if( !regPsd ){      //密码不对时
                                    Toast('密码为6-16位字符');
                                }else{
                                    this.form.password = this.api.SHA1(password);
                                    console.log('form:',this.form);
                                    this.api.post('community.user.login.resetPassword',this.form,this.CbPassword);
                                }
                            }
                        }
                    }
                }
            }
        },
        CbPassword: function (res) {        //确认修改接口回调
            console.log('确认修改数据:',res);
            if( res.code == 1 ){
                this.$router.push({path: '/login'});
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
        confirmPsd: function(){             //手机号登录的input框的软键盘enter的keyup事件
            this.$refs.revisebutton.click();
        }
    }
};
</script>

<style lang="scss" scoped>
    @import '../css/passWord.scss';
</style>

