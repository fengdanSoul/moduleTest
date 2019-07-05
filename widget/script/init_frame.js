function openFrame(frameUrl) {
    var bounces = frameUrl === 'frm_login.html' ? false : true;
    var param = {
        name: frameUrl,
        url: frameUrl,
        bounces: bounces,
        rect: {
            marginTop: headerH,
            w: 'auto'
        }
    };

    var pageParam = arguments[1];

    if (pageParam) {
        param.pageParam = pageParam;
    }

    api.openFrame(param);
}

apiready = function() {
    api.setStatusBarStyle({
        style: 'dark'
    });

    var frameUrl = 'frm_' + api.winName + '.html'
    var header = $api.dom('header');
    headerH = $api.fixStatusBar(header);

    tap($('.page-back'), function () {
        api.closeWin();
    });

    openFrame(frameUrl, api.pageParam);

    if (typeof(pageReady) === 'function') {
        pageReady && pageReady();
    }
}
