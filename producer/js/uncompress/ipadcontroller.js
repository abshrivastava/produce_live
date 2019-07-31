
function createVoiceControl(ele, initValue) {
    ele.slider({
        orientation: 'vertical',//vertical垂直方向的，horizontal水平方向的
        range: "min",
        min: 0,
        max: 100,
        step: 1,
        value: initValue,
        slide: function (event, ui) {
            var voiceObj = $(this).parents(".sour");
            if(!voiceObj.find(".erphone .icon-erphone").hasClass("disabled")){
                voiceObj.find(".erphone .icon-erphone").addClass("disabled");  
                voiceObj.find(".erphone .vol-size").css("display","block");  
            }
            voiceObj.find(".erphone .vol-size").html("+"+ui.value);
            // 先获取文件名
            var fileName = voiceObj.attr("data-filename");
            if(voiceObj.find(".erphone .icon-erphone").hasClass("active")){
                if(voiceObj.hasClass("pgm-audio")){
                    // 选的是pgm
                }else{
                    voiceObj.find("video").prop("volume", ui.value / 100);
                }
            }      
        }, stop: function (event, ui) {
            var voiceObj = $(this).parents(".sour");
            if(voiceObj.find(".erphone .icon-erphone").hasClass("disabled")){
                voiceObj.find(".erphone .icon-erphone").removeClass("disabled");  
                voiceObj.find(".erphone .vol-size").css("display","none");  
            }
            var value = volumeColumn.volumeLocal2R(ui.value);
            var fileName = voiceObj.attr("data-filename");
            volumeControlObj.changeVolume(value,fileName);
        }
    });
}

function changePadding(){
    var len = $(".sour-ls .single-sour").length;
    var sourLsW = $(".sour-ls").width();
    var sourLiW = $(".sour-ls .single-sour").width();
    $(".sour-ls .single-sour").css("margin-right",(sourLsW-sourLiW*len)/(len-1)+"px");
}

changePadding();
createVoiceControl($(".vol-control"),10);