<template>
    <div class="myname">
        <header class="header">
            <i class="goback" @click="goBack"></i>
            设置用户名
        </header>
        <div class="inputBox">
            <i class="icon-user"></i>
            <input type="text" v-model="form.uname" maxlength="10">
        </div>
        <p>*用户名为2-10个字符组成，支持中英文和数字</p>
        <p>*每90天可以修改一次用户名，一定要谨慎哦</p>
        <button @click="submit">确认</button>
    </div>
</template>

<script>
import Toast from '@/components/toast/toast.js'
import {mapActions} from 'vuex'
export default {
    name: "MyName",
    data:function() {
        return {
            user: '',       //用户token
            form:{
                uid:'',
                game: 1,
                uname:''
            }
        };
    },
    created:function(){
        this.user = this.api.islogin();
        this.form.uname = this.$route.query.uname;
    },
    methods: {
        ...mapActions(['clearHomeData','clearPersonalData']),
        goBack: function(){
            this.$router.go(-1);
        },
        submit: function(){
            if( this.form.uname.length < 2 ){
                Toast('格式不正确，请修改');
                return false;
            };
            let regex = new RegExp("^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9_]){1,20}$");//不包含“-”
            let reg = regex.test(this.form.uname);
            if( !reg ){
                Toast('格式不正确，请修改');
            }else{
                this.form.uid = this.user;
                if( this.form.uid == '' || this.form.uname == '' )return false;
                this.api.post('community.data.detail.setname',this.form,this.CbNameData);
            }
        },
        CbNameData: function(res){
            // console.log(res);
            if( res.code == 1 ){
                Toast('修改成功');
                this.clearHomeData();
                this.clearPersonalData();
                setTimeout(()=>{
                    this.$router.go(-1);
                },300)
            }else if(res.code == -70003){
                Toast('距离上次修改未到90天，无法修改');
            }else if( res.code == -60010 ){
                Toast('昵称违法');
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
    .myname{
        i{
            background-size: 6.4rem 4.8rem;
            background-image: url(/static/img/icon.png);
        }
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
    .inputBox{
        position: relative;
        height: 0.68rem;
        margin: 0.1rem 0 0.25rem;
        background: #fff;
        .icon-user{
            float: left;
            width: 0.44rem;
            height: 0.44rem;
            margin: 0.12rem 0.3rem 0 0.3rem;
            background-position: -4.16rem -3.37rem;
        }
        input{
            width: 5rem;
            height: 100%;
            font-size: 16px;
            color: #535353;
            border: none;
            outline: none;
        }
    }
    p{
        padding: 0 0.3rem;
        color: #b5b5b5;
    }
    button{
        display: block;
        width: 3.2rem;
        height: 0.68rem;
        color: #fff;
        font-size: 16px;
        // line-height: 0.8rem;
        margin: 0.3rem auto 0;
        outline: none;
        border: none;
        border-radius: 5px;
        background: #c70019;
    }
</style>
