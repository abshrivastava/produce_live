var overlayObj= (function($,oUtils,switchLangObj){
    function initEvent(){
        //点击叠加效果logo列表
        $(".pretreat-content").on("click", ".logo", function () {
            //在cut的时候不能修改叠加效果
            if (overlayCut.isCut) return;
            var thisObj = $(this);
            if (thisObj.hasClass("check")) {
                thisObj.removeClass("check");
                thisObj.css("border", "1px solid #444");
                var fileId = thisObj.attr("data-id");
                $(".preview-source .logo" + fileId).remove();
            } else {
                //添加logo到preview
                thisObj.addClass("check");
                thisObj.css("border", "1px solid #41FF6D");
                var params = {
                    imageWidth: '',
                    imageHeight: '',
                    logoYOffset: '',
                    logoXOffset: '',
                    url: '',
                    id: ''
                };
                params = getAttrs(thisObj, params);
                params.zorder = currentRInfo.zorder++;
                overToPreview.logoInit(params);
            }
        });


        //点击叠加text列表
        $(".pretreat-content").on("click", ".text", function () {
            //在cut的时候不能修改叠加效果
            if (overlayCut.isCut) return;
            var thisObj = $(this);
            if (thisObj.hasClass("check")) {
                thisObj.removeClass("check");
                thisObj.css("border", "1px solid #444");
                $(".preview-source .textDiv").remove();
            } else {
                //添加logo到preview
                thisObj.addClass("check");
                thisObj.css("border","1px solid #41FF6D");
                var params = thisObj.attr("data-params");
                params = decodeURIComponent(params);
                params = JSON.parse(params);
                params.zorder = currentRInfo.zorder++;
                overToPreview.textInit(params); 
            }
        });

        $(".pretreat-content").on("click", ".clock", function () {
            //在cut的时候不能修改叠加效果
            if (overlayCut.isCut) return;
            var thisObj = $(this);
            if (thisObj.hasClass("check")) {
                thisObj.removeClass("check");
                thisObj.css("border", "1px solid #444");
                $(".preview-source .clockDiv").remove();
            } else {
                //添加logo到preview
                thisObj.addClass("check");
                thisObj.css("border","1px solid #41FF6D");
                var params = thisObj.attr("data-params");
                params = decodeURIComponent(params);
                params = JSON.parse(params);
                params.zorder  = 10000;
                overToPreview.clockInit(params);    
            }
        });

        // 点击叠加比分牌列表
        $(".pretreat-content").on("click", ".score", function () {
            //在cut的时候不能修改叠加效果
            if (overlayCut.isCut) return;
            var thisObj = $(this);
            if (thisObj.hasClass("check")) {
                thisObj.removeClass("check");
                thisObj.css("border", "1px solid #444");
                var fileId = thisObj.attr("data-id");
                $(".preview-source .scoreDiv").remove();
            } else {
                //添加score到preview
                thisObj.addClass("check");
                thisObj.siblings('.score').removeClass('check');
                thisObj.siblings('.score').css("border", "1px solid #444");
                $(".preview-source .scoreDiv").remove();
                thisObj.css("border", "1px solid #41FF6D");
                var params = thisObj.attr("data-params");
                params = decodeURIComponent(params);
                params = JSON.parse(params);
                params.zorder = currentRInfo.zorder++;
                overToPreview.scoreInit(params);
            }
        });

        //pip选择源列表添加下拉功能
        $(".pip-setting .pip-in-source").fnNiceScroll();
        //create pip div
        $(".pip-pat .pip-picture").on("click",function(){
            var thisObj = $(this);
            //由于只能创建一个pip,所以pip已经创建,并且在uncheck状态下，用户再点击pip会使原先的uncheck pip变为check
            //如果在check状态下，用户再点击，什么操作都不做，return 
            if(thisObj.hasClass("created")){
                if($(".pretreat-content .pip").hasClass("check")){//表示已经创建，而且也已经显示到preview
                    return;
                }else{//表示已经创建，但是没有显示到preview中
                    $(".pretreat-content .pip").trigger("click");
                }
            }else{
                createPipToInit(thisObj);
            }       
        });
        //click select source get source sum
        $(".pip-in-sel p").on("click",function(e){
            if(!$(".pip-pat .pip-picture").hasClass("created"))return;
            //get source list sum
            var sourceLength = $(".preview-content .preview-item").length;
            var html="";
            for (var i = 1; i <=sourceLength ; i++) {
                html+="<li>"+i+"</li>";
            }
            $(".pip-in-source").html(html);
            $(".pip-in-source").css("display","block");
            // $(".pip-out-source").css("display","none");
            e.stopPropagation();
        });
        
        //在pip叠加效果栏中，点击编辑按钮，出现pip编辑
        $(".pretreat-content").on("click",".edit",function(){
        //在cut的时候不能修改叠加效果
            if(overlayCut.isCut)return;
            var parentObj = $(this).parent();
            var tallyArr = [];
            if(parentObj.hasClass("pip")){
                $(".sd-pip").removeClass("hide").siblings().addClass("hide"); 
                $(".sd-operation-type").addClass("hide");
                $(".sd-pretreat-container .show-pip").addClass("hide");
                overlying.pipEidtInit();
                if(!parentObj.hasClass("check")){
                    var params = {
                        id:parentObj.attr("data-id"),
                    }
                    var fileName = parentObj.attr("data-pipvideosharedmemoryname");
                    var previewItemObj = $(".preview-content .preview-item[data-filename='"+fileName+"']");
                    var toPreviewRid = previewItemObj.attr("data-rid");
                    previewItemObj.addClass("pipPreviewActive");
                    if(toPreviewRid){
                        var toPreviewTally = {};
                        toPreviewTally["rid"] = toPreviewRid;
                        if(!previewItemObj.hasClass("pipOutputActive")&&!previewItemObj.hasClass("outPutActive")&&!previewItemObj.hasClass("previewActive")){
                            toPreviewTally["type"] =131;
                            tallyArr.push(toPreviewTally);
                            params["tallyArray"] = JSON.stringify(tallyArr);
                        } 
                    }
                    var videoId = previewItemObj.find("video").eq(0).attr("id");
                    params["checked"] = 1;
                    oUtils.ajaxReq("/producerpro/studio_update",params,function(data){
                        if(data.errorCode=="0x0"){
                            //添加logo到preview
                            parentObj.addClass("check");
                            parentObj.css("border","1px solid #41FF6D");
                            var params ={
                                pipXOffset:'',
                                pipYOffset:'',
                                zorder:'',
                                pipWidth:'',
                                pipHeight:'',
                                pipVideoSharedMemoryName:'',
                                pipAudioSharedMemoryName:'',
                                audioStatus:'',
                            };
                            params = getAttrs(parentObj,params);
                            params.zorder = currentRInfo.zorder++;
                            overToPreview.pipInit(params,videoId);
                        }else{
                            oUtils.alertTips(data.errorInfo,1500);
                        }
                    }); 
                } 
            }else if(parentObj.hasClass("score")){
                if($(".preview-source .scoreDiv").length!==0){
                    $(".preview-source .scoreDiv").trigger("click");
                }else{
                    $(".sd-pretreat-operation").addClass("active");
                    $(".sd-operation-type").hide();
                    $(".operation-view-score").css("border","");
                    var scoreObj = $(".operation-view-score");
                    scoreObj.css("border","none");
                    $(".pretreat-content").addClass("hide");
                    $(".sd-score").removeClass("hide").siblings().addClass("hide");
                }
            }
            // }else{
            //     $(".sd-operation-show ").removeClass("hide"); //singular
            //     $(".sd-pretreat-operation").addClass("active");
            //     $(".sd-operation-type").hide();
            //     //获取 singular 
            //     $(".pretreat-content").addClass("hide");
            //     $(".sd-singular").removeClass("hide").siblings().addClass("hide");
            // }
            return false;   
        });
        //点击叠加效果实现栏的pip模块创建和删除pip模块
        $(".pretreat-content").on("click",".pip",function(){
            if(overlayCut.isCut)return;
            var thisObj = $(this);
            var params = {
                id:thisObj.attr("data-id"),
            }

            var tallyArr = [];
            if(thisObj.hasClass("check")){
                var obj = $(".preview-content .preview-item.pipPreviewActive");
                if($(".main-preview .icon-erphone").hasClass("active")){
                    volume.delPipVideoVolume("pipPreviewActive");
                }
                var rid = obj.attr("data-rid");
                if(rid){
                    var previewTally = {};
                    previewTally["rid"] =rid;
                    if(!obj.hasClass("pipOutputActive")&&!obj.hasClass("outPutActive")&&!obj.hasClass("previewActive")){
                        previewTally["type"] =130;
                        tallyArr.push(previewTally);
                        params["tallyArray"] = JSON.stringify(tallyArr);
                    } 
                }
                $(".preview-content .preview-item.pipPreviewActive").removeClass("pipPreviewActive");
                //发送停止流的请求
                params["checked"] = 0;
                oUtils.ajaxReq("/producerpro/studio_update",params,function(data){
                    if(data.errorCode=="0x0"){
                        thisObj.removeClass("check");
                        thisObj.css("border","1px solid #444");
                        var id = $(".preview-source .pip").find("video").attr("id");
                        $(".preview-source .pip").remove();
                    }else{
                        oUtils.alertTips(data.errorInfo,1500);
                    }
                });
            }else{
                var fileName = thisObj.attr("data-pipvideosharedmemoryname");
                var previewItemObj = $(".preview-content .preview-item[data-filename='"+fileName+"']");
                var toPreviewRid = previewItemObj.attr("data-rid");
                previewItemObj.addClass("pipPreviewActive");
                if($(".main-preview .icon-erphone").hasClass("active")){
                    volume.setPipVideoVolume();
                }
                if(toPreviewRid){
                    var toPreviewTally = {};
                    toPreviewTally["rid"] = toPreviewRid;
                    if(!previewItemObj.hasClass("pipOutputActive")&&!previewItemObj.hasClass("outPutActive")&&!previewItemObj.hasClass("previewActive")){
                        toPreviewTally["type"] =131;
                        tallyArr.push(toPreviewTally);
                        params["tallyArray"] = JSON.stringify(tallyArr);
                    } 
                }
                var videoId = previewItemObj.find("video").attr("id");
                params["checked"] = 1;
                oUtils.ajaxReq("/producerpro/studio_update",params,function(data){
                    if(data.errorCode=="0x0"){
                        //添加logo到preview
                        thisObj.addClass("check");
                        thisObj.css("border","1px solid #41FF6D");
                        var params ={
                            pipXOffset:'',
                            pipYOffset:'',
                            zorder:'',
                            pipWidth:'',
                            pipHeight:'',
                            pipVideoSharedMemoryName:'',
                            pipAudioSharedMemoryName:'',
                            audioStatus:'',
                        };
                        params = getAttrs(thisObj,params);
                        params.zorder = currentRInfo.zorder++;
                        overToPreview.pipInit(params,videoId);
                    }else{
                        oUtils.alertTips(data.errorInfo,1500);
                    }
                }); 
            }
        });
        $(".overlay-tab .operation-btns").on("click",".op-label",function () {
            var thisObj = $(this);
            thisObj.addClass('active').siblings().removeClass('active');
            $(".overlay-tab .editSingular").addClass("hide");
            $(".operation-show").addClass('hide');
            $(".clip-dot").css("display","none");
            $(".preview-source .clip").remove();
            $(".preview-source .apply-btn").remove();
            $(".sd-pretreat .sd-pretreat-operation").removeClass("active");
            $(".sd-pretreat-container .pretreat-content").addClass("hide");
            clipDot.changeVideoCut(true);
            if(thisObj.hasClass("operation-text")){
                $(".sd-pretreat-container .pretreat-content.show-text").removeClass("hide");
                if ($(".pretreat-content").find(".pretreat-item-text").length > 0) {
                    $(".show-text .pretreat-content-add").addClass('hide');
                }
            }else if(thisObj.hasClass("operation-logo")){
                $(".sd-pretreat-container .pretreat-content.show-logo").removeClass("hide");
            }else if(thisObj.hasClass("operation-score")){
                $(".sd-pretreat-container .pretreat-content.show-score").removeClass("hide");
            }else if(thisObj.hasClass("operation-pip")){
                $(".sd-pretreat-container .pretreat-content.show-pip").removeClass("hide");
                if($(".sd-pretreat-container .pretreat-content.show-pip").find(".pip").length>0){
                    $(".show-pip .pretreat-content-add").addClass('hide');
                }
            }else if(thisObj.hasClass("operation-clock")){
                $(".sd-pretreat-container .pretreat-content.show-clock").removeClass("hide");
                if($(".sd-pretreat-container .pretreat-content.show-clock").find(".clock").length>0){
                    $(".show-clock .pretreat-content-add").addClass('hide');
                    return;
                }
            }else if(thisObj.hasClass("operation-clip")){
                $(".sd-pretreat-container .pretreat-content.show-clipvideo").removeClass("hide");
            }
            
        });

        $(".pretreat-content").on("mouseenter", ".singular-logo",function () {
            var thisObj = $(this);
            if(thisObj.hasClass("active"))thisObj.append('<i class="icon-edit iconfont edit"></i>');
        });


        //在input的时候切换preview
        $(".sd-pretreat").on("keyup","input",function(){
            return false;
        });

        $(".pretreat-content").on("mouseenter", ".pretreat-content-item",function () {
            var thisObj = $(this);
            thisObj.append('<i class="icon-colse iconfont close"></i>');
            if (thisObj.hasClass("pip")||thisObj.hasClass("score")) {
                thisObj.append('<i class="icon-edit iconfont edit"></i>');
            }   
        });
        /*
         * author: daniel
         * function: upload logo
         * params: 无
         */
        $(".sd-pretreat").on("change", ".operation-uploadLogo", function () {
            var imageVal = $("#file_p").val();
            var inputObj = document.getElementById("file_p");
            var img = new Image;
            img.onload = function () {
                var logoMaxHeight = $(".main-preview").attr("data-logomaxh") - 0;
                var logoMaxWidth = $(".main-preview").attr("data-logomaxw") - 0;
                if (img.height > logoMaxHeight || img.width > logoMaxWidth) {
                    fn_switchLangAlertTip("Image resolution can’t exceed " + logoMaxWidth + "x" + logoMaxHeight + " pixels", "只允许上传" + logoMaxWidth + "x" + logoMaxHeight + "分辨率以下的图片");
                    $("#file_p").val("");
                    return;
                } else {
                   if (!imageVal.match(/.png$/i)&&!imageVal.match(/.gif$/i)&&!imageVal.match(/.jpg$/i)&&!imageVal.match(/.jpeg$/i)) {
                        oUtils.alertTips("i18n_LogoFormatProducer");
                        $("#file_p").val("");
                        return;
                    }
                    var size = img.width + "x" + img.height;
                    var formData = new FormData();
                    formData.append("peerId", $(".rList-show").attr("data-peerid"));
                    formData.append("size", size);
                    formData.append("module", 1);
                    formData.append("zorder", currentRInfo.zorder++);
                    formData.append("upload", $('#file_p')[0].files[0]);
                    $(".pretreat-content-add .operation-logo-label").css("display","none");
                    $(".operation-type-btns .operation-type-btn.operation-logo").removeClass("hover-bg");
                    $(".show-logo .addImg").css("display","block");
                    $.ajax({
                        type: "POST",
                        url: "/producerpro/logo_uploadLogo",
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: function (data) {
                            data = JSON.parse(data);
                            $("#file_p").val('');
                            if (data.errorCode == "0x0") {
                                var result = data.result;
                                overlying.logoInit(result);
                                overToPreview.logoInit(result);
                            }
                            if(data.errorCode=='0x3'){//表示用户已经上传过的图片
                                oUtils.alertTips("i18n_logoHavedUpload");
                            }else if(data.errorCode=="0x4"){
                                oUtils.alertTips("i18n_producerPro_uploadLogoSize",2000);
                            }else if(data.errorCode=="0x80100003"){
                                oUtils.alertTips("i18n_uploadLogoFail");
                            }
                            $(".show-logo .operation-logo-label").css("display","block");
                            $(".operation-type-btns .operation-type-btn.operation-logo").addClass("hover-bg");
                            $(".show-logo .addImg").css("display","none");
                        }, error: function (data) {
                            oUtils.alertTips("i18n_uploadLogoFail");
                            $("#file_p").val("");
                            $("#loading-Bg").fadeOut();
                            $(".operation-type-btns .operation-type-btn .operation-logo-label").css("display","inline-block");
                            $(".operation-type-btns .operation-type-btn.operation-logo").addClass("hover-bg");
                            $(".show-logo .addImg").css("display","none");
                        }
                    })
                }
            }
            img.src = window.URL.createObjectURL(inputObj.files[0]);
        });

        $(".preview-source").on("click",".logo-box",function(e) {
            e.stopPropagation();
            $(".sd-pretreat-container .pretreat-content").addClass("hide");
            $(".operation-show").addClass('hide');
            $(".operation-logo").addClass("active");
            $(".changepoint").remove();
            $(".operation-logo").siblings().removeClass('active');
            $(".show-logo").removeClass('hide');
        });
        /*
         * author: Rachel
         * function: upload text
         * params: 无
         */
        /*text function start*/
        $(".show-text").on("click",".pretreat-content-add",function(){
            $(".show-text").addClass('hide');
            $(".sd-text").removeClass('hide');
            var preTextareaVal=switchLangObj.i18n_textValue;
            var params = null;
            if(i18nLanguage == "en"){
                params = textAjaxParams.en_text;//textAjaxParams,定义在scoreBaseData
            }else{
                params = textAjaxParams.zh_text;//textAjaxParams,定义在scoreBaseData
            }
            params.text = preTextareaVal;
            $("#sd-textarea").val(preTextareaVal);
            if(window.navigator.language=="zh-CN"||window.navigator.language=="zh"){
                $("#fontFamily").text("SimHei");
                params.style.fontName = "SimHei";
                // $("#preview.preTextarea").css("font-family","SimHei");
            }else if(window.navigator.language=="en-US"||window.navigator.language=="en"){
                $("#fontFamily").text("Arial");
                params.style.fontName = "Arial";
                // $("#preview.preTextarea").css("font-family","Arial");
            }else{
                $("#fontFamily").text("Arial");
                params.style.fontName = "Arial";
                // $("#preview .preTextarea").css("font-family","Arial");
            }
            params.zorder = currentRInfo.zorder++;
            var peerid = $(".rList-show").attr("data-peerId");
            $.ajax({
                type: "POST",
                url: "/producerpro/subtitle_add",
                data: {
                    peerId: peerid,
                    params: JSON.stringify(params)
                },
                success: function (data) {
                    data = JSON.parse(data);
                    if (data.errorCode == "0x0") {
                        var result = data.errorInfo;
                        overToPreview.textInit(result);
                        overlying.textInit(result);
                    }
                }
            })
            // addText();
        });

        /*text edit about start*/
        $(".bg-input").spectrum({
            showAlpha: true,
            move: function(tinycolor) {},
        });
        $(".bg-input").on('move.spectrum', function(e, tinycolor) {
            var color = $(".bg-input").siblings(".sp-replacer").find(".sp-preview-inner").css("background-color");
            if($(".preview-source .textDiv").length!==0){
                $(".preview-source .textDiv").css("background-color",color);
                updateText();
            }
        });
        $(".fontColor").spectrum({
            // showAlpha: true,
            move: function(tinycolor) {},
           
        });
        $(".fontColor").on('move.spectrum', function(e, tinycolor) {
            var color = $(".fontColor").siblings(".sp-replacer").find(".sp-preview-inner").css("background-color");
            if($(".preview-source .preTextarea").length!==0){
                $(".preview-source .preTextarea").css("color",color);
                updateText();
            }
        });
        /*text function end*/
        
        /*
         * author: Rachel
         * function: upload score
         * params: 无
         */
        /*score function start*/
        $(".show-score").on("click",".pretreat-content-add",function(){
            $(".show-score").addClass('hide');
            $(".sd-score").removeClass('hide');
        });

        $(".score-pattern ").on("click","li",function (e) {
            if($(".score-pattern").hasClass("disabled")) return;
            //如果是相同的一个score return 没有必要再次上传
            if($("#preview .scoreDiv").length>0&&$("#preview .scoreDiv").attr("data-url")==$(this).find(".operation-view-score").attr("data-url")){
                return false;
            }
            var index=$(this).index();
            $(this).find(".scoreLoading").removeClass('hide');
            addScore(index);
            e.stopPropagation();
        });
        //添加比分牌
        function addScore(index) {
            $(".score-pattern").addClass("disabled");
            var peerid = $(".rList-show").attr("data-peerId");
            // var subtitleArry=overlayCut.score(true);
            // img = "images/"+img+".png";
            var scoreData = scoreCard["score_"+index];
            scoreData.zorder = currentRInfo.zorder++;
            scoreData["peerId"] = peerid;
            $.ajax({
                type: "POST",
                url: "/producerpro/logo_uploadLogo",
                data: scoreData,
                success: function (data) {
                    data = JSON.parse(data);
                    $(".score-pattern").removeClass("disabled");
                    if (data.errorCode == "0x0") {
                        // $(".scoreDiv.score-hide").css("display","block");
                        // if($(".scoreDiv.score-active").length>0){
                     //       $(".scoreDiv.score-active").remove();
                     //    }
                        $("#preview .scoreDiv").remove();
                        $(".scoreLoading").addClass('hide');
                        $(".operation-view-score").css("border","");
                        var scoreObj = $(".operation-view-score").eq(index);
                        scoreObj.css("border","1px solid #41FF6D");
                        var result = data.result;
               //           $("#preview .scoreDiv").attr("data-id",result.id);
               //           $("#preview .score"+result.id).xingquanDrag({ resize: false });
                        overToPreview.scoreInit(result);
                        overlying.scoreInit(result, false, true);

                    }else if(data.errorCode == "0x80100003"){
                        if(data.errorInfo=="Query preload image failed"){
                            $(".scoreDiv.score-hide").remove();
                            oUtils.alertTips("i18n_preload");
                        }else{
                            oUtils.alertTips("i18n_uploadScoreFail");
                        }
                        $(".scoreLoading").addClass('hide');
                    }else{
                        $(".scoreDiv").remove();
                        $(".scoreLoading").addClass('hide');
                    }
                },
                error: function (data) {
                    $(".score-pattern").removeClass("disabled");
                    oUtils.alertTips("i18n_uploadScoreFail");
                    $(".scoreDiv.score-hide").remove();
                    $(".scoreLoading").addClass('hide');
                    $("#file_p").val("");
                    $("#loading-Bg").fadeOut();
                }
            });
        }
        /*score function end*/

         /*
         * author: Rachel,Danile
         * function: upload pip
         * params: 无
         */
        /*pip function start*/
        $(".show-pip").on("click",".pretreat-content-add",function(){
            $(".show-pip").addClass('hide');
            $(".sd-pip").removeClass('hide');
            $(".pip-pat .pip-picture").trigger("click");
        });

        //create pip div
        $(".pip-pat .pip-picture").on("click",function(){
            var thisObj = $(this);
            //由于只能创建一个pip,所以pip已经创建,并且在uncheck状态下，用户再点击pip会使原先的uncheck pip变为check
            //如果在check状态下，用户再点击，什么操作都不做，return 
            if(thisObj.hasClass("created")){
                if($(".pretreat-content .pip").hasClass("check")){//表示已经创建，而且也已经显示到preview
                    return;
                }else{//表示已经创建，但是没有显示到preview中
                    $(".pretreat-content .pip").trigger("click");
                }
            }else{
                createPipToInit(thisObj);
            }       
        });

        //click select source get source sum
        $(".pip-in-sel p").on("click",function(e){
            if(!$(".pip-pat .pip-picture").hasClass("created"))return;
            //get source list sum
            var sourceLength = $(".preview-content .preview-item").length;
            var html="";
            for (var i = 1; i <=sourceLength ; i++) {
                html+="<li>"+i+"</li>";
            }
            $(".pip-in-source").html(html);
            $(".pip-in-source").removeClass('hide');
            e.stopPropagation();
        });

        $(".preview-source").on("click",".pip",function(){
            overlying.pipEidtInit();
            $(".sd-pip").removeClass("hide");
            $(".operation-pip").addClass("active");
            $(".operation-pip").siblings().removeClass('active');
            $(".sd-pretreat-container .pretreat-content").addClass("hide");
            $(".sd-pip").siblings().addClass('hide');
        });

        //click li label get trans selected content and trigger event
        $(".pip-in-sel").on("click","li",function(){//创建pip webrtc
            //由于只能创建一个pip,所以pip已经创建,并且在uncheck状态下，用户再点击pip会使原先的uncheck pip变为check
            //如果在check状态下，用户再点击，什么操作都不做，return 
            if(!$(".pip-picture").hasClass("created"))return;
            var thisObj = $(this);
            var index = thisObj.html();
            changePipSource(index);   
        });
        /*pip function end*/

        
        /*
         * author: Rachel
         * function: upload clock
         * params: 无
         */
        /*score function start*/
        $(".show-clock").on("click",".pretreat-content-add",function(){
            $(".show-clock").addClass('hide');
            $(".sd-clock").removeClass('hide');
            if ($("#preview").find(".clockDiv").length == 0){
                // var clockHtml = '<div class="clockDiv"><div class="clockTextarea">00:00</div></div>';
                // $("#preview").append(clockHtml);
                // $(".clockDiv").DragAndDrop({resize: false,callback:correctDrag.correctClock});
                // $(".clockDiv").attr("data-operation","create");
                 var endTime=$(".defaultTime input").val();
                 if(endTime==""){
                    endTime=45*60;
                    $(".defaultTime input").val(45);
                 }else{
                    endTime = parseInt(endTime);
                 } 
                 clockObj.clockEndTime = parseInt(endTime)*60;
            }
            addClock(clockObj.clockEndTime);
            saveClockuserBehavior("create","pvw");
        });

        $(".clockInput").keyup(function(event) {
            var time=$(".TimeSet input").val();
            var modifidyTime=TimeByms(time*60);
            if(modifidyTime=="NaN:NaN"){
                $(".clockTextarea").html("00:00");
                return false;
            }
            $(".clockTextarea").html(modifidyTime);
        });

        //添加计时
        function addClock(endTime){
            var peerid = $(".rList-show").attr("data-peerId");
            var timeStamp = calPts($(".main-preview .main-player").attr("id"));
            // if(timeStamp=="") return;
            var obj = {"yOffset":60,"xOffset":218,"style":{"fontSize":46,"fontName":"Arial","foregroundColor":"FFFFFFFF","text":"00:00"},"zorder":10000,"width":144,"height":60,"horizonAlign":"left","verticalAlign":"center"};
            obj["startTime"]= 0;
            obj["endTime"]= endTime*1000;
            obj["timestamp"]=timeStamp;
            obj["operation"]= "create";
            $.ajax({
                type: "POST",
                url: "/producerpro/clock_add",
                async:false,
                data: {
                    peerId: peerid,
                    params: JSON.stringify(obj)
                },
                success: function (data) {
                    data = JSON.parse(data);
                    if (data.errorCode == "0x0") {
                        var result = data.result;
                        var textId = result.id;
                        $(".clockDiv").attr("data-id", textId);
                        overToPreview.clockInit(result);
                        overlying.clockInit(result);
                    }
                }
            });
        }
        //点击开始按钮
      
        $(".clockStart").click(function(event) {
            var time=parseInt($(".TimeSet input").val());
            var reg=/^[0-9]{1,3}$/;
            if(!reg.test(time)){
                oUtils.alertTips("i18n_onlyNumber");
                return false;
            }
            $(".clockInput").attr("disabled","disabled");
            if($("#preview").find(".clockDiv").length<1) return;
            $(".clockStart").addClass('hide');
            $(".clockStop").removeClass('hide');
            // clockObj.clockTimeStampeerClientStatusArr.rtcStatStamp[$(".main-preview .main-player").attr("id")];
            var endTime= $(".defaultTime input").val();
            if(endTime==""){
                endTime=10000;
            }   
            clockObj.clockEndTime = parseInt(endTime)*60;
            var startVal=$(".clockTextarea").html().split(":");
            var min=parseInt(startVal[0])*60;
            var second=parseInt(startVal[1]);
            var startTime=min+second;
            clockObj.clockSeconds=startTime;
            var userBehavier=checkLocation("location");//从userBehavier去取当前clock的位置
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
                        if(userBehavier=="pgm"){
                            applyClockToPgm(clockObj.clockSeconds*1000,clockObj.clockEndTime*1000);
                            saveClockuserBehavior("stop","pgm");
                        }else{
                            updateClock(clockObj.clockSeconds*1000,clockObj.clockEndTime*1000,"create");
                            saveClockuserBehavior("start","pvw");
                        } 
                    }
                
            },1000);
            if(userBehavier!=""){
                if(userBehavier=="pgm"){
                    $("#preview .clockDiv").attr("data-operation","run");
                    applyClockToPgm(clockObj.clockSeconds*1000,clockObj.clockEndTime*1000);
                    saveClockuserBehavior("start","pgm");
                }else{
                    $("#preview .clockDiv").attr("data-operation","start");
                    updateClock(clockObj.clockSeconds*1000,clockObj.clockEndTime*1000,"start");
                    saveClockuserBehavior("start","pvw");
                }
            }
        });

        $(".clockStop").click(function(event) {
            var totleTime;
            $(".clockStart").removeClass('hide');
            $(".clockStop").addClass('hide');
            $(".clockInput").removeAttr("disabled");
            var endTime= $(".defaultTime input").val();
            if(endTime==""){
                endTime=10000;
            }
            clockObj.clockEndTime = parseInt(endTime)*60;
            clearInterval(clockObj.setClockTimer);
            var userBehavier=checkLocation("location");
            if(userBehavier!=""){
                if(userBehavier=="pgm"){
                    $(".clockDiv").attr("data-operation","pause");
                    applyClockToPgm(clockObj.clockSeconds*1000,clockObj.clockEndTime*1000);
                    saveClockuserBehavior("stop","pgm");
                }else{
                    $(".clockDiv").attr("data-operation","create");
                    updateClock(clockObj.clockSeconds*1000,clockObj.clockEndTime*1000,"pause");
                    saveClockuserBehavior("stop","pvw");
                }
            }
        });

        $(".clockReset").click(function(event) {
            $(".clockTextarea").html("00:00");
            $(".clockStart").removeClass('hide');
            $(".clockStop").addClass('hide');
            $(".TimeSet input").val(0);
            $(".clockDiv").attr("data-operation","create");
            $(".clockInput").removeAttr("disabled");
            var endTime= $(".defaultTime input").val();
            if(endTime==""){
                endTime=10000;
            }
            clockObj.clockEndTime =endTime*60;
            clearInterval(clockObj.setClockTimer);
            $(".clockDiv").css("background-color","#212740");
            var userBehavier=checkLocation("location");
            if(userBehavier!=""){
                if(userBehavier=="pgm"){
                    applyClockToPgm(0,clockObj.clockEndTime*1000);
                    saveClockuserBehavior("stop","pgm");
                }else{
                    updateClock(0,clockObj.clockEndTime*1000,"create");
                    saveClockuserBehavior("stop","pvw");
                }
            }
        });

        //应用超时时间
        $(".defaultTime").on("click",".TimerApply",function(){
            $(".clockDiv").attr("data-operation","newEndTime");
            var endTime=parseInt($(".defaultTime input").val());
            var reg=/^[0-9]{1,3}$/;
            if(!reg.test(endTime)){
                oUtils.alertTips("i18n_onlyNumber");
                return false;
            }
            if(endTime=="" && endTime!=""){
                endTime=10000;
            }
            clockObj.clockEndTime = endTime*60;
            var status;
            if($(".clockStart").hasClass('hide')){
                status="start";
            }else{
                status="stop";
            }
            var userBehavier=checkLocation("location");
            if(userBehavier!=""){
                if(userBehavier=="pgm"){
                    applyClockToPgm(clockObj.clockSeconds*1000,clockObj.clockEndTime*1000);
                    saveClockuserBehavior(status,"pgm");
                }else{
                    updateClock(0,clockObj.clockEndTime*1000,"newEndTime");
                    saveClockuserBehavior(status,"pvw");
                }
            }
        })

         // 点击input框出现编辑框
        $("#preview").on("click", ".clockDiv", function (e) {
            var thisObj=$(this);
            $(".sd-clock").removeClass("hide");
            $(".sd-pretreat-container .pretreat-content").addClass("hide");
            $(".operation-clock").addClass("active");
            $(".operation-clock").siblings().removeClass('active');
            $(".changepoint").remove();
            $(".sd-clock").siblings().addClass('hide');
            e.stopPropagation();
        });


        $(".pretreat-content").on("mouseleave", ".pretreat-content-item", function () {
            var thisObj = $(this);
            thisObj.find(".close").remove();
            thisObj.find(".edit").remove(); 
        });

         $(".pretreat-content").on("mouseleave", ".singular-logo", function () {
            var thisObj = $(this);
            thisObj.find(".edit").remove(); 
        });

        $(".pretreat-content").on("click", ".close", function () {
            //在cut的时候不能修改叠加效果
            if (overlayCut.isCut) return;
            var parentObj = $(this).parent();
            if (parentObj.hasClass("logo")) {
                overlying.delLogo(parentObj)
            } else if (parentObj.hasClass("pip")) {
                overlying.delPip(parentObj);
            } else if (parentObj.hasClass("text")) {
                overlying.delText(parentObj);
            } else if (parentObj.hasClass("score")) {
                overlying.delScore(parentObj);
            }else if(parentObj.hasClass("clock")){
                overlying.delClock(parentObj);
            }
            return false;
        });

        //编辑状态返回缩略图
        $(".operation-item-title").click(function(){
            var thisObj=$(this);
            thisObj.parents(".operation").addClass('hide');
            var type=thisObj.attr("data-type");
            var pattern=$(".pretreat-content");
            $.each(pattern,function(i,v){
                var patternType=$(v).attr("data-type");
                if(type==patternType){
                    $(v).removeClass('hide');
                    if($(v).find(".pretreat-content-item").length>0){
                        if(patternType=="text"||patternType=="pip"||patternType=="clock"){
                            $(v).find(".pretreat-content-add").addClass('hide');
                        }
                    }
                    if(patternType=="singular"){
                        $(v).find(".singular-logo").removeClass('hide');
                    }
                } 
            });
        });
    /*
    * author: rachel
    * function: add text
    * params: 
    */
    $(".family-ul").fnNiceScroll();
    //样式
    $(".family-ul").on("click","li",function (e) {
        e.stopPropagation();
        var fontFamily = $(this).text().trim();
        $("#fontFamily").text(fontFamily);
        var obj = $("#preview .preTextarea");
        var preTextfamily=obj.css("font-family");
        $(this).parent().css("display","none");
        var width = obj.width();
        var text = obj.text().gblen();
        var fontSize =Math.round(width/text)*2;
        obj.css({"transform":"scale(1)","font-size":fontSize+"px"});
        if(fontFamily=="Proxima Nova Con..."){
            obj.css("font-family","Proxima Nova Condensed");
            $("#sd-textarea").css("font-family","Proxima Nova Condensed");
        }else{
            obj.css("font-family",fontFamily);
            $("#sd-textarea").css("font-family",fontFamily);
        }
        // obj.css("font-family",fontFamily);
        width = obj.width();
        var height = obj.height();
        $("#preview .textDiv").css({
            width:width+"px",
            height:height+"px",
        })  
        updateText();
    });

    //隐藏.familyi
    $(".sd-font-family").on("click",".fontFamilyDiv","i",function(e) {
        e.stopPropagation();
        var thisObj = $(this);
        if (thisObj.hasClass("disabled")) {
            $(".sd-font-family .family-ul").css("display", "none");
        } else {
            $(".sd-font-family .family-ul").css("display", "block");
        }
    });

    $(".preview-source").on("input",".preTextarea",function() {
        var thisObj = $(this);
        var html = thisObj.text();
        var gblen = html.gblen();
        var scaleRate = $("#preview .preTextarea").css("transform");
        var width = thisObj.width();
        if(scaleRate!="none"){
            scaleRate = scaleRate.substring(7,scaleRate.indexOf(","));
            width = width*scaleRate;
        }
        $("#preview .textDiv").css("width",width+"px");
        if($("#preview").width()<$("#preview .textDiv").width()+$("#preview .textDiv").position().left){
            html = html.substring(0,html.length-1);
            thisObj.text(html);
            var width = thisObj.width();
            if(scaleRate!="none"){
                scaleRate = scaleRate.substring(7,scaleRate.indexOf(","));
                width = width*scaleRate;
            }
            $("#preview .textDiv").css("width",width+"px");
        }
        var textWidth=$("#preview .textDiv").width();
        var textLeft=$("#preview .textDiv").position().left;
        if(textLeft+textWidth > $(".preview-source").width()-parseInt($("#preview .preTextarea").css("font-size"))/2){
                thisObj.text(html.substring(0,html.length-1));
                $("#preview .textDiv").css({
                    width:thisObj.width()+"px",
                    height:thisObj.height()+"px",
                })
                $("#preview .preTextarea").blur();
                return false;
        }
        $("#sd-textarea").val(html);
        updateText();
    });

    $(".preview-source").on("keydown",".preTextarea",function(e) {
        var keyCode = e.keyCode;
        if(keyCode==13)  return false;
    });

    $("#preview").on("focus",".preTextarea",function(){
        var thisObj = $(this);
        var scaleRate = $("#preview .preTextarea").css("transform");

        if(scaleRate!="none"){
            scaleRate = scaleRate.substring(7,scaleRate.indexOf(","));
            var fontSize = parseInt(thisObj.css("font-size"))*scaleRate;
            if(fontSize>12){
                $("#preview .preTextarea").css({"transform":"scale(1)","font-size":fontSize+"px"});
            }else{
                scaleRate = fontSize/12;
                $("#preview .preTextarea").css({"transform":"scale("+scaleRate+")","font-size":fontSize+"px"});
            }
            
        }
        $("#preview .textDiv").css({
            width:thisObj.width()+"px",
            height:thisObj.height()+"px",
        })
         
        // var width = parentObj.width();
        // everyFontWidth = (width/gblen);
        // var width = $("#preview").width()-parentObj.position().left;
        // fontLength = parseInt(width/everyFontWidth);
    });
        //textarea到input字体变化
    $("#sd-textarea").keydown(function(e){
        var keyCode = e.keyCode;
        if(keyCode==13)  return false;
        var textareaHtml=$("#sd-textarea").val();
        var textWidth=$("#preview .textDiv").width();
        var textLeft=$("#preview .textDiv").position().left;
        // $(".preTextarea").css("fontSize",$(".size-input").text()+"px");
        if(textLeft+textWidth > $(".preview-source").width()-parseInt($("#preview .preTextarea").css("font-size"))){
            if(keyCode == 8 ||keyCode == 46 || (keyCode >= 37 && keyCode <= 40)) {
                return true;
                $("#sd-textarea").focus();
            } else {
                $("#sd-textarea").blur();
                return false;
            }
        } else {
            $("#preview .preTextarea").text(textareaHtml);   
        }
    });

    $("#sd-textarea").keyup(function(){
        var textWidth=$("#preview .textDiv").width();
        var textLeft=$("#preview .textDiv").position().left;
        var textareaHtml=$("#sd-textarea").val();
        $("#preview .preTextarea").html(textareaHtml);
        updateText();
        $("#preview .textDiv").css({
            width:$("#preview .preTextarea").width()+"px",
            height:$("#preview .preTextarea").height()+"px",
        });
    });
}
    // 调用添加字幕接口
    function addText() {
        if ($("#preview .preTextarea").length == 0) return;
        var text = $("#preview .preTextarea").text();
        var peerid = $(".rList-show").attr("data-peerId");
        var obj=overlayCut.subtitleCom();
        $.ajax({
            type: "POST",
            url: "/producerpro/subtitle_add",
            data: {
                peerId: peerid,
                params: JSON.stringify(obj)
            },
            success: function (data) {
                data = JSON.parse(data);
                if (data.errorCode == "0x0") {
                    var result = data.errorInfo;
                    var textId = result.id;
                    $("#preview .preTextarea").attr("data-id", textId);
                    overlying.textInit(result);
                }
            }
        })
    };
    //更新字幕接口
    function updateText(){
        var peerid = $(".rList-show").attr("data-peerId");
        var textid = $("#preview .preTextarea").attr("data-id");
        var obj=overlayCut.subtitleCom();
        $.ajax({
            type: "POST",
            url: "/producerpro/subtitle_update",
            data: {
                peerId: peerid,
                textId: textid,
                params: JSON.stringify(obj)
            },
            success: function (data) {
                data = JSON.parse(data);
                if (data.errorCode == "0x0") {
                    var result = data.errorInfo;
                    var textId = result.id;
                    overlying.textInit(result,true);
                }
            }
        })
    };
    // 叠加效果栏
    //叠加效果初始化的相关方法
    var overlying = {
        logoInit: function (params, cutFlag) {
            var paramJson = JSON.stringify(params);
            paramJson = encodeURIComponent(paramJson);
            var flag = true;
            if (!cutFlag) {
                var logoArr = $(".pretreat-content .logo");
                logoArr.each(function (i, v) {
                    var fileId = $(v).attr("data-id");
                    if (fileId == params.id) {
                        flag = false;
                        return;
                    }
                });
            }
            //清除之前的样式
            if (flag) {
                var width, height;
                if (params["imageWidth"]==null||params["imageWidth"]=='') {
                    var whArr = params["size"].split("x");
                    params["imageWidth"] = whArr[0];
                    params["imageHeight"] = whArr[1];
                    var rate = params.imageHeight/params.imageWidth;
                    params.imageWidth = needEven(params.imageWidth);
                    params.imageHeight = Math.round(params.imageWidth*rate);
                }
                if(widthAndHeight.resolutionW - params.imageWidth <=0)  params.logoXOffset = widthAndHeight.resolutionW - params.imageWidth;
                if(widthAndHeight.resolutionH-params.imageHeight <= 0) params.logoYOffset = widthAndHeight.resolutionH-params.imageHeight;
                var borderStyle = "", checked = '';
                if (params["checkedStatus"]>=1) {
                    borderStyle = "border:1px solid #41FF6D;";
                    checked = "check";
                } else {
                    borderStyle = "border:border: 1px solid #444;";
                    checked = "";
                }
                width = widthAndHeight.getPriviewWidth(null, 240, params.imageWidth);
                height = widthAndHeight.getPriviewHeight(null, 135, params.imageHeight);
                var offsetTop = widthAndHeight.getPriviewHeight(null, 135, params.logoYOffset);
                var offsetRight = widthAndHeight.getPriviewWidth(null, 240, params.logoXOffset);
                if(width<30&&height<30){
                    height = 30*height/width;
                    width = 30;
                }
                
                if(offsetRight>240-width){
                    offsetRight =240-width;
                }
                if(offsetTop>135-height){
                    offsetTop = 135-height;
                }
                var html = '<li class="pretreat-item-logo pretreat-content-item logo ' + checked + ' logo' + params.id + '" data-id="' + params.id + '" data-params="' + paramJson + '" data-imageWidth="' + params.imageWidth + '" data-imageHeight="' + params.imageHeight + '" data-logoYOffset="' + params.logoYOffset + '"  data-logoXOffset="' + params.logoXOffset + '" data-url="' + params.url + '" style="' + borderStyle + '"><div class="logo-img" style="width:' + width + 'px;height:' + height + 'px;right:' + offsetRight + 'px;top:' + offsetTop + 'px;"><img src="' + params["url"] + '" style="width:100%;height:100%;" /></div></li>';
                if($('.pretreat-content.show-logo .logo' + params.id).length!=0){
                     $('.pretreat-content.show-logo .logo' + params.id).replaceWith(html);
                }else{
                    $(".sd-pretreat-container .pretreat-content.show-logo").append(html);
                }
                
            }
        },
        textInit: function (params, cutFlag) {
            var paramJson = JSON.stringify(params);
            paramJson = encodeURIComponent(paramJson);
            var flag = true;
            if (!cutFlag) {
                var logoArr = $(".pretreat-content .text");
                var fileId = $(".text").attr("data-id");
                if (fileId == params.id) {
                    flag = false;
                    return;
                }
            }
            //清除之前的样式
            if (flag) {
                var textStyle = params.style;
                if (typeof textStyle != 'object') {
                    if(textStyle.indexOf("\"") == 0) {
                        textStyle = textStyle.substring(1, textStyle.length - 1);
                    }
                    textStyle = JSON.parse(textStyle);
                }

                var sHex = textStyle.backgroundColor;  
                var bgColor=textStyle.backgroundColor.slice(2, 8);
                var bgOpacity=textStyle.backgroundColor.slice(0,2);
                var sRgbColor=HexToRgba(bgColor,bgOpacity);
                var Color = textStyle.foregroundColor.slice(2,8);

                var borderStyle = "", checked = '';
                if (params["checked"]) {
                    borderStyle = "border:1px solid #41FF6D;";
                    checked = "check";
                }else {
                    borderStyle = "border:border: 1px solid #444;";
                    checked = "";
                }
                var offsetTop = widthAndHeight.getPriviewHeight(null, 135, params.yOffset);
                var offsetRight = widthAndHeight.getPriviewWidth(null, 240, params.xOffset);
                var fontSize = widthAndHeight.getPriviewWidth(null, 240, textStyle.fontSize);

                var html = '<li class="pretreat-item-text pretreat-content-item text  ' + checked + ' text' + params.id + '" data-params="' + paramJson + '" data-textYOffset="' + params.yOffset + '" data-id="' + params.id + '"  style=" overflow：hidden; ' + borderStyle + ' "><div class="text-img"  data-deleteFlag="' + params.deleteFlag + '"  style="white-space: pre;text-overflow: ellipsis; font-size:' + fontSize + 'px; top:' + offsetTop + 'px; right:' + offsetRight + 'px; background-color:' + sRgbColor + ';color:#' + Color + ';font-family:' + textStyle.fontName + ';">'+params.text+'</div></li>';
                if($('.pretreat-content.show-text  .text' + params.id).length!=0){
                    $('.pretreat-content.show-text  .text' + params.id).replaceWith(html);
                }else{
                    $(".sd-pretreat-container .pretreat-content.show-text").append(html);
                }
            }
        },
        scoreInit:function (params, cutFlag, uploadScore) {
            var paramJson = JSON.stringify(params);
            paramJson = encodeURIComponent(paramJson);
            var flag = true;
            if (!cutFlag) {
                var logoArr = $(".pretreat-content .pretreat-item-score");
                logoArr.each(function (i, v) {
                    var fileId = $(v).attr("data-id");
                    if (fileId == params.id) {
                        flag = false;
                        return;
                    }
                });
            }
            //清除之前的样式
            if (flag) {
                var width, height;
                if (params["imageWidth"]==null||params["imageWidth"]=='') {
                    var whArr = params["size"].split("x");
                    params["imageWidth"] = whArr[0];
                    params["imageHeight"] = whArr[1];
                }
                width = widthAndHeight.getPriviewWidth(null, 240, params.imageWidth);
                height = widthAndHeight.getPriviewHeight(null, 135, params.imageHeight);

                var borderStyle = "", checked = '';
                borderStyle = "border:border: 1px solid #444;";
                checked = "";
                var offsetTop = widthAndHeight.getPriviewHeight(null, 135, params.logoYOffset);
                var offsetRight = widthAndHeight.getPriviewWidth(null, 240,params.logoXOffset);

                var scoreHtml = '<li class="pretreat-item-score pretreat-content-item score ' + checked + ' score' + params.id + '" data-params="' + paramJson + '" data-id="' + params.id + '" data-size="'+params["size"]+'"  style="' + borderStyle + '"><div class=" score-img score' + params.id + '" data-scoreBord=1 data-imageWidth="' + params.imageWidth + '" data-imageHeight="' + params.imageHeight + '"data-logoYOffset="' + params.logoYOffset + '"  data-logoXOffset="' + params.logoXOffset + '"data-id="' + params.id + '" style="width:' + width + 'px;height:' + height + 'px;top:' + offsetTop + 'px;right:' + offsetRight + 'px"><img src="' + params["url"] + '" alt="" style="position:relative;width:100%;height:100%;">';
                
                var subtitles = params.subtitles
                for (var i = 0; i < subtitles.length; i++) {
                    var textStyle = subtitles[i].style;
                    if (typeof textStyle != 'object') {
                        if(textStyle.indexOf("\"") == 0) {
                            textStyle = textStyle.substring(1, textStyle.length - 1);
                        }
                        textStyle = JSON.parse(textStyle);
                    }
                    var fontSize=textStyle.fontSize;
                    fontSize=widthAndHeight.getPriviewHeight(null, 240,fontSize);
                    var textYOffset = subtitles[i].yOffset - params.logoYOffset;
                    textYOffset = widthAndHeight.getPriviewHeight(null,135, textYOffset);
                    var textXOffset =subtitles[i].xOffset - params.logoXOffset,
                    textXOffset = widthAndHeight.getPriviewWidth(null,240, textXOffset);
                    var textWidth= subtitles[i].width;
                    textWidth= widthAndHeight.getPriviewWidth(null, 240, textWidth);
                    var textHeight= subtitles[i].height;
                    textHeight= widthAndHeight.getPriviewHeight(null, 135, textHeight);

                    var temp = '<input type="text" class="scoreText text' + (i + 1) + '" data-zorder=3 value="' + subtitles[i].text + '" data-scoreTextId="' + subtitles[i].id + '"  data-bind-' + (i + 1) + '="name" style="height:' + textHeight + 'px; position:absolute; width:' + textWidth + 'px; text-align: center; background-color:transparent; right:' + textXOffset + 'px; top:' + textYOffset + 'px; font-size:' + fontSize + 'px;color:#' + textStyle.foregroundColor.slice(2, 8) + ';" disabled="disabled">';
                    scoreHtml += temp;
                }
                var divHtml = '</div></li>';
                scoreHtml += divHtml;
                if($('.pretreat-content.show-score  .pretreat-item-score').length!=0){
                    $('.pretreat-content.show-score  .pretreat-item-score').replaceWith(scoreHtml);
                }else{
                    $(".sd-pretreat-container .pretreat-content.show-score").append(scoreHtml);
                }
                if(uploadScore==true){
                    $('.pretreat-content.show-score  .pretreat-item-score').trigger("click");
                }else{
                    $('.pretreat-content.show-score  .pretreat-item-score').css({
                        border: "1px solid rgb(65, 255, 109)",  
                    })
                    $('.pretreat-content.show-score  .pretreat-item-score').addClass("check");
                }
            }
        },
        clockInit:function(params, cutFlag){
            var paramJson = JSON.stringify(params);
            paramJson = encodeURIComponent(paramJson);
            var flag = true;
            if (!cutFlag) {
                var logoArr = $(".pretreat-content .clock");
                var fileId = $(".clock").attr("data-id");
                if (fileId == params.id) {
                    flag = false;
                    return;
                }
            }
            //清除之前的样式
            if (flag) {
                var textStyle = params.style;
                if (typeof textStyle != 'object') {
                    if(textStyle.indexOf("\"") == 0) {
                        textStyle = textStyle.substring(1, textStyle.length - 1);
                    }
                    textStyle = JSON.parse(textStyle);
                }

                var Color = textStyle.foregroundColor.slice(2,8);
                var borderStyle = "", checked = '';
                if (params["checked"]) {
                    borderStyle = "border:1px solid #41FF6D;";
                    checked = "check";
                }else {
                    borderStyle = "border:border: 1px solid #444;";
                    checked = "";
                }
                var offsetTop = widthAndHeight.getPriviewHeight(null, 135, params.yOffset);
                var offsetRight = widthAndHeight.getPriviewWidth(null, 240, params.xOffset);
                var fontSize = widthAndHeight.getPriviewWidth(null, 240, textStyle.fontSize);
                var timeStampOld= params.timestamp;
                var timeTextarea=textStyle.text;
                var startVal=timeTextarea.split(":");
                var min=parseInt(startVal[0])*60;
                var second=parseInt(startVal[1]);
                var timeValue = parseInt(min+second); 
                // var player = webflv.playObj[$(".main-preview .main-player").attr("id")]["player"];
                // var timeStampNow = Math.round(player._mediaElement.currentTime * 1000) + player._muxer.dtsBase;
                var timeStampNow = calPts($(".main-preview .main-player").attr("id"));
                if(timeStampNow=="") {
                    console.log("Cannot get timecode from flv player.overlay");
                    return;//R重启并且视频还未出来，不重新渲染overlyig clock
                }
                var timeValueStr = "";
                var operation=params.operation;
                if(operation!="start"){
                    timeValueStr = timeTextarea;
                }else{
                    if(timeStampOld!=undefined){
                        var timeGap=timeStampNow-timeStampOld;
                        timeValueStr = TimeByms(parseInt(timeGap/1000)+timeValue);
                    }else{
                        timeValueStr = timeTextarea;
                    } 
                }
                var html = '<li class="pretreat-item-clock pretreat-content-item clock ' + checked + ' clock' + params.id + '" data-params="' + paramJson + '" data-textYOffset="' + params.yOffset + '" data-id="' + params.id + '"  style=" overflow：hidden; ' + borderStyle + ' "><div class="clock-img"  data-deleteFlag="' + params.deleteFlag + '"  style="font-size:' + fontSize + 'px; top:' + offsetTop + 'px; right:' + offsetRight + 'px;background-color:#212740; color:#' + Color + ';font-family:' + textStyle.fontName + '; position:absolute;">00:00</div></li>';
                if($('.pretreat-content.show-clock  .clock').length!=0){
                    $('.pretreat-content.show-clock  .clock').replaceWith(html);
                }else{
                    $(".sd-pretreat-container .pretreat-content.show-clock").append(html);
                }
            }
        },

        //删除logo相关操作
        delLogo: function (obj) {
            var fileId = $(obj).attr("data-id");
            var params = {
                'peerId': $(".main-rList .rList-show").attr("data-peerId"),
                'fileId': fileId,
                'module': '1'
            }
            oUtils.ajaxReq("/producerpro/logo_delete", params, function () {
                $(".preview-source .logo" + fileId).remove();
                $(".pretreat-content .logo" + fileId).remove();
            });
        },
        delScore: function (obj) {
            var fileId = $(obj).attr("data-id");
            var params = {
                'peerId': $(".main-rList .rList-show").attr("data-peerId"),
                'fileId': fileId,
                'module': '1'
            }
            oUtils.ajaxReq("/producerpro/logo_delete", params, function (data) {
                if(data.errorCode == "0x0"){
                    $(".pretreat-content .score" + fileId).remove();
                    $(".preview-source  .score" + fileId).remove();
                }else if(data.errorCode == "0x80100003"){
                    oUtils.alertTips("i18n_requestTimeOut");
                }
                
            });
        },
        delPip: function (obj) {
            var params = {
                'id': $(obj).attr("data-id"),
            }
            var tallyArr = [];
            // 获取到 data-pipvideosharedmemoryname属性
            var pipvideosharedmemoryname = $(obj).attr("data-pipvideosharedmemoryname");
            var pipVideoObj = $(".preview-content .preview-item[data-filename='"+pipvideosharedmemoryname+"']");

            if(pipVideoObj.hasClass("isr")){
                if(pipVideoObj.hasClass("pipPreviewActive")&&!pipVideoObj.hasClass("pipOutputActive")&&!pipVideoObj.hasClass("previewActive")&&!pipVideoObj.hasClass("outPutActive")){
                    //获取rid
                    var rid = pipVideoObj.attr("data-rid");
                    var videoTally = {};
                    videoTally["rid"] = rid;
                    videoTally["type"] = 130;
                    tallyArr.push(videoTally);
                }
            }
            
            params["tallyArray"] = JSON.stringify(tallyArr);
            oUtils.ajaxReq("/producerpro/studio_delete", params, function (data) {
                if (data.errorCode == "0x0") {
                    pipVideoObj.removeClass("pipPreviewActive");
                    $(".preview-source .pip").remove();
                    $(".pretreat-content .pip").remove();
                    $(".pip-picture").removeClass('created');
                    $(".pip-in .voice").removeClass("icon-voice").addClass("icon-novoice");
                    $(".pip-out .voice").removeClass("icon-novoice").addClass("icon-voice");
                    $(".pip-in-sel p").html("1");
                    //如果声音在pvw上面要触发点击事件
                    if($(".preview-top .icon-erphone").hasClass("active")){
                         $(".preview-top .preview-voice .icon-erphone").trigger("click");
                         $(".preview-top .preview-voice .icon-erphone").trigger("click");
                    }
                    $(".show-pip .pretreat-content-add").removeClass('hide');
                } else {
                    oUtils.alertTips(data.errorInfo, 1500);
                }

            });
        },
        delText: function (obj) {
            var peerid = $(".rList-show").attr("data-peerId");
            var textid = $(obj).attr("data-id");
            var params = {
                peerId: peerid,
                textId: textid
            }
            oUtils.ajaxReq("/producerpro/subtitle_delete", params, function () {
                $(".preview-source .textDiv").remove();
                $(".pretreat-content .text" + textid).remove();
                $(".show-text .pretreat-content-add").removeClass('hide');
            });
        },
        delClock: function (obj) {
            var peerid = $(".rList-show").attr("data-peerId");
            var textid = $(obj).attr("data-id");
            var params = {
                peerId: peerid,
                id: textid
            }
            oUtils.ajaxReq("/producerpro/clock_delete", params, function () {
                clearInterval(clockObj.setClockTimer);
                clockObj.clockSeconds = 0;
                $(".preview-source .clockDiv").remove();
                $(".output-source .clockDiv").remove();
                $(".pretreat-content .clock" + textid).remove();
                $(".clockInput").removeAttr("disabled");
                $(".show-clock .pretreat-content-add").removeClass('hide');
                if($(".clockStart").hasClass('hide')){
                    $(".clockStop").addClass('hide');
                    $(".clockStart").removeClass('hide');
                }
                $(".TimeSet input").val(0);
                saveClockuserBehavior("stop","pvw");
            });
        },
        pipInit: function (data) {
            var borderStyle = "", checked = '';
            if (data["checked"] != 0 ) {
                borderStyle = "border:1px solid #41FF6D;";
                checked = "check";
            } else {
                borderStyle = "border: 1px solid #444;";
                checked = "";
            }
            var pipHtml = '';
            pipHtml = '<li class="pip pretreat-item-logo pretreat-content-item ' + checked + '" data-pipXOffset="' + data.pipXOffset + '" data-id="' + data.id + '" data-pipHeight="' + data.pipHeight + '" data-pipVideoSharedMemoryName="' + data.pipVideoSharedMemoryName + '" data-pipWidth="' + data.pipWidth + '" data-pipYOffset="' + data.pipYOffset + '" data-pipAudioSharedMemoryName="' + data.pipAudioSharedMemoryName + '" data-audiostatus="'+data.audioStatus+'" style="' + borderStyle + '" > </li>';
            // $(".pretreat-content").prepend(pipHtml);
            $("#preview .pip").attr("data-id",data.id);
            if($('.pretreat-content.show-pip .pip').length!=0){
                 $('.pretreat-content.show-pip .pip').replaceWith(pipHtml);
            }else{
                $(".sd-pretreat-container .pretreat-content.show-pip").append(pipHtml);
            }
        },
        pipEidtInit:function(){
            //获取输出视频的filename
            var previewFileName = $(".main-preview").attr("data-filename");
            var audioStatus = $(".pretreat-content .pip").attr("data-audiostatus");
            var pipVideoSharedMemoryName = $(".pretreat-content .pip").attr("data-pipvideosharedmemoryname");
            var pipaudiosharedmemoryname = $(".pretreat-content .pip").attr("data-pipaudiosharedmemoryname");
            if(audioStatus==-1){
                $(".pip-in .voice").removeClass("icon-voice").addClass("icon-novoice");
                $(".pip-out .voice").removeClass("icon-voice").addClass("icon-novoice");
            }
            if(audioStatus==1){
                $(".pip-in .voice").removeClass("icon-novoice").addClass("icon-voice");
                $(".pip-out .voice").removeClass("icon-novoice").addClass("icon-voice");
            }
            //设置索引
            $(".preview-content li").each(function (i, v) {
                var fileName = $(v).attr("data-filename");
                if (pipVideoSharedMemoryName == fileName) {
                    $(".pip-in-sel p").html(i + 1);
                }
                if (previewFileName == fileName) {
                    $(".pip-out-sel p").html(i + 1);
                }
                if(audioStatus==0){
                    if (pipaudiosharedmemoryname == fileName) {
                        if (pipaudiosharedmemoryname == previewFileName) {
                            $(".pip-in .voice").removeClass("icon-voice").addClass("icon-novoice");
                            $(".pip-out .voice").removeClass("icon-novoice").addClass("icon-voice");
                        } else {
                            $(".pip-in .voice").removeClass("icon-novoice").addClass("icon-voice");
                            $(".pip-out .voice").removeClass("icon-voice").addClass("icon-novoice");
                        }
                    }
                }
            });
        },
        // pipData: null,
    }
    //初始化事件
    initEvent();
    return {
        overlying:overlying
    }
})($,oUtils,switchLangObj);

function TimeByms(value) {
    var minutes = Math.floor(value / 60);
    var seconds = Math.floor(value % 60);
    minutes <= 9 ? minutes = "0" + minutes : minutes = minutes;
    seconds <= 9 ? seconds = "0" + seconds : seconds = seconds;
    return  minutes + ":" + seconds;
}

function checkLocation(param) {
    var userBehavior = JSON.parse(decodeURIComponent(studioBehavior));
    var ProgramClockValue=userBehavior.ProgramClock;
    if(ProgramClockValue != undefined) {
        return ProgramClockValue[param];
    } else {
        return "";
    }
}

function updateUserBehavior(obj){
    if(obj != undefined) {
        var userBehavior = JSON.parse(decodeURIComponent(studioBehavior));
        var ProgramClockValue=userBehavior.ProgramClock;
        if(ProgramClockValue==undefined){
            ProgramClockValue = {};
        }
        for(var key in obj){
            var value = obj[key];
            ProgramClockValue[key]=value;
        }
        userBehavior.ProgramClock = ProgramClockValue;
        studioBehavior = encodeURIComponent(JSON.stringify(userBehavior));
    }
}