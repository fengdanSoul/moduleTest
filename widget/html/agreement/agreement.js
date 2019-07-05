apiready = function() {
    var id = api.pageParam.id;
    showLoading();

    sendEvent('reloadOrder', { reload: false });

    get('agreement/' + id, {}, function (res){
        closeLoading();
        if (res.status === 'error') {
            msg(res.msg);
        } else if (res.status === 'success') {
            render(res.data);
        }
    });
}

function render(data) {
    $('.content').html(data.content);
    $('.article').removeClass('hide');
}
