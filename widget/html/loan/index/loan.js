fromApplyPage = false;

apiready = function() {
    showLoading();

    winAppeared(function (){
        fromApplyPage || getLoans();
    })

    receiveEvent('fromApply', function() {
        fromApplyPage = true;
    })

    $('.loan-list .item').each(function (){
        $(this).find('button').get(0).onclick = function (){
            api.openWin({
                name: 'apply',
                url: '../apply/apply.html',
                pageParam: {
                    id: 1
                }
            });

        }
    })
}

function getLoans(){
    showLoading();

    get('recovery/list', {}, function (res){
        closeLoading();
        if (res.status === 'error') {
            msg(res.msg);
        } else if (res.status === 'success') {
            if (res.data.length === 0) {
                $('.empty-box').show();
                return;
            }

            render(res.data);
        }
    });
}

function render(data) {
    var tpl = doT.template($('#list-tpl').html());
    var html = tpl(data);
    $('.loan-list').html(html);

    $('.loan-list .item').each(function (){
        var id = $(this).attr('data-id');
        tap($(this), function (){
            $(this).removeClass('unread');
            api.openWin({
                name: 'apply',
                url: '../apply/apply.html',
                pageParam: {
                    id: id
                }
            });
        })
    })

    api.parseTapmode();
}
