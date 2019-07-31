//全局变量
var signalingUrl,studioBehavior,facebookCheckInDistance,domainAddress,currentVersion,userManage,
userRecord,serRolePerm,userRoleList,tvuccUrl,sessionId,userRolePerm,orderStatus,AUTHORITY,parentInviteCode,
progressTime,businessType,isNewUser,userType;
	//判断翻译是否缓存 
var CONFIG = null;
var studioTimer = null,progressTimer,initprogressTime=35;
var isrestoreHistory=false,RestoringHistory=false;
var versionUpdateFlag=undefined;

//---------switchLangObj.i18n_allDevices
//引入css,js文件
// if(location.protocol=="http:" && location.href.indexOf("producer.tvunetworks")<0){
//     var href = location.href;
//     var idx = href.indexOf(":");
//     href = href.substring(idx);
//     location.href = "https"+href;
// }

(function() {
  	var localStorageVersion= window.localStorage.getItem("currentVersion");
  	if(localStorageVersion&&localStorageVersion==currentVersion) {
	 i18n_cacheFlag=true;
	}
	//如果不是谷歌浏览器给出提示
	window.localStorage.setItem("currentVersion", currentVersion);
	if(!!window.ActiveXObject || "ActiveXObject" in window){
	    $(".isChrome").css("display","block");
	    return false;
	}
	getCheckConfig();

}());
function getQueryVariable(variable){
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}
function getCheckConfig(){
	sessionId = getQueryVariable("session");
	if(!sessionId){
		sessionId = localStorage.getItem("session");
	}
	var checkConfigUrl = "/producerpro/checkConfig?session="+sessionId;
    localStorage.setItem("session",sessionId);
  	$.ajax({
		type: "POST",
		url:checkConfigUrl,
		async: false,
		success: function(data){
		    data= JSON.parse(data);
            CONFIG = data;
	        signalingUrl = data.signalingUrl;
            var protocolStr = document.location.protocol;
            signalingUrl = data.signalingUrl;
            if(protocolStr == "http:"){   
                signalingUrl = data.signalingUrl;
            }else if(protocolStr == "https:"){
                signalingUrl = data.rtcUrl;
            }
	        studioBehavior =data.userBehavior;
	        facebookCheckInDistance = data.facebookCheckInDistance;
	        domainAddress= data.domainAddress;
	        userRoleList =data.USER_NAME.userRoleList;
	        userRolePerm={};
			userRolePerm.userId =data.USER_NAME.id;
			businessType=data.USER_NAME.businessType;
			isNewUser=data.isNewUser;
			userManage=data.userManage;
			userType=data.userType;
			localStorage.setItem("userManage",userManage);
	        tvuccUrl=data.tvuccUrl;
	        sessionId=data.session;
            AUTHORITY = data.USER_NAME.authority;
	        orderStatus=data.orderStatus;
	        var activeInstance = data.activeInstance;
	        var rversion = data.rversion;
            var amount =  data.USER_NAME.amount;
            versionUpdateFlag= data.USER_NAME.versionUpdateFlag;
            parentInviteCode = data.USER_NAME.parentInviteCode;
            localStorage.setItem("amount",amount);
            localStorage.setItem("parentInviteCode",parentInviteCode);
	        var title = "ui:"+jsVersion+"\n"+"Service:"+CONFIG.buildversion+"\n"+"LinuxR:"+rversion;
			var userEmial=data.USER_NAME.email;
	        $("#userBehavior").val(studioBehavior);
	        localStorage.setItem("userEmial", userEmial);
            if(userEmial=="guest@tvunetworks.com"){
                $(".not-visitor").hide();
                $(".visitor").show();
            }else {
                $(".not-visitor").show();
                $(".visitor").hide();
            }
			$("#user_info_name").text(userEmial);
			if(businessType=="1" || businessType==null ){
				businessType = switchLangObj.i18n_Pro;
			}else if(businessType=="0"){
				businessType = switchLangObj.i18n_Adv;
			}
			$(".businessType").text(businessType);
	        $("#user_info_name").attr("title",userEmial);
	        $("#website_title_text").attr("title", title);
	        window.serviceList = {userseviceUrl: userManage};
            if(userRoleList){
				userRoleList =JSON.parse(userRoleList)
				for(var i=0;i<userRoleList.length;i++){
					userRolePerm[userRoleList[i].feature] = userRoleList[i].value;
				}
			}
			if(activeInstance==-1){
				$(".switch-instance").html(switchLangObj.i18n_openInstance);
				$(".studio_operate .studio-box").animate({"left":"0px"});
				$(".studio_operate .studio-box").removeClass("active");
				$.ajax({
					type: "GET",
					url:"/producerpro/studio_open",
					timeout:60000,
					success: function(data){
						data = JSON.parse(data);
						if(data.errorCode=="0x0"){
							if(data.result==3){
								getCheckConfig();
                                return false;
							}
							getProgress(0);
						}else if(data.errorCode=="0x80100016"){
							oUtils.alertTips("i18n_systemOverload");
						}else if(data.errorCode=="0x80100015"){
							oUtils.alertTips("i18n_producerNotArea");
						}else if(data.errorCode=="0x80100003"){
							oUtils.alertTips("i18n_systemMaintained");
						}else if(data.errorCode=="0x80100017"){
							console.log("Do not send repeat request!");
						}else if(data.errorCode=="0x80100019"){
                            if(location.host=="producer.tvunetworks.cn"){
                                var userAmount =  localStorage.getItem("amount");
                                //弹出充值页面
                                if(!parentInviteCode && parseInt(userAmount)==0){
                                    $(".purchase-cn .discount").hide();
                                    $(".purchase-cn .del-money").html(" - ¥ 0");
                                    $(".purchase-cn .to-pay button").html("立即支付800元");
                                }else{
                                    $(".purchase-cn .discount").show();
                                    var amount = 0;
                                    if(!parentInviteCode){
                                        amount = 80000;
                                    }else{
                                        amount = 72000;
                                    }
                                    $(".purchase-cn .discount").show();
                                    amount = amount-userAmount;
                                    if(amount>0){
                                        $(".purchase-cn .del-money").html(" - ¥ "+((80000-amount)/100));
                                        $(".purchase-cn .to-pay button").html("立即支付"+(amount/100)+"元");
                                    }else{
                                        $(".purchase-cn .del-money").html(" - ¥ 800");
                                        $(".purchase-cn .to-pay button").html("立即支付0元");
                                    }
                                }
                                $(".purchase-cn").css("display","block");
                                $("#bgFilter").css("display","block");
                            }else{
                                $(".purchase-loading").css("display","block");
                                $(".purchase-alert").css("display","block");
                            }      
						}else{
							oUtils.alertTips("i18n_commentError");
						}
					}
				});
			}else if(activeInstance!==3){
				getProgress(activeInstance);
			}else{
				$(".switch-instance").html(switchLangObj.i18n_closeInstance);
				$(".pp-loading").css("display","block");
				$(".progress .progress-status").html("100%");
				$(".progress p").html(switchLangObj.i18n_initialize);
				$(".progress .meter .compelete").css("width","100%");
				$(".studio_operate .studio-box").animate({"left":"11px"});
				$(".studio_operate .studio-box").addClass("active");
				$(".pp-loading").css("display","none");
				$(".remaining").css("display","block");
				$(".main-cut").css("margin-top","0.56rem");
                var OverlaySync = undefined;
			    if(studioBehavior){
                    OverlaySync = JSON.parse(decodeURIComponent(studioBehavior)).OverlaySync;
                }
			    if(OverlaySync!=undefined){
			    	if(OverlaySync!=2){
				    	$("#bgFilter").css("display","block");
					    $(".recover_history").css("display","block");
				    }
			    }
				getStudioRestore();
				if(data.userType=="public"){
					if(businessType==switchLangObj.i18n_Pro){
						$(".operation-clip").remove();
					}
					getRemainCountDown();
				}
                var params ={
                    sendaudio:false,
                    sendvideo:false,
                    recvaudio:true,
                    recvvideo:true,
                    caller:null,
                    callee:null
                };
                params.mediaConstraints = {
                    audio: params.sendaudio,
                    video: params.sendvideo
                };
                window.rtcclient = new RtcClient(params,signalingUrl);
                if(typeof initSystem.initStudioRList == "function"){
                    if(initSystem.pageWebsocketObj.socket!=null) return false;
                    initSystem.initStudioRList(data.studioRList,data.userBehavior);
                    initOverlay.initDirectChange();
                }
			}	
		}
    });
}

//当开启实例的时候显示进度条
function getProgress(result){
	if(result==0||result==1){
		$(".studio_operate .studio-box").animate({"left":"11px"});
		$(".studio_operate .studio-box").addClass("active");
		$(".switch-instance").html(switchLangObj.i18n_closeInstance);
		if(result==0){ 
			$(".pp-loading").css("display","block");
			$(".remaining").css("display","none");
			$(".main-cut").css("margin-top","0.2rem");
			$(".progress p").html(switchLangObj.i18n_allocate);
			clearInterval(progressTimer);
			console.log("第二阶段开始");
			progressTimer=setInterval(function(){
				initprogressTime++;
				var initprogressTimes=initprogressTime;
				var initWidth=initprogressTime+"%";
				$(".progress .progress-status").html(initprogressTime+"%");
				$(".progress .meter .compelete").css("width",initWidth);
				if(initprogressTime==88) clearInterval(progressTimer);
			},300);
		}
		if(result==1){
			$(".pp-loading").css("display","block");
			$(".remaining").css("display","none");
			$(".main-cut").css("margin-top","0.2rem");
			$(".progress .progress-status").html("88%");
			$(".progress p").html(switchLangObj.i18n_initialize);
			$(".progress .meter .compelete").css("width","88%");
		}
	}else if(result==3){
		$(".switch-instance").html(switchLangObj.i18n_closeInstance);
		$(".progress .progress-status").html("100%");
		$(".progress p").html(switchLangObj.i18n_config);
		$(".progress .meter .compelete").css("width","100%");
		$(".studio_operate .studio-box").animate({"left":"0.11rem"});
		$(".studio_operate .studio-box").addClass("active");
        $(".pp-loading").css("display","none");
        $(".main-cut").css("margin-top","0.56rem");
        $(".remaining").css("display","block");
		if(pageWebsocketObj.socket!=null)return;
		getCheckConfig();
	}
}

function getRemainCountDown(){
	var setcountdown = "";
	clearInterval(setcountdown);
	setcountdown = setInterval(function(){
		if(userRecord==0){
			$(".purchase-loading").css("display","block");
			if(AUTHORITY.indexOf("Grid")==-1) $(".refueling-package p").html(switchLangObj.i18n_gustRecharge);
			$(".refueling-package").css("display","block");
			getRemainTimeAndExpireTime();
		}else if(userRecord==300){
			$(".purchase-promptbox").fadeIn('slow');
			getRemainTimeAndExpireTime();
		}else if(userRecord==240){
			$(".purchase-promptbox").fadeOut('slow');
			getRemainTimeAndExpireTime();
		}else{
			getRemainTimeAndExpireTime();
			$(".purchase-loading").css("display","none");
			$(".refueling-package").css("display","none");
		}	
	},5000);
}


function getRemainTimeAndExpireTime(){
	var userEmail=$("#user_info_name").text();
	var params={
		"email": userEmail,
    }
    oUtils.ajaxReq("/producerpro/getRemainAndExpireTime",params, function (data) {
		if(data.errorCode=="0x0"){
			var result=data.result;
			var expireTime=result.expireTime;
			$(".Expiration-Date div").text(ExpireDateTime(expireTime));
			userRecord=result.remainTime;
			$(".remaining div").text(transTimeByms(userRecord,true));
		}
	})
}

function ExpireDateTime(inputTime,ExpireFlag) {
    var date = new Date(inputTime);
    var y = date.getFullYear();
	var m = date.getMonth() + 1;
	m = m < 10 ? ('0' + m) : m;
	var d = date.getDate();
	d = d < 10 ? ('0' + d) : d;
	var hour = date.getHours();
	var minute = date.getMinutes();
	var seconds = Math.floor(inputTime/1000 % 60 % 60);
	hour = hour <= 9 ? "0" + hour :hour;
	minute = minute <= 9 ?  "0" + minute : minute;
	seconds = seconds <= 9 ?  "0" + seconds : seconds;
	if(ExpireFlag){
		return y+"-"+ m +"-"+ d+" "+hour+":"+minute;
	}else{
		return y + '/' + m + '/' + d;
	}
} 

function transTimeByms(value,Reaminflag) {
    var hours = Math.floor(value / (60 * 60));
    var minutes = Math.floor(value / 60 % 60);
    var seconds = Math.floor(value % 60 % 60);
    hours <= 9 ? hours = "0" + hours : hours = hours;
    minutes <= 9 ? minutes = "0" + minutes : minutes = minutes;
	seconds <= 9 ? seconds = "0" + seconds : seconds = seconds;
	if(Reaminflag){
		return hours + switchLangObj.i18n_hoursTime + minutes + switchLangObj.i18n_minTime; 
	}else{
		return hours + ":" + minutes + ":" + seconds;
	}    
}

function getStudioRestore(){
    if(!studioBehavior) return false;
	var mainId = JSON.parse(decodeURIComponent(studioBehavior));
    mainId= mainId.SelectR.peerId;
    var param={
		"rid": mainId,
    }
    $.ajax({
		type: "GET",
		url:"/producerpro/studio_restore",
		timeout:300000,
		data: param,
		success: function(data){
		    data=JSON.parse(data);
		    if(data.errorCode=="0x0"){
		    	var result= data.result;
				if(result=="2"){
					$("#bgFilter").css("display","none");
					$(".recover_history").css("display","none");
					isrestoreHistory=true;
					queryRecordInfo();
					if(versionUpdateFlag==0){
						$(".updateVersion").css("display","block");
					}
				}else{
					$("#bgFilter").css("display","block");
				    $(".recover_history").css("display","block");
					setTimeout(function(){
                        getStudioRestore();
                    },3000);
				}
		    }else{
		    	$("#bgFilter").css("display","block");
				$(".recover_history").css("display","block");
                setTimeout(function(){
                    getStudioRestore();
                },3000);
		    }
		}
	});
}
//刷新时判断PGM是否在录制视频
function queryRecordInfo(){
    if(!studioBehavior) return false;
	var mainId = JSON.parse(decodeURIComponent(studioBehavior));
    mainId= mainId.SelectR.peerId;
    var params={
		"rid": mainId,
    }
    oUtils.ajaxReq("/producerpro/record/current_session",params, function (data) {
    	var sources=data.Sources;
    	if(sources==undefined) return
    	if(sources.length>0){
            for(var i=0;i<sources.length;i++){
                if(sources[i].ID =="StudioOutputPreview"){
                	var record=sources[i].Records;
                	for(var j=0;j<record.length;j++) {
                		if(record[j].EndTimestamp==0){
                			$(".iconStopRecordBtn").removeClass('hide');
                	        $(".iconRecordBtn").addClass('hide');
                	        var startRecordTime=record[j].StartTimestamp;
                	        var nowtime= new Date();
                	        nowtime=nowtime.getTime();
                	        var recordTime=parseInt(nowtime-startRecordTime)/1000;
                	        clockObj.recordSeconds=recordTime;
                	        clockObj.recordTimer=setInterval(function(){
				                clockObj.recordSeconds++;
					            $(".recordTime").html(transTimeByms(clockObj.recordSeconds));
				            },1000);
	                	}
                	}
                }
            }
        }
    });
}

