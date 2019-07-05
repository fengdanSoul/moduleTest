apiready = function() {
    var top = api.safeArea.top;
    var footer = $api.dom('footer');
    var footerH = $api.fixTabBar(footer);
    var headerH = parseInt($('header').css('height'));
    var marginTop = top + headerH;

    cache('marginTop', marginTop);
    $('header').css('paddingTop', top + 'px');

    function openPage(nav) {
        var id = nav.attr('id');

        api.openFrame({
            name: id,
            url: nav.attr('data-page'),
            bounces: true,
            rect: {
                marginTop: marginTop,
                marginBottom: footerH,
                w: 'auto'
            }
        });

        sendEvent('rootPageTab', id);
    }

    function closePage(nav) {
        api.closeFrame({
            name: nav.attr('id')
        });
    }

    $('footer li').each(function(e) {
        if (e === 0) {
            openPage($(this));
        }

        $(this).get(0).onclick = function() {
            if ($(this).hasClass('active')) {
                return;
            }

            $('.page-back').toggleClass('hide');
            $(this).addClass('active');
            $(this).siblings().removeClass('active');
            $('header').removeClass().addClass($(this).attr('id'));
            $('header').find('span').html($(this).attr('data-text'));

            openPage($(this));

            $(this).siblings().each(function() {
              //closePage($(this));
            })
        }
    })

    // 返回
    if ($('.page-back').length > 0) {
        $('.page-back').get(0).onclick = function() {
            openPage($('footer li:first-child'));
            closePage($('footer li:last-child'));
            $('.page-back').addClass('hide');
            $('header span').html($('#home').attr('data-text'));
            $('header').removeClass().addClass($('footer li:first-child').attr('id'));
            $('footer li:first-child').addClass('active');
            $('footer li:last-child').removeClass('active');
        }
    }
};
