var session=getQueryString("session");
var userManage = undefined;
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
			userManage = data.userManage;
			link.href = data.userManage + '/package.serviceList/css/serviceList.css';
			$("body").append(script);
			$("head").append(link);
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
					window.location.href=userManage+"?url=http://"+window.location.host+"/producerpro&serviceName=Producer Pro";
					return ;
				}
				var href = window.location.href.split("?")[0];
				var producerhref=href.indexOf("support");
				href=href.slice(0, producerhref);
				// console.log(aa);
                window.location.href = href;
			}else{
				console.log(msg);
			}
		},
		error: function() {
			window.location.href = userManage+"/?url=http://"+window.location.host+"/producerpro&serviceName=Producer Pro";
			//window.location.href="http://10.12.22.93/tvuuserservice?url=http://"+window.location.host+"/producerpro&serviceName=Producer Pro";
        }
	});
}

$("#ServerList").click(function(){
        var href="http://" + window.location.host + "/producer/support/producerSupport.html?session="+session+"";
        $(this).attr("href",href);
    });

    $("#Image").click(function(){
        var href="http://" + window.location.host + "/producer/support/producerproSupImage.html?session="+session+"";
        $(this).attr("href",href);
    });

    $("#Update").click(function(){
        var href="http://" + window.location.host + "/producer/support/producerproUpdate.html?session="+session+"";
        $(this).attr("href",href);
    });
	$("#userList").click(function(){
        var href="http://" + window.location.host + "/producer/support/producerproRecharge.html?session="+session+"";
        $(this).attr("href",href);
    });


function getQueryString(name, str, symbol) {
	str = (str == null ? window.location.search.substr(1) : str);
	symbol = (symbol == null ? "&" : symbol);
	var reg = new RegExp("(^|" + symbol + ")" + name + "=([^" + symbol + "]*)(" + symbol + "|$)", "i");
	var r = str.match(reg);
	if (r != null) return unescape(r[2]);
	return null;
}