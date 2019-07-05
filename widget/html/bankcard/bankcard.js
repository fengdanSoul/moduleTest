var requestUrl = null;

apiready = function() {
    var type = api.pageParam.type;
    var user = getUserCache();
    requestUrl = type == 1 ? 'auth/bank/card' : 'bank/card/update/';

    if (type == 2) {
        getBankcard();
    }

    if (user) {
        $('input[name=realName]').val(user.realName);
        $('input[name=cardNo]').val(user.cardNo);
        $('input[name=phone]').val(user.phone);
    }

    tap($('.sms-btn'), function (){
        sendSms($(this));
    });

    tap($('.submit-btn button'), function () {
        var data = checkForm();

        if (!data) {
            return;
        }

        showLoading();
        post(requestUrl, data, function (res) {
            if (res.status === 'error') {
                toast(res.msg);
            } else if (res.status === 'success') {
                toast(res.msg, function (){
                    api.closeWin();
                });
            }
        });
    });
}

function getBankcard() {
    get('bank/card/info', {}, function (res){
        if (res.status == 'success') {
            requestUrl += res.data.id;
            $('input[name=number]').val(res.data.number);
        }
    })
}
