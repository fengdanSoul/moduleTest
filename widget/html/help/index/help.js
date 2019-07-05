var cacheData = null;

apiready = function() {
    cacheData = cache('helps');
    cacheData && render(JSON.parse(cacheData));
    getCategories();
}

function getCategories(){
    cacheData || showLoading();

    get('help/list', { id: 1 }, function (res){
        if (res.status === 'success') {
            cache('helps', res.data);
            render(res.data);
        }

        cacheData || closeLoading();
    });
}

function render(data) {
    var tpl = doT.template($('#help-list').html());
    $('.menu-group').html(tpl(data));
    $('.menu-group .item').each(function() {
        this.onclick = function() {
            var title = $(this).find('label').html();
            var id = $(this).attr('data-id');

            api.openWin({
                name: 'help_detail',
                url: '../detail/detail.html',
                pageParam: {
                    id: id,
                    title: title
                }
            });
        }

        api.parseTapmode();
    })
}
