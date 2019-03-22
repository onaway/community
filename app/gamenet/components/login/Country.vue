<template>
    <div class="country">
        <div class="wrapper">
            <header class="header"><i class="goback" @click="goBack"></i>选择国家/地区</header>
            <div class="container">
                <h2>请为您的手机号选择国家/地区</h2>
                <ul>
                    <li v-for="item in countries.china" :key="item.id" @click="chooseCountry(item.code)">
                        <i class="icon-flag" :style="{backgroundPosition:showFlag(item.m_flag,item.pc_flag)}"></i>
                        <span>{{item.country}}</span>
                        <em>{{item.code}}</em>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Country",
    data:function() {
        return {
            countries:{
                china: [
                    {country: '马来西亚', code: '+60',m_flag: '0 -0.7rem',pc_flag:'0 -70px'},
                    {country: '新加坡', code: '+65',m_flag: '0 -1.4rem',pc_flag:'0 -140px'},
                    // {country: '菲律宾', code: '+63',m_flag: '',pc_flag: ''},
                    // {country: '韩国', code: '+82',m_flag: '',pc_flag: ''},
                    // {country: '柬埔寨', code: '+855',m_flag: '',pc_flag: ''},
                    // {country: '老挝', code: '+856',m_flag: '',pc_flag: ''},
                    // {country: '缅甸', code: '+95',m_flag: '',pc_flag: ''},
                    // {country: '日本', code: '+81',m_flag: '',pc_flag: ''},
                    // {country: '泰国', code: '+66',m_flag: '',pc_flag: ''},
                    // {country: '印度尼西亚', code: '+62',m_flag: '',pc_flag: ''},
                    // {country: '越南', code: '+84',m_flag: '',pc_flag: ''},
                ],
                english:{

                }
            },
            screenWidth: document.body.clientWidth, // 屏幕宽度
        };
    },
    created () {
        const that = this;
        window.onresize = () => {       //移动pc切换的时候重新计算屏幕宽度
            return (() => {
                window.screenWidth = document.body.clientWidth;
                that.screenWidth = window.screenWidth;
            })()
        }
    },
    methods: {
        showFlag(m_flag,pc_flag){       //根据屏幕宽度显示图标的background-position
            // console.log('screen:',this.screenWidth);
            // console.log('m_flag:',m_flag,' pc_flag:',pc_flag);
            if( this.screenWidth > 640 ){
                return pc_flag;
            }else{
                return m_flag;
            }
        },
        chooseCountry(code){            //选择国家
            this.$emit('choosecode',code);
        },
        goBack(){                       //隐藏本组件
            this.$emit('hide');
        }
    },
};
</script>

<style lang="scss" scoped>
    /*===移动===*/
    @media all and (max-width: 639px){
        .wrapper{
            height: 100%;
            background: #fff;
        }
        .container{
            padding: 0 0.3rem;
            h2,li{
                height: 0.8rem;
                line-height: 0.8rem;
                font-size: 16px;
            }
            li{
                font-size: 14px;
                i{
                    width: 0.9rem;
                    height: 0.7rem;
                    background-size: 3.6rem 2.1rem;
                }
                span{
                    margin-left: 0.25rem;
                }
            }
        }
    }

    /*===pc===*/
    @media all and (min-width: 640px) { 
        .country{
            overflow: auto;
            background: url('/static/img/bg.jpg') no-repeat left top/cover;
            .wrapper{
                width: 650px;
                min-height: 100%;
                margin: auto;
                background: #fff;
            }
        }
        .container{
            padding: 0 30px;
            h2,li{
                height: 80px;
                line-height: 80px;
                font-size: 24px;
            }
            li{
                font-size: 20px;
                cursor: pointer;
                i{
                    width: 90px;
                    height: 70px;
                }
                span{
                    margin-left: 25px;
                }
            }
        }
    }
    
    /*===主体内容样式===*/
    .country{
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        right: 0;
    }
    .container{
        color: #434343;
        h2{
            border-bottom: 1px solid #d4d4d4;
        }
        li{
            position: relative;
            display: flex;
            align-items: center;
            border-bottom: 1px solid #d4d4d4;
            i{
                background-image: url('/static/img/country.png');
            }
            em{
                position: absolute;
                right: 0;
            }
        }
    }
</style>
