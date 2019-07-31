var resourceAbout= (function($,oUtils,switchLangObj){
    var resource = {
        initEvent:function(){
            this.ipEvent();
        },
        //click creted ip source add column
        ipEvent:function(){
            $(".ip-add").on("click",function(){
                if($(".ip-body .ip-info").length>=10){
                    oUtils.alertTips("i18n_OnlySupport10Ext");
                    return false;
                }
                var html = '<div class="ip-info clearFix"><div class="ip-address left"><input type="text"  placeholder="http/rtmp/issp/rtsp"></div><div class="left select"></div><div class="ip-operate operate left">'+switchLangObj.i18n_ipConnect+'</div><div class="ip-del left"><i class="iconfont icon-del"></i></div></div>';
                $(".ip-body").prepend(html);
                // 初始化样式
                var obj = $(".preview-content .preview-item");
                // var website = getSelectOptions();
                var website =[{name:1,type:"R"},{name:2,type:"R"},{name:3,type:"R"},{name:4,type:"R"},{name:5,type:"ip"}];
                $(".ip-body .select").eq(0).createSimulateSelect(website,"","type","name");
                $(".ip-body .select").eq(0).attr("data-value","no_select");
                $(".ip-body .select .dropdownDefault_value").eq(0).html(switchLangObj.i18n_Unspecified);
                $(".ip-body .select .dropdownDefault_value").eq(0).attr("title",switchLangObj.i18n_Unspecified);
            });
            /*
            * function:ext ip source upload
            * author:daniel
            * params:null
            */
            $(".ip-body").on("click",".ip-operate",function(){
                
                var thisObj = $(this);
                var infoObj = thisObj.parents(".ip-info");
                if(infoObj.find(".select").attr("data-value")=="no_select"){
                    oUtils.alertTips("i18n_pleaseChooseCamera",1500);
                    return false;
                }
                if(!infoObj.hasClass("isLive")){
                    //没有live，需要走live逻辑
                    // if(thisObj.hasClass("disabled"))return;
                    var thisParentObj = $(this).parent();
                    var ipname=infoObj.find("input").val();
                    if(infoObj.attr("data-filename")==undefined){
                        infoObj.attr("data-filename",ipname);
                    }
                    var fileShimeName = thisParentObj.find("input").eq(0).val();
                    fileShimeName = fileShimeName.trim();
                    if(thisParentObj.attr("data-id")){
                        addExtAndLive(infoObj,fileShimeName);
                    }else{
                        ipReq.addrStreamAddress(fileShimeName,infoObj); 
                    } 
                }else{
                    // 获取到如果是5的情况就调用停止的按钮
                    if (infoObj.find(".dropdownDefault_value").html() == 5) {
                        ipReq.deleteAddress(infoObj,false);
                        return false;
                    }
                    //已经live起来了，需要取消
                    var tIdHex =  infoObj.attr("data-livepeerid");
                    //获取rid（主R或者副R）
                    var rPeerId = $(".preview-content .preview-item").eq(infoObj.find(".select .dropdownDefault_value").eq(0).html() - 1).attr("data-rid").toLowerCase();
                    var Liveparam={
                        "rid":rPeerId,
                        "params":JSON.stringify({"TIdHex": tIdHex})
                    }
                    //需要获取机位，操作userBehavior
                    oUtils.ajaxReq("/producerpro/stopLive",Liveparam,function(data){
                        var errorCode = data.ErrorCode;
                        if(errorCode == 0 || errorCode == '‭2147483649‬' ){
                            savePosition(infoObj.find(".select .dropdownDefault_value").eq(0).html(),undefined,infoObj);
                        }
                    });
                }
                
            });
            $(".grid-body").on("click",".grid-operate",function(){
                var thisObj = $(this);
                var infoObj = thisObj.parents(".grid-info");
                if(infoObj.find(".select").attr("data-value")=="no_select"){
                    oUtils.alertTips("i18n_pleaseChooseCamera",1500);
                    return false;
                }
                if(!infoObj.hasClass("isLive")){
                    var id = infoObj.attr("data-id");
                    var index = infoObj.find(".dropdownDefault_value").html();
                    var selectObj = $(".preview-content .preview-item").eq(index-1);
                    var rid = selectObj.attr("data-rid");
                    var params = {
                        xId: id,
                        rId:rid
                    }
                    infoObj.find(".grid-operate").css("display","none");
                    infoObj.find(".grid-loading").css("display","block");
                    ipReq.connectGridSourceAndR(params,infoObj);
                }else{
                    //已经live起来了，需要取消
                    var tIdHex =  infoObj.attr("data-tid");
                    //获取rid（主R或者副R）
                    var rPeerId = $(".preview-content .preview-item").eq(infoObj.find(".select .dropdownDefault_value").eq(0).html() - 1).attr("data-rid").toLowerCase();
                    var Liveparam={
                        "rid": rPeerId,
                        "params":JSON.stringify({"TIdHex": tIdHex})
                    }
                    //需要获取机位，操作userBehavior
                    oUtils.ajaxReq("/producerpro/stopLive",Liveparam,function(data){
                        var errorCode = data.ErrorCode;
                        if(errorCode == 0 || errorCode == '2147483649‬'){
                            savePosition(infoObj.find(".select .dropdownDefault_value").eq(0).html(),undefined,infoObj);
                        }
                    });
                }
            });
            $(".ip-body").on("click",".ip-del",function(){
                // if($(this).hasClass("disabled")) return;
                var thisObj = $(this).parent();
                var id = thisObj.attr("data-id");
                if(id){
                    ipReq.deleteAddress(thisObj,true);
                }else{
                    thisObj.remove();
                }
            });
            /*
            * author:daniel
            * function: upload vedio/source
            * params: null
            */
            //click tab change tab
            $(".upload-tab li").dblclick(function(){
                return false;
            });
            $(".upload-tab li").on("click",function(){
                var index = $(this).index();
                if(index==0){
                    createAnyWhere();
                }else if(index==1){
                    initLocalVideoModule();
                }else if(index==2){
                    resourceAbout.getIpStreamList();
                }else if(index == 3){
                    var code=$(".pack").attr("data-code"); 
                    if(code==""||code==undefined) {
                        oUtils.alertTips("i18n_errorTips", 2000);   //发送失败
                        return
                    }
                    var param={
                       "type":"T",
                    };
                    oUtils.ajaxReq("/producerpro/studio_device", param,function(data){
                        var errorCode = data.errorCode;
                        if(errorCode == "0x0"){
                            var result=data.result;
                            if(result.length!=0){
                                var html="";
                                for(var i=0;i<result.length;i++){ 
                                    var pid=result[i].peerId;
                                    var name=result[i].name;
                                    var status=result[i].status;
                                        html=createPack(pid,name,status)+html;  
                                    }
                                }
                                $(".tvupack-body").html(html);   
                            }   
                    });
                } else if(index == 4) {
                    var iconObj = $(".video-manage.grid .sort .iconfont");
                    var param = {}
                    if(iconObj.hasClass("icon-sortdown")){
                        param.sort = "desc";
                    }
                    ipReq.getGridSources(param);
                } else {
                    //转换到QuadView,需要的操作
                    quadView.getQuadViewData();
                    console.log("转换到QuadView");
                }
                $(this).addClass("active").siblings().removeClass("active");
                $(".upload-body .video-manage").eq(index).css("display","block").siblings().css("display","none");
            });
            //click preview list left "+" open local video/source
            $(".preview-add").on("click",function(){
                if(!mix_fn.isPrower("AddAnywhere")) return false;
                var thisObj = $(this);
                if($(".sd-preview-list").find(".preview-item").length==0) return;
                var uploadLiIndex=$(".upload-tab").children("li.active").index();
                if(thisObj.hasClass("disabled")) return;
                $(".upload-video").css("display","block");
                if(uploadLiIndex==0){
                    createAnyWhere();
                    // startCheckTokenStatus();
                }else if(uploadLiIndex==1){
                    initLocalVideoModule();
                }else if(uploadLiIndex == 5){
                    $(".quad-list .quad-add").css("display","none");
                    quadView.getQuadViewData();  
                }
                return false;
            });
            //click close btn close upload video module
            $(".upload-header .close").on("click",function(){
                $(".upload-video").css("display","none");
                $("#bgFilter").css("display","none");
                // indexPageWebsocketObj.socket.stop("listTokenDevice4Pro");
                return false;
            });
            //click del btn remove video
            $(".video-body").on("click",".vedio-del",function(){
                var thisObj = $(this).parent();
                deleteExtAndLocal(thisObj,$(".video-manage .video-add"));
            });
            //click ok btn close upload video module
            $(".upload-footer .complete-btn").on("click",function(){
                $(".upload-header .close").trigger("click");
                return false;
            });
            // 模糊查询
            $(".video-manage.grid .icon-search").on("click", function(){
                //获取到搜索框中name
                var searchObj = $(this).parent(".search");
                var value = searchObj.find("input").val();
                value = value.toLowerCase();
                getGridSearchList (value);
            });
            $(".video-manage.grid .search input").on("keyup", function(){
               return false;
            });
            // 排序
            $(".video-manage.grid .sort_pos").on("click", function(){
                var thisObj = $(this);
                var iconObj = thisObj.find(".iconfont");
                var param = {}
                if(iconObj.hasClass("icon-sortup")){
                    iconObj.removeClass("icon-sortup").addClass("icon-sortdown");
                    param.sort = "desc";
                }else{
                    iconObj.removeClass("icon-sortdown").addClass("icon-sortup"); 
                }
                ipReq.getGridSources(param);
            });
            /**
            * author:Rechel
            * function:Anywhere Token,TVU Pack
            */
           //列表的展示与隐藏
            $(".pack-body").on("click",".pack-camera",function(e){  
                var thisObj=$(this).children('ul');
                if(!thisObj.hasClass('activeUl')){
                    if($(this).siblings('.pack-operate').text()==switchLangObj.i18n_cancelLive){
                        return;
                    }
                    thisObj.css("display", "block");
                    $(".upload-body").css("overflow","visible");
                    thisObj.addClass('activeUl');
                    thisObj.parents(".pack-info").siblings().find(".pack-camera").find("ul").css("display", "none");
                }else{
                    thisObj.removeClass('activeUl')
                    thisObj.css("display", "none");
                }
                e.stopPropagation();
            })

            //列表选择
            $(".pack-body,.tvupack-body").on("click","li",function(){
                var thisObj=$(this);
                var liValue=thisObj.text();
                $(".upload-body").css("overflow","hidden");
                thisObj.parents(".pack-camera").children('span').text(liValue);
                thisObj.parents(".pack-camera").siblings('.pack-operate').attr("data-selectNumber",liValue);
                thisObj.parent("ul").css("display","none");
                return  false;
            })

            $(".tvupack-body").on("click",".pack-camera",function(e){
                var thisObj=$(this).children('ul');
                if(!thisObj.hasClass('activeUl')){
                    if($(this).siblings('.pack-operate').text()==switchLangObj.i18n_cancelLive){
                        return;
                    }else if($(this).siblings('.pack-operate').attr("data-status")==0||$(this).siblings('.pack-operate').attr("data-status")==3){
                        return;
                    }
                    thisObj.css("display", "block");
                    thisObj.addClass('activeUl');
                    // $(".upload-body").css("overflow","visible");
                    thisObj.parents(".pack-info").siblings().find(".pack-camera").find("ul").css("display", "none");
                }else{
                    thisObj.removeClass('activeUl')
                    thisObj.css("display", "none");
                }
                
                e.stopPropagation();
            })


            //点击接收
            $(".pack-body").on("click",".pack-operate",function(){
                var thisObj=$(this);
                var tPeerId=thisObj.attr("data-peertid");
                if(thisObj.text()==switchLangObj.i18n_accept){
                    var packInfoList = $(".pack-body").find(".pack-operate");
                    if(packInfoList.length>4){
                        oUtils.alertTips("i18n_hastoken", 2000);
                        return
                    }
                    thisObj.text(""); 
                    var tokenImghtml='<img src="images/cloud_loading.gif" class="tokenImg" style="width:20px;">';
                    thisObj.append(tokenImghtml);
                    var code=$(".anywher-title").attr("data-code");    
                    var param={
                        "tokenCode.code": code,
                        "peerId":tPeerId,
                        "confirm":"Accept"   //Accept接受  Deny拒绝  Delete删除
                    }
                    $.ajax({
                        type: "POST",
                        url: "/producerpro/token_confirm",
                        timeout : 15000, 
                        data: param,
                        success: function(data){
                            var errorCode = JSON.parse(data).errorCode; 
                            if(errorCode == "0x0"){
                                thisObj.attr("data-tStatus","3");
                                oUtils.alertTips("i18n_HasBeenSent", 2000);
                                $(".tokenImg").remove();
                                thisObj.text(switchLangObj.i18n_accept); 
                            }else if(errorCode == "0x01"){
                                oUtils.alertTips("i18n_acceptFail", 2000);
                                $(".tokenImg").remove();
                                thisObj.text(switchLangObj.i18n_accept); 
                            }else{
                                oUtils.alertTips("i18n_proerrorTips", 2000);
                                $(".tokenImg").remove();
                                thisObj.text(switchLangObj.i18n_accept); 
                            }
                        }
                    })
                }else{
                    addToCancel(thisObj,tPeerId);
                }
                
            });   


            //点击删除
            $(".pack-body,.tvupack-body").on("click",".pack-del",function(){
                var thisObj=$(this);
                var packVal=thisObj.siblings('.pack-operate');
                var thisObjSpanNum=parseInt(thisObj.siblings('.pack-camera').children('span').text());
                var previewLi=$(".preview-list-container").find(".preview-item").eq(thisObjSpanNum-1);
                var rPeerId=previewLi.attr("data-rid");
                var code=$(".anywher-title").attr("data-code"),
                    peerId= thisObj.attr("data-peertid");
                if(packVal.text()==switchLangObj.i18n_cancelLive){
                    oUtils.alertTips("i18n_ProhibitedtoDelete");
                    return
                }else if(packVal.text()==""){
                    oUtils.alertTips("i18n_NotDelete");
                    return
                }
                if(rPeerId!=undefined && rPeerId!=""){
                    rPeerId=rPeerId.toLowerCase();
                    var obj={};
                    obj.TIdHex=peerId;
                    var Liveparam={
                        "rid":rPeerId,
                        "params":JSON.stringify(obj)
                    }
                    oUtils.ajaxReq("/producerpro/stopLive",Liveparam);
                }
                var param={
                    "tokenCode.code": code,
                    "peerId": peerId,
                    "confirm":"Delete"   //Accept接受  Deny拒绝  Delete删除
                }
                if(thisObj.parents(".tvupack-body")){
                   param["type"]="T";
                }
                oUtils.ajaxReq("/producerpro/token_confirm",param,function(data) {
                    var errorCode = data.errorCode;
                    if(errorCode == "0x0"){
                        if(thisObj.parents(".tvupack-body")){
                            var anyPack=$(".pack-body .pack-operate");
                            $.each(anyPack,function(i,v){
                                var tid=$(v).attr("data-peertid");
                                if(tid==peerId){
                                    $(v).parents(".pack-info").remove();
                                }
                            })
                        }
                        thisObj.parent(".pack-info").remove();
                        oUtils.alertTips("i18n_deleteFeilSuccess", 2000);
                    }
                    else if(errorCode == "0x01"){
                        thisObj.parent(".pack-info").remove();      
                    }
                })
            });
            //pack配對
            // $(".pairBtn").click(function() {
            //     var pid=$(".tvuPackInfo input").val();
            //     var reg=/^[0-9a-fA-F]{16}$/;
            //     var code=$(".pack").attr("data-code"); 
            //     if(code==""||code==undefined) {
            //         oUtils.alertTips("i18n_errorTips", 2000);   //发送失败
            //         return
            //     }
            //     var param={
            //         "tokenCode.code": code,
            //         "peerId":pid,
            //         "confirm":"Accept",  //Accept接受  Deny拒绝  Delete删除
            //         "type":"T"
            //     }
            //     initSystem.pageRequestObj.listTokenDevice4Pro(code);
            //     if(reg.test(pid)){
            //         $.ajax({
            //             type: "POST",
            //             url: "token_confirm",
            //             timeout : 15000, 
            //             data: param,
            //             success: function(data){
            //                 var errorCode = JSON.parse(data).errorCode; 
            //                 var errorInfo=JSON.parse(data).errorInfo; 
            //                 if(errorCode == "0x0"){
            //                     oUtils.alertTips("i18n_HasBeenSent", 2000);
            //                     var param={
            //                        "type":"T",
            //                     };
            //                     oUtils.ajaxReq("studio_device", param,function(data){
            //                         var errorCode = data.errorCode; 
            //                         if(errorCode== "0x0"){
            //                             var result=data.result;
            //                             if(result.length!=0){
            //                                 var html=""
            //                                 for(var i=0;i<result.length;i++){
            //                                     var pid=result[i].peerId;
            //                                     var name=result[i].name;
            //                                     var status=result[i].status;
            //                                     html=createPack(pid,name,status)+html;  
            //                                 }
            //                                 $(".tvupack-body").html(html);
            //                             }
            //                         }   
            //                     });
            //                 }else if(errorCode == "0x01"){
            //                     oUtils.alertTips(errorInfo, 2000);
            //                 }else if(errorCode == "0x80100003"){
            //                     oUtils.alertTips(errorInfo, 2000);
            //                 }
            //             }
            //         })
            //     }
            //     else {
            //         oUtils.alertTips("i18n_isPid", 2000);
            //     }
            // });
            //pack live
            $(".tvupack-body").on("click",".pack-operate",function(){
                var thisObj=$(this);
                var pid=thisObj.attr("data-peertid");
                if(thisObj.attr("data-status")==1){
                    var code=$(".pack").attr("data-code");    
                    var param={
                        "tokenCode.code": code,
                        "peerId":pid,
                        "confirm":"Accept",  //Accept接受  Deny拒绝  Delete删除
                        "type":"T"
                    }
                    $.ajax({
                        type: "POST",
                        url: "/producerpro/token_confirm",
                        timeout : 15000, 
                        data: param,
                        success: function(data){
                            var errorCode = JSON.parse(data).errorCode; 
                            var errorInfo=JSON.parse(data).errorInfo; 
                            if(errorCode == "0x0"){
                                oUtils.alertTips("i18n_HasBeenSent", 2000);
                                addToCancel(thisObj,pid,"pack");
                            }else if(errorCode == "0x01"){
                                addToCancel(thisObj,pid,"pack");
                            }else if(errorCode == "0x80100003"){
                                oUtils.alertTips(errorInfo, 2000);
                                return
                            }
                        }
                    })
                }else if(thisObj.attr("data-status")==2){
                    addToCancel(thisObj,pid);
                }else{
                    return ;
                }
            });
        }
    }
    //给pack模块添加滚动条
    $(".upload-body").fnNiceScroll("#333");
    var ipReq ={
        addExternalSource:function(address,rid,infoObj,postion){
            var param = {
                "url": address,
                "rid": rid,
            }
            oUtils.ajaxReq("/producerpro/addExtAndSynchronize",param,function(data){
                if(data.errorCode=="0x0"){
                    ipReq.reqNum = 0;
                    infoObj.attr("data-livePeerid",data.result.peerId);
                    ipReq.startRAndExtLive(param.rid,data.result.peerId,postion,infoObj);
                }else if(data.errorCode=="0x80100017"){
                    oUtils.alertTips("i18n_hasAddedUrl",1500);
                }else{
                    oUtils.alertTips(data.errorInfo,1500);
                }
            });
        },
        connectGridSourceAndR:function(param,infoObj){
            $.ajax({
                type: "POST",
                url:"/producerpro/connectGridSourceAndR",
                timeout:30000,
                data: param,
                success: function(data){
                    data = JSON.parse(data);
                    infoObj.find(".grid-operate").css("display","block");
                    infoObj.find(".grid-loading").css("display","none");
                    if(data.errorCode=="0x0"){
                        var position = infoObj.find(".select .dropdownDefault_value").html();
                        var params = {id: param.xId};
                        var rid = param.rId;
                        var peerId = data.result.peerId;
                        infoObj.attr("data-tid",peerId);
                        ipReq.startRAndExtLive(rid,peerId,position,infoObj,params);
                    }else{
                        oUtils.alertTips(data.errorInfo,1500);
                    }  
                }
            });
        },
        reqNum:0,
        startRAndExtLive:function(rid,tPeerId,postion,infoObj,gridParams){
            var obj={};
            obj.TIdHex=tPeerId;
            var Liveparam={
                "rid": rid.toLowerCase(),
                "params": JSON.stringify(obj)
            }
            oUtils.ajaxReq("/producerpro/startLive",Liveparam,function(data){
                if(data.ErrorCode=="0"){
                    ipReq.reqNum = 0;
                    if( gridParams ){
                        gridParams["TIdHex"] = tPeerId;
                        tPeerId = gridParams;
                    }
                    // 由于把grid转换为ext，所以需要两个参数，机位用id，停流用TIdHex
                    savePosition(postion,tPeerId,infoObj);
                    oUtils.alertTips("i18n_producerProUploadIpSourceTip",1500);
                }else{
                    if(ipReq.reqNum>5){ 
                        ipReq.reqNum = 0;   
                        oUtils.alertTips("start live fail",1500);
                    }else{
                        ipReq.reqNum++;
                        ipReq.startRAndExtLive(rid,tPeerId,postion,infoObj,gridParams);  
                    }
                }
            });
        },
        deleteAddress:function(thisObj,isDeleteData){
            var filename = "",rtmpAddress="";
            if(window.sourceList.uploadIpShimArr.length!=0){
                filename = window.sourceList.uploadIpShimArr[0]["PreviewShm"]["SharedMemoryName"];
                rtmpAddress = window.sourceList.uploadIpShimArr[0]["PreviewShm"]["FileName"];
            }
            var liveid = thisObj.attr("data-livepeerid");
            var rempInputAddress = thisObj.find("input").val().trim();
            var isIpStream = rempInputAddress==rtmpAddress;
            var flag = false;
            //在pgm,pvw,pipPreview,pipOutput和afv没有用才可以删除
            var pgmObj = $(".preview-content .preview-item.outPutActive");
            if((pgmObj.attr("data-filename")==filename&&isIpStream)||(pgmObj.attr("data-rlivepeerid")==liveid&&liveid)){
                flag = true;
            }
            if(!flag){
                //获取afv中的声音文件
                if($(".afv-cut .radius-box").hasClass("close")){
                    var index = $(".afv-audio-cut .afv-audio").html().substring(6);
                    var afvObj = $(".preview-content .preview-item").eq(index-1);
                    if((afvObj.attr("data-filename")==filename&&isIpStream)||afvObj.attr("data-rlivepeerid")==liveid){
                        flag = true;
                    }
                }
                //pip 在pgm的情况下不能删除文件
                var pipObj = $(".preview-content .preview-item.pipOutputActive");
                if(pipObj.length!=0){
                    if((pipObj.attr("data-filename")==filename&&isIpStream)||pipObj.attr("data-rlivepeerid")==liveid){
                        flag = true;
                    }
                }
                
            }
            if(flag){
                oUtils.alertTips("i18n_dontDeleteVideoAtUsing");
                return false;
            }
            if(isDeleteData){
                oUtils.confirmTips("i18n_producerProdeleteVideoConfirm",function(){
                    var id = thisObj.attr("data-id");
                    var param = {
                        id:id
                    }
                    //获取机位
                    oUtils.ajaxReq("/producerpro/studio_delete_stream",param,function(data){
                        if(data.errorCode=="0x0"){
                            if (thisObj.hasClass("isLive")) {
                                var pos =thisObj.find(".select .dropdownDefault_value").eq(0).html();
                                savePosition(pos);
                            }
                            thisObj.remove();
                        }else{
                                oUtils.alertTips(data.errorInfo,1500);
                        }
                    });
    
                    // if(window.peerClientStatusArr.ipsourceFileName==thisObj.find("input").val().trim()){
                    if(window.sourceList.uploadIpShimArr.length!==0 && window.sourceList.uploadIpShimArr[0]["PreviewShm"]["SharedMemoryName"]){
                        var filename = window.sourceList.uploadIpShimArr[0]["PreviewShm"]["SharedMemoryName"];
                        ipReq.delIpsource(thisObj,filename);
                        var pos =thisObj.find(".select .dropdownDefault_value").eq(0).html();
                        savePosition(pos,null,thisObj);
                    }   
                }); 
            }else{

                // if(window.peerClientStatusArr.ipsourceFileName==thisObj.find("input").val().trim()){
                if(window.sourceList.uploadIpShimArr.length!==0 && window.sourceList.uploadIpShimArr[0]["PreviewShm"]["SharedMemoryName"]){
                    var filename = window.sourceList.uploadIpShimArr[0]["PreviewShm"]["SharedMemoryName"];
                    ipReq.delIpsource(thisObj,filename);
                    var pos =thisObj.find(".select .dropdownDefault_value").eq(0).html();
                    savePosition(pos,null,thisObj);
                }   
                // }); 
            }
            
        },
        delIpsource:function(thisObj,filename,isCreate,infoObj){
            var id = window.sourceList.uploadIpShimArr[0]["PreviewID"];
            var params = {
                rid:$(".main-rList .rList-show").attr("data-peerId"),
                params:JSON.stringify([{"FileShimeName":filename}]),
            }
            oUtils.ajaxReq("/producerpro/removeFileShim",params,function(data){
                if(data.errorCode=="0x0"){
                    if(thisObj.attr("data-filename").indexOf("(IP Shim)")>-1){
                      thisObj.remove();  
                    }
                    if(id!==undefined){
                        on_leave(id);
                    }
                    var createIpFilename = infoObj.find(".ip-address input").val();
                    if(isCreate){
                       ipReq.addIPSourceInProducer(createIpFilename,infoObj); 
                    }
                }else{
                    oUtils.alertTips(data.errorInfo,1500);
                }
            });
        },
        addIPSourceInProducer:function(fileShimeName,infoObj){
            if(!isUrl(fileShimeName)){
                oUtils.alertTips("i18n_producerProIsNotUrl",1500);
                return false;
            }
            var params = {"rid": $(".main-rList .rList-show").attr("data-peerId")};
            var ipName = new Date().getTime().toString() +" (IP Shim)";
            var param = {
                "FileShimeName":fileShimeName,
                "NickName": ipName, // ip流名称, 唯一标识
                "ShimType":200  // 对于ip source，固定值200即可
                }
            params["params"]=JSON.stringify(param);
            oUtils.ajaxReq("/producerpro/addIPSourceInProducer",params,function(data){
                if(data.errorCode=="0x0"){
                    oUtils.alertTips("i18n_producerProUploadIpSourceTip",1500);
                    savePosition(5,infoObj.attr("data-filename"),infoObj);
                }else{
                    oUtils.alertTips(data.errorInfo,1500);
                }
            });
        },
        addrStreamAddress:function(pathUrl,infoObj){
            if(!isUrl(pathUrl)){
                oUtils.alertTips("i18n_producerProIsNotUrl",1500);
                return false;
            }
            var params = {
                pathUrl:pathUrl,
                streamType:1,
            };
            oUtils.ajaxReq("/producerpro/studio_store_stream",params,function(data){
                if(data.errorCode=="0x0"){
                    infoObj.attr("data-id",data.result.id);
                    infoObj.find(".ip-del").removeClass("disabled");
                    addExtAndLive(infoObj,pathUrl);
                }else{
                    oUtils.alertTips(data.errorInfo,1500);
                }
            })
        },
        delIpsourceAndCreate:function(thisObj,infoObj){
            var filename = window.sourceList.uploadIpShimArr[0]["PreviewShm"]["SharedMemoryName"];
            var flag = false;
            //在pgm,pvw,pipPreview,pipOutput和afv没有用才可以删除
            flag=$(".main-output").attr("data-filename")==filename?true:false;
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
            
            //获取文件webrtc的id,在删除文件的时候停掉webrtc
            // oUtils.confirmTips("i18n_producerProdeleteVideoConfirm",function(){
                ipReq.delIpsource(thisObj,filename,true,infoObj);
            // });
        },
        getIpStreamList:function(){
            var params = {
                streamType:1
            };
            oUtils.ajaxReq("/producerpro/studio_list_stream",params,function(data){
                if(data.errorCode=="0x0"){
                    initIpSourceModule(data.result);
                }else{
                    oUtils.alertTips(data.errorInfo,1500);
                }
            })
        },
        getGridSources:function(params){
            if(!params) params = {}; 
            oUtils.ajaxReq("/producerpro/getGridSource",params,function(data){
                if(data.errorCode=="0x0"){
                    $(".grid-body").attr("data-params", encodeURIComponent(JSON.stringify(data.result)));
                    var value = $(".grid .search input").val();
                    value = value.toLowerCase();
                    getGridSearchList (value);
                    // ipReq.getGridPair();
                }else{
                    oUtils.alertTips(data.errorInfo,1500);
                }
            })
        },
        saveGridPair:function (infoObj) {
            if(infoObj.lenght != 0){
                var index = infoObj.find(".dropdownDefault_value").html();
                $(".video-manage.grid .grid-info.live.seat_"+index).removeClass("live seat_"+index);
                infoObj.removeClass("live");
                infoObj.removeClass("seat_1");
                infoObj.removeClass("seat_2");
                infoObj.removeClass("seat_3");
                infoObj.removeClass("seat_4");
                infoObj.addClass("live seat_"+index);
            }
            var gridSources = $(".video-manage.grid .grid-info.live");
            var gridParam,params = {
                rid:'',
                source_seats:{},
                source_idarr:[]
            };
            for(var i = 0; i < gridSources.length; i++){
                gridParam = {
                    id: '',
                    seat_index: '',
                    class_name: ''
                }
                var source = gridSources.eq(i);
                if(source.hasClass("seat_1")){
                    gridParam.class_name = "seat_1";
                    gridParam.seat_index = 1;
                }else if(source.hasClass("seat_2")){
                    gridParam.class_name = "seat_2";
                    gridParam.seat_index = 2;
                }else if(source.hasClass("seat_3")){
                    gridParam.class_name = "seat_3";
                    gridParam.seat_index = 3;
                }else if(source.hasClass("seat_4")){
                    gridParam.class_name = "seat_4";
                    gridParam.seat_index = 4;
                }
                gridParam.id = source.attr("data-id");

                params.source_idarr.push(gridParam.id);
                params.source_seats[gridParam.id] = gridParam;
            }
            var param = {
                "pn": "sd",
                "content": JSON.stringify(params),
                "remark": "GridPair"
            }
            oUtils.ajaxReq("saveUserBehavior", param,function(){
                ipReq.getGridPair();
            });
        },
        getGridPair:function(){
            var param = {
                "pn": "sd"
            }
            oUtils.ajaxReq("/producerpro/getUserBehavior", param, function(data){
                if(data.errorCode == "0x0"){
                    var result = JSON.parse(data.errorInfo);
                    result = result.GridPair || undefined;
                    if (result) $(".grid-body").attr("data-liveparams",encodeURIComponent(JSON.stringify(result)));
                    
                }
            });
        }
    }
    //创建anyWhere
    function createAnyWhere(){
        var param=QRImg();
        //调接口获取二维码
        oUtils.ajaxReq("/producerpro/token_getToken4Pro",param,function(data) {
            var errorCode = data.errorCode;
            if( errorCode == "0x0" ) {
                $(".pack-container").addClass('pack-containerBg');
                $(".upload-body .qr-img").addClass('qr-imgBg');
                var code = data.result;
                var headTips = '<p>'+switchLangObj.i18n_headTips+'</p>';
                $(".anywher-title").html(headTips);
                $(".anywher-title").attr("data-code",code);
                $(".pack").attr("data-code",code);
                createQrImg("qrImg",code);
                //生成三条操作说明
                var tip=
                   '<p style="top:57px;"><b>'+switchLangObj.i18n_StepOne+'</b><i></i><span>'+switchLangObj.i18n_OnAppSetting+'</span></p>\
                    <p style="top:94px;"><b>'+switchLangObj.i18n_StepTwo+'</b><i></i><span>'+switchLangObj.i18n_OnThisPage+'</span></p>\
                    <p style="top:132px;"><b>'+switchLangObj.i18n_StepThree+'</b><i></i><span>'+switchLangObj.i18n_OnAppLive+'</span></p>\
                    <p style="top:169px;"><b>'+switchLangObj.i18n_tips+'</b><i></i><span>'+switchLangObj.i18n_OnAppLivetips+'</span></p>';
                $(".tips").html(tip);
                
                var tokenhtml='<div class="file left">'+switchLangObj.i18n_Device+'</div>\
                               <div class="Camera left" style="position:absolute;left:378px;">'+switchLangObj.i18n_Camera+'</div>\
                               <div class="operate right" style="width:114px;">'+switchLangObj.i18n_Operation+'</div>';
                $(".sd-token-title").html(tokenhtml);
                //调webscoket
            }else{
                //TPC token feature disable
                oUtils.alertTips("i18n_errorTips", 2000);   //发送失败
            }
        })
    }
    //创建pack
    function createPack(peerId,name,tStatus){
        var changeValue = undefined;
        var btnStyle,inputStyle;
        if(tStatus==0){
            changeValue=switchLangObj.i18n_add;
            btnStyle="pack-oprateNoAdd";
            inputStyle="inputAdd";
        }else if(tStatus==1){
            changeValue=switchLangObj.i18n_add;
            btnStyle="pack-oprateAdd";
            inputStyle="inputAdd";
        }else if(tStatus==2){
            changeValue=switchLangObj.i18n_cancelLive;
            btnStyle="pack-oprateCancel";
            inputStyle="inputCancel";
        }else if(tStatus==3){
            changeValue=switchLangObj.i18n_add;
            btnStyle="pack-oprateNoAdd";
            inputStyle="inputAdd";
        }
        var packInfoHtml='<div class="pack-info clearFix">\
                            <div class="pack-address left">\
                               <input type="text" value="'+peerId+'/'+name+'" class="'+inputStyle+'" disabled=disabled>\
                            </div>\
                            <div class="pack-camera left">\
                                <span>'+switchLangObj.i18n_Unspecified+'</span>\
                                <i class="pack-cameraArrow"></i>\
                                <ul style="display:none;">\
                                    <li>1</li>\
                                    <li>2</li>\
                                    <li>3</li>\
                                    <li>4</li>\
                                </ul>\
                            </div>\
                            <div class="pack-operate left '+btnStyle+'" data-peertid="'+peerId+'" data-tStatus="'+tStatus+'">'+changeValue+'</div>\
                        </div>';
            return  packInfoHtml; 
    }
    function getGridSearchList (name) {
        var liveResult = getLiveGridList();
        var param,params,dataParams = $(".grid-body").attr("data-params");
        if(dataParams){
            params = JSON.parse(decodeURIComponent($(".grid-body").attr("data-params")));
        }
        var arr = [],matchedName='';
        if(name){
            for (var i = 0; i < params.length; i++){
                param = params[i];
                matchedName = param.name.toLowerCase();
                if(matchedName.indexOf(name) > -1){
                    arr.push(param);
                }  
            }  
        }else{
            arr = params;
        }
        liveResult['unliveSourceArr'] = arr;
        initGridSources(liveResult);
    }
    function getLiveGridList(){
        var userBehavior  = $("#userBehavior").val();
        userBehavior = JSON.parse(decodeURIComponent(userBehavior));
        var params = userBehavior.Position||{};
        var liveGridList =  {
            sourceArr:[],
            liveSourHtml:'',
        }
        if(!params){
            return liveGridList;
        }
        var sourceList = JSON.parse(decodeURIComponent($(".grid-body").attr("data-params")));
        var sourceParams = {};
        Object.keys(params).forEach(id => {
            if(typeof params[id] == "object" ){
                liveGridList["sourceArr"].push(params[id]["id"]);
                sourceParams[params[id]["id"]] = {
                    position: id,
                    TIdHex: params[id]["TIdHex"]
                }
            }     
        });
        console.log(sourceParams);
        for(var i = 0; i < sourceList.length; i++){
            if(liveGridList.sourceArr.indexOf(sourceList[i]["peer_id"]) > -1) {
                 liveGridList.liveSourHtml += '<div class="grid-info clearFix isLive" data-id="'+ sourceList[i]['peer_id'] +'" data-tid="'+sourceParams[sourceList[i]["peer_id"]]["TIdHex"]+'">\
                    <div class="grid-address left">\
                        <input type="text" readonly=true value='+ sourceList[i]['name'] +'>\
                    </div>\
                    <div class="left select disabled seat_'+sourceParams[sourceList[i]["peer_id"]]["position"]+'"></div>\
                    <div class="grid-loading left" style="display: none;"><img src="./images/Spinner-1s-24px.gif" alt=""></div>\
                    <div class="grid-operate operate left">'+switchLangObj.i18n_ipUnConnect+'</div>\
                </div>';
            }
        }
        return liveGridList;
    }
    function initGridSources(liveGridList){
        var html = liveGridList.liveSourHtml,i=0;
        var data = liveGridList["unliveSourceArr"];
        for(;i < data.length; i++){
            if (liveGridList.sourceArr.indexOf(data[i]['peer_id']) > -1) continue;
            html += '<div class="grid-info unlive clearFix" data-id="'+ data[i]['peer_id'] +'">\
                <div class="grid-address left">\
                    <input type="text" readonly=true value='+ data[i]['name'] +'>\
                </div>\
                <div class="left select"></div>\
                <div class="grid-loading left" style="display: none;"><img src="./images/Spinner-1s-24px.gif" alt=""></div>\
                <div class="grid-operate operate left">'+switchLangObj.i18n_ipConnect+'</div>\
            </div>';
        }
        $(".video-manage .grid-body").html(html);
        var website =[{name:1,type:"R"},{name:2,type:"R"},{name:3,type:"R"},{name:4,type:"R"}];
        // var uliveObj =  $(".grid-body .unlive .select");
        // for(var k = 0; k < uliveObj.length; k++){
        //     uliveObj.eq(k).createSimulateSelect(website,"","type","name");
        //     //uliveObj.eq(k).attr("data-value","no_select");
        //     //uliveObj.eq(k).html(switchLangObj.i18n_Unspecified);
        //     //uliveObj.eq(k).attr("title",switchLangObj.i18n_Unspecified);
        // }
        $(".grid-body .select").createSimulateSelect(website,"","type","name");
        $(".grid-body .select").attr("data-value","no_select");
        $(".grid-body .select .dropdownDefault_value").html(switchLangObj.i18n_Unspecified);
        $(".grid-body .select .dropdownDefault_value").attr("title",switchLangObj.i18n_Unspecified);

        for(var j = 1; j < 5; j++){
            if($(".grid-body .seat_"+j).length == 0)continue;
            $(".grid-body .select.seat_"+j+"").attr("data-value",j);
            $(".grid-body .select.seat_"+j+" .dropdownDefault_value").html(j);
            $(".grid-body .select.seat_"+j+" .dropdownDefault_value").attr("title",j);
        }
    }
    function addExtAndLive(infoObj,pathUrl){
        var type = infoObj.find(".select").attr("data-value");
        var index = infoObj.find(".dropdownDefault_value").html();
        var selectObj = $(".preview-content .preview-item").eq(index-1);
        if(type=="R"){
            var rid = selectObj.attr("data-rid");
            ipReq.addExternalSource(pathUrl,rid,infoObj,index);
        }else{
            if(window.sourceList.uploadIpShimArr.length!==0){
                ipReq.delIpsourceAndCreate(selectObj,infoObj); 
            }else{
                ipReq.addIPSourceInProducer(pathUrl,infoObj);
            }  
        }
    }
    //init ip source module
    function initIpSourceModule(uploadIpShimArr){
        var html = "";
        //获取机位信息
        var userBehavior  = $("#userBehavior").val();
        userBehavior = JSON.parse(decodeURIComponent(userBehavior));
        console.log(userBehavior);
        var position = userBehavior.Position;
        var params = {};
        var ipStreamName = '';
        Object.keys(position).forEach(id => {
            if (id == 5){
                ipStreamName = position[id];
            }else if(typeof position[id] != "object"){
                params[position[id]] = id;
            }
        });
        for(var i = 0;i<uploadIpShimArr.length;i++){
            var videoFile = uploadIpShimArr[i]["pathUrl"];
            // var pos = videoFile.lastIndexOf("\\");
            // var str = videoFile.substring(pos+1);
            // var posP = videoFile.lastIndexOf(".");
            //去掉fileshim后的情况
            // var posF = videoFile.indexOf("(ip Shim)");
            // var strP = videoFile.substring(posP+1);
            // var baseName = videoFile.substring(pos+1,posP);
            // var strFile = videoFile.substring(pos+1,posF);
            if( ipStreamName == videoFile ){
                isLive = true;
                html += '<div class="ip-info clearFix '+ (isLive? "isLive": "") +'" data-filename="'+videoFile+'" data-id="'+uploadIpShimArr[i]["id"]+'" data-livepeerid="'+uploadIpShimArr[i]["peerId"]+'"><div class="ip-address left"><input type="text"  placeholder="rtmp/http/issp/rtsp" value="'+uploadIpShimArr[i]["pathUrl"]+'"></div><div class="left select '+ (isLive? ("seat_5" + " disabled"): "") +'"></div><div class="ip-operate operate left">'+ (isLive? switchLangObj.i18n_ipUnConnect: switchLangObj.i18n_ipConnect) +'</div><div class="ip-del left"><i class="iconfont icon-del"></i></div></div>';
            }else{
                var isLive = params[uploadIpShimArr[i].peerId]? true: false;
                html += '<div class="ip-info clearFix '+ (isLive? "isLive": "") +'" data-filename="'+videoFile+'" data-id="'+uploadIpShimArr[i]["id"]+'" data-livepeerid="'+uploadIpShimArr[i]["peerId"]+'"><div class="ip-address left"><input type="text"  placeholder="rtmp/http/issp/rtsp" value="'+uploadIpShimArr[i]["pathUrl"]+'"></div><div class="left select '+ (isLive? ("seat_"+params[uploadIpShimArr[i].peerId] + " disabled"): "") +'"></div><div class="ip-operate operate left">'+ (isLive? switchLangObj.i18n_ipUnConnect: switchLangObj.i18n_ipConnect) +'</div><div class="ip-del left"><i class="iconfont icon-del"></i></div></div>';
            }
            
            // $(".video-manage.ip .video-title .operate").hide();
        }
        $(".ip-body").html(html);
        // var website = getSelectOptions();
        var website =[{name:1,type:"R"},{name:2,type:"R"},{name:3,type:"R"},{name:4,type:"R"},{name:5,type:"ip"}];
        $(".ip-body .select").createSimulateSelect(website,"","type","name");
        $(".ip-info .ip-address input").css("width","368px");
        $(".ip-body .select").attr("data-value","no_select");
        $(".ip-body .select .dropdownDefault_value").html(switchLangObj.i18n_Unspecified);
        $(".ip-body .select .dropdownDefault_value").attr("title",switchLangObj.i18n_Unspecified);
        for(var j = 1; j < 6; j++){
            if($(".ip-body .seat_"+j).length == 0)continue;
            $(".ip-body .select.seat_"+j+"").attr("data-value",j);
            $(".ip-body .select.seat_"+j+" .dropdownDefault_value").html(j);
            $(".ip-body .select.seat_"+j+" .dropdownDefault_value").attr("title",j);
        }
    }

    // function getSelectOptions(){
    //     var obj = $(".preview-content .preview-item");
    //     var website =[],isIp=false,i;
    //     for (i=0;i<obj.length;i++) {
    //         var filename = obj.eq(i).attr("data-filename");
    //         if(/(R Shim)/.exec(filename)||filename=="Default"){
    //             website.push({name:i+1,type:"R"});
    //         }else if(/(IP Shim)/.exec(filename)){
    //             website.push({name:i+1,type:"ip"});
    //         }
    //     }
    //     if(!isIp){
    //         website.push({name:i+1,type:"ip"})
    //     }
    //     return website;
    // }
    function isUrl(str_url){
        var strRegex = "^((http|rtmp|rtsp|issp)?://)+"
            + "(([0-9a-zA-Z_!~*'().&=+$%-]+: )?[0-9a-zA-Z_!~*'().&=+$%-]+@)?" //ftp的user@
            + "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
            + "|" // 允许IP和DOMAIN（域名）
            + "([0-9a-zA-Z_!~*'()-]+\.)*" // 域名- www.
            + "([0-9a-zA-Z][0-9a-zA-Z-]{0,61})?[0-9a-zA-Z]\." // 二级域名
            + "[a-zA-Z]{2,6})" // first level domain- .com or .museum
            + "(:[0-9]{1,5})?" // 端口- :80
            + "((/?)|" // 如果没有文件名，则不需要斜杠
            + "(/[0-9a-zA-Z_!~*'().;?:@&=+$,%#-]+)+/?)$";
        var re=new RegExp(strRegex);
        //re.test()
        if (re.test(str_url)){
            return (true);
        }else{
            return (false);
        }
    }
    //delete ext and localvideo
    function deleteExtAndLocal(thisObj,obj){
        if(thisObj.hasClass("disabled"))return;
        //获取文件名字和Rid,删除文件
        var filename = thisObj.attr("data-filename");
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
        //获取文件webrtc的id,在删除文件的时候停掉webrtc
        var webid = $(".preview-content [data-filename='"+filename+"']").find("video").attr("id");
        var videoId=thisObj.attr("data-videoId");
        oUtils.confirmTips("i18n_producerProdeleteVideoConfirm",function(){
            var params = {
                rid:$(".main-rList .rList-show").attr("data-peerId"),
                params:JSON.stringify([{"FileShimeName":filename}]),
            }
            if(videoId!=undefined){
                params["id"]=videoId;
            }
            oUtils.ajaxReq("/producerpro/removeFileShim",params,function(data){
                    if(data.errorCode=="0x0"){
                        thisObj.remove();
                        obj.css("display","block");
                    }else{
                        oUtils.alertTips(data.errorInfo,1500);
                    }
                });
        });
        return false;
    }
    //upload vedio
    function uploadVideo(file){
        //最多上传一个垫片
        if(sourceList.uploadFileShimArr.length===1) {
            oUtils.alertTips("i18n_uploadMax1Files");
            $("#file_v").val("");
            return;
        }
        var videoVal = $("#file_v").val();
        // var size = ($("#file_v")[0].files[0].size)/(1024*1024);
        var formData = new FormData($('#formVideo')[0]);
        var pos = videoVal.lastIndexOf("\\");
        var str = videoVal.substring(pos+1);
        var posP = videoVal.lastIndexOf(".");
        var strP = videoVal.substring(posP+1);
        var baseName = videoVal.substring(pos+1,posP)
        $("#file_v").val("");
        if(sourceList.uploadFileShimArr.length===1) {
            var uploadFileName = sourceList.uploadFileShimArr[0].PreviewShm.SharedMemoryName;
            uploadFileName = uploadFileName.slice(0,uploadFileName.indexOf(" (File Shim)"));
            if(str===uploadFileName){
                oUtils.alertTips("i18n_NotSameFileName",2500);
                return;
            }
        }

        if(strP=="png"||strP=="jpg"||strP=="gif"){
            oUtils.alertTips("i18n_onlyCanUpVideo");
            return;
        }
        formData.append("name","FileShim");
        formData.append("filename",videoVal);
        formData.append("UserID",userRolePerm.userId);
        if(videoVal!=""){
            //在发送之前先渲染上去
            // var html ='<div class="video-info clearFix file'+baseName+'" data-filename="'+baseName+'"><div class="file left">'+str+'</div><div class="vedio-add-btn left">Add</div><div class="vedio-del left"><i class="iconfont icon-del"></i></div></div>';
            var html ='<div class="video-info clearFix disabled filev" data-filename="'+str+' (File Shim)"><div class="file left">'+str+'</div><div class="vedio-del left"><img src="./images/cloud_loading.gif" width="24" height="24" /></div></div>';
            $(".video-body").append(html);
            $("#loading-Bg").fadeIn();
            //获取R的ip
            var  selectRIp = $(".main-rList .rList-show").attr("data-rip");
            var UploadUrl = $(".main-preview").attr("data-logoUrl");
            $("#file_v").attr("disabled","disabled");
            $.ajax({
                type: "POST",
                url: "http://"+selectRIp+":"+UploadUrl,
                data: formData,
                processData:false,
                contentType:false,
                success: function(data){
                    var data = jQuery.parseJSON(data);
                    if(data.ErrorCode=="0x0"){
                        oUtils.alertTips("i18n_slateUploadSucceed",2000);
                        $("#file_v").removeAttr("disabled");
                        $(".video-info[data-filename='"+str+" (File Shim)']").removeClass("disabled");
                        $(".video-manage .video-add").css("display","none");
                        $(".video-info[data-filename='"+str+" (File Shim)']").find(".vedio-del").html('<i class="iconfont icon-del"></i>');
                        $('.video-body .filev .vedio-del').html('<i class="iconfont icon-del"></i>');
                        // //上传成功add按钮变成绿色的
                        // $('file'+str+" .vedio-add-btn").addClass("green");
                    }else{
                        //上传失败删除添加的html
                        $(".video-info[data-filename='"+baseName+"']").remove();
                        $("#file_v").removeAttr("disabled");
                        if(data.ErrorCode=="0x80524101"){
                            oUtils.alertTips("i18n_uploadMax2Files");
                        }else{
                            oUtils.alertTips("i18n_slateUploadFailed");
                        }
                        
                        $("#loading-Bg").fadeOut();
                        //重置input file
                        $("#file_v").val("");
                    }
                },
                error:function(error){
                    $("#loading-Bg").fadeOut();
                    //重置input file
                    $("#file_v").val("");
                    //console.log(error);
                }
            });
        }
    }
    //add To cancel状态公共方法
    function addToCancel(thisObj,tPeerId,pack){
        var thisObjSpanValue=thisObj.siblings('.pack-camera').children('span').text();
        var thisObjSpanNum=parseInt(thisObj.siblings('.pack-camera').children('span').text());
        var rPeerId,rStatus,rliveId,tliveId,tStatus;
        tStatus=thisObj.attr("data-status");
        var previewLi=$(".preview-list-container").find(".preview-item").eq(thisObjSpanNum-1); 
        rStatus=previewLi.attr("data-rStatus");
        rliveId=previewLi.attr("data-RlivePeerId");
            //点击添加
        if(thisObj.text()==switchLangObj.i18n_add){
            if(thisObjSpanValue==switchLangObj.i18n_Unspecified){
                oUtils.alertTips("i18n_selectReceivers", 2000);
                return;
            }
            if(previewLi.attr("data-rid")==""|| previewLi.attr("data-rid")==undefined){
                if(thisObj.text()==switchLangObj.i18n_cancelLive ){
                    oUtils.alertTips("i18n_ReceiverIslivingWithOther", 2000);
                }
                oUtils.alertTips("i18n_ReceiverIsNotOnline", 2000);
                return; 
            } 
            rPeerId=previewLi.attr("data-rid").toLowerCase();
            var obj={};
            obj.TIdHex=tPeerId;
            var Liveparam={
                "rid":rPeerId,
                "params":JSON.stringify(obj)
            }
            if(tStatus == 2 && rStatus == 2) {
                if(tliveId == rPeerId && rliveId == tPeerId) {
                    // t + r live, cancel
                    Liveparam.rid=rPeerId;
                    obj.TIdHex=tPeerId;
                    Liveparam.params = JSON.stringify(obj);
                    startOrStopTLiveTally(tPeerId,130);
                    stopLive(thisObj,Liveparam,thisObjSpanNum);
                }else{
                    Liveparam.rid=rPeerId;
                    obj.TIdHex=rliveId;
                    Liveparam.params = JSON.stringify(obj);
                    // stop r live
                    stopLive(thisObj,Liveparam);
                    Liveparam.rid=tliveId;
                    obj.TIdHex=tPeerId;
                    Liveparam.params = JSON.stringify(obj);
                    // stop t live
                    startOrStopTLiveTally(tPeerId,130);
                    stopLive(thisObj,Liveparam);
                    // start t live
                    Liveparam.rid=rPeerId;
                    obj.TIdHex=tPeerId;
                    Liveparam.params = JSON.stringify(obj);
                    startOrStopTLiveTally(tPeerId,null,rPeerId);
                    startLive(thisObj,Liveparam,thisObjSpanNum);
                    
                }
            }else if(tStatus != 2 && rStatus == 2) {
                Liveparam.rid=rPeerId;
                obj.TIdHex=rliveId;
                Liveparam.params = JSON.stringify(obj);
                // stop r live
                stopLive(thisObj,Liveparam);
                // start t live
                Liveparam.rid=rPeerId;
                obj.TIdHex=tPeerId;
                Liveparam.params = JSON.stringify(obj);
                startOrStopTLiveTally(tPeerId,null,rPeerId);
                startLive(thisObj,Liveparam,thisObjSpanNum);

            }else if(tStatus == 2 && rStatus != 2) {
                Liveparam.rid=tliveId;
                obj.TIdHex=tPeerId;
                Liveparam.params = JSON.stringify(obj);
                // stop t live
                startOrStopTLiveTally(tPeerId,130);
                stopLive(thisObj,Liveparam);
                // start t live
                Liveparam.rid=rPeerId;
                obj.TIdHex=tPeerId;
                Liveparam.params = JSON.stringify(obj);
                startOrStopTLiveTally(tPeerId,null,rPeerId);
                startLive(thisObj,Liveparam,thisObjSpanNum);
            }else {
                // start
                Liveparam.rid=rPeerId;
                obj.TIdHex=tPeerId;
                Liveparam.params = JSON.stringify(obj);
                startOrStopTLiveTally(tPeerId,null,rPeerId);
                startLive(thisObj,Liveparam,thisObjSpanNum);
            }
        }else if(thisObj.text()==switchLangObj.i18n_cancelLive ){//点击取消
            rPeerId=previewLi.attr("data-rid").toLowerCase();
            var obj={};
            obj.TIdHex=tPeerId;
            var Liveparam={
                "rid":rPeerId,
                "params":JSON.stringify(obj)
            }
            startOrStopTLiveTally(tPeerId,130);
            stopLive(thisObj,Liveparam);
        }   
    }
    //设置stop 或者 start t的时候tally
    /*
    * tallay信号说明
    *  type: 130就是不在用的意思
    *        131在pvw上面，但是不在pgm上面
    *        132在pgm上面。
    *   @params 
    *       tpeerId: 正在和R live的T的id
    *       status: 上面的type，这儿是根据优先级状态发送的pgm>pvw>空闲
     */
    function startOrStopTLiveTally(tpeerId,status,rid){ 
        var liveTallyParam ={},tTally=null;
        if(status){
            tTally= {
                tid:tpeerId,
                type:status
            }
        }else{
            var obj = $(".preview-content .preview-item[data-rid="+rid.toUpperCase()+"]");
            if(obj.hasClass("outPutActive")||obj.hasClass("pipOutputActive")){
                tTally= {
                    tid:tpeerId,
                    type:132
                }
            }else if(obj.hasClass("pipPreviewActive")||obj.hasClass("previewActive")){
                tTally= {
                    tid:tpeerId,
                    type:131
                }
            }else{
                tTally= {
                    tid:tpeerId,
                    type:130
                }
            }
        }
        var arr = [];
        arr.push(tTally);
        liveTallyParam["tallyArray"]=JSON.stringify(arr);
        oUtils.ajaxReq("/producerpro/studio_tally",liveTallyParam,function(data) {
            var errorCode = data.ErrorCode;
            if(errorCode != 0){
                console.log(data.errorInfo);
            }
        })
    }
    //开启直播
    function startLive(packOperate,Liveparam,indx){
        if(sourceList.tokenFlag==false)return;  
        sourceList.tokenFlag = false;
        var retryCount = 4; 
        if(sourceList.retryCountTimer) clearInterval(sourceList.retryCountTimer);
        sourceList.retryCountTimer = setInterval(function(){
        $.ajax({
                type: "POST",
                url: "startLive",
                timeout : 7000, 
                data: Liveparam,
                success: function(data){
                    sourceList.tokenFlag = true;
                    data = JSON.parse(data);
                    var ErrorCode = data.ErrorCode+"";
                    if(ErrorCode.indexOf("2147")>-1){
                        if(retryCount<=0){
                            oUtils.alertTips("i18n_liveFailed", 2000);
                            clearInterval(sourceList.retryCountTimer);
                            packOperate.find(".tokenImg").remove();
                            // packOperate.text("add");
                        }else{
                            retryCount--;
                            if(packOperate.hasClass('.tokenImg')){
                               return ;
                            }
                            else{
                                packOperate.text(""); 
                                var tokenImghtml='<img src="images/cloud_loading.gif" class="tokenImg" style="width:20px;">';
                                packOperate.append(tokenImghtml);
                                var tStatus=packOperate.attr("data-status");
                                packOperate.find(".tokenImg").attr("data-tStatus",tStatus);
                            }   
                        }
                    }else{
                        if(ErrorCode=="0x80100002"||ErrorCode=="0x80100008"){
                            oUtils.alertTips("i18n_pleaseOtherCamera", 2000);
                        }else if(ErrorCode=="0"){
                            packOperate.find(".tokenImg").remove();
                            savePosition(indx);
                        }
                        clearInterval(sourceList.retryCountTimer);  
                    }
                },error:function(data){
                    console.log("startlive:",data,"tid:",tid,"rid:",rid,"imgCode:",imgCode);
                    // console.log("startlive:",data);
                    sourceList.tokenFlag = true;
                }
            });
        },sourceList.startLvieTimeOut);
    }

    
    //停掉直播
    function stopLive(packOperate,Liveparam){
        oUtils.ajaxReq("/producerpro/stopLive",Liveparam,function(data) {
            var errorCode = data.ErrorCode;
            if(errorCode == 0){
                if(packOperate.hasClass('.tokenImg')){
                  return ;
                }else{
                  packOperate.text(""); 
                  var tokenImghtml='<img src="images/cloud_loading.gif" class="tokenImg" style="width:20px;">';
                  packOperate.append(tokenImghtml);
                  var tStatus=packOperate.attr("data-status");
                  packOperate.find(".tokenImg").attr("data-tStatus",tStatus);
               } 
            }
        })
    }

    //保存用户的机位信息
    function savePosition(id,param,obj){
        //获取到机位信息，然后修改机位信息
        var userBehavior  = $("#userBehavior").val();
        userBehavior = JSON.parse(decodeURIComponent(userBehavior));
        var params = userBehavior.Position||{};
        if(obj){ // 由于pack和anywhere不进行机位保存
            if(param){
                //抢占的情况下需要把用户当前状态清除
                var isLiveObj = obj.siblings(".isLive");
                for (var i = 0; i < isLiveObj.length; i++){
                    var isObj = isLiveObj.eq(i);
                    if (isObj.find(".seat_" +id).length != 0 ){
                        isObj.removeClass("isLive");
                        isObj.find(".operate").html(switchLangObj.i18n_ipConnect);
                        isObj.find(".select").removeClass("disabled");
                    }
                } 
                params[id] = param;
                obj.addClass("isLive");
                obj.find(".operate").html(switchLangObj.i18n_ipUnConnect);
                obj.find(".select").addClass("disabled");
                obj.find(".select").addClass("seat_" +id);
            }else{
                delete params[id];
                obj.removeClass("isLive");
                obj.find(".operate").html(switchLangObj.i18n_ipConnect);
                obj.find(".select").removeClass("disabled");
            }
        } else {
            delete params[id];
        }
        // 防止不是数字的id混入
        var delArr = [];
        Object.keys(params).forEach(id => {
            if(!Number(id)){
                delArr.push(id);
            }
        });
        for(var j = 0; j < delArr.length; j++){
            delete params[delArr[j]]
        }
        param = {
            "pn": "sd",
            "content": JSON.stringify(params),
            "remark": "Position"
        }
        userBehavior.Position = params;
        $("#userBehavior").val(encodeURIComponent(JSON.stringify(userBehavior)));
        oUtils.ajaxReq("/producerpro/saveUserBehavior", param, function(data){
            // var param = {
            //     "pn": "sd"
            // }
            
            // oUtils.ajaxReq("getUserBehavior", param, function(data){
            //     if(data.errorCode == "0x0"){
            //        $("#userBehavior").val(encodeURIComponent(data.errorInfo));
            //     }
            // });
        });
    }
    //初始化local video module
    function initLocalVideoModule(){
        var html = "";  
        var uploadFileShimArr = sourceList.uploadFileShimArr;
        if(uploadFileShimArr.length==0){
            $(".video-manage .video-add").css("display","block");
        }else{
            $(".video-manage .video-add").css("display","none");
        }
        for(var i = 0;i<uploadFileShimArr.length;i++){
            var videoFile = uploadFileShimArr[i]["PreviewShm"]["SharedMemoryName"];
            var pos = videoFile.lastIndexOf("\\");
            // var str = videoFile.substring(pos+1);
            // var posP = videoFile.lastIndexOf(".");
            //去掉fileshim后的情况
            var posF = videoFile.indexOf("(File Shim)");
            // var strP = videoFile.substring(posP+1);
            // var baseName = videoFile.substring(pos+1,posP);
            var strFile = videoFile.substring(pos+1,posF);
            html +='<div class="video-info clearFix" data-filename="'+videoFile+'" data-video="'+strFile+'"><div class="file left">'+strFile+'</div><div class="vedio-del left"><i class="iconfont icon-del"></i></div></div>';
        }
        if($(".video-manage .video-add").css("display")=='none'){
            $(".video-body").html(html);
        }
        var params={
            "streamType":"0",
        };
        oUtils.ajaxReq("/producerpro/studio_list_stream",params,function(data){
            if(data.errorCode=="0x0"){
                var result=data.result;
                html = "";
                for(var i=0;i<result.length;i++){
                    var pathUrl= result[i].pathUrl;
                    pathUrl=decodeURIComponent(pathUrl);
                    var indexVideo= pathUrl.indexOf("video");
                    var videoName= pathUrl.slice(indexVideo+6);
                    var videoNameFileShim= pathUrl.slice(indexVideo+6)+" (File Shim)";
                    var videoId=result[i].id;
                    // if(videoname==videoName){
                        // $(".video-info").remove();
                        // var videohtml ='<div class="video-info clearFix" data-videoId="'+videoId+'" data-filename="'+RvideoFile+'"><div class="file left">'+videoName+'</div><div class="vedio-del left"><i class="iconfont icon-del"></i></div></div>';
                        // $(".video-body").html(videohtml);
                    // }else{
                    if($(".video-body [data-filename='"+videoNameFileShim+"']").length == 0){
                        html +='<div class="video-info clearFix" data-videoId="'+videoId+'" data-filename="'+videoNameFileShim+'"><div class="file left">'+videoName+'</div><div class="vedio-del left"><i class="iconfont icon-del"></i></div></div>';
                    }else{
                        $(".video-body [data-filename='"+videoNameFileShim+"']").attr("data-videoId",videoId);
                    }
                    // }       
                }
                $(".video-body").append(html);
                if($(".video-body .video-info").length==0){
                    $(".video-manage .video-add").css("display","block");
                }else{
                    $(".video-manage .video-add").css("display","none");
                }  
            }
        })
    }
    resource.initEvent();
    return {
        getIpStreamList:ipReq.getIpStreamList,
        uploadVideo:uploadVideo,
        createPack: createPack,
    }
})($,oUtils,switchLangObj);
