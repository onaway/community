import api from '../api/adminApi'
let state = {
    noticeData:{              
        hd:[],
        return:[]
    },
    notice: [],
    noticePage: '1'
}

let copyState = api.deepCopy(state);  //拷贝state对象

export default {
    state:state,
    getters: {
        noticeData: state => state.noticeData,
        notice: state => state.notice,
        noticePage: state => state.noticePage,
    },
    mutations: {
        SET_NOTICE_DATA(state,obj){       //存消息中心的数据
            state.noticeData = obj.data;
            state.noticePage = obj.page;
            if( obj.type === 'refresh' ){
                state.notice = obj.data.return;
            }else{     
                state.notice = [...state.notice,...obj.data.return];      
            }
        },
        CLEAR_NOTICE_DATA(state){         //清除消息页数据
            for(let i in copyState){
                state[i] = copyState[i]  // 递归赋值
            }
        },
        DEL_MESSAGE_DATA(state,_tid){     //帖子详情页删除帖子，消息中心相应帖子的数据都删除
            if( state.notice.length > 0 ){      //缓存有数据才操作
                state.notice = state.notice.filter( item=>item.tid != _tid )  
            }
        },
        DEL_MESSAGE_REPLY(state,becid){   //帖子详情页删除评论，消息中心相应评论的回复都删除
            if( state.notice.length > 0 ){      //缓存有数据才操作
                state.notice = state.notice.filter( item=>item.becid != becid );
            }
        },
    },
    actions:{
        setNoticeData( {commit},obj ){    //存消息中心的数据
            commit('SET_NOTICE_DATA',obj)
        },
        clearNoticeData( {commit} ){      //清除消息页数据
            commit('CLEAR_NOTICE_DATA')
        },
        delMessageData( {commit},tid ){   //帖子详情页删除帖子，消息中心相应帖子的数据都删除
            commit('DEL_MESSAGE_DATA',tid)
        },
        delMessageReply( {commit},becid ){  //帖子详情页删除评论，消息中心相应评论的回复都删除
            commit('DEL_MESSAGE_REPLY',becid)
        },
    }
}