var quadView = (function($,oUtils,switchLangObj,clipDot){
    var quad_list = null,screenTimer = null,quadData = null;
    var pipList = ["right:496px;top:60px;","right:64px;top:60px;","right:496px;top:290px;","right:64px;top:290px;"];
    var textList = ["right:496px;top:244px;","right:64px;top:244px;","right:496px;top:476px;","right:64px;top:476px;"];
    var dateTime = 0;
    //添加新的quadView
    $(".upload-body").on("click",".quad-add",function(){
        //添加的时候不需要ajax请求数据，因为这儿默认用户没有添加
        $(".upload-video").hide();
        $(".quad-edit").removeClass("hide");
        $(".quad-edit").removeClass("edit");
        getQuadImage();
    });
    $(".quad-edit").on("click",".icon-vedio-close", function(){
        $(this).parents(".quad-edit").addClass("hide");
        clearInterval(screenTimer);
        quad_list = null;
    });
    $(".quad-edit").on("click",".v-view", function(){
        $(".v-view .edit-text").siblings(".point").remove();
        $(".v-view .edit-text").attr("readonly","readonly").removeClass("editing");
        $(".quad-edit .quad-edit-text").addClass("hide");
        $(".quad-edit .sel-posandpic").removeClass("hide");
    });
    $(".quad-edit").on("click",".quad-foot button", function(){
        var timeStamp = new Date().getTime();
        if(timeStamp-dateTime < 6000) return false;
        dateTime = timeStamp;
        var param = {
            rid:$(".main-rList .rList-show").attr("data-peerid"),
            params:JSON.stringify(setQuadViewData())
        }
        if($(".quad-edit").hasClass("edit")){
            var params = setQuadViewData();
            params["SelectedSharedMemory"] = $(".quad-edit").attr("data-filename");
            param.params = JSON.stringify(params);
            oUtils.ajaxReq("/producerpro/quadview/change_quadview_source", param, function (data) {
                if(data.errorCode == "0x0"){
                    dateTime = 0;
                    $(".quad-edit").addClass("hide");
                    oUtils.alertTips("i18n_producerProUploadIpSourceTip",1500);
                }else{
                    dateTime = 0;
                    oUtils.alertTips("start live fail",1500);
                }
            });
        }else{
            oUtils.ajaxReq("/producerpro/quadview/add_quadview_source", param, function (data) {
                if(data.PIPList&&data.PIPList.length!=0){
                    dateTime = 0;
                    $(".quad-edit").addClass("hide");
                    oUtils.alertTips("i18n_producerProUploadIpSourceTip",1500);
                }else{
                    dateTime = 0;
                    oUtils.alertTips("start live fail",1500);
                }
            });
        }
    });
    //删除 quadView 
    $(".upload-video .quad-list").on("click",".quad-del",function(){
        //获取filename
        var thisObj = $(this);
        var filename = thisObj.parents(".quad-source").attr("data-filename");
        var flag = false;
        flag=$(".main-preview").attr("data-filename")==filename||$(".main-output").attr("data-filename")==filename?true:false;
        if(!flag){
            //获取afv中的声音文件
            if($(".afv-cut .radius-box").hasClass("close")){
                var index = $(".afv-audio-cut .afv-audio").html().substring(6);
                if($(".preview-content .preview-item").eq(index-1).attr("data-filename")==filename){
                    flag = true;
                }
            }
            //pip 在pgm的情况下不能删除文件
            if($(".preview-content .preview-item.pipOutputActive").length!==0&&$(".preview-content .preview-item.pipOutputActive").attr("data-filename")==filename){
                flag = true;
            }
        }
        if(flag){
            oUtils.alertTips("i18n_dontDeleteVideoAtUsing");
            return false;
        }
        oUtils.confirmTips("i18n_producerProdeleteVideoConfirm",function(){
            var param = {
                rid:$(".main-rList .rList-show").attr("data-peerid"),
                params:JSON.stringify({"SelectedSharedMemory":filename})
            }

            oUtils.ajaxReq("/producerpro/quadview/remove_quadview_source", param, function (data) {
                if(data.errorCode == '0x0'){
                    //获取到quad_list的长度
                    thisObj.parents(".quad-source").remove();
                    var quad_list = $(".quad-list .quad-body .quad-source");
                    if(quad_list.length!==0) return false;
                    $(".quad-list .quad-add").css("display","block");
                }
            });
        });
    });
    //修改params
    $(".upload-video .quad-list").on("click",".quad-source .edit",function(){
        $(".quad-edit").addClass("edit").attr("data-filename",$(this).parents(".quad-source").attr("data-filename"));
        $(".upload-video").css("display","none");
        //获取filename
        var thisObj = $(this);
        var params = thisObj.parents(".quad-source").attr("data-params");
        getQuadImage(params);
    });
    //点击添加点
    $(".quad-edit").on("click",".edit-text", function(){
        var thisObj = $(this);
        if(thisObj.attr("readonly")){
            $(".v-view .edit-text").siblings(".point").remove();
            $(".v-view .edit-text").attr("readonly","readonly").removeClass("editing");
            thisObj.removeAttr("readonly").addClass("editing");
            var pointHtml='<div class="drag-leftUp point show"></div><div class="drag-rightUp point show"></div><div class="drag-leftDown point show"></div><div class="drag-rightDown point show"></div>';
            thisObj.parent().append(pointHtml);
            //获取文本，然后渲染页面
            var text = thisObj.val();
            $(".quad-edit-text textarea").val(text);
            var range,el = thisObj[0];
            if (el.setSelectionRange) {
              el.focus();
              el.setSelectionRange(el.value.length, el.value.length)
            } else {
              range = el.createTextRange();
              range.collapse(false);
              range.select();
            }
            var bg_color = thisObj.css("background-color");
            var fontFamily =  thisObj.css("font-family");
            var color = thisObj.css("color");
            initQuadColor(color,bg_color);
            initFont(fontFamily);
            $(".quad-edit .quad-edit-text").removeClass("hide");
            $(".quad-edit .sel-posandpic").addClass("hide");
        }
        return false;
    });
    $(".quad-edit").on("input",".edit-text", function(){
        var value = $(this).val();
        $(".quad-edit-text textarea").val(value);
    });
    $(".quad-edit-text").on("input","textarea", function(){
        var value = $(this).val();
        $(".quad-edit .edit-text.editing").val(value);
    });
    function initQuadColor(color,bgcolor){
        $(".quad-edit-text .text-bg .text input").spectrum({
            color: bgcolor,
            showAlpha: true
        });
        $(".quad-edit-text .text-color .text input").spectrum({
            color: color
        });
        $(".quad-edit-text .text-bg .text input").on('move.spectrum', function(e, tinycolor) {
            var color = $(".quad-edit-text .text-bg .text input").siblings(".sp-replacer").find(".sp-preview-inner").css("background-color");
            $(".quad-edit .edit-text.editing").css("background-color",color);
        });
        $(".quad-edit-text .text-color .text input").on('move.spectrum', function(e, tinycolor) {
            var color = $(".quad-edit-text .text-color .text input").siblings(".sp-replacer").find(".sp-preview-inner").css("background-color");
            $(".quad-edit .edit-text.editing").css("color",color);
        });
    }
    //获取图片的html
    function getQuadImage(params){
        var sel_dom = null, i = 0, html = '', imgSrc = undefined,item,bgcolor,color;
        //拼数据
        params = params? params: [];
        //整合数据
        var dom = $(".preview-content .preview-item"),param = {};
        if(params.length == 0){
            var fontFamily = '';
            if(window.navigator.language=="zh-CN"||window.navigator.language=="zh"){
                fontFamily = "SimHei";
            }else if(window.navigator.language=="en-US"||window.navigator.language=="en"){
                fontFamily = "Arial";
            }else{
                fontFamily = "Arial";
            }
            for(i = 0; i < 4; i++){
                item = dom.eq(i);
                imgSrc = clipDot.screenShot(item.find("video")[0]);
                // html += '<li class="v-group">\
                html += '<div class="v-pic" data-filename="'+item.attr("data-filename")+'" style="'+pipList[i]+'">\
                        <img src="'+imgSrc+'" alt="">\
                    </div>\
                    <div class="operate-pos" style="'+textList[i]+';font-family:'+fontFamily+'"><input type="text" class="edit-text" readonly value="'+switchLangObj.i18n_textValue+'"></div>';
                initSelPos(i,i);
                // </li>;
            }
        }else{
            params = JSON.parse(decodeURIComponent(params));
            var pipArr = params.AddPIPList,textArr = params.AddTextList,arr=[], html1='', html2='', html3='', idx;
            for(i = 0; i < pipList.length; i++){
                item = $(".preview-content .preview-item[data-filename='"+pipArr[i].id+"']");
                imgSrc = clipDot.screenShot(item.find("video")[0]);
                if(pipArr[i].zorder==6){ 
                    // html += '<li class="v-group">\
                    html1 += '<div data-id="'+pipArr[i].id+'" class="v-pic" data-filename="'+item.attr("data-filename")+'" style="right:'+(pipArr[i].xOffset/2 - 40)+'px;top:'+pipArr[i].yOffset/2+'px;">\
                            <img src="'+imgSrc+'" alt="">\
                        </div>\
                        <div data-id="'+textArr[i].id+'" class="operate-pos" style="right:'+textArr[i].xOffset/2+'px;top:'+textArr[i].yOffset/2+'px;background-color:'+HexToRgba(textArr[i].backgroundColor)+';font-family:'+textArr[i].fontName+';"><input type="text" class="edit-text" readonly value="'+textArr[i].text+'" style="color:'+HexToRgba(textArr[i].foregroundColor)+';"></div>';
                        initSelPos(0,item.index());
                }else if(pipArr[i].zorder==7){
                    
                    // html += '<li class="v-group">\
                    html2 += '<div data-id="'+pipArr[i].id+'" class="v-pic" data-filename="'+item.attr("data-filename")+'" style="right:'+(pipArr[i].xOffset/2 - 40)+'px;top:'+pipArr[i].yOffset/2+'px;">\
                            <img src="'+imgSrc+'" alt="">\
                        </div>\
                        <div data-id="'+textArr[i].id+'" class="operate-pos" style="right:'+textArr[i].xOffset/2+'px;top:'+textArr[i].yOffset/2+'px;background-color:'+HexToRgba(textArr[i].backgroundColor)+';font-family:'+textArr[i].fontName+';"><input type="text" class="edit-text" readonly value="'+textArr[i].text+'" style="color:'+HexToRgba(textArr[i].foregroundColor)+';"></div>';
                        initSelPos(1,item.index());
                }else if(pipArr[i].zorder==8){
                    html3 += '<div data-id="'+pipArr[i].id+'" class="v-pic" data-filename="'+item.attr("data-filename")+'" style="right:'+(pipArr[i].xOffset/2 - 40)+'px;top:'+pipArr[i].yOffset/2+'px;">\
                            <img src="'+imgSrc+'" alt="">\
                        </div>\
                        <div data-id="'+textArr[i].id+'" class="operate-pos" style="right:'+textArr[i].xOffset/2+'px;top:'+textArr[i].yOffset/2+'px;background-color:'+HexToRgba(textArr[i].backgroundColor)+';font-family:'+textArr[i].fontName+';"><input type="text" class="edit-text" readonly value="'+textArr[i].text+'" style="color:'+HexToRgba(textArr[i].foregroundColor)+';"></div>';
                        initSelPos(2,item.index());
                }else{
                    html = '<div data-id="'+pipArr[i].id+'" class="v-pic" data-filename="'+item.attr("data-filename")+'" style="right:'+(pipArr[i].xOffset/2 - 40)+'px;top:'+pipArr[i].yOffset/2+'px;">\
                            <img src="'+imgSrc+'" alt="">\
                        </div>\
                        <div data-id="'+textArr[i].id+'" class="operate-pos" style="right:'+textArr[i].xOffset/2+'px;top:'+textArr[i].yOffset/2+'px;background-color:'+HexToRgba(textArr[i].backgroundColor)+';font-family:'+textArr[i].fontName+';"><input type="text" class="edit-text" readonly value="'+textArr[i].text+'" style="color:'+HexToRgba(textArr[i].foregroundColor)+';"></div>';
                    initSelPos(3,item.index());
                }
               
            }
            html = html1 + html2 + html3 + html;

        }
        //获取html文本信息
        // initSelPos(params);
        $(".quad-edit .quad-edit-text").addClass("hide");
        $(".quad-edit .sel-posandpic").removeClass("hide");
        $(".quad-body .v-view").html(html);
        $(".quad-edit").removeClass("hide");
        intervalGetImage();
    }
    function ragaToColor(value){
        var regx = /[rgba]{3,4}\((.+)\)/;
        var group = value.match(regx);
        var array = group[1].split(","),str;
        if(array.length==4){
            str = parseInt((array[array.length-1]*255), 10).toString(16);
            str = str.length <= 1? "0"+str: str;
        }else{
            str = "FF";
        }
        for(var i = 0; i < 3; i++){
            var newStr = parseInt(array[i].trim()).toString(16);
            if(newStr.length==1){
                newStr = 0 + newStr;
            }
            str += newStr;
        }
        value = str.toUpperCase();
        return  value;
    }
    function HexToRgba(hex){
        var opacity =  hex.substring(0,2)
        hex = hex.substring(2);
        var fOpacity = parseInt("0x"+opacity,16);
        fOpacity=fOpacity/255;
        fOpacity=fOpacity.toFixed(2);
        return "rgba(" + parseInt("0x" + hex.slice(0, 2)) + "," + parseInt("0x" + hex.slice(2, 4)) + "," + parseInt("0x" + hex.slice(4, 6)) + "," + fOpacity + ")"; 
    }
    function getQuadViewData(){
        var param = {
            rid:$(".main-rList .rList-show").attr("data-peerid")
        }
        oUtils.ajaxReq("/producerpro/quadview/query_quadview_info", param, function (data) {
            if(data.QuadViewSrcList.QuadViewSources&&data.QuadViewSrcList.QuadViewSources.length!=0){
                var quadSources = data.QuadViewSrcList.QuadViewSources,str='';
                for(var i = 0; i < quadSources.length; i++ ){
                    console.log(quadSources[i]);
                    //渲染页面 quadlist
                    str += '<div class="quad-source clearFix" data-filename="'+quadSources[i]["QuadViewShm"].SharedMemoryName+'" data-params="'+encodeURIComponent(JSON.stringify(quadSources[i]))+'">\
                        <div class="quad-pic left">\
                            <img src="./images/quad_view.png" alt="">\
                            <i class="iconfont icon-edit edit"></i>\
                        </div>\
                        <div class="quad-del right">\
                            <i class="iconfont icon-del"></i>\
                        </div>\
                    </div>'
                }
                $(".quad-list .quad-body").html(str);
                $(".quad-list .quad-add").css("display","none");
                $(".upload-video .upload-tab pack").trigger("click");
            }else{
                $(".quad-list .quad-add").css("display","block");
                $(".quad-list .quad-body").html("");
            }
        });
    }
    function initSelPos(index,pos){
        var selPos = $(".sel-posandpic .sel-pos .clearFix"),tempArr,website;
        // for(var i = 0; i < params.length; i++){
            website =[{name:1,type:"R"},{name:2,type:"R"},{name:3,type:"R"},{name:4,type:"R"}];
            selPos.eq(index).find(".pos").createSimulateSelect(website,changePic,"type","name");
            selPos.eq(index).find(".pos .dropdownDefault_value").attr("title",pos+1);
            selPos.eq(index).find(".pos .dropdownDefault_value").html(pos+1);
        // }
    }
    function initFont(fontFamily){
        var website =[{name:"SimHei",type:"R"},{name:"sans-serif",type:"R"},{name:"Arial",type:"R"},{name:"Proxima Nova Rg",type:"R"},{name:"Proxima Nova Condensed",type:"R"}];
        $(".quad-edit-text .text-font .text").createSimulateSelect(website,changeFont,"type","name");
        $(".quad-edit-text .text-font .dropdownDefault_value").html(fontFamily);
    }
    function changeFont(thisObj){
         var fontFamily = thisObj.find(".dropdown_option_item").html();
        $(".quad-edit .edit-text.editing").parent().css("font-family",fontFamily);
    }
    function changePic(thisObj){
        var index = thisObj.find(".dropdown_option_item").html();
        var filename =  $(".preview-content .preview-item").eq(index-1).attr("data-filename");
        var dom = $(".preview-content .preview-item[data-filename='"+filename+"'] video")[0];
        var selPosIdx = thisObj.parents(".cra-pos").index();
        $(".v-view .v-pic").eq(selPosIdx).attr("data-filename",filename);
        $(".v-view .v-pic[data-filename='"+filename+"']").find("img").attr("src",clipDot.screenShot(dom));
    }
    function intervalGetImage(){
        clearInterval(screenTimer);
        screenTimer = setInterval(function(){
            var dom = $(".v-view .v-pic");
            for(var i = 0; i< dom.length; i++){
                var item = $(".preview-content .preview-item[data-filename='"+dom.eq(i).attr("data-filename")+"']").find("video")[0];
                dom.eq(i).find("img").attr("src",clipDot.screenShot(item));
            }
        },3000);
    }
    function setQuadViewData(){
        quadData = {};
        quadData["PIPList"] = getPipList();
        quadData["TextList"] = getTextList();
        return quadData;
    }
    //获取数据类型
    function getTextList(){
        var v_group = $(".v-view .operate-pos"),textParams = [],item,color,bg_color,inputObj;
        for(var i = 0; i < v_group.length; i++){
            item = v_group.eq(i);
            color = item.find("input").css("color");
            bg_color = item.find("input").css("background-color");
            textParams[i] = {
                "id": item.attr("data-id")?item.attr("data-id"):new Date().getTime()+""+parseInt(Math.random()*10000000000),
                "zorder": 6,
                "text": item.find("input").val(),
                "fontName": item.css("font-family"),
                "fontSize": "48",
                "foregroundColor":ragaToColor(color),
                "backgroundColor":ragaToColor(bg_color),
                "xOffset": parseInt(item.css("right"))*2,
                "yOffset": item.position().top*2,
                "width": 800,
                "height": 48,
                "horizonAlign": "center",
                "verticalAlign": "center"
            }
        }
        //释放内存 v_group,params,item
        v_group = null,item = null,bg_color = undefined,color=undefined;
        return textParams;
    }
    function getPipList() {
        var v_group = $(".v-view .v-pic"),params = [],item;
        for(var i = 0; i < v_group.length; i++){
            item = v_group.eq(i);
            params[i] = {
                "id":item.attr("data-id") ?item.attr("data-id") : new Date().getTime()+""+parseInt(Math.random()*1000000000),
                "zorder": i+6,
                "SelectedSharedMemory": item.attr("data-filename"),
                "xOffset": parseInt(item.css("right"))*2 + 80,
                "yOffset": item.position().top*2,
                "width": 640,
                "height": 360
            }
        }
        //释放内存 v_group,params,item
        v_group = null,item = null;
        return params;
    }
    return {
        getQuadViewData:getQuadViewData
    }
})($,oUtils,switchLangObj,clipDot);