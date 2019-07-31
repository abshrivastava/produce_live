// 获取页面中登录用户
// var singularClient = (function($,switchLangObj){
    //点击用户认证的窗口，弹出用户认证的窗口
    "use strict";
    var credentials = undefined,pvwPlayer = undefined,outputName,singularPage=null,pvwStates=[],pgmStates=[],changeComp={},singularAcount=null;
    $(".sd-pretreat-box .show-singular .auth-singular .auth button").on("click",function () {
        var singularLoginUrl = location.protocol+'//'+location.host+'/producerpro/singularLogin.html';
        var left = (window.outerWidth - 800)/2 + "px";
        singularPage=window.open(singularLoginUrl,"Singular Live login","width=860px,height=520px,menubar=no,top=200px,left="+left);
    });
    $(".sd-pretreat-box .show-singular ").on("click",".singular-logo",function () {
        if($(this).hasClass("active")) return false;
        var thisObj = $(this);
        var instanceId = thisObj.attr("data-id");
        initPvwSingular(instanceId,thisObj);
        /*Singlar function start*/
        var url = decodeURIComponent(thisObj.attr("data-outputurl"));
        var singularParam={
            'RenderURL':url,
            'Operation':1,
            'ZOrder':3,
        }
        var param={};
        param.rid=$(".main-rList .rList-show").attr("data-peerId");
        param.params= JSON.stringify(singularParam);
        oUtils.ajaxReq("/producerpro/notify_htmlurl_tor", param);
        $("#SingularPlayer").attr("src",url);
        /*Singlar function end*/
        // initPlayer(instanceId);
    });
    $(".pretreat-content").on("click",".singular-logo .edit",function(){
        // var subs = pvwPlayer.getMainComposition().listSubcompositions();
        // var token = $(this).parent().attr("data-token");
        // var instanceId = $(this).parent().attr("data-id");
        // setSingularList(token,instanceId);
        $(".sd-pretreat-show .show-singular").addClass("hide");
        $(".sd-operation-show .sd-singular").removeClass("hide");
    });
    //隐藏数据
    $(".overlay-tab").on("click",".colse",function(){
        $(this).parents(".editSingular").addClass("hide");
    });
    // 获取数据
    $(".operation-show .operation-view-singular").on("click",".sub_content li .edit",function(){
        var thisObj = $(this).parent();
        var id = thisObj.attr("data-id");
        var param = thisObj.attr("data-param");
        var params = JSON.parse(decodeURIComponent(param));
        var keys = Object.keys(params.controlNode["payload"]);
        var html = '';
        for(var i = 0; i < keys.length; i++ ){
            html += '<li><span class="txt-title">'+keys[i]+'</span><input type="text" value="'+params.controlNode["payload"][keys[i]]+'"></li>'
        }
        $(".overlay-tab .editSingular").attr("data-id",id);
        $(".overlay-tab .editSingular").attr("data-param",param);
        $(".overlay-tab .editSingular .singular-complist").html(html);
        $(".overlay-tab .editSingular").removeClass("hide");
        return false;
    });
    $(".overlay-tab").on("click",".footer button",function(){
        var thisParentObj = $(this).parents(".editSingular");
        var id = thisParentObj.attr("data-id");
        var param = JSON.parse(decodeURIComponent(thisParentObj.attr("data-param")));
        var payload = param["controlNode"]["payload"];
        var liObj = thisParentObj.find(".singular-complist li");
        for(var i = 0; i < liObj.length; i++){
            payload[liObj.eq(i).find(".txt-title").html()] = liObj.eq(i).find("input").val();
        }
        pvwPlayer.getMainComposition().getCompositionById(id).setPayload(payload);
        changeComp[id] = {
            "compositionName": param["compositionName"],
            "controlNode": {
                "payload":payload,
            },
        };
        param["controlNode"]["payload"] = payload;
        $(".sd-singular .sub_content [data-id='"+id+"']").attr("data-param",encodeURIComponent(JSON.stringify(param)));
        thisParentObj.addClass("hide");
    });
    $(".overlay-tab .operation-btns").on("click",".op-label.operation-singular",function () {
        // 获取有没有用户信息
        $(".overlay-tab .editSingular").addClass("hide");
        getSingularCount();
    });

    $(".operation-show .operation-view-singular").on("click",".single-view .sub_content li",function(){
        //获取到其中的数据
        // 获取参数
        var thisObj = $(this);
        var id = thisObj.attr('data-id');
        // var params =  thisObj.attr("data-param");
        //发送到pvw
        if (thisObj.hasClass("pvwActive")) {
            PlayOut(id);
            thisObj.removeClass("pvwActive");
            for(var i = 0; i < pvwStates.length; i++){
                if (pvwStates[i]["compositionName"] == thisObj.attr("data-compname")) {
                    pvwStates.splice(i, 1);
                    break;
                }
            }
        } else {
            PlayIn(id);
            if(thisObj.siblings(".pvwActive").length !== 0){
                for(var i = 0; i < pvwStates.length; i++){
                    if (pvwStates[i]["compositionName"] == thisObj.siblings(".pvwActive").attr("data-compname")) {
                        pvwStates.splice(i, 1);
                        break;
                    }
                }
            }
            pvwStates.push({
                "compositionName": thisObj.attr("data-compname"),
                "animation": {
                    "action": "play",
                    "to": "In"
                }
            })
            thisObj.addClass("pvwActive").siblings().removeClass("pvwActive");
        }
        
    });
    $(".editSingular .singular-complist").fnNiceScroll();
    function getSingularCount(){
        oUtils.ajaxReq("/producerpro/querySingularLiveAccount", null, function (data) {
            if(data.errorCode!=='0x0'){
                oUtils.alertTips(data.errorInfo);
                return false;
            }
            $(".sd-pretreat-container .pretreat-content.show-singular").removeClass("hide"); 
            if(JSON.stringify(data.result) == "{}"){ 
                //如果没有没有属性，说明应该显示认证的那个标签
                $(".show-singular .auth-singular").removeClass("hide");
                $(".show-singular .singular-list").addClass("hide");
            }else{
                singularAcount = data.result;
                //此处不是空数组，说明有用户，显示列表
                $(".show-singular .auth-singular").addClass("hide");
                $(".show-singular .singular-list").removeClass("hide");
                getSingularInstances();
            }
        });
    }
    function setSingularList(token,instanceId) {
        if ($(".operation-show .operation-view-singular li").length == 0) {
            var params = {token:token};
            oUtils.ajaxReq("/producerpro/getCompositionsMsg", params, function (data) {
                console.log(data);
                if(data.errorCode == '0x0'){
                    var result = data.result,html='',repetitiveArr=[];
                    // arr=['Lower','Fullscreen','Baseline','Panel Left','Upper Left','Upper Right']
                    var Lower={comp:'Lower',arr:[]},Fullscreen={comp:'Fullscreen',arr:[]},Baseline={comp:'Baseline',arr:[]},
                    PanelLeft={comp:'Panel',arr:[]},UpperLeft={comp:'Upper Left',arr:[]},UpperRight={comp:'Upper Right',arr:[]};
                    result.forEach(sub => {
                        if(sub.mainComposition){
                           //表示为主composition 
                        } else {
                            if(sub.compositionName.indexOf("Lower") > -1){
                                Lower["arr"].push(sub);
                            } else if(sub.compositionName.indexOf("Fullscreen") > -1){
                                Fullscreen["arr"].push(sub);
                            } else if(sub.compositionName.indexOf("Baseline") > -1){
                                Baseline["arr"].push(sub);
                            } else if(sub.compositionName.indexOf("Panel") > -1){
                                PanelLeft["arr"].push(sub);
                            } else if(sub.compositionName.indexOf("Upper Left") > -1){
                                UpperLeft["arr"].push(sub);
                            } else if(sub.compositionName.indexOf("Upper Right") > -1){
                                UpperRight["arr"].push(sub);
                            }
                        }
                    });
                    console.log(Lower,Fullscreen,Baseline,PanelLeft,UpperLeft,UpperRight);
                    //渲染列表
                    var html ='';
                    html = getSingularComp(Lower);
                    html += getSingularComp(Fullscreen);
                    html += getSingularComp(Baseline);
                    html += getSingularComp(PanelLeft);
                    html += getSingularComp(UpperLeft);
                    html += getSingularComp(UpperRight);
                    $(".operation-show .operation-view-singular").html(html);
                    // $(".sd-pretreat-show .show-singular").addClass("hide");
                    // $(".sd-operation-show .sd-singular").removeClass("hide");
                    pgmStates = JSON.parse(JSON.stringify(pvwStates));
                }
            });
        }
    }
    function getSingularComp (comps){
            //根根据名字进行渲染
            if(comps.arr.length==0) return "";
            var html = '<li class="single-view">\
                <div class="sidebar left">'+comps.comp+'</div>\
                <div class="border left"></div>\
                <div class="contents">\
                    <ul class="sub_content clearFix" style="height:72px;">';
                for(var i = 0; i < comps.arr.length; i++){
                    var name = encodeURIComponent(JSON.stringify(comps.arr[i]));
                    html += '<li class="'+(comps.arr[i]["animation"]["state"]=="In"?"pvwActive":"")+'" data-param="'+name+'" data-id="'+comps.arr[i].compositionId+'" data-compname="'+comps.arr[i].compositionName+'"><div>'+comps.arr[i].compositionName+'</div><i class="icon-edit iconfont edit"></i></li>';
                    if(comps.arr[i]["animation"]["state"]=="In"){
                        pvwStates.push({
                            "compositionName": comps.arr[i]["compositionName"],
                            "animation": {
                                "action": "play",
                                "to": "In"
                            }
                        });
                        JumpIn(comps.arr[i]["compositionId"]);
                    }
                    pvwPlayer.getMainComposition().getCompositionById(comps.arr[i]["compositionId"]).setPayload(comps.arr[i]["controlNode"]["payload"]);
                } 
            html += '</ul>\
                </div>\
            </li>';
            return html;
    }
    function getSingularInstances() {
        oUtils.ajaxReq("/producerpro/getSingularMyshows", null, function (data) {
            if(data.errorCode == "0x0"){
                // 获取现有的请求
                var html = '';
                var result = data.result,newArr= [],hasArr=[];
                var myShows = $(".show-singular .singular-list .isMyshow"),arr=[];
                var i = 0;
                for(;i< myShows.length;i++){
                    arr.push(parseInt(myShows.eq(i).attr('data-id')));
                }
                for(i = 0;i<result.length;i++){
                    if ( arr.indexOf(result[i]['refId']) > -1){
                        hasArr.push(result[i]['refId']);
                    } else {
                        newArr.push(result[i]);
                    }
                }
                //清除删除的
                for (i=0; i<arr.length; i++) {
                    if (hasArr.indexOf(arr[i]) < 0) {
                        $(".show-singular .singular-list [data-id='"+arr[i]+"']").remove();
                    }
                }
                for (i=0; i<newArr.length; i++) {
                    getSingularThumbnail(newArr[i]['refId']);
                    html += '<li class="singular-logo isMyshow" data-id="'+newArr[i]['refId']+'" title="'+newArr[i]['name']+'">\
                        <img src="./images/singular.png" >\
                    </li>';
                }
                
                $(".show-singular .singular-list").append(html);
                $(".show-singular .singular-list").removeClass("hide");
                $(".show-singular .auth-singular").addClass("hide");
            }   
        });
    }
    function JumpIn(id) {
        var comp = pvwPlayer.getMainComposition().getCompositionById(id);
        comp.jumpTo('In');
      }
  
      function JumpOut(id) {
        var comp = pvwPlayer.getMainComposition().getCompositionById(id);
        comp.jumpTo('Out');
      }
  
      function PlayIn(id) {
        var comp = pvwPlayer.getMainComposition().getCompositionById(id);
        comp.playTo('In');
      }
  
      function PlayOut(id) {
        var comp = pvwPlayer.getMainComposition().getCompositionById(id);
        comp.playTo('Out');
      }
  
    function getSingularThumbnail (refId) {
        var requestURL = 'https://app.singular.live/apiv1/appinstances/'+refId;
        singularRestGET(requestURL, json=>{
            console.log(json);
            var thumbnail = json.outputs[0]["composition"]["thumbnail"];
            thumbnail?$(".show-singular .singular-list [data-id='"+refId+"'] img").attr("src",thumbnail):'';
            $(".show-singular .singular-list [data-id='"+refId+"']").attr("data-token",json.access_token);
            $(".show-singular .singular-list [data-id='"+refId+"']").attr("data-outputurl",encodeURIComponent(json.onair_url));
        });
    }
    // function initPlayer(_APP_INSTANCE_ID_){
    //     // create player object from iframe 'SingularPlayer'
    //     player = SingularPlayer("SingularPlayer");

    //     // render app instance specified by _APP_INSTANCE_ID_,
    //     // the second param is output name, passing undefined to select the first output
    //     player.renderAppOutput(_APP_INSTANCE_ID_, null, function() {
    //       console.log('INFO [initPlayerSDK()]: App output loaded');
    //     });
    // }
    //加载组件在pvw上面
    function initPvwSingular(id,domObj){
        pvwPlayer = SingularPlayer("pvwSingularPlayer");
        var url = 'https://app.singular.live/apiv1/appinstances/'+id+'/composition';
        singularRestGET(url,json=>{
            //加载到pgm
            console.log("appinstances",json);
            pvwPlayer.loadComposition(json.url, function(){
                domObj.siblings().removeClass("active");
                domObj.addClass("active");
                $(".operation-show .operation-view-singular").html("");
                console.log('INFO - [initPlayerSKD()]: Composition loaded');
                var token = domObj.attr("data-token");
                var instanceId =domObj.attr("data-id");
                setSingularList(token,instanceId);
            });
        })
        
    }
    function singularRestGET(url,callback) {
        // var responseMessage;
        // credentials = btoa('xupuxps@gmail.com' + ':' + '272785683ls');
        credentials = btoa(singularAcount["singular_username"] + ':' + singularAcount["singular_password"]);
        var options;
        // setup the HTTP call
        options = {
            'method': 'GET',
            'contentType': 'application/json',
            'mode': 'cors',
            "headers": {
                "Authorization": "Basic " + credentials
            }
        }
        
        fetch(url, options)
            .then((httpResponse) => {
                if (httpResponse.ok) {
                    console.log(httpResponse);
                    return httpResponse.json();
                } else {
                    console.log(httpResponse);
                    return Promise.reject("Fetch did not succeed");
                }
            })
            .then(json => {
                callback&&callback(json);
                console.log(json);
            })
            .catch((err) => {
                console.log("ERROR: " + err);
            });
    }
    function singularRestPOST(url, body, callback) {
        var options;
        var credentials = btoa(singularAcount["singular_username"] + ':' + singularAcount["singular_password"]);;
        // var credentials = btoa('danielLi@tvunetworks.com' + ':' + '272785683ls');
        // setup the HTTP call
        options = {
            'method': 'PUT',
            'contentType': 'application/json',
            'mode': 'cors',
            "headers": {
                "Authorization": "Basic " + credentials,
                'content-type': 'application/json'
            },
            'body': JSON.stringify(body)
        }
    
        fetch(url, options)
            .then((httpResponse) => {
                if (httpResponse.ok) {
                    console.log(httpResponse);
                    return httpResponse.json();
                } else {
                    console.log(httpResponse);
                    return Promise.reject("Fetch did not succeed");
                }
            })
            .then(json => {
                if (json != undefined) {
                    callback&&callback(json);
                    console.log(json);
                }
            })
            .catch((err) => {
                console.log("ERROR: " + err);
            });
    }
    // 切换到pgm
    function cutToPgm(){
        //遍历获取到数据,判断是否已经有了，如果正在使用，没有必要添加，如果没有添加，如果减少删除
        var addArr = [],reduceArr=[],i=0,pvwComp= [],pgmComp=[];
        pvwStates.forEach(item => {
            pvwComp.push(item["compositionName"]);
        })
        pgmStates.forEach(item => {
            pgmComp.push(item["compositionName"]);
        })
        //增加的pvwStates=[],pgmStates=[]
        for(i = 0;i<pvwStates.length;i++){
            if ( pgmComp.indexOf(pvwStates[i]["compositionName"]) < 0){
                addArr.push(pvwStates[i]);
            }
        }
        //减少的
        for(i = 0;i<pgmStates.length;i++){
            if ( pvwComp.indexOf(pgmStates[i]["compositionName"]) < 0){
                pgmStates[i]["animation"]["to"] = "Out";
                reduceArr.push(pgmStates[i]);
            }
        }
        var changeArr = [];
        var keys = Object.keys(changeComp);
        for (i = 0; i < keys.length; i++){
            changeArr.push(changeComp[keys[i]]);
        }
        var arr = addArr.concat(reduceArr,changeArr);
        changeComp = {};
        pgmStates = JSON.parse(JSON.stringify(pvwStates));
        PutSubcompositions(arr);
    };
    function PutSubcompositions(json){
        var access_token = $(".show-singular .singular-list .isMyshow.active").attr("data-token");
        var url = 'https://app.singular.live/apiv1/control/'+access_token;
        singularRestPOST(url,json,arr=>{
            console.log(arr);
        });
    }
    // sendRestGet();
    // return {
    //     player: player
    // }
// })($,switchLangObj);
