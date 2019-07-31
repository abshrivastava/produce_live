(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.8";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
var facebookpushapi ={
    /*get can choose position function*/
     getPosition:function(key){
        var q = key||"";
        var distance = 10000000;
        var accessToken = $("form.pushCount").attr("data-token");
        var rId = $(".preview-content .preview-item[data-filename='Default']").attr("data-rid").toLowerCase();
        var tId = $(".main-preview").attr("data-livepeerid");
        var userId = $("form.pushCount").attr("data-rtmpid");
        var param = {
                rId : rId,
                tId : tId
            };
        oUtils.ajaxReq("/producerpro/getGeoInfo.action",param,function(data){
            if(data.errorCode == "0x0"){
                var result = $.parseJSON(data.errorInfo);
                var latitude = result.latitude;
                var longitude = result.longitude;
                var url = "/search?q="+q+"&type=place&center="+latitude+","+longitude+"&distance="+distance+"&access_token="+accessToken;
                FB.api(
                        url,
                        function (response) {
                            if (response && !response.error) {
                                var data = response.data;
                                var arrayList = [];
                                if(data.length>0){
                                    $.each(data,function(idx,itm){
                                        var id = itm.id;
                                        var name = itm.name;
                                        var _str = '<div class="listCommon" data-id="'+ id +'">'+name+'</div>';
                                        arrayList.push(_str);
                                    })
                                    $(".searchList").show();
                                    $(".searchList").html(arrayList.join(""));
                                    $(".searchList").fnNiceScroll();
                                    facebookpushapi.createClick();
                                }
                            }else {
                                oUtils.alertTips("");
                            }
                        }
                );
            }else{
                
            }
        });
    },
    /*get facebook friend*/
    getFbFriends:function(){
        var accessToken = $("form.pushCount").attr("data-token");
        var userId = $("form.pushCount").attr("data-rtmpid");
        var url = '/'+userId+'/friends?access_token='+accessToken;
        FB.api(
            url,
            'GET',
            function(response) {
                //console.log("taggable_friends",response);
                if (response && !response.error) {
                    var data = response.data;
                    var arrayList = [];
                    if(data.length>0){
                        $.each(data,function(idx,itm){
                            var id = itm.id;
                            var name = itm.name;
                            var _str = '<div class="listCommon" data-id="'+ id +'">'+name+'</div>';
                            arrayList.push(_str);
                        })
                        $(".searchList").html(arrayList.join(""));
                        $(".searchList").fnNiceScroll();
                        facebookpushapi.createClick();
                    }
                }else {
                    oUtils.alertTips("");
                }
            }
        );
        
    },

    getTag:function(keyword){
        var q = keyword||"tvu";
        var accessToken = $("form.pushCount").attr("data-token");
        FB.api(
            "/search?type=adinterest&q="+q+"&access_token="+accessToken,
            function (response) {
                //console.log(response);
                if (response && !response.error) {
                    var data = response.data;
                    var arrayList = [];
                    if(data.length>0){
                        $.each(data,function(idx,itm){
                            var id = itm.id;
                            var name = itm.name;
                            var _str = '<div class="listCommon" data-id="'+ id +'">'+name+'</div>';
                            arrayList.push(_str);
                        })
                        $(".searchList").html(arrayList.join(""));
                        $(".searchList").fnNiceScroll();
                        //已经选过的不然显示出来
                        var tagLength = $(".tagList .Tag").length;
                        if(tagLength>0){
                            $.each($(".tagList .Tag"),function(idx,itm){
                                var currentId = $(itm).attr("data-id");
                                $.each($(".searchList .listCommon"),function(idx,item){
                                    var thisId = $(item).attr("data-id");
                                    if(currentId == thisId){
                                        $(item).hide();
                                    }else{
                                        $(item).show();
                                    }
                                })
                            })
                        }
                        $(".searchList").show();
                        facebookpushapi.createClick();
                    }
                }else {
                    oUtils.alertTips("");
                }
            }
        );
    },
    showFriendByKeyWord:function(keyword){
        var length = $(".searchList .listCommon").length;
        var friendList = $(".searchList .listCommon");
        var hasSelectArray = [];
        if(length>0){
            $.each(friendList,function(idx,itm){
                var name = $(itm).html().toLowerCase();
                if(name.indexOf(keyword)>=0){
                    var hasSelectF = $(".friendList .friendTag");
                    //---- this use to check it was had selected if it had selected won't let it show----
                    $.each(hasSelectF,function(idx,item){
                        var hasSelectName = $(item).children(".friendSpan").html().toLowerCase();
                        hasSelectArray.push(hasSelectName);
                        if(hasSelectArray.indexOf(name)>=0){
                            $(itm).hide();
                        }else{
                            $(itm).show();
                        }
                    })
                    if(!hasSelectF.length){$(itm).show();};
                }else{
                    $(itm).hide();
                }
            })
            $(".searchList").show();
            if(keyword == "") $(".searchList").hide();
        }
    },
    //create click event
    createClick:function(thisObj){
        $("#detailPush .listCommon").unbind();
        $("#detailPush .listCommon").on("click",function(){
            var thisObj = $(this);
            var type = $(".keyContent").attr("data-type");
            type = "At"||"Friends"?$(".searchList").hide():$(".searchList").show();
            facebookpushapi.createSelectTag(thisObj);
        })
    },
    //----创建点击已选中文字的click事件 ----
    createClickKeyWord:function (){
        $(".keyText .greenFont").unbind();
        $(".keyText .greenFont").on("click",function(){
            var thisObj = $(this);
            var type = thisObj.attr("data-type");
            if(type == "position"){
                var key = $("#positionInput").val();
                this.getPosition(key);
                $(".searchList").css("top",78);
                $(".keyContent").css("margin-top",0);
                $(".fbIcon").css("margin-top",0);
                $(".positionList").show().siblings().hide();
                $("#positionInput").focus();
                $(".iconBox").removeClass("active");
                $(".iconBox").eq(0).addClass("active");
                $(".searchList").css({"left":30,"width":380});
                $(".keyContent").attr("name",switchLangObj.i18n_at).html(switchLangObj.i18n_at).attr("data-type","At");
            }else{
                $(".friendList").show().siblings().hide();
                $(".iconBox").removeClass("active");
                $(".iconBox").eq(1).addClass("active");
                var height = $(".friendList").css("height");
                if(height>"35px"){
                    $(".searchList").css("top",107);
                    $(".keyContent").css("margin-top",15);
                    $(".fbIcon").css("margin-top",15);
                }
                $(".searchList").css({"left":42,"width":366});
                $(".keyContent").attr("name",switchLangObj.i18n_with).html(switchLangObj.i18n_with).attr("data-type","Friends");
                this.getFbFriends();
                $(".searchList").hide();
                
            }
        })
    },
    //点击每个li执行对应的函数
    createSelectTag:function(thisObj){
        var type = $(".keyContent").attr("data-type");
        switch (type){
            case "At":
                facebookpushapi.showPositionByKeyWord(thisObj);
                break;
            case "Friends":
                facebookpushapi.createFriendTag(thisObj);
                break;
            case "Tag":
                facebookpushapi.createTag(thisObj);
                break;
        }
    },
    //显示位置
    showPositionByKeyWord:function(thisObj){
        var position = thisObj.html();
        var id = thisObj.attr("data-id");
        var _str = '<div class="i18n positionBox-key left" name=""></div><div class="positionBox-text greenFont ellipsis left" data-type="position">'+position+'</div>';
        $(".positionBox").html(_str);
        $("#positionInput").val(position).attr("data-id",id);
    //  $(".fb-head").fnNiceScroll();
        //----判断应该显示是at还是in是大写还是小写 ----
        var hasFriend = $(".friendBox .friendMudleBox").length>0?true:false;
        var isOrAt = position.indexOf(",")>0?true:false;
        if(hasFriend){
            if(isOrAt){
                $(".positionBox .positionBox-key").html(switchLangObj.i18n_In_low);
            }else{
                $(".positionBox .positionBox-key").html(switchLangObj.i18n_at_low);
            }
        }else{
            if(isOrAt){
                $(".positionBox .positionBox-key").html(switchLangObj.i18n_In);
            }else{
                $(".positionBox .positionBox-key").html(switchLangObj.i18n_at_none);
            }
        }
        $(".keyWord").show();
        facebookpushapi.createClickKeyWord();
    },
    //创建freindTag标签
    createFriendTag:function(thisObj){
        var name = thisObj.html();
        var id = thisObj.attr("data-id");
        var flag = $(".friendList .friendTag").length>0?true:false;
        var _str = '<span class="friendTag"><span data-id="'+id+'" class="friendSpan ellipsis">'+name+'</span><i class="closeTab iconfont closeIcon"></i></span>';
        var _strTag = '<div class="left friendMudleBox"><div class="i18n positionBox-key left" name=""></div><div class="positionBox-text greenFont ellipsis" data-type="friends">'+name+'</div></div>'
        $(".friendBox").append(_strTag);
        if(flag){
            $(".friendTag").last().after(_str);
        }else{
            $(".friendList").prepend(_str);
        }
        var height = $(".friendList").css("height");
        if(height>"35px"){
            $(".searchList").css("top",107);
            $(".keyContent").css("margin-top",15);
            $(".fbIcon").css("margin-top",15);
        }else{
            $(".searchList").css("top",78);
        }
        
        var friendTagArray = $(".friendList .friendTag");
        var length = friendTagArray.length;
        for(var i=2;i<length;i++){
            $(".friendBox .friendMudleBox").eq(i).hide();
        }
        $(".friendBox .positionBox-key").html(switchLangObj.i18n_with_none);
        if(length<3){
            if(length == 2){$(".friendBox .friendMudleBox").eq(1).children(".positionBox-key").html(switchLangObj.i18n_andother);}
        }else{
            $(".friendBox .friendMudleBox").eq(1).hide();
            $(".userNumber").html(length-1);
    //      $(".positionBox").css("margin-top",0);
            $(".togetherKey").show();
        }
        $("#fbInput").attr("placeholder","").val("");
        $(".keyWord").show();
        $(".searchList").hide();
        $(".friendList").fnNiceScroll();
    //  $(".fb-head").fnNiceScroll();
        //----判断应该显示是at还是in是大写还是小写 ----
        var hasFriend = $(".friendBox .friendMudleBox").length>0?true:false;
        var isHavePosition = $(".positionBox .positionBox-text").html()?true:false;
        if(isHavePosition) var isOrAt = $(".positionBox .positionBox-text").html().indexOf(",")>0?true:false;
        if(hasFriend){
            if(isOrAt){
                $(".positionBox .positionBox-key").html(switchLangObj.i18n_In_low);
            }else{
                $(".positionBox .positionBox-key").html(switchLangObj.i18n_at_low);
            }
        }else{
            if(isOrAt){
                $(".positionBox .positionBox-key").html(switchLangObj.i18n_In);
            }else{
                $(".positionBox .positionBox-key").html(switchLangObj.i18n_at_none);
            }
        }
        facebookpushapi.createClickKeyWord();
    },
    createTag:function(thisObj){
        var name = thisObj.html().toLowerCase();
        var id = thisObj.attr("data-id");
        var flag = $(".tagList .Tag").length>0?true:false;
        var _str = '<span class="Tag" data-id="'+id+'"><span class="tagSpan ellipsis">'+name+'</span><i class="closeTab iconfont closeIcon"></i></span>';
        if(flag){
            $(".Tag").last().after(_str);
        }else{
            $(".tagList").prepend(_str);
        }
        var height = $(".tagList").css("height");
        if(height>"35px"){
            $(".searchList").css("top",107);
            $(".keyContent").css("margin-top",15);
            $(".fbIcon").css("margin-top",15);
        }else{
            $(".searchList").css("top",78);
            $(".searchList").hide();
            $(".tagList").fnNiceScroll();
        }
        $("#tagInput").attr("placeholder","").val("");
    },
    closeFriend:function(thisObject){
        thisObject.parent(".friendTag").remove();
        var currentName = thisObject.siblings(".friendSpan").html();
        var height = $(".friendList").css("height");
        var currentLength;
        if(height<="35px"){
            $(".keyContent").css("margin-top",0);
            $(".fbIcon").css("margin-top",0);
            $(".searchList").css("top",78);
        }
        
        var friendList = $(".friendBox .friendMudleBox");
        //---- 删除点击的这个name ----
        $.each(friendList,function(idx,itm){
            var name = $(itm).children(".positionBox-text").html();
            if(currentName == name){$(itm).remove();};
        })
        //处理显示位置和谁那个地方
        currentLength = $(".friendTag").length;
        if(currentLength >= 3){
            $(".friendBox .friendMudleBox").eq(0).show().children(".positionBox-key").html(switchLangObj.i18n_with);
        }else if(currentLength == 2){
            $(".togetherKey").hide();
    //      $(".positionBox").css("margin-top",1);
            $(".friendBox .friendMudleBox").eq(0).show().children(".positionBox-key").html(switchLangObj.i18n_with);
            $(".friendBox .friendMudleBox").eq(1).show().children(".positionBox-key").html(switchLangObj.i18n_andother);
        }else if(currentLength == 1){
            $(".friendBox .friendMudleBox").eq(0).show().children(".positionBox-key").html(switchLangObj.i18n_with);
        }
        currentLength?$("#fbInput").attr("placeholder","").blur():$("#fbInput").attr("placeholder",switchLangObj.i18n_who).blur();
        $(".userNumber").html(currentLength-1);
        
        //----判断应该显示是at还是in是大写还是小写 ----
        var hasFriend = $(".friendBox .friendMudleBox").length>0?true:false;
        var isHavePosition = $(".positionBox .positionBox-text").html()?true:false;
        if(isHavePosition) var isOrAt = $(".positionBox .positionBox-text").html().indexOf(",")>0?true:false;
        if(!hasFriend){
            if(isOrAt){
                $(".positionBox .positionBox-key").html(switchLangObj.i18n_In);
            }else{
                $(".positionBox .positionBox-key").html(switchLangObj.i18n_at_none);
            }
        } 
    },
    pushFaceBook:function(){
        var currentClick = "";
        $("form.pushCount").on("click","#fbFunction .iconBox",function(){
            var time = new Date().getTime();
            var lastClick = currentClick;
            currentClick = time;
            if(currentClick-lastClick<1000){
                return;
            }
            var thisObj = $(this);
            var iconName = thisObj.attr("data-type");
            var isHasColor = thisObj.hasClass("active");
            var isHaveToken = thisObj.parents("form").attr("data-token");
            $("#fbFunction .iconBox").removeClass("active");
            $(".searchList").html("");
            $(".fb-head").hide();
            
            if(!isHaveToken){
                $("#detailPush .panda-auth").show();
                $("#detailPush .panda-login").show();
                $("#detailPush .panda-nickname").hide();
                oUtils.alertTips("i18n_reAuthenticate",2000);
                return;
            }
            if(isHasColor){
                $(".fb-head").slideUp().removeClass("border");
                $(".fb-foot-left").hide();
                return;
            }else{
                $(".fb-head").slideDown().addClass("border");
                $(".fb-foot-left").show();
                thisObj.addClass("active");
            }
            
            $(".searchList").css("top",78);
            $(".keyContent").css("margin-top",0);
            $(".fbIcon").css("margin-top",0);
            $(".positionList,.friendList,.tagList").hide();
            $(".keyContent").attr("data-type",iconName);
            //---- change left font content ----
            switch(iconName){
                case "At":
                    $(".positionList").show();
                    facebookpushapi.getPosition();
                    $("#positionInput").focus();
                    $(".searchList").css({"left":30,"width":380});
                    $(".keyContent").attr("name",switchLangObj.i18n_at).html(switchLangObj.i18n_at);
                    $("#positionInput").attr("placeholder",switchLangObj.i18n_where);
                    break;
                case "Friends":
                    $(".friendList").show();
                    facebookpushapi.getFbFriends();
                    var length = $(".friendList .friendTag").length;
                    var height = $(".friendList").css("height");
                    if(height>"35px"){
                        $(".searchList").css("top",107);
                        $(".keyContent").css("margin-top",15);
                        $(".fbIcon").css("margin-top",15);
                    }
                    $(".searchList").css({"left":42,"width":366});
                    $(".keyContent").attr("name",switchLangObj.i18n_with).html(switchLangObj.i18n_with);
                    $("#fbInput").attr("placeholder",switchLangObj.i18n_who);
                    length>0?$("#fbInput").val("").attr("placeholder",""):$("#fbInput").focus();
                    break;
                case "Tag":
                    $(".tagList").show();
                    facebookpushapi.getTag();
                    var length = $(".tagList .Tag").length;
                    var height = $(".tagList").css("height");
                    if(height>"35px"){
                        $(".searchList").css("top",107);
                        $(".keyContent").css("margin-top",15);
                        $(".fbIcon").css("margin-top",15);
                    }
                    $(".searchList").css({"left":42,"width":366});
                    $(".keyContent").attr("name",switchLangObj.i18n_tag).html(switchLangObj.i18n_tag);
                    $("#tagInput").attr("placeholder",switchLangObj.i18n_videoTag);
                    length>0?$("#tagInput").val("").attr("placeholder",""):$("#tagInput").focus();
                    break;
            }
        });
        $("form.pushCount").on("click",".fb-foot-box .closeTab",function(){
            var thisObject = $(this);
            var type = $(".keyContent").attr("data-type");
            switch (type){
                case "Friends":
                    facebookpushapi.closeFriend(thisObject);
                    break;
                case "Tag":
                    var length = $(".tagList .Tag").length;
                    thisObject.parent(".Tag").remove();
                    var height = $(".tagList").css("height");
                    if(height<="35px"){
                        $(".searchList").css("top",78);
                        $(".keyContent").css("margin-top",0);
                        $(".fbIcon").css("margin-top",0);
                    }
                    length?$("#tagInput").attr("placeholder","").blur():$("#tagInput").attr("placeholder",switchLangObj.i18n_videoTag).blur();
                    break;
            }
        })
        
        $("form.pushCount").on("click",".fb-foot-box",function(){
            var type = $(".keyContent").attr("data-type");
            switch (type){
                case "At":
                    $(".searchList").show();
                    $("#positionInput").focus();
                    break;
                case "Friends":
                    $("#fbInput").focus();
                    break;
                case "Tag":
                    facebookpushapi.getTag();
                    $("#tagInput").focus();
                    break;
            }
        })
        $("form.pushCount").on("click",".pageInfo",function(){
            var id = $(this).attr("data-id");
            var token = $(this).attr("data-token");
            $("#shareTo").attr({"pageId":id,"pageToken":token});
            $(".pageList").addClass('hide');
            $(".pageList").css("display","none");
            $("#shareTo").attr("data-value","Page");
            $("#shareTo .dropdownDefault_value").attr("title","Page").html("Page");
            var val = $(this).html();
            $("#shareTo .dropdownDefault_value").html("Page ("+val+")");
        });
        $("form.pushCount").on("click",".closeInputBox",function(){
            var isHaveFriend = $(".friendBox .friendMudleBox").length;
            isHaveFriend == 0?$(".keyWord").hide():$(".keyWord").show();
            $(".positionBox").html("");
            $(".searchList").hide();
            $("#positionInput").val("").attr("placeholder",switchLangObj.i18n_where);
        })
    },
    checkPage:function(){
        var accessToken = $("#detailPush").attr("data-token");
        var userId = $("#detailPush").attr("data-rtmpid");
        if(accessToken=="")return;
        var url = "/" + userId + "/accounts";
        FB.api(
            url,
            'GET',
            {"access_token":accessToken},
            function (response) {
                if (response.data.length>0) {
                    $("#shareTo").removeClass("disabled");
                }else{
                    $("#shareTo").addClass("disabled");
                }
            }
        );
    },
    updateLiveVideo:function(liveVideoId, placeId, friends, contentTags, accessToken){
        var param = {"access_token":accessToken};
        if( placeId != null ){
            param.place = placeId;
        }
        if( friends != null ){
            param.tags = friends;
        }
        if( contentTags != null ){
            param.content_tags = contentTags;
        }
        FB.api(
            '/'+liveVideoId,
            'POST',
            param,
            function(response) {
                facebookpushapi.clearLastData();
            }
        );
    },
    clearLastData:function(){
        $(".friendList .friendTag").remove();
        $(".tagList .Tag").remove();
        $(".fb-head").slideUp().removeClass("border");
        $(".fb-foot-left").hide();
        $("#fbFunction .iconBox").removeClass("active");
        $(".keyContent").css("margin-top",0);
        $(".fbIcon").css("margin-top",0);
        $(".searchList").css("top",78);
        $(".keyWord").hide();
        $("#positionInput,#fbInput,#tagInput").val("");
        $(".friendBox").html("");
        $(".positionBox").html("");
        $(".togetherKey").hide();
        $("#positionInput").attr("data-id","");
    },
    //获取facebook page相关信息
    getPageId:function(thisObject){
    var val = thisObject.children().attr("data-value");
    if(val == "Page"){
        var accessToken = $("#detailPush").attr("data-token");
        var userId = $("#detailPush").attr("data-rtmpid");
        var url = "/" + userId + "/accounts";
        FB.api(
            url,
            'GET',
            {"access_token":accessToken},
            function (response) {
                console.log(response);
                if (response && !response.error) {
                    //展示pageList
                    $(".pageList").removeClass('hide');
                    $(".pageList").css("display","block");
                    var pageArray = [];
                    $.each(response.data,function(idx,itm){
                        var pageId = itm.id;
                        var pageToken = itm.access_token;
                        var name = itm.name;
                        var _str = '<div class="pageInfo" data-id="'+ pageId +'" data-token="'+ pageToken +'">'+ name +'</div>';
                        pageArray.push(_str);
                    })
                    $(".pageList").html(pageArray.join(""));
                    $(".pageList").fnNiceScroll();
                }else {
//                  oUtils.alertTips("");
                }
            }
        );
    }else{
        $(".pageList").addClass("hide");
        $(".pageList").css("display","none");
    }
}
}