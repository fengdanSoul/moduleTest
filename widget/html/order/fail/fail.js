apiready = function (){
    sendEvent('reloadOrders', { reload: false });
    showLoading();

    winAppeared(function (){
        getLinks();
    })
}

function getLinks(){
    get('links', {}, function (res){
        if (res.status === 'error') {
            return msg(res.msg);
        } else if (res.status === 'success') {
            render(res.data);
        }
    })
}

function render(data){
    var tpl = doT.template($('#list-tpl').html());
    var html = tpl(data);
    $('.apps').html(html);
    $('.fail-page').removeClass('hide');
    bindActions();
}

function bindActions(){
    $('.apps .item').each(function (){
        var url = $(this).attr('data-link');
        tap($(this), function (){
            if ($.trim(url) == '') {
                return;
            }

            openUrlByBrowser(url);
        });
    })

    api.parseTapmode();
}
