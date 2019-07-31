var correctDrag= (function($,switchLangObj,overlying,widthAndHeight){  
    function textBlur(drag){
        var className = drag.scaleClassName;
        var thisObj = $(".DragAndDrop "+className);
        var scaleRate = $(className).css("transform");
        if(scaleRate!="none"){
            scaleRate = scaleRate.substring(7,scaleRate.indexOf(","));
            var fontSize = parseInt(thisObj.css("font-size"))*scaleRate;
            if(fontSize>12){
               thisObj.css({"transform":"scale(1)","font-size":fontSize+"px"});
            }else{
                scaleRate = fontSize/12;
                thisObj.css({"transform":"scale("+scaleRate+")","font-size":fontSize+"px"});
            }  
        }
        var param = overlayCut.subtitleCom();
        param.style=JSON.stringify(param.style);
        param.id = param.textId;
        param.checked = 1;
        overlying.textInit(param,true);
        $("#preview .textDiv").css({
            width:thisObj.width()+"px",
            height:thisObj.height()+"px",
        })
    }
    // 判断logo是否为偶数
    function needEven(num){
        num = Math.round(num);
        if(num%2==1){
            num++;
        }
        return num;
    }
    function correctPip(drag){
        var target = drag.target;
        var rate  = 9/16;
        var param = {};
        var imageWidth = $(target).width();
        var logoLeft = $(target).position().left;
        var logoYOffset = $(target).position().top;
        var logoXOffset = $("#preview").width() - logoLeft - imageWidth;
        logoXOffset = widthAndHeight.getOutputWidth("#preview", logoXOffset);
        imageWidth = widthAndHeight.getOutputHeight("#preview", imageWidth);
        logoYOffset = widthAndHeight.getOutputWidth("#preview", logoYOffset);
        param ={};
        param.pipXOffset = needEven(logoXOffset);
        param.pipWidth = needEven(imageWidth);
        param.pipYOffset = needEven(logoYOffset);
        param.pipHeight = Math.round(param.pipWidth*rate);
        param.id = $(".pretreat-content .pip").attr("data-id");
        param.pipAudioSharedMemoryName = $(".pretreat-content .pip").attr("data-pipaudiosharedmemoryname");
        param.pipVideoSharedMemoryName = $(".pretreat-content .pip").attr("data-pipvideosharedmemoryname");
        param.zorder = $("#preview .pip").css("z-index");
        param.checkedStatus = 1;
        // $(target).css({
        //     width:widthAndHeight.getPriviewWidth("#preview", null, param.pipWidth)+"px",
        //     height:widthAndHeight.getPriviewWidth("#preview", null, param.pipWidth*rate)+"px",
        //     top:widthAndHeight.getPriviewHeight("#preview", null, param.pipYOffset)+"px",
        // });
        // $(target).css({
        //     left:widthAndHeight.getPriviewWidth("#preview", null, (widthAndHeight.resolutionW-param.pipXOffset-param.pipWidth))+"px",
        // });
        console.log(param);
        overlying.pipInit(param);
    }
    function correctLogo(drag){
        var target = drag.target;
        var rate  = drag.rate;
        var param = {};
        var imageWidth = $(target).width();
        var imageHeight = $(target).height();
        var logoLeft = $(target).position().left;
        var logoYOffset = $(target).position().top;
        var logoXOffset = $("#preview").width() - logoLeft - imageWidth; 
        param.logoXOffset = widthAndHeight.getOutputWidth("#preview", logoXOffset);
        param.logoYOffset = widthAndHeight.getOutputHeight("#preview", logoYOffset);
        param.imageWidth = widthAndHeight.getOutputWidth("#preview", imageWidth);
        param.imageHeight = Math.round(param.imageWidth*drag.rate);
        param.id = $(target).attr("data-id");
        param.logoXOffset = needEven(param.logoXOffset);
        param.logoYOffset = needEven(param.logoYOffset);
        param.imageWidth = needEven(param.imageWidth);
        param.imageHeight = Math.round(param.imageWidth*drag.rate);

        $(target).css({
            width:widthAndHeight.getPriviewWidth("#preview", null, param.imageWidth)+"px",
            height:widthAndHeight.getPriviewWidth("#preview", null, param.imageWidth*drag.rate)+"px",
            top:widthAndHeight.getPriviewHeight("#preview", null, param.logoYOffset)+"px",
        });
        $(target).css({
            left:widthAndHeight.getPriviewWidth("#preview", null, (widthAndHeight.resolutionW-param.logoXOffset-param.imageWidth))+"px",
        });
        param.url = $(target).attr("data-url");
        param.zorder = $(target).css("z-index");
        param.checkedStatus = 1;
        overlying.logoInit(param,true);
    }
    function correctClock(drag){
        var target = drag.target;
        var param = {};
        var imageWidth = $(target).width();
        var imageHeight = $(target).height();
        var logoLeft = $(target).position().left;
        var logoYOffset = $(target).position().top;
        var logoXOffset = $("#preview").width() - logoLeft - imageWidth; 
        param.xOffset = widthAndHeight.getOutputWidth("#preview", logoXOffset);
        param.yOffset = widthAndHeight.getOutputHeight("#preview", logoYOffset);
        param.id = $(target).attr("data-id");
        param.imageWidth = widthAndHeight.getOutputWidth("#preview", imageWidth);
        param.id = $(target).attr("data-id");
        param.zorder = 1000;
        param.operation = $(target).attr("data-operation");
        param.height = "60";
        param.width = "144";
        param.checked = "1";
        if($(".clockDiv").attr("data-operation")!=="create"){
            $(".clockDiv").attr("data-operation","clockCut");
        }
        var style = {
            "fontName":"Arial",
            "fontSize":46,
            "foregroundColor":"FFFFFFFF",
            "text":$(".clockTextarea").html(),
            }
        param.style = style;
        overlying.clockInit(param,true);
    }
    function setHtmlFontSize(){
        var whdef = 100/1920;// 表示1920的设计图,使用100PX的默认值
        var wW = window.innerWidth;// 当前窗口的宽度
        var rem = wW * whdef;// 以默认比例值乘以当前窗口宽度,得到该宽度下的相应FONT-SIZE值
        $('html').css('font-size', rem + "px");
        var bigVideo = $(".big-video");
        for(var i = 0;i < bigVideo.length; i++){
            var videoBox = bigVideo.eq(i);
            videoBox.css("height",Math.random(videoBox.width()*9/16)+"px");
        }
        setVideoSize();
    }
    function setVideoSize(){
        //获取可视区高度
        var clientHeight =  document.documentElement.clientHeight || document.body.clientHeight;
        //获取可视区宽度
        var clientWidth =  document.documentElement.clientWidth || document.body.clientWidth;
        var bigVideo = $(".big-video");
        if(clientHeight/clientWidth<9/16&&clientHeight>766&&clientHeight<1080){
            // 获取header的高
            var headerH = $("header").height();
            // 获取preview list的高
            var previewListH = $(".sd-preview-list").height();
            //获取叠加效果的高
            var overlayH = $(".sd-pretreat").height();
            //获取选项卡的高
            var overlayTabH = $(".overlay-tab").height();
            // video tab 高
            var previewTopH = $(".preview-top").height();
            var height = headerH + previewListH + overlayH + overlayTabH + previewTopH;
            height = clientHeight-height-5;
            var mainCenterWidth = $(".main-center").width();
            //获得页面填充视频的padding
            var padLeftAndRight = ((clientWidth - mainCenterWidth)/2 - 16/9*height)/2;
            $(".sd-main .main-preview .inner").css("padding","0 "+padLeftAndRight+"px");
            $(".sd-main .main-output .inner").css("padding","0 "+padLeftAndRight+"px");
            for(var i = 0;i < bigVideo.length; i++){
                var videoBox = bigVideo.eq(i);
                videoBox.css("height",height+"px");
            }
        }else{
            $(".sd-main .main-preview .inner").removeAttr("style");
            $(".sd-main .main-output .inner").removeAttr("style");
            $(".sd-main .main-preview .inner").css("padding-left","10px");
            $(".sd-main .main-output .inner").css("padding-right","10px");
            for(var i = 0;i < bigVideo.length; i++){
                var videoBox = bigVideo.eq(i);
                videoBox.css("height",videoBox.width()*9/16+"px");
            }
        }
        if($(".main-preview .big-video").width()>800){
            
            $(".main-center").css("margin-top","none");
            $(".sd-main .audio").removeAttr("style");
            $(".sd-main .audio .row .back").removeAttr("style");
            $(".sd-main .audio .row .bg").removeAttr("style");
        }else{
            var audioH = $(".main-preview .big-video").height();
            $(".sd-main .audio").css("height",audioH*0.8+"px");
            $(".sd-main .audio .row .back").css("height",audioH*0.8+"px");
            $(".sd-main .audio .row .bg").css("height",audioH*0.8+"px");
            $(".main-center").css("margin-top","10px");
            
        }
        if($(".main-preview .big-video").width()>500){
            $(".main-preview .preview-title").css("display","block");
            $(".output-top .output-title").css("display","block");
        }else{
            $(".main-preview .preview-title").css("display","none");
            $(".output-top .output-title").css("display","none");
        }
        
    }
    function dragCorrectPositionAndSize(){
        setHtmlFontSize();
        var width = document.body.clientWidth;
        var scale = $(".main-preview .preview-source").width()/widthAndHeight.resolutionW;
        // $("#preview").css("transform","scale("+scale+")");
        // $(".output-source .big-video").css("transform","scale("+scale+")");

        if($("#preview").width()>816){
            $(".score-pattern ul").css("left","0");
        }
        var scoreObj  = $(".pretreat-content .pretreat-item-score.check");
        if(scoreObj.length!==0){
            var params = scoreObj.attr("data-params");
            params = decodeURIComponent(params);
            params = JSON.parse(params);
            if(params.imageWidth==null){
               var whArr = params["size"].split("x");
               params.imageWidth = whArr[0];
               params.imageHeight = whArr[1];
            }

            var imageWidth = widthAndHeight.getPriviewWidth("#preview", null, params.imageWidth);
            var imageHeight = widthAndHeight.getPriviewHeight("#preview", null, params.imageHeight);
            var right = widthAndHeight.getPriviewWidth("#preview", null, params.logoXOffset);
            var top = widthAndHeight.getPriviewHeight("#preview", null, params.logoYOffset);
            var left = $("#preview").width()-right-imageWidth; 
            var rate = imageWidth/params.imageWidth;
            $(".scoreDiv .score-scale").css("transform","scale("+scale+")");
            var zorder = $("#preview .scoreDiv").css("z-index");
            $(".scoreDiv").removeAttr("style");
            $(".scoreDiv").css({
                position:"absolute",
                "width":imageWidth+"px",
                "height":imageHeight+"px",
                "left":left+"px",
                "top":top+"px",
                "z-index":zorder
            });
        }
        var logoObj  = $(".pretreat-content .logo.check");
        if(logoObj.length!==0){
            $.each(logoObj, function(idx,v){
                var logoParams = $(v).attr("data-params");
                logoParams = JSON.parse(decodeURIComponent(logoParams));
                overToPreview.logoInit(logoParams);
            })
        }
        if($(".output-source .big-video .logo-box").length!=0){
            var logoBox = $(".output-source .big-video .logo-box"),logoParam;
            for(var i=0; i<logoBox.length; i++){
                if(!logoBox.eq(i).hasClass("scoreDiv")){
                    logoParam = logoBox.eq(i).attr("data-params");
                    logoParam = JSON.parse(decodeURIComponent(logoParam));
                    overToPreview.logoInit(logoParam,".output-source .big-video");
                } 
            }
        }
        var textObj  = $(".pretreat-content .pretreat-item-text.check");
        if(textObj.length!==0){
            var params = textObj.attr("data-params");
            params = decodeURIComponent(params);
            params = JSON.parse(params);
            var right = widthAndHeight.getPriviewWidth("#preview", null, params.xOffset);
            var top = widthAndHeight.getPriviewHeight("#preview", null, params.yOffset);
            var style = JSON.parse(params.style);
            var fontSize = widthAndHeight.getPriviewHeight("#preview", null,style.fontSize);
            var background=style.backgroundColor.slice(2, 8);
            var bgOpacity=style.backgroundColor.slice(0,2);
            var sRgbColor=HexToRgba(background,bgOpacity);
            var Color=style.foregroundColor.slice(2, 8);
            var textObj = $("#preview .textDiv");
            var zorder = textObj.css("z-index");
            $("#preview .textDiv").removeAttr("style");
            $("#preview .textDiv").css({
                position:"absolute",
                "right":right+"px",
                "top":top+"px",
            });
            $("#preview .textDiv .preTextarea").css("font-size",fontSize+"px");
            var offsetLeft=$("#preview").width()-right-$("#preview .textDiv").width();
            textObj.removeAttr("style");
            textObj.css({
                position:"absolute",
                "left":offsetLeft+"px",
                "top":top+"px",
                'z-index':zorder
            });
            $("#preview .textDiv").css("background-color",sRgbColor);
            $("#preview .textDiv .preTextarea").css("color","#"+Color);
        }
        // 改变pip
        if($("#preview .pip").length!=0){
            var params ={
                pipXOffset:'',
                pipYOffset:'',
                pipWidth:'',
                pipHeight:'',
            };
            params = getAttrs($(".pretreat-content .pip"),params);
            var pipWidth = widthAndHeight.getPriviewWidth("#preview", null, params.pipWidth);
            var pipHeight = widthAndHeight.getPriviewHeight("#preview", null, params.pipHeight);
            var right = widthAndHeight.getPriviewWidth("#preview", null, params.pipXOffset);
            var top = widthAndHeight.getPriviewHeight("#preview", null, params.pipYOffset);
            var zorder = $("#preview .pip").css("z-index");
            $("#preview .pip").removeAttr("style");
            $("#preview .pip").css({
                "width":pipWidth+"px",
                "height":pipHeight+"px",
                "right":right+"px",
                "top":top+"px",
                'z-index':zorder
            });
        }
        if($(".output-source .big-video .pip").length!=0){
            var targetName = ".output-source .big-video";
            var params ={
                pipXOffset:$(".output-source .big-video .pip").attr("data-pipxoffset"),
                pipYOffset:$(".output-source .big-video .pip").attr("data-pipYOffset"),
                pipWidth:$(".output-source .big-video .pip").attr("data-pipWidth"),
                pipHeight:$(".output-source .big-video .pip").attr("data-pipHeight"),
            };
            var pipWidth = widthAndHeight.getPriviewWidth(targetName, null, params.pipWidth);
            var pipHeight = widthAndHeight.getPriviewHeight(targetName, null, params.pipHeight);
            var right = widthAndHeight.getPriviewWidth(targetName, null, params.pipXOffset);
            var top = widthAndHeight.getPriviewHeight(targetName, null, params.pipYOffset);
            var zorder =  $(".output-source .big-video .pip").css("z-index");
            $(".output-source .big-video .pip").removeAttr("style");
            $(".output-source .big-video .pip").css({
                "width":pipWidth+"px",
                "height":pipHeight+"px",
                "right":right+"px",
                "top":top+"px",
                "z-index":zorder
            });
        }

        var clockObj  = $(".pretreat-content .pretreat-item-clock.clock");
        if(clockObj.length!=0){
            var clockParams = clockObj.attr("data-params");
            clockParams = JSON.parse(decodeURIComponent(clockParams));
            overToPreview.clockInit(clockParams);
        }
        if($(".output-source .big-video .clockDiv").length != 0){
            var clockParams = $(".output-source .big-video .clockDiv").attr("data-params");
            clockParams = JSON.parse(decodeURIComponent(clockParams));
            overToPreview.clockInit(clockParams,".output-source .big-video");
        }
        if($(".output-source .big-video .textDiv").length != 0){
            var textParams = $(".output-source .big-video .textDiv").attr("data-params");
            textParams = JSON.parse(decodeURIComponent(textParams));
            overToPreview.textInit(textParams,".output-source .big-video");
        }   
    }
    setHtmlFontSize();//初始化一次数据
    return {
        textBlur:textBlur,
        correctLogo:correctLogo,
        correctPip:correctPip,
        dragCorrectPositionAndSize:dragCorrectPositionAndSize,
        correctClock:correctClock
    }
})($,oUtils,overlying,widthAndHeight);
