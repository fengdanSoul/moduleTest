var global = {
    // apiUrl: 'http://39.98.181.160:8888/api/'
    apiUrl: 'http://47.91.229.205:8080/chaolidai/api/'
};

// 打印函数
function p(content){
    if (typeof(content) === 'object') {
        content = JSON.stringify(content);
    }

    console.log(content);
}

// 判断变量是否存在
function isset(variable) {
    return typeof (variable) !== 'undefined';
}

// 设置状态栏颜色
function setStatusBarLight(){
    api.setStatusBarStyle({
        style: 'light'
    });
}

function setStatusBarDark(){
    api.setStatusBarStyle({
        style: 'dark'
    });
}

// 关闭页面自适应状态栏颜色
function setStatusBarWhenClose(){
    api.addEventListener({
        name:'viewdisappear'
    }, function(ret, err){
        if (api.windows().length === 1) {
            setStatusBarLight();
        }
    });
}

// 设置缓存数据
function cache(key) {
    var value = arguments[1];

    if (value) {
        return api.setPrefs({
            key: key,
            value: value
        });
    } else {
        return api.getPrefs({
            sync: true,
            key: key
        });
    }
}

// 发送广播事件
function sendEvent(name){
  api.sendEvent({
      name: name,
      extra: arguments[1]
  });
}

// 接收广播事件
function receiveEvent(name, callback){
    api.addEventListener({
        name: name
    }, function(ret, err){
        callback(ret, err);
    });
}

// 删除缓存数据
function removeCache(key) {
    api.removePrefs({
        key: key
    });
}

// 无延迟点击函数
function tap(obj, fn){
    if (obj.length > 0) {
        obj.get(0).onclick = fn;
    }
}

// 监听页面显示
function winAppeared(callback) {
    api.addEventListener({
        name:'viewappear'
    }, function(ret, err){
        callback && callback(ret, err);
    });
}

// 监听页面隐藏
function winDisAppeared(callback) {
    api.addEventListener({
        name:'viewdisappear'
    }, function(ret, err){
        callback && callback(ret, err);
    });
}

// 普通信息弹框
function msg(msg) {
    var title = arguments[1];
    var callback = arguments[2];
    api.alert({
        title: title  ? title : '提示',
        msg: msg,
    }, function(ret, err) {
        callback && callback(ret, err);
    });
}

// toast弹框
function toast(msg, callback) {
    var callback = arguments[1];
    var duration = arguments[2] ? arguments[2] : 2000;
    var location = arguments[3] ? arguments[3] : 'middle';
    api.toast({
        msg: msg,
        duration: duration,
        location: location
    });

    setTimeout(function (){
        callback && callback();
    }, duration);
}

// 显示加载框
function showLoading() {
    api.showProgress({
        style: 'default',
        animationType: 'fade',
        // modal: false
    });
}

// 关闭加载框
function closeLoading() {
    api.hideProgress();
}

// 确认对话框
function confirmMsg(msg, callback){
    var title = arguments[2];
    api.confirm({
        title: '提示',
        msg: msg,
        buttons: ['确定', '取消']
    }, function(ret, err){
        if (ret && ret.buttonIndex == 1){
            callback && callback();
        }
    });
}

// 选择器
function picker(selector, data){
    var position = arguments[2];
    var title = arguments[3];
    var mobileSelect1 = new MobileSelect({
        trigger: selector,
        title: title ? title : '请选择',
        wheels: [{
            data: data
        }],
        position: position ? position : [1],
        callback: function(indexArr, res) {
            var res = res[0];
            if (typeof(res) === 'object') {
                $(selector).val(res.value);
                $(selector).attr('form-value', res.id);
            } else {
                $(selector).val(res);
            }
        }
    });
}

// 表单验证
function checkForm() {
    var json = {};

    $('form input, form textarea').each(function () {
        var name = $(this).attr('name');
        var errMsg = $(this).attr('err-msg');
        var formValue = $(this).attr('form-value');
        var value = $.trim($(this).val());

        if (typeof($(this).attr('required')) !== 'undefined' && value == '') {
            msg(errMsg ? errMsg : '请输入' + $(this).attr('placeholder'));
            json = false;
            return false;
        }

        json[name] = formValue ? formValue : value;
    });

    return json;
}

// get请求
function get(url, json, callback, error) {
    ajax('get', url, json, callback, error)
}

// post请求
function post(url, json, callback, error) {
    ajax('post', url, json, callback, error)
}

// ajax请求
function ajax(method, url, json, callback, error) {
    var headers = {
        'Content-Type': 'application/json;charset=utf-8'
    };

    var json = json ? json : {};
    var clientId = cache('clientId');
    var token = cache('token');

    if (clientId) {
        headers['Client-Id'] = clientId;
    }

    if (token) {
        headers['Authorization'] = token;
    }

    console.log('请求地址：' + global.apiUrl + url);
    /*console.log('请求头：' + JSON.stringify(headers));
    console.log('请求数据：' + JSON.stringify(json));*/

    api.ajax({
        url: global.apiUrl + url,
        method: method,
        headers: headers,
        data: {
            body: json
        },
        returnAll: true
    }, function(ret, err) {
        console.log(JSON.stringify(ret))
        if (!ret) {
            msg('网络连接失败');
            return false;
        }

        var res = ret.body;

        if (res && res['errorCode'] === 'expired') {
            toast('登录信息已过期', function (){
                logout();
            });

            return false;
        }

        if (!ret['headers']) {
            error && error();
            api.alert({ msg: err.msg });
            return false;
        }

        var clientId = ret.headers['Client-Id'];
        var token = ret.headers['Authorization'];


        if (clientId) {
            cache('clientId', clientId);
        }

        if (token) {
            cache('token', token);
        }

        callback && callback(res);
    });
}

// 判断是否登录
function checkIfLogin() {
    if (cache('token')) {
        return true;
    }

    api.openWin({
        name: 'login',
        url: api.wgtRootDir + '/html/login/login.html',
        slidBackEnabled:false
    });
}

// 获取缓存用户信息
function getUserCache() {
    var user = cache('user');

    if (!user) {
        return null;
    }

    return JSON.parse(user);
}

// 复制到粘贴板
function copyToPasteBoard(value){
    var callback = arguments[1];
    var paste = api.require('pasteboard');
    var param = { value: value };
    paste.paste(param, function(ret, err) {
        if (ret.status) {
            callback && callback();
        } else {
            msg(ret.msg);
        }
    })
}

// 浏览器打开网页
function openUrlByBrowser(url){
    var system = api.systemType;

    if (system === 'ios') {
        api.openApp({
            iosUrl: url
        });
    } else {
        api.openApp({
            androidPkg: 'android.intent.action.VIEW',
            mimeType: 'text/html',
            uri: url
        }, function(ret, err){
            err.msg && msg(err.msg);
        });
    }
}

// 用户是否认证
function isVerified() {
    var user = arguments[0] ? arguments[0] : getUserCache();

    if (!user) {
        return false;
    }

    return (user.basicInfoStatus
    && user.identityStatus
    && user.bankCardStatus
    && user.taobaoStatus
    && user.appleStatus
    && user.operatorStatus);
}

// 退出登录
function logout() {
    removeCache('token');

    api.openWin({
        name: 'login',
        url: api.wgtRootDir + '/html/login/login.html'
    });
}

// 发送验证码
function sendSms(obj){
    var url = arguments[1] ? arguments[1] : 'sms/send';
    var seconds = 60;
    var timer = null;
    var text = obj.html();
    var phone = $.trim($('input[name=phone]').val());
    var data = url ? { phone: phone } : {};

    if (url == 'sms/send' && phone == '') {
        msg('请输入手机号');
        return;
    }

    var start = function() {
        obj.addClass('disabled');
        obj.html(seconds + 's重新获取');

        timer = setInterval(function (){
            seconds--;

            if (seconds < 1) {
                clearInterval(timer);
                obj.html(text);
                obj.removeClass('disabled');
            } else {
                obj.html(seconds + 's重新获取');
            }
        }, 1000);
    }
    console.log(JSON.stringify(data))
    showLoading();
    post(url, data, function (res){
        closeLoading();
        console.log(JSON.stringify(res))
        if (res.status == 'error') {
            toast(res.msg);
        } else if (res.status == 'success') {
            toast(res.msg);
            start();
        }
    });
}

// 检查更新
function checkUpdate() {
    var mam = api.require('mam');
    showLoading();
    mam.checkUpdate(function(ret, err) {
        closeLoading();

        if (!ret) {
            msg(err.msg);
        }

        var result = ret.result;
        if (result.update == true && result.closed == false) {
            confirmMsg('有新的版本,是否下载并安装', function (){
                if (api.systemType == "android") {
                    api.download({
                        url : result.source,
                        report : true
                    }, function(ret, err) {
                        if (ret && 0 == ret.state) {
                            api.toast({
                                msg : "正在下载应用" + ret.percent + "%",
                                duration : 2000
                            });
                        }
                        if (ret && 1 == ret.state) {
                            var savePath = ret.savePath;
                            api.installApp({
                                appUri : savePath
                            });
                        }
                    });
                }
                if (api.systemType == 'ios') {
                    api.installApp({
                        appUri : result.source
                    });
                }
            });
        } else {
            msg('暂无更新');
        }
    });
}
