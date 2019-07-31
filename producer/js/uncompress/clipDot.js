var clipDot = (function($,switchLangObj){
    var isReplay =  false,THUMBNAIL=[];
    function toMoveRightClip(e,disX,obj){//右拖拽
        e = e||event;
        var oldWidth = obj.width();
        obj.css("width",e.clientX - disX + 'px');
        if(obj.width()+obj.position().left>$(".source-pic .pic").width()){//don't Beyond the boundary
            obj.css("width",$(".source-pic .pic").width() - obj.position().left+ 'px');
        }else if(obj.width()<1/60*obj.parents(".source-pic").width()){//time must greater than 1 seconds
            obj.css("width",oldWidth+'px');
        }
        var endTime = getTimeCode(obj,obj.width()+obj.position().left);
        var startTime = obj.attr("data-starttime");
        var showTime = selTime(obj,endTime);    
        obj.attr("data-endtime",showTime);
        console.log(showTime);
        renderMark(showTime,showTime-startTime);
        setTimeInterval(obj);
        changeVideoCut(false);
    }
    function changeHandlerPos(){//在拖拽后根据data-starttime，data-endtime改变页面上面的位置
        var sourceObj = $(".clip-dot .clip-source .source");
        var starttimecode = sourceObj.attr("data-starttimecode");
        var slider = $(".clip-dot .clip-source .clip-slider");
        var starttime = slider.attr("data-starttime");
        var endtime = slider.attr("data-endtime");
        var left = starttime - starttimecode;
        var width =endtime - starttime;
        slider.css("width",width/60000*100+"%");
        slider.css("left",left/60000*100+"%");
    }
    function toMoveLeftClip(e,disX,obj){
        e = e||event;
        var oldLeft = obj[0].offsetLeft;
        var clientX = e.clientX;
        var oldWidth = obj.width()+oldLeft;
        if( clientX - disX<0){//边界的限制，小于0会出边界
            return false;
        }else if(oldWidth - (clientX - disX)<=1/60*obj.parents(".source-pic").width()){//time must greater than 1 seconds
            return false;
        }
        obj.css("left", clientX - disX + 'px');
        obj.css("width",oldWidth - (clientX - disX) + 'px');
        var startTime = getTimeCode(obj,obj.position().left);
        
        var endTime = obj.attr("data-endtime");
        //改变时间的长短
        var showTime = selTime(obj,startTime);
        obj.attr("data-starttime",showTime);
        renderMark(showTime,0);
        setTimeInterval(obj);
        changeVideoCut(false);
    }
    function screenShot(dom){//截取图片，为了渲染在页面上面
        var canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 168;
        var canvasContext = canvas.getContext('2d');
        canvasContext.drawImage(dom, 0, 0, 300, 168);
        return canvas.toDataURL('image/jpeg',1);
    }
    function getscreenShot(){//获取preview list中的R的截图照片
        var previewList = $(".preview-content .preview-item");//获取到元素
        var dataList = [];
        for(var i=0;i<previewList.length;i++){
            if(previewList.eq(i).attr("data-rid")){
                dataList.push(screenShot(previewList.eq(i).find("video")[0]));
            }
        }
        return dataList;
    }
    function getTimeCode(obj,len){
        //left+width占的比重比转换为时间，然后加上开始时间的，即获得当时时间
        //具体思路：len/$(".clip-source .source-pic").width() = timeStamp/600000;
        var timeStamp = parseInt(len/$(".clip-source .source-pic").width()*60000);
        var startTimeCode = parseInt(obj.parents(".source").attr("data-startTimeCode"));
        return startTimeCode+timeStamp;
    }
    function setTimeInterval(obj){//设置区间 拖拽 bar的区间 
        var startTime = obj.attr("data-starttime");
        var endTime = obj.attr("data-endtime");
        var intervalTime = endTime - startTime;
        obj.find(".time-code").html((intervalTime/1000).toFixed(2));
    }
    function renderPic(){//渲染 overlay 切割图片 
        var picList = getscreenShot();
        var html = "";
        var preHtml = "";
        // 渲染小窗口的img
        for(var i = 0;i<picList.length;i++){
            preHtml += '<li class="seat video-1">\
                            <span class="preview-item-num">'+(i+1)+'</span>\
                            <img src="'+picList[i]+'" alt="">\
                            <div class="remark hide">\
                                <div class="btn">'+switchLangObj.i18n_Rewind+'</div>\
                            </div>\
                        </li>';
        }
        $(".pretreat-content.show-clipvideo").removeClass("hide");
        // $(".select-seat .clip-videos").html(html);
        $(".show-clipvideo .select-single").html(preHtml);
    };
    function renderMark(showTime,timeZone){//渲染 pvw 缩略图
        var currentR = $(".main-rList .rList-show");
        var ip = currentR.attr("data-rip");
        var address = "http://"+ip+":";
        var baseurlforthumbnail = $(".main-preview").attr("data-baseurlforthumbnail");
        var frontCover = address+baseurlforthumbnail+showTime+".jpg";
        var coverHtml = '<div class="clip" style="position:absolute;z-index:0;height:100%;left:0;top:0;width:100%;background-color:#000;"><img class="remark-pic" src="'+frontCover+'" alt="" style="width:100%;height:100%;"/>';
            coverHtml += '<div class="video-process hide">\
                                <div class="process-inner">\
                                    <div class="video-len"></div>\
                                    <div class="current-len">\
                                        <div class="video-point">\
                                        </div>\
                                    </div>\
                                    <div class="timeCode">\
                                        <span class="current-time left">10.2</span>\
                                        <span class="total-time right">60:00</span>\
                                    </div>\
                                </div>\
                            </div>\
                        </div><img class="apply-btn hide" src="./images/replay.png"/>';
        $('.preview-source .apply-btn').remove();
        if($(".preview-source .clip").length!=0){
            $('.preview-source .clip').replaceWith(coverHtml);
        }else{
            $(".preview-source").append(coverHtml);
        }
        renderProcessTime(timeZone);
    }
    function renderProcessTime(timeZone){//渲染进度条
        var sliderObj = $(".source-pic .clip-slider");
        var time = 0;
        for(var i = 0;i<sliderObj.length;i++){
            var startTime = sliderObj.eq(i).attr("data-starttime");
            var endTime = sliderObj.eq(i).attr("data-endtime");
            time += (endTime-startTime);
        }
        //获取当前的宽度
        var CurrentPoint = timeZone/time*100;
        $(".process-inner .current-len").css("width",CurrentPoint+"%");
        $(".process-inner .timeCode .total-time").html((time/1000).toFixed(2));
        $(".process-inner .timeCode .current-time").html((timeZone/1000).toFixed(2));
    }
    //<div class="checkbox iconfont icon-check"></div>\
    function renderClipPic(sources,address,timeStamp,data){//渲染页面image
        address += sources["BaseUrlForThumbnail"];
        $(".main-preview").attr("data-baseurlforthumbnail",sources["BaseUrlForThumbnail"]);
        var Records = sources["Records"][sources["Records"].length-1];
        var liHtml = '<li class="source active clearFix" data-title="'+Records["Title"]+'" data-tags = "'+JSON.stringify(Records["Tags"])+'" data-author = "'+$("#user_info_name").attr("title")+'" data-sourceid="'+Records.SourceID+'" data-id="'+Records.ID+'" data-startTimeCode="'+(data[0])+'">\
                    <div class="source-pic clearFix">\
                        <div class="pic clearFix">';
                        var imghtml = "",thumbnailArr = [],num = 1;
                        var timeStampCode = THUMBNAIL[0];
                        imghtml += '<img src="'+(address+timeStampCode)+'.jpg" alt="">';
                        timeStampCode = parseInt(timeStampCode/1000)*1000+4000;
                        for(var i = 1; i < THUMBNAIL.length; i++){
                            if(num>=15) break;
                            if(timeStampCode<THUMBNAIL[i]){
                                num++;
                                imghtml += '<img src="'+(address+THUMBNAIL[i])+'.jpg" alt="">';
                                thumbnailArr.push(timeStampCode);
                                timeStampCode = timeStampCode + 4000;
                            }
                        }
                        console.log(THUMBNAIL,thumbnailArr,address);
        liHtml+=imghtml;
        liHtml+='</div>\
                    <div class="clip-slider">\
                        <div class="left handle leftHandle">\
                            <span class="iconfont icon-handle"></span>\
                        </div>\
                        <div class="right handle rightHandle">\
                            <span class="iconfont icon-handle"></span>\
                        </div>\
                        <div class="time-code">20.00</div>\
                    </div>\
                    <div class="mark">\
                    </div>\
                </div>\
            </li>';
            changeVideoCut(false);
            //获取图片
            $(".clip-dot .clip-source").html(liHtml);
            var obj = $(".clip-dot .clip-source .clip-slider");
            var showStartTime = selTime(obj,timeStamp-30000);
            var showEndTime = selTime(obj,timeStamp-10000);
            obj.attr("data-starttime",showStartTime);
            obj.attr("data-endtime",showEndTime);
            var frontCover = address+showStartTime+".jpg";
            obj.attr("data-fontCover",frontCover);
            changeHandlerPos();
            renderMark(showStartTime,0);
            $(".clip-dot").show();
    }
    function initSpeed(){//初始化速度
        var website = [{name:"1.0 x",type:"1"},{name:"0.5 x",type:"0.5"}];
        $(".clip-dot .sel-speed").createSimulateSelect(website,"","type","name");
    }
    // 获取图片
    function getImage(rid,filenames){
        var params = {
            rid:rid
        }
        var peerclientId = $(".preview-content .preview-item[data-filename='"+filenames[0]+"']").find("video").attr("id");
        var timeStamp = calPts(peerclientId);
        oUtils.ajaxReq("/producerpro/record/current_session",params, function (data) {
            var sources =data.Sources;
            //获取R的ip,port
            var currentR = $(".main-rList .rList-show");
            var ip = currentR.attr("data-rip");
            var port = currentR.attr("data-port");
            var address = "http://"+ip+":";
            var liHtmls ="";
            if(sources.length>0){
                for(var i=0;i<sources.length;i++){
                    if(filenames.indexOf(sources[i].ID)>-1){
                        if(sources[i].Records!=null&&sources[i].Records.length!=0){
                            if(timeStamp-sources[i].Records[sources[i].Records.length-1].StartTimestamp>60000&&sources[i].Records[sources[i].Records.length-1].EndTimestamp==0){
                                getRecordThumbnail(sources[i],address);
                                // liHtmls += renderClipPic(sources[i],address,timeStamp);
                            }else{
                                oUtils.alertTips("i18n_noSourceNoReplay");
                                return false;  
                            }
                        }else{
                            oUtils.alertTips("i18n_noSourceNoReplay");
                            return false;
                        }
                    }
                }
            }
        });
    }
    function selTime(obj,timeStamp){//选择时间 根据timestamp 去取thumbnail(就近原则) 
        // 根据选择遍历的方向
        /*
        * THUMBNAIL:timecode array 
        */
        var timeStampStart = parseInt(obj.parents(".source").attr("data-startTimeCode"));
        var difValue = undefined,lastDifValue = undefined,showTime = undefined;
        if(timeStamp<=timeStampStart+3000){//正向遍历
            lastDifValue = timeStamp - THUMBNAIL[0];
            for(var i = 1; i < THUMBNAIL.length; i++){
                difValue = Math.abs(lastDifValue);
                lastDifValue = timeStamp - THUMBNAIL[i];
                if(difValue < Math.abs(lastDifValue)){
                    showTime = THUMBNAIL[i-1];
                    break;
                }
            }
        }else{//如果小于，说明离右边近，从右边开始
            lastDifValue = timeStamp - THUMBNAIL[THUMBNAIL.length-1];
            for(var i = THUMBNAIL.length-2; i >= 0; i--){
                difValue = Math.abs(lastDifValue);
                lastDifValue = timeStamp - THUMBNAIL[i];
                if(difValue < Math.abs(lastDifValue)){
                    showTime = THUMBNAIL[i+1];
                    break;
                }
            }
        }
        return showTime;
    }
    function expressApply(url){//pvw replay button  and replay cut button function 区别是url
        var playerObj = $(".preview-content .preview-item[data-filename='Default']");
        var rid = playerObj.attr("data-rid").toLowerCase();
        var obj = $(".clip-source .source.active");
        var param = {
            rid:rid,
        }
        if("record/express_apply_pvw"==url){
            var id = $("#preview .main-player").attr('id');
        }
        var params = {
            Title:obj.attr("data-title"),
            Tags:JSON.parse(obj.attr("data-tags")),
            Author:obj.attr("data-author"),
            Scenes:[{ 
                "SourceID":obj.attr("data-sourceid"), 
                "SessionID":obj.attr("data-id"), 
                "StartTimestamp":obj.find(".clip-slider").attr("data-starttime"), 
                "EndTimestamp":obj.find(".clip-slider").attr("data-endtime"), 
                "SpeedRate":$(".clip-dot .sel-speed").attr("data-value"),
                "EffectImageId":$(".clip-dot .pic-submit").attr("data-userlogoid")
            }],
            FrontCover:obj.attr("data-fontcover")
        }
        param["params"] = JSON.stringify(params);

        oUtils.ajaxReq(url,param, function (data) {
            if("/producerpro/record/express_apply_pvw"==url){
                $("#preview").attr("data-storyid",data["Scenes"][0]["StoryID"]);
            }else{
                $("#preview").removeAttr("data-storyid");
            }  
        });
    }
    function getRecordThumbnail(sources,address){//获取缩略图
        var playerObj = $(".preview-content .preview-item[data-filename='Default']");
        var rid = playerObj.attr("data-rid").toLowerCase();
        var peerclientId = $(".preview-content .preview-item[data-filename='"+sources.Records[sources.Records.length-1].SourceID+"']").find("video").attr("id");
        var timestamp = calPts(peerclientId);
        var param = {
            rid:rid
        }
        var params = {
            SourceID:sources.Records[sources.Records.length-1].SourceID,
            StartTimestamp:timestamp-60000,
            EndTimestamp:timestamp
        }
        param["params"] = JSON.stringify(params);
        oUtils.ajaxReq("/producerpro/record/get_thumbnail",param,function (data) {
            if(data.errorCode) return false;
            THUMBNAIL = data.sort();
            renderClipPic(sources,address,timestamp,data);
        });
    }
    function changeVideoCut(isDel){
        if(isDel){
            $(".main-center .main-cut").removeClass("replay");
            $(".main-center .main-cut .main-cut-btn").html(switchLangObj.i18n_VideoCut);
            $(".preview-source .clip").remove();
            $(".preview-source .apply-btn").remove();
            if($(".main-preview .applyBtn").hasClass("shut")){
                $(".main-center .main-cut").addClass("direct-pgm");
                $(".preview-source .maskLayer").removeClass("hide");
            }
        }else{
            $(".main-center .main-cut").addClass("replay").removeClass("direct-pgm");
            $(".main-center .main-cut .main-cut-btn").html(switchLangObj.i18n_ReplayCut);
            if($(".main-preview .applyBtn").hasClass("shut")){
                $(".preview-source .maskLayer").addClass("hide");
            }
        }  
    }
    //创建定时器：标志状态
    function createStatusOverdue(data){//data channel
        if(data.replayStatus) {
            // var time = data.firstPts - replayTime;
            // if(isReplay == false && time <= (-1000 / data.refFps)){
            //     isReplay = true;
            //     $(".preview-source .clip img").addClass("hide");
            // }
            isReplay = true;
            $(".preview-source .clip .video-process").removeClass("hide");
            $(".preview-source .clip img").addClass("hide");
            $(".preview-source .apply-btn").addClass("hide");
            $(".preview-source .clip").css("background-color","");
            $(".process-inner .current-len").css("width",data.replayPosition/data.replayDuration*100+"%");
            $(".process-inner .timeCode .total-time").html((data.replayDuration/1000).toFixed(2));
            $(".process-inner .timeCode .current-time").html((data.replayPosition/1000).toFixed(2));
        }else{
            isReplay = false;
            $(".preview-source .clip").css("background-color","#000");
            $(".preview-source .clip .video-process").removeClass("hide");
            $(".preview-source .clip img").removeClass("hide");
            $(".preview-source .apply-btn").removeClass("hide");
            $(".process-inner .timeCode .current-time").html("0.00");
            $(".process-inner .current-len").css("width","0");
        }
    }
    // 注册的事件
    function initEvent(){
        $(".overlay-tab .operation-clip").on("click",function(){//显示切割图片
            renderPic();
        });
        $(".show-clipvideo .select-single").on("click","li .remark .btn",function(){
            if(!mix_fn.isPrower("Replay")) return false;
            var thisObj = $(this);
            var index = thisObj.parents("li").index();
            var playerObj = $(".preview-content .preview-item[data-filename='Default']");
            var rid = playerObj.attr("data-rid").toLowerCase();
            var filenames = [];
            var currentR = $(".preview-content .preview-item").eq(index);
            filenames.push(currentR.attr("data-filename"));
            getImage(rid,filenames);
        });
        $(".clip-dot .close").on("click",function(){
            $(".clip-dot").hide();
            $('.preview-source .clip').remove();
            $('.preview-source .apply-btn').remove();
            changeVideoCut(true);
        });
        //添加滑块的点击事件
        $(".clip-dot").off("mousedown").on("mousedown", ".clip-slider .rightHandle", function(e) {
            e = e||event;
            var disX = e.clientX - this.offsetLeft;
            var obj = $(this).parent();
            if(isReplay==true) return false;
            var showStartTime = obj.attr("data-endtime");
            var showTime = obj.attr("data-endtime");
            renderMark(showTime,showTime-showStartTime);
            $(document).off("mousemove").on("mousemove", function(e) { //拖动时移动
                var clipObj = $(".preview-source .clip");
                if(clipObj.length!==0&&clipObj.css("display")=="none") return false;
                toMoveRightClip(e,disX,obj);
                return false;
            });
            $(document).off("mouseup").on("mouseup", function(e) {
                $(document).unbind('mousemove');
                $(document).unbind('mouseup');
                changeHandlerPos();
                return false;
            });
            return false;
        });
        // $(".clip-source").on("click",".source .checkbox",function(){
        //     var thisObj = $(this);
        //     if(thisObj.hasClass("icon-check")){
        //         thisObj.parent().find(".mark").show(); 
        //         thisObj.removeClass("icon-check").addClass("icon-uncheck");
        //         thisObj.parent().addClass("active");
        //     }else{
        //         thisObj.parent().find(".mark").hide();
        //         thisObj.removeClass("icon-uncheck").addClass("icon-check");
        //         thisObj.parent().removeClass("active");
        //     }
        //     var sourceActiveObj = $(".clip-source .source.active");
        //     $(".preview-source .clip").remove();
        //     if(sourceActiveObj.length>0){
        //         var startTime = sourceActiveObj.eq(0).find(".clip-slider").attr("data-starttime");
        //         startTime = parseInt(startTime/1000)*1000;
        //         renderMark(startTime);
        //     }
        // });
        $(".clip-source").off("mousedown").on("mousedown", ".clip-slider .leftHandle", function(e) {
            e = e||event;
            var obj = $(this).parent();
            var disX = e.clientX-obj[0].offsetLeft;
            if(isReplay==true) return false;
            var showTime = obj.attr("data-starttime");
            renderMark(showTime,0);
            $(document).off("mousemove").on("mousemove", function(e) { //拖动时移动
                var clipObj = $(".preview-source .clip");
                if(clipObj.length!==0&&clipObj.css("display")=="none") return false;
                toMoveLeftClip(e,disX,obj);
                return false;
            });
            $(document).off("mouseup").on("mouseup", function(e) {
                $(document).unbind('mousemove');
                $(document).unbind('mouseup');
                changeHandlerPos();
                return false;
            });
            return false;
        });
        $(".preview-source").on("click",".apply-btn",function(){
            expressApply("record/express_apply_pvw");
        });
        // 鼠标放上显示replay按钮和进度条
        $(".preview-source").on("mouseenter",function(){
            var clip = $(".preview-source");
            if(clip.length!==0&&isReplay==false){
                clip.find(".apply-btn").removeClass("hide");
                clip.find(".video-process").removeClass("hide");
            }
        });
        $(".preview-source").on("mouseleave",function(){
            var clip = $(".preview-source");
            if(clip.length!==0&&isReplay==false){
                clip.find(".apply-btn").addClass("hide");
                clip.find(".video-process").addClass("hide");
            }
        });
        $(".select-single").on("mouseenter",".seat",function(){
            $(this).find(".remark").removeClass('hide');
        });
        $(".select-single").on("mouseleave",".seat",function(){
            $(this).find(".remark").addClass('hide');
        });
        $(".clip-dot").on("change", ".operation-uploadLogo", function () {//上传转场图片
            var imageVal = $("#file_trans").val();
            var inputObj = document.getElementById("file_trans");
            var img = new Image;
            img.onload = function () {
                if (!imageVal.match(/.png$/i)) {
                    oUtils.alertTips("i18n_LogoPngFormat");
                    $("#file_trans").val("");
                    return;
                }
                var size = img.width + "x" + img.height;
                var formData = new FormData();
                formData.append("peerId", $(".rList-show").attr("data-peerid"));
                formData.append("size", size);
                formData.append("type", 1);//表示transition
                formData.append("module", 1);
                formData.append("upload", $('#file_trans')[0].files[0]);
                $(".clip-dot .pic-submit").hide();
                $(".clip-dot .pic-load").show();
                $.ajax({
                    type: "POST",
                    url: "/producerpro/logo_uploadLogo",
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function (data) {
                        data = JSON.parse(data);
                        $("#file_trans").val('');
                        if (data.errorCode == "0x0") {
                            $(".clip-dot .pic-submit").css("background-image","url("+data.result.url+")");
                            $(".clip-dot .pic-submit").attr("data-userlogoid",data.result.userLogoId);
                        }
                        $(".clip-dot .pic-submit").show();
                        $(".clip-dot .pic-load").hide();
                    }, error: function (data) {
                        oUtils.alertTips("i18n_uploadLogoFail");
                        $(".clip-dot .pic-submit").show();
                        $(".clip-dot .pic-load").hide();
                    }
                })
            }
            img.src = window.URL.createObjectURL(inputObj.files[0]);
        });

    }
    initEvent();
    initSpeed();
    return {
        expressApply:expressApply,
        changeVideoCut:changeVideoCut,
        createStatusOverdue:createStatusOverdue,
        screenShot:screenShot
    }
})($,switchLangObj);