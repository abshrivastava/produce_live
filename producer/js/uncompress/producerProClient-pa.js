var peerClientStatusArr = {
    isWebRTCDisconnect:false,//为了避免R的状态不对造成断开连接
    previewList:false,//preview list 创建完成，然后去发请求获取叠加效果
    disconnectNum:0,//表示失去几个视频
    ipsourceFileName:"",//便是ipsource 创建完成，此时才可以删除文件
    clearDisconnectPrompt:false,
    previewListNum:0,//表示previewlist 中有几个视频
    videoResetNumObj:{},
    videoResetNumObjTime:undefined,
    backData:{},
    // rtcStatStamp:{},
    googTargetDelayMs:{},
    userNotExists:[],
    resetVideoList:[],
    dataArray:{},
}
//consts
var CONSTANTS = {
    logIn: 'login',
    logOut: 'logout',
    callRequest: 'call_request',
    callResponse: 'call_response',
    disconnectPeer: 'disconnectpeer',
    peerAnswer: 'answer',
    peerOffer: 'offer',
    peerIce: 'ice',
    userAdd: 'useradd',
    userDel: 'userdel',
    addCall: 'addcall',
    deleteCall: 'deletecall',
    callStatus: 'status',
    updateAddSessions:'AddSessions',
    updateDelSessions:'DelSessions',
    RTT:'RTT'
};

var STATUS = {
    SUCCESS:1,
    FAILED:2,
    REQUST:3,
    RESPONSE:4,
    DIALING:5,
    ENDED:6,
    RETRY:7
};

var offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 0,
    voiceActivityDetection: false
};

var iceUrl = {
    "iceServers":[{
        "urls": "turn:rtcturn.tvunetworks.com:13478",
        "username": "tvu",
        "credential": "tvu"
        },{
        "urls": "stun:stun.l.google.com:19302"
        },{
        "urls":"stun:stun.sipgate.net"
        }]
};
var videoDom = {
    input :  $("#preview"),
    output : $(".main-output .output-source .big-video")
};
// var startTime = 0;
// var endTime = 0;
// var errorElement = document.querySelector('#errorMsg');
// var userElement = document.querySelector('#userlist');
var Signaling = function () {
    // wssUrl = 'http://rtc.tvunetworks.com:9001/';
    // var sock = new io('http://rtc.tvunetworks.com:9001/');
    var sock = new io(signalingUrl);
    // var sock = new io('http://rtc.tvunetworks.com:9001/');
    this.sock = sock;

    this.send = function (type, msg) {
        sock.emit(type, msg);
    };

    this.on = function(type, callback) {
        sock.on(type, callback );
    };
};
var replayTimer = "",setimeout=200,dataArray;
function setChannelEvents(channel,channelTag,peerName_,pc) {
    channel.onmessage = function (event) {
        var eventData = JSON.parse(event.data);
        var id = $(".preview-source .main-player").attr("id");
        if(id == peerName_&&eventData["replay_status"]){
            var bytes = base64js.toByteArray(eventData["replay_status"]);
            var index = 4;
            var status = bytes[index];
            var position = Read24n8(bytes,index+1);
            var pts = Read24n8(bytes,index+7);
            var duration = Read24n8(bytes,index+13);
            if(status==128||status==129){
                status = true;
            }else{
                status = false;
            }
            var data = {
                replayPosition:position,
                replayDuration:duration,
                replayStatus:status,
            }
            setimeout = duration - position;
            clipDot.createStatusOverdue(data);
            clearTimeout(replayTimer);
            replayTimer = setTimeout(function(){
                console.log("执行了init replay");
                var data = {
                    replayPosition:0,
                    replayDuration:0,
                    replayStatus:false,
                }
                clipDot.createStatusOverdue(data);
            },setimeout);
        }
        // if($(".clockDiv").attr("data-operation")=="start"){
        //     var aaaa=Math.floor((eventData["ts"]-clockObj.clockTimeStamp)/1000);
        //     console.log(aaaa);
        // }
        
        // if(id == peerName_){
        //     getStats(pc,function(data){
        //         //获取video id
        //         var id = "";
        //         if(data.video.recv["tracks"]&&data.video.recv["tracks"][0]){
        //             id = data.video.recv["tracks"][0].substring(6);
        //             for(var i=0;i<data["results"].length;i++){
        //                 var result = JSON.stringify(data["results"][i]);
        //                 if(result.indexOf("googTargetDelayMs")!==-1){
        //                     $(".preview-source .big-video .timeStamp").html(eventData["ts"]+","+data["results"][i]["googTargetDelayMs"]);
        //                     break; 
        //                 } 
        //             }
        //         }  
        //     });
        // }
        // $(".big-video .timeStamp").html(eventData["ts"]+","+peerClientStatusArr.googTargetDelayMs[peerName_]);
        getStats(pc,function(data){
            //获取video id
            // console.log(JSON.stringify(data));
            var id = "";
            if(data.video.recv["tracks"]&&data.video.recv["tracks"][0]){
                id = data.video.recv["tracks"][0].substring(6);
                for(var i=0;i<data["results"].length;i++){
                    var result = JSON.stringify(data["results"][i]);
                    if(result.indexOf("googTargetDelayMs")!==-1){
                        // peerClientStatusArr.rtcStatStamp[id] = eventData["ts"]-data["results"][i]["googTargetDelayMs"];
                        peerClientStatusArr.backData[id] = {};
                        peerClientStatusArr.backData[id].delayMST = data["results"][i]["googTargetDelayMs"]||0;
                        peerClientStatusArr.backData[id].delayMSC = data["results"][i]["googCurrentDelayMs"]||0;
                        peerClientStatusArr.backData[id].frameRate = data["results"][i]["googFrameRateReceived"]||24;
                        break; 
                    } 
                }
            }
            // getStatsBack(data);  
        });
        var obj = JSON.parse(event.data);
        if(!peerClientStatusArr.dataArray[peerName_]){
            peerClientStatusArr.dataArray[peerName_] =[]; 
        }
        if($("#preview .main-player").attr("id")==peerName_){
            console.log(event);
        }
        if (peerClientStatusArr.dataArray[peerName_].length == 0){
            peerClientStatusArr.dataArray[peerName_].push({pts: obj.ts, curDelay: peerClientStatusArr.backData[peerName_].delayMSC, rt: Date.now(),fps:peerClientStatusArr.backData[peerName_].frameRate,tarDelay: peerClientStatusArr.backData[peerName_].delayMST});
        } else if(obj.ts - peerClientStatusArr.dataArray[peerName_][0].pts < 3000) {
            peerClientStatusArr.dataArray[peerName_].push({pts: obj.ts, curDelay: peerClientStatusArr.backData[peerName_].delayMSC, rt: Date.now(),fps:peerClientStatusArr.backData[peerName_].frameRate,tarDelay: peerClientStatusArr.backData[peerName_].delayMST});
        } else {
            peerClientStatusArr.dataArray[peerName_].push({pts: obj.ts, curDelay: peerClientStatusArr.backData[peerName_].delayMSC, rt: Date.now(), fps:peerClientStatusArr.backData[peerName_].frameRate,tarDelay: peerClientStatusArr.backData[peerName_].delayMST});
            peerClientStatusArr.dataArray[peerName_].shift();
        }
    };
    channel.onopen = function () {
        channel.send(channelTag+':first text message over RTP data ports=====');
    };
    channel.onclose = function (e) {
        console.error(channelTag, e);
    };
    channel.onerror = function (e) {
        console.error(channelTag, e);
    };
};

function Read24n8(array, dataOffset) {
    var num2 = array[dataOffset];
    var num1 = array[dataOffset+1];
    var num0 = array[dataOffset+3];
    var num3 = array[dataOffset+4];
    return num0 | num1 << 8 | num2 << 16 | num3 << 24;
}
var PeerClient = function (params) {
    this.type_ = params.type;
    this.peerName_ = params.name;
    this.peerRtt = 0;
    this.timerIceRestart = {};
    this.offerOptions_ = params.offerOptions;
    this.serverUrl_ = params.serverUrl;
    this.sendSignalingMessage = params.signaling;
    this.localStream = params.stream;
    this.audioRecvBitrate = params.audioRecvBitrate;
    this.canAddICE = false;

    this.pc = new RTCPeerConnection(this.serverUrl_);
    this.pc.onicecandidate = this.onIceCandidate.bind(this);
    this.pc.onaddstream = this.onRemoteStreamAdded.bind(this);
    this.pc.onremovestream = console.log.bind(null, 'Remote stream removed.');
    if (this.localStream) {
        this.pc.addStream(this.localStream);
    };
    var that = this;
    this.pc.ondatachannel = function (event) {
        this.fromPeerChannel = event.channel;
        //this.fromPeerChannel.binaryType = 'blob';
        setChannelEvents(this.fromPeerChannel,"frompeer",that.peerName_,that.pc);
        this.fromPeerChannel.send("=== nice to meet you");
    };
    this.toPeerChannel = this.pc.createDataChannel('WorldChannel', null);
    setChannelEvents(this.toPeerChannel,'topeer',this.peerName_,this.pc);

    this.pc.onsignalingstatechange = this.onSignalingStateChanged.bind(this);
    this.pc.oniceconnectionstatechange = this.onIceConnectionStateChanged.bind(this);
   if (this.type_ == CONSTANTS.peerOffer) {
        this.createOffer();
   } else {
        this.setRemoteSDP(params.offer);
   };
};

PeerClient.prototype.updateCallStaus = function(s, err) {
    var msg = {};
    msg.type = CONSTANTS.callStatus;
    var status = {
        peername:this.peerName_,
        status:s,
        msg:err
    };
    msg.content = JSON.stringify(status);

    this.sendSignalingMessage(msg);
};

PeerClient.prototype.onSetRemoteSDP = function() {

    this.canAddICE = true;
    this.pc.createAnswer()
    .then(this.getLocalDescription.bind(this))
    .catch(this.onSetSessionDescriptionError.bind(this));
};
PeerClient.prototype.setRemoteSDP = function(offer) {
    this.pc.setRemoteDescription(new RTCSessionDescription(offer))
    .then((stream)=>{
        stream.getTracks().forEach(track => this.pc.addTrack(track, stream));
        this.onSetRemoteSDP.bind(this)
    })
    .catch(this.onSetSessionDescriptionError.bind(this));
};

PeerClient.prototype.createOffer = function(res) {
    // console.log(this.offerOptions_);
    if (res) {
        this.offerOptions_.iceRestart = true;
    };
    this.pc.createOffer(this.offerOptions_)
    .then(this.getLocalDescription.bind(this))
    .catch(this.onSetSessionDescriptionError.bind(this));
};

PeerClient.prototype.onSetLocalSDPSuccess = function(desc) {
    var sdp = {};
    sdp.to = this.peerName_;
    sdp.sdp = desc.sdp;
    sdp.type = desc.type

    var msg = {};
    if (sdp.type == 'answer') {
        msg.type = CONSTANTS.peerAnswer;
    } else {
        msg.type = CONSTANTS.peerOffer;
    };
    msg.content = JSON.stringify(sdp);
    this.sendSignalingMessage(msg);
    this.updateCallStaus(STATUS.DIALING);
    // console.info('send sdp to: ' + this.peerName_ + msg.content);
};

function updateBandwidthRestriction(sdp, bandwidth) {
    if (sdp.indexOf('b=AS:') === -1) {
        // insert b=AS after c= line.
        sdp = sdp.replace(/c=IN IP4 (.*)\r\n/,
                          'c=IN IP4 $1\r\nb=AS:' + bandwidth + '\r\n');
    } else {
        sdp = sdp.replace(/b=AS:(.*)\r\n/, 'b=AS:' + bandwidth + '\r\n');
    }
    return sdp;
};

function getOpusPayloadType(sdpLine) {
    var pattern = new RegExp('a=rtpmap:(\\d+) opus\\/\\d+');
    var result = sdpLine.match(pattern);
    return (result && result.length === 2) ? result[1] : null;
};

function setOpusParam(sdpLine, pt) {
    var re = "/(a=fmtp: "+ pt + ") (.*)\\r\\n/"; 
    var sdp = sdpLine.replace(re, '$1 $2;stereo=1;maxaveragebitrate=256000\r\n');
    // console.log('sdp: ' + sdpLine + '\r\npt: ' + pt + '\r\n' + sdp);
    return sdp;
};

PeerClient.prototype.getLocalDescription = function(desc) {
    //desc.sdp = desc.sdp.replace("minptime=10", "minptime=10; maxaveragebitrate=200000");
    var pt = getOpusPayloadType(desc.sdp);
    if (pt != null) {
        desc.sdp = setOpusParam(desc.sdp, pt);
    };
    //desc.sdp = updateBandwidthRestriction(desc.sdp, 256);
    this.pc.setLocalDescription(desc)
    .then(this.onSetLocalSDPSuccess.bind(this, desc))
    .catch(this.onSetSessionDescriptionError.bind(this));
};

PeerClient.prototype.onSetSessionDescriptionError = function(error) {
    oUtils.alertTips("i18n_webRTCSeverError");
    console.error('Failed to set session description: ' + error.toString());
    this.updateCallStaus(STATUS.RETRY, err);
};

PeerClient.prototype.onSignalingStateChanged = function(event) {
    // console.log(this.peerName_ + ": ice signaling state: " + this.pc.signalingState );
};
// PeerClient.prototype.getStats = function() {
//     this.pc.getStats().then(function(stats){
//         var result = {};
//         stats.forEach(stat => {
//             if (stat.type == "track" && stat.kind == "video") {
//                 result = stat;
//             }
//             // more
//         });
//         peerClientStatusArr.rtcStatStamp[result["trackIdentifier"].substring(6)] = result["timestamp"];
//         // console.log(peerClientStatusArr.rtcStatStamp.stats["trackIdentifier"]);
//         if (result["video-stats"] == undefined)
//            return;
        
//     });
// };
PeerClient.prototype.onIceConnectionStateChanged = function(event) {
    // console.log(this.peerName_ + ": ice connection state: " + this.pc.iceConnectionState);
    if (this.pc.iceConnectionState == 'connected') {
        this.updateCallStaus(STATUS.SUCCESS);
        // this.getStats();
        // clearInterval(this.timerStats);
        // this.timerStats = setInterval(this.getStats.bind(this), 5);
        // console.log("create timerStats:" + this.timerStats)
    };
    // console.log(this.pc.iceConnectionState);
    if (this.pc.iceConnectionState == 'failed') {
        errorMsg({name:this.peerName_, message:"Ice connection " + this.pc.iceConnectionState});
        this.logIn = false;

        if (typeof(window.rtcclient) != 'undefined' && !isEmptyObject(window.rtcclient.call_)) {
            var disconnect = {
                from:this.peerName_,
                ack:false
            };
            window.rtcclient.call_.stopPeer(JSON.stringify(disconnect));
            this.updateCallStaus(STATUS.RETRY);
            
            //清除原先的video标签
            /*$("#showRVideo-previewModule .previewModule-video").html("");
            $("#showRVideo-liveOutputModule .previewModule-video").html("");
            $(".preview-list .list-content").html("");  */ 
        };
    };

};
PeerClient.prototype.deleteAudio = function (name) {
    this.updateCallStaus(STATUS.ENDED);
};
PeerClient.prototype.onaddtrack = function(event){
    console.log(event);
};
PeerClient.prototype.onRemoteStreamAdded = function(event) { //成功创建连接，获取到视频
    var name = this.peerName_;
    console.log(name+"success");
    // var x = new RTCRtpReceiver(event.stream.getVideoTracks()[0],"video");
    // this.pc.addTrack(event.stream.getVideoTracks()[0],event.stream);
    
    // event.stream.getTracks().forEach(track =>this.pc.addTrack(track, event.stream));
    // // setTimeout(function(){
    //     console.log(that.pc.getReceivers()[1].getContributingSources());
    // // },11000);
    // this.pc.getPeerStats(function(data) {
    //     //获取video id
    //     var id = "";
    //     if(data.video.recv["tracks"]&&data.video.recv["tracks"][0]){
    //         id = data.video.recv["tracks"][0].substring(6);
    //         if(data["results"].length>=25){
    //             peerClientStatusArr.googTargetDelayMs[id] = data["results"][25]["googTargetDelayMs"];
    //             // console.log(data["results"][25]);
    //         }
    //     }  
    // }, 1000);
    if(currentRInfo.rtcIdList.pvw.indexOf(name)>-1||currentRInfo.rtcIdList.pgm.id.indexOf(name)>-1){
        var div ='<video  autoplay playsinline class="left main-player" id="'+name+'"></video><div class="timeStamp"></div>';
        var videoBox = null;
        if(currentRInfo.rtcIdList.pvw.indexOf(name)>-1){
            videoBox = videoDom.input;
        }else{
            videoBox = videoDom.output;
        }
        videoBox.html(div);
        videoBox.find("video")[0].srcObject = event.stream;
		videoBox.find("video")[0].play();        
        var volumeHtml = '<div class="left audio">\
                            <div class="row left">\
                                <div class="bg">\
                                    <div class="back container">\
                                        <div class="active"></div>\
                                    </div>\
                                </div>\
                            </div>\
                            <div class="row right">\
                                <div class="bg">\
                                    <div class="back container">\
                                        <div class="active"></div>\
                                    </div>\
                                </div>\
                            </div>\
                        </div>';
        videoBox.parent().append(volumeHtml);
        if(currentRInfo.rtcIdList.pvw.indexOf(name)>-1){
            if($(".apply-preview .radius-box").hasClass('shut'))$(".main-preview .audio").css("display","none");
            videoBox.find("video")[0].volume = 0;
            videoBox.find("video")[0].muted = true;
            // $(".preview-voice .voice-control-mark").attr("data-value",0);
            // $(".preview-voice .voice-control-slider").slider("value",0);
            // $(".preview-voice .voice-control-slider").find(".voice-value").html(0);
            currentRInfo.rtcIdList.pvw = [];
            /*if(currentRInfo.outputPreview){
                videoBox = videoDom.output;
                var pgmVideo ='<video  autoplay playsinline class="left main-player"></video>';
                var pgmData = currentRInfo.rtcIdList.pgm.data;
                $(".main-output").attr("data-filename",pgmData["CurrentEncoderSharedMemory"]["SharedMemoryName"]);
                if(pgmData["CurrentPIPList"]!==null&&pgmData["CurrentPIPList"].length>0){
                    $(".main-output").attr("data-pipfilename",pgmData["CurrentPIPList"][0]["id"]);
                }
                videoBox.html(pgmVideo);
                videoBox.parent().append(volumeHtml);
            }*/

        }else{
            var pgmData = currentRInfo.rtcIdList.pgm.data;
            $(".main-output").attr("data-filename",pgmData["CurrentEncoderSharedMemory"]["SharedMemoryName"]);
            if(pgmData["CurrentPIPList"]!==null&&pgmData["CurrentPIPList"].length>0){
                $(".main-output").attr("data-pipfilename",pgmData["CurrentPIPList"][0]["id"]);
            }
            if($(".main-output .output-erphone .icon-erphone").hasClass("active")){
                videoBox.find("video")[0].volume = 1;
                videoBox.find("video")[0].muted = false;
            }else{
                videoBox.find("video")[0].volume = 0;
                videoBox.find("video")[0].muted = true;
            }
            currentRInfo.rtcIdList.pgm.id = [];
            currentRInfo.rtcIdList.pgm.data = null;
            // $(".output-voice .voice-control-mark").attr("data-value",0);
            // $(".output-voice .voice-control-slider").slider("value",0);
            // $(".output-voice .voice-control-slider").find(".voice-value").html(0);
        }
    }else if(peerClientStatusArr.resetVideoList.indexOf(name)>-1){
        var styleObj  = getVideoStyle(name);
        var videoObj = styleObj["videoObj"],style=styleObj["style"];
        var videoHtml = '<video autoplay '+style+' id='+name+'></video>';
        var videoParent = videoObj.parent();
        videoObj.replaceWith(videoHtml);
        videoObj = videoParent.find("video");
        videoObj[0].srcObject = event.stream;
        videoObj[0].volume = 0;
        peerClientStatusArr.disconnectNum = 0;
        if($("#preview .pip").length!==0&&$("#preview .pip").find("video").attr("data-videoid")==name){
            createPipVideo(name);
        }
        var index = peerClientStatusArr.resetVideoList.indexOf(name);
        if (index > -1) {
             peerClientStatusArr.resetVideoList.splice(index, 1);
        } 
    }else if(currentRInfo.rtcIdList.preLis.idArr.indexOf(name)>-1){
        var curItem = null,rid='',sourceTypeIcon='';
        currentRInfo.rtcIdList.preLis.data.forEach(function(v,i){
            if(v.PreviewID==name) curItem = v;
        });
        if(curItem.PreviewShm.R_ID){
            rid=curItem.PreviewShm.R_ID;
            rid = " data-rid="+rid;
        }
        if(curItem.PreviewShm.SharedMemoryName==="Default"){
            rid=curItem.PreviewID.substring(0,16); 
            rid = " data-rid="+rid;
        }
        var nameIndex = webrtcVideo.peerIds.indexOf(name);
        if(peerClientStatusArr.videoResetNumObj[name]){
            delete peerClientStatusArr.videoResetNumObj[name];
        }
        if(curItem.PreviewShm.SourceType==100){
            sourceTypeIcon = "icon-ext";
        }else if(curItem.PreviewShm.SourceType==200){
            peerClientStatusArr.ipsourceFileName = curItem.PreviewShm.FileName;
            //清除ip-del
            sourceTypeIcon = "icon-ip-source";
        }else {
            sourceTypeIcon = "icon-pack";
        }
        var previewListItem =   '<li class="preview-item" data-filename="'+curItem.PreviewShm.SharedMemoryName+'" '+rid+'>\
                                    <div  style="position:relative">\
                                        <video autoplay playsinline class="preview-item-video" id='+name+'></video>\
                                        <div class="slider-vertical voice-control"></div>\
                                        <div class="left audio">\
                                            <div class="row left">\
                                                <div class="bg">\
                                                    <div class="back container">\
                                                        <div class="active"></div>\
                                                    </div>\
                                                </div>\
                                            </div>\
                                            <div class="row right">\
                                                <div class="bg">\
                                                    <div class="back container">\
                                                        <div class="active"></div>\
                                                    </div>\
                                                </div>\
                                            </div>\
                                        </div>\
                                    </div>\
                                    <div class="preview-item-control clearFix">\
                                        <div class="item-control-setting left" >\
                                            <span class="iconfont '+sourceTypeIcon+' set-name left"></span>\
                                            <div class="edit-name left"><input type="text" style="display:none"><div class="show-name"></div></div>\
                                        </div>\
                                        <div class="item-control-voice erphone right">\
                                            <span class="iconfont icon-erphone"></span>\
                                            <span class="iconfont voice icon-novoice"></span>\
                                        </div>\
                                    </div>\
                                    <span class="preview-item-num"></span>\
                                    </li>';
        var previewUlEle = $(".sd-preview-list .preview-content");
        if(curItem.PreviewShm.SourceType==0||curItem.PreviewShm.SourceType==300){
            previewUlEle.prepend(previewListItem);
        }else{
            previewUlEle.append(previewListItem);
        }    
        var listWidth = previewUlEle.find(".preview-item").length*320-20+"px";
        previewUlEle.css("width",listWidth);
        $(".preview-list-container").fnNiceScroll("#444");
        $("#"+name)[0].srcObject = event.stream;
        $("#"+name)[0].muted = true;
        $("#"+name)[0].play();
        $("#"+name)[0].volume = 0;
        /*if(currentRInfo.outputPreview){
            var pgmFileName = $(".main-output").attr("data-filename");
            var pipFileName = $(".main-output").attr("data-pipfilename");
            if(pgmFileName == curItem.PreviewShm.SharedMemoryName){
                $(".main-output .main-player")[0].srcObject = $("#"+name)[0].srcObject;
            }
            if($(".main-output .output-erphone .icon-erphone").hasClass("active")){
                $(".main-output .main-player")[0].volume = 1;
                $(".main-output .main-player")[0].muted = false;
            }else{
                $(".main-output .main-player")[0].volume = 0;
                $(".main-output .main-player")[0].muted = true;
            }
        }*/
        var itemEles = previewUlEle.find(".preview-item"); //根据peerId将视频排序
        var eleRArr = [],eleOtherArr=[],mainR='';
        $.each(itemEles,function(idx,itm){
            var fileName = $(itm).attr("data-filename");
            if(fileName=="Default"){
                mainR = itm;
            }else if(fileName.indexOf("(R Shim)")>-1){
                eleRArr.push(itm)
            }else if(fileName.indexOf("(IP Shim)")>-1){
                eleOtherArr.unshift(itm); 
            }else{
                eleOtherArr.push(itm); 
            }
        });
        eleRArr = eleRArr.sort(sortVideo);
        eleRArr = eleRArr.concat(eleOtherArr);
        eleRArr.unshift(mainR);
        eleRArr.forEach(function(v,i){
            $(v).find(".preview-item-num").html(i+1);
            previewUlEle.append(v);
        });

       
        //避免多次循环，写个定时器
        if(videoDom.timer) clearTimeout(videoDom.timer);
        videoDom.timer = setTimeout(function(){
            $.each($(".preview-content").find("video"),function(idx,itm){
                itm.play();
            });
        },2000);
        if(peerClientStatusArr.previewListNum>=$(".preview-content .preview-item").length){
            peerClientStatusArr.previewList = true;
        }
        //避免peerclient重启造成pip没有恢复的问题发生
        if($("#preview .pip").length!==0&&$("#preview .pip").find("video").attr("data-videoid")==name){
            delete peerClientStatusArr.videoResetNumObj[name];
            createPipVideo(name);
        }
        // 避免R重启后，没有恢复pip的情况发生
        if($("#preview .pip").length!==0&&$("#preview .pip").attr("data-pipvideosharedmemoryname")==curItem.PreviewShm.SharedMemoryName){
            createPipVideo(name);
        }
        //初始化previewlist volume
        if(volumeColumn.volumeObj[curItem.PreviewShm.SharedMemoryName]){
           curItem.CurrentVolume = volumeColumn.volumeObj[curItem.PreviewShm.SharedMemoryName]["curRightDb"];
        }else{
            curItem.CurrentVolume = 0;
        }
        var previewVolume = volumeConversion.volumeR2local(curItem.CurrentVolume);
        if(previewVolume > 0){
            $('.preview-content [data-filename="'+curItem.PreviewShm.SharedMemoryName+'"]').find(".voice").removeClass("icon-novoice").addClass("icon-voice");
        }
        createPreviewListVoiceControl(previewVolume, $('.preview-content [data-filename="'+curItem.PreviewShm.SharedMemoryName+'"]'),'vertical');
        var shareVolume = curItem.PreviewShm.SharedMemoryName;
        var id = currentRInfo.rtcIdList.preLis.idArr.indexOf(name);
        if(id>-1){
            currentRInfo.rtcIdList.preLis.idArr.splice(id, 1);
        }
    }
    
};
// function resetVideo(id,delay){//由于时延太大需要重连
//     if(peerClientStatusArr.resetVideoList.length>0 && peerClientStatusArr.resetVideoList.indexOf(id)>-1) return;
//     peerClientStatusArr.resetVideoList.push(id);
//     on_leave(id);
//     var strId = [id]; 
//     var styleObj = getVideoStyle(id);
//     var videoObj = $(styleObj["videoObj"]),style=styleObj["style"];
//     var width = videoObj.width();
//     var height = videoObj.height();
//     var html = '<div style="line-height:'+height+'px;text-align:center;background-color:#000;width:'+width+'px;height:'+height+'px"   id='+id+'><img src="./images/video_loading.gif" /></div>';
//     videoObj.replaceWith(html);
//     on_rtc([id]);
//     console.log(id + " delay大于500ms 重连了" + "delay:" + delay);
// }
// function getStatsBack(data){
//     var id = "";
//     if(data.video.recv["tracks"]&&data.video.recv["tracks"][0]){
//         id = data.video.recv["tracks"][0].substring(6);
//         for(var i=0;i<data["results"].length;i++){
//             var result = JSON.stringify(data["results"][i]);
//             if(result.indexOf("googTargetDelayMs")!==-1){
//                 if(data["results"][i]["googTargetDelayMs"]&&parseInt(data["results"][i]["googTargetDelayMs"])>500){
//                     //resetVideo(id,parseInt(data["results"][i]["googTargetDelayMs"]));
//                     return true;
//                 }    
//                 break; 
//             } 
//         }
//     }
// }
function sortVideo(ele1,ele2){
    var id1 = parseInt($(ele1).attr("data-rid"),16),
        id2 = parseInt($(ele2).attr("data-rid"),16);
    if(id1<id2){
        return -1;
    }else if(id1>id2){
        return 1;
    }else{
        return 0;
    }
}
PeerClient.prototype.onIceCandidate = function(event) {
    if (event.candidate) {
        var candidate = {to:this.peerName_, 
            candidate:event.candidate.candidate, 
            sdpMid:event.candidate.sdpMid, 
            sdpMLineIndex:event.candidate.sdpMLineIndex
        };

        var msg = {};
        msg.type = CONSTANTS.peerIce;
        msg.content = JSON.stringify(candidate);
        this.sendSignalingMessage(msg);
    } else {
        // console.log('End of candidates.');
    }
};

var Call = function (params) {
    this.iceCache_ = {};
    this.peerClients_ = {};
    this.sendSignalingMessage = null;
};

Call.prototype.dealOffer = function(par) {
    var params = {};
    params.type = CONSTANTS.peerAnswer;
    params.offerOptions = offerOptions;
    // console.log(this.mediaConstraints_);

    params.serverUrl = iceUrl;
    params.offer = JSON.parse(par.offer);
    params.stream = par.stream;
    params.peers = [params.offer.from];
    this.addPeer(params);
};

Call.prototype.dealAnswer = function(answerSDP) {
    // console.log(answerSDP);
    var answer = JSON.parse(answerSDP);
    var name = answer.from;
    if (typeof(this.peerClients_[name]) !== 'undefined') {
        clearInterval(this.peerClients_[name].timerIceRestart);
        var peer = this.peerClients_[name];
        var pc = peer.pc;
        // if(pc.signalingState=="stable"){
        //     console.log(name,"sdp already stable");
        //     return;
        // }
        pc.setRemoteDescription(new RTCSessionDescription(answer))
        .then(function() {
            peer.canAddICE = true;
            window.rtcclient.call_.dealIceCandidateCache(peer.peerName_);
        }).catch(function(error) {
            console.error(name,error.toString());
        });
    } else {
        console.error('pc not found');
    };
};

Call.prototype.dealIceCandidateCache = function(name) {
    function onAddIceCandidateSuccess() {
        // console.log('AddIceCandidate success.');
    }

    function onAddIceCandidateError(error) {
        console.error('Failed to add ICE Candidate: ' + error.toString());
    }

    if (typeof(this.peerClients_[name]) !== 'undefined') {
        if (typeof(this.iceCache_[name]) == 'undefined') {
            console.error('no ice cache for ' + name);
            return;
        };
        var peer = this.peerClients_[name];
        var pc = peer.pc;
        if (peer.canAddICE) {
            while (this.iceCache_[name].length) {
                // console.info(name + ': add ice');
                pc.addIceCandidate(new  RTCIceCandidate(this.iceCache_[name].shift()),
                    onAddIceCandidateSuccess, onAddIceCandidateError);
            };
        } else {
            // console.log(name + " in wrong state, do not add ice: " + pc.signalingState);
        };
    } else {
        console.error('pc not found: ' + name);
    };
};

Call.prototype.dealIceCandidate = function(cand) {
    // console.log("recv ice :" + cand);
    var name = cand.from;
    var candidate = cand.ice;

    if(!this.iceCache_.hasOwnProperty(name)) {
        this.iceCache_[name] = [];
    };
    this.iceCache_[name].push(candidate); 
    this.dealIceCandidateCache(name);
};

Call.prototype.addPeer = function(params) {
    var i = params.peers.length;
    // console.log(params.peers);
    while (i--) {
        var name = params.peers[i].trim();
        // if (!this.peerClients_.hasOwnProperty(name)) {
            var p = params;
            p.name = name;
            p.signaling = this.sendSignalingMessage;
            if(this.iceCache_.hasOwnProperty(name)) {
                p.ice = this.iceCache_[name];
                delete this.iceCache_[name];
            }; 
            this.peerClients_[name] = new PeerClient(p);
            this.peerClients_[name].stop = this.stopPeer.bind(this);
        // };
    };
    // console.log(this.peerClients_);
};

Call.prototype.leave = function() {
    // console.log(this.peerClients_);
    var propertys = Object.keys(this.peerClients_);
    var len = propertys.length;
    for(peerclientId in window.rtcclient.call_.peerClients_){
        clearInterval(window.rtcclient.call_.peerClients_[peerclientId].timerStats);
    }
    while(len--) {
        var p = propertys.shift();
        var dis = {};
        dis.ack = true;
        dis.from = p;
        // console.info(p);
        // console.log("stop");
        this.stopPeer(JSON.stringify(dis));
    };
};

Call.prototype.stopPeer = function(dis) {
    var msg = JSON.parse(dis);
    var name = msg.from;
    var client = this.peerClients_[name];
    if (typeof(this.peerClients_[name]) !== 'undefined') {
        var pc = client.pc;

        var sig = {
            type: CONSTANTS.disconnectPeer,
            content: JSON.stringify({to:name})
        };
        this.sendSignalingMessage(sig);

        if (msg.ack) {
            sig = {
                type: CONSTANTS.disconnectPeer,
                content: JSON.stringify({to:name})
            };
            this.sendSignalingMessage(sig);
        };

        pc.close();
        client.deleteAudio(name);
        clearInterval(this.peerClients_[name].timerIceRestart);
        delete this.peerClients_[name];
        // console.info('delete peer: ' + dis);
    };

    if (isEmptyObject(this.peerClients_)) {     
        // document.getElementById('leave').hidden = true;
        // document.getElementById('leave').disabled = true;
        window.rtcclient.stopStream();
    };

};

//params:{caller:id, callee:[id,...]}
var RtcClient = function (params) {
    this.logIn = false;
    this.needCallAfterLogIn = true;
    this.peerid_ = null;
    this.reqTimer = null;
    this.passwd = Math.random().toString(36).substr(2);
    if ( params.caller != null) {
        this.peerid_ = params.caller.trim();
    };
    this.callee_ = null;
    if (params.callee != null) {
        this.callee_ = params.callee.split(',');
    };
    this.mediaConstraints_ = params.mediaConstraints;
    this.recvvideo = params.recvvideo;
    this.recvaudio = params.recvaudio;
    this.audioRecvBitrate = params.audioRecvBitrate;
    // console.info(params);

    this.iceCache_ = {};
    this.call_ = {};
    this.localStream_ = {};
    //signaling
    this.sigChannel_ = new Signaling();
    this.initSigChannel();
    /*if (this.peerid_) {
        this.sendEvent(CONSTANTS.logIn, JSON.stringify({username:this.peerid_}));
    };*/
    this.RTT = 0;
    this.rttTimer();
};

RtcClient.prototype.rttTimer = function () {
     var RTTClock = function () {
        this.rttStartTime = new Date();
        this.sendEvent(CONSTANTS.RTT, JSON.stringify({rtt:this.RTT}));
    };
    setInterval(RTTClock.bind(this), 60000);
};

RtcClient.prototype.callStaus = function (s, m) {
    for (var i in this.callee_) {
        if (this.callee_[i] == null) {
            continue;
        };

         var status = {
            peername:this.callee_[i],
            status:s,
            msg:m
        };

        this.sendEvent(CONSTANTS.callStatus, JSON.stringify(status));
    };
};

RtcClient.prototype.isOnline = function () {
    return this.logIn;
};

RtcClient.prototype.registerEvent = function (type, cb) {
    this.sigChannel_.on(type, cb.bind(this));
};


RtcClient.prototype.sendEvent = function (type, cb) {
    this.sigChannel_.send(type, cb);
};

RtcClient.prototype.onSigServerConnected = function () {
    console.log('connect ');
    if (this.peerid_ && !this.logIn) {
        console.log("begin log in");
        // this.sendEvent(CONSTANTS.logOut, JSON.stringify({username:this.peerid_ , passwd:this.passwd}));
        this.needCallAfterLogIn = false;
        this.sendEvent(CONSTANTS.logIn, JSON.stringify({username:this.peerid_ , passwd:this.passwd}));
    };
};

RtcClient.prototype.initSigChannel = function () {
    this.registerEvent("connect", this.onSigServerConnected);

    this.registerEvent("error", function(data) {
        console.log("error " + data);
    });
    this.registerEvent(CONSTANTS.RTT, function(msg) {
        this.RTT = (new Date() - this.rttStartTime)/2;
        var peerRtt = JSON.parse(msg);
        for (var name in peerRtt) {
            if (typeof(this.call_.peerClients_[name]) !== 'undefined') {
                this.call_.peerClients_[name].peerRtt = peerRtt[name];
            };
        };
    });

    this.registerEvent("disconnect", function() {
        /*访问失败了*/
        console.log("disconnect");
        // oUtils.alertTips("i18n_webRTCOffline");
        //重新创建连接
        this.logIn = false;
        // on_leave(); //清除所有通话
        // errorMsg({name:'user', message:"disconnect with server, try again"});
    });
    this.registerEvent(CONSTANTS.logIn, this.onLogIn);
    this.registerEvent(CONSTANTS.userAdd, this.onUserAdd);
    this.registerEvent(CONSTANTS.userDel, this.onUserDel);
    this.registerEvent(CONSTANTS.callRequest, this.onCallRequest);
    this.registerEvent(CONSTANTS.callResponse, this.onCallResponse);
    this.registerEvent(CONSTANTS.peerIce, this.onIce);
    this.registerEvent(CONSTANTS.peerOffer, this.onOffer);
    this.registerEvent(CONSTANTS.peerAnswer, this.onAnswer);
    this.registerEvent(CONSTANTS.disconnectPeer, this.onDiscPeer);
    this.registerEvent(CONSTANTS.addCall, this.onAddCall);
    this.registerEvent(CONSTANTS.deleteCall, this.onDeleteCall);
};

//utils
/*function getQueryString(name, str, symbol) {
    str = (str == null ? window.location.search.substr(1) : str);
    symbol = (symbol == null ? "&" : symbol);
    var reg = new RegExp("(^|" + symbol + ")" + name + "=([^" + symbol + "]*)(" + symbol + "|$)", "i");
    var r = str.match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}*/

function errorMsg(error) {
    var err =  "type: " + error.name + ', message: '+ error.message;
    /*if(producerMustBeOneTimer){
        clearTimeout(producerMustBeOneTimer);
        producerMustBeOneTimer=null;
    }*/
    // if(error.message.indexOf("Busy!")>-1||error.message === "Peer refuse call request!"||error.message === "peer is busy"){
    //     var msgArr = error.message.split(" ");
    //     $(".main-rList .rList-show").attr("data-busyId",msgArr[msgArr.length-1]);
    // }

    
    if(err.indexOf("Ice connection failed")>-1){
        if(peerClientStatusArr.resetVideoList && !peerClientStatusArr.resetVideoList.indexOf(error.name)>-1)
        peerClientStatusArr.resetVideoList.push(error.name);
        on_leave(error.name);
        var strId = [error.name]; 
        var styleObj = getVideoStyle(error.name);
        var videoObj = $(styleObj["videoObj"]),style=styleObj["style"];
        var width = videoObj.width();
        var height = videoObj.height();
        var html = '<div style="line-height:'+height+'px;text-align:center;background-color:#000;width:'+width+'px;height:'+height+'px"   id='+error.name+'><img src="./images/video_loading.gif" /></div>';
        videoObj.replaceWith(html);
        if(peerClientStatusArr.disconnectNum>=2){
            oUtils.alertTips("i18n_webRTCOffline");
            webrtcVideo.initFlag= true;
            peerClientStatusArr.clearDisconnectPrompt = true;
            resetPage();
        }else{
            peerClientStatusArr.disconnectNum++;
            console.log([error.name],"Ice connection failed");
            on_rtc([error.name]);
        }
    }
    if(err.indexOf("User not exists")>-1){
        var videoObj = $("#"+error.name);
        if(videoObj.length!==0){
            // clearTimeout(peerClientStatusArr.videoResetNumObjTime);
            peerClientStatusArr.videoResetNumObjTime = setTimeout(function(){
                if(peerClientStatusArr.resetVideoList && !peerClientStatusArr.resetVideoList.indexOf(error.name)>-1)peerClientStatusArr.resetVideoList.push(error.name);
                on_leave(error.name);
                var strId = [error.name]; 
                var styleObj = getVideoStyle(error.name);
                var videoObj = $(styleObj["videoObj"]),style=styleObj["style"];
                var width = videoObj.width();
                var height = videoObj.height();
                var html = '<div style="line-height:'+height+'px;text-align:center;background-color:#000;width:'+width+'px;height:'+height+'px"   id='+error.name+'><img src="./images/video_loading.gif" /></div>';
                videoObj.replaceWith(html);
                console.log([error.name],"User not exists");
                on_rtc([error.name]);
            },2000);
            
        }else{
            if(peerClientStatusArr.videoResetNumObj[error.name]){
                peerClientStatusArr.videoResetNumObj[error.name]--;
            }else{
                peerClientStatusArr.videoResetNumObj[error.name] = 5;
            }
            if(peerClientStatusArr.videoResetNumObj[error.name]<=0){//如果小于零，说明重试够五次，退出操作
                return false;
            }
            if(currentRInfo.rtcIdList.pvw.indexOf(error.name)>-1||currentRInfo.rtcIdList.pgm.id.indexOf(error.name)>-1){
                clearTimeout(peerClientStatusArr.videoResetNumObjTime);
                peerClientStatusArr.videoResetNumObjTime = setTimeout(function(){
                    on_leave(error.name);
                    webrtcVideo.initFlag = true;
                    if(currentRInfo.rtcIdList.pvw.indexOf(name)>-1){
                        currentRInfo.rtcIdList.pvw = [];
                    }else{
                        currentRInfo.rtcIdList.pgm.id = [];
                    }
                },2000);
            }else{
                peerClientStatusArr.userNotExists.push(error.name);
                clearTimeout(peerClientStatusArr.videoResetNumObjTime);
                peerClientStatusArr.videoResetNumObjTime = setTimeout(function(){
                    var userNotExists = peerClientStatusArr.userNotExists;
                    for(var j=0;j<userNotExists.length;j++){
                        var index = webrtcVideo.peerIds.indexOf(userNotExists[j])
                        if(index>-1){
                            on_leave(userNotExists[j]);
                            webrtcVideo.peerIds.splice(index, 1);
                            currentRInfo.rtcIdList.preLis.idArr.splice(index, 1);
                        }
                    }
                    peerClientStatusArr.userNotExists = [];
                },7000);
            }
            
        }
          
    }
    if(err.indexOf("already exists")>-1){
        var alreadyIndex = webrtcVideo.peerIds.indexOf(error.name);
        if(alreadyIndex>-1){
            on_leave(error.name);
            webrtcVideo.peerIds.splice(alreadyIndex, 1);
        }
    }
    console.log(new Date().getTime(),new Date());
    console.log(err);
}


RtcClient.prototype.onUserAdd = function (msg) {
    //document.getElementById('ttusers').innerHTML = msg.user + ' log in. Thera are in total ' + msg.cnt + ' users online.';
    if (msg.user == window.rtcclient.peerid_) {
        // document.getElementById('ttusers').innerHTML = msg.user + ' log in.';
    };
};

function isEmptyObject(obj) {
    for (var key in obj) {
        return false;
    };
    return true;
};

RtcClient.prototype.onUserDel = function (msg) {
    //document.getElementById('ttusers').innerHTML = msg.user + ' log out. Thera are in total ' + msg.cnt + ' users online.';
    if (typeof(window.rtcclient) != 'undefined' && !isEmptyObject(window.rtcclient.call_)) {
        var disconnect = {
            from:msg.user,
            ack:false
        };
        //window.rtcclient.call_.stopPeer(JSON.stringify(disconnect));
    };
};

//
RtcClient.prototype.onUserMediaSuccess = function(stream) {
    this.localStream_ = stream;
    // console.log("local stream: " + stream);
};

RtcClient.prototype.onUserMediaError = function(error) {
    var errorMessage = 'Failed to get access to local media. Error name was ' + error.name ;
    errorMsg({name:'user', message:errorMessage});
    this.callStaus(STATUS.FAILED, errorMessage);
};
RtcClient.prototype.onGetStream = function(stream) {
    // console.log('Got access to local media with mediaConstraints:' + JSON.stringify(this.mediaConstraints_) );
    this.onUserMediaSuccess(null);
    this.startCall();
};
RtcClient.prototype.addSessions = function(list) {
    // console.log('add session:' + list);
    this.sendEvent(CONSTANTS.updateAddSessions, JSON.stringify(list));
};
RtcClient.prototype.onLogIn = function (msg) {
   //var ack = JSON.parse(msg);
    if (msg.success) {
        // document.getElementById('username').value = this.peerid_;
        // document.getElementById('username').disabled = true;
        // document.getElementById('login').disabled = true;
        this.logIn = true;
        this.createCall();
        if (this.needCallAfterLogIn &&this.callee_ != null) {
            // document.getElementById('peerid').value = this.callee_;
            // console.info(this.mediaConstraints_);
            this.needCallAfterLogIn = false;
            this.addSessions(this.callee_);
            if (this.mediaConstraints_.audio || this.mediaConstraints_.video) {
                navigator.mediaDevices.getUserMedia(this.mediaConstraints_)
                .then( this.onGetStream.bind(this) ).catch(function(error) {
                    this.onUserMediaError(error);
                }.bind(this));
            } else {
                //send neither audio nor video
                this.onGetStream(null);
            };
        } else {
            // console.log("callee is empty")
        };
    } else {
        errorMsg({name:'user', message:msg.msg});
    };
};

RtcClient.prototype.onAddCall = function (msg) {
    var req = JSON.parse(msg);
    // console.log("add call from " + msg);
    if (typeof(window.rtcclient) != 'undefined' ) {
        window.rtcclient.callee_ = req.to.split(",");
        window.rtcclient.needCallAfterLogIn = true;
        window.rtcclient.onLogIn({success:true});
    };
};

// var producerMustBeOneTimer = null;
RtcClient.prototype.onDeleteCall = function (msg) {
    console.log("delete call from " + msg);
    var req = JSON.parse(msg);
    var ids = req.to.split(",");
    var i = ids.length;
    while (i--) {
        if (typeof(window.rtcclient) != 'undefined' && !isEmptyObject(window.rtcclient.call_)) {
            var disconnect = {
                from:ids[i],
                ack:true
            };
            window.rtcclient.call_.stopPeer(JSON.stringify(disconnect));
        };
    };
    //清除原先的video标签
    // $("#showRVideo-previewModule .previewModule-video").html("");
    // $("#showRVideo-liveOutputModule .previewModule-video").html("");
    // $(".preview-list .list-content").html("");
};

RtcClient.prototype.onCallRequest = function (msg) {
    var req = JSON.parse(msg);
    navigator.mediaDevices.getUserMedia(this.mediaConstraints_)
    .then( function(stream) {
        // console.log('Got access to local media with mediaConstraints:' + JSON.stringify(this.mediaConstraints_) );
        this.onUserMediaSuccess(stream);
        this.sendEvent(CONSTANTS.callResponse, JSON.stringify({to:req.from, response:true}));
        // console.log('call req from ' + req.from + ', response true');
    }.bind(this) ).catch(function(error) {
        this.onUserMediaError(error);
        this.sendEvent(CONSTANTS.callResponse, JSON.stringify({to:req.from, response:false}));
        // console.log('call req from ' + req.from + ', response false');
    }.bind(this));
};

RtcClient.prototype.onCallResponse = function (res) {
    // console.log( res);
    clearTimeout(this.reqTimer);
    var ack = JSON.parse(res);
    if (ack.response) {
        var params = {};
        params.type = CONSTANTS.peerOffer;
        params.peers = [ack.from];
        params.offerOptions = {};
        params.offerOptions.offerToReceiveVideo = this.recvvideo;
        params.offerOptions.offerToReceiveAudio = this.recvaudio;
        params.audioRecvBitrate = this.audioRecvBitrate;
        params.serverUrl = iceUrl;
        params.stream = this.localStream_;
        this.call_.addPeer(params);
        // var timestamp=new Date().getTime();
        // if(statusObj.peerIdObj[id]&&timestamp-statusObj.peerIdObj[id]>1500){
        //     this.call_.addPeer(params);
        // }
        // statusObj.peerIdObj[id]=timestamp;
    } else {
        errorMsg({name:ack.from, message:ack.msg});
        this.callStaus(STATUS.RETRY, ack.msg);
    };
};

RtcClient.prototype.onIce = function (iceStr) {
    var ice = JSON.parse(iceStr);
    var candidate = {};
    candidate.candidate = ice.candidate;
    candidate.sdpMid = ice.sdpMid;
    candidate.sdpMLineIndex = ice.sdpMLineIndex

    this.call_.dealIceCandidate({from:ice.from, ice:candidate});
};

RtcClient.prototype.onDiscPeer = function (msg) {
    // msg.ack = false;
    // console.log("stop");
    // this.call_.stopPeer(msg);
    // if(!$(".main-rList .rList-show").attr("data-occupy")){
    //     $(".main-rList .rList-show").attr("data-occupy",true);
    //     oUtils.alertTips("i18n_procuderMustBeOne");
    //     pageWebsocketObj.close();
    //     $(".relateRBtn").addClass("disabled");
    //     $(".main-preview").removeAttr("data-filename");
    //     $(".main-preview .preview-source").html("");
    //     $(".main-output").removeAttr("data-filename");
    //     $(".main-output .output-source").html("");
    //     $(".sd-preview-list .preview-content").html("");
    //     $(".operation-view-logo").removeClass("outputActive");
    //     $(".pretreat-item-logo").removeClass("outputActive");
    // }
    //R被占用
};

RtcClient.prototype.onAnswer = function (answerSDP) {
    this.call_.dealAnswer(answerSDP);
};

RtcClient.prototype.onOffer = function (offerSDP) {
    // console.info('offer from: '+ offerSDP);
    var params = {
        stream:this.localStream_,
        offer:offerSDP
    };
    this.call_.dealOffer(params);
};

RtcClient.prototype.createCall = function () {
    if (isEmptyObject(this.call_)) {  
        this.call_ = new Call();
        this.call_.sendSignalingMessage = function (params) {
            this.sendEvent(params.type, params.content);
        }.bind(this);
    };
};

RtcClient.prototype.startCall = function () {
    if (this.callee_.length == 0) {
        errorMsg({name:'user', message:'callee is empty'});
        return;
    };
    var req = {ids:this.callee_};
    // console.log(req);
    this.sendEvent(CONSTANTS.callRequest, JSON.stringify(req));
    this.callStaus(STATUS.REQUST);
    this.reqTimer = setTimeout(function() {
        this.callStaus(STATUS.RETRY, "requset time out!");
    }.bind(this), 60000);
};

RtcClient.prototype.addPeer = function (name) {
    this.call_.addPeer(name);
};

RtcClient.prototype.stopStream = function () {
    // console.info("stop stream");
    if(!isEmptyObject(this.localStream_)) {
        this.localStream_.getTracks().forEach(function(track) {
            track.stop();
        });
        delete this.localStream_; 
        this.localStream_ = null;
    };

};

RtcClient.prototype.leave = function (name) {
    if (!isEmptyObject(this.call_)) {
        this.call_.leave();
    };
    this.stopStream();
    window.rtcclient.sendEvent(CONSTANTS.logOut, JSON.stringify({username:window.rtcclient.peerid_ , passwd:window.rtcclient.passwd}));
};

function calPts(id) {
    var i,currentT = Date.now();
    var dataArray = peerClientStatusArr.dataArray[id];
    if (dataArray.length === 0) {
        return;
    }
    var currentDelay  = 0;
    for(var j = 1;j < 6; j++){
        currentDelay += (dataArray[dataArray.length - j].tarDelay - dataArray[dataArray.length - j - 1].tarDelay);
    }
    for (i = 0; i < dataArray.length; i++) {
        if(currentT - dataArray[i].rt - dataArray[i].tarDelay + currentDelay/5 < 1000/dataArray[i].fps) {
            return dataArray[i].pts;
        }
    }
    if (i === dataArray.length) {
        return dataArray[i-1].pts;
    }
}

function on_login (name) {
    // var name =  document.getElementById('username').value;
    // startTime = new Date().getTime();
    if (name.length != 0) {
        window.rtcclient.peerid_ = name;    
        window.rtcclient.sendEvent(CONSTANTS.logIn, JSON.stringify({username:window.rtcclient.peerid_,passwd: window.rtcclient.passwd}));
    } else {
        err = 'Username cannnot be empty';
        errorMsg({name:'user', message:err});
    };
};

function on_rtc (peerIdArr,previewList) {
    console.log(peerIdArr)
    // peerClientStatusArr.backdata = backdata;
    // for(var i=0;i<peerIdArr.length;i++){
    //     peerClientStatusArr.videoResetNumObj[peerIdArr[i]] = 3; 
    // }
    // for(var i=0;i<peerIdArr.length;i++){
    //     peerClientStatusArr.rtcStatStamp[peerIdArr[i]]="";
    // }
    if(previewList){
        peerClientStatusArr.previewListNum+=previewList.length;
    }
    // videoDom.pipVideo = pipVideo;
    if (peerIdArr.length) {
        window.rtcclient.needCallAfterLogIn = true;
        window.rtcclient.callee_ = peerIdArr;
        window.rtcclient.onLogIn({success:true});
    } else {
        err = 'Callee is empty';
        errorMsg({name:'user', message:err});
    };
};

function on_leave (peerId) {
     if (typeof(window.rtcclient) != 'undefined' && !isEmptyObject(window.rtcclient.call_)) {
        if(peerId){ //移除单个通话
            window.rtcclient.call_.stopPeer(JSON.stringify({
                from: peerId,
                ack: true
            })); 
        }else{ //移除全部通话
            window.rtcclient.leave();
        }    
    };
};
var ptsTimer = 0;
setInterval(function(){
    var id = $("#preview .main-player").attr("id");
    if(peerClientStatusArr.dataArray[id].length>0){
        var pts = calPts(id);
        var arr = peerClientStatusArr.dataArray[id];
        // for(var i = 1; i < arr.length; i++){
        //     if(pts <= arr[i].pts){
        //         $("#preview .timeStamp").html(arr[i].pts);
        //         break;
        //     }
        // }
        // if(i==arr.length){
            // $("#preview .timeStamp").html(arr[arr.length-1].pts);
        // }
        $("#preview .timeStamp").html(pts);
        var html = $(".output-source .timeStamp").html();
        if(html.length>2000){
            html = html.substring(0, 1300);
        }
       html = pts+" "+arr[arr.length-1].tarDelay+" "+arr[arr.length-1].curDelay+" "+arr[arr.length-1].pts +" "+ arr[arr.length-1].rt + "<br/>" + html;
        $(".output-source .timeStamp").html(html);
    }
},5)
// $(document).on("keydown",function(e) {
//     if(e.altKey && e.keyCode == 96){
//         console.log(peerClientStatusArr.dataArray['5B480CEA451881B850444352495052450000']);
//     }
// });
// $(function(){
//     //初始化webRTC
//     var params ={
//         sendaudio:false,
//         sendvideo:false,
//         recvaudio:true,
//         recvvideo:true,
//         caller:null,
//         callee:null
//     };
//     params.mediaConstraints = {
//         audio: params.sendaudio,
//         video: params.sendvideo
//     };
//     window.rtcclient = new RtcClient( params);
// });
function getVideoStyle(name){//获取没有视频的video
    var videoObj = $("#"+name);
    var styleObj = {},style;
    styleObj["videoObj"] = videoObj;
    if(videoObj.parent().hasClass("preview-item")){
        style = "height=168 width=300 class='preview-item-video'";
    }else if(videoObj.parent().parent().hasClass("preview-source")||videoObj.parent().parent().hasClass("output-source")){
        style = "autoplay class='left main-player'";
    }else{
        style = "style='display:inline-block;z-index:1;width:100%;height:100%;' class='preview-item-video'";
    }
    styleObj["style"] = style;
    return styleObj;
}
window.onbeforeunload = function () {
    window.rtcclient.leave();
    window.rtcclient.sendEvent(CONSTANTS.logOut, JSON.stringify({username:window.rtcclient.peerid_ , passwd:window.rtcclient.passwd}));
    delete window.rtcclient; 
};