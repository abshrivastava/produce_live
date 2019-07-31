var CONFIG = (function($){
    var CONFIG = null;
    function getCheckConfig(){
        var sessionId = localStorage.getItem("session");
        var checkConfigUrl = "/producerpro/checkConfig?session="+sessionId;
        $.ajax({
            type: "POST",
            url:checkConfigUrl,
            async: false,
            success: function(data){
                data = JSON.parse(data);
                if(data.activeInstance != 3){
                    alert("please open system !")
                }
                if (!data.userBehavior) { //没有用户行为记录
                    if (data.studioRListArr == "") return; //新账号没有设备
                    data.rid = data.studioRListArr[0].peerId;
                } else { //有用户行为记录
                    var userBehavior = JSON.parse(decodeURIComponent(data.userBehavior));
                    data.rid = userBehavior.SelectR.peerId;
                }
                CONFIG = data;
                var params ={
                    sendaudio:false,
                    sendvideo:false,
                    recvaudio:true,
                    recvvideo:true,
                    caller:null,
                    callee:null
                };
                params.mediaConstraints = {
                    audio: params.sendaudio,
                    video: params.sendvideo
                };
                var behavior = JSON.parse(decodeURIComponent(data.userBehavior));
                // signalingUrl = behavior.SelectR.rIp+":9001"
                window.rtcclient = new RtcClient(params,data.signalingUrl);
            }
        });
    }
    getCheckConfig();
    pageWebsocketObj.init(CONFIG.rid);
    volumeControlObj.init(CONFIG.rid);
    return CONFIG;
})($);


