getConfig();
function getConfig() {
    var url = location.host;
    $.ajax({
        type: "GET",
        url: "/producerpro/getwexiLoginPara?url="+url,
        timeout:60000,
        success: function(data){
            var data = data.result;
            wx.config({
                debug: true,
                appId: data.appid,
                timestamp: data.timestamp,
                nonceStr: data.nonceStr,
                signature: data.signature,
                jsApiList: [
                    'checkJsApi',
                    'onMenuShareTimeline',
                    'onMenuShareAppMessage',
                    'onMenuShareQQ',
                    'onMenuShareWeibo',
                    'onMenuShareQZone',
                    'hideMenuItems',
                    'showMenuItems',
                    'hideAllNonBaseMenuItem',
                    'showAllNonBaseMenuItem',
                    'translateVoice',
                    'startRecord',
                    'stopRecord',
                    'onVoiceRecordEnd',
                    'playVoice',
                    'onVoicePlayEnd',
                    'pauseVoice',
                    'stopVoice',
                    'uploadVoice',
                    'downloadVoice',
                    'chooseImage',
                    'previewImage',
                    'uploadImage',
                    'downloadImage',
                    'getNetworkType',
                    'openLocation',
                    'getLocation',
                    'hideOptionMenu',
                    'showOptionMenu',
                    'closeWindow',
                    'scanQRCode',
                    'chooseWXPay',
                    'openProductSpecificView',
                    'addCard',
                    'chooseCard',
                    'openCard'
                ]
            });
            wx.error(function(res){
                $.ajax({
                    type: "GET",
                    url:"/producerpro/getwexiLoginPara?url="+url+"&nocache="+true,
                    timeout:60000,
                    success:function(data){
                        var  data = data.result;
                        wx.config({
                            debug: false,
                            appId: data.appid,
                            timestamp: data.timestamp,
                            nonceStr: data.nonceStr,
                            signature: data.signature,
                            jsApiList: [
                                'checkJsApi',
                                'onMenuShareTimeline',
                                'onMenuShareAppMessage',
                                'onMenuShareQQ',
                                'onMenuShareWeibo',
                                'onMenuShareQZone',
                                'hideMenuItems',
                                'showMenuItems',
                                'hideAllNonBaseMenuItem',
                                'showAllNonBaseMenuItem',
                                'translateVoice',
                                'startRecord',
                                'stopRecord',
                                'onVoiceRecordEnd',
                                'playVoice',
                                'onVoicePlayEnd',
                                'pauseVoice',
                                'stopVoice',
                                'uploadVoice',
                                'downloadVoice',
                                'chooseImage',
                                'previewImage',
                                'uploadImage',
                                'downloadImage',
                                'getNetworkType',
                                'openLocation',
                                'getLocation',
                                'hideOptionMenu',
                                'showOptionMenu',
                                'closeWindow',
                                'scanQRCode',
                                'chooseWXPay',
                                'openProductSpecificView',
                                'addCard',
                                'chooseCard',
                                'openCard'
                            ]
                        });
                        wx.error(function(res){
                            console.log(res);
                        });
                    }
                })
            })
        }
    })
};
wx.ready(function() { 
     wx.onMenuShareAppMessage({
        title: 'TVU云导播，邀请码注册立减',
        desc: "",
        // link: 'http://pushlive.tvunetworks.cn/#/cardTemplate?token='+_this.token+'&roomId='+_this.roomID,
        link: location.href,
        imgUrl: location.host+ '/producerpro/images/balloon.png',
        trigger: function (res) {
        // 不要尝试在trigger中使用ajax异步请求修改本次分享的内容，因为客户端分享操作是一个同步操作，这时候使用ajax的回调还没有返回
        },
        success: function (res) {
            
        },
        cancel: function (res) {
        },
        fail: function (res) {
            console.log(JSON.stringify(res));
        }
    });
    wx.onMenuShareTimeline({
        title: 'TVU云导播，邀请码注册立减',
        desc: "",
        link: location.href,
        imgUrl: location.host+ '/producerpro/images/balloon.png',
        trigger: function (res) {
        // 不要尝试在trigger中使用ajax异步请求修改本次分享的内容，因为客户端分享操作是一个同步操作，这时候使用ajax的回调还没有返回
        },
        success: function (res) {
            
        },
        cancel: function (res) {
        },
        fail: function (res) {
            console.log(JSON.stringify(res));
        }
    });
});
    