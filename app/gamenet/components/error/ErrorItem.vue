<template>
   <div class="error">
       <header class="header"><i class="goback" @click="goBack"></i>欢动游戏厅</header>
       <div class="error-pic">
           <img src="/static/img/404.jpg" alt="404错误">
       </div>
       <p>{{msg}}</p>
       <button @click="goIndex">返回首页</button>
   </div>
</template>


<script>
export default {
    name: "Error",
    data:function() {
        return {
            msg:'抱歉，您访问的页面地址有误，或者该页面不存在' 
        };
    },
    methods: {
        goBack: function(){
            this.$router.go(-1);
        },
        goIndex(){
            this.$router.push({path:'/'});
        }
    },
    mounted:function() {
        document.getElementsByTagName("body")[0].classList.remove("add_bg"); 
    },
};
</script>

<style lang="scss" scoped>
    .error{
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: #fff;
        z-index: 99;
    }
    .error-pic{
        width: 5rem;
        height: 5rem;
        margin: 1rem auto 0.5rem;
        img{
            width: 100%;
            height: 100%;
        }
    }
    p{
       font-size: 16px;
       text-align: center;
       margin: 0 1.5rem;
    }
    button{
        position: absolute;
        bottom: 1.5rem;
        left: 50%;
        width: 5rem;
        height: 0.8rem;
        color: #fff;
        font-size: 16px;
        margin-left: -2.5rem;
        border: none;
        outline: none;
        border-radius: 30px;
        background: #c70019;
    }
</style>
