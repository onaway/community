import api from '../api/adminApi'
let state = {
    postData: {
        comment:[],
        hd:[],
        main:{
            head:{
                img:'wj_zhaoyun.png',
                state: 1
            }
        },
        pic: [],
        myCollection:[],
        reply:[],
        t_zan:[],
        zan:[]
    },
    comment: [],
    postReply: [],
    postPage:'1',
    isRefreshPostData: false,
}

let copyState = api.deepCopy(state);  //拷贝state对象

export default {
    state:state,
    getters: {
        postData: state => state.postData,
        comment: state => state.comment,
        postReply: state => state.postReply,
        postPage: state => state.postPage,
        isRefreshPostData: state => state.isRefreshPostData,
    },
    mutations: {
        SET_POST_DATA(state,obj){           //存储帖子页的数据
            state.postData = obj.data;
            state.postPage = obj.page;
            if( obj.type === 'refresh' ){
                state.comment = obj.data.comment;
                state.postReply = obj.data.reply;
            }else{
                state.comment = [...state.comment,...obj.data.comment];      
                state.postReply = [...state.postReply,...obj.data.reply];
            }
        },
        CLEAR_POST_DATA(state){             //清除帖子页数据
            for(let i in copyState){
                state[i] = copyState[i]  // 递归赋值
            }
        },
        CHANGE_POST_REFRESH(state,status){  //改变isRefreshPostData的状态来判断是否清除数据
            state.isRefreshPostData = status;
        },
        SET_POST_REPLY_DATA(state,reply){   //将回复的内容插入相应索引的位置
            let becid = reply.becid;
            if( state.postReply.length > 0 ){       //若有缓存数据才进行操作
                let cids = state.comment.map( item => item.cid );   //获取cid的数组集合
                let num = cids.indexOf(becid);      //获取becid在cid数组中的索引
                if( state.postReply[num].length < 2 )state.postReply[num].push(reply);
                state.comment[num].len++;
                state.comment[num].comment = parseInt(state.comment[num].comment) + 1;
                state.postData.main.comment = parseInt(state.postData.main.comment) + 1;
            }
        },
        REDUCE_COMMENT(state,_cid){         //删除回复,帖子详情页相应评论数量减一,帖子总评论数量减一
            if( state.comment.length > 0 ){         //若有缓存数据才进行操作
                let cids = state.comment.map( item => item.cid );  
                let num = cids.indexOf(_cid);  
                state.comment[num].len--;
                state.comment[num].comment = parseInt(state.comment[num].comment) - 1;
                state.postData.main.comment = parseInt(state.postData.main.comment) - 1;
            }
        },
        DEL_ONE_POST_DATA(state,_cid){      //评论详情页右上角删除事件，删除评论详情页缓存相应的数据
            if( state.comment.length > 0 ){         //若有缓存数据才进行操作
                let cids = state.comment.map( item => item.cid );   //获取cid的数组集合
                let num = cids.indexOf(_cid);       //获取_cid在cids数组中的索引
                let allComment = state.comment[num].len + 1;
                state.comment.splice(num,1);
                state.postReply.splice(num,1);
                state.postData.main.comment = parseInt(state.postData.main.comment)-allComment;   //帖子评论总数量减评论详情页总评论数据
            }
        },
        CHANGE_POST_COMMENT_PRAISE(state,_cid){ //改变评论详情页第一个评论的赞的状态，帖子详情页相应评论的赞的数量和状态随之改变
            if( state.comment.length > 0 ){        //若有缓存数据才进行操作
                let index = state.postData.zan.indexOf(_cid);    //_cid在zan数组中的索引，无则返回-1
                let cids = state.comment.map( item => item.cid );
                let num = cids.indexOf(_cid);
                if( index == -1 ){
                    state.postData.zan.push(_cid);
                    state.comment[num].zan = parseInt(state.comment[num].zan) + 1;
                }else{
                    state.postData.zan.splice(index,1);
                    state.comment[num].zan = parseInt(state.comment[num].zan) - 1;
                }
            }
        },
        DEL_POST_REPLY_DATA(state,reply){       //删除评论详情页的回复事件，删除相应评论下的回复数据（如果存在的话）
            // console.log('reply:',reply);
            let becid = reply.becid;
            let _cid = reply.cid;
            if( state.comment.length > 0 ){           //若有缓存数据才进行操作
                let cids = state.comment.map( item => item.cid );   //获取cid的数组集合
                let num = cids.indexOf(becid);        //获取becid在cid数组中的索引,即是在state.postReply中的索引
                let replies = state.postReply[num];   //获取这个cid回复的数组集合
                // console.log('num:',num,' replies:',replies);
                let replyCids = replies.map(item=>item.cid);    
                let index = replyCids.indexOf(_cid);  //若此cid在reply数组中存在，则删除，否则不操作
                if( index > -1 ){       //数据存在才删除
                    state.postReply[num].splice(index,1);
                }
            }
        },
        CHANGE_POST_REPLY_PRAISE(state,reply){  //改变评论详情页回复的赞的状态，帖子详情页相应回复的赞的数量和状态随之改变（如果此回复存在）
            // console.log('reply:',reply);
            let becid = reply.becid;
            let _cid = reply.cid;
            if( state.comment.length > 0 ){           //若有缓存数据才进行操作
                let index = state.postData.zan.indexOf(_cid);       //_cid在zan数组中的索引，无则返回-1
                let cids = state.comment.map( item => item.cid );   //获取cid的数组集合
                let num = cids.indexOf(becid);        //获取becid在cid数组中的索引,即是在state.postReply中的索引
                let replies = state.postReply[num];   //获取这个cid回复的数组集合
                let replyCids = replies.map(item=>item.cid);    
                let count = replyCids.indexOf(_cid);  //若此cid在reply数组中存在，则删除，否则不操作
                // console.log('index:',index,' num:',num,' count:',count);
                if( count > -1 ){       //数据存在才改变
                    if( index == -1 ){
                        state.postData.zan.push(_cid);
                        state.postReply[num][count].zan = parseInt(state.postReply[num][count].zan) + 1;
                    }else{
                        state.postData.zan.splice(index,1);
                        state.postReply[num][count].zan = parseInt(state.postReply[num][count].zan) - 1;
                    }
                }
                
            }
        },
    },
    actions:{
        setPostData( {commit},obj ){      //存储帖子页的数据
            commit('SET_POST_DATA',obj)
        },
        clearPostData( {commit} ){        //清除帖子页数据
            commit('CLEAR_POST_DATA')
        },
        changePostRefresh( {commit},status ){   //改变isRefreshPostData的状态来判断是否清除数据
            commit('CHANGE_POST_REFRESH',status);
        },
        setPostReplyData( {commit},reply ){     //将回复的内容插入相应索引的位置
            commit('SET_POST_REPLY_DATA',reply)
        },
        reduceComment( {commit},cid ){          //删除回复,帖子详情页相应评论数量减一,帖子总评论数量减一
            commit('REDUCE_COMMENT',cid)
        },
        delOnePostData( {commit},cid ){         //评论详情页右上角删除事件，删除评论详情页缓存相应的数据
            commit('DEL_ONE_POST_DATA',cid)
        },
        changePostCommentPraise( {commit},cid ){//改变评论详情页第一个评论的赞的状态，帖子详情页相应评论的赞的数量和状态随之改变
            commit('CHANGE_POST_COMMENT_PRAISE',cid)
        },
        delPostReplyData( {commit},reply ){     //删除评论详情页的回复事件，删除相应评论下的回复数据（如果存在的话）
            commit('DEL_POST_REPLY_DATA',reply)
        },
        changePostReplyPraise( {commit},reply ){ //改变评论详情页回复的赞的状态，帖子详情页相应回复的赞的数量和状态随之改变（如果此回复存在）
            commit('CHANGE_POST_REPLY_PRAISE',reply)
        },
    }
}