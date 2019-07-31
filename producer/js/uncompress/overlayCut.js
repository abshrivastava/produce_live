//logo to R
var overlayCut = {
    isCut: false,
    previewWidth: $("#preview").width(),
    textCut: function () {
        var peerid = $(".rList-show").attr("data-peerId");
        var paramArray=[];
        this.isCut = true;
        if($("#preview .preTextarea").length != 0 || $(".scoreText").length != 0 ||$(".clockDiv").length != 0){
            var base64 = false;
            if(sourceList.isOrCanvas){
                base64 = true;
            }
            paramArray = updateMultiCheck(false,base64);
        } 
        return  paramArray;
    },
    logoCut: function (paramArray) {
        this.isCut = true;
        var params = {
            'peerId': $(".rList-show").attr("data-peerId"),
        }
        if(sourceList.isOrCanvas==true){
            $("#preview .textDiv").addClass('logo-box');
        }
        var logoInfoList = [];
        
            var logoList = $(".preview-source .logo-box");
            var scaleRate = $("#preview .preTextarea").css("transform");
            if(scaleRate){
                scaleRate = scaleRate.substring(7,scaleRate.indexOf(","));
                // fontsize = scaleRate*fontsize;
            }
            if($("#preview .preTextarea").length!=0){
                var fontLength = $("#preview .preTextarea").html().gblen()/2;
                var opts = {
                    size: widthAndHeight.getOutputWidth("#preview", $("#preview .textDiv").width())+"x"+widthAndHeight.getOutputWidth("#preview", $("#preview .textDiv").height()),
                    bgcolor: $("#preview .preTextarea").css("background-color"), 
                    color: $("#preview .preTextarea").css("color"),
                    text: $("#preview .preTextarea").html(),
                    fstyle:'normal',
                    fweight: 'normal',
                    // fsize:widthAndHeight.getOutputWidth("#preview", parseInt($("#preview .preTextarea").css("font-size"))*scaleRate)+"px",
                    fsize:Math.round(widthAndHeight.getOutputWidth("#preview", $("#preview .textDiv").width())/fontLength)+"px",
                    ffamily:$("#preview .preTextarea").css("font-family")
                }

                var base64 = placeholder.getData(opts);
            }
            
            logoList.each(function (i, v) {
                var param = {};
                var rate = "";
                if(!$(v).hasClass("textDiv")&&!$(v).hasClass("scoreDiv")){
                    var thisObj = $(".pretreat-content-item[data-id='"+$(v).attr("data-id")+"']");
                    param = {
                        imageWidth: '',
                        imageHeight: '',
                        logoYOffset: '',
                        logoXOffset: '',
                        url: '',
                        id: ''
                    };
                    
                    param = getAttrs(thisObj, param);
                    rate=param.imageHeight/param.imageWidth;
                    param["xOffset"] =param["logoXOffset"]; 
                    param["yOffset"] =param["logoYOffset"];
                }else{
                    var imageWidth = $(v).width();
                    var imageHeight = $(v).height();
                    var logoLeft = $(v).position().left;
                    rate=imageHeight/imageWidth;
                    var logoYOffset = $(v).position().top;
                    var logoXOffset = $("#preview").width() - logoLeft - imageWidth;
                    param.xOffset = widthAndHeight.getOutputWidth("#preview", logoXOffset);
                    param.yOffset = widthAndHeight.getOutputHeight("#preview", logoYOffset);
                    param.imageWidth = widthAndHeight.getOutputWidth("#preview", imageWidth);
                    param.imageHeight = widthAndHeight.getOutputHeight("#preview", imageHeight);
                    param.id = $(v).attr("data-id");
                    if(sourceList.isOrCanvas==true&&$(v).hasClass('#preview textDiv')){
                        var index = base64.indexOf(",");
                        param["base64"]=base64.substring(index+1);
                    }   
                }
                param.zorder = $(v).css("z-index");
                param.xOffset = needEven(param.xOffset);
                param.yOffset = needEven(param.yOffset);
                param.imageWidth = needEven(param.imageWidth);
                param.imageHeight = param.imageWidth*rate;
                $(v).css({
                    width:widthAndHeight.getPriviewWidth("#preview", null, param.imageWidth)+"px",
                    height:widthAndHeight.getPriviewWidth("#preview", null, param.imageWidth*rate)+"px",
                    top:widthAndHeight.getPriviewHeight("#preview", null, param.yOffset)+"px",
                });
                $(v).css({
                    left:widthAndHeight.getPriviewWidth("#preview", null, (widthAndHeight.resolutionW-param.xOffset-param.imageWidth))+"px",
                });
                logoInfoList.push(param);
            });
            params["logoParams"] = JSON.stringify(logoInfoList);
            params["subtitleParams"] = JSON.stringify(paramArray);
            $.ajax({
                type: "POST",
                url: "/producerpro/logo_subtitle_multiCheck",
                data: params,
                success: function (data) {
                    data = JSON.parse(data);
                    var result,logoResult = data.logoResult;
                    overlayCut.isCut = false;
                    var subtitleResult = data.subtitleResult;
                    if (subtitleResult.errorCode == "0x0") {
                        result = subtitleResult.result;
                        $(".output-source .textDiv").remove();
                        if(result.length != 0) {
                            var subtitles=[];
                            for (var i = 0; i < result.length; i++) {
                                var temp = result[i];
                                if (temp.logoId == null) {
                                    overlying.textInit(result[i], true);
                                    if(currentRInfo.outputPreview){
                                        overToPreview.textInit(result[i],".output-source .big-video");
                                    }
                                }else{
                                    subtitles.push(result[i]);  
                                }
                            }
                            // overlying.scoreInit(null,true,false,subtitles);
                        }
                    }
                    if (logoResult.errorCode === "0x0") {
                        result = logoResult.result;
                        $(".output-source .big-video .logo-box").remove();
                        for (var i = 0; i < result.length; i++) {
                            var temp = result[i];
                            if (temp.scoreBoard != 1) {
                                overlying.logoInit(result[i], true);
                                if(currentRInfo.outputPreview){
                                    overToPreview.logoInit(result[i],".output-source .big-video");
                                }
                            }else {
                                if(currentRInfo.outputPreview){
                                    overToPreview.scoreInit(result[i],".output-source .big-video");
                                }
                                // overToPreview.scoreInit(result[i]);
                                overlying.scoreInit(result[i], true);
                            }
                        }
                    } 
                },
                error: function (err) {
                    overlayCut.isCut = false;
                    console.log(err);
                }
            });
        if ($(".preview-source .logo-box").length == 0&&$(".preview-source .scoreDiv").length == 0) {
            oUtils.ajaxReq("/producerpro/logo_clear", params, function (data) {
                if (data.errorCode === "0x0") {
                    $(".output-source .big-video .logo-box").remove();
                    return;
                }
                overlayCut.isCut = false;
            });
        }
    },
    pipCut: function () {
        var params = {
            dataType: "pip",
            peerId: currentRInfo.selectRId,
        }
        if ($("#preview .pip").length != 0) {//如果有.pip 发送到output中去
            //如果叠加效果栏有pip则执行cut操作，否则return
            if (!$(".pretreat-content .pip") || !$(".pretreat-content .pip").attr("data-id")) return;
            //获取相关属性值
            var pipParams = overToPreview.getPipInfo();
            pipParams["id"] = $(".pretreat-content .pip").attr("data-id");
            //afv在关闭下的优先级是最高的
            if($(".afv-cut .radius-box").hasClass("close")){
                var audioHtml = $(".afv-audio-cut .afv-audio").html();
                var index = audioHtml.substring(6);
                var selectedAudio= $(".preview-content .preview-item").eq(index-1).attr("data-filename");
                pipParams["selectedAudio"] = selectedAudio;
                pipParams["audioStatus"] = 0;
            }else{
                pipParams["audioStatus"] = 1;
            }
            params["pipParams"] = JSON.stringify(pipParams);
        } else {//如果有.pip ，清除之前的pip窗口
            var filename = $(".main-output").attr("data-filename")
            params["pipParams"] = JSON.stringify({ "pipAudioSharedMemoryName": filename });
        }
        var tallyArr = [];
        //获取之前的pipOutputActive 
        var pipOutputActiveObj = $(".preview-content li.pipOutputActive");
        if(pipOutputActiveObj.length!==0){
            var rid = pipOutputActiveObj.attr("data-rid");
            if(rid){
                var pipOutputTally = {};
                pipOutputTally["rid"] = rid;
                if(!pipOutputActiveObj.hasClass("outPutActive")&&(pipOutputActiveObj.hasClass("previewActive")||pipOutputActiveObj.hasClass("pipPreviewActive"))){//如果没有outPutActive，但是有previewActive或者pipPreviewActive
                    pipOutputTally["type"] = 131;
                    tallyArr.push(pipOutputTally);
                }else if(!pipOutputActiveObj.hasClass("outPutActive")&&!pipOutputActiveObj.hasClass("previewActive")&&!pipOutputActiveObj.hasClass("pipPreviewActive")){//没有outPutActive，previewActive,pipPreviewActive
                    pipOutputTally["type"] = 130;
                    tallyArr.push(pipOutputTally);
                }
            }
        }
        $(".preview-content li").removeClass("pipOutputActive");
        $(".preview-content li.pipPreviewActive").addClass("pipOutputActive");
        //添加 tally
        var toPipOutputTallyObj = $(".preview-content li.pipOutputActive");
        var toRid = toPipOutputTallyObj.attr("data-rid");
        if(toRid){
            var toPipOutputTally = {};
            toPipOutputTally["rid"] = toRid;
            if(!toPipOutputTallyObj.hasClass("outPutActive")){
                toPipOutputTally["type"] = 132;
                tallyArr.push(toPipOutputTally);
            } 
        }
        params["tallyArray"] = JSON.stringify(tallyArr);
        oUtils.ajaxReq("/producerpro/studio_check", params, function (data) {
            overlayCut.isCut = false;
            if (data.errorCode =="0x0") {
                if ($("#preview .pip").length != 0) {
                    overlying.pipInit(data.result.pip);
                    if(currentRInfo.outputPreview){
                        var videoId = $("#preview .pip video").attr("data-videoid");
                        overToPreview.pipInit(data.result.pip,videoId,".output-source .big-video");
                    }
                } else {
                    $(".main-output").removeAttr("data-pipfilename");
                    $('.preview-list-container li.pipOutputActive').removeClass("pipOutputActive");
                    $(".output-source .big-video .pip").remove();
                    return;
                }
            } else {
                oUtils.alertTips(data.errorInfo, 1500);
            }
        });
    },
    clockCut:function(){
        var peerid = $(".rList-show").attr("data-peerId");
        var paramArray=[];
        this.isCut = true;
        if($("#preview").find(".clockDiv").length>0){
            var startVal=$(".clockTextarea").html().split(":");
            var min=parseInt(startVal[0])*60*1000;
            var second=parseInt(startVal[1])*1000;
            var startTime=min+second;
        }
        var endTime= $(".defaultTime input").val();
        if(endTime==""){
            endTime=10000;
        }
        clockObj.clockEndTime = parseInt(endTime)*60;
        if($(".clockStart").hasClass('hide')){
            $(".clockDiv").attr("data-operation","run");
            saveClockuserBehavior("start","pgm");
        }else{
            var status=$(".clockDiv").attr("data-operation"); 
            saveClockuserBehavior(status,"pgm");
        }
        applyClockToPgm(startTime,clockObj.clockEndTime*1000);
    },
    // 比分牌公用方法
    score:function(openflag){
        var backgroundColor = "00000000";
        var previewWidth = $("#preview").width();
        var zorder = currentRInfo.zorder;
        var subtitleArry = [];
        var scoreText = openflag==true?$(".scoreDiv.score-hide .scoreText"):$("#preview").find($(".scoreDiv.score-active .scoreText"));
        var scoreObj = $(".scoreDiv.score-active");
        var imageWidth = scoreObj.width();
        // var imageHeight = scoreObj.height();
        var logoLeft = scoreObj.position().left;
        // var rate=imageHeight/imageWidth;
        var logoYOffset = scoreObj.position().top;
        var logoXOffset = previewWidth - logoLeft - imageWidth;
        logoXOffset = widthAndHeight.getOutputWidth("#preview", logoXOffset);
        logoYOffset = widthAndHeight.getOutputHeight("#preview", logoYOffset);
        // var imageWidth = widthAndHeight.getOutputWidth("#preview", imageWidth);
        // var imageHeight = rate*imageWidth;
        // 获取score的宽高
        scoreText.each(function (i, e) {
            var thisObj = $(this),
                thisParent= $(this).parents(".scoreDiv"),
                color=thisObj.css("color");
                if(color=="rgb(255, 255, 255)"){
                    color="FFFFFFFF";
                }else{
                    color="FF000000";
                }
            if(window.navigator.language=="zh-CN"||window.navigator.language=="zh"){
                $(this).css("font-family","SimHei");
            }else if(window.navigator.language=="en-US"||window.navigator.language=="en"){
                $(this).css("font-family","Arial");
            }else{
                $(this).css("font-family","Arial");
            }
            
            var textXOffset = parseInt(thisObj.css("right").split("p")[0]),
                textYOffset = parseInt(thisObj.css("top").split("p")[0]),
                textWidth = thisObj.width(),
                textHeight = thisObj.height(),
                fontFamily = thisObj.css("fontFamily"),
                textValue = thisObj.val(),
                scoreTextId = thisObj.attr("data-scoreTextId"),
                foregroundColor = color,
                fontSize =thisObj.css("font-size").split("p")[0];
            var styleObj = {};
            styleObj.fontSize = fontSize;
            styleObj.backgroundColor = backgroundColor;
            styleObj.fontName = fontFamily;
            styleObj.foregroundColor = foregroundColor;
            styleObj.foregroundColor = foregroundColor;
            var obj = {};
            if(scoreTextId!=""||scoreTextId!=undefined){
                obj.textId = scoreTextId;
            }
            obj.text = textValue;
            obj.yOffset = textYOffset + logoYOffset;
            obj.xOffset = textXOffset + logoXOffset;
            obj.zorder = zorder;
            obj.style = styleObj;
            obj.width = textWidth;
            obj.height = textHeight;
            obj.horizonAlign="center";
            obj.verticalAlign="center";
            if(openflag){
                subtitleArry.push(JSON.stringify(obj));
            }else{
                subtitleArry.push(obj);
            }       
        });
        return subtitleArry;
    },  
    subtitleCom:function(){
        var fontbgColor = undefined;
        var text = $("#preview .preTextarea").text();
        var textid=$("#preview .preTextarea").attr("data-id");
        var fontsize = $('#preview .preTextarea').css("font-size");
        fontsize = fontsize.split("p")[0];
        var scaleRate = $("#preview .preTextarea").css("transform");
        if(scaleRate){
            scaleRate = scaleRate.substring(7,scaleRate.indexOf(","));
            fontsize = scaleRate*fontsize;
        }
        var fontname = $('#preview .preTextarea').css("font-family");
        if(fontname.indexOf("gotham")>-1){
            if(window.navigator.language=="zh-CN"||window.navigator.language=="zh"){
                fontname ="SimHei";
            }else if(window.navigator.language=="en-US"||window.navigator.language=="en"){
                fontname ="Arial";
            }else{
                fontname ="Arial";
            }
        }else if(fontname.indexOf("Proxima Nova Condensed")>-1){
            fontname = "Proxima Nova Condensed";
        }else if(fontname.indexOf("Proxima Nova Rg")>-1){
            fontname = "Proxima Nova Rg";
        }
        fontbgColor = changeColor($("#preview .textDiv").css("background-color")).substring(1,9);
        var fontcolor = changeColor($("#preview .preTextarea").css("color")).substring(1,9);
        var textLeft = $("#preview .textDiv").position().left;
        var textYOffset = $("#preview .textDiv").position().top;
        var textWidth = $("#preview .textDiv").width();
        var textHeight = $("#preview .textDiv").height();
        var textXOffset = $("#preview").width() - textLeft - textWidth;
        textYOffset = widthAndHeight.getOutputHeight("#preview", textYOffset);
        textXOffset = widthAndHeight.getOutputWidth("#preview", textXOffset);
        fontsize = widthAndHeight.getOutputWidth("#preview", fontsize);
        textWidth = widthAndHeight.getOutputWidth("#preview", textWidth);
        textHeight = widthAndHeight.getOutputWidth("#preview", textHeight);
        var obj = {},
        styleObj = {};
        styleObj.fontSize = fontsize;
        styleObj.backgroundColor = fontbgColor;
        styleObj.fontName = fontname;
        styleObj.foregroundColor = fontcolor;
        obj.text = text;
        obj.yOffset = textYOffset;
        obj.xOffset = textXOffset;
        obj.style = styleObj;
        obj.zorder = $("#preview .textDiv").css("z-index");
        obj.width = textWidth;
        obj.height = textHeight;
        obj.horizonAlign="center";
        obj.verticalAlign="center";
        if(textid!=""||textid!=undefined){
            obj.textId=textid;
        }
        return obj;
    },
    clockSubtitle:function(){
        var fontbgColor = undefined;
        var textVal = $("#preview .clockTextarea").text();
        var clockid=$("#preview .clockDiv").attr("data-id");
        var fontsize = $('#preview .clockDiv').css("font-size");
        fontsize = fontsize.split("p")[0];
        var fontname = $('#preview .clockDiv').css("font-family");
        fontbgColor = changeColor($("#preview .clockDiv").css("background-color")).substring(1,9);
        var fontcolor = changeColor($("#preview .clockDiv").css("color")).substring(1,9);
        var textLeft = $("#preview .clockDiv").position().left;
        var textYOffset = $("#preview .clockDiv").position().top;
        var textWidth = $("#preview .clockDiv").width();
        var borderWidth= $("#preview .clockDiv").css("border-width").split("p")[0];
        // var borderColor= changeColor($(".clockDiv").css("border-color")).substring(1,9);
        var textXOffset = $("#preview").width() - textLeft - textWidth;
        textYOffset = widthAndHeight.getOutputHeight("#preview", textYOffset);
        textXOffset = widthAndHeight.getOutputWidth("#preview", textXOffset);
        // fontsize = widthAndHeight.getOutputWidth("#preview", fontsize);
        borderWidth= widthAndHeight.getOutputWidth("#preview", borderWidth);
        var obj = {},
        styleObj = {};
        styleObj.fontSize = fontsize;
        // styleObj.backgroundColor = fontbgColor;
        styleObj.fontName = fontname;
        styleObj.foregroundColor = fontcolor;
        // styleObj.borderWidth = borderWidth;
        // styleObj.borderColor = borderColor;
        styleObj.text = textVal;
        obj.yOffset = textYOffset;
        obj.xOffset = textXOffset;
        obj.style = styleObj;
        obj.zorder = $("#preview .clockDiv").css("z-index")||7;
        obj.width = 144;
        obj.height = 60;
        obj.horizonAlign="left";
        obj.verticalAlign="center";
        if(clockid!=""||clockid!=undefined){
            obj.id=clockid;
        }
        return obj;
    }
}
