var id = null;
var timer = null;
var reload = true;

apiready = function (){
    showLoading();
    id = api.pageParam.id;
    sendEvent('reloadOrders', { reload: false });
    receiveEvent('reloadOrder', function (res){
        reload = res.value.reload ? true : false;
    })

    winAppeared(function (){
        reload && getOrder();
    })
}

function getOrder(){
    showLoading();
    get('order/' + id, {}, function (res){
        if (res.status === 'error') {
            return msg(res.msg);
        } else if (res.status === 'success') {
            render(res.data);
        }
    })
}

function render(data){
    var timeRemain = getExpiredTime(data.inRepaymentTime);
    data.countDown = timeRemain.totalSeconds > 0 ? timeRemain.text : '0天';
    var tpl = doT.template($('#tpl').html());
    var html = tpl(data);
    $('.order-page').html(html);
    bindActions();
    if (data.status == 3) {
        countDown(data.inRepaymentTime);
    }
}

function bindActions(){
    tap($('.submit-btn button'), function (){
        api.openWin({
            name: 'renew',
            url: '../renew/renew.html',
            pageParam: {
                id: id
            }
        })
    })

    $('.icloud-box').each(function (){
        var username = $(this).find('.username').html();
        var password = $(this).find('.password').html();

        tap($(this).find('.copy-username'), function (){
            copyToPasteBoard(username, function (){
                toast('复制成功');
            });
        })

        tap($(this).find('.copy-password'), function (){
            copyToPasteBoard(password, function (){
                toast('复制成功');
            });
        })
    })

    tap($('.guide'), function (){
        var id = $(this).attr('data-id');
        api.openWin({
            name: 'agreement',
            url: '../../agreement/agreement.html',
            pageParam: {
                id: id,
                title: '操作详情'
            }
        });
    })

    api.parseTapmode();
}

function getExpiredTime(date){
    var date = date.replace(/-/g, '/');
    var time = new Date(date);
    var now = new Date();
    var difference = time - now;
    var totalSeconds = difference;

    var days = Math.floor(difference / 86400000);
    difference -= days * 86400000;
    var hours = Math.floor(difference / 3600000);
    difference -= hours * 3600000;
    var minutes = Math.floor(difference / 60000);
    difference -= minutes * 60000;
    var seconds = Math.floor(difference / 1000);

    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    return {
        text: days + '天' + hours + '时' + minutes + '分' + seconds + '秒',
        totalSeconds: totalSeconds
    };
}

function countDown(date){
    timer = setInterval(function (){
        var timeRemain = getExpiredTime(date);
        if (timeRemain.totalSeconds <= 0) {
            clearInterval(timer);
            setTimeout(getOrder, 1000);
        } else {
            $('.renew .text-danger').html(timeRemain.text);
        }
    }, 1000)
}

function statusIn(status, arr){
    if (typeof(arr) === 'string') {
        return status == arr;
    }

    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == status) {
            return true;
        }
    }

    return false;
}
