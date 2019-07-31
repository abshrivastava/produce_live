$(function() {
	//get user name
	getUserInfo();
	//初始化页面,获取running数据
	updateRuningList();
	initDateTime();
	//search
	$("#searchBtn, #filter").click(function() {
		var filterText = $("#filterText").val();
		var searchType = $("#selectType").attr("data-type");
		// if(filterText == "") return;
		updateRuningList(searchType, filterText);
	});

	$("#selectList li a").click(function() {
		var thisObj = $(this);
		var thisBtn = $("#selectType");
		var thisType = thisObj.attr("data-type");
		thisBtn.attr("data-type", thisType);
		thisBtn.find(".text").html(thisObj.html());
		var filterText = $("#filterText").val();
		var searchType = $("#selectType").attr("data-type");
		updateRuningList(searchType, filterText);
	});

	$("#pageOption li a").click(function() {
		var thisVal = $(this).html();
		$("#pageList").find(".every-page").html(thisVal);
		var filterText = $("#filterText").val();
		var searchType = $("#selectType").attr("data-type");
		updateRuningList(searchType, filterText, 1, thisVal);
	});

	/*$("#addBtn").click(function() {
		$(".add-date").datetimepicker({
			format: "yyyy-mm-dd",
			minView:2,
	        autoclose: true,
	        todayBtn: true,
	        pickerPosition: "bottom-left"
		});
		$(".add-date").val(fn_convertTimeFormat(new Date()));
	});*/

	$("#successBtn").click(function() {
		var params = {};
		var data = $('#dataForm').serializeArray();
	    $.each(data, function() {
	      params[this.name] = this.value;
	    });
	    var slaveR = $('#dataForm').find(".slaveR")
	    var slaveRArr = [];slaveRids = 
	    $.each(slaveR, function(idx, item) {
	    	slaveRArr.push($(item).val());
	    });
	    params.slaveRids = slaveRArr;
	    oUtils.ajaxReq("/producerpro/support/addInstance.action", params, function(data) {
	    	var errorCode = data.errorCode;
	    	$("#filterText").val("");
	    	$("#dataForm .input-border").val("");
	    	if(errorCode == "0x0") {
	    		console.log("Success");
	    		updateRuningList();
	    	}else {
	    		$("#errorInfo").html(data.errorInfo);
				$("#errorModal").modal();
	    	}
	    });
	});
	$("#runningTable").on("click",".remove",function(){
		var thisObj = $(this);
		var userObj = thisObj.parents("td").siblings(".showRid");
		var email = userObj.html();
		var imageId = userObj.attr("data-instanceid");
		var id = userObj.attr("data-id");
		var params = {instanceId:imageId};
		if(email=="null"){
			params["id"] = id;
		}else{
			params["email"] =email;
		}
		oUtils.ajaxReq("/producerpro/support/removeInstance",params,function(data){
			if(data.errorCode == "0x0") {
				updateRuningList();
			}else {
				$("#errorInfo").html(data.errorInfo);
				$("#errorModal").modal();
			}
		})
	});
	$("#runningTable").on("click",".running .showDetail",function(){
		var thisObj = $(this);
		var emial = thisObj.siblings().eq(0).html();
		var createTime = thisObj.attr("data-createTime");
		// createTime = fn_convertTimeFormat(createTime-0).split(" ")[0];
		// createTime = createTime.replace(/:/g,"-")
		var params = {
			loginUserEmail:emial,
			onlineStartTime:createTime
		}

		queryUserRecord(params);
		// queryUserLoginOutRecord/{pageSize}/{pageNum} 第一个参数是每页的大小，第二个参数是页码
	});
	$("#historyTable").on("click",".history .showDetail",function(){
		var thisObj = $(this);
		var emial = thisObj.siblings().eq(0).html();
		var createTime = thisObj.attr("data-createTime");
		var updateTime = thisObj.attr("data-endTime");
		var params = {
			loginStatus:0,
			loginUserEmail:emial,
			onlineStartTime:createTime,
			onlineEndTime:updateTime,
		}
		queryUserRecord(params);
	});
});
function queryUserRecord(params){ //查询用户登录信息
	oUtils.ajaxReq("/producerpro/queryUserLoginOutRecord/100/1", params, function(data) {
		if(data.errorCode=="0x0"){
			var resultList = data.result.resultList;
           	
            var html = "",result;		
			for(var i = 0; i < resultList.length; i++){
				var result = resultList[i];
				html +=	'<tr><td>'+result.address+'</td>\
             		<td>'+result.longitude+'</td>\
             		<td>'+result.latitude+'</td>\
             		<td>'+result.ip+'</td>\
             		<td>'+fn_convertTimeFormat(result.online_time-0)+'</td>\
             		<td>'+(result.outline_time!=null?fn_convertTimeFormat(result.outline_time-0):"-")+'</td>\
             		<td>'+(result.outline_time!=null?formatDuring(result.outline_time-result.online_time):"-")+'</td></tr>';
			}
			$("#searchDetial .t_body").html(html);
			$("#searchDetial .user-email").html(params.loginUserEmail);
			$("#searchDetial").modal();
		} 
	})
}

function paging(page) {
		var filterText = $("#filterText").val();
		var searchType = $("#selectType").attr("data-type");
		var currentPage =  parseInt($("#paging").find(".current-page").html());
		var totalPage =  parseInt($("#paging").find(".total-page").html());
		var everyPageNum =  parseInt($("#pageList").find(".every-page").html());
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
		updateRuningList(searchType, filterText, currentPage, everyPageNum);
}

function initDateTime() {
		$(".time-input").datetimepicker({
			format: "yyyy-mm-dd",
			minView:2,
					autoclose: true,
					todayBtn: true,
					pickerPosition: "bottom-left"
		});
		var date = new Date();
		var nowDate = timeFormat(date);
		var pastTime = new Date(date.getTime() - 7 * 24 * 3600 * 1000) ;
		var oldDate = timeFormat(pastTime);
		$(".start-time").val(oldDate);
		$(".end-time").val(nowDate);
}

function timeFormat(time) {
	var year = time.getFullYear();
	var month = time.getMonth()-(-1);
	var day = time.getDate();
	return year+'-'+month+'-'+day;
}

function searchServerList(e, obj) {
	var e = e || window.event;
	if(e.keyCode == 13) {
		var filterText = $(obj).val();
		var searchType = $("#selectType").attr("data-type");
		// if(filterText == "") return;
		updateRuningList(searchType, filterText);
	}
}

function updateRuningList(recordType, email, currentPageNum, everyPageNum) {
	// 0:running,  1: history
	var params = {
		recordType: recordType || 0,
		everyPageNum: everyPageNum || 10,
		currentPageNum: currentPageNum || 1
	}
	if(email) params.email = email;
	if(recordType == 1) {
		var start = $(".start-time").val();
		start = new Date(start).getTime();
		var end = $(".end-time").val();
		end = new Date(end).getTime()+24*1000*60*60-1;
		params.startTime = start;
		params.endTime = end;
	}

	oUtils.ajaxReq("/producerpro/support/listInstances.action", params, function(data) {
		console.log(data);
		var errorCode = data.errorCode;
		if(errorCode == "0x0") {
			var resultData = data.result;
			var resultList =  resultData.resultList;
			var currentPageNum = resultData.currentPageNum;
			var everyPageNum = resultData.everyPageNum;
			var totalPageNum = resultData.totalPageNum;
			var baseNum = (currentPageNum - 1) * everyPageNum;
			$("#paging").find(".current-page").html(currentPageNum);
			$("#paging").find(".total-page").html(totalPageNum);
			$("#pageList").find(".every-page").html(everyPageNum);
			$("#paging").find(".page-input").val(currentPageNum);
			var runingList = [];
			var historyArr = [];
			if(resultList.length > 0) {
				$("#pageRow").removeClass("hide");
				$.each(resultList,function(index, item) {
					var num = baseNum + index-(-1);
					var publicIp = item.public_ip;
					var name = item.email;
					var location = item.instance_region;
					var instanceId = item.id;
					var startTime = item.create_time;
					startTime = fn_convertTimeFormat(startTime);
					var endTime = item.update_time;
					endTime = fn_convertTimeFormat(endTime);
					var platformType = item.platform_type;
					var marking = "";
					if(platformType == 0 ){
						marking = "manual";
					}else if(platformType == 1){
						marking  = "AWS";
					}else{
						marking = "aliyun";
					}
					var instanceType = item.instance_type;
					var status = "4+2";
					var createTime = item.create_time;
					var duration = undefined;
					if(params.recordType == 1) {
						duration = item.update_time - createTime;
					}else{
						duration = new Date().getTime() - createTime;
					}
					
					duration = formatDuring(duration);
					duration = name==null?"":duration;
					var assign = marking=="manual"?'<a class="opt-btn" onclick="assignInstance(\''+instanceId+'\');" data-toggle="modal" data-target="#assignModal">Assign</a><span class="remove">remove</span>':"";
					var runStr = '<tr>\
		   				<td>'+num+'</td>\
		   				<td  class="running" data-id="'+item.id+'"><span class="showRid" title="Click to see the receiver information" data-instanceid="'+item.instance_id+'">'+name+'</span><button class="showDetail" data-createTime='+item.create_time+' data-updateTime='+item.update_time+'>detail</button></td>\
			   			<td>'+publicIp+'</td>\
		   				<td>'+location+'</td>\
			   			<td>'+marking+'</td>\
			   			<td>'+status+'</td>\
			   			<td>'+duration+'</td>\
			   			<td>'+assign+'</td>\
		   			</tr>';
		   			runingList.push(runStr);
		   			var historyStr = '<tr>\
		   				<td>'+num+'</td>\
			   			<td class="history"><span>'+name+'</span><button class="showDetail" data-createTime='+item.create_time+' data-endTime='+item.update_time+'>detail</button></td>\
			   			<td>'+publicIp+'</td>\
		   				<td>'+location+'</td>\
			   			<td>'+startTime+'</td>\
			   			<td>'+endTime+'</td>\
			   			<td>'+duration+'</td>\
		   			</tr>';
		   			historyArr.push(historyStr);
				});
			}else {
				$("#pageRow").addClass("hide");
				var emptyStr = '<tr>\
						<td>---</td>\
		   				<td>---</td>\
			   			<td>---</td>\
			   			<td>---</td>\
			   			<td>---</td>\
			   			<td>---</td>\
			   			<td>---</td>\
					</tr>';
				runingList.push(emptyStr);
				historyArr.push(emptyStr);
			}
			if(params.recordType == 1) {
				$("#addBtn, #addImage").addClass("hide");
				$("#filterBtn, .date-box").removeClass("hide");
				$("#historyBody").html(historyArr.join(""));
				$("#historyTable").removeClass("hide")
				$("#runningTable").addClass("hide");
			}else {
				$("#addBtn, #addImage").removeClass("hide");
				$("#filterBtn, .date-box").addClass("hide");
				$("#runningBody").html(runingList.join(""));
				$("#historyTable").addClass("hide");
				$("#runningTable").removeClass("hide");
			}
		}
	}) 
}

function assignInstance(instanceId) {
	$("#instanceId").val(instanceId);
}
$("#runningTable").on("click",'.showRid',function(){
	var thisObj = $(this);
	var instanceId = thisObj.attr("data-instanceid");
	var params = {
		instanceId:instanceId
	} 
	oUtils.ajaxReq("/producerpro/support/queryInstanceDevice",params,function(data){
		if(data.errorCode=="0x0"){
			var html = "<p>Main Receiver:<br/><span>"+data.result[0].peerId+"</span></p><p>slave Receiver:<br/><span>";
			for(var i=1;i<data.result.length;i++){
				html+=data.result[i].peerId+",";
			}
			html = html.substring(0, html.length-1);
			html += "</span></p>";
			$("#receiverModal .modal-body").html(html);
		$("#receiverModal").modal();
		}
	})

});

function saveAssign() {
	var instanceId = $("#instanceId").val();
	// console.log(instanceId);
	var email = $("#assignName").val();
	email = email.replace(/\s/ig,'');
	var params = {
		email: email,
		id:instanceId
	}
	oUtils.ajaxReq("/producerpro/support/assignInstance.action", params, function(data) {
		var errorCode = data.errorCode;
		$("#assignName").val("");
		$("#filterText").val("");
		if(errorCode == "0x0") {
			updateRuningList();
		}else {
			if(errorCode="0x80100001") {
				$("#errorInfo").html(data.errorInfo);
				$("#errorModal").modal();
			}

		}
	});
}

function addImage() {
	var params = {};
	var data = $('#imageForm').serializeArray();
    $.each(data, function() {
      params[this.name] = this.value;
    });
    if(params.imageId==""){
    	$("#errorInfo").html("imageId can't be empty");
		$("#errorModal").modal();
		return false;
    }
    if(params.version==""){
    	$("#errorInfo").html("Version can't be empty");
		$("#errorModal").modal();
		return false;
    }

	oUtils.ajaxReq("/producerpro/support/addImage.action", params, function(data) {
		var errorCode = data.errorCode;
		$("#filterText").val("");
	    $("#dataForm .input-border").val("");
		if(errorCode == "0x0") {
			console.log("Success");
		}else {
			$("#errorInfo").html(data.errorInfo);
			$("#errorModal").modal();
		}
	});
}

function fn_convertTimeFormat(timeStamp) {
	var oDate = new Date(timeStamp);
	var oYear = oDate.getFullYear();
	var oMonth = oDate.getMonth()+1;
	var oDay = oDate.getDate();
	var oHour = oDate.getHours();
	var oMin = oDate.getMinutes();
	var oSen = oDate.getSeconds();
	var oTiem= oYear+"-"+fn_formatTime(oMonth)+"-"+fn_formatTime(oDay)+' '+fn_formatTime(oHour)+':'+fn_formatTime(oMin)+':'+fn_formatTime(oSen);
	return oTiem;
}
function fn_formatTime(date) { //给月份和日补零
	if(parseInt(date)<10) {
		date = '0'+date;
	}
	return date;
	
}

function formatDuring(stamp) {
	// var days = parseInt(stamp%(1000*24*60*60));
	var hours = parseInt((stamp)/(1000*60*60));
	var minutes = parseInt((stamp%(1000*60*60))/(1000*60));
	var seconds = parseInt((stamp%(1000*60))/1000);
	return fn_formatTime(hours)+":"+fn_formatTime(minutes)+":"+fn_formatTime(seconds);
}
