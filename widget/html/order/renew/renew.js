apiready = function (){
    var id = api.pageParam.id;
    sendEvent('reloadOrders', { reload: false });
    showLoading();

    winAppeared(function (){
        query(id);
    })

    tap($('.submit-btn button'), function (){
        confirmMsg('确认提交续租申请吗？', function (){
            renew(id);
        })
    })
}

function query(id){
    showLoading();
    get('renewal/apply/' + id, {}, function (res){
        closeLoading();
        $('body').removeClass('hide');
        render(res.data);
    })
}

function render(data){
    var tpl = doT.template($('#tpl').html());
    var html = tpl(data);
    $('.menu-group').html(html);
}

function renew(id){
    showLoading();
    post('renewal/submit/' + id, {}, function (res){
        closeLoading();

        if (res.status === 'error') {
            return msg(res.msg);
        } else if (res.status === 'success') {
            toast(res.msg, function (){
                api.closeWin();
            });
        }
    })
}
