
export default {
    state:{
        commentData: {},
        comingRouter: '',
    },
    getters: {
        commentData: state => state.commentData,
        comingRouter: state => state.comingRouter,
    },
    mutations: {
        SET_COMMENT_DATA(state,data){      //存评论页面需要的数据
            state.commentData = data;
            console.log('commentData:',state.commentData);
        },
        SET_COMING_ROUTER(state,data){    //存进来页面的路由路径
            state.comingRouter = data;
            console.log('comingRouter:',state.comingRouter);
        },
    },
    actions:{
        setCommentData( {commit},data ){  //存储帖子正文相关的数据
            commit('SET_COMMENT_DATA',data)
        },
        setComingRouter( {commit},data ){ //存进来页面的路由路径
            commit('SET_COMING_ROUTER',data)
        }
    }
}