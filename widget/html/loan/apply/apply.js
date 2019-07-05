apiready = function() {
    var id = api.pageParam.id;
    var model = api.deviceModel;

    sendEvent('fromApply');
    showLoading();

    get('recovery/' + id, {}, function (res){
        closeLoading();
        $('body').removeClass('hide');

        if (res.status === 'error') {
            msg(res.msg);
        } else if (res.status === 'success') {
            var data = res.data;
            data.model = model;
            render(data);
        }
    })

    $('.rule i').get(0).onclick = function (){
        $(this).toggleClass('selected');
    }

    tap($('.rule .text-danger'), function (){
        api.openWin({
            name: 'agreement',
            url: '../../agreement/agreement.html',
            pageParam: {
                id: 2,
                title: '租赁协议'
            }
        });
    })

    tap($('.submit-btn button'), function (){
        if ($('.rule .selected').length === 0) {
            return msg('请阅读并同意《租赁协议》');
        }

        var data = {
            mobileSystemType: api.systemType === 'ios' ? 1 : 2,
            model: model
        }

        apply(id, data);
    })
}

function render(data) {
    var tpl = doT.template($('#tpl').text());
    $('.groups').html(tpl(data));
}

function apply(id, data) {
    showLoading();
    post('recovery/submit/' + id, data, function (res){
        closeLoading();
        if (res.status === 'error') {
            return msg(res.msg);
        } else if (res.status === 'success') {
            api.openWin({
                name: 'loan_success',
                url: '../success/success.html',
                pageParam: {
                    order: res.data
                }
            })
        }
    })
}
