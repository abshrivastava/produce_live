var session=getQueryString("session");
$(function(){
    getUserInfo();
    queryRechargeInfo();

	$(".expired-date").datetimepicker({
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
	// $("#addTimeModal .expired-date").val(_getSaveTime(new Date()));

    $("#rechargeBody").on('click', '#addUserTime', function() {
        var thisObj=$(this);
        var addId = thisObj.attr("data-id");
        $("#addTimeInput").val("");
        $("#addTimeDone").attr("data-id",addId);
    });

    $("#rechargeBody").on('click', '#userHistoryId', function() {
        var thisObj=$(this);
        var historyId = thisObj.attr("data-id");
        var userName=thisObj.attr("data-name");
        $(".historyName").html(userName);
        $("#historyDone").attr("data-id", historyId);
        queryChargeHistory(thisObj);
    });

    $("#addTimeModal").on('click', '.close', function() {
        $("#addTimeDone").removeAttr("data-id");
    });

    $("#addTimeDone").click(function(){
        $("#addTimeDone").removeAttr("data-id");
    });

    $("#searchBtn, #filter").click(function() {
        var filterText = $("#filterText").val();
        var searchType = $("#selectType").attr("data-type");
        queryRechargeInfo(searchType, filterText);
    });

    $("#pageOption li a").click(function() {
        var thisVal = $(this).html();
        $("#pageList").find(".every-page").html(thisVal);
        var filterText = $("#filterText").val();
        var searchType = $("#selectType").attr("data-type");
        queryRechargeInfo(searchType, filterText, 1, thisVal);
    });

    $("#selectList li a").click(function() {
        var thisObj = $(this);
        var thisBtn = $("#selectType");
        var thisType = thisObj.attr("data-type");
        thisBtn.attr("data-type", thisType);
        thisBtn.find(".text").html(thisObj.html());
        var filterText = $("#filterText").val();
        var searchType = $("#selectType").attr("data-type");
        queryRechargeInfo(searchType, filterText);
    });

    $("#rechargeBody").on("click","#userDetail",function(){
        var thisObj=$(this);
        getUserHistoryDetail(thisObj);
        userTotleCharge(thisObj);
    });

    $("#rechargeBody").on("click","#addUserTime",function(){
        var thisObj=$(this);
        getRemainTimeAndExpireTime(thisObj);
    });

})

// var totalCharge=0;
function queryRechargeInfo(recordType, email, currentPageNum, everyPageNum){
	var params = {
		// recordType: recordType || 0,
		everyPageNum: everyPageNum || 10,
		currentPageNum: currentPageNum || 1
	}
	if(email) params.email = email;
	if(recordType==1){
		params.state = true;
	}else if(recordType==2){
		params.state = false;
	}
	oUtils.ajaxReq("/producerpro/support/userAccount", params, function(data) {
		if(data.errorCode=="0x0"){
			var result=data.result;
			var resultList =  result.resultList;
			var currentPageNum = result.currentPageNum;
			var everyPageNum = result.everyPageNum;
			var totalPageNum = result.totalPageNum;
			var baseNum = (currentPageNum - 1) * everyPageNum;
			$("#paging").find(".current-page").html(currentPageNum);
			$("#paging").find(".total-page").html(totalPageNum);
			$("#pageList").find(".every-page").html(everyPageNum);
			$("#paging").find(".page-input").val(currentPageNum);
			var allrechargeList = [];
			if(resultList.length > 0){
				$("#pageRow").removeClass("hide");
				$.each(resultList,function(index, item) {
					var num = baseNum + index-(-1);
					var name = item.email;
					// var subscription=item.state;
					var userId=item.ID;
					var inviteCode=item.parent_invite_code;
					var remain=item.remain;
					remain=timeDuring(remain);
					var register_time=item.register_time;
					var expiredDate=_getSaveTime(item.expire_time);
					var business_type=item.business_type;
					var fontStyle="";
					if(business_type=="1"){
						business_type="Pro";
						fontStyle="pro"
					}else if(business_type=="0"){
						business_type="Adv";
						fontStyle="adv"
					}else{
						business_type=" ";
					}
					register_time==null?register_time="--":register_time =_getSaveTime(item.register_time);
					var location=item.location;
					location==null ? location="--":location=item.location;
					var history='<a class="opt-btn" id="userHistoryId" data-toggle="modal" data-target="#chargeHistory" data-id="'+userId+'" data-name="'+name+'">History</a>';
					var addtime='<a class="opt-btn"  data-toggle="modal" data-target="#addTimeModal" data-id="'+userId+'" id="addUserTime">Set Time</a>';
					var subscripStr = '<tr>\
		   				<td>'+num+'</td>\
		   				<td id="userSubId" data-id="'+userId+'"><span>'+name+'</span><span class='+fontStyle+'>'+ business_type+'</span></td>\
		   				<td>'+inviteCode+'</td>\
						<td>'+register_time+'</td>\
		   				<td>'+location+'</td>\
						<td><sapn>'+remain+'</sapn><button class="showDetail" id="userDetail" data-userName='+name+'  data-userId='+userId+' data-toggle="modal" data-target="#UsageHistory">detail</button></td>\
						<td>'+expiredDate+'</td>\
						<td>'+history+'</td>\
			   			<td data-userName='+name+'>'+addtime+'</td>\
					   </tr>';
					   //<td class="subYesOrNo">'+subscription+'</td>\
		   			allrechargeList.push(subscripStr);
				})
			}else{
				$("#pageRow").addClass("hide");
				var emptyStr = '<tr>\
						<td>---</td>\
		   				<td>---</td>\
		   				<td>---</td>\
			   			<td>---</td>\
			   			<td>---</td>\
			   			<td>---</td>\
						<td>---</td>\
						<td>---</td>\
						<td>---</td>\
					</tr>';
					//<td>---</td>\
				allrechargeList.push(emptyStr);
			}
			$("#rechargeBody").html(allrechargeList.join(""));	
		}
	})
}

function timeDuring(remain) {
	var hours = Math.floor(remain / (60 * 60));
    var minutes = Math.floor(remain / 60 % 60);
    var seconds = Math.floor(remain % 60 % 60);
    hours <= 9 ? hours = "0" + hours : hours = hours;
    minutes <= 9 ? minutes = "0" + minutes : minutes = minutes;
    seconds <= 9 ? seconds = "0" + seconds : seconds = seconds;
    return hours + ":" + minutes + ":" + seconds;
}

// add Time
function saveAddTime() {
	var addtime = $("#addTimeInput").val();
	addtime=addtime.split(" ");
	var hour=addtime[0];
	hour=hour.substring(0,hour.length-1);
	var min=addtime[1];
	min=min.substring(0,min.length-3);
	addtime=hour*3600+min*60;
	var reg=/^([1-9]\d*|[0]{1,1})$/;
	// addtime=addtime*3600;
	if(!(reg.test(addtime))) {
		$("#errorInfo").html("Please enter a positive numeric type");
    	$("#errorModal").modal();
    	// $("#errorModal").css("padding-right","148px");
	}else if(addtime<31536000){
		var addId =$("#addTimeDone").attr("data-id");
		var ExpiredDate=$(".expired-date").val();
		var params = {
			time: addtime,
			userId:addId,
			expireTime:new Date(ExpiredDate).getTime()
	    }
	    oUtils.ajaxReq("/producerpro/support/addTime", params, function(data) {
			var errorCode = data.errorCode;
			$("#assignName").val("");
			$("#filterText").val("");
			if(errorCode == "0x0") {
				queryRechargeInfo();
				$("#addTimeDone").removeAttr("data-id");
			}else {
				if(errorCode="0x80100001") {
					$("#errorInfo").html(data.errorInfo);
					$("#errorModal").modal();
					$("#addTimeDone").removeAttr("data-id");
				}
			}
		});
	}else{
		$("#errorInfo").html("No more than one year");
		$("#errorModal").modal();
	}
}

// Query History
function queryChargeHistory(thisObj){
	var historyId = thisObj.attr("data-id");
	var params = {
		userId:historyId
	}
	oUtils.ajaxReq("/producerpro/support/chargeHistory", params, function(data) {
		var errorCode = data.errorCode;
		if(errorCode == "0x0"){
			var result=data.result;
			var historyList=[];
			var totalCharge=0;
			if(result.length > 0){
				$.each(result,function(index, item) {
					var startTime = item.createTime;
					startTime = _getSaveTime(startTime);
					var remain=item.remain;
					remain=remain/100;
					totalCharge=remain+totalCharge;
					$("#chargeHistory .totalCharge").html(totalCharge);
					var subscrip=item.item;
					var historyStr = '<tr>\
		   				<td>'+startTime+'</td>\
			   			<td>'+subscrip+'</td>\
			   			<td>'+remain+'</td>\
		   			</tr>';
		   			historyList.push(historyStr);
				})
			}else{
				$("#chargeHistory .totalCharge").html(totalCharge);
				var emptyStr = '<tr>\
						<td>---</td>\
		   				<td>---</td>\
			   			<td>---</td>\
					</tr>';
				historyList.push(emptyStr);
			}
			$("#historyBody").html(historyList.join(""));
			$("#historyDone").removeAttr('data-id');
		}
	})
}

function getUserHistoryDetail(thisObj){
	var userEmail = thisObj.attr("data-username");
	var params = {
		email:userEmail
	}
	oUtils.ajaxReq("/producerpro/getUsageHistoryPage", params, function(data) {
		var errorCode = data.errorCode;
		if(errorCode == "0x0"){
			var result=data.result;
			var historyList=[];
			var totalCharge=0;
			if(result.length > 0){
				$.each(result,function(index, item) {
					var createTime=_getSaveTime(item.createTime);
					var endTime=_getSaveTime(item.endTime);
					var usedTime=_getDelTime(item.usedTime);
					var remainTime=_getDelTime(item.remainTime);
					var useType=item.useType;
					var type=item.type;
					if(useType=="2"||useType=="3"){
						if(type=="1"){
							type="Purchase professional";
						}else if(type=="0"){
							type="Purchase advance";
						}else{
							type="Basic time";
						}
					}else if(useType=="1"){
						type="Extra CDN";
					}else{
						type="Basic time";
					}
					var historyStr = '<tr>\
		   				<td>'+createTime+'-'+endTime+'</td>\
						<td>'+type+'</td>\
						<td>'+usedTime+'</td>\
			   			<td>'+remainTime+'</td>\
		   			</tr>';
		   			historyList.push(historyStr);
				})
			}else{
				var emptyStr = '<tr>\
						<td>---</td>\
						<td>---</td>\
		   				<td>---</td>\
			   			<td>---</td>\
					</tr>';
				historyList.push(emptyStr);
			}
			$("#usageHistoryBody").html(historyList.join(""));
			$(".historyName").text(userEmail);
		}
	})

}

//分页功能
function paging(page) {
	var filterText = $("#filterText").val();
	var searchType = $("#selectType").attr("data-type");
	var currentPage = parseInt($("#paging").find(".current-page").html());
	var totalPage = parseInt($("#paging").find(".total-page").html());
	var everyPageNum = parseInt($("#pageList").find(".every-page").html());
	if(page == "gopaging") {
		currentPage = parseInt($(".page-input").val());
		if(currentPage == 0 || currentPage == "") currentPage = 1;
		// currentPage = currentPage-(-1);
		if(currentPage > totalPage) return;
	}else if(page == "firstpage") {
		if(currentPage == 1) return;
		currentPage = 1;
	}else if(page == "prvepage") {
		currentPage = currentPage - 1;
		if(currentPage == 0) return;
	}else if(page == "nextpage") {
		currentPage = currentPage - (-1);
		if(currentPage > totalPage) return;
	}else if(page == "lastpage") {
		if(currentPage == totalPage) return;
		currentPage = totalPage;
	}
	queryRechargeInfo(searchType, filterText, currentPage, everyPageNum);
}

function searchServerList(e, obj) {
	var e = e || window.event;
	if(e.keyCode == 13) {
		var filterText = $(obj).val();
		var searchType = $("#selectType").attr("data-type");
		queryRechargeInfo(searchType, filterText);
	}
}
function getUserInfo() {
	var url = "/producerpro/checkConfig?session="+session;
	$.ajax({
		type: "POST",
		url:url,
		async:false, 
		success: function(data){
			var data = JSON.parse(data);
			var userName = data.USER_NAME.email;
			$("#userName").html(userName);
			window.serviceList = { userseviceUrl: data.userManage };
			var script = document.createElement('script');
			script.src = data.userManage + "/package.serviceList/serviceList.js";
			var link = document.createElement('link');
			link.rel = 'stylesheet';
			link.type = 'text/css';
			link.href = data.userManage + '/package.serviceList/css/serviceList.css';
			//$("body").append(script);
			//$("head").append(link);
		}
	});
}

$(function() {
   	setTimeout(function(){
   		$("#close_nav").removeClass("hide").hide();
		window.highchartsDateFormat=true;
   	},2000)
});

function logout(){
	var sessionID=session;
	$.ajax({
		url:"/producerpro/logout",
		data:{
			'session':sessionID
		},
		success:function(msg){
			if(msg!=null){
				var f=msg.split("|");
				if(f[0]=="false"){
					window.location.href="../login.jsp";
					return ;
				}
				var href = window.location.href.split("?")[0];
				var producerhref=href.indexOf("support");
				href=href.slice(0, producerhref);
				// console.log(aa);
                window.location.href = href;
			}
			else{
				console.log(msg);
			}
		},
		 error: function() {
			 window.parent.location.href="../login.jsp";
         }
	});
}

function getQueryString(name, str, symbol) {
	str = (str == null ? window.location.search.substr(1) : str);
	symbol = (symbol == null ? "&" : symbol);
	var reg = new RegExp("(^|" + symbol + ")" + name + "=([^" + symbol + "]*)(" + symbol + "|$)", "i");
	var r = str.match(reg);
	if (r != null) return unescape(r[2]);
	return null;
}

function _getSaveTime(time){
	var date = new Date(time);
	var year = date.getFullYear();
	var month = date.getMonth()+1;
	var day = date.getDate();
	var hour = date.getHours();
	var minute = date.getMinutes();
	var seconds = Math.floor(time/1000 % 60 % 60);
	month = month <= 9? "0" + month: month;
	day = day <= 9? "0" + day: day;
	hour = hour <= 9 ? "0" + hour :hour;
	minute = minute <= 9 ?  "0" + minute : minute;
	seconds = seconds <= 9 ?  "0" + seconds : seconds;
	return year+"-"+month+"-"+day+" "+hour+":"+minute+":"+seconds;
}

function _getDelTime(value){
	var hours = Math.floor(value / (60 * 60));
	var minutes = Math.floor(value / 60 % 60);
	var seconds = Math.floor(value % 60 % 60);
	hours = hours <= 9 ? "0" + hours : hours;    
	minutes = minutes <= 9 ? "0" + minutes : minutes;
    return hours+"h "+  minutes+"min"; 
}
//查询剩余时间和过期时间
function getRemainTimeAndExpireTime(thisObj){
	var userEmail=thisObj.parent().attr("data-username");
	var params={
		"email": userEmail,
    }
    oUtils.ajaxReq("/producerpro/getRemainAndExpireTime",params, function (data) {
		if(data.errorCode=="0x0"){
			var result=data.result;
			var expireTime=result.expireTime;
			if(expireTime=="null"){
				$(".expired-date").val("null");
			}else{
				$(".expired-date").val(_getSaveTime(expireTime));
			}
			userRecord=result.remainTime;
			$("#addTimeInput").val(_getDelTime(userRecord));
		}
	})
}

function userTotleCharge(thisObj){
	var userid=thisObj.attr("data-userId");
	$.ajax({
		url:"/producerpro/support/statisticalCost/"+userid+"",
		type:"GET",
		success:function(data){
			data=JSON.parse(data);
			if(data.errorCode=="0x0"){
				var result=data.result;
				var currentUrl=window.location.host;
				if(currentUrl.indexOf(".com")>0){
					$("#UsageHistory .totalCharge").text("$"+result);
				}else{
					$("#UsageHistory .totalCharge").text("¥"+result);
				}
			}
		}
	});
}


