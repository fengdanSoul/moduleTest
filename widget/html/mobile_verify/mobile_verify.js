apiready = function() {
    var model = api.deviceModel;

    $('.guide').each(function (){
        tap($(this), function (){
            var id = $(this).attr('data-id');
            api.openWin({
                name: 'agreement',
                url: '../agreement/agreement.html',
                pageParam: {
                    id: id,
                    title: '操作详情'
                }
            });
        })
    })

    tap($('.upload-btn'), function (){
        var btn = $(this);
        api.getPicture({
            sourceType: 'album',
            encodingType: 'jpg',
            mediaValue: 'pic',
            destinationType: 'base64',
            allowEdit: false,
            quality: 50,
            targetWidth: 640,
            saveToPhotoAlbum: false
        }, function(ret, err){
            if (ret) {
                btn.find('.item').remove();
                btn.before('<div class="item"><p><img src="' + ret.base64Data + '" tapmode /></p></div>');
                $('input[name=image]').val(ret.base64Data);
                setImgLength();
                bindRemoveImg();
            }
        });
    });

    tap($('.submit-btn button'), function (){
        var data = checkForm();

        if (!data) {
            return;
        }

        data.model = model;
        showLoading();

        post('auth/apple', data, function (res){
            closeLoading();
            if (res.status === 'error') {
                toast(res.msg);
            } else if (res.status === 'success') {
                toast(res.msg, function (){
                    api.closeWin();
                });
            }
        });
    });
}

function setImgLength(){
    var length = $('.image-box .item img').length;

    if (length >= 1) {
        $('.upload-btn').hide();
    } else {
        $('.upload-btn').show();
    }
}

function bindRemoveImg(){
    $('.image-box img').each(function (){
        tap($(this), function (){
            var img = $(this);
            confirmMsg('确认删除该图片吗？', function (){
                img.parent().parent().remove();
                $('input[name=image]').val('');
                setImgLength();
            });
        });
    })

    api.parseTapmode();
}
