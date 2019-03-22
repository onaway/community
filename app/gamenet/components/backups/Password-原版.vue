<template>
    <div class="password">
        <header class="header"><i class="goback" @click="goBack" ></i>修改密码</header>
        <div class="form">
            <ul>
                <li><i class="icon-user"></i><input type="tel" v-model="form.phone" placeholder="手机号" maxlength="11"></li>
                <li><i class="icon-psd"></i><input type="password" v-model="form.password1" placeholder="新密码（6-16位字符组成，区分大小写）" maxlength="16"></li>
                <li><i class="icon-confirm"></i><input type="password" v-model="form.password2" placeholder="确认密码（6-16位字符组成，区分大小写）" maxlength="16"></li>
                <li>
                    <div class="yzm-box">
                        <i class="icon-yzm"></i>
                        <input type="number" class="input-yzm" v-model="form.code" placeholder="验证码" oninput="if(value.length>6)value=value.slice(0,6)">
                    </div>
                    <button class="yzm-btn" v-show="yzm1" @click="sendCode1">获取验证码</button>
                    <button class="yzm-btn" v-show="yzm2" @click="sendCode2">重发验证码</button>
                    <span class="send" v-show="time"><em>{{count}}</em>s后重新发送</span>
                </li>
                <li><button class="confirm-btn" @click="confirmPassword">确认修改</button></li>
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
            form:{
                phone:'',
                password1:'',
                password2:'',
                code:''
            },
            count: '60',        //倒计时总时间60s
            yzm1: true,         //是否显示获取验证码按钮
            yzm2: false,        //是否显示重发验证码按钮
            time: false,        //是否显示倒计时
            timer1: '',         //定时器
            flag: false         //判断是否获取验证码
        };
    },
    methods: {
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
        sendCode1:function(){               //获取验证码
            this.form.action='forget';
            var regTel = /^1[3|4|5|7|8|9][0-9]{9}$/.test(this.form.phone);
            var regPsd = /^[a-zA-Z0-9]\w{5,15}$/.test(this.form.password1);
            // var regPsd2 = /^[a-zA-Z0-9]\w{5,15}$/.test(this.form.password2);
            if( !regTel ){              //手机号不对
                Toast('请输入正确的11位手机号');
            }else{                      //手机号对情况下
                if( !regPsd ){          //密码不对
                    Toast('请输入6-16位新密码');
                }else{                  //密码对的时候
                    if( this.form.password1 != this.form.password2 ){   //确认密码与密码不一致时
                        Toast('两次密码不一致，请重新输入');
                    }else{              //确认密码与密码一样时
                        this.sendYzm();
                    }
                } 
            }
        },
        sendCode2: function(){              //重发验证码
            this.form.action='forget';
            
            var regTel = /^1[3|4|5|7|8|9][0-9]{9}$/.test(this.form.phone);
            var regPsd = /^[a-zA-Z0-9]\w{5,15}$/.test(this.form.password1);
            if( !regTel ){
                Toast('请输入正确的11位手机号');
            }else{
                if( !regPsd ){
                    Toast('请输入6-16为新密码');
                }else{
                    if( this.form.password1 != this.form.password2 ){
                        Toast('两次密码不一致，请重新输入');
                    }else{
                        this.yzm2 = false;      //重新获取验证码按钮隐藏
                        this.count = 60;        //时间调整为60s
                        this.time = true;       //倒计时显示
                        this.updateTime();      //开始倒计时
                        this.sendYzm();
                    }
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
            this.api.post('community.user.login.sendcode',this.form,this.CbSendCode);
        },
        CbSendCode: function(res){          //发送验证码回调的接口数据
            // console.log('res',res);
            if( res.data == 1 ){
                this.yzm1 = false;          //获取验证码按钮隐藏
                this.time = true;           //60s倒计时显示
                this.updateTime();          //开始倒计时
                this.flag = true;
            }
        },
        confirmPassword: function(){        //确认修改密码
            // console.log('form',this.form);
            var phone = this.form.phone;
            var password1 = this.form.password1;
            var password2 = this.form.password2;
            var code = this.form.code;
            var regTel = /^1[3|4|5|7|8|9][0-9]{9}$/.test(phone);
            var regPsd = /^[a-zA-Z0-9]\w{5,19}$/.test(this.form.password1);
            var regCode =  /^\d{6}$/.test(this.form.code);
            if( !regTel ){              //手机号不对时
                Toast('请输入正确的11位手机号');
            }else{                      //手机号对时
                if( !regPsd ){          //密码不对
                    Toast('请输入6-20位新密码');
                }else{                  //密码对的时候
                    if( this.form.password1 != this.form.password2 ){   //确认密码与密码不一致时
                        Toast('两次密码不一致，请重新输入');
                    }else{              //确认密码与密码一样时
                        if( code == '' ){           //验证码为空时
                            if( this.flag ){        //已获取验证码
                                Toast('请输入验证码');
                            }else{                  //没有获取验证码
                                Toast('请获取验证码');
                            }
                        }else{                      //有验证码时
                            if( !regCode ){         //验证码不对时
                                Toast('请输入6位数字验证码');
                            }else{                  //验证码对时
                                this.api.post('community.user.login.forget',this.form,this.CbConfirmPassword);
                            }
                        }
                    }
                } 
            }
        },
        CbConfirmPassword: function(res){      //发送修改密码回调的接口数据
            // console.log(res);
            if( res.code == 1 ){
                Toast('修改成功');
                this.api.clearAllCookie();     //清除所有cookie
                this.$router.go(-1);
            }else{
                this.api.getmsg(res);           //失败调用的函数
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
    .password{
        i{
            background-size: 6.4rem 4.8rem;
            background-image: url(/static/img/icon.png);
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
            margin: 1rem 0.3rem 0;
            li{
                height: 0.8rem;
                margin-bottom: 0.2rem;
                border: 1px solid #e2e2e2;
                border-radius: 5px;
                &:nth-child(4),&:nth-child(5){
                    border: none;
                }
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
                .icon-psd{
                    background-position: 0 -2.4rem;
                }
                .icon-confirm{
                    background-position: -1.6rem -2.4rem;
                }
                .icon-yzm{
                    background-position: -0.8rem -2.4rem;
                }
                input{
                    width: 5.8rem;
                    height: 0.8rem;
                    border: none;
                    outline: none;
                    text-indent: 0.2rem;
                }
                .yzm-box{
                    float: left;
                    width: 4.5rem;
                    border: 1px solid #e2e2e2;
                    border-radius: 5px;
                }
                .input-yzm{
                    width: 3.4rem;
                }
                button{
                    color: #fff;
                    background: #c70019;
                    border: none;
                    outline: none;
                    border-radius: 5px;
                }
                .yzm-btn{
                    float: right;
                    width: 2.1rem;
                    height: 0.8rem;
                    font-size: 15px;
                }
                .send{
                    float: right;
                    height: 0.8rem;
                    line-height: 0.8rem;
                    color: #949494;
                    margin-right: 0.2rem;
                }
                .confirm-btn{
                    width: 6.9rem;
                    height: 0.88rem;
                    font-size: 18px;
                    margin-top: 0.2rem;
                }
            }
        }
    }
</style>
<style>
    .mint-toast.is-placebottom{
        width:-webket-fit-content;
        width:-moz-fit-content;
        width:fit-content;
        white-space: nowrap;
        margin:auto;
    }
</style>

