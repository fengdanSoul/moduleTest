// 返回订单状态
function orderStatus(status){
    var result = {}
    switch (status) {
        case 0:
            result.text = '审核中';
            result.style = 'text-danger';
            break;
        case 1:
            result.text = '审核通过';
            result.style = 'text-danger';
            break;
        case 2:
            result.text = '审核失败';
            result.style = 'text-danger';
            break;
        case 3:
            result.text = '已打款';
            result.style = 'text-danger';
            break;
        case 4:
            result.text = '已回收';
            result.style = 'text-success';
            break;
        case 5:
            result.text = '已逾期';
            result.style = 'text-danger';
            break;
        case 6:
            result.text = '已作废';
            result.style = 'text-danger';
            break;
        default:
    }

    return result;
}

// 删除订单
function destroy(id){
    var callback = arguments[1];

    confirmMsg('确认删除该订单吗？', function (){
        showLoading();
        post('order/delete/' + id, {}, function (res){
            closeLoading();
            if (res.status === 'error') {
                toast(res.msg);
            } else if(res.status === 'success') {
                toast(res.msg, function (){
                    callback && callback();
                });
            }
        })
    })
}
