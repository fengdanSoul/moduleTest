var isForgetPage = null;

apiready = function() {
    isForgetPage = api.pageParam.type == 1;

    if (!isForgetPage) {
        $('input[name=phone]').val(getUserCache().phone);
        $('input[name=phone]').removeAttr('required').prop('readonly', true);
    }

    tap($('.submit-btn button'), function (){
        resetPassword();
    });

    tap($('.sms-btn'), function (){
        var url = isForgetPage ? 'sms/send' : 'password/sms';
        sendSms($(this), url);
    });
}

function resetPassword(){
    var data = checkForm();

    if (!data) {
        return;
    }

    if (data.password != data.confirmPassword) {
        msg('两次密码输入不一致！');
        return;
    }

    showLoading();
    var url = isForgetPage ? 'forget/password' : 'password/update';

    post(url, data, function (res) {
        if (res.status === 'error') {
            toast(res.msg);
        } else if (res.status === 'success') {
            toast(res.msg, function (){
                api.closeWin();
            });
        }
    });
}
