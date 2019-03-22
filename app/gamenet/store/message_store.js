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
        SET_NOTICE_DATA(state,obj){
            state.noticeData = obj.data;
            state.noticePage = obj.page;
            if( obj.type === 'refresh' ){
                state.notice = obj.data.return;
            }else{     
                state.notice = [...state.notice,...obj.data.return];      
            }
        },
        CLEAR_NOTICE_DATA(state){
            for(let i in copyState){
                state[i] = copyState[i]  // 递归赋值
            }
        }
    },
    actions:{
        setNoticeData( {commit},obj ){    //存消息中心的数据
            commit('SET_NOTICE_DATA',obj)
        },
        clearNoticeData( {commit} ){      //清除消息页数据
            commit('CLEAR_NOTICE_DATA')
        }
    }
}