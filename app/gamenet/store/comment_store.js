import api from '../api/adminApi'
let state = {
    detailData:{          
        hd:[],
        reply:[],
        main:{
            head:{
                img:'wj_zhaoyun.png',
                state: 1
            }
        }, 
        zan:[]
    }, 
    detailReply: [],
    datailPage: '1'
}

let copyState = api.deepCopy(state);  //拷贝state对象

export default {
    state:state,
    getters: {
        detailData: state => state.detailData,
        detailReply: state => state.detailReply,
        datailPage: state => state.datailPage,
    },
    mutations: {
        SET_DETAIL_DATA(state,obj){      //存储评论的数据
            state.detailData = obj.data;
            state.datailPage = obj.page;
            if( obj.type === 'refresh' ){
                state.detailReply = obj.data.reply;
            }else{     
                state.detailReply = [...state.detailReply,...obj.data.reply];      
            }
        },
        CLEAR_DETAIL_DATA(state){        //清除详情页数据
            for(let i in copyState){
                state[i] = copyState[i]  // 递归赋值
            }
        },
        SET_COM_REPLY_DATA(state,reply){ //评论详情页缓存数据增加评论成功数据
            state.detailReply.push(reply);
            state.detailData.main.comment = parseInt(state.detailData.main.comment) + 1;
        }
    },
    actions:{
        setDetailData( {commit},obj ){    //存储评论的数据
            commit('SET_DETAIL_DATA',obj)
        },
        clearDetailData( {commit} ){      //清除详情页数据
            commit('CLEAR_DETAIL_DATA')
        },
        setComReplyData( {commit},reply ){//评论详情页缓存数据增加评论成功数据
            commit('SET_COM_REPLY_DATA',reply)
        }
    }
}