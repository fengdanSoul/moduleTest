// import { runMain } from "module";


// 淘宝认证
function taobaoVerify(callback) {

    switch (os) {
        case 'ios':
            var xyUser = api.loadSecureValue({
                sync: true,
                key: 'kUser'
            });
            var xyKey = api.loadSecureValue({
                sync: true,
                key: 'kKey'
            });
            var xyTerminalId = api.loadSecureValue({
                sync: true,
                key: 'xyTerminalId'
            });
            var crawlerModule = api.require('XYCrawlerIOS');

            // toast(xyUser);
            // toast(crawlerModule);

            crawlerModule.xyStartFunction({
                xyUser:xyUser,
                xyKey:xyKey,
                xyTerminalId:xyTerminalId,
                taskId: (new Date()).valueOf(),
                xyFunction: 0
            }, function (ret, err) {
                console.log('iOS淘宝:::::: ' + JSON.stringify(ret));
                callback && callback(ret.code, ret.token);
            });
            break;
        case 'android':
            authInfoModule.operatorCertification({
            	"type": "taobao",
            	"taskId": (new Date()).valueOf(),
            	"phoneNum": "14789987547",
            	"realname": "Hello carrier!",
            	"idcard": "610427199601011611",
            	"phoneServerCode": "123456",
            	"carrierCanInput": "NO"
            }, function(ret, err){
                console.log('Android淘宝:::::: ' + JSON.stringify(ret));
                callback && callback(ret.code, ret.token);
            });
            break;
    }
}
function getMyTime() {
    var time = new Date();
    var y = time.getFullYear();//年
    var m = (time.getMonth() + 1) < 10 ? '0' + (time.getMonth() + 1) : (time.getMonth() + 1);//月
    var d = time.getDate() < 10 ? "0" + time.getDate() : time.getDate();//日
    var hh = time.getHours() < 10 ? "0" + time.getHours() : time.getHours();//时
    var mm = time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes();//分
    var ss = time.getSeconds() < 10 ? "0" + time.getSeconds() : time.getSeconds();//秒
    return y + m + d + hh + mm + ss;
}
// 运营商认证
function carrierVerify(callback) {
    var user = getUserCache();
    var xyUser = api.loadSecureValue({
        sync: true,
        key: 'kUser'
    });
    var xyKey = api.loadSecureValue({
        sync: true,
        key: 'kKey'
    });
    var xyTerminalId = api.loadSecureValue({
        sync: true,
        key: 'xyTerminalId'
    });
    var crawlerModule = api.require('XYCrawlerIOS');

    switch (os) {

        case 'ios':
            crawlerModule.xyStartFunctionCarrier({
                xyUser:xyUser,
                xyKey:xyKey,
                xyTerminalId:xyTerminalId,
                xyTaskId:  (new Date()).valueOf(),
                xyFunction: 3,
                mobile:user.phone,
                realName:user.realName,
                idCard:user.cardNo,
                password:"",
                showIdNameInput: true,
                inputEditing: false
            }, function (ret, err) {
                console.log('iOS运营商:::::: ' + JSON.stringify(ret));
                callback && callback(ret.code, ret.token);
            })
            break;
        case 'android':
            authInfoModule.operatorCertification({
            	"type": 'carrier',
            	"taskId": (new Date()).valueOf(),
            	"phoneNum": user.phone,
            	"realname": user.realName,
            	"idcard": user.cardNo,
            	"phoneServerCode": '610627',
            	"carrierCanInput": 'NO',
                "carrierIDandNameShow": 'YES'
            }, function(ret, err){
                console.log('Android运营商:::::: ' + JSON.stringify(ret));
                callback && callback(ret.code, ret.token);
            });
            break;
        default:
    }
}

// 有盾人脸识别认证
function runFaceAuth(callback) {
    var orderId = ((new Date()).valueOf()).toString();

    var authKey = api.loadSecureValue({
        sync: true,
        key: 'authKey'
    });

    var youDun = api.require('UDYhy');
    console.log(orderId);
    
    youDun.faceAuth({
        authKey: authKey,
        outOrderId: orderId,
    }, function(ret, err) {
        setStatusBarLight();
        console.log(JSON.stringify(ret));
        if (err) {
            return;
        }
        
        if (ret.ret_code === '000000') {
            if (ret.result_auth === 'T') {
                callback && callback(ret);
            } else {
                toast('认证失败');
            }
        } else {
            toast(ret.ret_msg);
        }
    });
}
