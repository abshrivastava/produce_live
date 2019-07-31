var voIpObj=(function($,oUtils,switchLangObj){
    function initEvent(){
    	$(".preview-content").on("click", ".icon-msnui-telephone", function () {
    		var thisObj = $(this);
    		var sourceIdArr = [];
    		var rid =thisObj.parents(".preview-item").attr("data-rid");
    		var sourceId="";
			var tid=thisObj.attr('data-rlivepeerid');
			var platform=thisObj.parents(".preview-item").attr("data-platform");
			if(thisObj.hasClass('icon-msnui-telephone') && !thisObj.hasClass('Connected')) {
				var pid=thisObj.attr('data-rlivepeerid');
				if(tid ==undefined || tid== "" || tid.length!= 16){
					oUtils.alertTips("i18n_sourceIdEmptyNoCallee");
					return false;
				}
				if(platform>15){
					var param={
						tId:tid
					}
					oUtils.ajaxReq("/producerpro/ifExistsVOIP", param, function (data) {
						var errorCode = data.errorCode;
						if (errorCode == "0x0") {
							var result=data.result;
							if(result!=0){
								oUtils.alertTips("i18n_youNotpermissionVoip");
								return false;
							}else{
								createVoIP(tid,rid,sourceId,sourceIdArr,thisObj);
							}
						}
					})
				}else{
					createVoIP(tid,rid,sourceId,sourceIdArr,thisObj);
				}
			}else if(thisObj.hasClass('voip-calling')||thisObj.hasClass("Connected")) {
				//在成功通话的文件夹里删除
				if(tid!="" && tid!=undefined){
					sourceId = '0x' + tid.toUpperCase();
					on_leave (sourceId);
					delete currentRInfo.voIpTlist[tid];
				}else{
					var tpeerId =currentRInfo.voIpTlist[rid];
					sourceId = '0x' + tpeerId.toUpperCase();
					on_leave (sourceId);
					delete currentRInfo.voIpTlist[tpeerId];
				}
				statusObj.voIpFlag = false;
				thisObj.removeClass('Connected');
				delete currentRInfo.voIpTlist[rid];
			}
    	});

	    function createVoIP(tid,rid,sourceId,sourceIdArr,thisObj){
	    	currentRInfo.voIpTlist[tid]= rid;
		    currentRInfo.voIpTlist[rid]= tid;
			sourceId = '0x' + tid.toUpperCase();
			sourceIdArr.push(sourceId);
			statusObj.voIpFlag = true;
			thisObj.removeClass('icon-msnui-telephone');
			thisObj.addClass('Connected');
			thisObj.addClass('loading-voip-color');
			on_rtc(sourceIdArr);//成功的话就直接on_rtc;
			console.log("login: " + sourceIdArr);
	    }; 	
    }
    initEvent();
})($,oUtils,switchLangObj);