<template>
    <div></div>
</template>

<script>
export default {
    name: "Token",
    data: function() {
        return {
            token:'',
            tokenForm:{                     //token参数
                access_token:'',
                uid:'',
                game:1
            },
            user:'',
        };
    },
    created:function (){
        var localUrl = window.location.href;
        var tmpArr = localUrl.split('?');
        if( tmpArr.length >= 2 ){
            if(tmpArr[1].length > 15){
                this.token = this.api.checkurl();
                // console.log('地址栏问号后的数据：',this.token); 

                var Base64 = require('js-base64').Base64;
                var str = Base64.decode(this.token);
                // console.log('解密后的数据：',str);

                var paramJson = this.getRequest("?"+str);
                // console.log('paramJson:',paramJson);
                this.tokenForm.uid = paramJson.uid;
                this.tokenForm.access_token = paramJson.access_token;
                this.tokenForm.game = paramJson.game;
                // console.log(this.tokenForm.game);
                this.api.setCookie('game',this.tokenForm.game,7);       //设置game的cookie

                console.log('this.tokenForm',this.tokenForm);
                if( this.token ){
                    this.api.post('community.user.login.gettoken',this.tokenForm,this.CbToken);
                }
            }
        }else{
            this.$router.push({path:'/'});
        }
    },
    methods: {
        CbToken: function(res){             //token接口
            // console.log('token接口数据：',res);
            if( res.code == 1 ){
                this.user = res.data;
                let uidJson = {};
                uidJson.uid = this.tokenForm.uid;
                let _uidJson = this.api.encode(uidJson);   //base64加密
                this.api.setCookie('uid',_uidJson,7);      //设置uid cookie
                this.api.setCookie('myuser',this.user,7);
                this.api.setCookie('ingame','1',1);
                // this.api.logInGame()
                this.$router.push({path:'/'});
            }
        },
        getRequest: function(url){          //获取参数
            var theRequest = new Object();
            // console.log('url',url);
            if (url.indexOf("?") != -1) {
                var str = url.substr(1);
                var strs = str.split("&");
                for(var i = 0; i < strs.length; i ++) {
                    theRequest[strs[i].split("=")[0]]=decodeURI(strs[i].split("=")[1]);
                }
            }
            return theRequest;
        }
    }
};
</script>

<style lang="scss" scoped>
    
</style>
