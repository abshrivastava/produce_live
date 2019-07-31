var push_client = (function($,oUtils,switchLangObj){
    $(".pushing .addCount").on("click",function(){
        if(!mix_fn.isPrower("AddSocial")) return false;
        $("#girdUrlShow").css("display","none");
        var params = {
            is_push: false,
            livepeerid: $(".main-preview").attr("data-livepeerid"),
            rId: $(".rList-show").attr("data-peerid")
        }
        var push_stream =window.frames["push_stream"];
        $(".push_stream").css({"display":"block","height":"424px"});
        var params = pushAboutInfo.authUser();
        pushAboutInfo.createiframe(params);
        // push_stream.window.pushAbout.selectPlatfrom(params); 
    });
    $("form.pushCount").on("keyup","input",function(){
        return false;
    });
    $(".pushing").on("click",function(){
        return false;
    })
    $(".Push_toAccount_comment").on("click",".shareIcon",function(e){
        $("#girdUrlShow").css("display","none");
        var thisObj = $(this);
        var select = thisObj.children(".selectPosition").children(".dropdown_option_item");
        
        //改变当前图标状态
        if (thisObj.hasClass("bgGreen")||thisObj.hasClass("bgRed")) {
            if((thisObj.find(".icon-socialMeida")).hasClass("active")){
                thisObj.removeClass("bgRed");
            }else{
                thisObj.removeClass("bgGreen");
            }
            select.removeClass("block");
            if($(".Push_toAccount_comment").find(".bgGreen").length==0 && !$(".shareIcon").find(".icon-socialMeida").hasClass("active")){
                $(".push-live").removeClass('openLive');
            }   
        }else {
            if((thisObj.find(".icon-socialMeida")).hasClass("active")){
                thisObj.addClass('bgRed');
            }else{
                thisObj.addClass("bgGreen");
            }
            select.addClass("block");
            $(".push-live").addClass('openLive');
        }
        if(!thisObj.find(".icon-socialMeida").hasClass("active")&&!thisObj.hasClass("bgRed")&&!$(e.target).hasClass("dropdown_option_item")&&thisObj.hasClass("bgGreen")){
            $(".push_stream").show();
            $(".push_stream").css("height","550px");

            var params = pushAboutInfo.getPushInfo(thisObj);
            pushAboutInfo.createiframe(params);
            if(select.hasClass("block")){
                select.removeClass("block");
                thisObj.removeClass("bgGreen");
            }
            else{
                select.addClass("block");
                thisObj.addClass("bgGreen");
            } 
        }
        if($(".shareIcon .icon-socialMeida.active").parent().find(".dropdown_option_item").hasClass("block")){
            $(".push-stop").removeClass('hide');
        }else{
            $(".push-stop").addClass('hide');
        }
        var shareIconNum = thisObj.parent(".Push_toAccount_comment").find(".shareIcon").length;
        var hasblockNum = $(".shareIcon .dropdown_option_item.block").length;


        //如果全选了，勾选上全选按钮
        if (shareIconNum == hasblockNum &&(!thisObj.hasClass("bgGreen")||!thisObj.hasClass("bgRed")) ) {
            thisObj.parents(".pushing").find(".SelectAllBtn").children(".dropdown_option_item").addClass("block selectAllBg")
        } else {
            thisObj.parents(".pushing").find(".SelectAllBtn").children(".dropdown_option_item").removeClass("block selectAllBg")
        }
    });
    $(".pushing .deleteCount").on("click",function(){
        var deleteCount = $(".shareIcon .dropdown_option_item.block");
        if(deleteCount.length==0){
            oUtils.alertTips("i18n_hasChoose",2000);
            return false;
        }
        if($(".shareIcon .icon-socialMeida.active").parent().find(".dropdown_option_item").hasClass("block")){
            oUtils.alertTips("i18n_pleaseStopToDel",2000);
            return false;
        }
        oUtils.confirmTips("i18n_producerproDeleteCount",function(){
            var nickNames = "",item=null;
            for(var i=0;i<deleteCount.length;i++){
                item = $(deleteCount[i]).parents(".shareIcon");
                nickNames += item.attr("data-nickname")+",";
            }
            nickNames = nickNames.substring(0,nickNames.length-1);
            push_client.deleteCountReq(nickNames);
        }); 
    });
    window.addEventListener("message", function( event ) {
        var contentData = event.data;
        contentData = JSON.parse(contentData);
        pushClose(contentData);
    });
    function pushClose(params){
        // 判断是注册模式还是添加账户模式
        if(params.methods == "close"){
            //点击取消或者小差的操作
        }else if(params.methods == "addOrDel"){
            fn_getAllShareAccount();
        }
        $(".push_stream").hide();
    }
    var push_client = {
        deleteCountReq:function(params){
            params = {
                "nickName":params
            }
            oUtils.ajaxReq("/producerpro/deleteShareDetail",params,function(data){
                if(data.errorCode=="0x0"){
                    fn_getAllShareAccount();
                }
            });
        },
    }
    var pushAboutInfo = {
        _getAttrs:function(obj,params){
            for (var Key in params) {
                params[Key] = obj.attr("data-" + Key);
            }
            return params;
        },
        _getAccountInfo:function(type){
            var obj = {};
            switch(type){
                case "F":
                    obj={
                        id: "",
                        rtmpId: "",
                        token: "",
                        type: "",
                        nickName: "",
                        username: "",
                        description:"",
                        title: "",
                        appId: "",
                    };
                    break;
                case "S":
                    obj={
                        id: "",
                        rtmpId: "",
                        token: "",
                        type: "",
                        nickName: "",
                        username: "",
                        description:"",
                        title: "",
                        appId: "",
                        should_not_tweet: "",
                        refreshAccessToken:"",
                        isNew: "",
                    }
                    break;
                case "P":
                    obj = {
                        id:"",
                        rtmpId:"",
                        token:"",
                        type:"",
                        nickName:"",
                        username:"",
                    }
                    break;
                case "Y":
                    obj = {
                        id: "",
                        rtmpId:"",
                        token:"",
                        type: "",
                        nickName: "",
                    }
                    break;
                case "I":
                    obj = {
                        id: "",
                        rtmpId: "",
                        token: "",
                        type: "",
                        nickName: "",
                        username: "",
                        description: "",
                    }
                    break;
                case "Z":
                    obj={
                        id: "",
                        rtmpId: "",
                        token: "",
                        type: "",
                        nickName: "",
                        username: "",
                        description: "",
                        title: "",
                    }
                    break;
                case "O":
                    obj={
                        id: "",
                        rtmpId: "",
                        token: "",
                        type: "",
                        nickName: "",
                        username: "",
                        description: ""
                    }
                    break;      
            }
            return obj;
        },
        getPushInfo:function(thisObj){
            if(thisObj.find(".detialPush").length<=0)return; 
            var type = thisObj.attr("data-type");
            var userInfoObj = pushAboutInfo._getAccountInfo(type);
            var params = pushAboutInfo._getAttrs(thisObj,userInfoObj);
            params.livepeerid = $(".main-preview").attr("data-livepeerid");
            params.rId = $(".rList-show").attr("data-peerid");
            params.resolutionArray = JSON.stringify(statusObj.resolutionArray);
            params.session = localStorage.getItem('session');
            params.random = Math.random();
            params.usedFun = 'publish';
            return $.param(params);
        },
        authUser:function(){
            var params = {};
            params.livepeerid = $(".main-preview").attr("data-livepeerid");
            params.rId = $(".rList-show").attr("data-peerid");
            params.resolutionArray = JSON.stringify(statusObj.resolutionArray);
            params.session = localStorage.getItem('session');
            params.random = Math.random();
            params.usedFun = 'auth';
            return $.param(params);
        },
        createiframe:function(params){
            var exec_obj = $(".tmp_frame");
            if(exec_obj.length == 0){
                exec_obj = document.createElement('iframe');
                exec_obj.name = 'tmp_frame';
                exec_obj.className = 'tmp_frame';
                exec_obj.src = 'https://localhost/producerpro/push_exec.html?' + params;
                exec_obj.style.display = 'none';
                document.body.appendChild(exec_obj);
            }else{
                exec_obj.attr('src','https://localhost/producerpro/push_exec.html?' + params);
            }
        }
    }
    
    /* 添加页面多推流代码 start*/
    //初始化直播网站选择框(social account页面)
    //创建下拉框 插件生成
    var socialTypeArr = { checkbox: { parent: switchLangObj.i18n_socialAccount, selectAll: true, children: [{ "val": "F", "text": "Facebook" }, { "val": "Y", "text": "YouTube" }, { "val": "Z", "text": switchLangObj.i18n_YiLive }, { "val": "P", "text": switchLangObj.i18n_pandaTV },{ "val": "S", "text": "Periscope" },{ "val": "O", "text": switchLangObj.i18n_Others }] } };
    $(".pushing .websiteFilter").createSimulateSelect(socialTypeArr, fn_getAllShareAccount, "val", "text");
    $(".pushing .websiteFilter").setSimulateSelect("all");
    

    $(".output-live").on("click", function (e) {
        if($(".pushing").hasClass("hide")){
            initShareAccounts();
        }else{
            $(".pushing").toggleClass('hide');
        }
    })

    if($(".Push_toAccount_comment").hasClass('shareIcon')){
       $(".emptyPush").hide();
    }else{
       $(".emptyPush").show();
    }

    $(".Push_toAccount_comment").on("mouseover",".shareIcon",function(){
        var thisObj=$(this);
        if(thisObj.find(".icon-socialMeida").hasClass("active")){
            thisObj.addClass('bghoverRed');
        }
    })

    $(".Push_toAccount_comment").on("mouseout",".shareIcon",function(){
        var thisObj=$(this);
        if(thisObj.find(".icon-socialMeida").hasClass("active")){
            thisObj.removeClass('bghoverRed');
        }
    })

     //全选/反选
    $(".push-foot").on("click", ".SelectAllBtn .dropdown_option_item", function () {
        var thisObj = $(this);
        if($(".Push_toAccount_comment").hasClass('shareIcon')){
           $(".emptyPush").hide();
        }else{
           $(".emptyPush").show();
        }
        if (thisObj.hasClass("block selectAllBg")) {
            thisObj.removeClass("block selectAllBg");
            $(".push-live").removeClass('openLive');
            thisObj.parents(".pushing").find(".Push_toAccount_comment .dropdown_option_item").removeClass("block");
            if(($(".shareIcon").find(".icon-socialMeida")).hasClass("active")){
                thisObj.parents(".pushing").find(".shareIcon").removeClass("bgRed");
            }
            thisObj.parents(".pushing").find(".shareIcon").removeClass("bgGreen");  
        } else {
            thisObj.addClass("block selectAllBg");
            $(".push-live").addClass('openLive');
            thisObj.parents(".pushing").find(".Push_toAccount_comment .dropdown_option_item").addClass("block");
            if(($(".shareIcon").find(".icon-socialMeida")).hasClass("active")){
                thisObj.parents(".pushing").find(".shareIcon").addClass("bgRed");
            }else{
                thisObj.parents(".pushing").find(".shareIcon").addClass("bgGreen");
            }
        }
    });


    //确认推流
    $(".push-foot").on("click", ".push-live", function () {
        var thisObj = $(this),
            perrId = $(".main-rList .rList-show").attr("data-peerId"),
            livePeerId = $(".main-preview").attr("data-livepeerId"),
            num = thisObj.parents(".pushing").find(".Push_toAccount_comment .block"),
            hasSelectNum = num.length,

            curNum = $(".main-output .shareCounts").html() - 0;
        var shareNum = hasSelectNum + curNum;
        if ($(".Push_toAccount_comment").find(".block").parents(".shareIcon").find(".icon-socialMeida.active").length > 0) { //判断选择的账号中有没有正在推流的，有，拒绝推流
            oUtils.alertTips("i18n_stopThisVideoShareAnotherVideo", 2000);
            thisObj.parents(".liveVideo-item").find(".loading").fadeOut();
            return;
        }
        if (hasSelectNum > 0) {
            //获取当前R可以推流的最大数值，然后再根据书值进行相对应的提示
            var currentRMaxCopier = $(".main-preview").attr("data-maxCopierCount");
            // var currentRMaxCopier=1;
            if (shareNum > currentRMaxCopier) {
                var eShareNumber = "The max length you can share is " + currentRMaxCopier,
                    cShareNumber = "最多能分享" + currentRMaxCopier + "个";
                fn_switchLangAlertTip(eShareNumber, cShareNumber);
                return;
            }
            fn_doShare(thisObj, num, perrId, true, livePeerId);
        } else {
            oUtils.alertTips("i18n_hasChoose", 2000);
        }
    });

    //停止推流
    $(".push-foot").on("click", ".push-stop", function () {
        var thisObj = $(this);
        var yiLiveIdArr=[],perisope=[];
        if (thisObj.hasClass("disabled")) return;
        var selectNum = $(".Push_toAccount_comment").find(".block").parents(".shareIcon").find(".icon-socialMeida.active").length;
        var selectAccount=$(".Push_toAccount_comment").find(".block").parents(".shareIcon").find(".icon-socialMeida.active");
        if (selectNum == 0) {
            oUtils.alertTips("i18n_chooseLiveAccount", 2000);
            thisObj.parents(".liveVideo-item").find(".loading").fadeOut();
            return;
        } else {
            $.each(selectAccount,function(idx,itm){
                var obj = {};
                var iconfont = $(itm).attr("data-website");
                if( iconfont == "Z"){
                    var yiLiveId = {};
                    yiLiveId.scid = $(itm).attr("data-scid");
                    yiLiveId.memberid = $(itm).attr("data-rtmpId");
                    yiLiveId.accesstoken = $(itm).attr("data-token");
                    yiLiveIdArr.push(yiLiveId);
                }else if(iconfont == "S"){
                    var dataName = $(itm).parent().attr("data-name");
                    perisope.push(dataName);
                }
            });
            if(yiLiveIdArr!="") oUtils.ajaxReq("/producerpro/closeYizhiboPush",{param:JSON.stringify(yiLiveIdArr)});
            if(perisope.length!=0)oUtils.ajaxReq("/producerpro/stopPeriscopeBroadcast",{'shareDetail':perisope});
            stopCopierInfo();
        }
    });

    $(".Push_toAccount_comment").on("click",".gridShow",function(){
        if(!mix_fn.isPrower("Grid")) return false;
        // if(!currentRInfo.isFlv) return;
        $("#girdUrlShow").css("display","block");
        $("#detailPush").css("display","none");
        $("#addShareSource").css("display","none");
        if($(".gridIssp").attr("data-issp")=="yes") return;
        var copierParamArr=[];
        var obj = {};
        obj.CopierNickName = Math.random();
        obj.EncoderIndex = 1;
        obj.RtmpUrl = "default";
        obj.CopierType = "Others";
        obj.LiveModule = "producerPro";
        obj.type = 5;
        obj.RetryTimes = 0;
        copierParamArr.push(obj);
        var param = {
            rid: $(".rList-show").attr("data-peerId"),
            share: ["share"],
            params: JSON.stringify(copierParamArr),
            buildDate: "2017/1/17 16:10",
            encoderIndex: 1,
            resolution:"1280x720",
            vBitrate:"2.0M",
            livePeerId: $(".main-preview").attr("data-livepeerId"),
            liveModule: "producerPro"
        };
        oUtils.ajaxReq("/producerpro/startStudioFileInfo", param, function (data) {
            if (data.errorCode == "0X0" || data.errorCode == "0x0") {
                
            }
        });
    });

    $("#girdUrlShow p").click(function(){
        var isspUrl = $(".gridIssp");
        isspUrl.select();
        document.execCommand("Copy");
        oUtils.alertTips("i18n_Copyed", 2000);
    });
    //初始化推流下拉菜单
    function initShareAccounts() {
        $(".pushing .websiteFilter").setSimulateSelect("all");
        oUtils.ajaxReq("/producerpro/queryRtmpDetail", { type: "All", pageflag: "false" }, function (data) {
            if (data.errorCode != "0x0") {
                if (data.errorInfo.indexOf("Null record") > -1) {
                    $(".pushing").toggleClass('hide');
                }
                return;
            }

            var data = $.parseJSON(data.errorInfo);
            fn_updataToken(data);
        });
    }
    //渲染分享账号
    function fn_updataToken(data) {
        var showIconFont = [];
        if (data.length > 0) {
            var gridHtml='<div class="gridShow"><img src="images/gridLogo.png" alt="" /><div class="gridShow-title">Grid</div></div>';
            $.each(data, function (idx, itm) {
                var type = itm.type;
                var name = itm.nickName;
                var rtmpId = itm.rtmpId;
                var scid = itm.appId;
                var token = itm.token;
                var refreshaccesstoken = itm.refreshAccessToken;
                var locale = itm.locale;
                var should_not_tweet = itm.should_not_tweet;
                var titleValue='';
                var str;
                switch (type) {
                    case "F":
                        str = '<i class="iconfont icon-socialMeida icon-facebook icon-socialMeida-midddle icon-font-size showTitle icon-font-Facebooksize" data-website="' + type + '"></i>';
                        break;
                    case "Y":
                        str = '<i class="iconfont icon-socialMeida icon-youtube icon-socialMeida-midddlthisObjSe icon-font-size showTitle" data-website="' + type + '"></i>';
                        break;
                    case "I":
                        str = '<i class="icon-socialMeida icon-inke showTitle" data-website="' + type + '" data-rtmpId="' + rtmpId + '"></i>';
                        break;
                    case "P":
                        str = '<i class="icon-socialMeida icon-pandaTV showTitle" data-website="' + type + '"></i>';
                        break;
                    case "Z":
                        str = '<i class="icon-socialMeida icon-yiLive showTitle" data-website="' + type + '" data-rtmpId="' + rtmpId + '" data-token="' + token + '" data-scid="' + scid + '"></i>';
                        break;
                    case "S":
                        str = '<i class="iconfont icon-socialMeida icon-periscope showTitle" data-website="'+type+'" data-refreshaccesstoken="'+refreshaccesstoken+'" data-token="'+token+'" data-should_not_tweet="'+should_not_tweet+'"></i>';
                        break;
                    case "O":
                        str = '<i class="iconfont icon-socialMeida icon-yunzhibo icon-socialMeida-midddle icon-font-size showTitle" data-website="' + type + '"></i>';
                        break;
                }
                if(type=="P"||type=="F"||type=="S"){
                    titleValue=name;
                }else{
                    titleValue=rtmpId;
                }
                var shareNickname = name;
                if(type=="S"||type=="F"||type=="O"||type=="P"||type=="Z"||type=="Y"){
                    shareNickname = "<span class='detialPush'>"+name+"</span>";
                    titleValue = switchLangObj.i18n_click2publish+" "+titleValue;
                }
                var html = '<div class="shareIcon left" data-nickName="'+itm["nickName"]+'" data-id="'+itm["id"]+'" data-key="'+itm["key"]+'" data-type="'+itm["type"]+'" data-token="'+itm["token"]+'" data-description="'+itm["description"]+'" data-rtmpId="'+itm["rtmpId"]+'" data-username="'+itm["username"]+'" data-title="'+itm["title"]+'" data-appId="'+itm["appId"]+'" data-refreshAccessToken="'+itm["refreshAccessToken"]+'" data-should_not_tweet="'+itm["should_not_tweet"]+'"  data-name="'+name+'"  title="' + titleValue + '/ '+ name + '">' +
                    '<div class="dropdown_option checkbox shareOneSelectBtn selectPosition">' +
                    '<a href="javascript:;" class="ellipsis dropdown_option_item" data-value="' + name + '"></a>' +
                    '</div>' + str +
                    '<div class = "shareIcon-bottom">' +
                    '<span class="shareCircle hide"></span>' +
                    '<span class="shareNickName ellipsis">' +shareNickname + '</span>' +
                    '</div>' +
                    '</div>';
                showIconFont.push(html);
            });

            $(".pushing").find(".Push_toAccount_comment").html(gridHtml+showIconFont.join(""));
            $(".pushing").find(".Push_toAccount_comment").fnNiceScroll();
            if($(".pushing").hasClass("hide")){
                $(".pushing").toggleClass('hide');
            }
        }
    }
    //过滤账号回调---按照网站类型
    function fn_getAllShareAccount() {
        //获取参数
        var type = "All";
        if (!$(".websiteFilter .dropdown_menu li").eq(0).hasClass("active")) {
            var activeObj = $(".websiteFilter .dropdown_menu li.active");
            type = "";
            $.each(activeObj, function (idx, itm) {
                type += "," + $(itm).find("a").attr("data-value");
            });
            type = type.slice(1);
        }
        //获取数据
        var param = {
            type: type,
            pageFlag: "false"
        }
        oUtils.ajaxReq("/producerpro/queryRtmpDetail", param, function (data) {
            if (data.errorCode != "0x0") {
                if (data.errorInfo.indexOf("Null record") > -1) {
                    var html=' <div class="gridShow"><img src="images/gridLogo.png" alt="" /><div class="gridShow-title">Grid</div></div><div class="emptyPush"><div class="empty_box"><img src="images/empty_box.png" alt=""></div><span class="emptyData i18n" name="i18n_EmptyData">Empty Data</span></div>'
                    $(".pushing").find(".Push_toAccount_comment").html(html);
                }
                return;
            }
            var data = $.parseJSON(data.errorInfo);
            fn_updataToken(data);
        });
    }
    //ajax获取rtmpUrl
    function fn_doShare(thisObj, num, rId, versionFlag, livePeerId, isCloudR) {
        var nickName = "";
        $(num.parents(".shareIcon")).each(function () {
            nickName += $(this).attr("data-nickname") + ",";
        });
        nickName = nickName.substr(0, nickName.length - 1);
        $(".pushing").find(".loading").fadeIn();
        $.ajax({
            type: "POST",
            url: "/producerpro/getRtmpUrl",
            data: {
                nickName: nickName,
                rId: rId
            },
            dataType: "json",
            timeout: 45000,
            success: function (data) {
                if (data.errorCode == "0x0") {
                    var datas = data.errorInfo;
                    var isShareNameArr = [];
                    var shareDetailParam = [];
                    $.each($.parseJSON(datas), function (idx, item) {
                        var valid = item.valid;
                        var isSharename = item.nickName;
                        var liveVideoId = item.liveVideoId;
                        var rtmpUrl = item.rtmpUrl;
                        var scid = item.scid;
                        if (valid == "false") { //无效账号
                            var validAccount = {};
                            validAccount.nickName = item.nickName;
                            validAccount.type = item.type;
                            validAccount.rtmpUrl = item.rtmpUrl;
                            isShareNameArr.push(validAccount);
                        } else { //有效账号
                            var shareDetail = {
                                rId: rId,
                                nickName: item.nickName,
                                liveVideoId: item.liveVideoId,
                                type: item.type,
                                rtmpUrl: rtmpUrl,
                                buildDate: "2017/1/17 16:10",
                                livePeerId: livePeerId
                            };
                            shareDetailParam.push(shareDetail);
                            //一直播绑定scid
                            if (scid) {
                                var shareNickNames = $("#" + rId).find(".shareIcon").find(".shareNickName");
                                for (var j = 0; j < shareNickNames.length; j++) {
                                    if (shareNickNames.eq(j).html() == item.nickName) shareNickNames.eq(j).parents(".shareIcon").children(".icon-socialMeida").attr("data-scid", scid);
                                }
                            }
                        }

                    });
                    if (isShareNameArr != "") {
                        var commonAccounts = [], inkeAccounts = [], pandaAccounts = [], yiLiveAccounts = [], tryAgin=[];
                        $.each(isShareNameArr, function (idx, itm) {
                            if (itm.type === "I") {
                                inkeAccounts.push(itm.nickName);
                            } else if (itm.type === "P") {
                                if (itm.rtmpUrl) {
                                    if (itm.rtmpUrl.errorInfo.indexOf("room not exists") != -1) {
                                        pandaAccounts.push(itm.nickName);
                                    } else {
                                        commonAccounts.push(itm.nickName);
                                    }
                                }
                            } else if (itm.type === "Z") {
                                if (itm.rtmpUrl) {
                                    if (itm.rtmpUrl.result > 500) {
                                        inkeAccounts.push(itm.nickName);
                                    } else {
                                        commonAccounts.push(itm.nickName);
                                    }
                                }
                            } else if(itm.type === "F"){
                                if(itm.rtmpUrl=="404"||itm.rtmpUrl=="400"){
                                    tryAgin.push(itm.nickName);
                                }else{
                                    commonAccounts.push(itm.nickName);
                                }
                            }else{
                                commonAccounts.push(itm.nickName);
                            }
                        });
                        var cPlatformTips = "", ePlatformTips = "";
                        if (commonAccounts != "") {
                            var ueslessAccounts = commonAccounts.join(", ");
                            ePlatformTips += '<div>Account ' + ueslessAccounts + ' may be expired.</div>';
                            cPlatformTips += '<div>账号 ' + ueslessAccounts + ' 可能已过期。</div>';
                        }
                        if(tryAgin.length!=0){
                            var tryOnce = tryAgin.join(", ");
                            ePlatformTips += '<div>Account ' + tryOnce + ' live failed, please try again after a few minutes.</div>';
                            cPlatformTips += '<div>账号 ' + tryOnce + ' 开启直播失败，请稍后重试。</div>';
                        }
                        if (pandaAccounts != "") {
                            var pandaName = pandaAccounts.join(", ");
                            ePlatformTips += '<div>Account ' + pandaName + ' does not have permission to go live on PandaTV.</div>';
                            cPlatformTips += '<div>账号 ' + pandaName + ' 在熊猫TV未开通直播权限。</div>';
                        }
                        if (inkeAccounts != "") {
                            var inkeName = inkeAccounts.join(", ");
                            ePlatformTips += '<div>Account ' + inkeName + ' failed to go live.</div>';
                            cPlatformTips += '<div>账号 ' + inkeName + ' 开启直播失败。</div>';
                        }
                        fn_switchLangAlertTip(ePlatformTips, cPlatformTips);
                        $(".pushing").find(".loading").fadeOut();
                    }
                    if (shareDetailParam != "") fn_executeShareStreamUrl(shareDetailParam, rId, data, versionFlag);
                } else {
                    $(".pushing").find(".loading").fadeOut();
                }
            },
            error: function () {
                $(".pushing").find(".loading").fadeIn();
                oUtils.alertTips("i18n_networkUnavailable");
            }
        })
    }
    //获取到url回调
    function fn_executeShareStreamUrl(shareDetailParam, rId, data, thisObj) {
        var obj = '';
        if (data.errorCode == "0X0" || data.errorCode == "0x0") {
            obj = jQuery.parseJSON(data.errorInfo);
        }
        var tempType = [];
        var copierParamArr = [];
        var objsArr = [];
        var livePeerId = $(".main-preview").attr("data-livepeerId")
        $.each(obj, function (idx, item) {
            var objs = {}
            objs.nickName = item.nickName;
            objs.url = item.rtmpUrl;
            objs.type = item.type;
            objsArr.push(objs);
        })
        $.each(obj, function (idx, itm) {
            if (itm.valid == "false") return;
            var obj = {};
            obj.CopierNickName = itm.nickName;
            obj.EncoderIndex = 1;
            obj.RtmpUrl = itm.rtmpUrl;
            obj.CopierType = itm.type;
            obj.LiveModule = "producerPro";
            if (tempType.length > 0) {
                $.each(tempType, function (idx1, elm1) {
                    if (elm1 == obj.CopierType) {
                        return;
                    } else {
                        tempType.push(obj.CopierType);
                    }
                });
            } else {
                tempType.push(obj.CopierType);
            }
            if (obj.CopierType == "F") {
                obj.CopierType = "Facebook"
                obj.RetryTimes = 10;
            } else if (obj.CopierType == "Y") {
                obj.CopierType = "Youtube"
                obj.RetryTimes = 0;
            } else if (obj.CopierType == "I") {
                obj.CopierType = "Inke";
                obj.RetryTimes = 0;
            } else if (obj.CopierType == "P") {
                obj.CopierType = "PandaTV";
                obj.RetryTimes = 0;
            } else if (obj.CopierType == "Z") {
                obj.CopierType = "Yi Live";
                obj.RetryTimes = 0;
            } else if (obj.CopierType == "S") {
                obj.CopierType = "Periscope";
                obj.RetryTimes = 0;
            } else if (obj.CopierType == "O") {
                obj.CopierType = "Others";
                obj.RetryTimes = 0;
            }
            copierParamArr.push(obj);
        });
        startCopierInfo(rId, copierParamArr, livePeerId, shareDetailParam);
    }

    //推流---最后一步
    function startCopierInfo(rId, copierParamArr, livePeerId, shareDetailParam) {
        var param = {
            rid: rId,
            share: ["share"],
            params: JSON.stringify(copierParamArr),
            buildDate: "2017/1/17 16:10",
            encoderIndex: 1,
            livePeerId: livePeerId,
            resolution:"1280x720",
            vBitrate:"2.0M",
            liveModule: "producerPro"
        };
        oUtils.ajaxReq("/producerpro/startStudioFileInfo", param, function (data) {
            if (data.errorCode == "0X0" || data.errorCode == "0x0") {
                var shareDetailArr = [];
                if (shareDetailParam) {
                    $.each(shareDetailParam, function (its, itm) {
                        itm.liveModule = "producerPro";
                        var dataArr = JSON.parse(data.errorInfo);
                        $.each(dataArr, function (itmm) {
                            if (itm.nickName == itmm.copierNickName) itm.encoderIndex = itmm.encoderIndex;
                        });
                        shareDetailArr.push(JSON.stringify(itm));
                        $(".pushing").find("[data-name='" + itm.nickName + "']").children(".icon-socialMeida").addClass("active"); //图标激活
                        $(".pushing").find("[data-name='" + itm.nickName + "']").find(".shareCircle").css("display", "inline-block"); //出现红点
                        $(".Push_toAccount_comment .gridShow").after($(".Push_toAccount_comment").find("[data-name='" + itm.nickName + "']")); //移动最前面就好了
                    });
                }
                var param = { shareDetail: shareDetailArr };
                oUtils.ajaxReq("/producerpro/saveShareDetail", param);

                $(".pushing").find(".block").parents(".shareIcon").removeClass("bgGreen");
                $(".pushing").find(".block").removeClass("block selectAllBg");
            }

            $(".pushing").find(".loading").fadeOut();
        }, null, null, function () {
            $(".pushing").find(".loading").fadeOut();
        });
    }

    //停止推流
    function stopCopierInfo() {
        var rId = $(".main-rList .rList-show").attr("data-peerId"),
            liveVideoId = $(".main-preview").attr("data-livepeerId");
        var shareNickname = $(".push-foot .push-stop").parents(".push-foot").siblings(".Push_toAccount_comment").find(".block").parents(".shareIcon").find(".icon-socialMeida.active").parents(".shareIcon").find(".shareNickName");
        var selectAccountNum = $(".push-foot .push-stop").parents(".push-foot").siblings(".Push_toAccount_comment").find(".block").parents(".shareIcon").find(".icon-socialMeida.active").parents(".shareIcon").length;
        var curNum = $(".main-output .shareCounts").html() - 0;
        var selectAccountEles = $(".pushing").find(".Push_toAccount_comment .block");
        var encoderindex = selectAccountNum < curNum ? "" : "1";
        var nicknameArr = [],stopShareArr = [];
        $.each(selectAccountEles, function (idx, itm) {
            nicknameArr.push($(itm).attr("data-value"));
        });

        if (selectAccountNum < curNum) {
            $.each(shareNickname, function (index, el) {
                var obj = {};
                obj.CopierNickName = obj.CopierNickName = $(el).parents(".shareIcon").attr("data-nickname");
                obj.EncoderIndex = 1;
                stopShareArr.push(obj);
            });
        } else {
            var obj = {};
            $.each(shareNickname, function (index, el) {
                obj.CopierNickName = [$(el).parents(".shareIcon").attr("data-nickname")];
            });
            obj.EncoderIndex = 1;
            stopShareArr.push(obj);
        }
        var param = {
            rid: rId,
            buildDate: "2017/1/17 16:10",
            params: JSON.stringify(stopShareArr),
            nickNameArr: nicknameArr,
            encoderIndex: encoderindex,
            liveVideoId: liveVideoId
        }

        oUtils.ajaxReq("/producerpro/stopStudioFileInfo", param, function (data) {
            var errorCode = data.errorCode;
            if (errorCode == "0X0" || errorCode == "0x0") {
                $(".Push_toAccount_comment").find(".block").parents(".shareIcon").children(".icon-socialMeida").removeClass("active");
                $(".Push_toAccount_comment").find(".block").parents(".shareIcon").removeClass("bgRed").find(".shareCircle").hide();
                $(".Push_toAccount_comment").find(".block").removeClass("block selectAllBg");
                if(!$(".shareIcon").find(".icon-socialMeida").hasClass("active")&& $(".Push_toAccount_comment").find(".bgRed").length==0){
                    $(".push-live").removeClass('openLive');
                    $(".push-stop").addClass('hide');
                }
            } else {
                oUtils.alertTips("i18n_stopShareFailed");
            }
        });
    }
    /* 添加页面多推流代码 end*/
})($,oUtils,switchLangObj);