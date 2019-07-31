var initSystem = (function($,oUtils,currentRInfo,volumeColumn){
    //创建可选的studioR列表
    function getQueryVariable(variable){
            var query = window.location.search.substring(1);
            var vars = query.split("&");
            for (var i=0;i<vars.length;i++) {
                    var pair = vars[i].split("=");
                    if(pair[0] == variable){return pair[1];}
            }
            return(false);
    }
    var session = getQueryVariable("session");
	if(!session){
		session = localStorage.getItem("session");
	}
    function initStudioRList(studioRList, studioBehavior) {
        if (!studioBehavior) { //没有用户行为记录
            if (!studioRList) return;
            var studioRListArr = JSON.parse(decodeURIComponent(studioRList)),
                studioRListArr = studioRListArr.sort(compareStatus),
                listHtml = "";
            studioRListArr.forEach(function (v, i) {
                var statusClass = v.status > 0 ? "online" : "";
                listHtml += '<li class="rList-item ellipsis ' + statusClass + '" data-status="' + v.status + '" data-version="' + v.version + '" data-peerId="' + v.peerId + '" data-rIp="' + v.ip + '" data-port="' + v.port + '" title="' + v.name + '">' + v.name + '</li>';
            });
            $(".main-rList .rList-content").html(listHtml);
            $(".main-rList .rList-content").fnNiceScroll();
            $(".pretreat-content").fnNiceScroll();

            $(".main-rList .rList-show").html(studioRListArr[0].name).attr({
                "data-status": studioRListArr[0].status,
                "data-version": studioRListArr[0].version,
                "data-peerId": studioRListArr[0].peerId,
                "data-rIp": studioRListArr[0].rIp,
                "data-port": studioRListArr[0].port,
                "title": studioRListArr[0].name
            });
            currentRInfo.isLive = studioRListArr[0].status;
            currentRInfo.selectRId = studioRListArr[0].peerId;
            pageWebsocketObj.init(studioRListArr[0].peerId); //更新当前R信息
            // volumesPageRequest.init(studioRListArr[0].peerId);//更新音量柱的信息
            pageRequestObj.shareNum(studioRListArr[0].peerId); //更新当前R账号的分享状态
            volumeControlObj.init(studioRListArr[0].peerId);//保存开启音量的websocket
        } else { //有用户行为记录
            var userBehavior = JSON.parse(decodeURIComponent(studioBehavior));
            $(".main-rList .rList-show").html(userBehavior.SelectR.rname).attr({
                "data-status": userBehavior.SelectR.status,
                "data-version": userBehavior.SelectR.version,
                "data-peerId": userBehavior.SelectR.peerId,
                "data-rIp": userBehavior.SelectR.rIp,
                "data-port": userBehavior.SelectR.port,
                "title": userBehavior.SelectR.rname
            });
            currentRInfo.isLive = userBehavior.SelectR.status;
            currentRInfo.selectRId = userBehavior.SelectR.peerId;
            pageWebsocketObj.init(userBehavior.SelectR.peerId); //更新当前R信息
            // volumesPageRequest.init(userBehavior.SelectR.peerId);//更新音量柱的信息
            pageRequestObj.shareNum(userBehavior.SelectR.peerId); //更新当前R账号的分享状态
            volumeControlObj.init(userBehavior.SelectR.peerId);//保存开启音量的websocket
        }
    }
    //根据R状态来排序 在线的R优先往前
    function compareStatus(obj1, obj2) {
        var val1 = obj1.status;
        var val2 = obj2.status;
        if (val1 < val2) {
            return 1;
        } else if (val1 > val2) {
            return -1;
        } else {
            return 0;
        }
    }
    //创建一个对象管理pagewebsocket接口（一个通道）
    function PageWebsocket() {
        this.socket = null;
        this.onchanging = null;
        this.studioFlag = null;
    }
    PageWebsocket.prototype = {
        constructor: PageWebsocket,
        init: function (rid) {
            var that = this;
            that.onchanging = 1;
            that.socket = oUtils.socket({
                url: 'pagewebsocket',
                error: function (err) {
                    console.log(err);
                },
                param: {
                    pid: rid,
                    identifyId: new Date().getTime(),
					session:session
                }
            });
            this.studioFlag = true;
            this.uploadInfo();
            this.kernelState(); 
            this.volumeInfo();//获取音量柱的实时信息
        },
        volumeInfo:function(){
            var msg = { "categoryId": "2152871168", "operationType": "703" },
                that = this;
            this.socket.send({
                message: msg,
                time: 200,
                key: "volumeInfo",
                success: function (response) {
                    if (response.data) var data = JSON.parse(response.data);
                    volumeColumn.getVideoVolumeColumn(data);
                }
            })
        },
        uploadInfo: function () { //producer:更新当前R上状态信息:垫片数量，cut&mute状态等
            var msg = { "categoryId": "2152871168", "operationType": "101" },
                that = this;
            this.socket.send({
                message: msg,
                time: 1000,
                key: "uploadInfo",
                success: function (response) {
                    // console.log(response.data);
                    if (response.data) var data = JSON.parse(response.data);
                    if (data) {
                        that.onchanging++;
                        if (that.onchanging < 2) return; //后台缓存，数据更新滞后，每次恢复接口时，第一次数据不取  
                        // getCurrentRInforSocket(data);
                        updateCurrentRInfo(data);
                        that.studioFlag = true;

                    } else if (response.errorMessage === "Module Not Found." && that.studioFlag) { // R上studio模块未开启
                        // oUtils.alertTips("i18n_notFindProducerProModule", 1500);
                        that.studioFlag = false;
                        return;
                    }
                }
            })
        },
        kernelState: function () {//producer:更新当前R正在live的T信息
            var msg = { "categoryId": "2152857600", "operationType": "102" };
            this.socket.send({
                message: msg,
                time: 1000,
                key: "kernelState",
                success: function (response) {
                    if (response.data) var livePerrId = JSON.parse(response.data).CurrentTStrIdHex;
                    $(".main-preview").attr("data-livePeerId", livePerrId);
                }
            })
        },
        stop: function () {
            if (this.socket.has("uploadInfo")) {
                this.socket.stop('uploadInfo');
                this.onchanging = 0;
            }
            if (this.socket.has("volumeInfo")) {
                this.socket.stop('volumeInfo');
            }
        },
        recover: function () {
            if (!this.socket.has("uploadInfo")) {
                this.uploadInfo();
                this.onchanging = 0;
            }
            if (!this.socket.has("volumeInfo")) {
                this.volumeInfo();
            }
            // if(!this.socket.has("kernelState")) this.kernelState();
        },
        close: function () {
            if (this.socket) this.socket.off();
            this.onchanging = null;
            this.studioFlag = null;
        }
    }
    var pageWebsocketObj = new PageWebsocket();
    //创建对象管理页面通过webrtc拿到的视频
    var webrtcVideo = {
        peerIds: [],
        initFlag: true,
        mainTimer: null,
        listTimer: null,

        clear: function () {
            this.peerIds = [];
            if (this.mainTimer) clearInterval(this.mainTimer);
            if (this.listTimer) clearInterval(this.listTimer);
            this.mainTimer = null;
            this.listTimer = null;
        },
        initMainVideo: function (inputId, outputId,data) { //创建预览，输出两个大的视频
            if (this.initFlag) {
                this.initFlag = false;
                if($(".preview-source .audio").length==0){
                    var that = this,
                        ccId = new Date().getTime().toString() + 'x';
                    var username = $("#user_info_name").html().trim();
                    currentRInfo.webrtcLogin = username+ccId
                    on_login(username+ccId);    //创建ID，调用webRTC,创建输入视频
                    console.log(inputId+"创建pvw");
                    currentRInfo.rtcIdList.pvw = inputId;
                    currentRInfo.rtcIdList.pvw.data = data;
                    on_rtc(inputId);
                }
                //!currentRInfo.outputPreview
                if($(".preview-source .audio").length != 0 && $(".output-source .audio").length == 0 && currentRInfo.rtcIdList.pgm.id.length == 0){
                    console.log(outputId+"创建pgm");
                    currentRInfo.rtcIdList.pgm.id = outputId;
                    currentRInfo.rtcIdList.pgm.data = data;
                    on_rtc(outputId);
                    if(peerClientStatusArr.clearDisconnectPrompt==true){//此处代表视频已经恢复，需要清除提示
                        peerClientStatusArr.clearDisconnectPrompt=false;
                        if($(".simulate_popupBtnsContainer").length!==0){
                            $("body .simulate_popupBtnsContainer .alert_sureBtn").trigger("click");
                        }
                    }
                }
            } else {
                if($(".preview-source .audio").length != 0 && $(".output-source .audio").length == 0 && currentRInfo.rtcIdList.pvw.length == 0 && currentRInfo.rtcIdList.pgm.id.length ==0){
                    var _this = this;
                    _this.initFlag = true;
                }
            } 
        },
        updateVideoList: function (arr, objArr, data) { //创建preview list 一系列的小的视频
            var that = this;
            var temPeerId = compareArr(that.peerIds, arr);
            that.peerIds = cloneArr(arr);
            if (temPeerId) {
                if (temPeerId.add.length > 0) { //新增了
                    var addObjArr = rePeerIdObj(objArr, temPeerId.add);
                    console.log("增加了",temPeerId.add);
                    // if (that.listTimer) clearInterval(that.listTimer);
                    // that.listTimer = setInterval(function () {
                        if ($(".main-output .audio").length > 0 && peerClientStatusArr.resetVideoList.length == 0) { //等到主区域视频都出来后，再创建preview list
                            // clearInterval(that.listTimer);
                            console.log(temPeerId.add+"创建list");
                            currentRInfo.rtcIdList.preLis.idArr = currentRInfo.rtcIdList.preLis.idArr.concat(temPeerId.add);
                            currentRInfo.rtcIdList.preLis.data = currentRInfo.rtcIdList.preLis.data.concat(addObjArr);
                            on_rtc(temPeerId.add,addObjArr);
                            if($(".pretreat-content .pretreat-content-item").length <= 0){
                                clearInterval(statusObj.previewListTimer);
                                statusObj.previewListTimer = setInterval(function () {
                                    if (peerClientStatusArr.previewList&&isrestoreHistory){
                                        clearInterval(statusObj.previewListTimer);
                                        peerClientStatusArr.previewList = false;
                                        if(statusObj.pageInit){
                                            statusObj.pageInit = false;
                                            isrestoreHistory=false;
                                            initOverlay.firstOverlyShow();
                                            clearInterval(statusObj.clockInitTimer);
                                            statusObj.clockInitTimer = setInterval(function(){
                                                if(calPts($(".main-preview .main-player").attr("id"))){
                                                    clearInterval(statusObj.clockInitTimer);
                                                    initOverlay.firstClockInit();
                                                }
                                            },500);
                                            
                                        }
                                    }
                                }, 100);
                            }
                        }else{
                            temPeerId.add.forEach(function(v,i){
                                var index = that.peerIds.indexOf(v);
                                if (index > -1) {
                                    that.peerIds.splice(index, 1);
                                }
                            })
                        }
                    // }, 200);
                }
                if (temPeerId.sub.length > 0) { //减少了
                    console.log("减少了",temPeerId.sub);
                    temPeerId.sub.forEach(function (v, i) {
                        on_leave(v); //停掉webRTC
                        $("#" + v).parents(".preview-item").remove();//移除标签
                    });
                    var eleRArr = $(".preview-content .preview-item");
                    $.each(eleRArr,function(i,v){
                        $(v).find(".preview-item-num").html(i+1);
                    });
                }
            }
        }
    }
    //复制数组
    function cloneArr(arr) {
        var newArr = [];
        arr.forEach(function (v, i) {
            newArr.push(v);
        });
        return newArr;
    }
    //判断数据的变化，增加的，减少的分别列出来
    function compareArr(origin, arr) {
        var obj = {},
            addArr = [],
            subArr = [];
        origin.forEach(function (v, i) {
            if (arr.indexOf(v) < 0) subArr.push(v);
        });
        arr.forEach(function (v, i) {

            if (origin.indexOf(v) < 0) addArr.push(v);
        });
        if (addArr.length > 0 || subArr.length > 0) {
            obj.add = addArr;
            obj.sub = subArr;
            return obj;
        } else {
            return null;
        }
    }
    //从数据中选择peerId，创建新数组
    function rePeerIdObj(arr, idArr) {
        var temArr = [];
        arr.forEach(function (v, i) {
            if (idArr.indexOf(v.PreviewID) > -1) temArr.push(v);
        });
        return temArr;
    }
    //uploadInfo接口回调
    function updateCurrentRInfo(data) {
        webrtcVideo.initMainVideo([data.InputPreviewWebRTCUserID], [data.OutputPreviewWebRTCUserID],data);
        if (data.SourceListPreview) {
            var curPeerIdArr = [], peerIdObjArr = [],SourceType='';
            sourceList.uploadFileShimArr=[];//清除原先保存的上传垫片的信息
            sourceList.uploadIpShimArr=[];//清除原先保存的ip source的信息
                // currentRInfo.isFlv = true;
                data.SourceListPreview.forEach(function (v, i) {
                    if (v["PreviewShm"].IsEnabled&&v.IsPreivewing) {
                    // if (v["PreviewShm"].IsEnabled) {
                        curPeerIdArr.push(v.PreviewID);
                        peerIdObjArr.push(v);
                    }
                    //保存用户上传的垫片信息
                    SourceType = v["PreviewShm"]["SourceType"];
                    if(SourceType==100){
                        sourceList.uploadFileShimArr.push(v);
                    };
                    if(SourceType==200 && !v["PreviewShm"]["SharedMemoryName"].endsWith("(File Shim)")){
                        //清除ip对应的文件名中的禁止删除
                        sourceList.uploadIpShimArr.push(v);
                    }
                });
            webrtcVideo.updateVideoList(curPeerIdArr, peerIdObjArr,data);
        }
        //根据接口的返回，previewList中哪些是当前preview，哪些是当前output
        var previewFilename = data.CurrentInputPreviewShm.SharedMemoryName,
            outputFilename = data.CurrentEncoderSharedMemory.SharedMemoryName;
            updateMainPreview(previewFilename);
            updateMainOutput(outputFilename);
        if(data.CurrentPIPList!=null&&data.CurrentPIPList.length>0){
            var pipFilename = data.CurrentPIPList[0]["id"];
            var outputPipObj = $(".sd-preview-list .preview-item[data-filename='"+pipFilename+"']");
            if(outputPipObj.length>0){
               outputPipObj.addClass("pipOutputActive").siblings().removeClass("pipOutputActive");
            }
         }
        //获取当前视频上传logo的信息
        $(".main-preview").attr({
            "data-logoUrl": data.UploadLogoUrl,
            "data-logoMaxH": data.LogoMaxHeight,
            "data-logoMaxW": data.LogoMaxWidth,
            "data-maxCopierCount": data.MaxCopierCount
        });
        //根据返回信息重新修改T的宽高
        widthAndHeight.resolutionW = data.SwitchBusScaleFormat.Width;
        widthAndHeight.resolutionH = data.SwitchBusScaleFormat.Height;
        //更新当前处于分享的账号数目
        statusObj.resolutionArray=[]; 
        if (data.EncoderList.length > 0) { //处于分享状态
            var curShareNum = 0,gridNum = 0;
            for(var j=0;j<data.EncoderList.length;j++){
                var encoderList = data.EncoderList[j];
                var resoluList=data.EncoderList[j].Resolution;
                var VBitrate=data.EncoderList[j].VBitrate;
                statusObj.resolutionArray.push(resoluList+"&"+VBitrate);
                for(var i=0;i<encoderList.CopierList.length;i++){
                    var copier = encoderList.CopierList[i];
                    if(copier.Type==5){
                        gridNum++;
                        var rip=$(".rList-show").attr("data-rip");
                        var OutputPort=copier.OutputPort;
                        $("#girdUrlShow img").css("display","none");
                        $(".gridIssp").attr("data-issp","yes");
                        $(".gridIssp").val("issp://"+rip+":"+OutputPort);
                    }else{
                        curShareNum++;
                    }
                }
            }
            if ($(".output-top .shareCounts").html() != curShareNum) {
                $(".output-top .shareCounts").html(curShareNum).attr("data-encoder", data.EncoderList.length);
                if (!$(".output-top .shareCounts").hasClass("active")) $(".output-top .shareCounts").addClass("active");
            }
        } else {
            if ($(".output-top .shareCounts").html() != "0") $(".output-top .shareCounts").html(0).removeClass("active").removeAttr("data-encoder");
        }
        checkAfv(data);
    }
    function checkAfv(data){
        if(currentRInfo.IsAudioFollowVideo==0||currentRInfo.IsAudioFollowVideo==1){
            currentRInfo.IsAudioFollowVideo++;
            return false;
        }else{
            currentRInfo.IsAudioFollowVideo = undefined;
        }
        if(data.IsAudioFollowVideo==true){//afv开启的情况下的操作
            $(".afv-cut .radius-box").removeClass("close");
            $(".afv-cut .radius-box").css({left:"11px"});
            $(".afv-cut .afv-audio").addClass("disabled");
            $(".afv-audio").html("Audio 1");
            if($(".main-output .icon-erphone").hasClass("active")){
                $("video").prop("volume",0);
                $(".main-output .main-player").prop("volume",1);
                $(".main-output .main-player")[0].muted=false;
                if($(".output-source .pip").length!=0&&currentRInfo.outputPreview){
                    var pipFilename = $(".output-source .pip").attr("data-pipvideosharedmemoryname");
                    $(".main-output .pip video").prop("volume",$(".preview-content .preview-item[data-filename='"+pipFilename+"'] .voice-value").html().trim()/100);
                    $(".main-output .pip video")[0].muted=false;
                }
            }
        }else{//afv关闭的情况
            $(".afv-cut .radius-box").addClass("close");
            $(".afv-cut .radius-box").css({left:"0px"});
            var SharedMemoryName = data.AudioOnlyShm["SharedMemoryName"];
            var previewObj = $(".preview-content .preview-item[data-filename='"+SharedMemoryName+"']");
            var index = previewObj.index();
            $(".afv-audio").html("Audio "+(index+1));
            $(".afv-audio").removeClass("disabled");
            if($(".main-output .icon-erphone").hasClass("active")){
                $("video").prop("volume",0);
                // if(currentRInfo.outputPreview){
                //     var outputFilename = $(".main-output").attr("data-filename");
                //     if(outputFilename==SharedMemoryName){
                //         $(".main-output .main-player").prop("volume",1);
                //         $(".main-output .main-player")[0].muted=false;
                //     }else{
                //         previewObj.find("video").prop("volume",previewObj.find(".voice-value").html().trim()/100);
                //         previewObj.find("video")[0].muted=false;
                //     }
                // }else{
                    $(".main-output .main-player").prop("volume",1);
                    $(".main-output .main-player")[0].muted=false;  
                // }
            }
        }
    }
    var isFirstToken = false;
    //更新R的状态
    function PageRequest() {
        this.socket = null;
    }
    PageRequest.prototype = {
        constructor: PageRequest,
        init: function () {
            // this.socket = oUtils.socket({
            //     url: "pageRequest",
            //     error: function (err) {
            //         console.log(err);
            //     }
            // });
            var that = this;
            that.socket = oUtils.socket({
                url:'pageRequest?statusChange=1&session='+session,
                error:function(err){
                    console.log(err);
                },
                successObj:{
                    'instanceStatusChange':function(data) { // This function used to update the pageControlCount value
                        if(data.instanceStatus=="Running"){
                            $(".progress p").html(switchLangObj.i18n_initialize);
                            clearInterval(progressTimer);
                            console.log("第三阶段开始");
                            $(".progress .progress-status").html("88%");
                            $(".progress .meter .compelete").css("width","88%");
                            initprogressTime=88;
                            progressTimer=setInterval(function(){
                                initprogressTime++;
                                var initprogressTimes=initprogressTime;
                                var initWidth=initprogressTime+"%";
                                $(".progress .progress-status").html(initprogressTime+"%");
                                $(".progress .meter .compelete").css("width",initWidth);
                                if(initprogressTime==100) clearInterval(progressTimer);
                            },4000);
                            $(".main-cut").css("margin-top","0.2rem");
                        }else if(data.instanceStatus=="ReceiverStarted"){
                            clearInterval(progressTimer);
                            console.log("第三阶段完成");
                            $(".progress .progress-status").html("100%");
                            $(".progress p").html(switchLangObj.i18n_config);
                            $(".progress .meter .compelete").css("width","100%");
                            $(".pp-loading").css("display","none");
                            $(".main-cut").css("margin-top","0.8rem");
                            if(initSystem.pageWebsocketObj.socket!=null)return;
                            getCheckConfig();
                         }
                    },
                    'logo':function(data){
                        if(data.logoCopyStatus=="start"){
                            $(".recover_history .historyContent").html(switchLangObj.i18n_crossRecoverLogo);    
                        }else if(data.logoCopyStatus=="end"){
                            $(".recover_history .historyContent").html(switchLangObj.i18n_crossRecoverLogoEnd); 
                        }
                    },
                    'stream':function(data){
                        if(data.streamCopyStatus=="start"){
                            $(".recover_history .historyContent").html(switchLangObj.i18n_crossRecoverVideo);
                        }else if(data.streamCopyStatus=="end"){
                            $(".recover_history .historyContent").html(switchLangObj.i18n_crossRecoverVideoEnd);    
                        }
                    }
                }
            });
            this.taskInfo();
        },
        taskInfo: function (data) {//更新Rlist和当前R的状态
            var socket = this.socket;
            var receiverArray = [];
            if($(".preview-content li").length==0){
                receiverArray.push($(".main-rList .rList-show").attr("data-peerid"));
                
            }else{
                $.each($(".preview-content li"), function (idx, itm) {
                    receiverArray.push($(itm).attr("data-rid"));
                });
            }
            var tranciverArray=[];
            $.each($(".pack-body .pack-operate"),function(idx, itm){
                tranciverArray.push($(itm).attr("data-peertid"));
            })
            $.each($(".tvupack-body .pack-operate"),function(idx, itm){
                tranciverArray.push($(itm).attr("data-peertid"));
            })
            var taskInfoMsg = {
                type: "taskInfo",
                sourceStr: tranciverArray.join(","),
                programStr: receiverArray.join(",")
            };
            this.socket.send({
                message: taskInfoMsg,
                time: 1000,
                key: 'taskInfo',
                success: function (response) {
                    if (!response.taskInfo) return;
                    var data = JSON.parse(response.taskInfo);
                    var taskrInfo=data[0].rInfo;
                    var tasktInfo=data[0].tInfo;
                    updateRStatus(data[0].rInfo);
                    //如果存在tList列表
                    if(data[0].tInfo){
                        var tListarray = [];
                        for(var i=0;i<tasktInfo.length;i++){
                            var peerId=tasktInfo[i].peerId;
                            var status=tasktInfo[i].status;
                            var TlivePeerId=tasktInfo[i].livePeerId;
                            var name=tasktInfo[i].name;
                            var platform=tasktInfo[i].platform;
                            if(sourceList.tokenDelete){
                                if($(".pack-body").find(".pack-operate[data-peertid='"+peerId+"']").attr("data-status")==2&&status==1){
                                    var param={
                                        "tokenCode.code": $(".preview-qrcode").attr("data-code"),
                                        "peerId": peerId,
                                        "confirm":"Delete"   //Accept接受  Deny拒绝  Delete删除
                                    }
                                    oUtils.ajaxReq("/producerpro/token_confirm",param,function(data) {
                                        var errorCode = data.errorCode;
                                        if(errorCode == "0x0"){
                                            console.log("delete token:",data,"tid:",peerId,"imgCode:")  
                                        }else{
                                            console.log("delete token:",data);
                                        }
                                    })
                                }
                            }
                            $(".pack-body").find(".pack-operate[data-peertid='"+peerId+"']").attr("data-status",status);
                            $(".preview-list-container").find(".preview-item[data-peertid='"+peerId+"']").attr("data-status",status);
                            $(".preview-list-container").find(".preview-item[data-rlivepeerid='"+peerId+"']").attr("data-platform",platform);
                            $(".pack-body").find(".pack-operate[data-peertid='"+peerId+"']").attr("data-tlivePeerId",TlivePeerId);
                            $(".tvupack-body").find(".pack-operate[data-peertid='"+peerId+"']").attr("data-tlivePeerId",TlivePeerId);
                            $(".tvupack-body").find(".pack-operate[data-peertid='"+peerId+"']").attr("data-status",status);
                            var thisObj=$(".tvupack-body .pack-operate[data-peertid='"+peerId+"']");
                            if($(".tvupack-body [data-peertid="+peerId+"]").length!=0){
                                $(".tvupack-body").find(".pack-operate[data-peertid='"+peerId+"']").attr("data-status",status);
                                if(thisObj.attr("data-status")==2){
                                    thisObj.text(switchLangObj.i18n_cancelLive);
                                    thisObj.css({"backgroundColor":"#FF4B4B","border":"1px solid #FF4B4B","color":"#FFF"});
                                    thisObj.siblings('.pack-address ').find("input").css("color","#FF4B4B");
                                    thisObj.siblings('.pack-address').find("input").val(peerId+"/"+name);
                                }else if(thisObj.attr("data-status")==1){
                                    thisObj.text(switchLangObj.i18n_add);
                                    thisObj.css({"backgroundColor":"#20CA48","border":"1px solid #20CA48","color":"#FFF"});
                                    thisObj.siblings('.pack-address').find("input").css("color","#20CA48");
                                    thisObj.siblings('.pack-address').find("input").val(peerId+"/"+name);
                                }else if(thisObj.attr("data-status")==0){
                                    thisObj.text(switchLangObj.i18n_add);
                                    thisObj.css({"backgroundColor":"#999;","border":"1px solid #999;","color":"#666"});
                                    thisObj.siblings('.pack-address').find("input").css("color","#999");
                                    thisObj.siblings('.pack-address').find("input").val(peerId+"/"+name);
                                }else{
                                    thisObj.text(switchLangObj.i18n_add);
                                    thisObj.css({"backgroundColor":"#999;","border":"1px solid #999;","color":"#666"});
                                    thisObj.siblings('.pack-address').find("input").css("color","#999");
                                    thisObj.siblings('.pack-address').find("input").val(peerId+"/"+name+"(No Camera)");
                                }
                            }
                            if(thisObj.attr('data-status')==2){
                                if(thisObj.attr("data-tlivepeerid") != "" || thisObj.attr("data-tlivepeerid") != undefined){
                                    var rId=thisObj.attr("data-tlivepeerid").toUpperCase();
                                    var preRSelectDiv=$(".preview-list-container").find(".preview-item[data-rid='"+rId+"']");
                                    //改变选择列表的值
                                    if(preRSelectDiv.length!=0){
                                       var spanNumber=preRSelectDiv.find(".preview-item-num").text();
                                       thisObj.siblings('.pack-camera').find("span").text(spanNumber);
                                    }else{
                                       thisObj.siblings('.pack-camera').find("span").text(switchLangObj.i18n_Unspecified);
                                    }
                                }
                            }
                        }
                    }
                    for(var i=0;i<taskrInfo.length;i++){
                        var peerId=taskrInfo[i].peerId;
                        var upperCasePeerId=peerId.toUpperCase();
                        var rStatus=taskrInfo[i].status;
                            $(".preview-list-container").find(".preview-item[data-rid='"+upperCasePeerId+"']").attr("data-rStatus",rStatus);
                            var rlivePid = taskrInfo[i].livePeerId;
                            $(".preview-list-container").find(".preview-item[data-rid='"+upperCasePeerId+"']").attr("data-RlivePeerId",rlivePid);
                            $(".preview-list-container").find(".preview-item[data-rid='"+upperCasePeerId+"']").find(".voip-calling").attr("data-RlivePeerId",rlivePid);
                            if(rlivePid!="" && rlivePid.length==16){
                               $(".preview-list-container").find(".preview-item[data-rid='"+upperCasePeerId+"']").find(".voip-calling").css("color","#FFF");
                            }else {
                               $(".preview-list-container").find(".preview-item[data-rid='"+upperCasePeerId+"']").find(".voip-calling").css("color","#666"); 
                            }
                            if($(".preview-list-container").find(".preview-item[data-rid='"+upperCasePeerId+"']").find(".voip-calling").hasClass('Connected')){
                               $(".preview-list-container").find(".preview-item[data-rid='"+upperCasePeerId+"']").find(".voip-calling").css("color","#41FF6D"); 
                            }
                    }
                    receiverArray = [];
                    if($(".preview-content li").length==0){
                        receiverArray.push($(".main-rList .rList-show").attr("data-peerid"));  
                    }else{
                        $.each($(".preview-content li"), function (idx, itm) {
                            receiverArray.push($(itm).attr("data-rid"));
                        });
                    }
                    tranciverArray=[];
                    $.each($(".pack-body .pack-operate"),function(idx, itm){
                        tranciverArray.push($(itm).attr("data-peertid"));
                    })
                    $.each($(".tvupack-body .pack-operate"),function(idx, itm){
                        tranciverArray.push($(itm).attr("data-peertid"));
                    })
                    var taskInfoMsg = {
                        type: "taskInfo",
                        module:"taskInfo",
                        sourceStr: tranciverArray.join(","),
                        programStr: receiverArray.join(",")
                    };
                    socket.sendMsgs["taskInfo"].message = taskInfoMsg;
                }
            })
        },
        listTokenDevice4Pro: function(data,tList) {
            var socket =  this.socket;
            var paras ={
                    code:data,
                    type:"listTokenDevice4Pro",
                    module:"listTokenDevice4Pro"
                };

            this.socket.send({
                message:paras,
                time:3000,
                key:'listTokenDevice4Pro',
                success: function(response) {
                    var result = response.tokenDevice;
                    var tList = JSON.parse(result).tList,tStatus=undefined;
                    if(($(".QrCode ").css("display")=="block")){
                        $(".QrCode ").attr("data-list",result);
                    }
                    var btnStyle='',inputStyle='',peerId;
                    if(isFirstToken) {
                        // remove loading
                        if($(".pack-body").find(".pack-info").length > 0){
                            $(".pack-body .tokenLoad").remove();
                        }
                    }

                    if(!isFirstToken && tList.length > 0){
                        // add loading
                        isFirstToken = true;
                        if($(".pack-body").find(".pack-info").length==0){
                            $(".tokenLoad").css("display","block");
                        }
                    }
                    for(var i=0;i<tList.length;i++){
                        var peerId = tList[i].peerId;
                        var tStatus=tList[i].status;
                        var changeValue,btnStyle,inputStyle;
                        $(".preview-list-container").find(".preview-item").eq(i).attr("data-peertid",peerId );
                        //有tList的情况下
                        if($(".pack-body [data-peertid="+peerId+"]").length!==0){
                            var thisObj=$(".pack-body .pack-operate[data-peertid='"+peerId+"']");
                            thisObj.attr("data-tStatus",tStatus);
                            //改变按钮状态
                            if(thisObj.attr("data-status")==2){
                                thisObj.attr("data-tlivepeerid");
                                var rId=thisObj.attr("data-tlivepeerid").toUpperCase();
                                var preRSelectDiv=$(".preview-list-container").find(".preview-item[data-rid='"+rId+"']");
                                //改变选择列表的值
                                if(preRSelectDiv.length!=0){
                                    var spanNumber=preRSelectDiv.find(".preview-item-num").text();
                                    thisObj.siblings('.pack-camera').find("span").text(spanNumber);
                                }else{
                                    thisObj.siblings('.pack-camera').find("span").text(switchLangObj.i18n_Unspecified);
                                }
                                if(thisObj.find(".tokenImg").attr("data-tStatus")==thisObj.attr("data-status")){
                                    return;
                                }
                                thisObj.text(switchLangObj.i18n_cancelLive);
                                thisObj.css({"backgroundColor":"#FF4B4B","border":"1px solid #FF4B4B","color":"#FFF"});
                                thisObj.siblings('.pack-address ').find("input").css("color","#FF4B4B");
                            }else if(thisObj.attr("data-tStatus")==3&&thisObj.attr("data-status")!=2){
                                if(thisObj.find(".tokenImg").attr("data-tStatus")==thisObj.attr("data-status")){
                                    return;
                                }
                                thisObj.text(switchLangObj.i18n_add);
                                thisObj.css({"backgroundColor":"#20CA48","border":"1px solid #20CA48","color":"#FFF"});
                                thisObj.siblings('.pack-address').find("input").css("color","#20CA48");
                            }
                        }
                        else{//页面上面没有tList的情况下
                            var changeValue = undefined;
                            if(tStatus==1){
                                changeValue=switchLangObj.i18n_accept;
                                btnStyle="";
                                inputStyle="";
                            }else if(tStatus==3 && $(".pack-operate[data-peertid='"+peerId+"']").attr("data-status")!=2 ){
                                changeValue=switchLangObj.i18n_add;
                                btnStyle="pack-oprateAdd";
                                inputStyle="inputAdd";
                            }else if(tStatus==3 && $(".pack-operate[data-peertid='"+peerId+"']").attr("data-status")==2){
                                changeValue=switchLangObj.i18n_cancelLive;
                                btnStyle="pack-oprateCancel";
                                inputStyle="inputCancel";
                            }
                            var packInfoHtml='<div class="pack-info clearFix">\
                                            <div class="pack-address left">\
                                               <input type="text" value="'+peerId+' / '+tList[i].name+'" class="'+inputStyle+'" disabled=disabled>\
                                            </div>\
                                            <div class="pack-camera left">\
                                                <span>'+switchLangObj.i18n_Unspecified+'</span>\
                                                <i class="pack-cameraArrow"></i>\
                                                <ul style="display:none;">\
                                                    <li>1</li>\
                                                    <li>2</li>\
                                                    <li>3</li>\
                                                    <li>4</li>\
                                                </ul>\
                                            </div>\
                                            <div class="pack-operate left '+btnStyle+'" data-peertid="'+peerId+'" data-tStatus="'+tStatus+'">'+changeValue+'</div>\
                                            <div class="pack-del left" data-peertid="'+peerId+'">\
                                                <i class="iconfont icon-del"></i>\
                                            </div>\
                                          </div>';  
                            $(".pack-body").prepend(packInfoHtml);
                        }
                    }
                }
            })
        },
        shareNum: function (rid) {//更新当前R的分享状态
            var shareNumMsg = {
                type: "shareNum",
                ridList: rid
            }
            this.socket.send({
                message: shareNumMsg,
                time: 1000,
                key: 'shareNum',
                success: function (response) {
                    if (!response.shareNum) return;
                    var data = JSON.parse(response.shareNum)
                    if (data == ''){
                        $(".Push_toAccount_comment .shareIcon").find('.icon-socialMeida').removeClass("active");
                        $(".Push_toAccount_comment .shareIcon").find('.shareIcon-bottom').children('.shareCircle').css("display", "none");
                        return;
                    } 
                    data = data[0].shareInfo;
                    $(".Push_toAccount_comment").find(".icon-socialMeida.active").removeClass("active");
                    $(".Push_toAccount_comment").find(".shareCircle").hide();
                    $.each(data, function (ids, itm) {
                        if (itm.liveModule == "producerPro") {
                            $(".Push_toAccount_comment").find("[data-name='" + itm.shareKey + "']").find(".icon-socialMeida").addClass("active");
                            $(".Push_toAccount_comment").find("[data-name='" + itm.shareKey + "']").find(".shareCircle").css("display", "inline-block");
                            $(".Push_toAccount_comment .gridShow").after($(".Push_toAccount_comment").find("[data-name='" + itm.shareKey + "']"));
                        }
                    });
                }
            })
        },
        stop: function () {
            if (this.socket.has("shareNum")) this.socket.stop('shareNum');
        },
        recover: function () {
            if (!this.socket.has("shareNum")) this.shareNum($(".main-rList .rList-show").attr("data-peerId"));
        }
    }
    var pageRequestObj = new PageRequest();
    // 为了避免没有权限，但是视频出现了
    pageRequestObj.init();

    //判断R的状态
    function updateRStatus(data) {
        if (!data) return;
        var selectRId = currentRInfo.selectRId,
            selectRStatus='',
            selectRIp = $(".main-rList .rList-show").attr("data-rIp");
        $.each(data, function (idx, itm) {
            if (itm.peerId == selectRId) { //判断当前R的状态
                if (selectRIp != itm.ip) $(".main-rList .rList-show").attr("data-rIp", itm.ip);
                selectRStatus = $(".main-rList .rList-show").attr("data-status");
                $(".main-rList .rList-show").attr("data-status", itm.status);
                currentRInfo.isLive = itm.status;
                if (itm.status === "2") { //R不是处于live中，等同于R不在线；R上有可用的SDI，等同于R在线；
                    pageWebsocketObj.recover();
                } else if (itm.status === "1") {
                    pageWebsocketObj.recover();
                    if(selectRStatus=="0"){
                        currentRInfo.isSwitch=true;
                        getUserBehavior();
                    }
                } else if(itm.status === "0") {//&&peerClientStatusArr.isWebRTCDisconnect==true
                    // peerClientStatusArr.isWebRTCDisconnect = false;
                    // pageWebsocketObj.recover();
                    console.log("当前R的状态为:"+itm.status+" "+(new Date()));
                    // if($(".preview-list-container .preview-item").length!==0){
                    //  resetPage();
                    //  pageWebsocketObj.stop();
                    // }
                }
            }
        });
    }
    /*preview list 中音量调节 start*/
    // 点击喇叭按钮，调节音量的出现，并且要连接websocket
    function volumeControl(){
        this.socket = null;
    }
    volumeControl.prototype = {
        constructor: volumeControl,
        init:function(rid){
            var that = this;
            that.socket = oUtils.socket({
                url: 'studio/'+rid+"/"+Math.random()+'?session='+session,
                error: function (err) {
                    console.log(err);
                },
                successObj:{
                    'activeWs': function(data) { // This function used to update the pageControlCount value
                        $(".output-top .userNum").html(data.count);
                        $(".output-top .userNum").attr("title",switchLangObj.i18n_currentUserNum);
                    },
                    'tokenPairMsg':function(data){
                        if($(".upload-video").css("display")=="block") return;
                        var data_tid = data.tokenDevice;
                        var data_code = $(".preview-list-container .preview-qrcode").attr("data-code");
                        var data_rid = $(".preview-qrcode").parents(".preview-item").attr("data-rid");
                        data_rid = data_rid.toLowerCase();
                        if(sourceList.token2live==false){
                            if(data.tokenStatus==3){
                                if(sourceList.preventRepeatRequest == true)return;
                                sourceList.preventRepeatRequest = true;
                                $(".preview-qrcode .select-tokenpair").css("display","none");
                                $(".preview-qrcode .select-live").css("display","block");
                                $(".preview-list-container .preview-qrcode").attr("data-peertid",data.tokenDevice);
                                var name = data.tokenDeviceName||data.tokenDevice;
                                $(".preview-list-container .preview-qrcode").parents(".preview-item").find(".show-name").html(name);
                                setTimeout(function(){
                                    sourceList.preventRepeatRequest = false;
                                }, 10000);
                            }else if(data.tokenStatus==2||data.tokenStatus==1){
                                if(sourceList.preventRepeatRequest == true)return;
                                sourceList.preventRepeatRequest = true;
                                $(".preview-list-container .preview-qrcode").attr("data-peertid",data.tokenDevice);
                                if($(".preview-list-container .preview-qrcode .aSelectBox").hasClass("selectedBoxClass")){
                                    var param={
                                        "tokenCode.code": data_code,
                                        "peerId":data_tid,
                                        "checkFlag":'0',
                                        "rid":data_rid,
                                        "confirm":"Accept"   //Accept接受  Deny拒绝  Delete删除
                                    }
                                    $.ajax({
                                        type: "POST",
                                        url: "/producerpro/token_confirm",
                                        timeout : 7000, 
                                        data: param,
                                        success: function(data){
                                            data = JSON.parse(data);
                                            if(data.errorCode=="0x0"){
                                                setTimeout(function(){
                                                    sourceList.preventRepeatRequest = false;
                                                }, 10000);
                                                oUtils.alertTips(switchLangObj.i18n_PairingSuccess, 2000,function(){
                                                    $(".preview-qrcode .select-tokenpair").css("display","none");
                                                    $(".preview-qrcode .select-live").css("display","block");
                                                });
                                            }
                                        },
                                        error:function(data){
                                            sourceList.preventRepeatRequest = false;
                                            console.log("accept:",data,"tid:",tid,"rid:",rid,"imgCode:",imgCode);
                                        }
                                    })
                                }else{
                                    $(".preview-qrcode .select-accept").css("display","block");
                                }
                                var name = data.tokenDeviceName||data.tokenDevice;
                                $(".preview-list-container .preview-qrcode").parents(".preview-item").find(".show-name").html(name);
                            }
                        }else{
                            if(data.tokenStatus==2||data.tokenStatus==1){
                                liveToken(data_tid,data_rid,data_code,true);
                            }else{
                                liveToken(data_tid,data_rid,data_code);
                            }
                            
                        }       
                    }
                }
            });
        },
        changeVolume:function(volume,fileName){
            var volumeMsg = {
                parameter: {
                    'shm':fileName
                }
            }
            if(volume==-40){
                volumeMsg.parameter["vol"] = -40;
            }else{
                volumeMsg.parameter["vol"] = volume;
            }
            var that = this;
            this.socket.send({
                message: volumeMsg,
                time:200,
                key: "volume",
                success: function (response) {
                    that.stop();
                },
                error: function (err) {
                    that.stop();
                    console.log(err);
                }
            })
        },
        stop: function () {
            if (this.socket.has("volume")) {
                this.socket.stop('volume');
            }
        },
        close: function () {
            if (this.socket) this.socket.off();
        }
    }
    var volumeControlObj = new volumeControl();

    return {
        initStudioRList:initStudioRList,
        pageRequestObj:pageRequestObj,
        pageWebsocketObj:pageWebsocketObj,
        volumeControlObj:volumeControlObj,
        webrtcVideo:webrtcVideo,
    }
})($,oUtils,currentRInfo,volume.volumeColumn);