var os = null;
var crawlerModule = null;
var authInfoModule = null;
var user = null;
var xyUser = '';
var xyKey = '';
var xyTerminalId = '';
// var crawlerModule = api.require('XYCrawlerIOS');

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

    xyUser = api.loadSecureValue({
        sync: true,
        key: 'kUser'
    });
    xyKey = api.loadSecureValue({
        sync: true,
        key: 'kKey'
    });
    xyTerminalId = api.loadSecureValue({
        sync: true,
        key: 'xyTerminalId'
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
