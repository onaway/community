
export default {
    state:{
        commentData: {},
        comingRouter: '',
        isPerLoadmore: false,
        isHomeLoadmore: false,
        isMsgLoadmore: false,
        isPostLoadmore: false,
        isCommentLoadmore: false,
    },
    getters: {
        commentData: state => state.commentData,
        comingRouter: state => state.comingRouter,
        isPerLoadmore: state => state.isPerLoadmore,
        isHomeLoadmore: state => state.isHomeLoadmore,
        isMsgLoadmore: state => state.isMsgLoadmore,
        isPostLoadmore: state => state.isPostLoadmore,
        isCommentLoadmore: state => state.isCommentLoadmore,
    },
    mutations: {
        SET_COMMENT_DATA(state,data){     //存评论页面需要的数据
            state.commentData = data;
        },
        SET_COMING_ROUTER(state,data){    //存进来页面的路由路径
            state.comingRouter = data;
        },
        SET_PERSONAL_LOAD_STATUS(state){  //设置个人中心->帖子详情，再返回时是否需要触发下拉加载操作
            state.isPerLoadmore = true;
        },
        SET_HOME_LOAD_STATUS(state){      //设置首页->帖子详情，再返回时是否需要触发下拉加载操作
            state.isHomeLoadmore = true;
        },
        SET_MESSAGE_LOAD_STATUS(state){   //设置消息中心->帖子详情，再返回时是否需要触发下拉加载操作
            state.isMsgLoadmore = true;
        },
        SET_POST_LOAD_STATUS(state){      //设置帖子详情->评论详情，再返回时是否需要触发下拉加载操作
            state.isPostLoadmore = true;
        },
        SET_COMMENT_LOAD_STATUS(state){   //设置评论详情->评论页，再返回时是否需要触发下拉加载操作
            state.isCommentLoadmore = true;
        },
    },
    actions:{
        setCommentData( {commit},data ){  //存储帖子正文相关的数据
            commit('SET_COMMENT_DATA',data)
        },
        setComingRouter( {commit},data ){ //存进来页面的路由路径
            commit('SET_COMING_ROUTER',data)
        },
        setPersonalLoadStatus( {commit} ){  //设置个人中心->帖子详情，再返回时是否需要触发下拉加载操作
            commit('SET_PERSONAL_LOAD_STATUS')
        },
        setHomeLoadStatus( {commit} ){      //设置首页->帖子详情，再返回时是否需要触发下拉加载操作
            commit('SET_HOME_LOAD_STATUS')
        },
        setMessageLoadStatus( {commit} ){   //设置消息中心->帖子详情，再返回时是否需要触发下拉加载操作
            commit('SET_MESSAGE_LOAD_STATUS')
        },
        setPostLoadStatus( {commit} ){      //设置帖子详情->评论详情，再返回时是否需要触发下拉加载操作
            commit('SET_POST_LOAD_STATUS')
        },
        setCommentLoadStatus( {commit} ){   //设置评论详情->评论页，再返回时是否需要触发下拉加载操作
            commit('SET_COMMENT_LOAD_STATUS')
        },
    }
}