import api from '../api/adminApi'
let state = {
    homeData: {     //接口数据
        cream:[],
        top:[],
        hd:[],
        tz:[],
        myCollection:[],
        msg:'',
        t_zan:[]
    },
    tz:[],          //帖子列表
    page:'1',       //上拉加载页数
    isRefreshHomeData: false,   //是否清除首页数据
}

let copyState = api.deepCopy(state);  //拷贝state对象

export default {
    state:state,
    getters: {
        homeData: state => state.homeData,
        tz: state => state.tz,
        page: state => state.page,
        isRefreshHomeData: state => state.isRefreshHomeData,
    },
    mutations: {
        SET_HOME_DATA(state,obj){           //存首页数据
            // console.log('type:',obj.type,' list:',obj.data,' page:',obj.page);
            state.homeData = obj.data;
            state.page = obj.page;
            if( obj.type === 'refresh' ){
                state.tz = obj.data.tz;
            }else{
                // state.tz=state.tz.concat(obj.data.tz);   //es5合并数组
                state.tz = [...state.tz,...obj.data.tz];    //es6合并数组
                
                let tmpObj = {};
                state.tz = state.tz.reduce((cur,item)=>{    //利用es5的reduce()方法对数组对象去重
                    tmpObj[item.tid] ? '' : tmpObj[item.tid] = true && cur.push(item);
                    return cur;
                },[])       //设置cur默认类型为数组，并且初始值为空的数组
            }
        },
        CLEAR_HOME_DATA(state){             //清除首页数据
            for(let i in copyState){
                state[i] = copyState[i]  // 递归赋值
            }
        },
        SET_NOTICE_TIP(state){              //改变homeData.msg的状态从1到0
            state.homeData.msg = '0';
        },
        CHANGE_HOME_REFRESH(state,status){  //发表话题成功首页清除缓存数据，否则不清除
            state.isRefreshHomeData = status;
        },
        DEL_ONE_HOME_DATA(state,_tid){      //帖子详情页右上角删除事件删除首页缓存相应的帖子
            let tids = state.tz.map( item => item.tid );   //获取tid的数组集合
            let num = tids.indexOf(_tid);          //获取_tid在tids数组中的索引
            if( num > -1 )state.tz.splice(num,1);
        },
        CHANGE_HOME_PRAISE(state,_tid){     //改变首页及帖子详情页帖子赞的状态，首页相应帖子及赞的数量随之改变
            // console.log('home state.homeData.t_zan.length:',state.homeData.t_zan.length,' _tid:',_tid);
            if( state.homeData.t_zan.length > 0 ){      //缓存有数据才操作
                let index = state.homeData.t_zan.indexOf(_tid);      //_tid在t_zan数组中的索引，无则返回-1
                let tids = state.tz.map( item => item.tid );  
                let num = tids.indexOf(_tid);          //_tid在tz数组中的索引
                // console.log('home index:',index,' tids:',tids,' num:',num);
                if( num > -1 ){             //只有帖子数组中有tid，即num != -1,才进行操作
                    if( index == -1 ){      //没有此元素则增加，有则删除,赞的值相应的+1/-1
                        state.homeData.t_zan.push(_tid);
                        state.tz[num].zan = parseInt(state.tz[num].zan) + 1;
                    }else{
                        state.homeData.t_zan.splice(index,1);
                        state.tz[num].zan = parseInt(state.tz[num].zan) - 1;
                    }
                }
            }
        },
        ADD_HOME_COMMENT(state,_tid){       //只要评论成功首页相应帖子的评论数量都+1
            if( state.tz.length > 0 ){   //缓存有数据才操作
                let tids = state.tz.map( item => item.tid );  
                let num = tids.indexOf(_tid);
                if( num > -1 ){          //如果首页缓存数据中有相应的tid，则改变缓存数据，没有则是页面刷新过，无需操作
                    state.tz[num].comment = parseInt(state.tz[num].comment) + 1;
                }
            }
        },
        CHANGE_HOME_COLLECT(state,_tid){    //改变首页相应帖子的收藏或取消收藏的文字
            if( state.homeData.myCollection.length > 0 ){      //缓存有数据才操作
                let index = state.homeData.myCollection.indexOf(_tid);      //_tid在t_zan数组中的索引，无则返回-1
                let tids = state.tz.map( item => item.tid );  
                let num = tids.indexOf(_tid);//_tid在tz数组中的索引
                if( num > -1 ){              //只有帖子数组中有tid，即num != -1,才进行操作
                    if( index == -1 ){       //没有此元素则增加，有则删除
                        state.homeData.myCollection.push(_tid);
                    }else{
                        state.homeData.myCollection.splice(index,1);
                    }
                }
            }
        }
    },
    actions:{
        setHomeData( {commit},obj ){  //存首页数据
            commit('SET_HOME_DATA',obj)
        },
        clearHomeData( {commit} ){    //清除首页数据
            commit('CLEAR_HOME_DATA')
        },
        setNoticeTip( {commit} ){     //改变homeData.msg的状态从1到0
            commit('SET_NOTICE_TIP');
        },
        changeHomeRefresh( {commit},status ){  //发表话题成功首页清除缓存数据，否则不清除
            commit('CHANGE_HOME_REFRESH',status);
        },
        delOneHomeData( {commit},tid ){        //帖子详情页右上角删除事件删除首页缓存相应的帖子
            commit('DEL_ONE_HOME_DATA',tid)
        },
        changeHomePraise( {commit},tid ){      //改变首页及帖子详情页帖子赞的状态，首页相应帖子及赞的数量随之改变
            commit('CHANGE_HOME_PRAISE',tid)
        },
        addHomeComment( {commit},tid ){        //只要评论成功首页相应帖子的评论数量都+1
            commit('ADD_HOME_COMMENT',tid)
        },
        changeHomeCollect( {commit},tid ){     //改变首页相应帖子的收藏或取消收藏的文字
            commit('CHANGE_HOME_COLLECT',tid)
        },
    }
}