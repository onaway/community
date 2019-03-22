import Vue from 'vue'
import VueResource from 'vue-resource'
import crypt from 'crypto-js'
import Toast from '@/components/toast/toast.js'
// import router from '../router'
// Vue.use(router)

const version = '1.1.3'       //版本号

var clearVersionCookie =  function () {
    var oldver = cookieGet('version');
    var newver = version;
    if(oldver){
        oldver = oldver.replace('.','');
        newver = newver.replace('.','');
        if(newver>oldver){
            clearAllCookie();
            cookieSet('version',version,10);
        }
        else if(newver==oldver){
            cookieSet('version',version,10);
        }
    }else{
        clearAllCookie();
        cookieSet('version',version,10);
    }
}

var clearAllCookie = function(){    //清除所有cookie
    var date = new Date();
    date.setTime(date.getTime()-10000);
    var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
    if(keys) {
        for(var i = keys.length; i--;){
            document.cookie = keys[i] + '=0;expires=' + date.toGMTString()+"; path=/";
        }  
    }
}

var ENCRYPT_OPTION = {
    mode: crypt.mode.ECB,
    padding: crypt.pad.Pkcs7,
    iv: ''
}
var LOCAL_KEY = 'YT0N54XFUZGMLP'
var CacheType = 'storage' //storage,cookie
Vue.use(VueResource)
Vue.http.options.emulateJSON = true;
/*["sha1", "sha224", "sha256", "sha384", "sha512", "md5", "rmd160", "sha224WithRSAEncryption", "RSA-SHA224", "sha256WithRSAEncryption"
, "RSA-SHA256", "sha384WithRSAEncryption", "RSA-SHA384", "sha512WithRSAEncryption", "RSA-SHA512", "RSA-SHA1", "ecdsa-with-SHA1", "sha256"
, "sha224", "sha384", "sha512", "DSA-SHA", "DSA-SHA1", "DSA", "DSA-WITH-SHA224", "DSA-SHA224", "DSA-WITH-SHA256", "DSA-SHA256", "DSA-WITH-SHA384"
, "DSA-SHA384", "DSA-WITH-SHA512", "DSA-SHA512", "DSA-RIPEMD160", "ripemd160WithRSA", "RSA-RIPEMD160", "md5WithRSAEncryption", "RSA-MD5"]*/
// console.log('current ENV:', process.env.NODE_ENV)
var envlist = {
    local: 'http://172.16.10.71:8010/community',
    // local: 'http://api.flash.ltd/community',
    prod: 'http://api.shmoak.com/community',
    webtest: 'http://120.132.14.186:8020/community',
    // webtest: 'http://api.shmoak.com:8088/community',
    abroad: 'http://172.16.10.71:8010/community',
    abroadprod: 'http://128.1.38.249:8088/community',
}

var app = {
    sid: 5621,
    key: "NQLLBR5TFPG2P0QRWHEZGFJ171ZRNDLSNJRUFA3MYUPEKADM4GWQEGBRU46RDYD6",
    secret: "4WXVGC3XF642R2GMW40B8SW0LNVKL9M4",
    ticket: "SGE4E3URWX6MYDJBNGF0M8W1EWNMBD03NUT5U1UUBAM8HMW2SLN814P1EWGG5W37",
    ticket_expire: 0,
    endefault: "LEWLT7DK",
    encryptkey: "NPREDX74GZLQHU"
}

var SHA1 = function (strs) {
    var rtn = crypt.SHA1(strs).toString(crypt.enc.Hex);
    return rtn;
}

var getQueryVariable = function (variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    var querys = new Object();
    for (var index in vars) {
        var tmp = vars[index].split('=')
        var fieldName = tmp[0]
        var val = tmp[1]
        if (variable) {
            if (variable == tmp[0]) {
                return val
            }
        }
        querys[fieldName] = val
    }
    if (variable) {
        return false
    }
    return querys;
    return (false);
}
var getQuery = function () {
    var query = getQueryVariable()
    if (count(query) > 0) {
        if (query.od) {
            var od = decode(query.od)
            return od
            return query.od
        }
    }

}
var setQuery = function (querys) {
    if (querys) {
        if (count(querys) > 0) {
            var str = '?od=' + encode(querys)
            return str
        }
    }
    return ''
}
var getUrl = function (interfacename) {
    return envlist[process.env.NODE_ENV]
}
var storageSet = function (itemName, item) {
    cookieSet(itemname,item);
}
var storageGet = function (itemName) {
    return cookieGet(itemName);
}

var sessionSet = function (itemName, item) {
    window.sessionStorage.setItem(itemName, encode(item))
}

var sessionGet = function (itemName) {
    var item = decode(window.sessionStorage.getItem(itemName) || '[]')
    return item
}
var sessionDel = function (itemName) {
    window.sessionStorage.removeItem(itemName)
}
var storageDel = function (itemName) {
    window.localStorage.removeItem(itemName)
}

var count = function (obj) {
    var cnt = 0
    for (var i in obj) {
        cnt++
    }
    return cnt
}
var in_array = function (search,array){  //判断字符串是否在数组中
    for(var i in array){
        if(array[i]==search){
            return true;
        }
    } 
    return false;
}

var cookieSet = function (c_name, value, expiredays) {
    var exdate = new Date()
    if(typeof(expiredays)==='undefined'){
        expiredays=1
    }
    exdate.setDate(exdate.getDate() + expiredays)
    var query = new Object();
    query.data = value;
    var cvalue = encode(query);
    // document.cookie = c_name + "=" + cvalue + ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString());
    document.cookie = c_name + "=" + cvalue + ";path=/" +  ";expires=" + exdate.toGMTString();
    return exdate.toGMTString();
}

var cookieGet = function (c_name) {
    if (document.cookie.length > 0) {
        var c_start = document.cookie.indexOf(c_name + "=")
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1
            var c_end = document.cookie.indexOf(";", c_start)
            if (c_end == -1) c_end = document.cookie.length
            var cookiestr =  document.cookie.substring(c_start, c_end)
            var decodestr = decode(cookiestr);
            if(decodestr){
                if(typeof(decodestr.data)!=='undefined'){
                    return decodestr.data;
                }
            }
            // console.log('cookie get decodestr:',decodestr)
            return decodestr;
        }
    }
    return ""
}


var getdata = function (itemName) {
    var callname = CacheType + 'Get'
    if (CacheType === 'storage') {
        return storageGet(itemName)
    } else {
        return cookieGet(itemName)
    }
    // console.log('callname:', callname)
}
var setdata = function (itemName, item) {
    if (CacheType === 'storage') {
        return storageGet(itemName)
    } else {
        return cookieGet(itemName)
    }
}

Vue.http.options.emulateJSON = true
var encrypt = function (data, key) {
    if (typeof (data) === 'object') {
        data = JSON.stringify(data)
    }
    key = crypt.enc.Utf8.parse(fillKey(key))
    var cipher = crypt.AES.encrypt(data, key, ENCRYPT_OPTION)
    return cipher.toString()
}
var decrypt = function (data, key) {
    key = crypt.enc.Utf8.parse(fillKey(key))
    var decipher = crypt.AES.decrypt(data, key, ENCRYPT_OPTION)
    var des = crypt.enc.Utf8.stringify(decipher)
    if (des) {
        return JSON.parse(des);
    } else {
        // console.log('decode ERROR:', data)
        return false
    }
}

var fillKey = function (key) {
    var keySize = 256
    var length = key.length
    var filledKey = Buffer.alloc(keySize / 8)
    var keys = Buffer.from(key)
    if (keys.length <= filledKey.length) {
        for (var i = 0; i <= 31; i++) {
            if (typeof (key[i]) === 'undefined') {
            } else {
                var tmp = key[i]
                filledKey[i] = tmp.charCodeAt() //key[i]
            }
        }
    } else {}
    return filledKey
}

var encode = function (data) {  //加密
    if (typeof (data) === 'object') {
        data = JSON.stringify(data)
    }
    var key = crypt.enc.Utf8.parse(fillKey(LOCAL_KEY))
    var cipher = crypt.AES.encrypt(data, key, ENCRYPT_OPTION)
    return cipher.toString()
}

var decode = function (data) {  //解密
    if (countObj(data) > 0) {
        var key = crypt.enc.Utf8.parse(fillKey(LOCAL_KEY))
        var decipher = crypt.AES.decrypt(data, key, ENCRYPT_OPTION)
        var des = crypt.enc.Utf8.stringify(decipher)
        if (des) {
            return JSON.parse(des)
        } else {
            console.log('decode Localdata ERROR:', data)
            return false
        }
    } else {
        // console.log('data is empty')
        return false
    }
}


var dopost = async function (interfaceName, querys, callback) {
    var url = getUrl(interfaceName)
    querys = getQueryData(interfaceName, querys)
    var data = []
    await Vue.http.post(url, querys).then(function (response) {
        var body = response.body
        if (body) {
            if (body.enc) {
                if (body.data && body.enc === 1) {
                    body.data = decrypt(body.data, app.endefault)
                }
            }
        } else {
            body = {
                data: {}
            }
        }
        data = body.data
        if (callback) {
            callback(body) // 这里是处理正确的回调
        }
        if (data.data) {
            return data.data
        }
        return data
    }, function (response) {
        return false
    })
    return data
}
var doget = function (interfaceName, querys, callback) {
    var url = getUrl(interfaceName)
    querys.data = encrypt(querys, app.endefault)
    return Vue.http.get(url, {
        querys
    }, {
        emulateJSON: true
    }).then(function (response) {
        var body = response.body
        if (body.enc) {
            if (body.data && body.enc === 1) {
                body.data = decrypt(body.data, app.endefault)
            }
        }
        callback(response.body) // 这里是处理正确的回调
    }, function (response) {
        // console.log('ERROR callback') // 这里是处理错误的回调
        // console.log(response)
    })
}
var postnosign = function (interfaceName, querys, callback) {
    var url = getUrl(interfaceName)
    querys = getQueryData(interfaceName, querys)
    return Vue.http.post(url, querys).then(function (response) {
        var body = response.body
        if (body.enc) {
            if (body.data && body.enc === 1) {
                body.data = decrypt(body.data, app.endefault)
            }
        }
        callback(response.body) // 这里是处理正确的回调
    }, function (response) {
        console.log('ERROR callback') // 这里是处理错误的回调
        console.log(response)
    })
}
var getQueryData = function (method, data) {
    var user = islogin();
    data.game=getgame();
    if(user){
        data.token = user;
        // cookieSet('myuser',user,7);
    }
    let ver = cookieGet('version');
    if( ver ){
        clearVersionCookie();
    }
    let isInGame = cookieGet('ingame');
    let ua = window.navigator.userAgent.toLowerCase();
    if( isInGame > 0 ){         //从游戏来
        data.from = 1;
    }else if(ua.match(/MicroMessenger/i) == 'micromessenger'){    //微信浏览器
        data.from = 2;
    }else{                      //从普通浏览器来
        data.from = 3;
    }
    var params = encrypt(data, app.endefault)
    var defaultVal = getDefaultVal()
    var host2 = document.domain;
    defaultVal.data = params
    // defaultVal.data = data
    defaultVal.host = host2
    defaultVal.method = method
    defaultVal.sign = setSign(defaultVal)
    // console.log('defaultVal:',defaultVal)
    // if(user){
    //     // defaultVal.token = user;
    //     cookieSet('myuser',user,7);
    // }
    return defaultVal
}
// 更新远程token
var updateUserToken = async function (token, uid) {
    console.log('get token')
    var data = await dopost('front.club.user.refreshtoken', {})
    if (data) {
        if (data.expire) {
            updateLocaltoken(data.expire)
        }
    }
    return data
}
// 更新本地token
var updateLocaltoken = function (newexpire) {
    var userprop = storageGet('user')
    if (userprop.token) {
        if (userprop.token.token) {
            userprop.token.expire = newexpire
            storageSet('user', userprop)
            userprop = storageGet('user')
            return true
        }
    }
    return false
}
// 检查expire是否过期 
// 如果时间小于30分钟则更新token
var checkUserExpire = function (expire) {
    var extime = 60 * 30
    var now = Math.round(new Date().getTime() / 1000)
    var rst = expire - now
    if (extime >= rst) {
        return true
    } else {
        return false
    }
}

var checkuserToken = async function () {
    var userprop = storageGet('user')
    if (userprop.token) {
        var token = userprop.token.token
        var expire = userprop.token.expire
        var uid = userprop.token.uid
        if (checkUserExpire(expire) == true) {
            var data = await updateUserToken(token, uid)
        } else {
        }
    }
}

var decodeData = function (res, key) {
    if (res.data) {
        var data = decrypt(res.data, key)
        return data
    }
    return false
}
var getDefaultVal = function () {
    var data = {
        time: Math.round(new Date().getTime() / 1000),
        ticket: app.ticket,
        appkey: app.key
    }
    return data
}
var setSign = function (data) {
    var strs = data.time + '&' + data.method + '&' + data.ticket + '&' + data.data + '&' + data.appkey
    return crypt.MD5(strs).toString()
}
var checkTicket = async function () {
    if (app.ticket) {
        if (app.ticket.length > 0) {
            return true
        } else {
            getCacheTicket()
            return true
        }
    } else {
        getCacheTicket()
        return true
    }
}
// getdata,setdata
var getCacheTicket = async function () {
    var ticket = getdata('ticket')
    if (countObj(ticket) > 0) {
    } else {
        ticket = await getticket()
        return ticket
    }
    // console.log('ticket ', ticket)
}
var countObj = function (obj) {
    var count = 0
    for (var i in obj) {
        count++
    }
    return count
}

var getticket = async function () {
    var method = 'flash.auth.club.ticket'
    var querys = {
        sid: app.sid
    }
    var ticket = []
    await postnosign(method, querys, function (res) {
        var data = res.data
        app.ticket = data.token
        app.ticket_expire = data.expire
        ticket.ticket = data.token
        ticket.ticket_expire = data.expire
        return ticket
    })
    return ticket
}

var getCodeMessage = function (data) {
    switch (data.code) {
        case -5:
            Toast('错误次数已达5次，1小时后重试');
            break;
        case -66665:
            Toast('登录已过期，请重新登录');
            let hdAccount = cookieGet('hdAccount');
            let version = cookieGet('version');
            clearAllCookie();      //清除所有cookie
            router.push({path:'/login'});
            cookieSet('version',version,10);
            cookieSet('hdAccount',hdAccount,7);
            break;
        default:
            Toast(data.msg);
            break;
    }
}
var getgame = function () {
    var game = cookieGet('game');
    if( game ){
        return game;
    }
    return 1;
}
var islogin = function () {
    var user = cookieGet('myuser');
    if( user ){
        return user;
    }
    return false
}
var checkurl = function() {
    var url = location.search; //获取url中"?"符后的字串   
    console.log(url);
    var theRequest = url.substr(1); 
    return theRequest; 
}


//时间处理函数
var formatDateTime =  function (timeValue) {  
    var date = new Date(timeValue);  
    var y = date.getFullYear();  
    var m = date.getMonth() + 1;  
    m = m < 10 ? ('0' + m) : m;  
    var d = date.getDate();  
    d = d < 10 ? ('0' + d) : d;  
    var h = date.getHours();  
    h = h < 10 ? ('0' + h) : h;  
    var minute = date.getMinutes();  
    var second = date.getSeconds();  
    minute = minute < 10 ? ('0' + minute) : minute;  
    second = second < 10 ? ('0' + second) : second;  
    return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;  
}; 
var isYestday = function isYestday(timeValue) {  
    var date = new Date(); //当前时间  
    var today = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime(); //今天凌晨  
    var yestday = new Date(today - 24 * 3600 * 1000).getTime();  
    return timeValue < today && yestday <= timeValue;  
};
var isYear = function isYear (timeValue) {  
    var takeNewYear = formatDateTime(new Date()).substr(0,4); //当前时间的年份  
    var takeTimeValue = formatDateTime(timeValue).substr(0,4); //传入时间的年份  
    return takeTimeValue == takeNewYear;  
};
//60000 1分钟  
//3600000 1小时  
//86400000 24小时  
//对传入时间进行时间转换   

var timeChange = function (timeValue) {  
    var timeNew = Date.parse(new Date()); //当前时间  
    var timeDiffer = timeNew - timeValue; //与当前时间误差  
    var returnTime = '';  
    
    if(timeDiffer <= 60000) { //一分钟内  
        returnTime = '刚刚';  
    } else if(timeDiffer > 60000 && timeDiffer < 3600000) { //1小时内  
        returnTime = Math.floor(timeDiffer / 60000 )+ '分钟前';  
    } else if(timeDiffer >= 3600000 && timeDiffer < 86400000 && isYestday(timeValue) === false) { //今日  
        returnTime = formatDateTime(timeValue).substr(11,5); 
    } else if(timeDiffer > 3600000 && isYestday(timeValue) === true) { //昨天  
        returnTime = '昨天 '+formatDateTime(timeValue).substr(11,5);
    } else if (timeDiffer > 86400000 && isYestday(timeValue) === false && isYear (timeValue) === true){  //今年  
        returnTime = formatDateTime(timeValue).substr(5,5);  
    } else if (timeDiffer > 86400000 && isYestday(timeValue) === false && isYear (timeValue) === false) { //不属于今年  
        returnTime = formatDateTime(timeValue).substr(0,10); 
    }  
    return returnTime;  
}   
var timeGet = function(timeValue){
    var timeNew = Date.parse(new Date()); //当前时间  
    var timeDiffer = timeNew - timeValue; //与当前时间误差  
    var returnTime = formatDateTime(timeValue).substr(5,11); 
    var endTime = returnTime.split(' ');
    
    return endTime;
}

var emojiData = [               //表情雪碧图数据,用于发表话题表情
    //表情包和表情背景位置
    { title: "爱你", url: "-0.64rem 0" },
    { title: "拜拜", url: "-1.28rem -3.2rem" },
    { title: "悲伤", url: "-0.64rem -0.64rem" },
    { title: "鄙视", url: "-1.28rem -0.64rem" },
    { title: "闭嘴", url: "0 -1.28rem" },
    { title: "馋嘴", url: "-0.64rem -1.28rem" },
    { title: "吃惊", url: "-1.92rem 0" },
    { title: "打脸", url: "-1.92rem -1.28rem" },

    { title: "锤", url: "0 -1.92rem" },
    { title: "费解", url: "-0.64rem -4.48rem" },
    { title: "鼓掌", url: "-2.56rem 0" },
    { title: "哈哈", url: "-2.56rem -0.64rem" },
    { title: "害羞", url: "-2.56rem -1.28rem" },
    { title: "流汗", url: "-2.56rem -1.92rem" },
    { title: "黑线", url: "-1.28rem -2.56rem" },
    { title: "哼", url: "-1.92rem -2.56rem" },

    { title: "坏笑", url: "-2.56rem -2.56rem" },
    { title: "可爱", url: "-3.2rem -1.28rem" },
    { title: "狗头", url: "-5.12rem 0" },
    { title: "捂脸", url: "-2.56rem -4.48rem" },
    { title: "微笑", url: "0 -2.56rem" },
    { title: "斜眼笑", url: "-0.64rem -2.56rem" },
    { title: "衰", url: "-3.84rem -3.2rem" },
    { title: "龇牙", url: "-4.48rem -3.2rem" },

    { title: "吃瓜", url: "-1.28rem -1.28rem" },
    { title: "傻眼", url: "-3.84rem -1.28rem" },
    { title: "污", url: "-4.48rem -1.28rem" },
    { title: "费解", url: "-0.64rem -1.92rem" },
    { title: "感冒", url: "-1.28rem -1.92rem" },
    { title: "抱抱", url: "0 -0.64rem" },
    { title: "跪了", url: "-1.92rem -1.92rem" },
    { title: "摊手", url: "-1.92rem -3.84rem" },

    { title: "生病", url: "-3.84rem -1.92rem" },
    { title: "抓狂", url: "-3.2rem -4.48rem" },
    { title: "可怜", url: "-3.2rem -1.92rem" },
    { title: "酷", url: "-3.2rem -2.56rem" },
    { title: "阴险", url: "0 -4.48rem" },
    { title: "困", url: "-0.64rem -3.2rem" },
    { title: "白眼", url: "0 0" },
    { title: "泪", url: "-1.92rem -3.2rem" },

    { title: "怒", url: "-2.56rem -3.2rem" },
    { title: "怒骂", url: "-3.2rem -3.2rem" },
    { title: "钱", url: "-3.84rem 0" },
    { title: "亲亲", url: "-3.84rem -0.64rem" },
    { title: "晕", url: "-1.92rem -4.48rem" },
    { title: "笑哭", url: "-4.48rem -1.92rem" },
    { title: "失望", url: "-3.84rem -2.56rem" },
    { title: "思考", url: "-0.64rem -3.84rem" },

    { title: "太开心", url: "-1.28rem -3.84rem" },
    { title: "色", url: "-3.2rem 0" },
    { title: "偷笑", url: "-3.2rem -3.84rem" },
    { title: "吐", url: "-3.84rem -3.84rem" },
    { title: "挖鼻", url: "-4.48rem 0" },
    { title: "委屈", url: "-4.48rem -0.64rem" },
    { title: "睡", url: "0 -3.84rem" },
    { title: "调皮", url: "-3.2rem -0.64rem" },

    { title: "嘘", url: "-4.48rem -3.84rem" },
    { title: "左哼哼", url: "-3.84rem -4.48rem" },
    { title: "右哼哼", url: "-1.28rem -4.48rem" },
    { title: "哈欠", url: "-1.92rem -0.64rem" },
    { title: "互粉", url: "-4.48rem -4.48rem" },
    { title: "骷髅", url: "0 -3.2rem" },
    { title: "耶", url: "-2.56rem -5.12rem" },
    { title: "握手", url: "-1.92rem -5.12rem" },

    { title: "强", url: "-0.64rem -5.12rem" },
    { title: "弱", url: "-3.2rem -5.12rem" },
    { title: "作揖", url: "-3.84rem -5.12rem" },
    { title: "不", url: "0 -5.12rem" },
    { title: "好", url: "-5.12rem -5.12rem" },
    { title: "胜利", url: "-1.28rem -5.12rem" },
    { title: "来", url: "-4.48rem -5.12rem" },
    { title: "威武", url: "-5.12rem -3.2rem" },

    { title: "心", url: "-5.12rem -1.92rem" },
    { title: "给力", url: "-5.12rem -1.28rem" },
    { title: "鲜花", url: "-5.12rem -0.64rem" },
    { title: "心碎", url: "-5.12rem -2.56rem" },
    { title: "猪头", url: "-5.12rem -3.84rem" },
    { title: "羊驼", url: "-5.12rem -4.48rem" },
]

var emotionData = [             //单个表情数据，用于帖子评论显示表情
    //表情包和表情路径
    { title: "爱你", url: "aini.png" },
    { title: "拜拜", url: "baibai.png" },
    { title: "悲伤", url: "beishang.png" },
    { title: "鄙视", url: "bishi.png" },
    { title: "闭嘴", url: "bizui.png" },
    { title: "馋嘴", url: "chanzui.png" },
    { title: "吃惊", url: "chijing.png" },
    { title: "打脸", url: "dalian.png" },

    { title: "锤", url: "chui.png" },
    { title: "费解", url: "feijie.png" },
    { title: "鼓掌", url: "guzhang.png" },
    { title: "哈哈", url: "haha.png" },
    { title: "害羞", url: "haixiu.png" },
    { title: "流汗", url: "liuhan.png" },
    { title: "黑线", url: "heixian.png" },
    { title: "哼", url: "heng.png" },

    { title: "坏笑", url: "huaixiao.png" },
    { title: "可爱", url: "keai.png" },
    { title: "狗头", url: "doge.png" },
    { title: "捂脸", url: "wulian.png" },
    { title: "微笑", url: "weixiao.png" },
    { title: "斜眼笑", url: "xieyanxiao.png" },
    { title: "衰", url: "shuai.png" },
    { title: "龇牙", url: "ziya.png" },

    { title: "吃瓜", url: "chigua.png" },
    { title: "傻眼", url: "shayan.png" },
    { title: "污", url: "wu.png" },
    { title: "费解", url: "feijie.png" },
    { title: "感冒", url: "ganmao.png" },
    { title: "抱抱", url: "baobao.png" },
    { title: "跪了", url: "guile.png" },
    { title: "摊手", url: "tanshou.png" },

    { title: "生病", url: "shengbing.png" },
    { title: "抓狂", url: "zhuakuang.png" },
    { title: "可怜", url: "kelian.png" },
    { title: "酷", url: "ku.png" },
    { title: "阴险", url: "yinxian.png" },
    { title: "困", url: "kun.png" },
    { title: "白眼", url: "baiyan.png" },
    { title: "泪", url: "lei.png" },

    { title: "怒", url: "nu.png" },
    { title: "怒骂", url: "numa.png" },
    { title: "钱", url: "qian.png" },
    { title: "亲亲", url: "qinqin.png" },
    { title: "晕", url: "yun.png" },
    { title: "笑哭", url: "xiaoku.png" },
    { title: "失望", url: "shiwang.png" },
    { title: "思考", url: "sikao.png" },

    { title: "太开心", url: "taikaixin.png" },
    { title: "色", url: "se.png" },
    { title: "偷笑", url: "touxiao.png" },
    { title: "吐", url: "tu.png" },
    { title: "挖鼻", url: "wabi.png" },
    { title: "委屈", url: "weiqu.png" },
    { title: "睡", url: "shui.png" },
    { title: "调皮", url: "tiaopi.png" },

    { title: "嘘", url: "xu.png" },
    { title: "左哼哼", url: "zuohengheng.png" },
    { title: "右哼哼", url: "youhengheng.png" },
    { title: "哈欠", url: "haqian.png" },
    { title: "互粉", url: "hufen.png" },
    { title: "骷髅", url: "kulo.png" },
    { title: "耶", url: "ye.png" },
    { title: "握手", url: "woshou.png" },

    { title: "强", url: "qiang.png" },
    { title: "弱", url: "ruo.png" },
    { title: "作揖", url: "zuoyi.png" },
    { title: "不", url: "no.png" },
    { title: "好", url: "ok.png" },
    { title: "胜利", url: "shengli.png" },
    { title: "来", url: "lai.png" },
    { title: "威武", url: "v5.png" },

    { title: "心", url: "xin.png" },
    { title: "给力", url: "geili.png" },
    { title: "鲜花", url: "xianhua.png" },
    { title: "心碎", url: "xinsui.png" },
    { title: "猪头", url: "zhutou.png" },
    { title: "羊驼", url: "yangtuo.png" },
]

var changeEmoji = function(cont) {     //编译表情替换成图片展示出来
    var pattern1 = /\[[\u4e00-\u9fa5]+\]/g;
    var pattern2 = /\[[\u4e00-\u9fa5]+\]/;
    if( cont ){
        var content = cont.match(pattern1);
        var str = cont;
        var src = '';
        
        if (content) {
            for (var i = 0; i < content.length; i++) {
                for (var j = 0; j < emotionData.length; j++) {
                    if ("[" + emotionData[j].title + "]" == content[i]) {
                        src = emotionData[j].url;
                        str = str.replace(pattern2,'<img src="/static/img/emoji/' + src + '"/ width="25px" height="25px">');
                        // str = str.replace(pattern2,'<span class="emoticon" style="background-position: '+src+'"></span>');
                        break;
                    }else{
                        src = cont;
                    }
                }
            }
        }
        return str;
    }
}

var clone = function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;

    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }
    if (obj instanceof Array | obj instanceof Object) {
        var copy = (obj instanceof Array)?[]:{};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr))
                copy[attr] = clone(obj[attr]);
        }
        return copy;
    }
    throw new Error("Unable to clone obj! Its type isn't supported.");
}
// base64转ArrayBuffer对象
var base64ToArrayBuffer = function(base64){
    base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
    var binary = atob(base64);
    var len = binary.length;
    var buffer = new ArrayBuffer(len);
    var view = new Uint8Array(buffer);
    for (var i = 0; i < len; i++) {
        view[i] = binary.charCodeAt(i);
    }
    return buffer;
}
// ArrayBuffer对象 Unicode码转字符串
var getStringFromCharCode = function(dataView, start, length){
    var str = '';
    var i;
    for (i = start, length += start; i < length; i++) {
        str += String.fromCharCode(dataView.getUint8(i)); 
    }
    return str;
}
// 步骤三，获取jpg图片的exif的角度（在ios体现最明显）
var getOrientation = function(arrayBuffer){
    var dataView = new DataView(arrayBuffer);
    var length = dataView.byteLength;
    var orientation;
    var exifIDCode;
    var tiffOffset;
    var firstIFDOffset;
    var littleEndian;
    var endianness;
    var app1Start;
    var ifdStart;
    var offset;
    var i;
    // Only handle JPEG image (start by 0xFFD8)
    if (dataView.getUint8(0) === 0xFF && dataView.getUint8(1) === 0xD8) {
        offset = 2;
        while (offset < length) {
            if (dataView.getUint8(offset) === 0xFF && dataView.getUint8(offset + 1) === 0xE1) {
                app1Start = offset;
                break;
            }
            offset++;
        }
    }
    if (app1Start) {
        exifIDCode = app1Start + 4;
        tiffOffset = app1Start + 10;
        if (getStringFromCharCode(dataView, exifIDCode, 4) === 'Exif') {
            endianness = dataView.getUint16(tiffOffset);
            littleEndian = endianness === 0x4949;
            if (littleEndian || endianness === 0x4D4D /* bigEndian */) {
                if (dataView.getUint16(tiffOffset + 2, littleEndian) === 0x002A) {
                    firstIFDOffset = dataView.getUint32(tiffOffset + 4, littleEndian);
                    if (firstIFDOffset >= 0x00000008) {
                        ifdStart = tiffOffset + firstIFDOffset;
                    }
                }
            }
        }
    }
    if (ifdStart) {
        length = dataView.getUint16(ifdStart, littleEndian);
        for (i = 0; i < length; i++) {
            offset = ifdStart + i * 12 + 2;
            if (dataView.getUint16(offset, littleEndian) === 0x0112 /* Orientation */) {
                offset += 8;
                orientation = dataView.getUint16(offset, littleEndian);
                break;
            }
        }
    }
    return orientation;
}

//将时间戳转换成日期格式
var timestampToTime = function(timestamp) {
    var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '/';
    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '/';
    var D = date.getDate() + ' ';
    if( D < 10 ) D = '0' + D;
    return Y+M+D;
}

var deepCopy = function(p,c){
    var c = c || {};
    for (var i in p) {
        if (typeof p[i] === 'object') {
            c[i] = (p[i].constructor === Array) ? [] : {};
            deepCopy(p[i], c[i]);
        } else {
            c[i] = p[i];
        }
    }
    return c;
}

export default ({
    deepCopy,       //深层次对象拷贝
    build: function(){      //打包路径，国内或海外
        return process.env.NODE_ENV;
    },
    password: '',   //登录页密码
    code: '',       //登录页验证码
    timestampToTime,
    clearAllCookie, //清除所有缓存
    clearVersionCookie,
    base64ToArrayBuffer,
    getOrientation,
    clone,
    len:'',
    count:count,
    in_array:in_array,
    canUpload: function () {
        var game = getgame();
        var isInGame = cookieGet('ingame');
        if(game==1 && isInGame > 0){
            return false;
        }return true;
    },
    showExit: function(){
        var game = getgame();
        var isInGame = cookieGet('ingame');
        if(game==1 && isInGame > 0){
            return false;
        }return true;
    },
    inGame: function () {
        var isInGame = cookieGet('ingame');
        if(isInGame > 0){
            return true;
        }return false;
    },
    decode,  //解密
    encode,  //加密
    SHA1,
    checktoken: function () {
        return checkuserToken()
    },
    getQuery,
    setQuery,
    getParam: function () {
        return getQueryVariable()
    },
    setParam: function () {
        return
    },
    href: function (url, querydata) {
        var hrefstr = url + '' + setQuery(querydata)
        console.log('href str:', hrefstr)
        window.location.href = hrefstr
    },
    gethref: function (url, querydata) {
        var hrefstr = url + '' + setQuery(querydata)
        return hrefstr
    },
    storageGet,
    set: function (itemName, item) {
        storageSet(itemName, item)
    },
    del: function (itemName) {
        storageDel(itemName)
    },
    sget: function (itemName) {
        return sessionGet(itemName)
    },
    sset: function (itemName, item) {
        sessionSet(itemName, item)
    },
    sdel: function (itemName) {
        sessionDel(itemName)
    },
    test: function () {
        console.log('api test')
    },
    ticket: function () {
        return app
    },
    geturl: function (domainname) {
        return 'http://' + domainname + '.clubfront.flash.ltd:8081/'
    },
    getticket: async function () {
        await getticket()
    },
    post: function (interfaceName, querys, callback) {
        var url = getUrl(interfaceName)
        querys = getQueryData(interfaceName, querys)
        var data = [];
        var dt = Vue.http.post(url, querys, {
            emulateJSON: true
        }).then(function (response) {
            var body = response.body;
            let uid = cookieGet('uid');             //登录存的cookie信息‘uid’,‘myuser’
            let token = cookieGet('myuser');   
            if( uid !== '' && token !== '' ){       //发接口的时候重置登录cookie时间
                cookieSet('uid',uid,7);
                cookieSet('myuser',token,7);
            }  
            if (body) {
                if (body.enc) {
                    if (body.data && body.enc === 1) {
                        data = body
                        callback(body)
                        return true;
                    } else {
                        body = {
                            data: {}
                        }
                    }
                }
                data = body
                callback(body);
            } else {
                callback(body);
            }
        }, function (response) {
            return false
        })
        return data;
    },
    upload: function(interfaceName, picture, callback){
        var url = getUrl(interfaceName);
        var formData = new FormData();
        formData.append('file', picture);

        let querys = getQueryData(interfaceName, {})
        for(let i in querys){
            formData.append(i,querys[i]);
            // console.log(i,querys[i]);
        }
        var data = [];
        var dt = Vue.http.post(url, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(function (response) {
            var body = response.body
            if (body) {
                if (body.enc) {
                    if (body.data && body.enc === 1) {
                        data = body
                        callback(body)
                        return true;
                    } else {
                        body = {
                            data: {}
                        }
                    }
                }
                data = body
                callback(body);
            } else {
                callback(body);
            }
        }, function (response) {
            return false
        })
        return data;
    },
    getmsg: function (data) {
        getCodeMessage(data);
    },
    setCookie: cookieSet,
    getCookie: function(c_name){
        return cookieGet(c_name);
    },
    islogin,
    checkurl,

    changeTime: function(timeValue){
        return timeChange(timeValue);
    },
    getTime: function(timeValue){
        return timeGet(timeValue);
    },
    
    analyzeEmoji: function(cont){
        return changeEmoji(cont);
    },
    emojiData:emojiData,
    copyStr:function (str) {    //复制链接
        var doc = document
        var els = doc.getElementById('copyStr');
        if(typeof(els)==='undefined' || els===null){
          els=document.createElement('span');
          els.id = "copyStr"
          var first=document.body.firstChild;//得到页面的第一个元素 
          var wraphtml=document.body.insertBefore(els,first);
        }
        els = doc.getElementById('copyStr');
        els.innerText = str
        var range,
        selection;
        selection = window.getSelection();
        range = document.createRange();  
        range.selectNodeContents(els);
        selection.removeAllRanges();
        selection.addRange(range);
        els.innerText   //FireFox不支持innerText
        var link = els.innerText
        document.execCommand("Copy"); // 执行浏览器复制命令
        selection.removeAllRanges();
        els.remove();
    },
})