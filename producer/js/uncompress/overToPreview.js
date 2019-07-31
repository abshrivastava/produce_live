/*
 * 获取缩放条件
 */
var widthAndHeight = {
    resolutionW: 1920,
    resolutionH: 1080,
    // 返回预览视频和实际视频比值（宽）
    getWTransRate: function (obj, width) {
        if (obj) {
            return obj.width() / this.resolutionW;
        }
        if (width) {
            return width / this.resolutionW;
        }

    },
    // 返回预览视频和实际视频比值（高）
    getHTransRate: function (obj, height) {
        if (obj) {
            return obj.height() / this.resolutionH;
        }
        if (height) {
            return height / this.resolutionH;
        }

    },
    getPriviewWidth: function (parentName, parentWidth, width) {
        if (width == 0) return 0;
        var rateW = undefined;
        if (parentName) rateW = this.getWTransRate($(parentName), null);

        if (parentWidth) rateW = this.getWTransRate(null, parentWidth);
        if (width) return Math.round(width * rateW);
        // if (width) return width * rateW;

    },
    getPriviewHeight: function (parentName, parentHeight, height) {
        if (height == 0) return 0;
        var rateH = undefined;
        if (parentName) rateH = this.getHTransRate($(parentName), null);

        if (parentHeight) rateH = this.getHTransRate(null, parentHeight);

        if (height) return height * rateH;
        // if (height) return Math.round(height * rateH);

    },
    getOutputWidth: function (parentName, width) {
        if (width == 0) return 0;

        var rateW = this.getWTransRate($(parentName));

        if (width) return Math.round(width / rateW);
        // if (width) return width / rateW;
    },
    getOutputHeight: function (parentName, height) {
        if (height == 0) return 0;

        var rateH = this.getHTransRate($(parentName));

        if (height) return Math.round(height / rateH);
        // if (height) return height / rateH;
    },
}
//overlying to preview
var overToPreview = {
    textResize:true,
    logoInit: function (params,targetName) {
        targetName = targetName?targetName:"#preview";
        var paramJson = JSON.stringify(params);
        paramJson = encodeURIComponent(paramJson);
        var rate = undefined;

        var width, height;
        if (params["imageWidth"]==null||params["imageWidth"]=='') {
            var whArr = params["size"].split("x");
            params.imageWidth = whArr[0];
            params.imageHeight = whArr[1];
            rate = params.imageHeight/params.imageWidth;
            params.imageWidth = needEven(params.imageWidth);
            params.imageHeight = Math.round(params.imageWidth*rate);
            rate =  params.imageHeight/params.imageWidth;
        }

        if(widthAndHeight.resolutionW - params.imageWidth <=0)  params.logoXOffset = widthAndHeight.resolutionW - params.imageWidth;
        if(widthAndHeight.resolutionH-params.imageHeight <= 0) params.logoYOffset = widthAndHeight.resolutionH-params.imageHeight;

        if(!rate)rate= params.imageHeight/params.imageWidth;
        width = widthAndHeight.getPriviewWidth(targetName, null, params.imageWidth);
        height = width *rate;
        // height = widthAndHeight.getPriviewHeight("#preview", null, params.imageHeight);
        var rightleftOffset = "",offsetLeft="";
        var offsetT = widthAndHeight.getPriviewHeight(targetName, null, params.logoYOffset);
        if(params.logoXOffset+params.imageWidth>widthAndHeight.resolutionW/2){
            offsetLeft = widthAndHeight.resolutionW-params.logoXOffset-params.imageWidth;
            offsetLeft = widthAndHeight.getPriviewWidth(targetName, null, offsetLeft);
            rightleftOffset += 'left:';
            if(offsetLeft<0){
                offsetLeft = 0;
            }
        }else{
            offsetLeft = params.logoXOffset;
            offsetLeft = widthAndHeight.getPriviewWidth(targetName, null, offsetLeft);
            rightleftOffset += 'right:';
        }
        
        if(width+offsetLeft>$(targetName).width()){
            offsetLeft = $(targetName).width()-width;
        }
        if(height+offsetT>$(targetName).height()){
            offsetT = $(targetName).height()-height;
        }
         rightleftOffset +=  offsetLeft + 'px;'
        // console.log("width:"+width,"height:"+height,"")
        var logoHtml = '<div class="logo-box logoRander logo' + params.id + '" data-params="' + paramJson + '" data-url="' + params.url + '" data-id="' + params.id + '" style="width:' + width + 'px;height:' + height + 'px;top:' + offsetT + 'px; '+rightleftOffset+'z-index:'+params.zorder+';"><img src="' + params["url"] + '" ondragstart="return false;" alt="" style="display:block;width:100%;height:100%"></div>';
        if($(targetName + ' .logo' + params.id).length!=0){
            $(targetName + ' .logo' + params.id).replaceWith(logoHtml);
        }else{
            $(targetName).append(logoHtml);
        }
        if(targetName == "#preview"){
            if (!$(".preview-source .logo" + params.id).hasClass('.scoreDiv')) {
                // $(".preview-source .logo" + params.id).xingquanDrag();
                $(".preview-source .logo" + params.id).DragAndDrop({callback:correctDrag.correctLogo,rate:rate});
            }
        }
    },
    scoreInit: function (params,targetName) {
        targetName = targetName?targetName:"#preview";

        var imgWidth,imgHeight,offsetT,offsetR,isDisabled;

        if (params["size"]) {
            var whArr = params["size"].split("x");
            params.imageWidth = whArr[0];
            params.imageHeight = whArr[1];
        }

        imgWidth = widthAndHeight.getPriviewWidth(targetName, null, params.imageWidth);
        imgHeight = widthAndHeight.getPriviewHeight(targetName, null, params.imageHeight);
        offsetT = widthAndHeight.getPriviewHeight(targetName, null, params.logoYOffset);
        offsetR = widthAndHeight.getPriviewWidth(targetName, null, params.logoXOffset);
        var offsetL=$(targetName).width()- offsetR- imgWidth;   
        var scale = imgWidth/params.imageWidth;
        var scoreHtml = '<div class="scoreDiv score-active logo-box score' + params.id + '" data-scoreBord=1 data-imageWidth="' + params.imageWidth + '" data-url="'+params["url"]+'" data-imageHeight="' + params.imageHeight + '"data-logoYOffset="' + params.logoYOffset + '"  data-logoXOffset="' + params.logoXOffset + '"data-id="' + params.id + '"><div class="score-scale" style="transform-origin:0px 0px 0px;transform:scale('+scale+');width:'+params.imageWidth+'px;height:'+params.imageHeight+'px"><img src="' + params["url"] + '">';
    
        var subtitles = params.subtitles;
        for (var i = 0; i < subtitles.length; i++) {
            var textStyle = subtitles[i].style;
            if (typeof textStyle != 'object') {
                if(textStyle.indexOf("\"") == 0) {
                    textStyle = textStyle.substring(1, textStyle.length - 1);
                }
                textStyle = JSON.parse(textStyle);
            }
            var fontSize=textStyle.fontSize;
            fontSize=widthAndHeight.getPriviewHeight(targetName, null,fontSize);
            var textYOffset = subtitles[i].yOffset - params.logoYOffset;
            textYOffset = widthAndHeight.getPriviewHeight(targetName, null, textYOffset);
            var textXOffset =subtitles[i].xOffset - params.logoXOffset,
            textXOffset = widthAndHeight.getPriviewWidth(targetName, null, textXOffset);
            var textWidth= subtitles[i].width;
            textWidth= widthAndHeight.getPriviewWidth(targetName, null, textWidth);
            var textHeight= subtitles[i].height;
            textHeight= widthAndHeight.getPriviewHeight(targetName, null, textHeight);
            if(targetName != "#preview"){
                isDisabled = "disabled";
            }
            var temp = '<input type="text" class="scoreText scoreText' + (i + 1) + '" '+isDisabled+' data-zorder=3 value="' + subtitles[i].text + '" data-scoreTextId="' + subtitles[i].id + '"  style=" background-color:transparent;color:#' + textStyle .foregroundColor.slice(2, 8) + ';">';
            scoreHtml += temp;
        }
        var divHtml = '</div></div>';
        scoreHtml += divHtml;

        if(targetName == "#preview"){
            $(targetName).append(scoreHtml);
            $(targetName + " .score"+params.id).DragAndDrop({ "resize": false });
        }else{
            if($(targetName + ' .scoreDiv').length!=0){
                $(targetName + ' .scoreDiv').replaceWith(scoreHtml);
            }else{
                $(targetName).append(scoreHtml);
            }
        }
        $(targetName + " .scoreDiv").attr("style","position:absolute;top:" + offsetT + "px;left:"+ offsetL+"px;z-index:"+params.zorder+";transform:scale(1);width:"+imgWidth+"px;height:"+imgHeight+"px;");

        if(window.navigator.language=="zh-CN"||window.navigator.language=="zh"){
            $(".scoreText").css("font-family","SimHei");
        }else if(window.navigator.language=="en-US"||window.navigator.language=="en"){
            $(".scoreText").css("font-family","Arial");
        }else{
            $(".scoreText").css("font-family","Arial");
        }
        var url = $(".scoreDiv").attr("data-url");
        var index = parseInt(url.substring(15,16))+1;
        $(targetName + " .scoreDiv").addClass("scorePreview"+(index));
    },
    textInit: function (textarea,targetName) {
        targetName = targetName?targetName:"#preview";
        var textParams = encodeURIComponent(JSON.stringify(textarea)),textStyle;
        if(targetName!=="#preview"){
            textarea.style = textarea.pgmStyle;

        }
        if (textarea.logoId == null || textarea.logoId == "") {
            textStyle = textarea.style;
            if (typeof textStyle != 'object') {
                if(textStyle.indexOf("\"") == 0) {
                    textStyle = textStyle.substring(1, textStyle.length - 1);
                }
                textStyle = JSON.parse(textStyle);
            }
            var sHex = textStyle.backgroundColor;  
            var bgColor=textStyle.backgroundColor.slice(2,8);
            var bgOpacity=textStyle.backgroundColor.slice(0,2);
            var sRgbColor=HexToRgba(bgColor,bgOpacity);
            var Color = textStyle.foregroundColor.slice(2,8);
            var offsetT = widthAndHeight.getPriviewHeight(targetName, null, textarea.yOffset);
            var offsetR = widthAndHeight.getPriviewWidth(targetName, null, textarea.xOffset);
            var fontSize = widthAndHeight.getPriviewWidth(targetName, null, textStyle.fontSize);
            $("#fontFamily").val(textStyle.fontName);
            var contentEditable = "contentEditable";
            if(targetName != "#preview"){
                contentEditable = '';
            }
            var textHtml = '<div class="textDiv" data-params="'+textParams+'" onpaste="javascript:return false;"><div class="preTextarea" maxlength="128" '+contentEditable+' data-textYOffset="' + offsetT + '"   data-textXOffset="' + offsetR + '" data-Id="' + textarea.id + '" data-zorder="' + textarea.zorder + '"   style="white-space:pre;text-overflow: ellipsis; font-size:'+fontSize+'px;right:'+offsetR+'; color:#' + Color + '; font-family:' + textStyle.fontName + ';" >'+(targetName!=="#preview"?textarea.pgmText:textarea.text)+'</div></div>';
            if(targetName == "#preview"){
                $(targetName).append(textHtml);
                $(targetName+" .textDiv").DragAndDrop({scale:true,scaleClassName:".preTextarea",callback:correctDrag.textBlur});
            }else{
                if($(targetName + ' .textDiv').length!=0){
                    $(targetName + ' .textDiv').replaceWith(textHtml);
                }else{
                    $(targetName).append(textHtml);
                }
            }
            var offsetLeft=$(targetName).width()-offsetR-$(targetName + " .textDiv").width();
            $(targetName+" .textDiv").attr("style","position:absolute;top:" + offsetT + "px;left:"+offsetLeft+"px;z-index:"+textarea.zorder+";background-color:" + sRgbColor + ";");
            
        }
    },
    clockInit:function(clockInfo,targetName){
        var clockInfoParams = encodeURIComponent(JSON.stringify(clockInfo));
        targetName = targetName?targetName:"#preview";
        var textStyle = clockInfo.style;
        if (textStyle != undefined && typeof textStyle != 'object') {
            if(textStyle.indexOf("\"") == 0) {
                textStyle = textStyle.substring(1, textStyle.length - 1);
            }
            textStyle = JSON.parse(textStyle);
        }
        var overTime;
        var Color = textStyle.foregroundColor.slice(2,8);
        var offsetT = widthAndHeight.getPriviewHeight(targetName, null, clockInfo.yOffset);
        var offsetR = widthAndHeight.getPriviewWidth(targetName, null, clockInfo.xOffset);
        var width = widthAndHeight.getPriviewWidth(targetName, null, clockInfo.width);
        var height = widthAndHeight.getPriviewWidth(targetName, null, clockInfo.height);
        var scale = width/clockInfo.width;
        var timeTextarea = textStyle.text;
        var startVal = timeTextarea.split(":");
        var min = parseInt(startVal[0])*60;
        var second = parseInt(startVal[1]);
        var timeValue = parseInt(min+second); 
        var timeStampNow = calPts($(".main-preview .main-player").attr("id"));
        // var player = webflv.playObj[$(".main-preview .main-player").attr("id")]["player"];
        // var timeStampNow = Math.round(player.currentTime * 1000) + player._muxer.dtsBase;
        var timeStampOld= clockInfo.timestamp; 
        var endTime= clockInfo.endTime;
        var timeValueStr = "";
        var operation= clockInfo.operation;
        var clockoperation=checkLocation("status");
        if(clockoperation!="start"){
            timeValueStr = timeTextarea;
            overTime=timeValue;
        }else{
            var timeGap=timeStampNow-timeStampOld;  
            clockObj.clockSeconds=parseInt(timeGap/1000)+timeValue;
            overTime=clockObj.clockSeconds;
            timeValueStr = TimeByms(clockObj.clockSeconds);
        } 
        var backgroundColor = "";
        if(endTime/1000<overTime){
            backgroundColor = 'red';
        }else{
            backgroundColor = '';
        }
        var clockHtml = '<div class="clockDiv" data-params="'+clockInfoParams+'" data-check="'+clockInfo.checked+'" data-operation="'+clockInfo.operation+'" data-Id="' + clockInfo.id + '" data-zorder="' + clockInfo.zorder + '" style="'+backgroundColor+'"><div class="clockTextarea" style="transform-origin:0px 0px 0px;transform:scale('+scale+');width:'+clockInfo.width+'px;height:'+clockInfo.height+'px;line-height:'+clockInfo.height+'px;">'+timeValueStr+'</div></div>';
        if(targetName == "#preview"){
            if($(targetName + ' .clockDiv').length!=0){
                $(targetName + ' .clockDiv').replaceWith(clockHtml);
            }else{
                $(targetName).append(clockHtml);
            }
            $(targetName + " .clockDiv").DragAndDrop({resize: false,callback:correctDrag.correctClock});
        }else{
            if($(targetName + ' .clockDiv').length!=0){
                $(targetName + ' .clockDiv').replaceWith(clockHtml);
            }else{
                $(targetName).append(clockHtml);
            }
        }
        var offsetLeft=$(targetName).width()-offsetR-$(".clockDiv").width();
        $(targetName + " .clockDiv").attr("style","position:absolute;top:" + offsetT + "px;left:"+offsetLeft+"px;z-index:"+clockInfo.zorder+";transform:scale(1);background-color:"+backgroundColor+";font-size:46px;width:"+width+"px;height:"+height+"px;");
    },
    // 不创建webrtc的操作
    pipInit: function (params,videoId,targetName) {//初始化pip
        targetName = targetName?targetName:"#preview";
        var pipWidth = widthAndHeight.getPriviewWidth(targetName, null, params.pipWidth);
        var pipHeight = widthAndHeight.getPriviewHeight(targetName, null, params.pipHeight);
        var right = widthAndHeight.getPriviewWidth(targetName, null, params.pipXOffset);
        var top = widthAndHeight.getPriviewHeight(targetName, null, params.pipYOffset);
        var pipHtml = '<div class="pip" style="width:' + pipWidth + 'px;height:' + pipHeight + 'px;right:' + right + 'px;top:' + top + 'px;z-index:'+params.zorder+';" data-pipVideoSharedMemoryName="' + params.pipVideoSharedMemoryName + '" data-pipAudioSharedMemoryName="' + params.pipAudioSharedMemoryName + '" data-pgmPipVideoSharedMemoryName="' + params.pgmPipVideoSharedMemoryName + '"  data-filename="' + params.pipVideoSharedMemoryName + '" data-audiostatus="'+params.audioStatus+'" data-id="'+params.id+'" data-pipWidth="'+params.pipWidth+'"  data-pipHeight="'+params.pipHeight+'"  data-pipXOffset="'+params.pipXOffset+'"  data-pipYOffset="'+params.pipYOffset+'"><video autoplay style="display:inline-block;z-index:1;width:100%;height:100%;" class="preview-item-video"></video></div>';
        if(targetName=="#preview"){
            $(targetName).append(pipHtml);
            $("#preview .pip").DragAndDrop({callback:correctDrag.correctPip});
        }else{
            if($(targetName + ' .pip').length!=0){
                $(targetName + ' .pip').replaceWith(pipHtml);
            }else{
                $(targetName).append(pipHtml);
            }
        }
        //获取视频的id
        createPipVideo(videoId,targetName);
    },
    //get pip info
    getPipInfo: function () {//获取pip相应的代码
        var pipObj = $("#preview .pip");
        var pipWidth = pipObj.width();
        var pipHeight = pipObj.height();
        var pipYOffset = pipObj.position().top;
        var pipXOffset = pipObj.position().left;
        pipObj = $(".pretreat-content-item[data-id='"+pipObj.attr("data-id")+"']");
        pipHeight = pipObj.attr("data-pipheight");
        pipWidth = pipObj.attr("data-pipwidth");
        pipYOffset = pipObj.attr("data-pipyoffset");
        pipXOffset = pipObj.attr("data-pipxoffset");
        var params = {
            pipXOffset: pipXOffset,
            pipYOffset: pipYOffset,
            zorder: $("#preview .pip").css("zIndex"),
            pipWidth: pipWidth,
            pipHeight: pipHeight,
            pipVideoSharedMemoryName: $("#preview .pip").attr("data-pipVideoSharedMemoryName"),
            pipAudioSharedMemoryName: $("#preview .pip").attr("data-pipAudioSharedMemoryName"),
            audioStatus:$("#preview .pip").attr("data-audiostatus")
        }
        return params;
    },
};