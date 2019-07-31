//创建一个对象管理pagewebsocket接口（一个通道）
function PageWebsocket() {
    this.socket = null;
    this.onchanging = null;
    this.studioFlag = null;
    // websocket的回调函数
    this.updateCurrentRInfo = function(data) {
        console.log(data);
        webrtcVideo.initMainVideo([data.OutputPreviewWebRTCUserID],data);
        if (data.SourceListPreview) {
            var curPeerIdArr = [], peerIdObjArr = [], SourceType='';
                data.SourceListPreview.forEach(function (v, i) {
                    if (v["PreviewShm"].IsEnabled) {
                        console.log(v.PreviewID);
                        curPeerIdArr.push(v.PreviewID);
                        peerIdObjArr.push(v);
                    }
                });
            webrtcVideo.updateVideoList(curPeerIdArr, peerIdObjArr,data);
        }
        // 根据接口的返回，previewList中哪些是当前preview，哪些是当前output
        // var previewFilename = data.CurrentInputPreviewShm.SharedMemoryName,
        //     outputFilename = data.CurrentEncoderSharedMemory.SharedMemoryName;
        //     updateMainPreview(previewFilename);
        //     updateMainOutput(outputFilename);
        // if(data.CurrentPIPList!=null&&data.CurrentPIPList.length>0){
        //     var pipFilename = data.CurrentPIPList[0]["id"];
        //     var outputPipObj = $(".sd-preview-list .preview-item[data-filename='"+pipFilename+"']");
        //     if(outputPipObj.length>0){
        //        outputPipObj.addClass("pipOutputActive").siblings().removeClass("pipOutputActive");
        //     }
        //  }
        // 添加afv相关的代码
        currentRState.checkAfv(data);
    }
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
                identifyId: new Date().getTime()
            }
        });
        this.studioFlag = true;
        this.uploadInfo();
        this.kernelState();
        this.volumeInfo();//获取音量柱的实时信息
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
                    that.updateCurrentRInfo(data);
                    that.studioFlag = true;

                } else if (response.errorMessage === "Module Not Found." && that.studioFlag) { // R上studio模块未开启
                    oUtils.alertTips("i18n_notFindProducerProModule", 1500);
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

function volumeControl(){
    this.socket = null;
}
volumeControl.prototype = {
    constructor: volumeControl,
    init:function(rid){
        var that = this;
        that.socket = oUtils.socket({
            url: 'studio/'+rid+"/"+Math.random(),
            error: function (err) {
                console.log(err);
            },
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

var currentRState = {
    IsAudioFollowVideo:undefined,
    //更新主预览视频信息
    updateMainPreview:function(filename) {
        $(".main-preview").attr("data-filename", filename);
        var previewObj = $(".sd-preview-list .preview-item[data-filename='"+filename+"']");
        if(previewObj.length<=0)return;
        previewObj.addClass("previewActive").siblings().removeClass("previewActive");
        if(previewObj.attr("data-rid")){
            $(".preview-source").attr("data-rid",previewObj.attr("data-rid"));
        }else{
            $(".preview-source").removeAttr("data-rid");
        }
    },
    //更新主输出视频信息
    updateMainOutput:function(filename) {
        $(".main-output").attr("data-filename", filename);
        var outputObj = $(".sd-preview-list .preview-item[data-filename='"+filename+"']");
        if(outputObj.length<=0)return;
        outputObj.addClass("outPutActive").siblings().removeClass("outPutActive");
        if(outputObj.attr("data-rid")){
            $(".output-source").attr("data-rid",outputObj.attr("data-rid"));
        }else{
            $(".output-source").removeAttr("data-rid");
        }
    },
    checkAfv:function(data){
        if(this.IsAudioFollowVideo==0||this.IsAudioFollowVideo==1){
            this.IsAudioFollowVideo++;
            return false;
        }else{
            this.IsAudioFollowVideo = undefined;
        }
        if(data.IsAudioFollowVideo==true){//afv开启的情况下的操作
            $(".afv-cut .radius-box").removeClass("close");
            $(".afv-cut .radius-box").css({left:"11px"});
            $(".afv-cut .afv-audio").addClass("disabled");
            $(".afv-audio").html("Audio 1");
            if($(".main-output .icon-erphone").hasClass("active")){
                // var filename = $(".main-output").attr("data-filename");
                // var pipFilename = $(".main-output").attr("data-pipfilename");
                $("video").prop("volume",0);
                $(".main-output .main-player").prop("volume",1);
            }
        }else{//afv关闭的情况
            $(".afv-cut .radius-box").addClass("close");
            $(".afv-cut .radius-box").css({left:"0px"});
            var SharedMemoryName = data.AudioOnlyShm["SharedMemoryName"];
            var index = $(".preview-content .preview-item[data-filename='"+SharedMemoryName+"']").index();
            $(".afv-audio").html("Audio "+(index+1));
            $(".afv-audio").removeClass("disabled");
            if($(".main-output .icon-erphone").hasClass("active")){
                $("video").prop("volume",0);
                $(".main-output .main-player").prop("volume",1);
            }
        }
    }
}

//创建对象管理页面通过webrtc拿到的视频
var webrtcVideo = {
    peerIds: [],
    initFlag: true,
    mainTimer: null,
    listTimer: null,
    initTimer:null,
    webrtcLogin:undefined,
    rtcIdList:{
        pgm:{
            id:[],
            data:null
        },
        preLis:{
            idArr:[],
            data:null
        }
    },

    clear: function () {
        this.peerIds = [];
        if (this.mainTimer) clearInterval(this.mainTimer);
        if (this.listTimer) clearInterval(this.listTimer);
        this.mainTimer = null;
        this.listTimer = null;
        this.initTimer = null;
    },
    initMainVideo: function (outputId,data) { //创建预览，输出两个大的视频
        if (this.initFlag) {
            this.initFlag = false;
            console.log(outputId+"创建pgm");
            var that = this,
                ccId = new Date().getTime().toString() + 'x';
            this.webrtcLogin = ccId
            on_login(ccId);    //创建ID，调用webRTC,创建输入视频
            this.rtcIdList.pgm.id = outputId;
            this.rtcIdList.pgm.data = data;
            on_rtc(outputId);

        } else {
            if($(".main-fn video").length == 0 && this.rtcIdList.pgm.id.length ==0){
                    this.initFlag = true;   
            }
        } 
    },
    updateVideoList: function (arr, objArr, data) { //创建preview list 一系列的小的视频
        var that = this;
        var temPeerId = this.compareArr(that.peerIds, arr);
        that.peerIds = this.cloneArr(arr);
        if (temPeerId) {
            if (temPeerId.add.length > 0) { //新增了
                var addObjArr = this.rePeerIdObj(objArr, temPeerId.add);
                console.log("增加了",temPeerId.add);
                if ($(".main-fn video").length > 0 && peerClientStatusArr.resetVideoList.length == 0) { //等到主区域视频都出来后，再创建preview list
                    that.rtcIdList.preLis.idArr = that.rtcIdList.preLis.idArr.concat(temPeerId.add);
                    that.rtcIdList.preLis.data = addObjArr;
                    on_rtc(temPeerId.add,addObjArr);
                }else{
                    temPeerId.add.forEach(function(v,i){
                        var index = that.peerIds.indexOf(v);
                        if (index > -1) {
                            that.peerIds.splice(index, 1);
                        }
                    })
                }
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
    },
    //复制数组
    cloneArr:function(arr) {
        var newArr = [];
        arr.forEach(function (v, i) {
            newArr.push(v);
        });
        return newArr;
    },
    //判断数据的变化，增加的，减少的分别列出来
    compareArr:function(origin, arr) {
        console.log(origin);
        console.log(arr);
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
    },
    //从数据中选择peerId，创建新数组
    rePeerIdObj:function(arr, idArr) {
        var temArr = [];
        arr.forEach(function (v, i) {
            console.log(v.PreviewID);
            if (idArr.indexOf(v.PreviewID) > -1) temArr.push(v);
        });
        return temArr;
    }
}

// 添加pvw和pgm的音量柱
var volumeColumn = {
    volumeObj : {},//用于记录上次和现在的左右声道
    getVideoVolumeColumn:function(res){
        var volumes,data,item,SharedMemoryName;
        for(var videoType  in res){
             if("InputPreview"==videoType||"OutputPreview"==videoType){
                var InputPreview = res[videoType];
                var nickname = InputPreview["SwitchBusNickName"];
                if(!this.volumeObj[nickname]){
                    this.volumeObj[nickname] = {lastRightDb:0,lastLeftDb:0,curRightDb:0,curLeftDb:0};
                }
                volumes = this.volumeObj[nickname];
                data = InputPreview["VolumePreviewWorker"]["PreviewVoiceClip"];
                item = "InputPreview"==videoType?$(".pvw-audio").find(".audio"):$(".pgm-audio").find(".audio");
                this.setVolumeColumn(data,item,volumes);
            }else{
                var SourceList = res.SourceListPreview;
                for(var i=0;i<SourceList.length;i++){
                    if (SourceList[i]["PreviewShm"].IsEnabled&&SourceList[i]["IsPreivewing"]) {
                        SharedMemoryName = SourceList[i]["PreviewShm"]["SharedMemoryName"];
                        if(!this.volumeObj[SharedMemoryName]){
                            this.volumeObj[SharedMemoryName] = {lastRightDb:0,lastLeftDb:0,curRightDb:0,curLeftDb:0};
                        }
                        item = $(".single-sour[data-filename='"+SharedMemoryName+"']").find(".audio");
                        volumes = this.volumeObj[SharedMemoryName];
                        data = SourceList[i]["VolumePreviewWorker"]["PreviewVoiceClip"];
                        // console.log(data.LeftDb,data.RightDb);
                        this.setVolumeColumn(data,item,volumes);
                    }
                }
            }
        }
    },
    setVolumeColumn:function(data,item,volumes){
        var items = $(item).find(".active");
        this.init(data,items,volumes);
    },
    init:function(data,item,volume){
        volume.lastRightDb = volume.curRightDb;
        volume.lastLeftDb = volume.curLeftDb;
        volume.curRightDb = data["RightDb"];
        volume.curLeftDb = data["LeftDb"];
        this.dealVolume(volume,item);
    },
    volumeR2local:function(value){
        volume = 40+value;
        if(volume==0){
            return 0;
        }
        var volume = (parseInt(volume)+1)*(100/41)//求的数为代表第几个
        return Math.round(volume);
    },
    volumeLocal2R:function(value){//音量转换
        if(value==100){
            return 0//表示静音
        }
        // 数字进行转换 转换规则 1-100有100个数，-40-3有44个数
        var volume = (parseInt(value)+1)*(41/100)//求的数为代表第几个
        volume = -40+volume-1;//因为-40也代表一个音量值，所以需要-1
        return Math.round(volume);
    },
    dealVolume:function(volume,item){
        var leftTarget = Math.round((volume.curLeftDb - (-40)) / 40 * 120);
        var rightTarget = Math.round((volume.curRightDb - (-40)) / 40 * 120);
        var leftStart =  Math.round((volume.lastLeftDb - (-40)) / 40 * 120);
        var rightStart =  Math.round((volume.lastRightDb - (-40)) / 40 * 120);
        var leftStep = Math.round((leftTarget-leftStart)/5);
        var rightStep= Math.round((rightTarget-rightStart)/5);
        if(item.length == 0)return false;
        //左声道
        this.animation(leftStart,leftTarget,leftStep,item[0]);
        //右声道
        this.animation(rightStart,rightTarget,rightStep,item[1]);
    },
    animation:function(start,target,step,item){
        if(start < target){
            //音量升高
            var upAnimation = function(){
                start += step;
                start = start>target?target:start;
                $(item).css("height", (100 - (start/120*100))+"%");
                if(start<target) window.requestAnimationFrame(upAnimation);             
            };
            window.requestAnimationFrame(upAnimation);
        }else{
            //音量降低
            var downAnimation = function(){
                start += step;
                start = start<target?target:start;
                $(item).css("height",(100 - (start/120*100))+"%");
                if(start>target) window.requestAnimationFrame(downAnimation);
            }
            window.requestAnimationFrame(downAnimation);
        }
    } 
}