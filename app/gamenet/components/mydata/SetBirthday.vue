<template>
    <div class="myname">
        <header class="header">
            <i class="goback" @click="goBack"></i>
            设置生日
        </header>
        <div class="birth">
            生日：<select v-model="yy">
                <option v-for="item in year" :key="item.id">{{item}}</option>
            </select> <span class="year">年</span>
            <select v-model="mm" class="second">
                <option v-for="item in month" :key="item.id">{{item}}</option>
            </select> <span class="month">月</span>
            <select v-model="dd" class="third">
                <option v-for="item in day" :key="item.id">{{item}}</option>
            </select> <span>日</span>
        </div>
        <p>*生日设置成功后将无法修改，请填写正确的生日</p>
        <button @click="submit">确认</button>
    </div>
</template>

<script>
import Toast from '@/components/toast/toast.js'
export default {
    name: "SetBirthday",
    data:function() {
        return {
            user:'',
            years:[],
            months:[],
            days:[],
            yy:'1980',
            mm:'1',
            dd:'1',
            form:{
                uid:'',
                game:1,
                birthday:''
            },
            length: '',
            flag: false,
        };
    },
    created: function(){
        this.user = this.api.islogin();
    },
    computed: {
        year: function(){       //100年的数组
            let date = new Date().getFullYear();
            for (var i = 0; i < 100; i++) {
                this.years.push(date);
                date -= 1;
            }
            return this.years;
        },
        month: function(){      //12个月的数组
            let date = 1;
            for (var i = 0; i < 12; i++) {
                this.months.push(date);
                date += 1;
            }
            return this.months;
        },
        day: function(){        //一个月多少天的数组
            let date = 1;
            let year = this.yy;
            let month = this.mm;
            this.length = this.getMonthNum(year,month);
            this.days = [];
            for (var i = 0; i < this.length; i++) {
                this.days.push(date);
                date += 1;
            }
            return this.days;
        }
    },
    methods: {
        goBack: function(){
            this.$router.go(-1);
        },
        getMonthNum: function(year,month){      //获取月份的天数
            let d = new Date(year, month, 0);
            return d.getDate();
        },
        submit: function(){
            this.form.uid = this.user;
            this.form.birthday = this.yy+'/'+this.mm+'/'+this.dd;
            if( this.form.uid ==''||this.form.birthday == '' )return false;
            this.api.post('community.data.detail.setbirthday',this.form,this.CbBirthdayData);
        },
        CbBirthdayData: function(res){
            // console.log('birthday res:',res);
            if( res.code == 1 ){
                Toast('修改成功');
                setTimeout(()=>{
                    this.$router.go(-1);
                },300)
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
    .birth{
        height: 0.68rem;
        line-height: 0.68rem;
        font-size: 16px;
        margin: 0.1rem 0 0.25rem;
        padding: 0 0.3rem;
        background: #fff;
        select{
            width: 1.2rem;
            font-size: 14px;
            border: 1px solid #b6b6b6;
            border-radius: 3px;
            outline: none;
            background: #fff;
            &.second{
                width: 1rem;
            }
            &.third{
                width: 1rem;
            }
        }
        .year{
            margin-right: 0.3rem;
        }
        .month{
            margin-right: 0.3rem;
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
