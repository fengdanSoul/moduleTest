var currPage = 1;
var finished = false;
var fromShowPage = false;

apiready = function() {
    showLoading();

    winAppeared(function (){
        if (!fromShowPage) {
            finished = false;
            currPage = 1;
            getMessages();
        }
    })

    receiveEvent('fromMessageShow', function() {
        fromShowPage = true;
    })

    receiveEvent('scrolltobottom', function(ret, err){
        finished || getMessages();
    });
}

function getMessages(){
    if (finished) {
        return;
    }

    showLoading();

    var data = {
        page: currPage,
        limit: 20
    };

    get('user/message', data, function (res){
        closeLoading();
        if (res.status === 'error') {
            msg(res.msg);
        } else if (res.status === 'success') {
            if (res.data.list.length === 0 && currPage == 1) {
                finished = true;
                $('.empty-box').show();
                return;
            }

            if (currPage > res.data.totalPage) {
                finished = true;
                currPage > 1 && toast('已加载全部消息');
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
        $('.message-list').html(html);
    } else {
        $('.message-list').append(html);
    }

    $('.message-list .item').each(function (){
        var id = $(this).attr('data-id');
        tap($(this), function (){
            $(this).removeClass('unread');
            api.openWin({
                name: 'message_show',
                url: '../show/show.html',
                pageParam: {
                    id: id
                }
            });
        })
    })

    api.parseTapmode();
}
