$(function () {
    //点击afv切换按钮
    $(".afv-cut .radius-box").on("click", function () {
        var thisObj = $(this);
        var params = {
            'rid': CONFIG.rid,
            'flag': true,
        }
        if (thisObj.hasClass("close")) {
            var param = { "IsAudioFollowVideo": true};
            params["params"] = JSON.stringify(param);
            oUtils.ajaxReq("/producerpro/setStudioPreviewAudio", params, function (data) {
                currentRState.IsAudioFollowVideo=0;
                thisObj.removeClass("close");
                thisObj.animate({ left: "11px" });
            });
        } else {
            var AudioOnlyShm = $('.main-v .scale').attr("data-filename");
            var param = { "IsAudioFollowVideo": false, "AudioOnlyShm": AudioOnlyShm };
            params["params"] = JSON.stringify(param);
            oUtils.ajaxReq("/producerpro/setStudioPreviewAudio", params, function (data) {
                if (data.errorCode === "0x0") {
                    currentRState.IsAudioFollowVideo=0;
                    thisObj.addClass("close");
                    thisObj.animate({ left: "0rem" });
                    return;
                } else {
                    oUtils.alertTips(data.errorInfo, 1500);
                }
            });
        }
    });
    $(".pgm-audio .erphone .icon-erphone").on("click",function(){
        var thisObj = $(this);
        if(thisObj.hasClass("active")){
            thisObj.parents(".main-fn").find(".scale video")[0].muted = true;
            thisObj.removeClass("active");
        }else{
            thisObj.addClass("active");
            thisObj.parents(".main-fn").find(".scale video")[0].muted = false;
            thisObj.parents(".main-fn").find(".scale video").prop("volume", 1);
        }
    });
    $(".sourse-ls").on("click",".erphone .icon-erphone",function(){
        var thisObj = $(this);
        var singleObj = thisObj.parents(".single-sour");
        if(thisObj.hasClass("active")){
            singleObj.find(".sour-box video")[0].muted = true;
            thisObj.removeClass("active");
        }else{
            thisObj.addClass("active");
            singleObj.find(".sour-box video")[0].muted = false;
            var value = singleObj.find(".vol-control .ui-state-default").css("bottom").split("p")[0];
            var height = singleObj.find(".vol-control").height();
            singleObj.find(".sour-box video").prop("volume", parseInt((value/height)*100)/100);
        }
    })
});