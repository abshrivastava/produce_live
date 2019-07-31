<!-- <?xml version="1.0" encoding="UTF-8" ?> -->
<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="s" uri="/struts-tags"%>
<%@ page import="java.util.Calendar"%>

<%
	response.setHeader("Cache-Control", "no-cache");
	response.setHeader("Pragma", "no-cache");
	response.setHeader("Expires", "0");
	
	Calendar cld = Calendar.getInstance();
	String calendarYear = cld.get(Calendar.YEAR)+"";
%>

<!-- <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"> -->

<html>
<head>
<script type="text/javascript">
if(window!=top){
	top.location.href=location.href;
}

//平台、设备和操作系统
var system ={
	win : false,
	mac : false,
	other : false,
	iPad:false,
	iPhone:false,
	iPod:false
};


//检测平台
var p = navigator.platform;
system.win = p.indexOf("Win") == 0;
system.mac = p.indexOf("Mac") == 0;
system.iPad = p.indexOf("iPad") == 0;
system.iPhone = p.indexOf("iPhone") == 0;
system.iPod = p.indexOf("iPod") == 0;
system.other = (p == "arm") || (p.indexOf("Linux") == 0);


</script>
<meta name="viewport"
	content="width=device-width, initial-scale=1.0,maximum-scale=1.0, user-scalable=no" />
<title>TVU Grid Switch</title>
<link rel="icon" href="../images/favicon.ico"  type="image/x-icon" />
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<link href="../css/login.css?buildVersion = ${buildVersion}" type="text/css" rel="stylesheet" />
 <script src="../js/util/jquery-2.1.4.min.js" type="text/javascript" charset="utf-8"></script> 
 <script src="../js/util/jquery.cookie.js" type="text/javascript" charset="utf-8"></script> 
<!--
<link href="../css/foot.css" type="text/css" rel="stylesheet" />

<script src="../js/jquery-1.7.2.js"></script>

<script type="text/javascript">
	function KeyDown() {
		if (event.keyCode == 13) {
			event.returnValue = false;
			event.cancel = true;
			$("#loginForm").submit();
		}
	}
</script>
 -->
</head>

<body>
	<!--[if IE 8]>
          <div id="ieFilter" class="ieFilter"></div>
      <![endif]-->
	<!--[if IE 9]>
          <div id="ieFilter" class="ieFilter"></div>
      <![endif]-->
	<!--[if IE 7]>
          <div id="ieFilter" class="ieFilter"></div>
      <![endif]-->
	<!--[if IE 6]>
          <div id="ieFilter" class="ieFilter"></div>
      <![endif]-->
	<table class="cloud_login">
		<tr></tr>
		<tr>
			<td> 
				<div class="cloud_login_title">&nbsp;</div>
				<div>
					<form action="login.action" method="post" style="color:initial" class="cloud_login_form"
						id="loginForm">
						<s:hidden name="deviceType" id="deviceType" value="%{deviceType}"/>
						<table class="cloud_login_sign" >
							<tr>
								<td style="max-width: 20px;"><input type="text"
									id="username" name="userName" class="cloud_login_input"  placeholder="Username"
									tabindex="1" maxlength="64"
									onkeydown="if(event.keyCode == 13)login()" /></td>
								<td rowspan="2"><input type="button"
									class="cloud_login_btn" value=" " onclick="login()" /></td>
							</tr>
							<tr>
								<td><input type="password" id="password" name="password" placeholder="Password"
									 class="cloud_login_input" tabindex="3"
									maxlength="64" onkeydown="if(event.keyCode == 13)login()" />
								</td>
							</tr>
							<tr>
								<td colspan="2">
									<div class="cloud_login_log" id="errorLog">
										<s:fielderror cssClass="cloud_login_log_field" />
									</div>
								</td>
							</tr>
						</table>
					</form>
				</div> <!-- 
				<div class="cloud_login_forget">Forget your password?</div>
				-->
			</td>
		</tr>
		<tr></tr>
		<tr class="cloud_login_bottomTr">
			<td>
				<div id="cloud_login_bottom" class="cloud_login_bottom h17">
					<img src="../images/logo.png" class="h16" alt="TVU networks Home"
				title="TVU networks Home" /><span>©&nbsp;<%=calendarYear%>&nbsp;</span><a href="http://www.tvupack.com" style="color: #34b233;font-size: 12px;line-height:12px;margin:-5 0 5px 0" target="blank">TVU&nbsp;networks</a>
				</div>
			</td>
		</tr>
	</table>
	<script type="text/javascript">
		String.prototype.Trim = function() {
			return this.replace(/[ ]/g, "");
		}
		
		//onfocus & onblur
		var password = document.getElementById("password");
		var pwd = document.getElementById("pwd");
		var username = document.getElementById("username");
		var errorLog = document.getElementById("errorLog");
		//show redirectError
		var redirectError = "<%=request.getParameter("loginError")%>";
		if ("null" != redirectError) {
			errorLog.innerHTML = redirectError;
		}

		//login for onKeyDown & onClick
		function login() {
			if (check())
			{
				if(system.iPad || system.iPhone || system.iPod || system.other){
					document.getElementById("deviceType").value = "apple";
				}
				if($.cookie('cookie_key')!=null){
				 	$.cookie('cookie_key', null,{path:"/"});
				}
				// alert(document.cookie!="");
				/*if(document.cookie!=""){
					delCookie('cookie_key');
				}*/
				document.getElementById("loginForm").submit();
			}
			
		}
		/*//delete cookies
		function delCookie(cookieName)
		{
			// alert("111111&&&&&&  "+document.cookie);
		 var date=new Date();
		 date.setTime(date.getTime()-10000);
		 document.cookie=cookieName+"=0;expires="+date.toGMTString()+";path='/'";
			// alert("222222&&&&&&  "+document.cookie);
		}*/

		//check
		function check() {
			if ("" == username.value.Trim() || "Username" == username.value) {
				errorLog.innerHTML = "You can't leave \"Username\" empty.";
				return false;
			} else if ("" == password.value.Trim()
					|| password.value.length <= 0) {
				errorLog.innerHTML = "You can't leave \"Password\" empty.";
				return false;
			}
			errorLog.innerHTML = "";
			return true;
		}
	</script>

	
</body>
</html>