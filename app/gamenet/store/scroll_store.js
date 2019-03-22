export default {
    state:{
        homeScrollY:0,
        postTextScrollY:0,
        personalCenterScrollY:0,
        commentDetailScrollY:0,
        messageCenterScrollY:0
    },
    getters: {
        homeScrollY:state => state.homeScrollY
    },
    mutations: {
        changeHomeScrollY(state,homeScrollY) {          //首页帖子滚动高度
            state.homeScrollY = homeScrollY
        },
        changePostTextScrollY(state,postTextScrollY) {  //帖子详情页滚动高度
            state.postTextScrollY = postTextScrollY
        },
        changeCDScrollY(state,commentDetailScrollY) {   //评论详情页滚动高度
            state.commentDetailScrollY = commentDetailScrollY
        },
        changePCScrollY(state,personalCenterScrollY) {  //个人中心滚动高度
            state.personalCenterScrollY = personalCenterScrollY
        },
        changeMCScrollY(state,messageCenterScrollY) {   //个人中心滚动高度
            state.messageCenterScrollY = messageCenterScrollY
        },
    },
}

/* == 此页已经无用武之地 == */