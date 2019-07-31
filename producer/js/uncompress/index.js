var session=getQueryString("session")||localStorage.getItem("session");
$(function(){
	$("html").fnNiceScroll();
    $("#userAccountMenu").click(function(){
    	if($(this).hasClass("active")){
    		$(this).removeClass("active");
    		$("#user_operationList").addClass("hide");
    	}else{
    		$(this).addClass("active");
    		$("#user_operationList").removeClass("hide");
    	}
    });
    
  
});
function getQueryString(name, str, symbol) {
	str = (str == null ? window.location.search.substr(1) : str);
	symbol = (symbol == null ? "&" : symbol);
	var reg = new RegExp("(^|" + symbol + ")" + name + "=([^" + symbol + "]*)(" + symbol + "|$)", "i");
	var r = str.match(reg);
	if (r != null) return unescape(r[2]);
	return null;
}

function logout(){
	$.ajax({
		url:"/producerpro/logout",
		data:{
			'session':session
		},
		success:function(msg){
			if(msg!=null){
				var f=msg.split("|");
				if(f[0]=="false"){
					var userManage = localStorage.getItem("userManage");
					window.location.href=userManage+"?url=http://"+window.location.host+"/producerpro&serviceName=Producer Pro";
					return ;
				}
				var $href = window.location.href.split("?")[0];
				window.location.href = $href;
			}
			else{
				console.log(msg);
			}
		},
		error: function() {
			var userManage = localStorage.getItem("userManage");
			window.location.href=userManage+"?url=http://"+window.location.host+"/producerpro&serviceName=Producer Pro";
        }
	});
}

