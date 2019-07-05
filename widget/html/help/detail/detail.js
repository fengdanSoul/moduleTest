apiready = function() {
    var id = api.pageParam.id;
    var title = api.pageParam.title;
    $('h3').html(title);

    var cacheData = cache('help-' + id);
    cacheData && render(cacheData);
    cacheData || showLoading();

    get('help/' + id, {}, function (res){
        cacheData || closeLoading();
        if (res.status === 'error') {
            toast(res.msg);
        } else if (res.status === 'success') {
            cache('help-' + id, res.data.content);
            render(res.data.content);
        }
    });
}

function render(data) {
    $('.content').html(data);
    $('.article').removeClass('hide');
}
