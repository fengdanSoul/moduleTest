apiready = function () {
    winAppeared(function (){
        api.closeWin({
            name: 'settings'
        });

        getSettings();
        checkIfQuitApp();
    })

    $('.forget-password').get(0).onclick = function (){
        api.openWin({
            name: 'password',
            url: '../password/password.html',
            pageParam: {
                type: 1
            }
        });
    }

    tap($('.submit-btn button'), function (){
        var data = checkForm();

        if (!data) {
            return;
        }

        showLoading();

        post('login', data, function (res) {
            if (res.status === 'error') {
                toast(res.msg);
            } else if (res.status === 'success') {
                cache('token', res.accessToken);
                api.closeWin();
            }
        });
    });
}

// 监听返回事件退出应用
function checkIfQuitApp() {
    api.addEventListener({
        name:'swiperight'
    }, function(ret, err){
        return;
    });
}

// 获取站点配置
function getSettings(){
    get('client/settings', {}, function (res){
        if (res.status === 'success') {
            cache('settings', JSON.stringify(res.data));
            sendEvent('renderLoan');
        }
    })
}
