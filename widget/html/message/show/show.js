apiready = function() {
    var id = api.pageParam.id;
    showLoading();
    sendEvent('fromMessageShow');

    get('user/message/' + id, {}, function (res){
        closeLoading();
        if (res.status === 'error') {
            toast(res.msg);
        } else if (res.status === 'success') {
            render(res.data);
        }
    });
}

function render(data) {
    $('h3').html(data.name);
    $('.content').html(data.content);
    $('.article').removeClass('hide');
}
