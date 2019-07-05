var os = null;
var crawlerModule = null;
var authInfoModule = null;
var user = null;

apiready = function() {
    os = api.systemType;
    renderLoan();
    receiveEvent('renderLoan', function (){
        renderLoan();
    });

    checkIfLoadData(function (){
        setStatusBarLight();
        getData();
    });

    switch (os) {   
        case 'ios':
            crawlerModule = api.require('XYCrawlerIOS');
            break;
        case 'android':
            authInfoModule = api.require('authinformodule');
            break;
    }

    $('.loan-btn').get(0).onclick = function (){
        if (! isVerified()) {
            msg('请先完成所有认证');
            return;
        }

        api.openWin({
            name: 'loan',
            url: $(this).attr('data-page')
        });
    }

    verifyAction();
}

// 检测是否加载数据
function checkIfLoadData(callback){
    callback && callback();
    winAppeared(callback);

    var cacheUser = getUserCache();
    user = user ? user : cacheUser;
    render({ user: user });

    receiveEvent('rootPageTab', function(ret, err){
        if (ret.value === 'home') {
            $('body').removeClass('hide');
            callback();
        } else {
            $('body').addClass('hide');
        }
    });
}

// 加载数据
function getData() {
    if ($('body').hasClass('hide')) {
        return;
    }

    if (!checkIfLogin()) {
        return;
    }

    get('user', {}, function(res) {
        if (res.status === 'success') {
            cache('user', JSON.stringify(res.data))
            user = res.data;
            render({ user: res.data });
            getSettings();
        }
    })
}

// 渲染视图
function render(data) {
    var tpl = doT.template($('#verify-tpl').text());
    $('.menu-group').html(tpl(data));
    verifyAction();
}

// 注册相关操作事件
function verifyAction() {
    if (!user) {
        return;
    }

    tap($('#basic-verify.is-link'), function() {
        api.openWin({
            name: 'basic_verify',
            url: $(this).attr('data-page')
        });
    });

    tap($('#id-verify.is-link'), function (){
        if (!user.basicInfoStatus) {
            msg('请先完成基本信息认证');
            return;
        }

        setStatusBarDark();
        runFaceAuth(function (res){
            var data = {
                name: res.id_name,
                cardNo: res.id_no,
                cardFront: res.url_frontcard,
                cardBack: res.url_backcard,
                portrait: res.url_photoliving
            }

            showLoading();
            post('auth/identity', data, function (res) {
                closeLoading();
                if (res.status === 'error' || res.status === 'success') {
                    toast(res.msg, function (){
                        getData();
                    });
                }
            })
        });
    })

    tap($('#bankcard-verify.is-link'), function (){
        if (!user.identityStatus) {
            msg('请先完成身份认证');
            return;
        }

        api.openWin({
            name: 'bankcard',
            url: $(this).attr('data-page'),
            pageParam: {
                type: 1
            }
        });
    })

    tap($('#taobao-verify.is-link'), function (){
        if (!user.bankCardStatus) {
            msg('请先完成银行卡认证');
            return;
        }

        taobaoVerify(function (code, token) {
            if (code == 1 && token) {
                showLoading();
                post('auth/taobao', { token: token }, function (res) {
                    closeLoading();
                    if (res.status === 'error' || res.status === 'success') {
                        toast(res.msg, function (){
                            getData();
                        });
                    }
                })
            } else {
                toast('认证失败');
            }
        });
    })

    tap($('#mobile-verify.is-link'), function (){
        if (!user.taobaoStatus) {
            msg('请先完成淘宝认证');
            return;
        }

        api.openWin({
            name: 'mobile_verify',
            url: $(this).attr('data-page')
        });
    })

    tap($('#operator-verify.is-link'), function (){
        if (!user.appleStatus) {
            msg('请先完成手机认证');
            return;
        }

        carrierVerify(function (code, token) {
            if (code == 1 && token) {
                showLoading();
                post('auth/operator', { token: token }, function (res) {
                    closeLoading();
                    if (res.status === 'error' || res.status === 'success') {
                        toast(res.msg, function (){
                            getData();
                        });
                    }
                })
            } else {
                toast('认证失败');
            }
        });
    })

    api.parseTapmode();
}

// 获取站点配置
function getSettings(){
    get('client/settings', {}, function (res){
        if (res.status === 'success') {
            cache('settings', JSON.stringify(res.data));
            renderLoan(res.data);
        }
    })
}

// 渲染回收信息
function renderLoan(){
    var data = arguments[0];

    if (!data) {
        var settings = cache('settings');

        if (!settings) {
            return;
        }

        data = JSON.parse(settings);
    }

    $('#loan .price').html(data.recoveryPrice);
    $('#loan .period').html(data.loanPeriod);
}


var xyUser = api.loadSecureValue({
    sync: true,
    key: 'kUser'
});
var xyKey = api.loadSecureValue({
    sync: true,
    key: 'kKey'
});
var xyTerminalId = api.loadSecureValue({
    sync: true,
    key: 'xyTerminalId'
});
// 淘宝认证
function taobaoVerify(callback) {

    switch (os) {
        case 'ios':
            crawlerModule.xyStartFunction({
                xyUser:xyUser,
                xyKey:xyKey,
                xyTerminalId:xyTerminalId,
                taskId: (new Date()).valueOf(),
                xyFunction: 0
            }, function (ret, err) {
                console.log('iOS淘宝:::::: ' + JSON.stringify(ret));
                callback && callback(ret.code, ret.token);
            });
            break;
        case 'android':
            authInfoModule.operatorCertification({
                "type": "taobao",
                "taskId": (new Date()).valueOf(),
                "phoneNum": "14789987547",
                "realname": "Hello carrier!",
                "idcard": "610427199601011611",
                "phoneServerCode": "123456",
                "carrierCanInput": "NO"
            }, function(ret, err){
                console.log('Android淘宝:::::: ' + JSON.stringify(ret));
                callback && callback(ret.code, ret.token);
            });
            break;
    }
}
function getMyTime() {
    var time = new Date();
    var y = time.getFullYear();//年
    var m = (time.getMonth() + 1) < 10 ? '0' + (time.getMonth() + 1) : (time.getMonth() + 1);//月
    var d = time.getDate() < 10 ? "0" + time.getDate() : time.getDate();//日
    var hh = time.getHours() < 10 ? "0" + time.getHours() : time.getHours();//时
    var mm = time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes();//分
    var ss = time.getSeconds() < 10 ? "0" + time.getSeconds() : time.getSeconds();//秒
    return y + m + d + hh + mm + ss;
}
// 运营商认证
function carrierVerify(callback) {
    var user = getUserCache();

    switch (os) {
        case 'ios':
            crawlerModule.xyStartFunctionCarrier({
                xyUser:xyUser,
                xyKey:xyKey,
                xyTerminalId:xyTerminalId,
                xyTaskId:  (new Date()).valueOf(),
                xyFunction: 3,
                mobile:user.phone,
                realName:user.realName,
                idCard:user.cardNo,
                password:"",
                showIdNameInput: true,
                inputEditing: false
            }, function (ret, err) {
                console.log('iOS运营商:::::: ' + JSON.stringify(ret));
                callback && callback(ret.code, ret.token);
            })
            break;
        case 'android':
            authInfoModule.operatorCertification({
                "type": 'carrier',
                "taskId": (new Date()).valueOf(),
                "phoneNum": user.phone,
                "realname": user.realName,
                "idcard": user.cardNo,
                "phoneServerCode": '610627',
                "carrierCanInput": 'NO',
                "carrierIDandNameShow": 'YES'
            }, function(ret, err){
                console.log('Android运营商:::::: ' + JSON.stringify(ret));
                callback && callback(ret.code, ret.token);
            });
            break;
        default:
    }
}

// 有盾人脸识别认证
function runFaceAuth(callback) {
    var orderId = ((new Date()).valueOf()).toString();

    var authKey = api.loadSecureValue({
        sync: true,
        key: 'authKey'
    });

    var youDun = api.require('UDYhy');
    console.log(orderId);

    youDun.faceAuth({
        authKey: authKey,
        outOrderId: orderId,
    }, function(ret, err) {
        setStatusBarLight();
        console.log(JSON.stringify(ret));
        if (err) {
            return;
        }

        if (ret.ret_code === '000000') {
            if (ret.result_auth === 'T') {
                callback && callback(ret);
            } else {
                toast('认证失败');
            }
        } else {
            toast(ret.ret_msg);
        }
    });
}
