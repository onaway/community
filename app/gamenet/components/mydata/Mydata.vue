<template>
    <div>
        <transition :name="transitionName">
            <router-view class="router"></router-view>
        </transition>
    </div>
</template>

<script>
export default {
    name: "Mydata",
    data() {
        return {
            transitionName:'slide-left',
        };
    },
    watch:{
        $route(to, from) {   
            if(to.meta.index > from.meta.index){
                //设置动画名称
                this.transitionName = 'slide-left';
            }else{
                this.transitionName = 'slide-right';
            } 
        }  
    },
};
</script>

<style>
    
</style>