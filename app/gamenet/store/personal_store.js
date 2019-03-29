import api from '../api/adminApi'
let state = {
    topicData:{             //个人中心接口数据
        collectionNums:'',
        f_data:[],
        hd:[],
        hehead: {
            img: '',
            state: '',
        },
        len:'',
        myCollection:[],
        rid:'',
        tzan:[],
        uname:''
    },
    topic: [],              //帖子列表
    topicPage: '1',         //话题上拉加载页数
    collectionData:{        //收藏接口数据
        f_data:[],
        hd:[],
        myCollection:[],
        tzan:[]
    },
    collect: [],
    collectionPage: '1'     //收藏上拉加载页数
}

let copyState = api.deepCopy(state);  //拷贝state对象

export default {
    state: state,
    getters: {
        topicData: state => state.topicData,
        topic: state => state.topic,
        topicPage: state => state.topicPage,
        collectionData: state => state.collectionData,
        collect: state => state.collect,
        collectionPage: state => state.collectionPage,
    },
    mutations: {
        SET_TOPIC_DATA(state,obj){          //存话题的数据
            state.topicData = obj.data;
            state.topicPage = obj.page;
            if( obj.type === 'refresh' ){
                state.topic = obj.data.f_data;
            }else{     
                state.topic = [...state.topic,...obj.data.f_data];      
            }
        },
        SET_COLLECTION_DATA(state,obj){     //存收藏的数据
            state.collectionData = obj.data;
            state.collectionPage = obj.page;
            if( obj.type === 'refresh' ){
                state.collect = obj.data.f_data;
            }else{     
                state.collect = [...state.collect,...obj.data.f_data];      
            }
        },
        CLEAR_PERSONAL_DATA(state){         //清除个人中心数据
            for(let i in copyState){
                state[i] = copyState[i]  // 递归赋值
            }
        },
        CLEAR_COLLECT_DATA(state){          //清除收藏数据
            // console.log('clear collect');
            state.collectionData = { f_data:[],hd:[],myCollection:[],tzan:[] };
            state.collect = [];
            state.collectionPage = '1';
            // console.log('collect state:',state);
        },
        CHANGE_PERSONAL_PRAISE(state,_tid){ //改变帖子详情页帖子赞的状态，个人中心坏相应帖子及赞的数量随之改变
            // console.log('personal state.topicData.tzan.length:',state.topicData.tzan.length,' _tid:',_tid);
            if( state.topicData.f_data.length > 0 ){      //缓存有数据才操作
                let index = state.topicData.tzan.indexOf(_tid);      //_tid在tzan数组中的索引，无则返回-1
                let tids = state.topic.map( item => item.tid );  
                let num = tids.indexOf(_tid);          //_tid在topic数组中的索引
                // console.log('personal index:',index,' tids:',tids,' num:',num);
                if( num > -1 ){             //只有帖子数组中有tid，即num != -1,才进行操作
                    if( index == -1 ){      //没有此元素则增加，有则删除,赞的值相应的+1/-1
                        state.topicData.tzan.push(_tid);
                        state.topic[num].zan = parseInt(state.topic[num].zan) + 1;
                    }else{
                        state.topicData.tzan.splice(index,1);
                        state.topic[num].zan = parseInt(state.topic[num].zan) - 1;
                    }
                }
            }
        },
        CHANGE_COLLECT_PRAISE(state,_tid){  //改变帖子详情页帖子赞的状态，个人中心收藏相应帖子及赞的数量随之改变
            if( state.collectionData.f_data.length > 0 ){      //缓存有数据才操作
                let index = state.collectionData.tzan.indexOf(_tid);      //_tid在tzan数组中的索引，无则返回-1
                let tids = state.collect.map( item => item.tid );  
                let num = tids.indexOf(_tid);          //_tid在collect数组中的索引
                if( num > -1 ){             //只有帖子数组中有tid，即num != -1,才进行操作
                    if( index == -1 ){      //没有此元素则增加，有则删除,赞的值相应的+1/-1
                        state.collectionData.tzan.push(_tid);
                        state.collect[num].zan = parseInt(state.collect[num].zan) + 1;
                    }else{
                        state.collectionData.tzan.splice(index,1);
                        state.collect[num].zan = parseInt(state.collect[num].zan) - 1;
                    }
                }
            }
        },
        CHANGE_PERSONAL_COLLECT(state,_tid){//改变个人中心页相应帖子的收藏或取消收藏的文字
            if( state.topicData.f_data.length > 0 ){      //缓存有数据才操作
                let index = state.topicData.myCollection.indexOf(_tid);      //_tid在t_zan数组中的索引，无则返回-1
                let tids = state.topic.map( item => item.tid );  
                let num = tids.indexOf(_tid);          //_tid在topic数组中的索引
                if( num > -1 ){             //只有帖子数组中有tid，即num != -1,才进行操作
                    if( index == -1 ){      //没有此元素则增加，有则删除
                        state.topicData.myCollection.push(_tid);
                    }else{
                        state.topicData.myCollection.splice(index,1);
                    }
                }
            }
        },
        DEL_ONE_PERSONAL_DATA(state,_tid){  //删除帖子详情页帖子个人中心相应帖子删除（如果有缓存的话）
            if( state.topic.length > 0 ){      //缓存有数据才操作
                let tids = state.topic.map( item => item.tid );  
                let num = tids.indexOf(_tid);          //_tid在topic数组中的索引
                // console.log('_tid:',_tid,'tids:',tids, ' num:',num);
                if( num > -1 )state.topic.splice(num,1);
            }
        },
    },
    actions:{
        setTopicData( {commit},obj ){       //存话题的数据
            commit('SET_TOPIC_DATA',obj)
        },
        setCollectionData( {commit},obj ){  //存收藏的数据
            commit('SET_COLLECTION_DATA',obj)
        },
        clearPersonalData( {commit} ){      //清除个人中心数据
            commit('CLEAR_PERSONAL_DATA')
        },
        clearCollectData( {commit} ){       //清除收藏数据
            commit('CLEAR_COLLECT_DATA')
        },
        changePersonalPraise( {commit},tid ){   //改变帖子详情页帖子赞的状态，个人中心话题相应帖子及赞的数量随之改变
            commit('CHANGE_PERSONAL_PRAISE',tid)
        },
        changeCollectPraise( {commit},tid ){    //改变帖子详情页帖子赞的状态，个人中心收藏相应帖子及赞的数量随之改变
            commit('CHANGE_COLLECT_PRAISE',tid)
        },
        changePersonalCollect( {commit},tid ){  //改变个人中心页相应帖子的收藏或取消收藏的文字
            commit('CHANGE_PERSONAL_COLLECT',tid)
        },
        delOnePersonalData( {commit},tid ){     //删除帖子详情页帖子个人中心相应帖子删除（如果有缓存的话）
            commit('DEL_ONE_PERSONAL_DATA',tid)
        },
    }
}