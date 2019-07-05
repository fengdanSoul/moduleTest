apiready = function() {
    winAppeared(function (){
        api.closeWin({name: 'apply'});
        api.closeWin({name: 'loan'});
    })

    winDisAppeared(function (){
        api.closeWin();
    })

    var order = api.pageParam.order;
    render(order);

    tap($('#back-to-home'), function (){
        api.closeToWin({
            name: 'root'
        });
    });

    tap($('#go-to-order'), function (){
        api.openWin({
            name: 'order_show',
            url: '../../order/show/show.html',
            pageParam: {
                id: order.orderId
            }
        });
    });
}

function render(data) {
    var tpl = doT.template($('#tpl').html());
    $('.menu-group').html(tpl(data));
}
