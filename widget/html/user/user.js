apiready = function() {
    checkIfLoadData(function (){
        setStatusBarLight();
        render();
        getData();
    });

    var marginTop = cache('marginTop');
    $('#user-top').css('background-position', 'center -' + marginTop + 'px');

    $('.menu-group .item, .funcs .item').each(function (e) {
        var url = $(this).attr('data-page');
        var id = $(this).attr('id');
        var param = {
            name: id,
            url: url
        }

        if (id === 'bankcard') {
            param.pageParam = {
                type: 2
            };
        }

        this.onclick = function() {
            var user = getUserCache();
            if (id === 'bankcard' && (!user || !user.bankCardStatus)) {
                msg('请先完成银行卡认证');
                return false;
            }

            api.openWin(param);
        }
    })
};

// 检测是否加载数据
function checkIfLoadData(callback){
    callback && callback();
    winAppeared(callback);

    receiveEvent('rootPageTab', function(ret, err){
        if (ret.value === 'user') {
            $('body').removeClass('hide');
            callback && callback();
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
            cache('user', JSON.stringify(res.data));
            render(res.data);
        }
    })
}

function render(user){
    var user = user ? user : getUserCache();
    $('#user-top .mobile').html(user.phone);
    $('#user-top .status').html(isVerified(user) ? '已认证' : '未认证');

    if (user.headPortrait) {
        $('#user-top img').attr('src', user.headPortrait);
    }
}
