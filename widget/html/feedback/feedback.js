apiready = function() {
    $('.menu-group .item').each(function (){
        this.onclick = function(){
            $(this).addClass('active').siblings().removeClass('active');
            $('input[name=type]').val($(this).attr('data-value'));
        }
    })

    $('textarea[name=content]').bind('input propertychange', function (){
        var value = $(this).val();
        var maxLength = 200;

        if (value.length > maxLength) {
            value = value.substr(0, maxLength);
            $(this).val(value);
        }

        $('#content .tips span').get(0).innerHTML = value.length;
    });

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
                btn.before('<div class="item"><p><img src="' + ret.base64Data + '" tapmode /></p></div>');
                setImgLength();
                bindRemoveImg();
            }
        });
    });

    tap($('.submit-btn button'), function (){
        var data = checkForm();

        if (!data) {
            return false;
        }

        data.type = parseInt(data.type);
        data.image = getImages();
        showLoading();

        post('feedback/submit', data, function (res) {
            if (res.status === 'error') {
                toast(res.msg);
            } else if (res.status === 'success') {
                toast(res.msg, function() {
                    api.closeWin();
                });
            }
        });
    });
}

function bindRemoveImg(){
    $('.image-box img').each(function (){
        tap($(this), function (){
            var img = $(this);
            confirmMsg('确认删除该图片吗？', function (){
                img.parent().parent().remove();
                setImgLength();
            });
        });
    })

    api.parseTapmode();
}

function setImgLength(){
    var length = $('.image-box .item img').length;
    $('.image-box .tips span').get(0).innerHTML = length;

    if (length >= 5) {
        $('.upload-btn').hide();
    } else {
        $('.upload-btn').show();
    }
}

function getImages(){
    var images = [];

    $('.image-box .item img').each(function (){
        images.push($(this).attr('src'));
    })

    return images;
}
