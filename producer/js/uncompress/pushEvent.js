var pushAbout= (function($,oUtils,switchLangObj,CryptoJS,facebookpushapi,pushAbout){
    var pushEventDom = {
        ancestorparent:".previewModule-control",
        parentDom:".share2Platform",
        pushBtnDom:" .publish",
        pushDetailDom:"#detailPush",
        addExtSourceType:"#addExtSource_sourceTypeList",
        addExtSource:"#addShareSource",
        pushCount:"form.pushCount",
        addCountFlag:true,
        newAccountSaved:true,
    }
    var commonObj = {//获取一些绑定参数
        buildDate:"2018/04/27 12:45:00",
        livepeerid:$("#showRVideo-liveOutputModule").attr("data-livepeerid"),
        rId:$("#showRVideo-liveOutputModule").attr("data-id"),
        liveModule:"",
        ylWaitInterval:"",
    }
    var pushEvent = {
        eventInit:function(){
            this.pushButton();
            this.reauthCancel();
            this.reauthCount();
            this.showOrHidePlatfrom();
            // this.pushMoreBtn();
            this.pushDetailBtn();
            this.pushReauth();
            this.pushReauthYizhibo();
            this.selectEvent();
            this.selectPlatfrom();
            this.selectYouTube();
            this.selectResolutionAndBitrate();
        },
        pushButton:function(){
            $(pushEventDom.parentDom).on("click",pushEventDom.pushBtnDom,function(){
                var oLiObj =  $(this).parents("li");
                commonObj.livepeerid=$("#showRVideo-liveOutputModule").attr("data-livepeerid");
                commonObj.rId=$("#showRVideo-liveOutputModule").attr("data-id").toLowerCase();
                var nickName = oLiObj.attr("data-nickName");
                if($(this).hasClass("green-block-button")){
                    var params = {
                        rId:commonObj.rId,
                        nickName:nickName
                    }
                    pushAboutReq.queryRtmpurl(params);
                }else{
                    var obj = {
                        CopierNickName:oLiObj.attr("data-nickName"),
                        EncoderIndex:"1",
                    }
                    var param = {
                        rid:commonObj.rId,
                        buildDate:commonObj.buildDate,
                        params:JSON.stringify([obj]),
                        nickNameArr:nickName,
                        liveVideoId:commonObj.livepeerid
                    }
                    oUtils.ajaxReq("/producerpro/stopSoicalFileInfo.action",param,function(data){
                        var errorCode=data.errorCode;
                        if(errorCode=="0X0"||errorCode=="0x0"){
                            // $(".shareFbtn").removeClass("red-block-button").addClass("green-block-button").html(switchLangObj.i18n_live);
                            oLiObj.find(".publish").html(switchLangObj.i18n_publish);
                            oLiObj.find(".publish").removeClass("red-block-button").addClass("green-block-button");
                            // $(".shareFbtn").removeClass("red-block-button").addClass("green-block-button")
                            // $("#slider-verticalDelay").slider("enable");
                            // $(".liveVideoDelay").removeAttr("disabled");
                        }else{
                            oUtils.alertTips("i18n_stopShareFailed");
                        }
                     });
                    //如果是Perscope平台还要在发一个请求
                    if (oLiObj.attr("data-type") == "p") {
                        var perisope = [];
                        perisope.push(shareNickname);
                        oUtils.ajaxReq("/producerpro/stopPeriscopeBroadcast.action",{'shareDetail':perisope});
                    }
                }  
            })
        },
        // pushMoreBtn:function(){
        //     $(pushEventDom.parentDom).on("click",".detail-push",function(){
        //         $("#detailPush").css("display","none");
        //         var oLiObj = $(this).parents("li");
        //         var type = oLiObj.attr("data-type");
        //         var html = pushAbout.getDetialPushInfo(type);
        //         // 获取需要的参数
        //         var userInfoObj = pushAboutInfo._getAccountInfo(type);
        //         userInfoObj = pushAboutInfo._getAttrs(oLiObj,userInfoObj);
        //         // facebook走现有的逻辑
        //         if(userInfoObj.type=="F"){
        //             $("#showAccountipients").val("");
        //             $("#SelectFacebook .re_authenticate").hide();
        //             $("#SelectFacebook .selectAccount").hide();
        //             $("#shareWay").hide();
        //             $(".pageList").hide();
        //             $("#shareTo").createSimulateSelect(pageOrTimelin,getPageId,"val", "text");
        //             $("#shareTo").show();
        //             $("#shareTo").addClass("disabled");
        //             $("#SelectFacebook .popupContent_content").show();
        //             $("#SelectFacebook .appId_Module").hide();
        //             $("#SelectFacebook .change_authenticate").hide();
        //             $("#authenticateInput").show();
        //             $("#SelectFacebook .fb_login").hide();
        //             $("#SelectFacebook .username_display").show();
        //             $("#SelectFacebook").attr("data-userid",userInfoObj.id)
        //             $("#SelectFacebook").attr("data-rid",$("#showRVideo-liveOutputModule").attr("data-id"));
        //             nickNameList=[userInfoObj.nickName];
        //             $("#showAccountipients").val(userInfoObj.nickName);
        //             $("#authenticateInput").val(userInfoObj.username);
        //             showPopupBox($("#SelectFacebook"),$("#bgFilter"));
        //             return;
        //         }
        //         // 获取到相应的html
        //         $("#detailPush .detail-info").html(html);
        //         pushAboutInfo._setAttrs($("#detailPush"),userInfoObj);
        //         // 绑定相应的信息
        //         pushAboutInfo._setPushCountInfo($("#detailPush"),userInfoObj);
        //         $("#detailPush").css("display","block");
        //         $("#detailPush .panda-auth").css("display","none");
        //     })
        // },
        pushDetailBtn:function(){
            $(pushEventDom.pushDetailDom).on("click",".pushDetailbtn",function(){
                var domObj = $(pushEventDom.pushDetailDom);
                // 获取参数
                var params = pushAboutInfo._getDetailPushParam(domObj.attr("data-type"),domObj);
                var resolutionValue= $("#detailPush").find(".resolutionTypeList").attr("data-value");
                var Bitrate = $("#detailPush").find(".BitrateTypeList .dropdownDefault_value").text();
                var position=Bitrate.indexOf("b");
                Bitrate=Bitrate.slice(0, position);
                var resolutionAndeBitrat=resolutionValue+"&"+Bitrate;
                params["resolution"]=resolutionValue;
                params["vBitrate"]=Bitrate;
                if(statusObj.resolutionArray.length>=3&&statusObj.resolutionArray.indexOf(resolutionAndeBitrat)<0){
                    oUtils.alertTips("i18n_selectResolution",2000);
                    return;
                } 
                if(domObj.attr("data-type")=="Y"){
                    if(domObj.find(".pushDetailbtn").attr("data-youtube")==undefined){
                        oUtils.alertTips("i18n_producerReauthTitle",2000);
                        return false;
                    } 
                }
                if(domObj.attr("data-type")=="F"){
                    var timestamp=new Date().getTime();
                    var appointment= $("#expired-date").val();
                    appointment!="" && appointment!= undefined? appointment=new Date(appointment).getTime():appointment="";
                    if( appointment!="" && appointment!= undefined){
                        if(appointment-timestamp<=600000||appointment-timestamp>604800000){
                            oUtils.alertTips("i18n_appointment",3000);
                            return false;
                        }
                    }
                }
                $(pushEventDom.pushDetailDom+" .pushDetailbtn").css("display","none");
                $(pushEventDom.pushDetailDom+" .loading").css("display","inline-block");
                
                //此处要分开了，如果为一直播，并且验证码是显示的
                if($(pushEventDom.pushDetailDom + " .yiLive-mobile").css("display")=="block"){
                    //获取手机号，验证码
                    var phoneNumber = $("#detailPush .yiLive-mobile input").val();
                    var messageCode = $("#detailPush .yiLive-message input").val();
                    pushAboutReq.saveYizhibo(phoneNumber,messageCode,params,pushAboutReq.saveRtmpDetailReq);
                    return;
                }
                pushAboutReq.saveRtmpDetailReq(params);
            })
        },
        showOrHidePlatfrom:function(){
            // 鼠标移入显示直播平台
             $(pushEventDom.parentDom).on("mouseenter",".pack-source-list",function(){
                 var thisObj = $(this);
                 $(".share2Platform .select-live-platform").css("display","block");
                 return false;
             });
             $(pushEventDom.ancestorparent).on("mouseleave",function(){
                 var thisObj = $(this);
                 thisObj.find(".select-live-platform").css("display","none");
                 return false;
             });
        },
        reauthCount:function(){
            $(document.body).on("click",".reauthenticate .reauthen",function(){
                var reauthenObj = $(this).parents(".reauthenticate");
                var nickName = reauthenObj.attr("data-nickName");
                var reauthenObj = $(".select-live-platform .live-platform li[data-nickName='"+nickName+"']");
                var obj = {
                    nickName:'',
                    id:"",
                    type:"",
                    token:"",
                    description:"",
                    username:"",
                    title:"",
                    rtmpId:"",
                    appId:"",
                    refreshAccessToken:"",
                    should_not_tweet:"",
                }
                obj = pushAboutInfo._getAttrs(reauthenObj,obj);
                pushEvent.showReauth(obj);
                $(".reauthenticate").remove();
            })
        },
        reauthCancel:function(){
            $(document.body).on("click",".reauthenticate .cancel",function(){
                $(".reauthenticate").remove();
            })
        },
        pushReauth:function(){
            $(pushEventDom.pushCount).on("click",".panda-login .panda-auth-btn",function(){
                // 获取类型
                var type = $(this).parents(pushEventDom.pushCount).attr("data-type");
                if(type=="Y"){
                    var EditType=$(this).parents(pushEventDom.pushCount).attr("id");
                    if(EditType=="addShareSource"){
                        pushAboutReq.goReauth(type,"#addShareSource"); 
                    }else{
                        pushAboutReq.goReauth(type,"#detailPush");
                    }
                }
                // 根据类型去认证
                pushAboutReq.goReauth(type);
            });
            $(pushEventDom.pushCount).on("click",".popupContent_closeBtn,.cancel",function(){
                clearInterval(pushAboutReq.gePeriscopeTimer);
                clearInterval(pushAboutReq.getPandaAccountsTimer); 
                clearInterval(pushAboutReq.getYouTubeTimer);
                $("#expired-date").datetimepicker('remove');
            })
        },
        selectEvent:function(){
            $(".popupContent_content").on("click",".InkePlay-checkbox",function(){
                var thisObj = $(this);
                if(thisObj.hasClass("active")){
                    thisObj.removeClass("active");
                }else{
                    thisObj.addClass("active");
                }
            });
        },
        selectPlatfrom:function(){
            $(pushEventDom.pushCount).on("keyup","input",function(){
                return false;
            });
            $(".pushing").on("click",function(){
                return false;
            })
            $(".Push_toAccount_comment").on("click",".shareIcon",function(e){
                $("#girdUrlShow").css("display","none");
                var thisObj = $(this);
                var select = thisObj.children(".selectPosition").children(".dropdown_option_item");
                $(".pushAlertTips").fadeIn(1000);
                
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
                    pushEvent.showDetailPush(thisObj);
                    if(select.hasClass("block")){
                        select.removeClass("block");
                        thisObj.removeClass("bgGreen");
                    } else {
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
        },
        selectResolutionAndBitrate:function(){
            var resolutionList = [{name:"1280x720",type:"1280x720"},{name:"1920x1080",type:"1920x1080"},{name:"NTSC",type:"720x480"},{name:"PAL",type:"720x576"}];
            $(".resolutionTypeList").createSimulateSelect(resolutionList,"","type","name");
            var bitrateList=[{name:"2.0Mbps",type:"2.0"},{name:"12.0Mbps",type:"12.0"},{name:"2.5Mbps",type:"2.5"},{name:"1.5Mbps",type:"1.5"},{name:"750Kbps",type:"750"},{name:"400Kbps",type:"400"}];
            $(".BitrateTypeList").createSimulateSelect(bitrateList,"","type","name");
        },
        showDetailPush:function(thisObj){
            if(thisObj.find(".detialPush").length<=0)return; 
                var type = thisObj.attr("data-type");
                var html = pushAbout.getDetialPushInfo(type);
                var userInfoObj = pushAboutInfo._getAccountInfo(type);
                $(".pushDetailbtn").val(switchLangObj.i18n_publish);
                userInfoObj = pushAboutInfo._getAttrs(thisObj,userInfoObj);
                // 获取到相应的html
                $("#detailPush .detail-info").html(html);
                $("#expired-date").datetimepicker({
                    weekStart: 1,
                    todayBtn:  1,
                    autoclose: 1,
                    todayHighlight: 1,
                    startView: 2,
                    bootcssVer:3,
                    forceParse: 0,
                    pickerPosition: "bottom-left",
                    startDate:new Date()
                });

                var flag = true;
                if(userInfoObj.token!=""){
                   if(type!=="S"){
                        userInfoObj.token = pushAbout.getDAesString(userInfoObj.token,pushAbout.pwd_2,pushAbout.iv_2);
                        userInfoObj.token = pushAbout.getDAesString(userInfoObj.token,pushAbout.pwd_1,pushAbout.iv_1);
                    } 
                }else{
                    flag = false;
                }
                
                pushAboutInfo._setAttrs($("#detailPush"),userInfoObj);
                if(type=="F"){
                    var privacy_active = {title:switchLangObj.i18n_privacy,radio:[{val:"EVERYONE","text":switchLangObj.i18n_public},{val:"ALL_FRIENDS","text":switchLangObj.i18n_friends},{val:"SELF","text":switchLangObj.i18n_only_me}]};
                    var type_active = {title:switchLangObj.i18n_type,radio:[{val:"REGULAR","text":switchLangObj.i18n_regular},{val:"AMBIENT","text":switchLangObj.i18n_continuous}]};
                    var pageOrTimelin = {radio:[{"val":"Timeline"},{"val":"Page"}]};
                    $("#shareTo").createSimulateSelect(pageOrTimelin,facebookpushapi.getPageId,"val", "text");
                    $("#privacy_active").createSelectedOptionList(privacy_active,null,"val","text");
                    $("#type_active").createSelectedOptionList(type_active,null,"val","text","",true);
                    $("#expireTimeBox #expired-date").val(thisObj.attr("data-startTime"));
                    facebookpushapi.checkPage();
                }
                if(type=="Y"){
                    $(".detail-info .others-website").removeClass('hide');
                    var websites = [{name:"YouTube",type:"Y"}];
                    $(pushEventDom.pushDetailDom).find("#youtube-sourceTypeList").createSimulateSelect(websites,"","type","name");
                    $("#detailPush #youtube-sourceTypeList").find(".dropdownDefault").css("cursor","not-allowed");
                }
                if(type=="O"||type=="Y"){
                    $("#detailPush .push-title").addClass("hide");
                }else{
                    $("#detailPush .push-title").removeClass("hide");
                }

                // 绑定相应的信息
                pushAboutInfo._setPushCountInfo($("#detailPush"),userInfoObj);
                $("#detailPush").css("display","block");
                $("#detailPush .panda-auth").css("display","none");
                if(type=="Y"){
                    var account= $("#detailPush .push-nickname").val();
                    var param={account:account};
                    oUtils.ajaxReq("/producerpro/checkYoutueAuth",param,function(data){
                        var errorCode=data.errorCode;
                        if(errorCode!="0x0"){
                           $("#detailPush .panda-auth").css("display","block");
                           oUtils.alertTips("i18n_producerReauthTitle",2000);
                        }else{
                            $("#detailPush .pushDetailbtn").attr("data-youtube",true);
                        }
                    });
                }
                if(flag){
                    if(type=="F"||type=="S"||type=="P"){
                        $(pushEventDom.pushCount+" .panda-auth").show();
                        $(pushEventDom.pushCount+" .panda-login").hide();
                        $(pushEventDom.pushCount+" .panda-nickname").show();
                        $(pushEventDom.pushCount+" .panda-nickname input").val(userInfoObj.username);
                    }
                }else{
                    if(type=="F"||type=="S"||type=="P"){
                        $(pushEventDom.pushCount+" .panda-auth").show();
                        $(pushEventDom.pushCount+" .panda-login").show();
                        $(pushEventDom.pushCount+" .panda-nickname").hide();
                        $(pushEventDom.pushCount+" .panda-nickname input").val("");
                    }
                }
                $(".pushing").addClass("hide");
                $(pushEventDom.pushDetailDom+" .pushDetailbtn").css("display","inline-block");
                $(pushEventDom.pushDetailDom+" .loading").css("display","none");
                return false;
        },
        selectYouTube:function(){
            $("#detailPush").on("click"," #youtube-sourceTypeList .dropdownDefault",function(){
               $("#detailPush").find('#youtube-sourceTypeList .dropdown_menu').css("display","none");
            });
        },
        pushReauthYizhibo:function(){
            $(pushEventDom.pushCount).on("click",".yl-input-mobile a",function(){
                var thisObj = $(this);
                pushEvent.getMesYizhibo(thisObj);
            });
        },
        getMesYizhibo:function(obj){
            var thisObj=obj;
            if(!thisObj.hasClass("wait")){
                var phoneNumber = thisObj.prev().val();
                //验证手机号码格式
                if(!(/^1[34578]\d{9}$/.test(phoneNumber))){
                    oUtils.alertTips("i18n_wrongPhoneNumber",2000);
                    return;
                }
                //发送验证码
                oUtils.ajaxReq("/producerpro/sendSms.action",{"mobile":phoneNumber},function(data){
                    if(data.errorCode!="0x0"){
                        if(data.errorInfo.indexOf("没有开播权限")!=-1){
                            oUtils.alertTips("i18n_ylNoPower");
                        }else if(data.errorInfo.indexOf("未注册用户")!=-1){
                            oUtils.alertTips("i18n_ylNoRegister");
                        }else if(data.errorInfo.indexOf("请求超限")!=-1){
                            oUtils.alertTips("i18n_ylRequestFrequently");
                        }else if(data.errorInfo.indexOf("禁止发起直播")!=-1){
                            oUtils.alertTips("i18n_accountBanned");
                        }else if(data.errorInfo.indexOf("24小时内发送短信")!=-1){
                            oUtils.alertTips("i18n_messageTooMuch");
                        }
                    }
                });

                //两分钟以内不准再次发送验证码
                var waitTime = 119;
                commonObj.ylWaitInterval = setInterval(function(){
                    var wait = waitTime+"s";
                    thisObj.addClass("wait").html(wait);
                    waitTime--;
                    if(waitTime < 0){
                        clearInterval(commonObj.ylWaitInterval);
                        thisObj.removeClass("wait").html(switchLangObj.i18n_getMessgae);
                    }
                },1000);
            }else{
                return;
            }
        },
        showReauth:function(userInfo){
            var nickName = userInfo.nickName;
            var currentUrl=window.location.host; 
            if(currentUrl.indexOf("cn")>0){
                // var sourceTypeList = [switchLangObj.i18n_YiLive,switchLangObj.i18n_Inke,switchLangObj.i18n_pandaTV,switchLangObj.i18n_Others];
                var sourceTypeList = [switchLangObj.i18n_YiLive,switchLangObj.i18n_Others];
            }else{
                // var sourceTypeList = ["Facebook","YouTube",switchLangObj.i18n_YiLive,switchLangObj.i18n_Inke,switchLangObj.i18n_pandaTV,'Periscope',switchLangObj.i18n_Others];
                var sourceTypeList = ["Facebook","YouTube",switchLangObj.i18n_YiLive,'Periscope',switchLangObj.i18n_Others];
            }
            $("#addExtSource_sourceTypeList1").createSimulateSelect(sourceTypeList);
            showPopupBox($("#editShareSource"),true);
            var id = userInfo.id;
            var type = userInfo.type;
            var rtmpId = userInfo.rtmpId;
            var token = userInfo.token;
            var plateform = pushAboutInfo._getCopierType(userInfo.type);
            var description = userInfo.description;
            var username = userInfo.username;
            var title = userInfo.title;
            var appId = userInfo.appId;
            var refreshaccesstoken = userInfo.refreshAccessToken;
            var should_not_tweet = userInfo.should_not_tweet;
            var isActive = description==="1"?"active":"";
            $("#editShareSource").find("#facebook_appKey").val(token);
            $("#addExtSource_sourceTypeList1").addClass("disabled");
            $("#editShareSource").attr("data-sourceId",id);
            $("#addExtSource_sourceNames").val(nickName);
            $("#editShareSource").find(".nickName").attr("data-name",nickName);
            $(".eitItem").hide();

            //重置一直播短信按钮状态
            $("#editShareSource .yiLive-mobile a").removeClass("wait").html(switchLangObj.i18n_getMessgae);
            resetCheckMessage($("#editShareSource .yiLive-item .countdown"));
            switch(type) {
                case "F":
                        $("#addExtSource_sourceTypeList1").find(".dropdownDefault_value").attr("title","facebook").html("Facebook");
                        $(".eit-fb-item").show();
                        if(appId){
                            $(".eit_fb_oldversion").removeClass("hide");
                            $(".eit_fb_newversion").addClass("hide");
                            $("#eitVersion .selecet_option_item").eq(0).removeClass("active");
                            $("#eitVersion .selecet_option_item").eq(1).addClass("active");
                            $("#edit_appId").val(appId);
                            $("#edit_userId").val(rtmpId);
                            $("#edit_token").val(token);
                            $("#edit_eye_token").val(token);
                        }else{
                            $(".eit_fb_newversion").removeClass("hide");
                            $(".eit_fb_oldversion").addClass("hide");
                            $("#eitVersion .selecet_option_item").eq(1).removeClass("active");
                            $("#eitVersion .selecet_option_item").eq(0).addClass("active");         
                            if(username){
                                $(".eit-fb-item .eit-fb-login").addClass("hide");
                                $(".eit-fb-item .fb-nickname").removeClass("hide");
                                $(".eit-fb-item .fb-nickname input").val(username);
                                $(".eit-fb-item .fb-nickname input").attr("user-id",rtmpId);
                                $(".eit-fb-item .fb-nickname input").attr("access-token",token);
                            }else{
                                $(".eit-fb-item .fb-nickname").addClass("hide");
                                $(".eit-fb-item .eit-fb-login").removeClass("hide");
                            }
                        }
                        break;
                case "Y":
                        $(".eit-yt-item").show();
                        $("#addExtSource_sourceTypeList1").find(".dropdownDefault_value").attr("title","youtube").html("YouTube");
                        $("#sourceUrl").val(rtmpId);
                        $("#sorce_token").val(token);
                        break;
                case "I":
                        $(".eit-inke-item").show();
                        $("#addExtSource_sourceTypeList1").find(".dropdownDefault_value").attr("title",switchLangObj.i18n_Inke).html(switchLangObj.i18n_Inke);
                        $("#eitInkeId").val(rtmpId);
                        $(".eitItem .InkePlay-checkbox").addClass(isActive);
                        break;
                // case "P":
                //         $("#addExtSource_sourceTypeList1").find(".dropdownDefault_value").attr("title",switchLangObj.i18n_pandaTV).html(switchLangObj.i18n_pandaTV);
                //         $(".eit-pandaTV-item").show();
                //         $(".eit-pandaTV-item .panda-nickname input").val(username);
                //         break;
                case "Z":
                        $(".eit-yl-item").show();
                        $("#addExtSource_sourceTypeList1").find(".dropdownDefault_value").attr("title",switchLangObj.i18n_YiLive).html(switchLangObj.i18n_YiLive);
                        $("#editShareSource .yiLive-title input").val(title);
                        $(".eitItem .InkePlay-checkbox").addClass(isActive);
                        if(token){
                            $(".eit-yl-item .eit-yl-login").addClass("hide");
                            $(".eit-yl-item .yl-nickname").removeClass("hide");
                            $("#editShareSource .yiLive-account input").val(username).attr({"readonly":true,"data-token":token,"data-rtmpId":rtmpId});
                        }else{
                            $(".eit-yl-item .yl-nickname").addClass("hide");
                            $(".eit-yl-item .eit-yl-login").removeClass("hide");
                        }
                        break;
                case "S":
                        $("#addExtSource_sourceTypeList1").find(".dropdownDefault_value").attr("title",'Periscope').html('Periscope');
                        $("#editShareSource .eit-periscope .popup_item_value").val(title);
                        $("#editShareSource .eit-periscope .popup_item_value").attr("data-token",token);
                        $("#editShareSource .eit-periscope .popup_item_value").attr("data-refreshaccesstoken",refreshaccesstoken);
                        $("#editShareSource .eit-periscope .periscope-rauth").css("display","block");
                        $("#editShareSource .eit-periscope .panda-nickname input").val(username);
                        if(should_not_tweet=="0"){
                            $("#editShareSource .eit-periscope .InkePlay-checkbox").addClass("active");
                        }else{
                            $("#editShareSource .eit-periscope .InkePlay-checkbox").removeClass("active");  
                        }
                        $(".eit-periscope").show();
                        // $(".eit-inke-item").show();
                        break;
                case "O":
                        $(".eit-others-item").show();
                        $("#addExtSource_sourceTypeList1").find(".dropdownDefault_value").attr("title",switchLangObj.i18n_Others).html(switchLangObj.i18n_Others);
                        $("#editShareSource .others-rtmp input").val(rtmpId);
                        $(".eitItem .InkePlay-checkbox").addClass(isActive);
                        break;
            }
        }
    };
    var createCount = {
        eventInit:function(){
            this.selPushPlatfrom();
            this.saveCountbtn();
            facebookpushapi.pushFaceBook();
        },
        selPushPlatfrom:function(){
            $(pushEventDom.addExtSourceType).on("click",".dropdown_option",function(){
                var type = $(this).find("a").attr("data-value");
                $(this).parents("form").attr("data-type",type);
                var showReauth = ["F",'P',"S","Y"];
                showReauth.indexOf(type)!=-1?$(pushEventDom.addExtSource+" .panda-auth").show():$(pushEventDom.addExtSource+" .panda-auth").hide();
                var html = pushAbout.getDetialPushInfo(type);
                $(pushEventDom.pushCount+" .panda-login").show();
                $(pushEventDom.pushCount+" .panda-nickname").hide();
                $(pushEventDom.addExtSource+" .detail-info").html(html);
            });
            $(".pushing .addCount").on("click",function(){
                if(!mix_fn.isPrower("AddSocial")) return false;
                if(pushEventDom.addCountFlag==false)return;
                $("#girdUrlShow").css("display","none");
                if(pushEventDom.addCountFlag){
                    pushEventDom.addCountFlag=false;
                    if($(pushEventDom.pushCount).find(".pushDetailbtn").attr("data-youtube")||$("#addShareSource").find(".add-count").attr("data-youtube")){
                       $(pushEventDom.pushCount).find(".pushDetailbtn").removeAttr("data-youtube");
                       $("#addShareSource").find(".add-count").removeAttr("data-youtube");
                    }
                    $(pushEventDom.pushCount).css("display","none");
                    var currentUrl=window.location.host; 
                    if(currentUrl.indexOf("cn")>0){
                        // var website = [{name:switchLangObj.i18n_YiLive,type:"Z"},{name:switchLangObj.i18n_pandaTV,type:"P"},{name:switchLangObj.i18n_Others,type:"O"}];
                        var website = [{name:switchLangObj.i18n_YiLive,type:"Z"},{name:switchLangObj.i18n_Others,type:"O"}];
                    }else{
                        // var website = [{name:"Facebook",type:"F"},{name:"Periscope",type:"S"},{name:switchLangObj.i18n_YiLive,type:"Z"},{name:switchLangObj.i18n_pandaTV,type:"P"},{name:"YouTube",type:"Y"},{name:switchLangObj.i18n_Others,type:"O"}];
                        var website = [{name:"Facebook",type:"F"},{name:"Periscope",type:"S"},{name:switchLangObj.i18n_YiLive,type:"Z"},{name:"YouTube",type:"Y"},{name:switchLangObj.i18n_Others,type:"O"}];
                    }
                    $(pushEventDom.addExtSourceType).createSimulateSelect(website,"","type","name");
                    $(pushEventDom.addExtSourceType).parents("form").attr("data-type", $(pushEventDom.addExtSourceType).attr("data-value"))
                    $("#addShareSource").fadeIn();
                    $("#addShareSource").attr("data-token","");
                    $("#addShareSource .add-count").val(switchLangObj.i18n_save);
                    $("#addShareSource .push-nickname").val("");
                    $(pushEventDom.pushCount).attr("data-refreshaccesstoken","");
                    $(pushEventDom.pushCount).attr("data-data-token","");
                    $(pushEventDom.pushCount+" .panda-auth").show();
                    $(pushEventDom.pushCount+" .panda-login").show();
                    $(pushEventDom.pushCount+" .panda-nickname").hide();
                    var type = $(pushEventDom.addExtSource).attr("data-type");
                    var html = pushAbout.getDetialPushInfo(type);
                    $(pushEventDom.addExtSource+" .detail-info").html(html);
                }
                var addCountStatus=setTimeout(function(){
                    pushEventDom.addCountFlag=true;
                },300);    
            });
            $(pushEventDom.pushCount+" .cancel").on("click",function(){
                $(this).parents(pushEventDom.pushCount).fadeOut();
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
                    pushAboutReq.deleteCountReq(nickNames);
                }); 
            });
        },
        saveCountbtn:function(){
            $("#addShareSource .add-count").on("click",function(){
                // 获取类型
                var obj = $(this).parents("form");
                var type = obj.attr("data-type");
                var params = pushAboutInfo._getDetailPushParam(type,obj);
                console.log(params);
                var flag = createCount.saveCountTest(params);
                if(type=="Z"&&flag){
                    //获取手机号，验证码
                    var phoneNumber = $("#addShareSource .yiLive-mobile input").val();
                    var messageCode = $("#addShareSource .yiLive-message input").val();
                    pushAboutReq.saveYizhibo(phoneNumber,messageCode,params,pushAboutReq.saveCountReq);
                    return;
                }
                if(flag) pushAboutReq.saveCountReq(params);
            });
        },
        saveCountTest:function(params){
            var reg=/^.{1,32}$/;
            //昵称不能为空
            if(!params.nickName) {
                oUtils.alertTips("i18n_nickNameNoEmpty",2000);
                return false;
            }else if(!reg.test(params.nickName)){
                oUtils.alertTips("i18n_nikeNameLength1to32");
                return false;
            }else if(params.nickName.toLowerCase()==="null"){
                oUtils.alertTips("i18n_IllegalOutputname");
                return false;
            }else if(params.nickName.indexOf(",")>-1||params.nickName.indexOf("%")>-1||params.nickName.indexOf("'")>-1){
                oUtils.alertTips("i18n_OutputNameSupport");
                return false;
            }
            switch(params.type) {
                case "S":
                    if(!params.key||!params.refreshAccessToken){
                        oUtils.alertTips("i18n_PeriscopeNoAuth",2000);
                        return false;
                    }
                    break;
                case "F": 
                    if(!params.key){
                        oUtils.alertTips("i18n_accessTokenNoEmpty",2000);
                        return false;
                    }
                    break;
                case "O":
                    if(!params.rtmpId){
                        oUtils.alertTips("i18n_othersRtmp",2000);
                        return false;
                    }
                    break;
                case "Y":
                    var authAdd=$("#addShareSource").find(".add-count").attr("data-youtube");
                    if(authAdd==undefined){
                        oUtils.alertTips("i18n_youTuBeIsAuthor",2000);
                        return false;
                    } 
                    break;
            }
            return true;
        }

    }
    var pushAboutReq = {
        saveCountReq:function(params){
            $.ajax({
            type: "POST",
            url: "/producerpro/queryShareDetailByNickName",
            data: {nickName: params.nickName},
            timeout: 7000,
            success: function(reslut){ //判断是否已存在
                    var  reslut=$.parseJSON(reslut);
                    if(reslut.errorCode == "0x0"){
                        oUtils.alertTips("i18n_nickNameExist",2000);
                    }else{
                        oUtils.ajaxReq("/producerpro/saveRtmpDetail",params,function(data){
                            if(data.errorCode=="0x0"){
                                $("#addShareSource").fadeOut();
                                fn_getAllShareAccount();
                                $(pushEventDom.pushCount+" .panda-login").hide();
                                $(pushEventDom.pushCount+" .panda-nickname").show();
                            }else if(data.errorCode=="400"||data.errorCode=="403"||data.errorCode=="0x80400002"||data.errorCode=="0x80400003"){
                                oUtils.alertTips("i18n_FacebookTryagin",1500);
                                $(pushEventDom.pushCount+" .panda-login").show();
                                $(pushEventDom.pushCount+" .panda-nickname").hide();
                                $(pushEventDom.pushDetailDom+" .pushDetailbtn").css("display","inline-block");
                                $(pushEventDom.pushDetailDom+" .loading").css("display","none");
                            }else if(data.errorCode=="0x80100001"||"0x80400001"){
                                oUtils.alertTips("i18n_inputInfo",2000);
                            }
                        });
                    } 
                }
            });    
        },
        deleteCountReq:function(params){
            params = {
                "nickName":params
            }
            oUtils.ajaxReq("deleteShareDetail",params,function(data){
                if(data.errorCode=="0x0"){
                    $(pushEventDom.pushCount).fadeOut();
                    fn_getAllShareAccount();
                }
            });
        },
        saveRtmpDetailReq:function(params){
            var resolution=params.Resolution;
            oUtils.ajaxReq("/producerpro/saveRtmpDetail",params,function(data){
                if(data.errorCode=="0x0"){
                    commonObj.buildDate=commonObj.buildDate;
                    commonObj.livepeerid=$(".main-preview").attr("data-livepeerid");
                    commonObj.rId=$(".preview-content .preview-item[data-filename='Default']").attr("data-rid").toLowerCase();
                    var param = {
                        rId:commonObj.rId,
                        nickName:params.nickName,
                    }
                    if(params.type=="F"){
                        param.destination=params.destination;
                        param.pageId=params.pageId;
                        param.pageAccessToken=params.pageAccessToken;
                        $(pushEventDom.pushDetailDom+" .pushDetailbtn").css("display","inline-block");
                        $(pushEventDom.pushDetailDom+" .loading").css("display","none");
                        $(pushEventDom.pushDetailDom).hide();
                        if(params.startTime!="") return false;
                    }
                    pushAboutReq.queryRtmpurl(param);
                }
            });
        },
        getPandaAccountsTimer:'',
        gePeriscopeTimer:"",
        getYouTubeTimer:"",
        goReauth:function(type,flag){
            switch(type){
                // case "P":
                //     var timeStamp = new Date().getTime()+"";
                //     var pandaUrl = "https://open.panda.tv/oauth/authorize?client_id=tvu&redirect_uri=http://"+window.location.host+"/producerpro/outInterf?key="+timeStamp+"&_plat=pc_web&response_type=code&state=1FJCsFzBDAyyXsFtquwgv#";
                //     var left = (window.outerWidth - 800)/2 + "px";
                //     var pandaTV=window.open(pandaUrl,"熊猫TV","width=800px,height=600px,menubar=no,top=200px,left="+left);
                //     // pandaTV.focus();
                //     var param = {"key":timeStamp};
                //     pushAboutReq.getPandaAccountsTimer = setInterval(function(){
                //         oUtils.ajaxReq("/producerpro/queryPandaInfo",param,function(data){
                //             if(data.errorInfo&&data.errorInfo=="Null record"){
                //                 return;
                //             }else{
                //                 clearInterval(pushAboutReq.getPandaAccountsTimer);
                //                 pandaTV.close();
                //                 $(pushEventDom.pushCount).attr("data-token",data.accessToken);
                //                 $(pushEventDom.pushCount).attr("data-username",data.nickName);
                //                 $(pushEventDom.pushCount+" .panda-login").hide();
                //                 $(pushEventDom.pushCount+" .panda-nickname").show();
                //                 $(pushEventDom.pushCount+" .panda-nickname input").val(data.nickName);
                //             }
                //         });
                //     },1000); 
                //     break;
                case "S":
                	var timeStamp = new Date().getTime()+"";
                    var periscopeUrl = 'https://www.periscope.tv/oauth?client_id=P7mELQ3vvNzS3R2-6ZlcFy0IlyZtLrY_KqZizXvtMahAfELelp&redirect_uri=http://'+window.location.host+'/producerpro/getPeriscopeAccesstoken&state='+timeStamp;
                    var left = (window.outerWidth - 800)/2 + "px";
                    var periscopeTv=window.open(periscopeUrl,"periscope","width=800px,height=600px,menubar=no,top=200px,left="+left);
                    // periscopeTv.focus();
                    var param = {"state":timeStamp};
                    clearInterval(pushAboutReq.gePeriscopeTimer);
                    pushAboutReq.gePeriscopeTimer = setInterval(function(){
                        oUtils.ajaxReq("/producerpro/getUserAccesstoken",param,function(data){
                            // console.log(data);
                            if(data.errorCode!="0x0"){
                                return;
                            }else{
                                clearInterval(pushAboutReq.gePeriscopeTimer);
                                periscopeTv.close();
                                var errorInfo = JSON.parse(data['errorInfo']);
                                $(pushEventDom.pushCount).attr("data-refreshaccesstoken",errorInfo[0]["refresh_token"]);
                                $(pushEventDom.pushCount).attr("data-token",errorInfo[0]["access_token"]);
                                $(pushEventDom.pushCount).attr("data-username",errorInfo[0]["username"]);
                                $(pushEventDom.pushCount+" .panda-login").hide();
                                $(pushEventDom.pushCount+" .panda-nickname").show();
                                $(pushEventDom.pushCount+" .panda-nickname input").val(errorInfo[0]["username"]);
                            }
                        });
                    },3000);
                    break;
                case "F":
                    if($(".fb-auth").length<=0){
                        var isCom = location.href.indexOf(".com")
                        var faceHtml='<div class="fb-auth"><iframe src="https://cc.tvunetworks.'+(isCom>0?'com':'cn')+'/tvucc/fbadapter.html" frameborder="0"></iframe></div>';
                        $("body").append(faceHtml);
                        $(".fb-auth").css("display","block");
                    }else{
                        $(".fb-auth").css("display","block");
                    }   
                    window.addEventListener("message", function( event ) {
                        var contentData = event.data;
                        contentData = JSON.parse(contentData);
                        console.log(contentData);
                        if(!contentData.cancel){
                            $.ajax({
                                type:"POST",
                                url:"/producerpro/getLongToken",
                                data:{
                                    access_token : contentData.access_token
                                },
                                dataType:"json",
                                async: false,
                                timeout:3000,
                                success : function(data) {
                                    if(data.errorCode == "0x0"){
                                        $(".fb-auth").css("display","none");
                                        var datas=data.errorInfo;
                                        var result = $.parseJSON(datas);
                                        var access_token = result.access_token;
                                        $(pushEventDom.pushCount).attr("data-rtmpid",contentData.userId);
                                        $(pushEventDom.pushCount).attr("data-token",access_token);
                                        $(pushEventDom.pushCount).attr("data-username",contentData.username);
                                        $(pushEventDom.pushCount+" .panda-nickname input").val(contentData.username);
                                        $(pushEventDom.pushCount+" .panda-login").hide();
                                        $(pushEventDom.pushCount+" .panda-nickname").show();   
                                    }
                                }
                            });
                            $(".fb-auth").css("display","none");
                        }else{
                            $(".fb-auth").css("display","none");
                        }
                        
                    }, false );
                    // 
                    // if(!window.FB){
                    //     oUtils.alertTips("i18n_facebookBanned");
                    //     return;
                    // }
                    // FB.init({
                    //     appId: '1781228211994386',
                    //     xfbml: true,
                    //     version: 'v3.1'
                    // });
                    // FB.login(function(response) {
                    //     if (response && !response.error_message && response.status == 'connected') {
                    //         var userId = response.authResponse.userID;
                    //         $(pushEventDom.pushCount).attr("data-rtmpid",userId);
                    //         var username;
                    //         FB.api('/me', function(user_response) {
                    //             username = user_response.name;
                    //             var access_token = response.authResponse.accessToken;
                    //             access_token  = pushAboutInfo.getAesString(access_token,pushAboutInfo.pwd_1,pushAboutInfo.iv_1);
                    //             $.ajax({
                    //                 type:"POST",
                    //                 url:"getLongToken",
                    //                 data:{
                    //                     access_token : access_token
                    //                 },
                    //                 dataType:"json",
                    //                 async: false,
                    //                 timeout:3000,
                    //                 success : function(data) {
                    //                     if(data.errorCode == "0x0"){
                    //                         var datas=data.errorInfo;
                    //                         var result = $.parseJSON(datas);
                    //                         var access_token = result.access_token;
                    //                         $(pushEventDom.pushCount).attr("data-token",access_token);
                    //                         $(pushEventDom.pushCount).attr("data-username",username);
                    //                         $(pushEventDom.pushCount+" .panda-login").hide();
                    //                         $(pushEventDom.pushCount+" .panda-nickname").show();
                    //                         $(pushEventDom.pushCount+" .panda-nickname input").val(username);
                    //                     }
                    //                 }
                    //             });
                    //         });
                    //     }
                    // }, {scope: 'publish_video,user_friends,publish_pages,manage_pages'});
                    break;      
                case "Y":
                    var formType = undefined;
                    if(flag=="#detailPush"){
                        formType=$("#detailPush");
                    }else{
                        formType=$("#addShareSource");
                    }
                    pushAboutReq.queryYoutubeAuthor(formType);
            }
        },
        queryYoutubeAuthor:function(formType){
            var account;
            if(formType.attr("id")=="detailPush"){
                account= $("#detailPush").find($(".push-nickname")).val();
            }else{
                account = $("#addShareSource").find($(".push-nickname")).val();
            }
            if (account == null || account == '') {
                oUtils.alertTips("i18n_nickNameNoEmpty", 2000);
                return;
            }
            var left = (window.outerWidth - 800) / 2 + "px";
            var YouTube = window.open("", 'Youtube', "width=800px,height=600px,menubar=no,top=200px,left=" + left);
            var  params={account: account};
            oUtils.ajaxReq("/producerpro/getClientSecret", params, function (data) {
                if (data.errorCode == "0x0" ){
                    var redirectUrl=data.errorInfo.redirectUrl;
                    YouTube.location.href = redirectUrl;
                }
            });
            var param={account: account};
            clearInterval(pushAboutReq.getYouTubeTimer); 
            pushAboutReq.getYouTubeTimer = setInterval(function(){
                oUtils.ajaxReq("/producerpro/checkYoutueAuth",param,function(data){ //判断是否已存在
                    var errorCode=data.errorCode;
                    if(errorCode=="0x0"){
                        clearInterval(pushAboutReq.getYouTubeTimer);
                        oUtils.alertTips("i18n_youTuBeIsAuthorSuccess", 2000);
                        $("#addShareSource").find(".add-count").attr("data-youtube",true);  
                        $("#detailPush").find(".pushDetailbtn").attr("data-youtube",true);
                        YouTube.close();
                        return ; 
                    }
                });
            },2000);
        },
        queryRtmpurl:function(params){
            $.ajax({
                type:"POST",
                url:"/producerpro/getRtmpUrl",
                data:params,
                dataType:"json",
                async: false,
                timeout:15000,
                success : function(data) {
                    if(data.errorCode == "0x0"){
                        data = JSON.parse(data.errorInfo)[0];
                        if(data.valid=="false"){
                            // if($("#detailPush").css("display")=="none"){
                            //     pushAbout.reauthCount();
                            //     $(".reauthenticate").attr("data-nickName",params.nickName);
                            // }else{
                                var type = $("#detailPush").attr("data-type");
                                if(type=="Z"){
                                    $(pushEventDom.pushDetailDom+" .yiLive-account").hide();
                                    $(pushEventDom.pushDetailDom+" .yiLive-mobile input").val("");
                                    $(pushEventDom.pushDetailDom+" .yiLive-message input").val("");
                                    $(pushEventDom.pushDetailDom+" .yiLive-mobile").show();
                                    $(pushEventDom.pushDetailDom+" .yiLive-message").show();
                                }
                                $(pushEventDom.pushDetailDom+" .pushDetailbtn").css("display","inline-block");
                                $(pushEventDom.pushDetailDom+" .loading").css("display","none");
                                if(type=="S"||type=="P"||type=="Y"){
                                    $("#detailPush .panda-auth").css("display","block");
                                    $("#detailPush .panda-auth .panda-login").css("display","block");
                                    $("#detailPush .panda-auth .panda-nickname").css("display","none");
                                }
                                if(type=="F"){
                                    if(data.errorCode=="400"||data.errorCode=="403"){
                                        $("#detailPush .panda-auth").css("display","block");
                                        $("#detailPush .panda-auth .panda-login").css("display","block");
                                        $("#detailPush .panda-auth .panda-nickname").css("display","none"); 
                                    }else{
                                        oUtils.alertTips("i18n_FacebookTryagin",1500);
                                        return false;
                                    }
                                }
                                oUtils.alertTips("i18n_reAuthenticate",1500);
                                return false;
                            // }
                        }else{
                            var obj = {};
                                obj.CopierNickName=data.nickName;
                                obj.EncoderIndex = 1;
                                obj.RtmpUrl=data.rtmpUrl;
                                obj.CopierType=pushAboutInfo._getCopierType(data.type);
                                obj.RetryTimes = 0;
                                obj.LiveModule="social";
                            if($("#detailPush").attr("data-type")=="F"){
                                obj.RetryTimes = 10;
                                var liveVideoId = data.liveVideoId;
                                var placeId = $("#positionInput").attr("data-id");
                                var friendsArray = [],contentTagArray = [];
                                $.each($(".friendList .friendTag"),function(idx,itm){
                                    var id = $(itm).children().attr("data-id");
                                    friendsArray.push(id);
                                });
                                $.each($(".tagList .Tag"),function(idx,itm){
                                    var id = $(itm).attr("data-id");
                                    contentTagArray.push(id);
                                });
                                var access_token =$("#detailPush").attr("data-token");
                                facebookpushapi.updateLiveVideo(liveVideoId,placeId,friendsArray,contentTagArray,access_token);
                            }
                            pushAboutReq.startSocial([obj],liveVideoId);
                        }
                    }else if(data.errorCode == "0x80100016"){
                        oUtils.alertTips("i18n_cannotUseCloudR");
                    }else if(data.errorCode == "0x80100014"){
                        oUtils.alertTips("i18n_youTuBeLiveIsAuthor");
                    }
                },error:function(error){
                    console.log(error);
                }
            });
        },
        resetCheckMessage:function(item){
            clearInterval(pushAboutReq.checkMessageInterval);
            pushAboutReq.checkMessageInterval = null;
            pushAboutReq.checkMessageCountdown = 30;
            item.html("").hide();
        },
        checkMessageInterval:"",
        saveYizhibo:function(phoneNumber,messageCode,params,callback){
            if(!(/^1[34578]\d{9}$/.test(phoneNumber))){
                oUtils.alertTips("i18n_wrongPhoneNumber",2000);
                return;
            }
            if(!/^\d{4}$/.test(messageCode)){
                oUtils.alertTips("i18n_messageCodeError",2000);
                return;
            }
            var cuntdownItem = $(pushEventDom.pushCount + " .yiLive-message .countdown");
                cuntdownItem.removeClass("hide");
            oUtils.ajaxReq("/producerpro/checkSms",{"mobile":phoneNumber,"checkcode":messageCode},function(data){
                if(data.errorCode!="0x0"){
                    cuntdownItem.show();
                    if(!pushAboutReq.checkMessageInterval) {
                        cuntdownItem.html("(30s)"); //30s内禁止再次访问接口
                        pushAboutReq.checkMessageInterval = setInterval(function(){
                            pushAboutReq.checkMessageCountdown --;
                            var countTime = "("+pushAboutReq.checkMessageCountdown+"s)"
                            cuntdownItem.html(countTime);
                            if(pushAboutReq.checkMessageCountdown<0) pushAboutReq.resetCheckMessage(cuntdownItem);
                        },1000);
                    }
                    if(data.errorInfo.indexOf("短信验证码")!=-1){
                        oUtils.alertTips("i18n_wrongMessageCode",3000);
                    }else if(data.errorInfo.indexOf("请求超限")!=-1){
                        var limitTips = "";
                        if ($("#switchLanguage")[0].value === "zh") {
                            limitTips = "请输入正确的短信验证码，"+pushAboutReq.checkMessageCountdown+"秒后重试";
                        } else { 
                            limitTips = "Please input the correct message code, and try again after "+checkMessageCountdown+" secs.";
                        }
                        oUtils.alertTips(limitTips,3000);
                    }
                    return;
                }
                params.rtmpId = data.memberid;
                params.key = data.accesstoken;
                params.username = data.nickname;
                params.avatar = data.avatar;
                callback&&callback(params);
            });
        },
        startSocial:function(params,liveVideoId){
            var resolutionValue= $("#detailPush").find(".resolutionTypeList").attr("data-value");
            var Bitrate = $("#detailPush").find(".BitrateTypeList .dropdownDefault_value").text();
            var position=Bitrate.indexOf("b");
            Bitrate=Bitrate.slice(0, position);
            var param = {
                rid:commonObj.rId,
                share:["share"],
                params:JSON.stringify(params),
                buildDate:commonObj.buildDate,
                encoderIndex:1,
                livePeerId:commonObj.livePeerId,
                resolution:resolutionValue,
                vBitrate:Bitrate,
                liveModule:commonObj.liveModule
            };
            oUtils.ajaxReq("/producerpro/startStudioFileInfo",param,function(data){
                if(data.errorCode=="0x0"){
                    var shareDetail = JSON.parse(param.params)[0];
                    var shareDetailArr = {
                            rId:param.rid,
                            nickName:shareDetail.CopierNickName,
                            encoderIndex:1,
                            rtmpUrl:shareDetail.RtmpUrl,
                            buildDate:commonObj.buildDate,
                            liveVideoId:liveVideoId,
                            liveModule:"social",
                        };       
                    var params = {shareDetail:JSON.stringify(shareDetailArr)};
                    $(pushEventDom.pushDetailDom).hide();
                    pushAboutReq.saveShareDetail(params);
                    $(pushEventDom.pushDetailDom+" .pushDetailbtn").css("display","inline-block");
                    $(pushEventDom.pushDetailDom+" .loading").css("display","none");
                }else{
                    oUtils.alertTips(data.errorInfo);
                }
            }); 
        },
        saveShareDetail:function(param){
            oUtils.ajaxReq("/producerpro/saveShareDetail",param,function(data){
                console.log("saveShareDetail",data);
            });
        }
    };
    var pushState = {
        pushCurrentCountStateInfo:function(CopierLists){
            var currentShareName = [];
            for(var i=0;i<CopierLists.length;i++){
                currentShareName.push(CopierLists[i].NickName);
            }
            return currentShareName;
        },
        setCurrentCountState:function(CopierLists){
            var nickNameList = pushState.pushCurrentCountStateInfo(CopierLists);
            //先把含有nickName的设置为绿色
            $(".live-platform .publish").removeClass("red-block-button").addClass("green-block-button");
            $(".live-platform .publish").html(switchLangObj.i18n_publish);
            // 之后把nickName的设置为红色
            for(var i=0;i<nickNameList.length;i++){
                $(".live-platform [data-nickname='"+nickNameList[i]+"'] .publish").removeClass("green-block-button").addClass("red-block-button");
                 $(".live-platform [data-nickname='"+nickNameList[i]+"'] .publish").html(switchLangObj.i18n_stop);
            }
            if(nickNameList.length>0){
                $(".share2Platform button.selectVideo-common").addClass("red-block-button").removeClass("green-block-button");
            }
        }
    };
    var pushAboutInfo = {
        pwd_1 :'625202f9869e068d',  
        iv_1  :'5efd8f6060e20880',
        pwd_2 :'1020304050607080',  
        iv_2  :'a1b2c3d4e5f6g7h8',
        /*Use AES to encrypt a string*/
        getAesString:function(data,key,iv){//加密
            var sendData = CryptoJS.enc.Utf8.parse(data);
            key  = CryptoJS.enc.Utf8.parse(key);
            iv   = CryptoJS.enc.Utf8.parse(iv);
            var encrypted = CryptoJS.AES.encrypt(sendData,key,
                    {
                        iv:iv,
                        mode:CryptoJS.mode.CBC,
                        padding:CryptoJS.pad.Iso10126
                    });
            return CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
        },
        getDAesString:function(encrypted,key,iv){
            var key  = CryptoJS.enc.Utf8.parse(key);
            var iv   = CryptoJS.enc.Utf8.parse(iv);
            var decrypted = CryptoJS.AES.decrypt(encrypted,key,
                    {
                        iv:iv,
                        mode:CryptoJS.mode.CBC,
                        padding:CryptoJS.pad.Iso10126
                    });
            return decrypted.toString(CryptoJS.enc.Utf8);
        },
        _setPushCountInfo:function(domObj,obj){
            domObj.find(".push-nickname").val(domObj.attr("data-nickname"));
            switch(obj.type){
                case "S":
                    domObj.find(".push-title input").val(domObj.attr("data-title"));
                    domObj.attr("data-should_not_tweet")=="1"?domObj.find(".select-twitter .InkePlay-checkbox").removeClass("active"):domObj.find(".select-twitter .InkePlay-checkbox").addClass("active");
                    break;
                // case "P":
                //     domObj.find(".panda-nickname input").val(domObj.attr("data-username")); 
                //     break;
                case "Y":
                    domObj.find(".addExtSource_sourceUrl input").val(domObj.attr("data-rtmpid"));
                    domObj.find(".addExtSource_sourceUrl input").val(domObj.attr("data-rtmpid"));
                    domObj.find(".addKey input").val(domObj.attr("data-token"));
                    domObj.find(".addKey input").val(domObj.attr("data-token"));
                    break;
                case "I":
                    domObj = "Inke";
                    break;
                case "Z":
                    domObj.find(".yl-nickname input").val(domObj.attr("data-username"));
                    domObj.find(".push-title input").val(domObj.attr("data-title"));
                    domObj.attr("data-description")=="0"?domObj.find(".InkePlay-checkbox").removeClass("active"):domObj.find(".InkePlay-checkbox").addClass("active");
                    break;
                case "O":
                    domObj.find(".others-rtmp input").val(domObj.attr("data-rtmpid"));
                    break;      
            }
        },
        _getCopierType:function(type){
            var CopierType="";
            switch(type){
                case "F":
                    CopierType="Facebook";
                    break;
                case "S":
                    CopierType = "Periscope";
                    break;
                // case "P":
                //     CopierType = "PandaTV";
                //     break;
                case "Y":
                    CopierType="Youtube";
                    break;
                case "I":
                    CopierType = "Inke";
                    break;
                case "Z":
                    CopierType = "Yi Live";
                    break;
                case "O":
                    CopierType = "Others";
                    break;      
            }
            return CopierType;
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
                // case "P":
                //     obj = {
                //         id:"",
                //         rtmpId:"",
                //         token:"",
                //         type:"",
                //         nickName:"",
                //         username:"",
                //     }
                //     break;
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
        _getDetailPushParam:function(type,domObj){
            var obj;
            switch(type){
                case "F":
                var appointment=$("#expired-date").val();
                appointment!="" && appointment!= undefined? appointment=new Date(appointment).getTime():appointment="";
                    obj={
                        id: domObj.attr("data-id"),
                        username: domObj.attr("data-username"),
                        userId: domObj.attr("data-rtmpid"),
                        nickName: domObj.find(".push-nickname").val(),
                        title: domObj.find(".push-title input").val(),
                        description:domObj.find(".description").val(),
                        privacy: $("#privacy_active").attr("data-value"),
                        streamType: $("#type_active").attr("data-value"),
                        type: "F",
                        rtmpId: domObj.attr("data-rtmpid"),
                        destination:$("#shareTo").attr("data-value")=="Page"?"Pages":$("#shareTo").attr("data-value"),
                        pageId:$("#shareTo").attr("pageid"),
                        pageAccessToken:$("#shareTo").attr("pagetoken"),
                        startTime:appointment,
                    }
                    if(domObj.attr("data-token")){
                        obj["key"]=pushAboutInfo.getAesString(domObj.attr("data-token"),pushAboutInfo.pwd_1,pushAboutInfo.iv_1);
                    }else{
                        obj["key"]=undefined;
                    }
                    break;
                case "S":
                    obj={
                        id: domObj.attr("data-id"),
                        rtmpId: domObj.attr("data-rtmpid"),
                        key: domObj.attr("data-token"),
                        type: "S",
                        nickName: domObj.find(".push-nickname").val(),
                        username: domObj.attr("data-username"),
                        description:domObj.attr("data-description"),
                        title: domObj.find(".push-title input").val(),
                        appId: domObj.attr("data-appid"),
                        should_not_tweet: domObj.find(" .select-twitter .InkePlay-checkbox").hasClass("active")?0:1 ,
                        refreshAccessToken:domObj.attr("data-refreshaccesstoken"),
                        isNew: "0",
                    }
                    break;
                // case "P":
                //     obj = {
                //         id:domObj.attr("data-id"),
                //         rtmpId:"",
                //         key:pushAboutInfo.getAesString(domObj.attr("data-token"),pushAboutInfo.pwd_1,pushAboutInfo.iv_1),
                //         type:"P",
                //         nickName:domObj.find(".push-nickname").val(),
                //         username:domObj.attr("data-username"),
                //     }
                //     break;
                case "Y":
                    obj = {
                        id: domObj.attr("data-id"),
                        type: "Y",
                        nickName: domObj.find(".push-nickname").val(),
                        isAuto: 0,
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
                        id:domObj.attr("data-id"),
                        rtmpId: domObj.attr("data-rtmpid"),
                        key: pushAboutInfo.getAesString(domObj.attr("data-token"),pushAboutInfo.pwd_1,pushAboutInfo.iv_1),
                        type: "Z",
                        nickName: domObj.find(".push-nickname").val(),
                        username: domObj.find(".yl-nickname input").val(),
                        description: domObj.find(".InkePlay-checkbox").hasClass("active")? 1 : 0,
                        title:domObj.find(".push-title input").val(),
                    }
                    break;
                case "O":
                    obj={
                        id: domObj.attr("data-id"),
                        rtmpId: domObj.find(".others-rtmp input").val(),
                        key: pushAboutInfo.getAesString(domObj.attr("data-token"),pushAboutInfo.pwd_1,pushAboutInfo.iv_1),
                        type: "O",
                        nickName: domObj.find(".push-nickname").val(),
                        title:domObj.find(".push-title input").val(),
                        username: "",
                        description: ""
                    }
                    break;      
            }
            return obj;
        },
        _getAttrs:function(obj,params){
            for (var Key in params) {
                params[Key] = obj.attr("data-" + Key);
            }
            return params;
        },
        _setAttrs:function(obj,params){
            for (var Key in params) {
                obj.attr("data-" + Key,params[Key]);
            }
        }
    }

    /* 页面多推流模式 start */
    //推流
    //推流到Facebook的流程：先获取到facebook的rtmp url地址 ，然后在R上创建encoder，将信息传到facebook上，开始推流。
    /*var shareIsprocessing; //此变量防止在调用接口的过程中，多次点击造成接口报错


    /*--------页面初始化 S--------*/
    //初始化直播网站选择框(social account页面)

    $(function () {
        //创建下拉框 插件生成
        var currentUrl=window.location.host; 
        if(currentUrl.indexOf("cn")>0){
            // var socialTypeArr = { checkbox: { parent: switchLangObj.i18n_socialAccount, selectAll: true, children: [{ "val": "Z", "text": switchLangObj.i18n_YiLive }, { "val": "P", "text": switchLangObj.i18n_pandaTV },{ "val": "O", "text": switchLangObj.i18n_Others }] } };
            var socialTypeArr = { checkbox: { parent: switchLangObj.i18n_socialAccount, selectAll: true, children: [{ "val": "Z", "text": switchLangObj.i18n_YiLive }, { "val": "O", "text": switchLangObj.i18n_Others }] } };
        }else{
            // var socialTypeArr = { checkbox: { parent: switchLangObj.i18n_socialAccount, selectAll: true, children: [{ "val": "F", "text": "Facebook" }, { "val": "Y", "text": "YouTube" }, { "val": "Z", "text": switchLangObj.i18n_YiLive }, { "val": "P", "text": switchLangObj.i18n_pandaTV },{ "val": "S", "text": "Periscope" },{ "val": "O", "text": switchLangObj.i18n_Others }] } };
            var socialTypeArr = { checkbox: { parent: switchLangObj.i18n_socialAccount, selectAll: true, children: [{ "val": "F", "text": "Facebook" }, { "val": "Y", "text": "YouTube" }, { "val": "Z", "text": switchLangObj.i18n_YiLive },{ "val": "S", "text": "Periscope" },{ "val": "O", "text": switchLangObj.i18n_Others }] } };
        }
        $(".pushing .websiteFilter").createSimulateSelect(socialTypeArr, fn_getAllShareAccount, "val", "text");
        $(".pushing .websiteFilter").setSimulateSelect("all");
        

        $(".output-live").on("click", function (e) {
            if($(".pushing").hasClass("hide")){
                initShareAccounts();
            }else{
                $(".pushing").toggleClass('hide');
                $(".pushAlertTips").fadeOut(200);
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
            $(".pushAlertTips").fadeOut(200);
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

        $("#detailPush").on("click",".expiredCloseBtn",function(){
            $("#expireTimeBox #expired-date").val("");
        });

    });


    //初始化推流下拉菜单
    function initShareAccounts() {
        $(".pushing .websiteFilter").setSimulateSelect("all");
        oUtils.ajaxReq("/producerpro/queryRtmpDetail", { type: "All", pageflag: "false" }, function (data) {
            if (data.errorCode != "0x0") {
                if (data.errorInfo.indexOf("Null record") > -1) {
                    $(".pushing").toggleClass('hide');
                }
                var gridHtml="";
                if(userType=="public"){
                    if(businessType!= switchLangObj.i18n_Pro){
                        gridHtml='<div class="gridShow"><img src="images/gridLogo.png" alt="" /><div class="gridShow-title">Grid</div></div>';
                        $(".Push_toAccount_comment").html(gridHtml);
                    }
                }else{
                    gridHtml='<div class="gridShow"><img src="images/gridLogo.png" alt="" /><div class="gridShow-title">Grid</div></div>';
                    $(".Push_toAccount_comment").html(gridHtml);
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
        var gridHtml="";
        if (data.length > 0) {
            if(userType=="public"){
                if(businessType!= switchLangObj.i18n_Pro){
                    gridHtml='<div class="gridShow"><img src="images/gridLogo.png" alt="" /><div class="gridShow-title">Grid</div></div>';
                }
            }else{
                gridHtml='<div class="gridShow"><img src="images/gridLogo.png" alt="" /><div class="gridShow-title">Grid</div></div>';
            }
            $.each(data, function (idx, itm) {
                var type = itm.type;
                if(type!=="P"){
                    var name = itm.nickName;
                    var rtmpId = itm.rtmpId;
                    var scid = itm.appId;
                    var token = itm.token;
                    var refreshaccesstoken = itm.refreshAccessToken;
                    var locale = itm.locale;
                    var should_not_tweet = itm.should_not_tweet;
                    var titleValue='';
                    var str;
                    var currentUrl = window.location.host; 
                    var startpushtime = itm.startTime;
                    var pushTime = "";
                    if(startpushtime!="") pushTime = ExpireDateTime(parseInt(startpushtime),true);
                    startpushtime!=""? startpushtime=switchLangObj.i18n_StartAt+'&nbsp;'+ExpireDateTime(parseInt(startpushtime),true)+'&#13;' : startpushtime;
                    switch (type) {
                        case "F":
                        if(currentUrl.indexOf("cn")>0) return false;
                            str = '<i class="iconfont icon-socialMeida icon-facebook icon-socialMeida-midddle icon-font-size showTitle icon-font-Facebooksize" data-website="' + type + '"></i>';
                            break;
                        case "Y":
                            if(currentUrl.indexOf("cn")>0) return false;
                            str = '<i class="iconfont icon-socialMeida icon-youtube icon-socialMeida-midddlthisObjSe icon-font-size showTitle" data-website="' + type + '"></i>';
                            break;
                        case "I":
                            str = '<i class="icon-socialMeida icon-inke showTitle" data-website="' + type + '" data-rtmpId="' + rtmpId + '"></i>';
                            break;
                        // case "P":
                        //     str = '<i class="icon-socialMeida icon-pandaTV showTitle" data-website="' + type + '"></i>';
                        //     break;
                        case "Z":
                            str = '<i class="icon-socialMeida icon-yiLive showTitle" data-website="' + type + '" data-rtmpId="' + rtmpId + '" data-token="' + token + '" data-scid="' + scid + '"></i>';
                            break;
                        case "S":
                            if(currentUrl.indexOf("cn")>0) return false;
                            str = '<i class="iconfont icon-socialMeida icon-periscope showTitle" data-website="'+type+'" data-refreshaccesstoken="'+refreshaccesstoken+'" data-token="'+token+'" data-should_not_tweet="'+should_not_tweet+'"></i>';
                            break;
                        case "O":
                            str = '<i class="iconfont icon-socialMeida icon-yunzhibo icon-socialMeida-midddle icon-font-size showTitle" data-website="' + type + '"></i>';
                            break;
                    }
                    if(type=="F"||type=="S"){
                        titleValue=name;
                    }else{
                        titleValue=rtmpId;
                    }
                    var shareNickname = name;
                    if(type=="S"||type=="F"||type=="O"||type=="Z"||type=="Y"){
                        shareNickname = "<span class='detialPush'>"+name+"</span>";
                        titleValue = switchLangObj.i18n_click2publish+" "+titleValue;
                    }
                    var html = '<div class="shareIcon left" data-nickName="'+itm["nickName"]+'" data-startTime="'+pushTime+'" data-id="'+itm["id"]+'" data-key="'+itm["key"]+'" data-type="'+itm["type"]+'" data-token="'+itm["token"]+'" data-description="'+itm["description"]+'" data-rtmpId="'+itm["rtmpId"]+'" data-username="'+itm["username"]+'" data-title="'+itm["title"]+'" data-appId="'+itm["appId"]+'" data-refreshAccessToken="'+itm["refreshAccessToken"]+'" data-should_not_tweet="'+itm["should_not_tweet"]+'"  data-name="'+name+'"  title="'+startpushtime +''+ titleValue + '/ '+ name + '">' +
                        '<div class="dropdown_option checkbox shareOneSelectBtn selectPosition">' +
                        '<a href="javascript:;" class="ellipsis dropdown_option_item" data-value="' + name + '"></a>' +
                        '</div>' + str +
                        '<div class = "shareIcon-bottom">' +
                        '<span class="shareCircle hide"></span>' +
                        '<span class="shareNickName ellipsis">' +shareNickname + '</span>' +
                        '</div>' +
                        '</div>';
                    showIconFont.push(html);
                }
                
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
                    var html="";
                    if(userType=="public"){
                        if(businessType!= switchLangObj.i18n_Pro){
                            html=' <div class="gridShow"><img src="images/gridLogo.png" alt="" /><div class="gridShow-title">Grid</div></div><div class="emptyPush"><div class="empty_box"><img src="images/empty_box.png" alt=""></div><span class="emptyData i18n" name="i18n_EmptyData">Empty Data</span></div>';
                        }else{
                            html='<div class="emptyPush"><div class="empty_box"><img src="images/empty_box.png" alt=""></div><span class="emptyData i18n" name="i18n_EmptyData">Empty Data</span></div>';
                        }
                    }else{
                       html=' <div class="gridShow"><img src="images/gridLogo.png" alt="" /><div class="gridShow-title">Grid</div></div><div class="emptyPush"><div class="empty_box"><img src="images/empty_box.png" alt=""></div><span class="emptyData i18n" name="i18n_EmptyData">Empty Data</span></div>';
                    }
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
            } 
            // else if (obj.CopierType == "P") {
            //     obj.CopierType = "PandaTV";
            //     obj.RetryTimes = 0;
            else if (obj.CopierType == "Z") {
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
        //  if($(".main-output .shareCounts").attr("data-encoder")>0){ //判断R上是否有encoder,有的话直接推流，没有先创建再推流。
        //      startCopierInfo(rId,copierParamArr,livePeerId,shareDetailParam);
        //  }else{
        //      setInfo(rId,copierParamArr,tempType,livePeerId,shareDetailParam);
        //  }
    }
    //设置encoder
    function setInfo(rid, copierParamArr, tempType, livePeerId, shareDetailParam) {
        var param = {
            buildDate: "2017/1/17 16:10",
            rid: rid,
            params: JSON.stringify({ "rid": rid })
        }
        oUtils.ajaxReq("/producerpro/setStudioEncoderInfo", param, function (data) {
            if (data.errorCode) {
                $(".pushing").find(".loading").fadeOut();
                console.log(data.errorInfo);
            } else {
                //新建encoder以后，再推流
                startCopierInfo(rid, copierParamArr, livePeerId, shareDetailParam);
            }
        }, false);
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

    /* 页面多推流模式 end */

    pushEvent.eventInit();
    createCount.eventInit();
    pushAbout.setCurrentCountState=pushState.setCurrentCountState;
    pushAbout.goReauth=pushAboutReq.goReauth;
    pushAbout.getMesYizhibo=pushEvent.getMesYizhibo;
    pushAbout.pwd_1=pushAboutInfo.pwd_1;
    pushAbout.iv_1=pushAboutInfo.iv_1;
    pushAbout.iv_2=pushAboutInfo.iv_2;
    pushAbout.pwd_2=pushAboutInfo.pwd_2;
    pushAbout.getDAesString=pushAboutInfo.getDAesString;
    pushAbout.getAesString=pushAboutInfo.getAesString;
    return pushAbout;
// }
})($,oUtils,switchLangObj,CryptoJS,facebookpushapi,window.pushAbout||{});
