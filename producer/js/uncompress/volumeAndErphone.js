var volume = (function($,window){
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
                        this.volumeObj[nickname] = {lastRightDb:0,lastLeftDb:0,curRightDb:0,curLeftDb:0,CurrentVolume:0};
                    }
                    volumes = this.volumeObj[nickname];
                    data = InputPreview; //["VolumePreviewWorker"]["PreviewVoiceClip"]
                    item = "InputPreview"==videoType?$(".preview-source").find(".audio"):$(".output-source ").find(".audio");
                    this.setVolumeColumn(data,item,volumes);
                }else{
                    var SourceList = res.SourceListPreview;
                    for(var i=0;i<SourceList.length;i++){
                        if (SourceList[i]["PreviewShm"].IsEnabled&&SourceList[i]["IsPreivewing"]) {
                            SharedMemoryName = SourceList[i]["PreviewShm"]["SharedMemoryName"];
                            if(!this.volumeObj[SharedMemoryName]){
                                this.volumeObj[SharedMemoryName] = {lastRightDb:0,lastLeftDb:0,curRightDb:0,curLeftDb:0};
                            }
                            item = $(".preview-content [data-filename='"+SharedMemoryName+"']").find(".audio");
                            volumes = this.volumeObj[SharedMemoryName];
                            data = SourceList[i]; //["VolumePreviewWorker"]["PreviewVoiceClip"]
                            // console.log(data.LeftDb,data.RightDb);
                            this.setVolumeColumn(data,item,volumes);
                        }
                    }
                }
            }
        },
        setVolumeColumn:function(data,item,volumes){
            var items = $(item).find(".active");
            volumeColumnObj.init(data,items,volumes);
        }
    }
    var volumeColumnObj = {
        init:function(data,item,volume){
            volume["CurrentVolume"] = data["CurrentVolume"];
            data = data["VolumePreviewWorker"]["PreviewVoiceClip"];
            volume.lastRightDb = volume.curRightDb;
            volume.lastLeftDb = volume.curLeftDb;
            volume.curRightDb = data["RightDb"];
            volume.curLeftDb = data["LeftDb"];
            this.dealVolume(volume,item);
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
                    $(item).css("height", (start/120*100)+"%");
                    if(start<target) window.requestAnimationFrame(upAnimation);             
                };
                window.requestAnimationFrame(upAnimation);
            }else{
                //音量降低
                var downAnimation = function(){
                    start += step;
                    start = start<target?target:start;
                    $(item).css("height", (start/120*100)+"%");
                    if(start>target) window.requestAnimationFrame(downAnimation);
                }
                window.requestAnimationFrame(downAnimation);
            }
        }   
    };

    // 音量注册事件
    //点击按钮出现音量柱
    $(".preview-content").on("mouseenter touchstart",".voice",function(){
        // 此处出现两种情况，第一种为音量柱已经显示
        var thisObj = $(this);
        var parentObj =  $(this).parents(".preview-item");
        var fileName = parentObj.attr("data-filename");
        $(".preview-item .item-control-voice .voice").removeClass("active");
        $(".preview-item .item-control-voice .voice").css("color","#666");
        $(".preview-item .voice-control").css("display","none");
        thisObj.addClass("active");
        thisObj.css("color","#fff");
        parentObj.find(".voice-control").eq(0).css("display","block");
        return false;
    });
    $(".preview-content").on("mouseleave",".preview-item",function(){//
        var thisObj = $(this).find(".voice");
        thisObj.css("color","#666");
        thisObj.removeClass("active");
        $(this).find(".voice-control").eq(0).css("display","none");
        return false;
    });

    function createPreviewListVoiceControl(initValue, videoBox, orientation) {
        var ele = videoBox.find(".slider-vertical");
        ele.slider({
            orientation: orientation,//vertical垂直方向的，horizontal水平方向的
            range: "min",
            min: 0,
            max: 100,
            step: 1,
            value: initValue,
            slide: function (event, ui) {
                var voiceObj = $(this).parents(".preview-item");
                voiceObj.find(".voice-value").html(ui.value);
                if(ui.value==0){
                    voiceObj.find(".voice").removeClass("icon-voice").addClass("icon-novoice");
                }else{
                    voiceObj.find(".voice").removeClass("icon-novoice").addClass("icon-voice");
                }
                // 先获取文件名
                var fileName = voiceObj.attr("data-filename");
                var previewFilename = $(".main-preview").attr("data-filename");
                if($(".main-preview").find(".icon-erphone").hasClass("active")){
                    var pipPreviewObj = $(this).parents(".preview-item.pipPreviewActive");
                    if(pipPreviewObj.length!==0&&pipPreviewObj.attr("data-filename")==fileName){
                        $(this).siblings("video").prop("volume",ui.value/100);
                    }
                }else if(voiceObj.find(".icon-erphone").hasClass("active")){
                    // $(".output-source").find("video").prop("volume", 0);
                    $(this).siblings("video").prop("volume",ui.value/100);
                }
                    
            }, stop: function (event, ui) {
                var value = volumeConversion.volumeLocal2R(ui.value);
                var fileName = $(this).parents(".preview-item").attr("data-filename");
                initSystem.volumeControlObj.changeVolume(value,fileName);
                // videoBox.find("video").prop("volume", ui.value / 100);
            }
        });
        var voiceValueHtml = '<span class="voice-value">' + initValue + '</span>';
        ele.find(".ui-slider-handle").html(voiceValueHtml);
    }
    // 值的转换，因为R的值为-40-3，本地值0-100
    var volumeConversion = {
        volumeR2local:function(value){
            volume = 40+value;
            if(volume==0){
                return 0;
            }
            var volume = (parseInt(volume)+1)*(100/41)//求的数为代表第几个
            return Math.round(volume);
        },
        volumeLocal2R:function(value){
            if(value==100){
                return 0//表示静音
            }
            // 数字进行转换 转换规则 1-100有100个数，-40-3有44个数
            var volume = (parseInt(value)+1)*(41/100)//求的数为代表第几个
            volume = -40+volume-1;//因为-40也代表一个音量值，所以需要-1
            return Math.round(volume);
        }
    }
    /*preview list 中音量调节 end */
    /*添加耳机监听按钮的操作 start*/
    $(".erphone").on("click",".icon-erphone",function(){
        var erphoneObj = $(this);
        var filename = "";
        if(erphoneObj.hasClass("active")&&erphoneObj.css("color")=="rgb(255, 255, 255)"){
            erphoneObj.removeClass("active");
            erphoneObj.css("color","#666");
            $("video").prop("volume",0);
            var video = $("video");
            for(var i = 0;i<video.length;i++){
                video[i].muted = true;
            }
        }else{
            //清除所有的active
            $(".icon-erphone").removeClass("active").css("color","#666");
            erphoneObj.css("color","#fff");
            // 页面上面所有video音量为 0
            $("video").prop("volume", 0);
            var video = $("video");
            for(var i = 0;i<video.length;i++){
                video[i].muted = true;
            }
            erphoneObj.addClass("active");
            if(erphoneObj.parents(".erphone").hasClass("main-preview")){
                if(!$(".apply-preview  .radius-box").hasClass("shut")){
                    filename = $(".main-preview").attr("data-filename");
                    var volumeObj = $('.preview-content [data-filename="'+filename+'"]');
                    var volume = volumeObj.find(".voice-value").html();
                    $(".main-preview .main-player").prop("volume",1);
                    $(".main-preview .main-player")[0].muted = false;
                }
                // volumeObj.find(".icon-erphone").addClass("active");
                setPipVideoVolume();
            }else if(erphoneObj.parents(".erphone").hasClass("main-output")){
                $(".main-output .main-player").prop("volume",1);
                $(".main-output .main-player")[0].muted = false;
                if(currentRInfo.outputPreview && $(".output-source .pip").length!=0){   
                    var pipFilename = $(".output-source .pip").attr("data-pipvideosharedmemoryname");
                    $(".main-output .pip video").prop("volume",$(".preview-content .preview-item[data-filename='"+pipFilename+"'] .voice-value").html().trim()/100);
                    $(".main-output .pip video")[0].muted=false;
                }
            }else{
                //获取此时video的音量为设置值
                var volume = erphoneObj.parents(".preview-item").find(".voice-value").html();
                erphoneObj.parents(".preview-item").find("video").prop("volume",volume/100);
                erphoneObj.parents(".preview-item").find("video")[0].muted = false;
            }       
        }
    });
    // 如果pip在preview中，并且preview耳机高亮触发
    function setPipVideoVolume(){
        if($("#preview .pip").length!==0){
            var filename = $(".preview-content .pipPreviewActive").attr("data-filename");
            var volumeObj = $('.preview-content [data-filename="'+filename+'"]');
            var volume = volumeObj.find(".voice-value").html();
            volumeObj.find("video").prop("volume",volume/100);
            volumeObj.find("video")[0].muted = false;
            volumeObj.find(".icon-erphone").addClass("active");
        }
    }
    function delPipVideoVolume(name){
        var filename = $(".preview-content ."+name).attr("data-filename");
        var volumeObj = $('.preview-content [data-filename="'+filename+'"]');
        var volume = volumeObj.find(".voice-value").html();
        volumeObj.find("video").prop("volume",0);
        volumeObj.find(".icon-erphone").removeClass("active");
    }

    /*添加耳机监听按钮的操作 end*/
    return {
        volumeColumn: volumeColumn,
        createVoiceControl: createPreviewListVoiceControl,
        setPipVideoVolume: setPipVideoVolume,
        delPipVideoVolume: delPipVideoVolume,
        volumeConversion:volumeConversion
    }
})($,window);