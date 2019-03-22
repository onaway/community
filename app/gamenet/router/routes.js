import Home from '@/components/home/Home'
import Home1 from '@/components/home/Home1'
import HomeVuex from '@/components/home/HomeVuex'

import Login from '@/components/Login/Login'
import LoginIndex from '@/components/Login/LoginIndex'
import Password from '@/components/login/Password'
import ChooseAccount from '@/components/login/ChooseAccount'
import ResetAccount from '@/components/login/ResetAccount'
import UserAgreement from '@/components/login/UserAgreement'
import Authentication from '@/components/login/Authentication'

import PostText from '@/components/post/PostText'
import CommentDetail from '@/components/comment/CommentDetail'
import MessageCenter from '@/components/message/MessageCenter'
import PersonalCenter from '@/components/personal/PersonalCenter'
import FeedBack from '@/components/personal/FeedBack'

import Mydata from '@/components/mydata/Mydata'
import MydataIndex from '@/components/mydata/MydataIndex'
import MyName from '@/components/mydata/MyName'
import BindId from '@/components/mydata/BindId'
import SetBirthday from '@/components/mydata/SetBirthday'

import TopicItem from '@/components/topic/TopicItem'
import CommentBox from '@/components/topic/CommentBox'
import Token from '@/components/page/Token'
import SetGame from '@/components/page/SetGame'
import Error from '@/components/error/Error'

export default [
    { path: '/', name: 'Home', component: Home, meta:{index:0,keepAlive:true} },
    // { path: '/homevuex', name: 'HomeVuex', component: HomeVuex, meta:{index:0,keepAlive:true} },
    // { path: '/home1', name: 'Home1', component: Home1, meta:{index:0,keepAlive:true} },

    { path:'/home', redirect: '/' },        

    { 
        path: '/login', component: Login,
        children: [
            { path: '/', name: 'LoginIndex', component: LoginIndex, meta:{index:5} },
            { path: 'useragreement', name: 'UserAgreement', component: UserAgreement, meta:{index:6} },
            { path: 'password', name: 'Password', component: Password, meta:{index:6} },
            { path: 'chooseaccount', name: 'ChooseAccount', component: ChooseAccount, meta:{index:6} },
            { path: 'resetaccount', name: 'ResetAccount', component: ResetAccount, meta:{index:7} },
            { path: 'authentication', name: 'Authentication', component: Authentication, meta:{index:8} },
        ],
    },

    // { path: '/login',name: 'Login', component: Login, meta:{index:5}},

    { path:'/topicitem', name: 'TopicItem', component: TopicItem, meta:{index:1} },

    { path:'/commentbox', name: 'CommentBox', component: CommentBox, meta:{index:4} },

    { path: '/posttext', name: 'PostText', component: PostText, meta:{index:2} },

    { path: '/commentdetail', name: 'CommentDetail', component: CommentDetail, meta:{index:3} },

    { path: '/personalcenter/:uid', name: 'PersonalCenter', component: PersonalCenter, meta:{index:3} },
    { 
        path: '/mydata', component: Mydata,
        children: [
            { path: '/', name: 'MydataIndex', component: MydataIndex, meta:{index:4} },
            { path: 'myname', name: 'MyName', component: MyName, meta:{index:5} },
            { path: 'bindid', name: 'BindId', component: BindId, meta:{index:5} },
            { path: 'setbirthday', name: 'SetBirthday', component: SetBirthday, meta:{index:5} },
        ]
    },
    { path: '/feedback', name: 'FeedBack', component: FeedBack, meta:{index:2} },

    { path: '/messagecenter', name: 'MessageCenter', component: MessageCenter, meta:{index:1} },

    { path: '/token', name: 'Token', component: Token },

    { path: '/setgame', name: 'SetGame', component: SetGame },

    {  path:'*', name:'Error', component:Error, meta:{index:5} },
]