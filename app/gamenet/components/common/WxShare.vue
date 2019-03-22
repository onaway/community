<template>
    <div class="wx-share" @click="changeWxStatus(false)">
        <div class="wx-tip"></div>
    </div>
</template>

<script>
import {mapActions} from 'vuex'
export default {
    name: "WxShare",
    data:function() {
        return {};
    },
    methods: {
        ...mapActions(['changeWxStatus']),
    },
};
</script>

<style lang="scss" scoped>
    .wx-share{
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,.6);
        z-index: 100;
    }
    .wx-tip{
        position: absolute;
        top: 0.1rem;
        right: 0.3rem;
        width: 2.54rem;
        height: 3.19rem;
        background: url('/static/img/wx-tip.png')no-repeat left top/cover;
    }
</style>
