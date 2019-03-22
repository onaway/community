<template>
   <div>
        <header class="header">账号名已修改</header>
        <div class="container">
            <h2>账号名已修改</h2>
            <p class="introduce">
                您的账号名不符合规范，系统已自动进行修改。<span>请及时修改游戏客户端的登录账号，以免影响您正常游戏。</span>
            </p>
            <div class="account-msg">
                <p>当前账号名：{{login_info.new_account}}</p>
                <p>认证手机号：{{login_info.phone_num}}</p>
            </div>
            <button @click="confirm">确定</button>
            <p class="footer-txt">账号相关问题，您还可以从微信公众号或者官网访问《账号服务》查看相关信息。</p>
        </div>
   </div>
</template>

<script>
export default {
    name: "ResetAccount",
    data: function() {
        return {
            login_info: {}          //登录页面登录成功所有的信息
        };
    },
    created() {
        this.login_info = this.api.getCookie('login_info');
        console.log('login_info:',this.login_info);
    },
    methods: {
        confirm(){
            if( this.login_info.bind_phone == 0 ){      
                this.$router.push({name: 'Authentication'});
            }else{
                this.$router.push({name: 'Home'});
            }
        }
    }
};
</script>

<style lang="scss" scoped>
    .container{
        padding: 0.5rem 0.4rem 0;
    }
    h2{
        font-size: 18px;
        color: #1a0003;
        font-weight: bold;
    }
    .introduce{
        color: #727176;
        font-size: 16px;
        margin: 0.4rem 0 1.4rem;
        span{
            color: #c70019;
        }
    }
    .account-msg{
        font-size: 18px;
        color: #c70019;
        font-weight: bold;
        margin: 0 0 2rem 1rem;
        p:first-child{
            margin-bottom: 0.25rem;
        }
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
    .footer-txt{
        color: #727176;
        margin-top: 0.25rem;
    }
</style>