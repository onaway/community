<template>
    <div class="sg-report">
        <div class="form">
            <h2>请选择举报类型</h2>
            <div class="sg-type">
                <div class="radio-box">
                    <div class="fl">
                        <input type="radio" id="item1" value="1" v-model="form.reason">
                        <label for="item1" class="radio-core">
                            <div class="radio-wrap"><em></em><span>辱骂诋毁</span></div>
                        </label>
                    </div>
                    <div class="fr">
                        <input type="radio" id="item2" value="2" v-model="form.reason">
                        <label for="item2" class="radio-core">
                            <div class="radio-wrap"><em></em><span>垃圾广告</span></div>
                        </label>
                    </div>
                </div>
                <div class="radio-box">
                    <div class="fl">
                        <input type="radio" id="item3" value="3" v-model="form.reason">
                        <label for="item3" class="radio-core">
                            <div class="radio-wrap"><em></em><span>买卖账号</span></div>
                        </label>
                    </div>
                    <div class="fr">
                        <input type="radio" id="item4" value="4" v-model="form.reason">
                        <label for="item4" class="radio-core">
                            <div class="radio-wrap"><em></em><span>淫秽色情</span></div>
                        </label>
                    </div>
                </div>
                <div class="radio-box">
                    <div class="fl">
                        <input type="radio" id="item5" value="5" v-model="form.reason">
                        <label for="item5" class="radio-core">
                            <div class="radio-wrap"><em></em><span>重复发帖</span></div>
                        </label>
                    </div>
                    <div class="fr">
                        <input type="radio" id="item6" value="6" v-model="form.reason">
                        <label for="item6" class="radio-core">
                            <div class="radio-wrap"><em></em> <span>其他原因</span></div>
                        </label>
                    </div>
                </div>
            </div>
            <p><input type="text" placeholder="请输入详细举报原因" v-model="form.content"></p>
            <p class="repeat" v-show="isShow1">请选择举报类型</p>
            <p class="repeat" v-show="isShow2">请勿重复举报</p>
            <p><button class="btn cancel" @click="cancel">取消</button><button type="submit" class="btn submit" @click="submit">提交</button></p>
        </div>
    </div>
</template>

<script>
import Toast from '@/components/toast/toast.js'
import {mapGetters} from 'vuex'
export default {
    name: "report",
    data:function() {
        return {
            isShow1:false,      //是否显示‘请选择举报类型’
            isShow2:false,      //是否显示‘请勿重复举报’
            reportData: {},     //举报的数据
            hdAccount: {},      //登录记住我的账号和勾的状态
            form:{              //举报参数
                content:'',     //举报内容
                uid:'',         //用户的uid
                tid:'',         //帖子id
                cid: '',        //评论id
                type:'',        //帖子为t，评论为c
                toid:'',        //帖子的uid
                reason:0,       //举报类型
                game:1,         //三国1为1，三国2为2
                toidname:'',    //帖子的昵称
                becontent:''    //帖子内容
            },
            user: '',           //用户信息token
        };
    },
    computed:{
        ...mapGetters(['commentData'])    //vuex获取数据
    },
    created:function(){
        this.user = this.api.islogin();
    },
    methods: {
        cancel: function(){               //取消举报
            this.$emit('parentcancel');
            this.form.reason=0;
            this.form.content='';
            this.isShow1 = false;
            this.isShow2 = false;
        },
        submit: function(){               //提交举报
            this.reportData = this.commentData.list;
            // console.log('this.reportData:',this.reportData);
            if(this.form.reason==0){
                this.isShow1 = true;
                return;
            }else{
                if( this.reportData.cid ){
                    this.form.cid = this.reportData.cid;
                }else{
                    this.form.cid = 0;
                }
                if( this.reportData.toid ){
                    this.form.type = 'c';
                    this.form.toid = this.reportData.uid;
                }else{
                    this.form.type = 't';
                    this.form.toid = this.reportData.uid;
                }
                this.form.uid = this.user;
                this.form.tid = this.reportData.tid;
                this.form.toidname = this.reportData.uname;
                if( this.reportData.content.length >= 1 && this.reportData.content.length <= 20 ){
                    this.form.becontent = this.reportData.content;
                }else{
                    this.form.becontent = this.reportData.content.substr(0,20);
                }
                // console.log('form',this.form);
                if( this.form.uid==''||this.form.tid==''||this.form.toid==''||this.form.toidname=='' )return false;
                this.api.post('community.lang.topic.report',this.form,this.CbReport);
            }
        },
        CbReport: function(res){        //举报返回的接口数据
            // console.log(res);
            if( res.code == 1 ){
                this.form.reason=0;
                this.form.content='';
                this.isShow1 = false;
                Toast('举报成功');
                this.$emit('parentcancel');
            }else if( res.code == -30002 ){
                Toast('请勿重复举报');
            }else{
                this.api.getmsg(res);
            }
        }
    }
};
</script>

<style lang="scss" scoped>
    @import '../css/report.scss';
</style>
