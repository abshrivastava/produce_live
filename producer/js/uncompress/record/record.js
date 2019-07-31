$(function(){
    $(".record").click(function(){
        if(!mix_fn.isPrower("Record")) return false;
        if($(this).find(".icon-stoprecord").hasClass('hide')){
            $("#RecordPGM").css("display","block");
        }else{
            var obj=$(".record").attr("data-params");
            var stopRecordParam={
                "rid":$(".rList-show").attr("data-peerId"),
                "params":obj
            };
            stopRecordVideo(stopRecordParam);
        }
    });

    $(".recordBtn").click(function(){
        var resolutionValue= $("#RecordPGM").find(".resolutionTypeList").attr("data-value");
        var Bitrate = $("#RecordPGM").find(".BitrateTypeList .dropdownDefault_value").text();
        var position=Bitrate.indexOf("b");
        Bitrate=Bitrate.slice(0, position); 
        var obj={
           "Resolution":resolutionValue,
           "VBitrate":Bitrate
        };  
        var recordparam={
            "rid":$(".rList-show").attr("data-peerId"),
            "params":JSON.stringify(obj)
        };
        $(".record").attr("data-params",JSON.stringify(obj));
        satrtRecordVideo(recordparam);
    }); 

    $("#RecordPGM,#detailPush").on("click",".BitrateTypeList",function(){
        $(this).find(".dropdownDefault_value").attr("contenteditable","true");
        $(this).find(".dropdownDefault_value").css("white-space","pre");
    });

    $("#RecordPGM,#detailPush").on("keyup",".dropdownDefault_value",function(){
        var thisObj=$(this).text();
        var reg = RegExp(/Kbps/);
        if(!thisObj.match(reg)){
            thisObj=thisObj+"Kbps";
            $(this).text(thisObj);  
        }
    });
    //开始录制PGM
    function satrtRecordVideo(params){
        oUtils.ajaxReq("/producerpro/record/start_record",params,function(data) {
            var errorCode = data.errorCode;
            if(errorCode == "0x0"){
                $(".record").find($(".icon-record")).addClass('hide');
                $(".record").find($(".icon-stoprecord")).removeClass('hide');
                $("#RecordPGM").css("display","none");
                clearInterval(clockObj.recordTimer);
                clockObj.recordTimer=setInterval(function(){
                    clockObj.recordSeconds++;
                    $(".recordTime").html(transTimeByms(clockObj.recordSeconds));
                },1000);
            }
        });
    }

    //停止录制PGM
    function stopRecordVideo(params){
        oUtils.ajaxReq("/producerpro/record/stop_record",params,function(data) {
            var errorCode = data.errorCode;
            if(errorCode == "0x0"){
                $(".record").find($(".icon-stoprecord")).addClass('hide');
                $(".record").find($(".icon-record")).removeClass('hide');
                clockObj.recordSeconds=0;
                $(".recordTime").html("00:00:00");
                clearInterval(clockObj.recordTimer);
            }
        });
    }
})
