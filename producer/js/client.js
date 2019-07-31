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
    updateAddSessions: 'AddSessions',
    updateDelSessions: 'DelSessions',
    RTT: 'RTT'
};

var STATUS = {
    UNKOWN: 0,
    SUCCESS: 1,
    FAILED: 2,
    REQUST: 3,
    RESPONSE: 4,
    DIALING: 5,
    ENDED: 6,
    RETRY: 7
};

var offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 0,
    voiceActivityDetection: false
};

var iceUrl = {
    "iceServers": [{
        "urls": "turn:rtcturn.tvunetworks.com:13478",
        "username": "tvu",
        "credential": "tvu"
    }, {
        "urls": "stun:stun.l.google.com:19302"
    }, {
        "urls": "stun:stun.sipgate.net"
    }]
};

var errorElement = document.getElementById('errorMsg');
var number = 0;
var Signaling = function() {
        wssUrl = 'https://10.12.23.111:9091/';
        var sock = new io(wssUrl);
        this.sock = sock;

        this.send = function(type, msg) {
            var str ='<div>"'+number+' + "send: + "'+type+'"</div>'
            $("body").append(str);
            sock.emit(type, msg);
            number++;
        };

        this.on = function(type, callback) {
            sock.on(type, callback);
        };
    };

function setChannelEvents(channel, channelTag) {
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
        // getStats(pc,function(data){
        //     //获取video id
        //     // console.log(JSON.stringify(data));
        //     var id = "";
        //     if(data.video.recv["tracks"]&&data.video.recv["tracks"][0]){
        //         id = data.video.recv["tracks"][0].substring(6);
        //         for(var i=0;i<data["results"].length;i++){
        //             var result = JSON.stringify(data["results"][i]);
        //             if(result.indexOf("googTargetDelayMs")!==-1){
        //                 peerClientStatusArr.rtcStatStamp[id] = eventData["ts"]-data["results"][i]["googTargetDelayMs"];

        //                 break; 
        //             } 
        //         }
        //     }
        //     getStatsBack(data);  
        // });
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
        var  num2 = array[dataOffset];
        var  num1 = array[dataOffset+1];
        var  num0 = array[dataOffset+3];
        var  num3 = array[dataOffset+4];
    return num0 | num1 << 8 | num2 << 16 | num3 << 24;
}
var PeerClient = function(params) {
        this.type_ = params.type;
        this.peerName_ = params.name;
        this.peerRtt = 0;
        this.timerIceRestart = {};
        this.timerStats = {};
        this.offerOptions_ = params.offerOptions;
        this.serverUrl_ = params.serverUrl;
        this.sendSignalingMessage = params.signaling;
        this.localStream = params.stream;
        this.audioRecvBitrate = params.audioRecvBitrate;
        this.canAddICE = false;
        this.iceMap = {};
        this.localIP = [];
        this.remoteIP = [];
        this.sessStatus = {};
        this.sessStatus.time = new Date();
        this.sessStatus.status = STATUS.UNKOWN;

        this.pc = new RTCPeerConnection(this.serverUrl_);
        this.pc.onicecandidate = this.onIceCandidate.bind(this);
        this.pc.onaddstream = this.onRemoteStreamAdded.bind(this);
        this.pc.onremovestream = console.log.bind(null, 'Remote stream removed.');
        if (this.localStream) {
            this.pc.addStream(this.localStream);
        };

        this.pc.ondatachannel = function (event) {
            this.fromPeerChannel = event.channel;
            //this.fromPeerChannel.binaryType = 'blob';
            setChannelEvents(this.fromPeerChannel, "frompeer");
            this.fromPeerChannel.send("=== nice to meet you");
        };
        this.toPeerChannel = this.pc.createDataChannel('WorldChannel', null);
        setChannelEvents(this.toPeerChannel, 'topeer');

        this.pc.onsignalingstatechange = this.onSignalingStateChanged.bind(this);
        this.pc.oniceconnectionstatechange = this.onIceConnectionStateChanged.bind(this);
        if (this.type_ == CONSTANTS.peerOffer) {
            this.createOffer(false);
        } else {
            this.setRemoteSDP(params.offer);
        };
    };

//"candidate:3381044180 1 udp 1685790463 211.160.178.29 50079 
//typ srflx raddr 10.12.32.147 rport 41217 generation 0 ufrag GAe6 network-id 1 network-cost 50"
//[211.160.178.29:50079]="10.12.32.147:41217"
PeerClient.prototype.getIceMap = function(icestr) {
    var idx = icestr.search(/raddr/);
    console.log(icestr)
    if (idx != -1) {
        var arr = icestr.split(" ");
        var key = arr[4] + ":" + arr[5];
        arr = icestr.substr(idx).split(" ");
        var v = arr[1] + ":" + arr[3];
        this.iceMap[key] = v;
        console.log("key:" + key + "\nv:" + v);
    };
};

PeerClient.prototype.updateCallStaus = function(s, err) {
    var msg = {};
    msg.type = CONSTANTS.callStatus;
    var status = {
        peername: this.peerName_,
        status: s,
        msg: err
    };
    msg.content = JSON.stringify(status);
    this.sendSignalingMessage(msg);
    this.sessStatus.status = s;
    this.sessStatus.time = new Date();
    console.log("updateCallStaus:" + JSON.stringify(this.sessStatus));
};

PeerClient.prototype.onSetRemoteSDP = function() {

    this.canAddICE = true;
    this.pc.createAnswer().then(this.getLocalDescription.bind(this)).
    catch (this.onSetSessionDescriptionError.bind(this));
};

PeerClient.prototype.setRemoteSDP = function(offer) {
    this.pc.setRemoteDescription(new RTCSessionDescription(offer)).then(this.onSetRemoteSDP.bind(this)).
    catch (this.onSetSessionDescriptionError.bind(this));
};

PeerClient.prototype.createOffer = function(res) {
    if (res) {
        this.offerOptions_.iceRestart = true;
    };
    console.log(this.offerOptions_);
    this.pc.createOffer(this.offerOptions_).then(this.getLocalDescription.bind(this)).
    catch (this.onSetSessionDescriptionError.bind(this));
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
    var str ='<div>"'+number+' + "send: + "'+JSON.stringify(sdp)+'"</div>'
    $("body").append(str);
    number++;
    this.sendSignalingMessage(msg);
    this.updateCallStaus(STATUS.DIALING);

    console.info('send sdp to: ' + this.peerName_ + msg.content);
};

function updateBandwidthRestriction(sdp, bandwidth) {
    if (sdp.indexOf('b=AS:') === -1) {
        // insert b=AS after c= line.
        sdp = sdp.replace(/c=IN IP4 (.*)\r\n/, 'c=IN IP4 $1\r\nb=AS:' + bandwidth + '\r\n');
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
    eval("var re = /(a=fmtp:" + pt + ") (.*)\\r\\n/");
    var sdp = sdpLine.replace(re, '$1 $2;stereo=1;maxaveragebitrate=256000\r\n');
    //console.log('sdp: ' + sdpLine + '\r\npt: ' + pt + '\r\n' + sdp);
    return sdp;
};

PeerClient.prototype.getLocalDescription = function(desc) {
    //desc.sdp = desc.sdp.replace("minptime=10", "minptime=10; maxaveragebitrate=200000");
    var pt = getOpusPayloadType(desc.sdp);
    if (pt != null) {
        desc.sdp = setOpusParam(desc.sdp, pt);
    };
    //desc.sdp = updateBandwidthRestriction(desc.sdp, 256);
    this.pc.setLocalDescription(desc).then(this.onSetLocalSDPSuccess.bind(this, desc)).
    catch (this.onSetSessionDescriptionError.bind(this));
};

PeerClient.prototype.onSetSessionDescriptionError = function(error) {
    var err = 'Failed to set session description: ' + error.toString();
    console.error(err);
    window.rtcclient.deleteSession(this.peerid_);
    this.updateCallStaus(STATUS.RETRY, err);
};

PeerClient.prototype.onSignalingStateChanged = function(event) {
    console.log(this.peerName_ + ": ice signaling state: " + this.pc.signalingState);
};

function arrCmp(a1, a2) {
    return a1.toString() == a2.toString();
}

PeerClient.prototype.dealCandidates = function(cand, map, str) {
    var ip = [];
    if (cand["candidateType"] != "host") {
        var key = cand["ipAddress"] + ":" + cand["portNumber"];
        //console.log("   used ip:" + key);
        ip.push(key);

        var val = map[key];
        while (val) {
            ip.push(val);
            //console.log("   raddr:" + val);
            val = map[val];
        }
    } else {
        var key = cand["ipAddress"] + ":" + cand["portNumber"];
        //console.log("   " + key);
        ip.push(key);
    };

    var oldip = [];
    var isLocal = (str.indexOf("local") != -1);
    //console.log(ip)
    console.log(str)
    if (isLocal) {
        if (!arrCmp(ip, this.localIP)) {
            this.localIP = ip;
        }
        console.log("   " + this.localIP.toString())
    } else {
        if (!arrCmp(ip, this.remoteIP)) {
            this.remoteIP = ip;
        }
        console.log("   " + this.remoteIP.toString())
    };
};

PeerClient.prototype.onStatsSuccess = function(stats) {
    Object.keys(stats).forEach(function(key) {
        if (stats[key].type == "googCandidatePair" && stats[key].googActiveConnection == "true") {

            var local = stats[key].localCandidateId;
            var remote = stats[key].remoteCandidateId;

            this.dealCandidates(stats[local], this.iceMap, "local IPs:\n");
            this.dealCandidates(stats[remote], this.iceMap, "remote IPs:\n");

        }
    }.bind(this));
};

// PeerClient.prototype.getStats = function() {
//     this.pc.getStats().then(function(stats){
//         var result = {};
//         stats.forEach(stat => {
//             if (stat.type == "track" && stat.kind == "video") {
//                 result["video-stats"] = stat;
//             }
//             // more
//         });
//         if (result["video-stats"] == undefined)
//            return;
//         var statsEle = document.getElementById('stats');
//         statsEle.innerHTML = `<ul>
//             <li>video: ${result["video-stats"].trackIdentifier}</li>
//             <li>timestamp: ${result["video-stats"].timestamp}</li>
//             </ul>`;
//     });
// };

PeerClient.prototype.onIceConnectionStateChanged = function(event) {
    console.log(this.peerName_ + ": ice connection state: " + this.pc.iceConnectionState);
    if (this.pc.iceConnectionState == 'connected') {
        this.updateCallStaus(STATUS.SUCCESS);
        // this.getStats();
        clearInterval(this.timerStats);
        // this.timerStats = setInterval(this.getStats.bind(this), 5);
        console.log("create timerStats:" + this.timerStats)

    } else if (this.pc.iceConnectionState == 'disconnected' || this.pc.iceConnectionState == 'failed') {
        this.logIn = false;
        errorMsg({
            name: this.peerName_,
            message: "Ice connection " + this.pc.iceConnectionState
        });
        if (typeof(window.rtcclient) != 'undefined' && !isEmptyObject(window.rtcclient.call_)) {

            var disconnect = {
                from: this.peerName_,
                ack: true
            };
            console.log("i am here");
            window.rtcclient.call_.stopPeer(JSON.stringify(disconnect));
            console.log("can you get here");
            window.rtcclient.callStaus(STATUS.RETRY);
        };
    };
};

PeerClient.prototype.deleteAudio = function(name) {
    var div = document.getElementById(name);
    if (div) {
        div.parentNode.removeChild(div);
        this.updateCallStaus(STATUS.ENDED);
    };
};

PeerClient.prototype.onRemoteStreamAdded = function(event) {
    alert("success")
    var name = this.peerName_;
    var div = document.createElement("div");
    div.setAttribute("id", name);

    var p = document.createElement('p');
    p.innerHTML = 'stream from ' + name;
    p.setAttribute("style", "color:blue;text-align:left;font-size:100%;font-family:Lucida Console;font-weight: bold");

    var b = document.createElement("button");
    var t = document.createTextNode("leave");
    b.appendChild(t);
    b.onclick = function() {
        this.stop(JSON.stringify({
            from: name,
            ack: true
        }))
    }.bind(this);

    document.getElementById('leave').hidden = false;
    document.getElementById('leave').disabled = false;

    var a;
    if (this.offerOptions_.offerToReceiveVideo) {
        a = document.createElement("VIDEO");
    } else {
        a = document.createElement("AUDIO");
    };
    a.setAttribute("controls", "controls");
    a.setAttribute("autoplay", "autoplay");
    a.volume = 0.6;
    a.srcObject = event.stream;

    div.appendChild(p);
    div.appendChild(b);
    div.appendChild(a);

    document.body.appendChild(div);
    errorElement.innerHTML = ""
};

PeerClient.prototype.onIceCandidate = function(event) {
    if (event.candidate) {
        var candidate = {
            to: this.peerName_,
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex
        };
        this.getIceMap(event.candidate.candidate);
        var msg = {};
        msg.type = CONSTANTS.peerIce;
        msg.content = JSON.stringify(candidate);
        this.sendSignalingMessage(msg);
    } else {
        console.log('End of candidates.');
    }
};

var Call = function(params) {
        this.iceCache_ = {};
        this.peerClients_ = {};
        this.statusCheckTimer = setInterval(this.onStatusCheckTimer.bind(this), 3000);
        this.sendSignalingMessage = null;
    };

Call.prototype.onStatusCheckTimer = function() {
    if (!this.peerClients_) {
        return;
    };

    var keys = Object.keys(this.peerClients_);
    var bad = [STATUS.REQUST, STATUS.RESPONSE, STATUS.DIALING];
    for (var i in keys) {
        var x = keys[i];
        if (this.peerClients_.hasOwnProperty(x)) {
            var status = this.peerClients_[x].sessStatus;
            console.log(x + "   " + JSON.stringify(status));
            if (status.status != STATUS.UNKOWN && bad.includes(status.status) && new Date() - status.time > 5000) {
                var dis = {};
                dis.ack = true;
                dis.from = x;
                this.stopPeer(JSON.stringify(dis));

                var msg = {
                    peername: x,
                    status: STATUS.RETRY,
                };

                var sig = {
                    type: CONSTANTS.callStatus,
                    content: JSON.stringify(msg)
                };

                this.sendSignalingMessage(sig);
            };
        }
    }
};

Call.prototype.dealOffer = function(par) {
    var params = {};
    params.type = CONSTANTS.peerAnswer;
    params.offerOptions = offerOptions;
    params.offerOptions.offerToReceiveVideo = par.offerToReceiveVideo;
    console.log(this.mediaConstraints_);

    params.serverUrl = iceUrl;
    params.offer = JSON.parse(par.offer);
    params.stream = par.stream;
    params.peers = [params.offer.from];
    this.addPeer(params);
};

Call.prototype.dealAnswer = function(answerSDP) {
    console.log(answerSDP);
    var answer = JSON.parse(answerSDP);
    var name = answer.from;

    if (typeof(this.peerClients_[name]) !== 'undefined') {
        clearInterval(this.peerClients_[name].timerIceRestart);
        var peer = this.peerClients_[name];
        var pc = peer.pc;
        pc.setRemoteDescription(new RTCSessionDescription(answer)).then(function() {
            peer.canAddICE = true;
            window.rtcclient.call_.dealIceCandidateCache(peer.peerName_);
        }).
        catch (function(error) {
            console.error(error.toString());
        });
    } else {
        console.error('pc not found');
    };
};

Call.prototype.dealIceCandidateCache = function(name) {
    function onAddIceCandidateSuccess() {
        console.log('AddIceCandidate success.');
    }

    function onAddIceCandidateError(error) {
        console.error('Failed to add ICE Candidate: ' + error.toString());
    }

    if (typeof(this.peerClients_[name]) !== 'undefined') {
        if (typeof(this.iceCache_[name]) == 'undefined') {
            console.warn('no ice cache for ' + name);
            return;
        };
        var peer = this.peerClients_[name];
        var pc = peer.pc;
        if (peer.canAddICE) {
            while (this.iceCache_[name].length) {
                console.info(name + ': add ice');
                var ice = new RTCIceCandidate(this.iceCache_[name].shift());
                peer.getIceMap(ice.candidate)
                pc.addIceCandidate(ice, onAddIceCandidateSuccess, onAddIceCandidateError);
            };
        } else {
            console.log(name + " in wrong state, do not add ice: " + pc.signalingState);
        };
    } else {
        console.error('pc not found: ' + name);
    };
};

Call.prototype.dealIceCandidate = function(cand) {
    console.log("recv ice :" + JSON.stringify(cand));
    var name = cand.from;
    var candidate = cand.ice;

    if (!this.iceCache_.hasOwnProperty(name)) {
        this.iceCache_[name] = [];
    };
    this.iceCache_[name].push(candidate);
    this.dealIceCandidateCache(name);
};

Call.prototype.addPeer = function(params) {
    var i = params.peers.length;
    console.log(params.peers);
    while (i--) {
        var name = params.peers[i].trim();
        if (!this.peerClients_.hasOwnProperty(name)) {
            var p = params;
            p.name = name;
            p.signaling = this.sendSignalingMessage;
            if (this.iceCache_.hasOwnProperty(name)) {
                p.ice = this.iceCache_[name];
                delete this.iceCache_[name];
            };
            this.peerClients_[name] = new PeerClient(p);
            this.peerClients_[name].stop = this.stopPeer.bind(this);
        } else {
            console.info(name + " exists")
        };
    };
    console.log("this.peerClients_:", JSON.stringify(this.getPeerClientNames()));
};

Call.prototype.getPeerClientNames = function() {
    return Object.keys(this.peerClients_);
};

Call.prototype.leave = function() {
    console.log(this.peerClients_);
    var propertys = Object.keys(this.peerClients_);
    var len = propertys.length;
    clearInterval(this.statusCheckTimer);
    while (len--) {
        var p = propertys.shift();
        var dis = {};
        dis.ack = true;
        dis.from = p;
        console.info("call leave " + p);
        this.stopPeer(JSON.stringify(dis));
    };
};

Call.prototype.stopPeer = function(dis) {
    var msg = JSON.parse(dis);
    var name = msg.from;
    var client = this.peerClients_[name];
    window.rtcclient.deleteSession(name);

    if (typeof(client) !== 'undefined') {
        clearInterval(this.peerClients_[name].timerIceRestart);
        clearInterval(this.peerClients_[name].timerStats);
        console.log("clear timerStats:" + this.peerClients_[name].timerStats)

        var pc = client.pc;
        if (msg.ack) {
            var sig = {
                type: CONSTANTS.disconnectPeer,
                content: JSON.stringify({
                    to: name
                })
            };
            this.sendSignalingMessage(sig);
        };

        if (pc.signalingState != "closed") {
            pc.close();
        };

        client.deleteAudio(name);
        delete this.peerClients_[name];
        console.info('delete peer: ' + dis);
    };

    if (isEmptyObject(this.peerClients_)) {
        document.getElementById('leave').hidden = true;
        document.getElementById('leave').disabled = true;
        window.rtcclient.stopStream();
    };

};

//params:{caller:id, callee:[id,...]}
var RtcClient = function(params) {
        this.logIn = false;
        this.needCallAfterLogIn = true;
        this.peerid_ = null;
        this.reqTimer = null;
        this.session = new Set();
        this.passwd = Math.random().toString(36).substr(2);
        if (params.caller != null) {
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

        this.iceCache_ = {};
        this.call_ = {};
        this.localStream_ = {};
        //signaling
        this.sigChannel_ = new Signaling();
        this.initSigChannel();
        //if (this.peerid_) {
        //    this.sendEvent(CONSTANTS.logIn, JSON.stringify({username:this.peerid_, passwd:this.passwd}));
        // };

        this.RTT = 0;
        this.rttTimer();
    };

RtcClient.prototype.rttTimer = function() {
    var RTTClock = function() {
            this.rttStartTime = new Date();
            this.sendEvent(CONSTANTS.RTT, JSON.stringify({
                rtt: this.RTT
            }));
        };
    setInterval(RTTClock.bind(this), 60000);
};

RtcClient.prototype.callStaus = function(s, m) {
    for (var i in this.callee_) {
        if (this.callee_[i] == null) {
            continue;
        };

        var status = {
            peername: this.callee_[i],
            status: s,
            msg: m
        };

        this.sendEvent(CONSTANTS.callStatus, JSON.stringify(status));
    };
};

RtcClient.prototype.isOnline = function() {
    return this.logIn;
};

RtcClient.prototype.registerEvent = function(type, cb) {
    this.sigChannel_.on(type, cb.bind(this));
};


RtcClient.prototype.sendEvent = function(type, cb) {
    this.sigChannel_.send(type, cb);
};

RtcClient.prototype.onSigServerConnected = function() {
    console.log('connect ' + this.peerid_ + " " + this.logIn)
    if (this.peerid_ && !this.logIn) {
        console.log("begin log in");
        // commented in based on that server allows re-login with same passwd. (BTW, delay should be added between logout and login)
        // this.sendEvent(CONSTANTS.logOut, JSON.stringify({
        //     username: this.peerid_,
        //     passwd: this.passwd
        // }));

        this.needCallAfterLogIn = false;

        this.sendEvent(CONSTANTS.logIn, JSON.stringify({
            username: this.peerid_,
            passwd: this.passwd
        }));
    };
};


RtcClient.prototype.initSigChannel = function() {
    this.registerEvent("connect", this.onSigServerConnected);

    this.registerEvent("error", function(data) {
        console.log("error " + data);
    });

    this.registerEvent(CONSTANTS.RTT, function(msg) {
        this.RTT = (new Date() - this.rttStartTime) / 2;
        var peerRtt = JSON.parse(msg);
        for (var name in peerRtt) {
            if (typeof(this.call_.peerClients_[name]) !== 'undefined') {
                this.call_.peerClients_[name].peerRtt = peerRtt[name];
            };
        };
    });

    this.registerEvent("disconnect", function() {
        console.log("disconnect");
        document.getElementById('username').disabled = false;
        document.getElementById('login').disabled = false;
        document.getElementById('rtc').disabled = true;
        this.logIn = false;
        document.getElementById('ttusers').innerHTML = '<p style="color:yellow">' + "disconnect with server" + "</p>";
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

function getQueryString(name, str, symbol) {
    str = (str == null ? window.location.search.substr(1) : str);
    symbol = (symbol == null ? "&" : symbol);
    var reg = new RegExp("(^|" + symbol + ")" + name + "=([^" + symbol + "]*)(" + symbol + "|$)", "i");
    var r = str.match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

function errorMsg(error) {
    // errorElement.hidden = false;
    var err = "type: " + error.name + ', message: ' + error.message;
    console.error(err);
    errorElement.innerHTML += '<p style="color:red">' + err + '</p>';
}


RtcClient.prototype.onUserAdd = function(msg) {
    //document.getElementById('ttusers').innerHTML = msg.user + ' log in. Thera are in total ' + msg.cnt + ' users online.';
    var str ='<div>"'+number+'" + receiver: + "'+JSON.stringify(msg)+'"</div>'
    $("body").append(str);
    number++;
    if (msg.user == window.rtcclient.peerid_) {
        document.getElementById('ttusers').innerHTML = msg.user + ' log in.';
    };
};

function isEmptyObject(obj) {
    for (var key in obj) {
        return false;
    };
    return true;
};

RtcClient.prototype.onUserDel = function(msg) {
    //document.getElementById('ttusers').innerHTML = msg.user + ' log out. Thera are in total ' + msg.cnt + ' users online.';
     var str ='<div>"'+number+'" + receiver: + "'+JSON.stringify(msg)+'"</div>'
    $("body").append(str);
    number++;
    if (typeof(window.rtcclient) != 'undefined' && !isEmptyObject(window.rtcclient.call_)) {
        var disconnect = {
            from: msg.user,
            ack: false
        };
    };
};

//
RtcClient.prototype.onUserMediaSuccess = function(stream) {
    this.localStream_ = stream;
    console.log("local stream: " + stream);
};

RtcClient.prototype.onUserMediaError = function(error) {
    console.log(error);
    var errorMessage = 'Failed to get access to local media device. Error name was ' + error.name;
    errorMsg({
        name: 'user',
        message: errorMessage
    });
    this.callStaus(STATUS.FAILED, errorMessage);
};

var instantMeter = document.querySelector('#instant meter');
var slowMeter = document.querySelector('#slow meter');
var instantValueDisplay = document.querySelector('#instant .value');
var slowValueDisplay = document.querySelector('#slow .value');
RtcClient.prototype.onGetStream = function(stream) {
    console.log('Got access to local media with mediaConstraints:' + JSON.stringify(this.mediaConstraints_));
    this.onUserMediaSuccess(stream);
    this.startCall();
    this.addSoundMeter(stream);
};

RtcClient.prototype.addSoundMeter = function(stream) {
    if (this.mediaConstraints_.audio && !window.soundMeter) {
        console.log("add sound meter");
        var soundMeter = window.soundMeter = new SoundMeter();
        soundMeter.connectToSource(stream, function(e) {
            if (e) return;
            window.soundMeterTimer = setInterval(function() {
                instantMeter.value = instantValueDisplay.innerText = soundMeter.instant.toFixed(2);
                slowMeter.value = slowValueDisplay.innerText = soundMeter.slow.toFixed(2);
            }, 200);
        });
    }
};

RtcClient.prototype.delSoundMeter = function() {
    if (window.soundMeter) {
        console.log("delete sound meter");
        if (window.soundMeterTimer) {
            clearInterval(window.soundMeterTimer);
        }
        window.soundMeter.stop();
        window.soundMeter = false;
    }
};

RtcClient.prototype.addSessions = function(list) {
    console.log('add session:' + list);
    list.forEach(function(i) {
        this.session.add(i);
    }.bind(this));

    this.session.forEach(function(v, k, s) {
        console.log('v[' + v + '] = ' + k);
    });

    this.sendEvent(CONSTANTS.updateAddSessions, JSON.stringify(list));
};

RtcClient.prototype.onLogIn = function(msg) {
    //var ack = JSON.parse(msg);
    var str ='<div>"'+number+'" + receiver: + "'+JSON.stringify(msg)+'"</div>'
    $("body").append(str);
    number++;
    if (msg.success) {
        document.getElementById('username').value = this.peerid_;
        document.getElementById('username').disabled = true;
        document.getElementById('login').disabled = true;
        this.logIn = true;
        this.createCall();

    var names = this.call_.getPeerClientNames();
        this.addSessions(names);
        for (var x in names) {
            var client = this.call_.peerClients_[names[x]];
            client.updateCallStaus(client.sessStatus.status);
        }
        console.log("this.needCallAfterLogIn:" + this.needCallAfterLogIn);
        if (this.needCallAfterLogIn && this.callee_ != null) {
            this.needCallAfterLogIn = false;
            document.getElementById('peerid').value = this.callee_;
            this.addSessions(this.callee_);
            //todo:delete here
            console.info(this.mediaConstraints_);
            if (this.mediaConstraints_.audio || this.mediaConstraints_.video) {
                //todo
                var str ='<div>navigator.mediaDevices.getUserMedia</div>'
                $("body").append(str);
                number++;
                navigator.mediaDevices.getUserMedia(this.mediaConstraints_).then(this.onGetStream.bind(this)).
                catch (function(error) {
                    this.onUserMediaError(error);
                }.bind(this));
            } else {
                //send neither audio nor video
                this.onGetStream(null);
            };
        } else {
            console.warn("callee is empty")
        };
    } else {
        errorMsg({
            name: 'user',
            message: msg.msg
        });
    };
};

RtcClient.prototype.onAddCall = function(msg) {
    var str ='<div>"'+number+'" + receiver: + "'+JSON.stringify(msg)+'"</div>'
    $("body").append(str);
    number++;
    var req = JSON.parse(msg);
    console.log("add call from " + msg);
    if (typeof(window.rtcclient) != 'undefined') {
        var arr = req.to.split(",");
        var callee = arr.filter(w => !this.session.has(w))
        if (callee.length == 0) {
            console.log("empty")
            return
        };
        window.rtcclient.callee_ = callee
        console.log(window.rtcclient.callee_)
        window.rtcclient.needCallAfterLogIn = true
        window.rtcclient.onLogIn({
            success: true
        });
    };
};

RtcClient.prototype.deleteSession = function(name) {
    this.session.delete(name);
    this.session.forEach(function(v, k, s) {
        console.log('v[' + v + '] = ' + k);
    });

    this.sendEvent(CONSTANTS.updateDelSessions, JSON.stringify([name]));
    if (this.session.size == 0) {
        this.delSoundMeter();
    }
};

RtcClient.prototype.SetVideoVolume = function(name, val) {
    var a = document.getElementById(name + "AUDIOVIDEO");
    if (a == null) {
        console.warn(name + " not exists");
        return;
    };

    if (val > 1.0 || val < 0.0) {
        console.warn("invalid value:" + val);
        return;
    };
    console.warn("volume changes from " + a.volume + " to " + val);
    a.volume = val;
};

RtcClient.prototype.onSetVolume = function(msg) {
    console.log("set volume " + msg);
    var req = JSON.parse(msg);
    this.SetVideoVolume(req.peer, req.val);
};

RtcClient.prototype.onDeleteCall = function(msg) {
    var str ='<div>"'+number+'" + receiver: + "'+JSON.stringify(msg)+'"</div>'
    $("body").append(str);
    number++;
    console.log("delete call from " + msg);
    var req = JSON.parse(msg);
    var ids = req.to.split(",");
    var i = ids.length;
    while (i--) {
        if (typeof(window.rtcclient) != 'undefined' && !isEmptyObject(window.rtcclient.call_)) {
            var disconnect = {
                from: ids[i],
                ack: true
            };
            window.rtcclient.call_.stopPeer(JSON.stringify(disconnect));
            window.rtcclient.deleteSession(ids[i]);
        };
    };
};

RtcClient.prototype.onCallRequest = function(msg) {
    var str ='<div>"'+number+'" + receiver: + "'+JSON.stringify(msg)+'"</div>'
    $("body").append(str);
    number++;
    var req = JSON.parse(msg);
    navigator.mediaDevices.getUserMedia(this.mediaConstraints_).then(function(stream) {
        console.log('Got access to local media with mediaConstraints:' + JSON.stringify(this.mediaConstraints_));
        this.onUserMediaSuccess(stream);
        this.sendEvent(CONSTANTS.callResponse, JSON.stringify({
            to: req.from,
            response: true
        }));
        console.log('call req from ' + req.from + ', response true');
    }.bind(this)).
    catch (function(error) {
        this.onUserMediaError(error);
        this.sendEvent(CONSTANTS.callResponse, JSON.stringify({
            to: req.from,
            response: false
        }));
        console.log('call req from ' + req.from + ', response false');
    }.bind(this));

    this.callStaus(STATUS.RESPONSE);
};

RtcClient.prototype.onCallResponse = function(res) {
     var str ='<div>"'+number+'" + receiver: + "'+JSON.stringify(res)+'"</div>'
    $("body").append(str);
    number++;
    clearTimeout(this.reqTimer);
    console.log(res);
    var ack = JSON.parse(res);

    if (ack.response) {
        var params = {};
        params.type = CONSTANTS.peerOffer;
        params.peers = [ack.from];
        params.offerOptions = {};
        params.offerOptions.offerToReceiveVideo = this.recvvideo;
        params.offerOptions.offerToReceiveAudio = this.recvaudio;
        var str ='<div>"onCallResponse-videoaudio" + '+this.recvvideo+' + '+this.recvaudio+'</div>'
        $("body").append(str);
        number++;

        params.audioRecvBitrate = this.audioRecvBitrate;
        params.serverUrl = iceUrl;
        params.stream = this.localStream_;
        this.call_.addPeer(params);
    } else {
        errorMsg({
            name: ack.from,
            message: ack.msg
        });
        //if (ack.msg.indexOf("User") != -1) {
        //   this.callStaus(STATUS.FAILED, ack.msg);
        // } else {
        window.rtcclient.deleteSession(ack.from);
        this.callStaus(STATUS.RETRY, ack.msg);
        //};
    };
};

RtcClient.prototype.onIce = function(iceStr) {
     var str ='<div>"'+number+'" + receiver: + "'+JSON.stringify(iceStr)+'"</div>'
    $("body").append(str);
    number++;
    var ice = JSON.parse(iceStr);
    var candidate = {};
    candidate.candidate = ice.candidate;
    candidate.sdpMid = ice.sdpMid;
    candidate.sdpMLineIndex = ice.sdpMLineIndex

    this.call_.dealIceCandidate({
        from: ice.from,
        ice: candidate
    });
};

RtcClient.prototype.onDiscPeer = function(msg) {
    var str ='<div>"'+number+'" + receiver: + "'+JSON.stringify(msg)+'"</div>'
    $("body").append(str);
    number++;
    msg.ack = false;
    this.call_.stopPeer(msg);
    this.callStaus(STATUS.RETRY);
};

RtcClient.prototype.onAnswer = function(answerSDP) {
    var str ='<div>"'+number+'" + receiver: + "'+JSON.stringify(answerSDP)+'"</div>'
    $("body").append(str);
    number++;
    this.call_.dealAnswer(answerSDP);
};

RtcClient.prototype.onOffer = function(offerSDP) {
    var str ='<div>"'+number+'" + receiver: + "'+JSON.stringify(offerSDP)+'"</div>'
    $("body").append(str);
    number++;
    console.info('offer from: ' + offerSDP);
    var params = {
        stream: this.localStream_,
        offer: offerSDP
    };
    params.offerToReceiveVideo = this.recvvideo;
    this.call_.dealOffer(params);
};

RtcClient.prototype.createCall = function() {
    if (isEmptyObject(this.call_)) {
        this.call_ = new Call();
        this.call_.sendSignalingMessage = function(params) {
            this.sendEvent(params.type, params.content);
        }.bind(this);
    };
};

RtcClient.prototype.startCall = function() {
    if (this.callee_.length == 0) {
        errorMsg({
            name: 'user',
            message: 'callee is empty'
        });
        return;
    };
    var req = {
        ids: this.callee_
    };
    console.log(req);
    this.sendEvent(CONSTANTS.callRequest, JSON.stringify(req));
    this.callStaus(STATUS.REQUST);
    this.reqTimer = setTimeout(function() {
        req.ids.forEach(function(id) {
            window.rtcclient.deleteSession(id);
        });
        this.callStaus(STATUS.RETRY, "request time out!");
    }.bind(this), 6000);

};

RtcClient.prototype.addPeer = function(name) {
    this.call_.addPeer(name);
};

RtcClient.prototype.stopStream = function() {
    console.info("stop stream");
    if (!isEmptyObject(this.localStream_)) {
        this.localStream_.getTracks().forEach(function(track) {
            track.stop();
        });
        delete this.localStream_;
        this.localStream_ = null;
    };

};

RtcClient.prototype.leave = function(name) {
    if (isEmptyObject(this.call_)) {
        return;
    }
    var names = this.call_.getPeerClientNames();
    for (var x in names) {
        this.deleteSession(names[x]);
    }
    if (!isEmptyObject(this.call_)) {
        this.call_.leave();
    };

    this.stopStream();
};

function on_login() {
    var name = new Date().getTime().toString() + 'x';
    $("#username").val(name);
    if (name.length != 0) {
        this.needCallAfterLogIn = true;
        window.rtcclient.peerid_ = name;
        window.rtcclient.sendEvent(CONSTANTS.logIn, JSON.stringify({
            username: window.rtcclient.peerid_,
            passwd: window.rtcclient.passwd
        }));
    } else {
        err = 'Username cannnot be empty';
        errorMsg({
            name: 'user',
            message: err
        });
    };
};

function on_rtc() {
    var id_string = ["5A8314EC835C329250444352415052450000"];
    if (id_string.length) {
        window.rtcclient.needCallAfterLogIn = true;
        window.rtcclient.callee_ = id_string;
        window.rtcclient.onLogIn({
            success: true
        });
    } else {
        err = 'Callee is empty';
        errorMsg({
            name: 'user',
            message: err
        });
    };
};

function on_leave() {
    if (typeof(window.rtcclient) != 'undefined' && !isEmptyObject(window.rtcclient.call_)) {
        window.rtcclient.leave();
        document.getElementById('leave').hidden = true;
        document.getElementById('leave').disabled = true;
    };
};

window.onload = function() {
    // var params = {};
    // params.caller = getQueryString('caller');
    // params.callee = getQueryString('callee');
    var params ={
        sendaudio:false,
        sendvideo:false,
        recvaudio:true,
        recvvideo:true,
        caller:null,
        callee:null
    };
    // if (getQueryString('sendaudio') == "false") {
        // params.sendaudio = false;
    // } else {
    //     params.sendaudio = true;
    // };

    // if (getQueryString('sendvideo') == "true") {
        // params.sendvideo = true;
    // } else {
        // params.sendvideo = false;
    // };

    // if (getQueryString('recvvideo') == "true") {
        // params.recvvideo = true;
    // } else {
    //     params.recvvideo = false;
    // };

    // if (getQueryString('recvaudio') == "false") {
        // params.recvaudio = false;
    // } else {
    //     params.recvaudio = true;
    // };

    params.audioRecvBitrate = getQueryString('audioRecvBitrate');

    params.mediaConstraints = {
        video: params.sendvideo
    };

    if (params.sendaudio) {

        params.mediaConstraints.audio = {
            googAutoGainControl: true,
            googAutoGainControl2: true,
            echoCancellation: true,
            googNoiseSuppression: true,
            googHighpassFilter: true,
            googTypingNoiseDetection: true,
        }
    } else {
        params.mediaConstraints.audio = false;
    };
    //todo
    var str ='<div>"onload-videoaudio" + '+params.recvvideo+' + '+params.recvaudio+'</div>'
    $("body").append(str);
    number++;
    window.rtcclient = new RtcClient(params);
};
window.onunload = function() {
    window.rtcclient.leave();
    window.rtcclient.sendEvent(CONSTANTS.logOut, JSON.stringify({username:window.rtcclient.peerid_ , passwd:window.rtcclient.passwd}));
    delete window.rtcclient;
};
(function(r){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=r()}else if(typeof define==="function"&&define.amd){define([],r)}else{var e;if(typeof window!=="undefined"){e=window}else if(typeof global!=="undefined"){e=global}else if(typeof self!=="undefined"){e=self}else{e=this}e.base64js=r()}})(function(){var r,e,n;return function(){function r(e,n,t){function o(f,i){if(!n[f]){if(!e[f]){var u="function"==typeof require&&require;if(!i&&u)return u(f,!0);if(a)return a(f,!0);var v=new Error("Cannot find module '"+f+"'");throw v.code="MODULE_NOT_FOUND",v}var d=n[f]={exports:{}};e[f][0].call(d.exports,function(r){var n=e[f][1][r];return o(n||r)},d,d.exports,r,e,n,t)}return n[f].exports}for(var a="function"==typeof require&&require,f=0;f<t.length;f++)o(t[f]);return o}return r}()({"/":[function(r,e,n){"use strict";n.byteLength=d;n.toByteArray=h;n.fromByteArray=p;var t=[];var o=[];var a=typeof Uint8Array!=="undefined"?Uint8Array:Array;var f="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";for(var i=0,u=f.length;i<u;++i){t[i]=f[i];o[f.charCodeAt(i)]=i}o["-".charCodeAt(0)]=62;o["_".charCodeAt(0)]=63;function v(r){var e=r.length;if(e%4>0){throw new Error("Invalid string. Length must be a multiple of 4")}var n=r.indexOf("=");if(n===-1)n=e;var t=n===e?0:4-n%4;return[n,t]}function d(r){var e=v(r);var n=e[0];var t=e[1];return(n+t)*3/4-t}function c(r,e,n){return(e+n)*3/4-n}function h(r){var e;var n=v(r);var t=n[0];var f=n[1];var i=new a(c(r,t,f));var u=0;var d=f>0?t-4:t;for(var h=0;h<d;h+=4){e=o[r.charCodeAt(h)]<<18|o[r.charCodeAt(h+1)]<<12|o[r.charCodeAt(h+2)]<<6|o[r.charCodeAt(h+3)];i[u++]=e>>16&255;i[u++]=e>>8&255;i[u++]=e&255}if(f===2){e=o[r.charCodeAt(h)]<<2|o[r.charCodeAt(h+1)]>>4;i[u++]=e&255}if(f===1){e=o[r.charCodeAt(h)]<<10|o[r.charCodeAt(h+1)]<<4|o[r.charCodeAt(h+2)]>>2;i[u++]=e>>8&255;i[u++]=e&255}return i}function s(r){return t[r>>18&63]+t[r>>12&63]+t[r>>6&63]+t[r&63]}function l(r,e,n){var t;var o=[];for(var a=e;a<n;a+=3){t=(r[a]<<16&16711680)+(r[a+1]<<8&65280)+(r[a+2]&255);o.push(s(t))}return o.join("")}function p(r){var e;var n=r.length;var o=n%3;var a=[];var f=16383;for(var i=0,u=n-o;i<u;i+=f){a.push(l(r,i,i+f>u?u:i+f))}if(o===1){e=r[n-1];a.push(t[e>>2]+t[e<<4&63]+"==")}else if(o===2){e=(r[n-2]<<8)+r[n-1];a.push(t[e>>10]+t[e>>4&63]+t[e<<2&63]+"=")}return a.join("")}},{}]},{},[])("/")});