
export default {
    state:{
        wxShareShow: false,
    },
    getters: {
        wxShareShow: state => state.wxShareShow,
    },
    mutations: {
        CHANGE_WX_STATUS(state,status){
            // console.log('status:',status);
            state.wxShareShow = status;
        },
    },
    actions:{
        changeWxStatus( {commit},data ){  //微信引导图是否显示
            commit('CHANGE_WX_STATUS',data)
        }
    }
}