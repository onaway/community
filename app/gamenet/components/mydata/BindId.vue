<template>
    <div class="bind-id">
        <header class="header"><i class="goback" @click="goBack"></i>绑定角色ID</header>
        <div class="container">
            <h2>亲爱的用户：</h2>
            <p>为了更好的给您提供服务，请先绑定您的角色信息。</p>
            <div class="form">
                <ul>
                    <li><i class="icon-user"></i><input type="tel" v-model="form.roleid" placeholder="15位数字角色ID" maxlength="15"></li>
                    <li>
                        <div class="yzm-box">
                            <i class="icon-yzm"></i>
                            <input type="number" v-model="form.code" class="input-yzm" placeholder="验证码" oninput="if(value.length>4)value=value.slice(0,4)">
                        </div>
                        <button class="yzm-btn" @click="sendCode1" v-show="yzm1">获取验证码</button>
                        <button class="yzm-btn" @click="sendCode2" v-show="yzm2">重发验证码</button>
                        <span class="send" v-show="time"><em>{{count}}</em>s后重新发送</span>
                    </li>
                    <li><button class="confirm-btn" @click="confirmId">确认</button></li>
                </ul>
            </div>
            <p><em>角色ID：</em>登入游戏，在游戏的主界面，点击屏幕左上方的人物头像后，会出现您的角色ID，15位数字。</p>
            <p><em>验证码：</em>点击“获取验证码”后，系统会向您填写的角色ID的游戏内邮箱发送邮件，请登录游戏查看验证码。</p>
        </div>
        
    </div>
</template>

<script>
import Toast from '@/components/toast/toast.js'
export default {
    name: "PersonalCenter",
    components:{
        // PostItem
    },
    data() {
        return {
            form:{
                roleid:'',
                uid:'',
                code:'',
                game:1
            },
            user:'',            //用户token
            yzm1: true,         //是否显示获取验证码按钮
            yzm2: false,        //是否显示重发验证码按钮
            time: false,        //是否显示倒计时
            timer1: '',         //定时器
            count: 60,          //倒计时总时间60s
            flag: false         //判断是否获取验证码
        };
    },
    created(){
        this.user = this.api.islogin();
        this.form.uid = this.user;
    },
    methods: {
        goBack: function(){          //返回上一页面
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
        sendCode1: function(){       //获取验证码
            let reg = /^[1|2|3|4|5|6|7|8|9][0-9]{14}$/.test(this.form.roleid);
            if( !reg ){
                Toast('请输入正确的15位角色ID');
            }else{
                this.sendYzm();
            }
        },
        sendCode2: function(){       //重发验证码
            if( this.form.roleid ){
                let reg = /^[1|2|3|4|5|6|7|8|9][0-9]{14}$/.test(this.form.roleid);
                if(!reg ){
                    Toast('请输入正确的15位角色ID');
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
        sendYzm: function(){         //发送验证码
            this.api.post('community.user.login.sendRoleCode',{roleid:this.form.roleid},this.CbSendCode);
        },
        CbSendCode: function (res){         //发送验证码回调的接口数据
            // console.log('验证码接口数据:',res);
            if( res.code == 1 ){
                this.yzm1 = false;          //获取验证码按钮隐藏
                this.time = true;           //60s倒计时显示
                this.updateTime();          //开始倒计时
                this.flag = true;
            }else{
                this.api.getmsg(res);       //失败调用的函数
            }
            
        },
        confirmId: function(){              //确认按钮
            let roleid = this.form.roleid;
            let code = this.form.code;
            let regRid = /^[1|2|3|4|5|6|7|8|9][0-9]{14}$/.test(roleid);
            let regCode = /^\d{4}$/.test(code);
        
            if( roleid == '' ){          //角色ID为空
                Toast('请输入角色ID');
            }else{                      //有角色ID的情况下
                if( !regRid ){          //角色ID不对
                    Toast('请输入正确的15位角色ID');
                }else{                  //角色ID对的情况下
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
                            this.api.post('community.user.login.bind',this.form,this.CbBindData);
                        }
                    }
                }
            }
        },
        CbBindData: function(res){          //确认回调的接口数据
            // console.log('确认回调的接口数据',res);
            if( res.code == 1 ){
                Toast('绑定成功');
                setTimeout(()=>{
                    this.$router.go(-1);
                },500);
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
    .container{
        // font-size: 14px;
        padding: 0.2rem 0.3rem 0;
        h2{
            color: #1b0003;
            font-weight: bold;
        }
        p{
            color: #949494;
            em{
                color: #1b0003;
                font-weight: bold;
            }
        }
    }
    .form{
        margin: 0.3rem 0 1rem;
        li{
            height: 0.8rem;
            margin-bottom: 0.2rem;
            border: 1px solid #e2e2e2;
            border-radius: 5px;
            &:nth-child(2),&:nth-child(3){
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
                width: 2.0rem;
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
</style>
