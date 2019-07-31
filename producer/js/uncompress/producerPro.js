var overlying = overlayObj.overlying;
//RId
var allRidArray = [];
$(function () {
	FastClick.attach(document.body);

	//点击页面其他地方，下拉/弹窗消失
	$(document).on("click", function () {
		clickPageHide();
		//消失afv下拉列表
		$(".afv-audio-cut .audio-select").css("display", "none");
		//消失字体大小选择列表
		$(".fontSize-ul").css("display", "none");
		//消失字体样式选择列表
		$(".sd-font-family .family-ul").css("display", "none");
		// $(".pip-out-source").css("display", "none");
		$(".pip-in-source").css("display", "none");
		//token 下拉框消失
		$(".pack-camera ul").css("display", "none");
		$(".upload-body").css("overflow","hidden");
		$(".textArrow").css("display", "none");
		$(".pushing").addClass("hide");
	})
	$(document).on("click", ".alert_popupBg", function (e) {
		e.stopPropagation();
	});
	
	var currentUrl=window.location.host;
	var typeNumber = $(".businessType").text();
	localStorage.setItem("businessType",typeNumber);
	localStorage.setItem('session', session);
	var userName=$("#user_info_name").text();
	localStorage.setItem('userName', userName);
	
    //跳转到购买页面
	$(".purchase-alert div,.refueling-package div").click(function(){
		window.open("http://" + window.location.host + "/producerpro/bussinessSystem.html")
	});

	//线上不展示voIp的功能	
    if(currentUrl.indexOf("producer.tvunetworks")<0){
    	statusObj.isVoIpFunction = true;
	}

	$(".purchase-promptbox div").click(function(){
		window.open("http://" + window.location.host + "/producerpro/bussinessSystem.html?p");	
	})

    //最后5分钟提示框
	$(".purchase-promptbox img").click(function() {
		$(".purchase-promptbox").css("display","none");
	});
    
    //跳转用户下载页面
    $("#user_manager").click(function(){
    	window.open("http://" + window.location.host + "/producerpro/producerManage.html");
	});
	
	$(".charge").click(function(){
		if(userRecord==0){
			window.open("http://" + window.location.host + "/producerpro/bussinessSystem.html");
		}else{
			if(isNewUser==1){
				window.open("http://" + window.location.host + "/producerpro/bussinessSystem.html");
			}else{
				window.open("http://" + window.location.host + "/producerpro/bussinessSystem.html?p");
			}	
		}
	});

    /*
	* author:rachel
	* function: number change
	* params: null
	*/
    //获取焦点视频切换  这一段有点蠢需要修改一下
	$(".preview-source").on("click",function(){	
		$(this).addClass('change');
		$(".output-source").removeClass('change');
    	$(".pip").removeClass('change');
		if($(".preview-source").find(".changepoint").length >0) return;
    	var pointHtml='<div class="changepoint"><p style="left:-5px;top:-5px;"></p><p style="right:-5px;top:-5px;"></p><p style="left:-5px;bottom:-5px;"></p><p style="right:-5px;bottom:-5px;"></p></div>';
    	$(".preview-source").append(pointHtml);	
	})
	$(".output-source").on("click",function(){
		$(".apply-preview  .radius-box").trigger('click');
    	$(".preview-source").removeClass('change');
    	$(".changepoint").remove();
    	$(".pip").removeClass('change');
	})
	$(".preview-source").on("click",".pip",function(){
    	$(this).addClass('change');
    	$(".preview-source").removeClass('change');
    	$(".output-source").removeClass('change');
    	$(".changepoint").remove();
    	return false;
	})


	//点击切换视频
	$(".sd-preview-list").on("click", ".preview-item-video", function () { //选择preview
		var thisObj = $(this).parents(".preview-item");
		var filename = thisObj.attr("data-filename");
		var params = {SelectedSharedMemory:filename};
		var begin=new Date();
		var timeStamp = calPts(thisObj.find("video").attr("id"));
		params["SubTimestamp"] = timeStamp||0;
		var end=new Date();
		var time=end-begin;
		console.log("setStudioLiveSharedMemory time:",timeStamp,time);	
		var param = {
			rid: currentRInfo.selectRId,
			params: JSON.stringify(params)
		};
		var index =thisObj.index();
		var pipObj = $(".pretreat-content .pip");
		var pipparams = {
			"id": $(".pretreat-content .pip").attr("data-id"),
			"pipVideoSharedMemoryName":filename  // 将要变更的pip name
		}
		var tallyArr = [];
		if($(".apply-preview .radius-box").hasClass('shut')|| $(".output-source").hasClass('change')){
			VideoCut(thisObj,false);
		}else if($(".preview-source .pip").hasClass("change")){
			changePipSource(index+1);//切换pip视频源代码
		}else{
			//获取之前preview中的相关状态 
			//tally 相关 设置pgm视屏在被替换后的tally信号（获取在pgm中的R的状态）
			var previewFilename = $(".main-preview").attr("data-filename"); 
			var beReplacedTallyBox=tally.getBeReplacedTallyBox(previewFilename);
			if(beReplacedTallyBox!==null){
				var previewTally={};
				previewTally["rid"] = $(".preview-source").attr("data-rid");
				if(!beReplacedTallyBox.hasClass("outPutActive")&&!beReplacedTallyBox.hasClass("pipOutputActive")&&!beReplacedTallyBox.hasClass("pipPreviewActive")){//其他状态不发送请求
					previewTally["type"] = 130;
					tallyArr.push(previewTally);
				}
			}
			//获取当前点击R的相关状态（如果不是R，没有Rid，不会走这儿）
			var rid = thisObj.attr("data-rid");
			if(rid!==undefined){
				if(!thisObj.hasClass("outPutActive")&&!thisObj.hasClass("pipPreviewActive")&&!thisObj.hasClass("pipOutputActive")){
					var previewTally = {};
					previewTally["rid"] = rid;
					previewTally["type"] = 131;
					tallyArr.push(previewTally);
				}
			}
			param["tallyArray"] = JSON.stringify(tallyArr);
			oUtils.ajaxReq("/producerpro/setStudioInputPreview", param, function (data) {
				var errorCode = data.errorCode;
				if (errorCode == "0x0") {
					clipDot.changeVideoCut(true);
					$("#preview").removeAttr("data-storyid");
					// var lastIndex = $(".preview-content li.previewActive").index();
					updateMainPreview(filename);
				}
			})
		}	
	});
	
	//preview 切 output
	$(".main-cut-btn").on("click", function () { 
		$(".sd-pretreat-operation").removeClass('active');
		if($(this).hasClass("disabled")) return false;
		VideoCut($(".main-preview"),true);
	});

  	function VideoCut(thisObj,flag){
   		if(!mix_fn.isPrower("VideoCut")) return false;
   		if($(".preview-source .clip").length!=0&&!$(".main-preview .applyBtn.radius-box").hasClass("shut")&&flag){
			clipDot.expressApply("record/express_apply");
		}else{
			var filename = thisObj.attr("data-filename"),
			tallyArr = []; 
			//tally 相关 设置pgm视屏在被替换后的tally信号（获取在pgm中的R的状态）
			var outputFileName = $(".main-output").attr("data-filename"); 
			var beReplacedTallyBox=tally.getBeReplacedTallyBox(outputFileName);
			if(beReplacedTallyBox!==null){
				var outputTally={};
				outputTally["rid"] = $(".output-source").attr("data-rid");
				if(beReplacedTallyBox.hasClass("pipOutputActive")){
					//这儿什么也不做，因为即便你状态改变，但是pip还在播放
				}else if(beReplacedTallyBox.hasClass("previewActive")||beReplacedTallyBox.hasClass("pipPreviewActive")){
					outputTally["type"] = 131;
					tallyArr.push(outputTally);
				}else{
					outputTally["type"] = 130;
					tallyArr.push(outputTally);
				}
				
			}
			//tally 相关 设置pgm视屏在被替换后的tally信号（获取在preview中的R的状态）
			var previewFilename = thisObj.attr("data-filename"); 
			if($(".preview-source").attr("data-rid")!==undefined){
				var previewTally={};
				previewTally["rid"] = $(".preview-source").attr("data-rid");
				previewTally["type"] =132;
				tallyArr.push(previewTally);
			}
			// $(".main-cut").css("background-color","pink");
			var params = {SelectedSharedMemory: filename};
			var timeStamp = calPts($(".main-preview .main-player").attr("id"));
			// params["SubTimestamp"] = timeStamp||0;
			params["SubTimestamp"] = timeStamp||0;
			$("#preview .timeStamp").html(timeStamp);
			console.log("setStudioLiveSharedMemory time:",timeStamp);
			var param = {
				rid: currentRInfo.selectRId,
				params: JSON.stringify(params),
				tallyArray:JSON.stringify(tallyArr),
			};

			oUtils.ajaxReq("/producerpro/setStudioLiveSharedMemory", param, function (data) {
				var errorCode = data.errorCode;
				if (errorCode == "0x0") {
					updateMainOutput(filename);
				}
			})
		}
	}
			
	//键盘键入切换
	$(document).keyup(function(event) {
		var keyCode= event.keyCode;
		if(keyCode==32){
			if(($("#preview .preTextarea").is(':focus')==false) && ($(".scoreDiv .scoreText").is(':focus')==false)){
				VideoCut($(".main-preview"),true);
			}
		}
		if((($(".scoreDiv .scoreText").is(':focus')==false) && ($(".scoreDiv").find(".point").hasClass('show'))) || (($("#preview .preTextarea").is(':focus')==false) && $("#preview .textDiv").find(".point").hasClass('show'))){
			return false;
		}	
		if(($("#preview .preTextarea").is(':focus')==true||$(".scoreDiv .scoreText").is(':focus')==true||$("#sd-textarea").is(':focus')==true||$(".sd-score input").is(':focus')==true||$(".ip-address input").is(':focus')==true)||$(".push-nickname").is(':focus')==true||$(".trimItem").is(':focus')==true||$(".description").is(':focus')==true||$(".TimeSet input").is(':focus')==true||$(".defaultTime input").is(':focus')==true) return false;
		
		if(keyCode>96&&keyCode<106){
			keyCode=keyCode-96;
		}else if(keyCode>48&&keyCode<57){
			keyCode=keyCode-48;
		}
		$(".preview-content .preview-item").eq(keyCode-1).find(".preview-item-video").trigger("click");
	});
});
//获取用户记录行为
function getUserBehavior(){
 	$.ajax({
		type: "POST",
		url: "/producerpro/getUserBehavior",
		data: {
			pn:'sd'
		},
		dataType: "json",
		success: function (data) {
			if(data.errorCode=="0x0"){
				if(data.userBehavior){
					currentRInfo.selectRUserBehavior = JSON.parse(data.userBehavior);
					var mainRId=$(".rList-show").attr("data-peerId");
					var userBehavior = currentRInfo.selectRUserBehavior;
					if(userBehavior.directChange){
						var existFlag = false;
						for(var i=0;i<userBehavior.directChange.length;i++){//刷新时根据接口里保存的数据判断是否是直切模式
					        var userBehaviorMainId=userBehavior.directChange[i].mainRid;
							if(userBehaviorMainId==mainRId){
								existFlag = true;
								var  userBehaviorStatus=userBehavior.directChange[i].status;
					            if(userBehaviorStatus=="shut"){
					          	    initOverlay.directChangeShut();
					            }else{
					          	    initOverlay.directChangeOpen();
					            }
					        }
					    }
					    if(!existFlag) {
					    	initOverlay.directChangeOpen();
				       }
				    }
				}	
			}
		},
		error:function(error){
			console.log(error.errorInfo);
		}
	});
}

//点击页面弹窗消失
function clickPageHide() {
	$(".pagehide").addClass("hide");
}

/*--------页面初始化 E--------*/
setInterval(function(){
	if(currentRInfo.isLive>0){
		//producer
		var param = {
			rid:currentRInfo.selectRId,
			params:currentRInfo.selectRId,
			reStartflag: true
		}
		oUtils.ajaxReq("/producerpro/queryStudioInfo",param);
	}
},10000);
oUtils.ajaxReq("/producerpro/studio_open");

//更新主预览视频信息
function updateMainPreview(filename) {
	$(".main-preview").attr("data-filename", filename);
	var previewObj = $(".sd-preview-list .preview-item[data-filename='"+filename+"']");
	if(previewObj.length<=0)return;
	previewObj.addClass("previewActive").siblings().removeClass("previewActive");
	if($(".sd-preview-list .preview-item.pipPreviewActive").length!=0){
		var pipPreviewIdx = $(".sd-preview-list .preview-item.pipPreviewActive").index();
		$(".pip-setting .pip-in-sel p").html(pipPreviewIdx+1);
	}
	if(previewObj.attr("data-rid")){
		$(".preview-source").attr("data-rid",previewObj.attr("data-rid"));
	}else{
		$(".preview-source").removeAttr("data-rid");
	}
}
//更新主输出视频信息
function updateMainOutput(filename) {
	$(".main-output").attr("data-filename", filename);
	var outputObj = $(".sd-preview-list .preview-item[data-filename='"+filename+"']");
	if(outputObj.length<=0)return;
	outputObj.addClass("outPutActive").siblings().removeClass("outPutActive");
	var outputIndex = $(".sd-preview-list .preview-item.outPutActive").index();
	$(".pip-setting .pip-out-sel p").html(outputIndex+1);
	if(outputObj.attr("data-rid")){
		$(".output-source").attr("data-rid",outputObj.attr("data-rid"));
	}else{
		$(".output-source").removeAttr("data-rid");
	}
}

//为推流获取liveVideoId
function getLiveVideoId(rtmpUrl) {
	var start = rtmpUrl.indexOf("/rtmp/") + 6;
	var liveVideoId = rtmpUrl.substring(start, start + 15);
	return liveVideoId;
}
// 视频预处理
$(function () {
	//切换控制台
	$(".sd-pretreat").on("click", ".operation-confirm", function () {
		$(".sd-pretreat-operation").removeClass("active");
		$(".sd-operation-type").css("display", "block");
	});

	$(".sd-pretreat").on("click", ".operation-close", function () {
		$(".sd-pretreat-operation").removeClass("active");
		$(".operation-text").removeAttr("disabled");
	});
	$(".sd-pretreat").on("click", ".operation-logo-label", function (e) {
		if ($(this).hasClass("disabled")) e.preventDefault();
	});
});

//重置页面，切换R/R下线时需要
function resetPage() {
	$(".main-preview").removeAttr("data-filename");
	$(".main-preview .preview-source .big-video").html("");
	$(".main-output").removeAttr("data-filename");
	$(".main-output .output-source .big-video").html("");
	$(".sd-preview-list .preview-content").html("");
	initSystem.webrtcVideo.clear();
	$(".operation-view-logo").removeClass("outputActive");
	$(".operation-view-logo img").prop("src", "./images/logo.png");
	$(".pretreat-item-logo").removeClass("outputActive");
	$(".operation-item-logo img").prop("src", "./images/logo.png");
	$(".output-top .shareCounts").html(0).removeClass("active");
	$(".show-logo .pretreat-item-logo").remove();
	$(".show-logo .pretreat-item-logo").remove();
	$(".show-score .pretreat-item-score").remove();
	$(".show-text .pretreat-item-text").remove();
	$(".pip-picture").removeClass("created");
	$(".afv-cut .radius-box").css("left","11px");
	$(".afv-cut .afv-audio").addClass("disabled");
	$(".afv-cut .afv-audio").html("Audio 1");
	$(".afv-cut .radius-box").removeClass("close");
	$(".preview-source .audio").remove();
	$(".output-source .audio").remove();
	statusObj.pageInit = true;
	// webrtc 不能删除
	peerClientStatusArr.isWebRTCDisconnect = false;//为了避免R的状态不对造成断开清除页面
	peerClientStatusArr.ipsourceFileName = "";//清空数组，以防止切换R冲突。
	peerClientStatusArr.disconnectNum = 0;
	// peerClientStatusArr.previewListNum= 0;
	peerClientStatusArr.previewList=false;
	volume.volumeColumn.volumeObj={};
	//这是logo列表加载完成 全局变量
	peerClientStatusArr.resetVideoList = [];
	currentRInfo.rtcIdList = {
		pvw:"",
		pgm:{
			id:[],
			data:null
		},
		preLis:{
			idArr:[],
			data:[]
		}
	}
}


//叠加效果推送
$(".overlay-cut-btn").on("click", function () {
	if(!mix_fn.isPrower("OverlayCut")) return false;
	//获取叠加效果的个数
    $(".sd-pretreat-operation").removeClass('active');
	var overlaySum = $("#preview .xingquanDrag").length;//获得可以拖拽的文件
    var scoreNum = $(".preview-source .scoreDiv").length;
    var logoBoxNum = $("#preview .logo-box").length;
	if(7<overlaySum){
		oUtils.alertTips("i18n_producerPro_maxOverlayNum");
		return false;
	}else if(4<logoBoxNum-scoreNum){
		oUtils.alertTips("i18n_producerPro_maxOverlayImgNum");
		return false;
	}
	// if(statusObj.isWebRander){
	// 	var randerHtml=queryTextImgObj.randerEvent();
	// 	var pipZorder=$('#preview .pip').attr("z-index");
	// 	var logoZorder=$('#preview .textDiv').attr("z-index");
	// 	var commonZorder=1;
	// 	if(pipZorder>logoZorder){
	// 		commonZorder=pipZorder-1;
	// 	}else{
	// 		commonZorder=pipZorder+1;
	// 	}
	// 	var params={
	// 		'rid':$(".rList-show").attr("data-peerId"),
	// 		'html':randerHtml,
	// 		'zOrder':4,
	// 	}
	// 	oUtils.ajaxReq("./saveOrUpdateHtml", params, function (data) {
	// 		if (data.errorCode == "0x0") {
	// 			console.log(112233);
	// 		}
	// 	});
	// }
	var textParams = overlayCut.textCut();
	overlayCut.logoCut(textParams);
	overlayCut.pipCut();
	overlayCut.clockCut();
	cutToPgm();
});
$(".preview-list-container").on("click",function(){
	$(".sd-pretreat-operation").removeClass('active');
})

// 判断logo是否为偶数
function needEven(num){
    if(num%2==1){
        num++;
    }
    return num;
}

//获取属性
function getAttrs(className, params) {
	for (var Key in params) {
		params[Key] = $(className).attr("data-" + Key);
	}
	return params;
};

/*
 * author: daniel
 * function: afv
 * params: 无
 */
$(function () {
	//点击afv切换按钮
	$(".afv-cut .afv-name").on("click", function(){
		$(".afv-cut .radius-box").trigger("click");
	})
	$(".afv-cut .radius-box").on("click", function () {
		var thisObj = $(this);
		var params = {
			'rid': $(".rList-show").attr("data-peerId"),
			'flag': true,
		}
		if (thisObj.hasClass("close")) {
			var param = { "IsAudioFollowVideo": true};
			params["params"] = JSON.stringify(param);
			oUtils.ajaxReq("/producerpro/setStudioPreviewAudio", params, function (data) {
				// $(".overlay-cut-btn").trigger("click");
				// $(".main-cut-btn").trigger("click");
				currentRInfo.IsAudioFollowVideo=0;
				thisObj.removeClass("close");
				thisObj.animate({ left: "11px" });
				$(".afv-audio-cut .afv-audio").addClass("disabled");
				if($(".main-output .icon-erphone").hasClass("active")){
					$("video").prop("volume",0);
					if(currentRInfo.outputPreview){
						var filename = $(".main-output").attr("data-filename");
						// $(".main-output .main-player").prop("volume",$(".preview-content .preview-item[data-filename='"+filename+"'] video")[0].volume);
						$(".main-output .main-player").prop("volume",1);
						if($(".output-source .pip").length!=0){
							var pipFilename = $(".output-source .pip").attr("data-pipvideosharedmemoryname");
							$(".main-output .pip video").prop("volume",$(".preview-content .preview-item[data-filename='"+pipFilename+"'] .voice-value").html().trim()/100);
							$(".main-output .pip video")[0].muted=false;
						}
					}else{
						$(".main-output .main-player").prop("volume",1);
					}
				}
			});
		} else {
			var index = $('.preview-list-container .outPutActive').index();
			var AudioOnlyShm = $('.preview-list-container .outPutActive').attr("data-filename");
			var param = { "IsAudioFollowVideo": false, "AudioOnlyShm": AudioOnlyShm };
			params["params"] = JSON.stringify(param);
			oUtils.ajaxReq("/producerpro/setStudioPreviewAudio", params, function (data) {
				if (data.errorCode === "0x0") {
					currentRInfo.IsAudioFollowVideo=0;
					thisObj.addClass("close");
					thisObj.animate({ left: "0rem" });
					$(".afv-audio-cut .afv-audio").removeClass("disabled");
					$(".afv-audio").html("Audio "+(index+1));
					if($(".main-output .icon-erphone").hasClass("active")){
						$("video").prop("volume",0);
						if(currentRInfo.outputPreview){
							$(".main-output .main-player").prop("volume",1);
							// $(".preview-content .preview-item[data-filename='"+AudioOnlyShm+"'] video").prop("volume",$(".preview-content .preview-item[data-filename='"+AudioOnlyShm+"'] .voice-value").html().trim()/100);
							// $(".preview-content .preview-item[data-filename='"+AudioOnlyShm+"'] video")[0].muted=false;
						}else{
							$(".main-output .main-player").prop("volume",1);
						}
					}
					return;
				} else {
					oUtils.alertTips(data.errorInfo, 1500);
				}
			});
		}
	});
	//给下拉列表添加滚动条
	$(".audio-select").fnNiceScroll();
	$(".pretreat-content").fnNiceScroll();
	$("#detailPush .popupContent_content").fnNiceScroll("#444");
	//显示与隐藏下拉列表事件
	$(".afv-audio").on("click", function (e) {
		//获取相应的列表并且显示
		var audioAfvHtml =''; 
        for(var i =0; i<$(".preview-content li").length;i++){
            audioAfvHtml+="<li>Audio "+(i+1)+"</li>";
        }
        $(".afv-audio-cut .audio-select").html(audioAfvHtml);
		e.stopPropagation();
		var thisObj = $(this);
		if (!thisObj.hasClass("disabled")) {
			if (thisObj.hasClass("check")) {
				thisObj.removeClass("check");
				$(".afv-audio-cut .audio-select").css("display", "none");
			} else {
				thisObj.addClass("check");
				$(".afv-audio-cut .audio-select").css("display", "block");
			}
		}
	});
	//给afv下拉列表中的R添加事件
	$(".afv-audio-cut").on("click", ".audio-select li", function (e) {
		e.stopPropagation();
		var thisObj = $(this);
		var audioHtml = thisObj.html();
		// $(".afv-audio-cut .afv-audio").html(audioHtml);
		//获取索引
		var index = audioHtml.indexOf("o");
		index = audioHtml.substring(index + 1);
		var params = {
			'rid': $(".rList-show").attr("data-peerId"),
			'flag': true,
		}
		var audioLi = $($('.preview-list-container li')[index - 1]);
		var AudioOnlyShm = audioLi.attr("data-filename");
		var param = { "IsAudioFollowVideo": false, "AudioOnlyShm": AudioOnlyShm };
		params["params"] = JSON.stringify(param);
		oUtils.ajaxReq("/producerpro/setStudioPreviewAudio", params, function (data) {
			if (data.errorCode === "0x0") {
				currentRInfo.IsAudioFollowVideo=0;
				$(".afv-audio").html("Audio "+index);
				if(currentRInfo.outputPreview && $(".main-output .icon-erphone").hasClass("active")){
					$("video").prop("volume",0);
					var previewObj = $(".preview-content .preview-item[data-filename='"+AudioOnlyShm+"']");
					var outputFilename = $(".main-output").attr("data-filename");
					// if(outputFilename==AudioOnlyShm){
					$(".main-output .main-player").prop("volume",1);
					$(".main-output .main-player")[0].muted=false;
					// }else{
					// 	previewObj.find("video").prop("volume",previewObj.find(".voice-value").html().trim()/100);
					// 	previewObj.find("video")[0].muted=false;
					// }
				}
				return;
			}
		});
		$(".afv-audio-cut .afv-audio").removeClass("check");
		$(".afv-audio-cut .audio-select").css("display", "none");
	})
});
//获取上一次的afv关闭情况下的选中声音
// function getAfvCloseAudioIndex(){
// 	var lastAudio = $(".afv-audio-cut .afv-audio").html();//获取上一次声音的索引内容
// 	var lastIndex = lastAudio.indexOf("o");
// 	return  (lastAudio.substring(lastIndex + 1))-1;
// }

String.prototype.gblen = function() {  
    var len = 0;  
    for (var i=0; i<this.length; i++) {  
      if (this.charCodeAt(i)>127 || this.charCodeAt(i)==94) {  
         len += 2;  
       } else {  
         len ++;  
       }  
     }
    return len;  
 }
// 点击input框出现编辑框
$("#preview").on("click", ".preTextarea", function (e) {
	 var thisObj=$(this);
     $(".sd-text").removeClass("hide");
	 $(".sd-pretreat-container .pretreat-content").addClass("hide");
	 $(".operation-text").addClass("active");
	 $(".operation-text").siblings().removeClass('active');
	 $("#sd-textarea").val($("#preview .preTextarea").text());
	 $(".sd-font .sd-font-ul").css("display", "none");
	 $(".sd-font-family .family-ul").css("display", "none");
	 $(".changepoint").remove();
	 $(".sd-text").siblings().addClass('hide');
	 fontInfo(thisObj);
	 e.stopPropagation();
});

function fontInfo(font){
	var fbg=font.css("background-color");
	$(".left .sp-preview-inner").css("background-color",fbg);
	var fcolor=font.css("color");
	$(".sd-font-color .sp-preview-inner").css("background-color",fcolor);
	var fontFamily=font.css("font-family");
	$("#fontFamily").text(fontFamily);
	if(fontFamily.indexOf("Proxima Nova Condensed")>-1){
		$("#fontFamily").text("Proxima Nova Con...");
	}
	var fontSize= font.css("font-size").split("p")[0];
	$(".size-input").text(fontSize);
	var content=font.text();
	$("#sd-textarea").val(content);
}

function changeColor(value) {
    if (/rgb?/.test(value)) {
        var array = value.split(",");
        value = "#";
        var alpha = "";
        if (array.length > 3){
			alpha = array[3].replace(/[^\d]/gi, '');
			alpha = parseInt(alpha/100*255, 10).toString(16);
			if(alpha==0){
				value="#00";
			}else{
				value+=alpha;
			}
        }else{
        	value+="FF";
        }
        for (var i = 0, color;i<3;) {
        	color = array[i++];
            color = parseInt(color.replace(/[^\d]/gi, ''), 10).toString(16);
            value += color.length == 1 ? "0" + color : color;
        }
        value = value.toUpperCase();
    }
    return  value;
}
function HexToRgba(hex,opacity){
	var fOpacity = parseInt("0x"+opacity,16);
	fOpacity=fOpacity/255;
	fOpacity=fOpacity.toFixed(2);
	return "rgba(" + parseInt("0x" + hex.slice(0, 2)) + "," + parseInt("0x" + hex.slice(2, 4)) + "," + parseInt("0x" + hex.slice(4, 6)) + "," + fOpacity + ")"; 
}

// 更新Clock
function updateClock(start,endTime,operation){
	var clockId=$(".clockDiv").attr("data-id");
	// var player = webflv.playObj[$(".main-preview .main-player").attr("id")]["player"];
	// var timeStamp = Math.round(player.currentTime * 1000) + player._muxer.dtsBase;
	var timeStamp = calPts($(".main-preview .main-player").attr("id"));
	var obj={};
	if (clockId){
		obj=overlayCut.clockSubtitle();
		console.log(obj);
		obj["startTime"]=start;
		obj["endTime"]=endTime;
		obj["timestamp"]=timeStamp;
		obj["operation"]=operation;
	}else{
		obj={
		    "operation": "destroy",
		    "xOffset": 101,
		    "yOffset": 10,
		    "zorder": 1,
		    "height": 300,
		    "width": 200,
		    "startTime": 111,
		    "endTime": 100000,
		    "timestamp": 12345678
   		};
   		obj.style = {
	        "fontSize": 93,
	        "backgroundColor": "00000000",
	        "fontName": "Arial",
	        "foregroundColor": "FFFFFFFF"
	    };
	    clockid = "";
	}
	$.ajax({
		type: "POST",
		url: "/producerpro/clock_update",
		async:false,
		data: {
			id: clockId,
			params: JSON.stringify(obj)
		},
		success: function (data) {
			data = JSON.parse(data);
			if (data.errorCode == "0x0") {
				var result = data.result;
				if(result!= undefined && result!= "" ) {
					// oUtils.alertTips("i18n_applySuccess", 2000);
					var cleck= result.checked;
				    $(".clockDiv").attr("data-check",cleck);
					var temp = result;
					overlying.clockInit(result, true);	
				}
			}
		}
	});
}
// 把Clock的信息发给T
function applyClockToPgm(start,endTime){
	var peerid = $(".rList-show").attr("data-peerId");
	var clockid=$("#preview .clockDiv").attr("data-id");
	// var player = webflv.playObj[$(".main-preview .main-player").attr("id")]["player"];
	// var timeStamp = Math.round(player.currentTime * 1000) + player._muxer.dtsBase;
	var timeStamp = calPts($(".main-preview .main-player").attr("id"));
	var obj={};
	if (clockid){
		var operation=$("#preview .clockDiv").attr("data-operation");
		obj=overlayCut.clockSubtitle();
		obj["startTime"]=start;
		obj["endTime"]=endTime;
		obj["timestamp"]=timeStamp;
		obj["operation"]=operation;
	}else{
		obj={
		    "operation": "destroy",
		    "xOffset": 101,
		    "yOffset": 10,
		    "zorder": 1000,
		    "height": 300,
		    "width": 200,
		    "startTime": 111,
		    "endTime": 100000,
		    "timestamp": 12345678
   		};
   		obj.style = {
	        "fontSize": 93,
	        "backgroundColor": "00000000",
	        "fontName": "Arial",
	        "foregroundColor": "FFFFFFFF"
	    };
	    clockid = "";
	    var destoryObj = $(".show-clock .pretreat-item-clock");
	}
	$.ajax({
		type: "POST",
		url: "/producerpro/clock_check",
		data: {
			peerId: peerid,
			id:clockid,
			params: JSON.stringify(obj)
		},
		success: function (data) {
			data = JSON.parse(data);
			if (data.errorCode == "0x0") {
				var result = data.result;
				// oUtils.alertTips("i18n_applySuccess", 2000);
				if(result!= undefined && result!= "" ) {
					var cleck= result.checked;
				    $(".clockDiv").attr("data-check",cleck);
					var temp = result;
					overlying.clockInit(result, true);
					if(currentRInfo.outputPreview){
						overToPreview.clockInit(data.result, ".output-source .big-video");
						var timeTextarea = JSON.parse(data.result.style).text;
						var startVal = timeTextarea.split(":");
						var min = parseInt(startVal[0])*60;
						var second = parseInt(startVal[1]);
						var timeValue = parseInt(min+second);
						var backgroundColor,endTime=data.result.endTime;
						if(endTime/1000<timeValue){
							backgroundColor = 'red';
						}else{
							backgroundColor = '';
						}
						$("#preview .clockDiv").css("background",backgroundColor);	
					}
				}
				if(obj.operation =="destroy"){//此段代码是在clock销毁后为了再次创建而绑定的operation
					if(destoryObj.length!==0){
						var params=destoryObj.attr("data-params");
						params=decodeURIComponent(params);
						params = JSON.parse(params);
						params.operation="create";
						params = JSON.stringify(params);
						var param=encodeURIComponent(params);
						destoryObj.attr("data-params",param);
						if($(".clockStart").hasClass('hide')){
							saveClockuserBehavior("start","pvw");
						}else{
							saveClockuserBehavior("create","pvw");
						}	
					}
					$(".output-source .big-video .clockDiv").remove();
				}
			}
			overlayCut.isCut = false;
		}
	})
};

function saveClockuserBehavior(Status,location){
	var params={};
	params.status= Status;  // 记录Clock的状态，start在运作，stop暂停
	params.location= location;  // 记录Clock的位置，pvw/pgm
	updateUserBehavior(params);
	$.ajax({
		type: "POST",
		url: "/producerpro/saveUserBehavior",
		data: {
			pn:"sd",
			remark:"ProgramClock",
			content: JSON.stringify(params)
		},
		success: function (data) {
			data = JSON.parse(data);
		}
	});
}

function saveSingularuserBehavior(Status,singular){
	var params={};
	params.status= Status;  // 记录Clock的状态，start在运作，stop暂停
	params.url= singular;  // 记录Clock的位置，pvw/pgm
	$.ajax({
		type: "POST",
		url: "/producerpro/saveUserBehavior",
		data: {
			pn:"sd",
			remark:"Singular",
			content: JSON.stringify(params)
		},
		success: function (data) {
			data = JSON.parse(data);
		}
	});
}
/*
 * author: rachel
 * function: add score
 * params: 
 */
$(function () {
	//创建比分牌
	$(".preview-source").on("click",".scoreDiv",function(e){
		e.stopPropagation();
		$(".changepoint").remove();
	});
	
	$(".preview-source").on("keydown",".scoreText",function(e,textValue){
		var thisObj=$(this);
		var keyCode = event.keyCode;
		var textValue = thisObj.val();
		var textWidth=thisObj.width();
		var lengthAll=0;
		textWidth = widthAndHeight.getPriviewHeight("#preview", null, textWidth);
		
		for (var i = 0; i < textValue.length; i++) {
			var tempChar = textValue[i];
			if (tempChar.charCodeAt() > 255) {
				lengthAll += 22;
			} else {
				lengthAll += 11;
			}
		}
		if(lengthAll>textWidth) {
			if(keyCode == 8 ||keyCode == 46 || (keyCode >= 37 && keyCode <= 40)) {
				return true;
				thisObj.focus();
			} else {
				thisObj.blur();
				return false;
			}
		}
		// if(keyCode == 229)$(".register-body").css("display","none");
	});

	var clickToLeft = true;
   // 比分牌左右箭头切换
	$(".icon-sdleft").on("click", function () {
		if(!clickToLeft)return;
		clickToLeft = false;
		var liLength = $(".score-pattern li").length;
		if (liLength <= 2) {clickToLeft = true;return;}
		var left = $(".score-pattern ul").position().left;
		var leftLi = -(left / 250);
		if (left >=0) {clickToLeft = true;return;}
		// if ( leftLi >= (liLength - 7)){clickToLeft = true;return;}
		$(".score-pattern ul").animate({ left: (left + 250) + "px" },function(){
			clickToLeft = true;
		});	
	});
	$(".icon-sdright").on("click", function () {
		if(!clickToLeft)return;
		clickToLeft = false;
		var liLength = $(".score-pattern li").length;
		var left = $(".score-pattern ul").position().left;
		if (liLength <= 3&&left>=0) {clickToLeft = true;return;}
		if (left <=-500) {clickToLeft = true;return;}
		$(".score-pattern ul").animate({ left: (left - 250) + "px" },function(){
			clickToLeft = true;
		});
	});
})

 
$(".preview-source").on("click",".scoreDiv",function (e) {
	var thisObj = $(this);
	 var dataUrl = thisObj.attr("data-url");
	 $(".sd-score").removeClass("hide");
	 $(".sd-pretreat-container .pretreat-content").addClass("hide");
	 $(".operation-score").addClass("active");
	 $(".changepoint").remove();
	 $(".operation-score").siblings().removeClass('active');
	 $(".operation-view-score").css("border","");
	 var scoreObj = $(".operation-view-score[data-url='"+dataUrl+"']");
	 scoreObj.css("border","1px solid #41FF6D");
	 $(".sd-score").siblings().addClass('hide');
	 e.stopPropagation();
})

// 更新字幕与比分牌字幕接口
function updateMultiCheck(openflag,base64) {
	var text = $("#preview .preTextarea").text();
	var scoreId = $("#preview .scoreDiv").attr("data-id");
	var peerid = $(".rList-show").attr("data-peerId");
	var textid = $("#preview .preTextarea").attr("data-id");
	var clockid=$(".clockDiv").attr("data-id");
	var paramArray = [];
	if (text != undefined && text !="") {
		var obj=overlayCut.subtitleCom();
		if(base64){
			var opts = {
	            size: obj.width+"x"+obj.height,
	            bgcolor: $(".preview-source .textDiv").css("background-color"), 
	            color: $(".preview-source .preTextarea").css("color"),
	            text: $(".preview-source .preTextarea").html(),
	            fstyle:'normal',
	            fweight: 'normal',
	            fsize:obj.style.fontSize,
	            ffamily:$(".preview-source .preTextarea").css("font-family")
	        }
            base64 = placeholder.getData(opts);
			var index = base64.indexOf(",");
			console.log(base64);
			obj["base64"]=base64.substring(index+1);
		}
		paramArray.push(obj);
	}
	if (scoreId) {
        var subtitleArry=overlayCut.score(false);
        paramArray = paramArray.concat(subtitleArry);
	}
	return paramArray;
};

/*
 * author: daniel
 * function: pip
 * params: 无
 */
//创建pip的时候初始化，在这个时候给后台发信息，获取id
function createPipToInit(thisObj){
  	var pipWidth = 640;
  	var pipHeight = 360;
  	var pipRight = 1100;
  	var pipTop = 560;
  	var width = widthAndHeight.getPriviewWidth("#preview",null,pipWidth);
  	var height = pipHeight/pipWidth*width;
  	var right = widthAndHeight.getPriviewWidth("#preview",null,pipRight);
  	var top = widthAndHeight.getPriviewHeight("#preview",null,pipTop);

  	//不创建webrtc创建pipVideo
	var videoId =$(".preview-content .preview-item").eq(0).find("video").attr("id");
  	var pipHtml = '<div class="pip" style="width:'+width+'px;height:'+height+'px;right:'+right+'px;top:'+top+'px;z-index:'+(currentRInfo.zorder++)+';"><video autoplay style="display:inline-block;z-index:1;width:100%;height:100%;" class="preview-item-video"></video></div>';
  	$("#preview").append(pipHtml);
  	$("#preview .pip").DragAndDrop({callback:correctDrag.correctPip});
  	// $("#preview .pip").xingquanDrag();
  	createPipVideo(videoId);
  	thisObj.addClass("created");
  	var params = overToPreview.getPipInfo();
  	params.zorder = currentRInfo.zorder - 1;
  	var SharedMemoryName = $(".preview-content .preview-item").eq(0).attr("data-filename");
  	//设置pip tally
    $(".preview-content .preview-item").eq(0).addClass("pipPreviewActive");
    if($(".main-preview .icon-erphone").hasClass("active")){
    	volume.setPipVideoVolume();
    }
    var obj = $(".preview-content .preview-item").eq(0);
    var rid = obj.attr("data-rid");
    var tallyArr = [];
    if(rid){
    	var previewTally = {};
    	previewTally["rid"] = rid;
    	if(!obj.hasClass("outPutActive")&&!obj.hasClass("pipOutPutActive")){
    		previewTally["type"] = 131;
    		tallyArr.push(previewTally);
    	}
    }
  	//获取preview外部源的文件名字
  	params["pipVideoSharedMemoryName"] =SharedMemoryName;
  	params["pipAudioSharedMemoryName"] =$(".main-preview").attr("data-filename");
    params["peerId"] = $(".rList-show").attr("data-peerId");
    params["pipXOffset"] = pipRight;
    params["pipYOffset"] = pipTop;
    params["pipWidth"] = pipWidth;
    params["pipHeight"] = pipHeight;
    params["tallyArray"] = JSON.stringify(tallyArr);
	
    $(".pretreat-content .pip").remove();
    var index = 0;
    studioAdd(params,index);  
}
function studioAdd(params,index){
	oUtils.ajaxReq("/producerpro/studio_add", params, function (data) {
        if (data.errorCode == "0x0") {
            overlying.pipInit(data.result);
        } else {
        	index++;
        	if(index==1){
        		oUtils.ajaxReq("/producerpro/studio_add", params, function (data) {
			        if (data.errorCode == "0x0") { 	
			            overlying.pipInit(data.result);
			        } else {
			        	console.log(data.errorInfo);
			        }
			    });
        	}
        	console.log(data.errorInfo);
        }
    });
}
//不创建webrtc,本地进行重连
function createPipVideo(videoId,targetName){
	targetName = targetName?targetName:"#preview";
	var srcObject = $("#"+videoId)[0].srcObject;
	$(targetName + " .pip").find("video")[0].srcObject = srcObject;
	$(targetName + " .pip").find("video").attr("data-videoid",videoId);
	var fileName = $("#"+videoId).parents(".preview-item").attr("data-filename");
	$(targetName + " .pip").find("video")[0].volume = $(".preview-item[data-filename='"+fileName+"'] .voice-value").html().trim()/100;
	if(!$(".main-output .output-erphone .icon-erphone").hasClass("active")){
       $(targetName + " .pip").find("video")[0].muted = true;
    }
}

function changePipSource(index){
	//get select li source info
	var selectObj = $(".preview-content li").eq(index-1);
	var fileName = selectObj.attr('data-filename');
	var previewFileName = $(".preview-source .pip").attr("data-filename");
	if(fileName==previewFileName) return;
		var pipObj = $(".pretreat-content .pip");
		var params = {
			"id": $(".pretreat-content .pip").attr("data-id"),
			"pipVideoSharedMemoryName":fileName  // 将要变更的pip name
		}
		if(!pipObj.hasClass("check")){
			params["checked"] = 1;
		}
		//设置pip tally(先获取上一次tally，判断是否要清除现有的效果)
	    var obj = $(".preview-content .preview-item.pipPreviewActive");
	    var rid = obj.attr("data-rid");
	    var tallyArr = [];
	    if(rid){
	    	var previewTally = {};
	    	previewTally["rid"] = rid;
	    	if(!obj.hasClass("outPutActive")&&!obj.hasClass("pipOutputActive")&&!obj.hasClass("previewActive")){
	    		previewTally["type"] = 130;
	    		tallyArr.push(previewTally);
	    	}
	    }
	    // 先清除相应的pip声音，然后再添加新的pip的声音
	    if($(".main-preview .icon-erphone").hasClass("active")){
	    	volume.delPipVideoVolume("pipPreviewActive");
	    }
		//清除所有的preview list中的 pipPreviewActive 
		$(".preview-content li").removeClass("pipPreviewActive");
		//给当前点击对象添加pipPreviewActive
		selectObj.addClass("pipPreviewActive");
		if($(".main-preview .icon-erphone").hasClass("active")){
	    	volume.setPipVideoVolume();
	    }
		obj = $(".preview-content .preview-item.pipPreviewActive");
	    var rid = obj.attr("data-rid");
	    if(rid){
	    	var toPreviewTally = {};
	    	toPreviewTally["rid"] = rid;
	    	if(!obj.hasClass("outPutActive")&&!obj.hasClass("pipOutPutActive")){
	    		toPreviewTally["type"] = 131;
	    		tallyArr.push(toPreviewTally);
	    	}
	    }
	    params["tallyArray"] = JSON.stringify(tallyArr);
	    /*把studio_update的成功后的代码移动出来start*/
	    //添加logo到preview
		if(!pipObj.hasClass("check")){
			pipObj.addClass("check");
			pipObj.css("border","1px solid #41FF6D");
			var params ={
		  		pipXOffset:'',
		  		pipYOffset:'',
		  		zorder:'',
		  		pipWidth:'',
		  		pipHeight:'',
		  		pipVideoSharedMemoryName:'',
		  		pipAudioSharedMemoryName:'',
		  		audioStatus:'',
			};
			params = getAttrs(pipObj,params);
			overToPreview.pipInit(params);
		}	
		
		//修改preview相关属性
		$(".preview-source .pip").attr("data-filename",fileName);
		$(".pip-in-sel p").html(index);
		$(".preview-source .pip").attr("data-pipVideoSharedMemoryName",fileName);
		$(".pretreat-content .pip").attr("data-pipVideoSharedMemoryName",fileName);
		if($(".pip-in .voice").hasClass("icon-voice")){
			$(".preview-source .pip").attr("data-pipAudioSharedMemoryName",fileName);
			$(".pretreat-content .pip").attr("data-pipAudioSharedMemoryName",fileName);
		}else{
			$(".preview-source .pip").attr("data-pipAudioSharedMemoryName",$(".sd-main .main-output").attr("data-filename"));
			$(".pretreat-content .pip").attr("data-pipAudioSharedMemoryName",$(".sd-main .main-output").attr("data-filename"));
		}
		if($(".pip-in .voice").hasClass("icon-voice")&&$(".pip-out .voice").hasClass("icon-voice")){
			$(".preview-source .pip").attr("data-pipAudioSharedMemoryName",$(".sd-main .main-output").attr("data-filename"));
			$(".pretreat-content .pip").attr("data-pipAudioSharedMemoryName",$(".sd-main .main-output").attr("data-filename"));
		}
	    /*把studio_update的成功后的代码移动出来 end*/
	    var videoId =$(".preview-content .preview-item").eq(index-1).find("video").attr("id");
	    createPipVideo(videoId);
		oUtils.ajaxReq("/producerpro/studio_update",params,function(data){
			if(data.errorCode!="0x0"){
				console.log(data.errorInfo)
			}
		});
}


/*
* author:rachel
* function: Apply preview
* params: null
*/
$(function(){ 
	$(".apply-preview").on("click", ".applyBtn",function () {
		var thisObj = $(".apply-preview  .radius-box");
		if (!thisObj.hasClass("shut")) {
			$(".main-preview .audio").css("display","none");
			if($(".main-preview .icon-erphone").hasClass("active")){
				$(".main-preview .main-player").prop("volume",0);
			}
            initOverlay.directChangeShut();
            var btnStatus="shut";
			savaDirectlyChange(btnStatus);
		} 
		else {
			$(".main-preview .audio").css("display","block");
			if($(".main-preview .icon-erphone").hasClass("active")){
				var filename = $(".main-preview").attr("data-filename");
				var volume = $(".preview-content .preview-item[data-filename='"+filename+"']").find(".voice-value").html();
				$(".main-preview .main-player").prop("volume",volume/100);
			}
			initOverlay.directChangeOpen();
		 	var btnStatus="open";
		 	savaDirectlyChange(btnStatus);	
		}
    })
})

//保存直切的状态
function savaDirectlyChange(data){
	var changeArr={};
	var mainRId=$(".rList-show").attr("data-peerId");
	changeArr.mainRid=mainRId;
    changeArr.status=data;
    var param = {
		"pn": "sd",
		"content": JSON.stringify(changeArr),
		"peerId": mainRId,
		"remark": "directChange"
	}
	oUtils.ajaxReq("/producerpro/saveUserBehavior", param);
}

/**
 * author:daniel,Rachel
 * function:click preview list settings show add remark
 */

$(function(){
	$(".preview-list-container").on("click",".set-name",function(e){
		if(!mix_fn.isPrower("AddAnywhere")) return false;
		if(!$(this).parents(".preview-item").attr("data-rid")) return false;
		// 点击把出现二维码的div渲染上去
		$(".preview-qrcode").remove();
		var liObj = $(this).parents(".preview-item");
		var previewQrcode = '<div class="preview-qrcode"><div class="QrCode select-tokenpair">\
                <div class="close clearFix"><i class="iconfont icon-vedio-close right"></i></div>\
                <p>'+switchLangObj.i18n_headTips+'</p>\
                <div class="QR-img" id="qrtokenImg"></div>\
                <p class="accept-token"><a class="aSelectBox selectedBoxClass"></a><span>'+switchLangObj.i18n_AcceptAutomatically+'</span></p>\
            </div>\
            <div class="select-tokenpair select-accept select-close">\
                <div class="close clearFix"><i class="iconfont icon-vedio-close right"></i></div>\
                <p class="select-title">'+switchLangObj.i18n_acceptAnywhere+'</p>\
                <div class="select-button">\
                    <p class="left select-accept-Yes select-Yes">'+switchLangObj.i18n_Yes+'</p>\
                    <p class="left select-accept-No select-No" >'+switchLangObj.i18n_No+'</p>\
                </div>\
            </div>\
            <div class="select-tokenpair select-live select-close">\
                <div class="close clearFix"><i class="iconfont icon-vedio-close right"></i></div>\
                <p class="select-title">'+switchLangObj.i18n_liveAnywhere+'</p>\
                <div class="select-button">\
                    <p class="left select-live-Yes select-Yes" >'+switchLangObj.i18n_Yes+'</p>\
                    <p class="left select-live-No select-No" >'+switchLangObj.i18n_No+'</p>\
                </div>\
            </div>\
            <div class="select-tokenpair start-live select-close" style="display:none;font-size:  15px;">\
				<div class="close clearFix"><i class="iconfont icon-vedio-close right"></i></div> \
				<div class="loading-live" style="height: 200px;text-align:center;line-height: 200px;">\
					<img src="images/loading_add_image.gif"/><span>start living...5s</span>\
				</div>\
            </div></div>';
		liObj.append(previewQrcode);
		var param=QRImg();
		oUtils.ajaxReq("/producerpro/token_getToken4Pro",param,function(data) {
			var errorCode = data.errorCode;
			if( errorCode == "0x0" ) {
				var code = data.result;
				$(".preview-qrcode").attr("data-code",code);
				createQrImg("qrtokenImg",code);
				$(".preview-qrcode .QrCode").css("display","block");
			}
		});		
	});

	$(".preview-list-container").on("click",".close",function(e){
		var thisObj=$(this);
		thisObj.parent().css("display","none");
		e.stopPropagation();
		clearInterval(sourceList.retryCountTimer);
	})

	$(".preview-list-container").on("click",".select-No",function(e){
		var thisObj=$(this);
		thisObj.parents(".select-close").css("display","none");
		e.stopPropagation();
	})

	$(".preview-list-container").on("click",".select-accept-Yes",function(e){
		var thisObj=$(this);
		var tPeerId= $(".preview-list-container .preview-qrcode").attr("data-peertid");
		var code= $(".preview-list-container .preview-qrcode").attr("data-code"); 
		var rid = $(".preview-list-container .preview-qrcode").parents(".preview-item").attr("data-rid");
		var param={
			"tokenCode.code": code,
	        "peerId":tPeerId,
	        "rid":rid.toLowerCase(),
	        "checkFlag":0,
	        "confirm":"Accept"   //Accept接受  Deny拒绝  Delete删除
        }
        $.ajax({
			type: "POST",
			url: "/producerpro/token_confirm",
			timeout : 15000, 
			data: param,
			success: function(data){
				data = JSON.parse(data);
				var errorCode = data.errorCode;
				if(errorCode == "0x0"){
					oUtils.alertTips("i18n_HasBeenSent", 2000);
					$(".pack-body .pack-info").each(function(i,v){
						$(v).find($(".pack-operate[data-peertid='"+tPeerId+"']").attr("data-tStatus",3));
					});
					thisObj.parents(".select-accept").siblings('.select-live').css("display","block");
					thisObj.parents(".select-accept").css("display","none");
				}else{
					oUtils.alertTips("i18n_proerrorTips", 2000);
				}
			}
	    })
        e.stopPropagation();
	})

	$(".preview-list-container").on("click",".select-live-Yes",function(e){
		var thisObj=$(this);
		var tPeerId= $(".preview-list-container .preview-qrcode").attr("data-peertid");   
		var rPeerId=thisObj.parents(".preview-item").attr("data-rid").toLowerCase();
		$(".preview-list-container .select-live").css("display","none");
		$(".preview-list-container .start-live").css("display","block");
		sourceList.preventRepeatRequest == true
		liveToken(tPeerId,rPeerId,"",false);
		e.stopPropagation();
	})

	$(".preview-list-container").on("click",".edit-name",function(){
		var thisObj=$(this);
		var $input = thisObj.children("input");
		var $showName = thisObj.children(".show-name");
		if($input.css("display")=="none"){
			$input.val($showName.html()); 
			$input.css("display","block");
			$input.focus();
			$showName.css("display","none");
		}	
	});

	$(".preview-list-container").on("keyup","input",function(){//阻止冒泡事件，防止影响快捷键的使用
		return false;
	});
	$(".preview-list-container").on("blur","input",function(){
		var $eidt_name = $(this).parent();
		var $input = $eidt_name.children("input");
		var $showName = $eidt_name.children(".show-name");
		$showName.html($input.val());
		$showName.css("display","block");
		$input.css("display","none");
	})
});


//二维码传值
function QRImg(){
	var mainRId = $(".rList-show").attr("data-peerId");
	allRidArray=[];
	var selectRIdArry=[];
	var selectRli =$(".preview-content .preview-item");
	$.each(selectRli,function(index, el) {
		if($(el).attr("data-filename")!="Default")
		var slaveRIds=selectRli.eq(index).attr("data-rid");
	    if(slaveRIds != undefined) {
	    	slaveRIds = slaveRIds.toLowerCase();
	    	allRidArray.push(slaveRIds);
	    	if(slaveRIds!=mainRId) selectRIdArry.push(slaveRIds);	
	    }
	});
	var param = {
		mainRId : mainRId,
		slaveRIds : selectRIdArry
	};
	return param
}

//生成二维码函数，传入元素Id,和内容
function createQrImg(elmId,content) {
	$("#"+elmId).html("").addClass("qr-border");
	content = "####"+content + CONFIG.tokenSuffix;
	var qrCode = new QRCode(elmId,{
		width: 200,
  		height: 200,
  		colorDark : '#000000',
  		colorLight : '#ffffff',
  		correctLevel : QRCode.CorrectLevel.H
	});
	qrCode.makeCode(content);
}

/**
 * function: tally
 * author: daniel
 */
var tally ={
	getBeReplacedTallyBox:function(fileName){//获取被替换视频在preview list中相应视频的父盒子
		var previewList = $(".preview-content .preview-item");
		for(var i=0;i<previewList.length;i++){
			if(previewList.eq(i).attr("data-filename")===fileName){
				if(previewList.eq(i).attr("data-rid")){
					return previewList.eq(i);
				}
			}
		}
		return null;
	},
}

function liveToken(tid,rid,imgCode,flag){
	if(sourceList.tokenFlag==false)return;	
	sourceList.tokenFlag = false;
	var tPeerId=tid;
	if(flag==true){
		var param={
	        "tokenCode.code": imgCode,
	        "peerId":tPeerId,
	        "checkFlag":'0',
	        "rid":rid,
	        "confirm":"Accept"   //Accept接受  Deny拒绝  Delete删除
	    }
	    $.ajax({
	        type: "POST",
	        url: "/producerpro/token_confirm",
	        timeout : 7000, 
	        data: param,
	        success: function(data){
	        	console.log("accept:",data,"tid:",tid,"rid:",rid,"imgCode:",imgCode);
	        },
	        error:function(data){
	        	console.log("accept:",data,"tid:",tid,"rid:",rid,"imgCode:",imgCode);
	        }
	    })
	}
	var retryCount = 4; 
	var num = 5;
	$(".preview-list-container .start-live .loading-live span").html(switchLangObj.i18n_tokenStartlive+num+"s");
	if(sourceList.retryCountTimer) clearInterval(sourceList.retryCountTimer);
    sourceList.retryCountTimer = setInterval(function(){
        var obj={};
            obj.TIdHex=tPeerId;
        var Liveparam={
            "rid":rid.toLowerCase(),
            "params":JSON.stringify(obj)
        }
        $.ajax({
	        type: "POST",
	        url: "/producerpro/startLive",
	        timeout : 7000, 
	        data: Liveparam,
	        success: function(data){
	        	sourceList.tokenFlag = true;
	        	console.log("startlive:",data,"tid:",tid,"rid:",rid,"imgCode:",imgCode);
	        	data = JSON.parse(data);
	        	var ErrorCode = data.ErrorCode+"";
	        	if(ErrorCode.indexOf("2147")>-1){
	        		if(retryCount<=0){
	        			$(".preview-list-container .select-live-Yes").html("Retry");
	        			$(".preview-list-container .select-live .select-title").html(switchLangObj.i18n_heckNetworkRetry);
	        			$(".sd-preview-list .preview-item .select-title").css({"margin-top":"40px","margin-left":"13%"});
	        			$(".preview-list-container .select-live").css("display","block");
	        			$(".preview-list-container .select-live-No").css("display","none");
	        			$(".preview-list-container .start-live").css("display","none");
	        			// $(".preview-qrcode").hide();
	        			clearInterval(sourceList.retryCountTimer);
	        		}else{
	        			num--;
	        			$(".preview-list-container .start-live .loading-live span").html(switchLangObj.i18n_tokenStartlive+num+"s");
	        			retryCount--;
	        		}
	        	}else{
	        		if(ErrorCode=="0x80100002"||ErrorCode=="0x80100008"){
	        			oUtils.alertTips("i18n_pleaseOtherCamera", 2000);
	        		}else if(ErrorCode=="0"){
	        			$(".preview-list-container .start-live .loading-live span").html(switchLangObj.i18n_LvieSuccess);
		        		$(".preview-list-container .start-live .loading-live img").attr("src","images/Checkbox-On.png");		
	        		}
	        		$(".preview-qrcode").fadeOut(2000);
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

$('.sd-pretreat-container').fnNiceScroll("#444");
/*text about end*/
window.addEventListener('resize', ()=>{
    correctDrag.dragCorrectPositionAndSize();
});



//分享有礼
$(function(){
	$(".shareHasGift").click(function() {
		$(".share-promptbox").css("display","block");
		$(".pushing").addClass('hide');
		if($(".shareqrcode").find("img").length!=0) return;
		$.ajax({
			type: "POST",
			url: "/producerpro/shareRegisterUrl",
			timeout : 7000,
			success: function(data){
				var errorCode = JSON.parse(data).errorCode;
				var result=JSON.parse(data).result;
				if(errorCode == "0x0"){
					var resultArray=result.split("?");
					var url=resultArray[0];
					var code=resultArray[1].slice(11);
					var qrCode = new QRCode("shareCode",{
						width: 200,
				  		height: 200,
				  		colorDark : '#000000',
				  		colorLight : '#ffffff',
				  		correctLevel : QRCode.CorrectLevel.H
					});
					qrCode.makeCode(result);
					$(".sharecode").val(code);
					var totalMoney=localStorage.getItem("amount");
					totalMoney=parseInt(totalMoney)/100;
	            	$(".totalMoney").text("￥"+ totalMoney);
				}
			}
		});
	});

	$(".shareGift img").click(function(){
		$(".share-promptbox").css("display","none");
	});

	$(".copyCode").click(function(){
		var isspUrl = $(".sharecode");
        isspUrl.select();
        document.execCommand("Copy");
        oUtils.alertTips("i18n_Copyed", 2000);
	});

	$(".scanHistory").click(function(){
		$(".share-promptbox").css("display","none");
		$(".shareHistory").css("display","block");
		getShareListRecords(1);
	})

	$(".shareHistory .pre-page,.shareHistory .next-page").on("click",function(){
        var thisObj = $(this);
        if(thisObj.hasClass("disabled"))return false;
        var currentPage = $(".shareHistory .currentpage").html();
        if(thisObj.hasClass("pre-page")){
            currentPage = parseInt(currentPage)-1;
        }else{
            currentPage = parseInt(currentPage)+1;
        }
        getShareListRecords(currentPage);
    });

    $(".shareHistory .invite").on("click","img",function(){
    	$(".shareHistory").css("display","none");
    });

    $(".shareHistory .invite").on("click","p",function(){
    	$(".shareHistory").css("display","none");
    	$(".share-promptbox").css("display","block");
    });

});


$(function(){
    $("#user_update").click(function(){
		$(".updateVersion").css("display","block");
    });

    $(".updateVersion .updateBody").fnNiceScroll("#444");
    if(i18nLanguage=="zh"){
	    if(versionUpdateFlag==0){
	    	getChangeList(1,1,"cn");
	    }else{
	    	getChangeList(1,0,"cn");
		}
		// 添加用户手册为中文地址
		$("#user_tutorial a").attr("href", "http://"+location.host+"/producerpro/user/userManual/Producer Ver2.0 User Manual-zh-20180831.pdf");
    }else{
		if(versionUpdateFlag==0){
	    	getChangeList(1,1,"com");
	    }else{
	    	getChangeList(1,0,"com");
		}
		// 添加用户手册为英文地址
		$("#user_tutorial a").attr("href", "http://"+location.host+"/producerpro/user/userManual/Producer Ver2.0 User Manual-en-20180831.pdf");
    }

    $(".updateVersion").on("click","li",function(){
    	if($(this).find(".updateNew").hasClass("updateCircle")) $(this).find(".updateNew").removeClass("updateCircle");
    })

    $(".updateVersion .pre-page,.updateVersion .next-page").on("click",function(){
        var thisObj = $(this);
        if(thisObj.hasClass("disabled")) return false;
        var currentPage = $(".updateVersion .currentpage").html();
        if(thisObj.hasClass("pre-page")){
            currentPage = parseInt(currentPage)-1;
        }else{
            currentPage = parseInt(currentPage)+1;
        }
        getChangeList(currentPage,0);
    });

})

//渲染邀请记录接口
// function getShareListRecords(num){
//     var params = {
//         currentPageNum: num,
//         everyPageNum: 6
//     }
//     oUtils.ajaxReq("listUserInviteRecords",params,function (data) {
//         if(data.errorCode=="0x0"){
//             data = data.result;
//             var resultList = data["resultList"];
//             if(resultList.length==0){
//                 $(".shareHistory .page").addClass("hide");
//                 $(".inviteUserHistory").html("");
//                 return false;
//             }else{
//                 $(".shareHistory .page").removeClass("hide");
//             }
//             var html = "";
//             for(var i=0;i<resultList.length;i++){
//                 var createTime=resultList[i].create_time;
//                 createTime=formatDateTime(createTime);
//                 var email=resultList[i].email;
//                 html += '<li>\
// 							<div class="left">\
// 								<p class="inviteUserName">'+email+'</p>\
// 								<p class="inviteUserDate">'+createTime+'</p>\
// 							</div>\
// 							<div class="right inviteUserMoney"> + 80</div>\
// 						</li>';
//             }
//             $(".inviteUserHistory ul").html(html);
//             $(".shareHistory .pre-page").removeClass("disabled");
//             $(".shareHistory .next-page").removeClass("disabled");
//             if(data.currentPageNum==1){
//                 $(".shareHistory .pre-page").addClass("disabled");
//             }
//             if(data.currentPageNum==data.totalPageNum){
//                 $(".shareHistory .next-page").addClass("disabled");
//             }
//             $(".shareHistory .currentpage").html(data.currentPageNum);
//             $(".shareHistory .totalpage").html(data.totalPageNum);
//         }
        
//     });
// }

function getChangeList(num,flag,envir){
	var params = {
        "currentPageNum": num,
        "everyPageNum":7,
        "versionUpdateFlag":flag,
        "environment":envir
    }
    oUtils.ajaxReq("/producerpro/queryWebVersionUpdate",params,function (data) {
        if(data.errorCode=="0x0"){
            data = data.result;
            var resultList = data["resultList"];
            if(resultList.length==0){
                $(".shareHistory .page").addClass("hide");
                $(".inviteUserHistory").html("");
                return false;
            }else{
                $(".shareHistory .page").removeClass("hide");
            }
            var html = "";
            for(var i=0;i<resultList.length;i++){
                var added_time=resultList[i].added_time;
                added_time=ExpireDateTime(added_time);
                var content=resultList[i].content;
                var sort=resultList[i].sort;
                var circle="";
                var arr = content.split("\n");
                content = arr.join("<br/>");
                if(flag==1){
                	circle = sort ?"updateCircle":"" ;
                }else{
                	circle = "";
                }
                var arr = content.split("\n");
                content = arr.join("<br/>");
                html += '<li>\
							<span class="updateNew '+circle+'"></span>\
							<span class="updateDate">'+added_time+'</span>\
							<p class="updateContent">'+content+'</p>\
						</li>';
            }
            $(".updateBody ul").html(html);
            $(".updateVersion .pre-page").removeClass("disabled");
            $(".updateVersion .next-page").removeClass("disabled");
            if(data.currentPageNum==1){
                $(".updateVersion .pre-page").addClass("disabled");
            }
            if(data.currentPageNum==data.totalPageNum){
                $(".updateVersion .next-page").addClass("disabled");
            }
            $(".updateVersion .currentpage").html(data.currentPageNum);
            $(".updateVersion .totalpage").html(data.totalPageNum);
        }
    })
}

