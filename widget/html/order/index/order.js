var currPage = 1;
var finished = false;
var reload = true;

apiready = function() {
    showLoading();

    winAppeared(function (){
        if (reload) {
            finished = false;
            currPage = 1;
            getOrders();
        }
    })

    receiveEvent('scrolltobottom', function(ret, err){
        finished || getOrders();
    })

    receiveEvent('reloadOrders', function(res) {
        reload = res.value.reload ? true : false;
    })
}

function getOrders(){
    if (finished) {
        return;
    }

    var data = {
        page: currPage,
        limit: 20
    };

    showLoading();
    get('order/list', data, function (res){
        closeLoading();
        if (res.status === 'error') {
            msg(res.msg);
        } else if (res.status === 'success') {
            if (res.data.list.length === 0 && currPage == 1) {
                finished = true;
                $('.order-list').html('');
                $('.empty-box').show();
                return;
            }

            if (currPage > res.data.totalPage) {
                finished = true;
                currPage > 1 && toast('已加载全部订单');
                return;
            }

            currPage++;
            render(res.data.list);
        }
    });
}

function render(data) {
    var tpl = doT.template($('#list-tpl').html());
    var html = tpl(data);

    if (currPage <= 2) {
        $('.order-list').html(html);
    } else {
        $('.order-list').append(html);
    }

    bindItemEvents();
    api.parseTapmode();
}

function goFail() {
    api.openWin({
        name: 'order_fail',
        url: '../fail/fail.html'
    });
}

function bindItemEvents(){
    $('.order-list .item').each(function (){
        var status = $(this).find('.status').attr('data-status');
        var id = $(this).attr('data-id');

        tap($(this).find('.renew'), function (){
            api.openWin({
                name: 'renew',
                url: '../renew/renew.html',
                pageParam: {
                    id: id
                }
            });
        });

        tap($(this).find('.info'), function (){
            if (status == 2) {
                goFail();
                return;
            }

            api.openWin({
                name: 'order_show',
                url: '../show/show.html',
                pageParam: {
                    id: id
                }
            });
        });

        tap($(this).find('.destroy-btn'), function (){
            destroy(id, function (){
                finished = false;
                currPage = 1;
                getOrders();
            });
        });
    })

    api.parseTapmode();
}
