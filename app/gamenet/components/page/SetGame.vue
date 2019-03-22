<template>
    <div></div>
</template>

<script>
export default {
    name: "SetGame",
    data: function() {
        return {
            game: 1,
        };
    },
    created:function (){
        var localUrl = window.location.href;
        var tmpArr = localUrl.split('?');
        if( /&/.test(tmpArr[1]) ){
            let arr1 = tmpArr[1].split('&');        
            let arr2 = arr1[0].split('=');
            this.game = arr2[1];
        }else{
            let arr1 = tmpArr[1].split('=');
            let game = arr1[1];
            if( game == 1 || game == 2 ){
                this.game = game;
            }else{
                this.game = 1 + '';
            }
        }
        this.api.setCookie('game',this.game,7);
        this.$router.push({path:'/'});
        
    }
};
</script>

<style lang="scss" scoped>
    
</style>
