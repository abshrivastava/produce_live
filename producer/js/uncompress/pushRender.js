// var renderDom = {
var pushAbout= (function($,oUtils,switchLangObj,CryptoJS,pushAbout){
    var renderDomAbout={
        appendNode:{
            SelectPlatform:".share2Platform",
        },
        randerSelectPlatform:function(data){
            var _this = renderDomAbout;
            // 此处会出现两种情况：1)显示推流页面 2)没有用户的情况应该显示add
            var selectPlatform = '<div class="select-live-platform"><h2>'+switchLangObj.i18n_selectPublishCount+'</h2>';
            var platForm=null,isDisabled="",disabled2push="";
            if(data!="Null record"){
                selectPlatform+='<ul class="live-platform" style="display: block;">';
                for(var i = 0; i<data.length; i++){
                    platForm = this.getPushPlatform(data[i].type);
                    if(data[i].type=="I")continue;
                    if(data[i].type!="S"){
                        data[i]['token'] = pushAbout.getDAesString(data[i]['token'],pushAbout.pwd_2,pushAbout.iv_2);
                        data[i]['token'] = pushAbout.getDAesString(data[i]['token'],pushAbout.pwd_1,pushAbout.iv_1);
                    }
                    selectPlatform+='<li class="clearFix" data-nickName="'+data[i]["nickName"]+'" data-id="'+data[i]["id"]+'" data-key="'+data[i]["key"]+'" data-type="'+data[i]["type"]+'" data-token="'+data[i]["token"]+'" data-description="'+data[i]["description"]+'" data-rtmpId="'+data[i]["rtmpId"]+'" data-username="'+data[i]["username"]+'" data-title="'+data[i]["title"]+'" data-appId="'+data[i]["appId"]+'" data-refreshAccessToken="'+data[i]["refreshAccessToken"]+'" data-should_not_tweet="'+data[i]["should_not_tweet"]+'"><div class="left"><i class="iconfont '+platForm["iconName"]+'"></i><span class="outputName">'+data[i]["nickName"]+'</span></div><div class="right"><button class="green-block-button publish">'+switchLangObj.i18n_publish+'</button><span class="detail-push">'+switchLangObj.i18n_more+'</span></div></li>'
                }
                selectPlatform+='</ul>';
            }else{
               selectPlatform+='<div class="no-account">\
                                    <p class="title">No social account</p>\
                                    <p><button>Add</button></p>\
                                </div>';
            }
            selectPlatform+='</div>';
            $(_this.appendNode.SelectPlatform).prepend(selectPlatform);
            $(_this.appendNode.SelectPlatform+" ul").niceScroll({cursorcolor:"#D8D8D8",autohidemode:false});
        },
        // addpushCount:function(){
        //     var _this = renderDomAbout;
        //     oUtils.ajaxReq("queryRtmpDetail.action",{type:"All",pageflag:"false"},function(data){
        //         if(data.errorCode!="0x0"){
        //             _this.randerSelectPlatform("Null record");
        //             return false;
        //         }
        //         data=$.parseJSON(data.errorInfo);
        //         _this.randerSelectPlatform(data);
        //     });
        // },
        reauthenticateCount:function(){
            var reauthHtml = '<div class="reauthenticate">\
                                <p class="reauth_title">'+switchLangObj.i18n_producerReauthTitle+'</p>\
                                <p><button class="reauthen">'+switchLangObj.i18n_authenticate+'</button>\
                                <button class="cancel">'+switchLangObj.i18n_cancel+'</button></p>\
                            </div>'
            if($(".reauthenticate").length!=0){
                $(".reauthenticate").css("display","block");
            }else{
                $("body").append(reauthHtml);
            }
        },

        // <input type="text" class="form-control ellipsis dropdownDefault_value" id="expired-date" placeholder="Start time (Optional)" readonly>\
        // <span class="downArrow arrow dropdownArrow"></span>\
        getDetialPushInfo:function(type){
            var pushHtml = "";
            switch(type){
                case "F":
                        if($("#addShareSource").css("display")=="block") return "";
                        pushHtml = '<div class="popup_item">\
                                <div class="popup_item_text left">'+switchLangObj.i18n_VideoDescription+'</div>\
                                <textarea autocomplete="off" class="popup_item_value description" maxlength="255"></textarea>\
                            </div>\
                            <div class="popup_itm" id="fbFunction">\
                                <div class="fb-head hide clearFix">\
                                    <div class="keyWord left hide">-</div>\
                                    <div class="keyText left">\
                                        <div class="friendBox left"></div>\
                                        <div class="left togetherKey hide">\
                                            <span >'+switchLangObj.i18n_andother+'</span>\
                                            <span class="userNumber greenFont"></span>\
                                            <span class=" greenFont" >'+switchLangObj.i18n_users+'</span>\
                                        </div>\
                                        <div class="positionBox left"></div>\
                                    </div>\
                                </div>\
                                <div class="fb-foot clearFix">\
                                    <div class="left hide fb-foot-left">\
                                        <div class="left keyContent" data-type="At">'+switchLangObj.i18n_at+'</div>\
                                        <div class="fb-foot-box left">\
                                            <span class="positionList left">\
                                                <div class="left fbInputBox">\
                                                    <input type="text" id="positionInput" class="left i18n fbInput ellipsis" placeholder="" autocomplete="off">\
                                                </div>\
                                                <div class="closeInputBox right">\
                                                    <i class="iconfont closeInput closeInputIcon"></i>\
                                                </div>\
                                            </span>\
                                            <span class="friendList left">\
                                                <div class="left fbInputBox">\
                                                    <input type="text" id="fbInput" class="left i18n fbInput" placeholder="" autocomplete="off">\
                                                </div>\
                                            </span>\
                                            <span class="tagList left">\
                                                <div class="left fbInputBox">\
                                                    <input type="text" id="tagInput" class="left i18n fbInput" placeholder="" autocomplete="off">\
                                                </div>\
                                            </span>\
                                        </div>\
                                    </div>\
                                    <div class="fbIcon right fb-foot-right">\
                                        <div class="left iconBox checkin" title="Check In" data-type="At">\
                                            <i class="position-icon iconfont"></i>\
                                        </div>\
                                        <div class="left iconBox" title="Tag Friends" data-type="Friends">\
                                            <i class="friend-icon iconfont"></i>\
                                        </div>\
                                        <div class="left iconBox" title="Video Tag" data-type="Tag">\
                                            <i class="tags-icon iconfont"></i>\
                                        </div>\
                                    </div>\
                                </div>\
                                <div class="searchList hide"></div>\
                            </div>\
                            <div class="popup_item" id="postModule">\
                                <div class="popup_item_text i18n" name="i18n_PostTo">'+switchLangObj.i18n_PostTo+'</div>\
                                <div id="shareTo" class="popup_item_text"></div>\
                                <div class="pageList hide"></div>\
                            </div>\
                            <div id="expireTimeBox">\
                                <div class="popup_item_text">Schedule</div>\
                                <div class="input-append date form_datetime dropdownDefault_value">\
                                    <input size="16" type="text" value="" id="expired-date" placeholder="Start time (Optional)" readonly>\
                                    <span class="iconfont icon-close-circle expiredCloseBtn"></span>\
                                </div>\
                            </div>\
                            <div class="popup_item clearFix">\
                                <div class="popup_item_text td left" id="privacy_active"></div>\
                            </div>\
                            <div class="popup_item clearFix">\
                                <div class="popup_item_text td left" id="type_active"></div>\
                            </div>';
                            break;
                case "S":
                    pushHtml = '<div class="clearFix twitter">\
                                    <div class="select-twitter InkePlay popup_item left">\
                                        <span class="InkePlay-checkbox"></span>\
                                        <span class="InkePlay-text">'+switchLangObj.i18n_SyncToTwitter+'</span>\
                                    </div>\
                                </div>';
                    break;
                case "P":
                    // if($("#addShareSource").css("display")=="block") return "";
                    pushHtml = '';          
                    break;
                case "Y":
                    pushHtml = '<div class="popup_item others-website hide shareItem">\
                                    <div class="popup_item_text">'+switchLangObj.i18n_websiteType+'</div>\
                                    <div class="popup_item_value" id="youtube-sourceTypeList"></div>\
                                </div>';    
                    break;
                case "I":
                    pushHtml = '<div class="popup_item InkeId shareItem inke-item">\
                                    <div class="popup_item_text" >'+switchLangObj.i18n_inkeId+'</div>\
                                    <input type="text" autocomplete="off" class="popup_item_value trimItem" maxlength="255"/>\
                                </div>\
                                <div class="popup_item InkePlay eitItem eit-inke-item eit-yl-item">\
                                    <span class="InkePlay-checkbox"></span>\
                                    <span class="InkePlay-text">'+switchLangObj.i18n_VerticalScreen+'</span>\
                                    <a href="javascript:;" class="helpIcon iconfont screen_help" style="padding-left:0px;" title="'+switchLangObj.i18n_portraitMode+'"></a></div>\
                                </div>';
                    break;
                case "Z":
                    var account = "",reauth='hide';
                    if($("#addShareSource").css("display")=="block"){
                        account = "hide";
                        reauth='';
                    };
                    pushHtml = '<div class="popup_item yiLive-account eitItem eit-yl-item '+account+'">\
                                    <div class="popup_item_text">'+switchLangObj.i18n_account+'</div>\
                                    <div class="eit-yl-login hide">\
                                        <a href="javascript:;" class="inline_block btns black_greenBtn ylAuthenticate" name="i18n_authenticate"></a>\
                                        <span class="popup_item_text re_authenticate i18n" name="i18n_reAuthenticate" style="color:red"></span>\
                                    </div>\
                                    <div class="yl-nickname">\
                                        <input type="text" autocomplete="off" class="popup_item_value trimItem" maxlength="255" readonly=true/>\
                                    </div>\
                                </div>\
                                <div class="popup_item yiLive-mobile eitItem '+reauth+'">\
                                    <div class="popup_item_text">\
                                        <span>'+switchLangObj.i18n_MobileNumber+'</span>\
                                        <span class="yiLive-limited">'+switchLangObj.i18n_MessageLimited+'</span>\
                                    </div>\
                                    <div class="yl-input-mobile">\
                                        <span class="cn-mobile">+86:</span>\
                                        <input type="text" autocomplete="off" class="popup_item_value trimItem" maxlength="11">\
                                        <a href="javascript:;">'+switchLangObj.i18n_getMessgae+'</a>\
                                    </div>\
                                </div>\
                                <div class="popup_item yiLive-message eitItem '+reauth+'">\
                                    <div class="popup_item_text">\
                                        <span>'+switchLangObj.i18n_MessageCode+'</span>\
                                        <span class="hide countdown"></span>\
                                    </div>\
                                    <input type="text" autocomplete="off" class="popup_item_value trimItem" maxlength="255">\
                                </div>\
                                <div class="popup_item InkePlay eitItem eit-inke-item eit-yl-item">\
                                    <span class="InkePlay-checkbox"></span>\
                                    <span class="InkePlay-text">'+switchLangObj.i18n_VerticalScreen+'</span>\
                                    <a href="javascript:;" class="helpIcon iconfont screen_help" style="padding-left:0px;" title=""></a>\
                                </div>';
                    break;
                case "O":
                    pushHtml = '<div class="popup_item others-rtmp shareItem">\
                                    <div class="popup_item_text">Rtmp</div>\
                                    <input type="text" autocomplete="off" class="popup_item_value trimItem" maxlength="255">\
                                </div>';
                    break;
            }
            return pushHtml;
        },
        getPushPlatform:function(type){
            var iconName = "";
            switch(type){
                case "F":
                    iconName = "icon-facebook";
                    break;
                case "S":
                    iconName = "icon-periscope";
                    break;
                case "P":
                    iconName = "icon-pandaTV";
                    break;
                case "Y":
                    iconName = "icon-youtube";
                    break;
                case "I":
                    iconName = "icon-inke";
                    break;
                case "Z":
                    iconName = "icon-yiLive";
                    break;
                case "O":
                    iconName = "icon-yunzhibo";
                    break;      
            }
            return  {
                        iconName:iconName,
                    };
        }
    }
    // pushAbout.addpushCount=renderDomAbout.addpushCount;
    pushAbout.reauthCount=renderDomAbout.reauthenticateCount;
    pushAbout.getDetialPushInfo=renderDomAbout.getDetialPushInfo;
    return pushAbout;
// }
})($,oUtils,switchLangObj,CryptoJS,window.pushAbout||{});
