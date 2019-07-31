$(function(){
	getUserInfo();
	queryVersionInfo();

	$(".add-date").datetimepicker({
		format: "yyyy-mm-dd",
		minView:2,
        autoclose: true,
        todayBtn: true,
        pickerPosition: "bottom-left"
	});
	$("#addVersionModal .add-date").val(fn_convertTimeFormat(new Date()));

	$("#UpdateBody").on("click","#updateDelete",function(){//删除
		var thisObj= $(this);
		var id=thisObj.attr("data-id");
		ContentDelete(id,thisObj);
	})

	$("#UpdateBody").on("click","#updateEdit",function(){//删除
		var thisObj= $(this);
		var id=thisObj.attr("data-id");
		$("#EditVersionModal #EditUpdateDone").attr("data-id",id);
		var oldContent= thisObj.parent("td").siblings(".versionContent").text();
		$("#EditVersionModal .updateContent").val(oldContent);
		var oldTime= thisObj.parent("td").siblings(".updateTime").text();
		$("#EditVersionModal .add-date").val(oldTime);
	})

	$("#searchBtn, #filter").click(function() {
		var filterText = $("#filterText").val();
		queryVersionInfo(filterText);
	});

	$("#pageOption li a").click(function() {
		var thisVal = $(this).html();
		$("#pageList").find(".every-page").html(thisVal);
		var filterText = $("#filterText").val();
		queryVersionInfo(filterText, 1, thisVal);
	});

})

function queryVersionInfo(content, currentPageNum, everyPageNum){
	var params = {
		everyPageNum: everyPageNum || 10,
		currentPageNum: currentPageNum || 1,
		content:content||""
	}
	oUtils.ajaxReq("/producerpro/support/queryVersionUpdate", params, function(data) {
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
					var added_time=fn_convertTimeFormat(item.added_time);
					var userId=item.id;
					var content=item.content.substring(0,30);
					var environment=item.environment;
					var assign ='<a class="opt-btn" id="updateEdit" data-toggle="modal" data-target="#EditVersionModal" data-id="'+userId+'">Edit</a><span class="remove" id="updateDelete" data-id="'+userId+'">Delete</span>';
					var subscripStr = '<tr>\
		   				<td>'+num+'</td>\
		   				<td class="versionContent">'+content+'</td>\
		   				<td class="versionContent">'+environment+'</td>\
		   				<td class="updateTime">'+added_time+'</td>\
		   				<td>'+assign+'</td>\
		   			</tr>';
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
					</tr>';
				allrechargeList.push(emptyStr);
			}
			$("#UpdateBody").html(allrechargeList.join(""));	
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

// add 
function saveAddVersion() {	
	var addtime = $("#addVersionModal .add-date").val().trim();
	addtime= new Date(addtime).getTime();
	var com=$(".updateCom .updateContent").val();
	var cn=$(".updateCn .updateContent").val();
	if(com!=""||cn!=""){
		var params = {
			"addedTime":addtime,
			"comContent":com,
			"cnContent":cn
	    }
	    oUtils.ajaxReq("/producerpro/support/addVersionUpdate", params, function(data) {
			var errorCode = data.errorCode;
			$(".updateCom .updateContent").val("");
			$(".updateCn .updateContent").val("");
			if(errorCode == "0x0") {
				queryVersionInfo();
			}else {
				if(errorCode="0x80100001") {
					$("#errorInfo").html(data.errorInfo);
					$("#errorModal").modal();
					$("#addTimeDone").removeAttr("data-id");
				}
			}
		});
	}else{
		$("#errorInfo").html("No content");
		$("#errorModal").modal();
	}
}

function ContentDelete(MessageId,thisObj){//删除
	var params={
		"id":MessageId
	}
	oUtils.ajaxReq("/producerpro/support/delVersionUpdate", params, function(data) {
		var errorCode = data.errorCode;
		if(errorCode == "0x0"){
			thisObj.parents("tr").remove();
		}
	})

}

// Edit
function EditVersion(thisObj){
	var addtime = $("#EditVersionModal .add-date").val().trim();
	addtime= new Date(addtime).getTime();
	var EditId = $("#EditUpdateDone").attr("data-id");
	var message= $("#EditVersionModal .updateContent").val();
	var params = {
		"id":EditId,
		"content":message,
  		"addedTime":addtime 
	}
	oUtils.ajaxReq("/producerpro/support/editVersionUpdate", params, function(data) {
		var errorCode = data.errorCode;
		if(errorCode == "0x0"){
			queryVersionInfo();
		}
	})
}

function fn_convertTimeFormat(timeStamp) {
	var oDate = new Date(timeStamp);
	var oYear = oDate.getFullYear();
	var oMonth = oDate.getMonth()+1;
	var oDay = oDate.getDate();
	// var oHour = oDate.getHours();
	// var oMin = oDate.getMinutes();
	// var oSen = oDate.getSeconds();
	var oTiem= oYear+"-"+fn_formatTime(oMonth)+"-"+fn_formatTime(oDay);
	return oTiem;
}

function fn_formatTime(date) { //给月份和日补零
	if(parseInt(date)<10) {
		date = '0'+date;
	}
	return date;	
}

function paging(page) {
	var currentPage = parseInt($("#paging").find(".current-page").html());
	var totalPage = parseInt($("#paging").find(".total-page").html());
	var everyPageNum = parseInt($("#pageList").find(".every-page").html());
	if(page == "gopaging") {
		currentPage = parseInt($(".page-input").val());
		if(currentPage == 0 || currentPage == "") currentPage = 1;
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
	queryVersionInfo("",currentPage, everyPageNum);
}

function searchServerList(e, obj) {
	var e = e || window.event;
	if(e.keyCode == 13) {
		var filterText = $(obj).val();
		queryVersionInfo(filterText);
	}
}







