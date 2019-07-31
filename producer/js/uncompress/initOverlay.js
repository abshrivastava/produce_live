var initOverlay = (function($,oUtils,currentRInfo,pageRequestObj,createPack){
    function firstInitLogo(){
        initTlistWs();
        //初始化logo
        var logoParams =  { "peerId": $(".rList-show").attr("data-peerid"), "module": "1" };
        oUtils.ajaxReq("/producerpro/logo_list",logoParams, function (data) {
            if (data.errorCode == "0x0") {
                //清空列表
                var result = data.result;
                for (var i = 0; i < result.length; i++) {
                    if(result[i].usingType == 1){//0: overlay    1: transition
                        // 把图片渲染到transtions模块
                        $(".clip-dot .pic-submit").css("background-image","url("+result[i].url+")");
                        $(".clip-dot .pic-submit").attr("data-userlogoid",result[i].userLogoId);
                    }else{
                        if(result[i].zorder>100)result[i].zorder = result[i].zorder%100;
                        if(result[i].zorder>currentRInfo.zorder)currentRInfo.zorder=result[i].zorder;
                        var checkedStatus = result[i].checkedStatus;
                        if(result[i].scoreBoard == 1){
                            if(checkedStatus>=1){
                                if(checkedStatus !== 3){
                                    overToPreview.scoreInit(result[i]);
                                    overlying.scoreInit(result[i], false,true); 
                                }
                                if(checkedStatus>1 && currentRInfo.outputPreview){
                                    overToPreview.scoreInit(result[i],".output-source .big-video");
                                }
                            }
                        }else{
                            if(checkedStatus !== 3){
                                overlying.logoInit(result[i]);  
                            }
                            if (checkedStatus >=1) {
                                if(checkedStatus!=3){
                                    overToPreview.logoInit(result[i]);
                                }
                                if(checkedStatus > 1 && currentRInfo.outputPreview){
                                    overToPreview.logoInit(result[i],".output-source .big-video");
                                }
                            }
                        }
                    }
                }
            }
            // 在此处调用恢复状态的
            // 判断ip变化了没有
            var timer = 0,RecoverTime;
            clearInterval(RecoverTime);
            RecoverTime= setInterval(function(){
                if($(".preview-content .preview-item.isr").length == 4){
                    clearInterval(RecoverTime);
                    initVideo();
                }else{
                    timer++;
                    if(timer >= 120){
                        clearInterval(RecoverTime)
                    }
                }
            },1000);
        });
    }
    let num = 0,errArr = [];
    //恢复用户上次开机的源列表
    function initVideo () {
        var userBehavior  = $("#userBehavior").val();
        userBehavior = JSON.parse(decodeURIComponent(userBehavior));
        var saveIp = userBehavior.Ip||"";
        var ip = $(".main-rList .rList-show").attr("data-rip");
        if(saveIp.Ip != ip){ // 如果ip不一样触发overlay,恢复视频
			oUtils.ajaxReq("/producerpro/getGridSource",null,function(data){
                if(data.errorCode=="0x0"){
                    var gridArr = [];
                    data = data.result;
					for(var i = 0;i < data.length; i++){
                        gridArr.push(data[i]['peer_id'])
                    }
                    var params = userBehavior.Position||{};
                    var rPeerId = undefined;
                    // 触发startLive
                    Object.keys(params).forEach(pos => {
                        let posistion = pos;
                        if(posistion != 5){
                            rPeerId = $(".preview-content .preview-item").eq((posistion - 1)).attr("data-rid").toLowerCase();
                        }
                        let Liveparam = {
                            "rid":rPeerId   
                        }
                        var tid = undefined;
                        if(typeof params[posistion] == "object" ){
                            // 将grid转换成ext，然后和R live
                            if(gridArr.indexOf(params[posistion]["id"]) > -1){
                                Liveparam["params"] = JSON.stringify({"TIdHex": params[posistion]["TIdHex"]})
                                tid =  params[posistion]["TIdHex"];
                                oUtils.ajaxReq("/producerpro/addExtAndSynchronize2R",{"extId":tid,"rId":rPeerId},function(data){
                                    if(data.errorCode == '0x0'){
                                        recoverLive(params, Liveparam, posistion);
                                    } else {
                                        num++;
                                        errArr.push(posistion);
                                        if(num == Object.keys(params).length){
                                            savePos(params, errArr);
                                        }
                                    }
                                }) 
                            }else{
                                num++;
                                errArr.push(posistion);
                                if(num == Object.keys(params).length){
                                    savePos(params, errArr);
                                }
                            } 
                        }else{
                            //由于ip的逻辑比较特殊，是直接和R进行live的，而且机位必须为5
                            if (posistion == 5){
                                var filename = new Date().getTime() + ' (IP Shim)';
                                Liveparam["rid"] = $(".main-rList .rList-show").attr("data-peerId");
                                Liveparam["params"] = JSON.stringify({"FileShimeName":params[posistion],"NickName":filename,"ShimType":200});
                                oUtils.ajaxReq("/producerpro/addIPSourceInProducer",Liveparam,function(data){
                                    if(data.errorCode !== "0x0"){
                                        num++;
                                        errArr.push(posistion);
                                        if(num == Object.keys(params).length){
                                            savePos(params, errArr);
                                        }
                                    }
                                });
                                return false;
                            }

                            // 转换成ext,然后和R live
                            Liveparam["params"] = JSON.stringify({"TIdHex": params[posistion]})
                            tid =  params[posistion];
                            oUtils.ajaxReq("/producerpro/addExtAndSynchronize2R",{"extId":tid,"rId":rPeerId},function(data){
                                if(data.errorCode == '0x0'){
                                    recoverLive(params, Liveparam, posistion);
                                } else {
                                    num++;
                                    errArr.push(posistion);
                                    if(num == Object.keys(params).length){
                                        savePos(params, errArr);
                                    }
                                }
                            })
                        }
                          
                    }); 
                }
            })
            
            var ipParam = {
                "pn": "sd",
                "content": JSON.stringify({"Ip":ip}),
                "remark": "Ip"
            }
            oUtils.ajaxReq("/producerpro/saveUserBehavior", ipParam);
            // 恢复overlay
            $(".overlay-cut-btn").trigger("click");
        }
    }

    function recoverLive(params, Liveparam, posistion, liveNum){
        if (!liveNum) liveNum = 10;
        oUtils.ajaxReq("/producerpro/startLive",Liveparam,function(data){
            var errorCode = data.ErrorCode;
            
            if(errorCode == 0){
                num ++;
                console.log("init video success","position:"+posistion,"Liveparam"+Liveparam);
            }else{
                liveNum --;
                if(liveNum <= 0){
                    num++;
                    errArr.push(posistion);
                } else {
                    recoverLive(params, Liveparam, posistion, liveNum)
                }
                console.log("init video failed","position:"+posistion,"Liveparam"+Liveparam);
                // 如果live失败
                if(num >= Object.keys(params).length){
                    savePos(params, errArr);
                }
            }
            
        }); 
    }
    //恢复成功保存
    function savePos(params,arr){
        if(arr.length == 0) return false;
        for(var i=0; i<arr.length;i++){
            delete params[arr[i]];
        }
        var param = {
            "pn": "sd",
            "content": JSON.stringify(params),
            "remark": "Position"
        }
        oUtils.ajaxReq("/producerpro/saveUserBehavior", param, function(data){
            var param = {
                "pn": "sd"
            }
            
            oUtils.ajaxReq("/producerpro/getUserBehavior", param, function(data){
                if(data.errorCode == "0x0"){
                   $("#userBehavior").val(encodeURIComponent(data.errorInfo));
                }
            });
        });

    }
    //切换R或刷新页面R叠加效果展示
    function firstOverlyShow(){
        //text init
        var textParams = { "peerId": $(".rList-show").attr("data-peerid"), 
                            "textId": $(".preTextarea").attr("data-id") 
                        };
        $.ajax({
            type: "POST",
            url: "/producerpro/subtitle_list",
            timeout : 15000, 
            data:textParams,
            success: function(data){
                firstInitLogo();
                var result=JSON.parse(data);
                if (result.errorCode == "0x0") {
                    var keys = Object.keys(result.errorInfo);
                    var errorInfo = result.errorInfo;
                    for(var i = 0;i< keys.length; i++){
                        var item = keys[i];
                        if(errorInfo[item].length==0) continue;
                        var textResult = errorInfo[item][0];
                        if(textResult.zorder>100)textResult.zorder = textResult.zorder%100;
                        if(textResult.zorder>currentRInfo.zorder)currentRInfo.zorder=textResult.zorder;
                        if(item=="pvwSubTitle"){
                            if (textResult.checked) {
                                overToPreview.textInit(textResult); 
                            }
                            overlying.textInit(textResult);
                        }
                        if(currentRInfo.outputPreview&&item=="pgmSubTitle"){
                            overToPreview.textInit(textResult,".output-source .big-video"); 
                        }
                    }
                }
            }
        });

        //pip init
        var pipParams = { "peerId": $(".rList-show").attr("data-peerid"), "dataType": "pip" };
        oUtils.ajaxReq("/producerpro/studio_list",pipParams, function (data) {
            if (data.errorCode == "0x0") {
                var previewItems = $(".preview-content .preview-item"),videoId;
                // for(var i = 0; i<data.result.pip.length;i++){
                    var keys = Object.keys(data.result);
                    for(var i = 0;i< keys.length; i++){
                        var item = keys[i];
                        if(item=="pgm"||data.result[item].length==0) continue;
                        var pipData = data.result[item][0];
                        var pipVideoSharedMemoryName = pipData.pipVideoSharedMemoryName;
                        videoId = $(".preview-content .preview-item[data-filename='"+pipVideoSharedMemoryName+"']").find("video").eq(0).attr('id');
                        if(pipData.zorder>100)pipData.zorder = pipData.zorder%100;
                        if(pipData.zorder>currentRInfo.zorder)currentRInfo.zorder=pipData.zorder;
                        if(item == "pvwPip"){
                            overlying.pipInit(pipData);
                            if (pipData.checked != 0) {
                                if(pipData.checked==2||pipData.checked==1){
                                    $(".pip-picture").addClass("created");
                                    overToPreview.pipInit(pipData,videoId);
                                    clearInterval(pipInitTimer);
                                    var pipInitTimer = setInterval(function(){
                                        if($(".preview-content .preview-item[data-filename='"+pipVideoSharedMemoryName+"']").length!=0){
                                            $(".preview-content .preview-item[data-filename='"+pipVideoSharedMemoryName+"']").addClass("pipPreviewActive");
                                            clearInterval(pipInitTimer);
                                        }
                                    },500);
                                }   
                            }
                        }
                    // }
                    if(currentRInfo.outputPreview && item == "pgmPip"&&pipData.pgmPipVideoSharedMemoryName){
                        var pgmPipVideoSharedMemoryName = pipData.pgmPipVideoSharedMemoryName;
                        videoId = $(".preview-content .preview-item[data-filename='"+pgmPipVideoSharedMemoryName+"']").find("video").eq(0).attr('id');
                        overToPreview.pipInit(pipData,videoId,".output-source .big-video");
                    }
                }
            } else {
                oUtils.alertTips(data.errorInfo, 1500);
            }
        });
    }
    //clock刷新初始化状态判断
    function firstClockInit(){
        if(!studioBehavior) return false;
        var param = {};
        oUtils.ajaxReq("/producerpro/clock_list", param, function (data) {
            if (data.errorCode == "0x0") { 
               var  result=data.result;
                if(result!=""){
                    result=result[0];
                    var userBehavior = JSON.parse(decodeURIComponent(studioBehavior));
                    var ProgramClockValue=userBehavior.ProgramClock;
                    if(ProgramClockValue==undefined) return
                    var operation=ProgramClockValue.status;
                    var location=ProgramClockValue.location;
                    overToPreview.clockInit(result);
                    overlying.clockInit(result);
                    if(result.checked==2 && currentRInfo.outputPreview){
                        overToPreview.clockInit(result, ".output-source .big-video");
                    }
                    var endTime=result.endTime;
                    clockObj.clockEndTime=endTime/1000;
                    endTime=endTime/1000/60;
                    if(endTime==10000) endTime="";
                    $(".defaultTime input").val(endTime);
                    if(operation=="start"){
                        $(".clockStop").removeClass('hide');
                        $(".clockStart").addClass('hide');
                        $(".clockInput").attr("disabled","disabled");
                        clearInterval(clockObj.setClockTimer);
                        clockObj.setClockTimer=setInterval(function(){
                            clockObj.clockSeconds++;
                            var s = clockObj.clockSeconds%60;
                            var m = parseInt(clockObj.clockSeconds/60);
                            s<= 9 ? s = "0" + s : s = s;
                            m<= 9 ? m = "0" + m : m = m;
                            if(clockObj.clockSeconds>clockObj.clockEndTime){
                                $(".clockDiv").css("background-color","red");
                            }else{
                                $(".clockDiv").css("background-color","#212740");
                            }
                            $(".clockTextarea").html(m + ":" + s);
                            $(".clockDiv").attr("data-time",clockObj.clockSeconds);
                            if(clockObj.clockSeconds>59940){//大于999分钟时，前后端同时置为0
                                clearInterval(clockObj.setClockTimer);
                                clockObj.clockSeconds=0; 
                                $(".clockDiv").attr("data-operation","create");
                                $(".clockTextarea").html("00:00");
                                $(".clockStart").removeClass('hide');
                                $(".clockStop").addClass('hide');
                                $(".clockDiv").css("background-color","#212740");
                                $(".clockInput").removeAttr("disabled");
                                $(".clockInput").val(0);
                                if(location=="pgm"){
                                    applyClockToPgm(clockObj.clockSeconds*1000,clockObj.clockEndTime*1000);
                                    saveClockuserBehavior("stop","pgm");
                                }else{
                                    updateClock(clockObj.clockSeconds*1000,clockObj.clockEndTime*1000,"create");
                                    saveClockuserBehavior("start","pvw");
                                }   
                            }
                        },1000);
                    }
                } 
            }else {
                oUtils.alertTips(data.errorInfo, 1500);
            }
        });
    }
    //直切初始化
    function initDirectChange(){
        var mainRId=$(".rList-show").attr("data-peerId");
        if (!studioBehavior) return;
        var userBehavior = JSON.parse(decodeURIComponent(studioBehavior));
        if(userBehavior.directChange){
            for(var i=0;i<userBehavior.directChange.length;i++){
               var userBehaviorMainId=userBehavior.directChange[i].mainRid;
               if(userBehaviorMainId==mainRId){
                  var  userBehaviorStatus=userBehavior.directChange[i].status;
                  if(userBehaviorStatus=="shut"){
                    $(".main-preview .audio").css("display","none");
                    directChangeShut();
                  }else{
                    directChangeOpen();
                  }
                }
            }
        }
    }
    //开启直切状态时
    function directChangeShut(){
        var thisObj = $(".apply-preview  .radius-box");
        thisObj.addClass('shut');
        $(".applyPre").addClass("disabled").removeClass("active");
        thisObj.animate({ left: "0px" });
        var maskLayerHtml='<div class="maskLayer" style="position:absolute;z-index:0;height:100%;left:0;top:0;width:100%;"><img src="images/producer_pro_mark.png"  draggable="false" style="width:100%;height:100%;"/></div>';
        $(".preview-source").append(maskLayerHtml);
        if($(".sd-preview-list .preview-item").hasClass('previewActive')) $(".sd-preview-list .preview-item").removeClass('previewActive');
        $(".main-center .main-cut").addClass("direct-pgm");
        if($(".main-center .main-cut").hasClass("replay")){
            $(".main-center .main-cut").removeClass("direct-pgm");
            $(".preview-source .maskLayer").addClass("hide");
        }
    }

    //应用预监时
    function directChangeOpen(){
        var filename=$(".main-preview").attr("data-filename");
        var thisObj = $(".apply-preview  .radius-box");
        thisObj.removeClass('shut');
        thisObj.animate({ left: "11px" });
        $(".output-source").removeClass('change');
        $(".maskLayer").remove();
        $(".applyPre").removeClass("disabled").addClass("active");
        $(".main-center .main-cut").removeClass("direct-pgm");
        //直切时取消绿框
        for (var i = 0; i < $(".sd-preview-list .preview-item").length; i++) {
            if ($(".sd-preview-list .preview-item").eq(i).attr("data-filename") === filename) {
                if($(".radius-box").hasClass('shut')){
                    $(".sd-preview-list .preview-item").eq(i).removeClass("previewActive");
                }
                $(".sd-preview-list .preview-item").eq(i).addClass("previewActive").siblings().removeClass("previewActive");
            }
        }
    }

    function initTlistWs(){
        var param=QRImg();
        //调接口获取二维码
        oUtils.ajaxReq("/producerpro/token_getToken4Pro",param,function(data) {
            var errorCode = data.errorCode;
            if( errorCode == "0x0" ) {
                var code = data.result;
                pageRequestObj.listTokenDevice4Pro(code);
                var param={
                   "type":"T",
                };
                oUtils.ajaxReq("/producerpro/studio_device", param,function(data){
                    var errorCode = data.errorCode;
                    if(errorCode == "0x0"){
                        var result=data.result;
                        if(result.length!=0){
                            var html="";
                            for(var i=0;i<result.length;i++){ 
                                var pid=result[i].peerId;
                                var name=result[i].name;
                                var status=result[i].status;
                                    html=createPack(pid,name,status)+html;  
                                }
                            }
                            $(".tvupack-body").html(html);   
                        }   
                });
            }
        });
    }
    return {
        firstOverlyShow:firstOverlyShow,
        firstClockInit:firstClockInit,
        initDirectChange:initDirectChange,
        directChangeShut:directChangeShut,
        directChangeOpen:directChangeOpen
    }
})($,oUtils,currentRInfo,initSystem.pageRequestObj,resourceAbout.createPack);