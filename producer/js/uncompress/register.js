var config = {
    domain:"producer.tvunetworks.cn"
}
$(function() {  
    FastClick.attach(document.body);  
});
var sendEmailFlag=true;

$(function(){
    var href = location.href;
    if(href.indexOf("producerpro/index")>-1){
        window.history.pushState({state:1},"",null);
    }
    function getQueryString(name) {
        var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            return unescape(r[2]);
        }
        return null;
    }
    var code = getQueryString("inviteCode");
    if(code){
        $(".register-body .invite input").val(code);
    }
    $(".register-body .email input").on("blur",function(){
        var thisObj = $(this)
        var value = thisObj.val().trim();
        $(".header-title").attr("data-username",value);
        if(!isEmail(value)){
            $(".register-body .email .email-title").html(switchLangObj.i18n_emailAddress);
        }else{
            $(".register-body .email .email-title").html("");
        }
    });
    $(".register-body .phone input").on("blur",function(){
        var thisObj = $(this);
        var value = thisObj.val().trim();
        $(".header-title").attr("data-username",value);
        if(!isEmail(value)&&!isPhoneAvailable(value)){
            $(".register-body .phone .email-title").html(switchLangObj.i18n_emailOrPhoneAddress);
        }else{
            $(".register-body .phone .email-title").html("");
        }
    });

    $(".visitor").on("click",".login-btn",function(){
       confirmLogin();
    });
    $(".visitor").on("click",".register-btn",function(){
        $(".register-body").css("display","block");
        $("#bgFilter").css("display","block");
    });
    $(".register-body .password input").on("blur",function(){
        var thisObj = $(this);
        var value = thisObj.val().trim();
        if(value==""){
            $(".register-body .password-title").html(switchLangObj.i18n_inputPassword); 
        }else if(value.length<6){
            $(".register-body .password-title").html(switchLangObj.i18n_digitsPassword);   
        }else{
            $(".register-body .password-title").html("");
        }
    });
    $(".register-body .close").on("click",function(){
        var thisObj = $(this);
        thisObj.parent().css("display","none");
        $("#bgFilter").css("display","none");
    });
    $(".register-body .confirm input").on("blur",function(){
        var thisObj = $(this);
        var prepassword=$(".register-body .password input").val().trim();
        var value = thisObj.val().trim();
        if(value==""){
            $(".register-body .confirm-title").html(switchLangObj.i18n_inputPassword); 
        }else if((prepassword!=value)){
            $(".register-body .confirm-title").html(switchLangObj.i18n_inconsistent);
        }else{
            $(".register-body .confirm-title").html("");
        }
    });
    $(".register-body .emailCode input").on("blur",function(){
        var thisObj = $(this);
        var value = thisObj.val().trim();
        if(value==""){
            $(".register-body .emailCode .code-title").html(switchLangObj.i18n_rightCode); 
        }else{
            $(".register-body .emailCode .code-title").html("");
        }
    });
    $(".emailCode span").click(function(event) {
        var value=$(".emailCode span").html();
        if(config.domain == location.host){
            var emailInfo=$(".register-body .phone input").val().trim();
            if(emailInfo==""||(!isEmail(emailInfo)&&!isPhoneAvailable(emailInfo))){
                $(".register-body .phone .email-title").html(switchLangObj.i18n_emailOrPhoneAddress);
                return false;
            }else{
                $(".register-body .phone .email-title").html("");
            }
        }else{
            var emailInfo=$(".register-body .email input").val().trim();
            if(emailInfo==""||!isEmail(emailInfo)){
                $(".register-body .email .email-title").html(switchLangObj.i18n_emailAddress);
                return false;
            }else{
                $(".register-body .email .email-title").html("");
            } 
        }
        if(!$(".emailCode span").hasClass("disabled")){
            $(".emailCode span").addClass("disabled");
            var emailName =  $(".register-body .email input").val().trim()||$(".register-body .phone input").val().trim();
            var params={
                email: emailName
            }
            $.ajax({
                url: "/producerpro/user/sendVerifyCode",
                type: 'post',
                data:params,
                timeout:30000,
                success: function (data) { 
                    data = JSON.parse(data); 
                    if(data.errorCode=="0x0"){
                        $(".emailCode span").addClass("disabled"); 
                        Countdown();
                    }else if(data.errorCode=="0x80100001"){
                        if(data.errorInfo=="Exist user!"){
                            $(".register-body .emailCode .code-title").html(switchLangObj.i18n_AccountExists); 
                        }else{
                            $(".register-body .emailCode .code-title").html(switchLangObj.i18n_tryagain); 
                            $(".emailCode span").addClass("disabled");
                            Countdown();  
                        }   
                    }
                },error: function (err) {
                    console.log(err);
                    $(".emailCode span").removeClass("disabled");
                }
            })
         }
    });

    $(".register-body .user-register button").on("click",function(){
        var email,username,password,confirmValue,emialCode,verifyCode,phone;
        email = $(".register-body .email input").val().trim();
        phone = $(".register-body .phone input").val().trim();
        password = $(".register-body .password input").val().trim();
        confirmValue =$(".register-body .confirm input").val().trim();
        emialCode=$(".register-body .emailCode input").val().trim();
        if(config.domain == location.host){
            if(!isEmail(phone)&&!isPhoneAvailable(phone)){
                $(".register-body .email-title").html(switchLangObj.i18n_emailOrPhoneAddress);
                return;
            }
        }else{
            if(!isEmail(email)){
                $(".register-body .email-title").html(switchLangObj.i18n_emailAddress);
                return;
            }
        }
        email = email|| phone;
        if(password==""){
            $(".register-body .password-title").html(switchLangObj.i18n_inputPassword);
            return;
        }
        if((password=="")||(confirmValue!=password)){
            $(".register-body .confirm-title").html(switchLangObj.i18n_inconsistent);
            return; 
        }
        if(emialCode==""){
            $(".register-body .code-title").html(switchLangObj.i18n_rightCode);
            return; 
        }
        var params={
            email:email,
            password:CryptoJS.SHA512(password)+"",
            verifyCode:emialCode,
            parentInviteCode:$(".register-body .invite input").val().trim(),
        }
        $.ajax({
          url: "/producerpro/user/checkVerifyCode",
          type: 'post',
          data:params,
          timeout:30000,
          success: function (data) {
            data = JSON.parse(data);
            if(data.errorCode=="0x0"||data.errorCode=="0x80100015"){
                $(".register-body .email-title").html("");
                $(".register-body .password-title").html("");
                $(".register-body .username-title").html("");
                $(".register-body input").val("");
                $(".inviteCode-title").html("");
                // $(".register-body").css("display","none");
                var username=$(".header-title").attr("data-username");
                localStorage.setItem('userName', username);
                if($(".main-center").length!=0){
                    logout();
                    return false;
                }                
                window.location.href = "http://" + window.location.host + "/producerpro/";          
            }else if(data.errorCode=="0x80100001"){
                if(data.errorInfo=="parentInviteCode not exist!"){
                    $(".inviteCode-title").html(switchLangObj.i18n_inviteRightCode);
                }else{
                    $(".register-body .emailCode .code-title").html(switchLangObj.i18n_rightCode); 
                }  
            }
          },
          error: function (err) {
            console.log(err)
          }
        })
    });

    $(".userSignInfo a").click(function(){
        window.location.href = "http://" + window.location.host + "/producerpro/";
    });
    
    $(".registerSign").click(function(){
        if($(".main-center").length==0){
            var host = location.host;
            if(host=="producer-a.tvunetworks.com"||host=="producer-b.tvunetworks.com"){
                location.href = "./selectSystem.html";
            }else{
                var url="http://" + window.location.host + "/producerpro/";
                $(".registerSign").attr("href",url); 
            } 
        }else{
            confirmLogin();
        }
    });

    $(".register").click(function(){
        var url="http://" + window.location.host + "/producerpro/user/register.html";
        $(".register").attr("href",url);
    })
    $(".paypal").click(function(){
        var name = localStorage.getItem("userEmial");
        window.location.href="http://" + window.location.host + "/producerpro/newbilling?email="+name+"";
        $(".load").css("display","block");
    });

    $(".terms span").click(function(event) {
        $("body").css("background","rgba(0,0,0,0.3)");
        var thisObj = $(this);
        thisObj.parents(".terms").parent().find(".rule").css("display","block");
    });

    $(".rule div").click(function(event) {
        $("body").css("background","#fff");
        var thisObj = $(this);
        thisObj.parents(".rule").css("display","none");
    });

    if($(".main-center").length==0){
        if($(".purchase").hasClass('paymoney')) return false;
        $.ajax({
            url:"/producerpro/logout",
            data:{
                'session':localStorage.getItem("session")
            },
            success:function(msg){
            },
            error: function() {
            }
        });
    }
    if(config.domain==location.host){
        $(".register-body .email").hide();
        $(".register-body .phone").show();
    }else{
        $(".register-body .email").show();
        $(".register-body .phone").hide();
    }
}); 

function isEmail(str){ 
    var reg = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/; 
    return reg.test(str); 
}
 
function isPhoneAvailable(phonevalue){
    var phoneReg = /^1[3-578]\d{9}$/;
    if(phoneReg.test(phonevalue)){
       return true;
    }else{
       return false;
   }
}
var settimer = "";
function Countdown(){
    var time = 60;
    settimer = setInterval(function(){
        if(time<=1){
            clearInterval(settimer);
            time = 60;
            var usersession=localStorage.getItem("session");
            $(".emailCode span").css("color","rgba(51,171,79,1)");
            $(".emailCode span").removeClass("disabled");
            $(".emailCode span").html(switchLangObj.i18_reSend);
        }else{
            time--;
            $(".emailCode span").css("color","rgba(153,153,153,1)");
            $(".emailCode span").html(switchLangObj.i18_reSend+"("+time+")");
        }
    },1000);
}
function confirmLogin(){
    oUtils.confirmTips(switchLangObj.i18_ComfirmLogin,function(){
        logout();
    });
} 
$(window).unload(function(){
    if($("#user_info_name").lenght!=0&&$("#user_info_name").html()=="guest@tvunetworks.com"){
        logout();
    }
});
window.onpopstate = function(){
    var state = window.history.state;
    if(state&&$("#user_info_name").lenght!=0){
        if(state.state==1&&$("#user_info_name").html()=="guest@tvunetworks.com"){
            logout();
        } 
    }
}
//微信支付
$(function(){
    var weixinStatus = undefined,orderId = undefined;
    $(".purchase-cn").on("click",".to-pay button",function(){
        var ua = navigator.userAgent.toLowerCase();
        var isWeixin = ua.indexOf('micromessenger') != -1;
        if (isWeixin) {
            var openId=window.location.href;
            var openIdPosition=openId.indexOf("=");
            openId=openId.slice(openIdPosition+1);
            var params={
                openid:openId
            }
            $.ajax({
                type: "POST",
                url:"/producerpro/weixinmobilepay",
                timeout:60000,
                data:params,
                success: function(data){
                    data = JSON.parse(data);
                    var result=data.result;
                    if (typeof result != 'object') {
                        if(result.indexOf("\"") == 0) {
                            result = result.substring(1, result.length - 1);
                        }
                        result = JSON.parse(result);
                    }
                    if(data.errorCode == "0x0"){
                        if(data.result.chargeType == "free charge"){
                            window.location.href="http://" + window.location.host + "/producerpro/";
                            return false;
                        }
                        var timeStamp=result.timeStamp;
                        var paySign=result.paySign;
                        orderId=result.orderId;
                        var repackage=result.repackage;
                        var appId=result.appId;
                        var prepayId=result.prepayId;
                        var signType=result.signType;
                        var nonceStr=result.nonceStr;
                        clearInterval(weixinStatus);
                        weixinStatus = setInterval(checkWeixin,5000);
                        MobilePayment(appId,timeStamp,nonceStr,repackage,signType,paySign);
                    }
                }
            });
        }else{
            $.ajax({
                type: "POST",
                url:"/producerpro/wechat_createPayUrl",
                timeout:60000,
                success: function(data){
                    data = JSON.parse(data);
                    $("#payimg").html("");
                    $("#phonepayimg").html("");
                    if (data.errorCode == "0x0") {
                        if(data.result == "free charge"){
                            window.location.href="http://" + window.location.host + "/producerpro/";
                            return false;
                        }
                        var qrCode = new QRCode("payimg",{
                            width: 200,
                            height: 200,
                            colorDark : '#000000',
                            colorLight : '#ffffff',
                            correctLevel : QRCode.CorrectLevel.H
                        });
                        var orderIndex = data.result.lastIndexOf("&");
                        var result = data.result.substring(0,orderIndex);
                        var order = data.result.substring(orderIndex+1);
                        qrCode.makeCode(result);
                        $(".payqrimg").show();
                        orderId = order.split("=")[1];
                        clearInterval(weixinStatus);
                        weixinStatus = setInterval(checkWeixin,5000); 
                    } 
                }
            })
        }
    });
    $(".payqrimg .close").on("click",function(){
        $(".payqrimg").hide();
    });
    $(".payMobile .close").on("click",function(){
        $(".payMobile").hide();
    });
    $(".purchase-cn .close").on("click",function(){
        clearInterval(weixinStatus);
        $(".purchase-cn").hide();
        $("#bgFilter").hide();
    });
    
    function checkWeixin(){
        var params = {orderId:orderId} 
        $.ajax({
            type: "POST",
            data:params,
            url:"/producerpro/wechat_pay_getOrderStatus",
            timeout:60000,
            success: function(data){
                data = JSON.parse(data);
                if(data.errorCode=="0x0"&&data.result=="SUCCESS"){
                    clearInterval(weixinStatus);
                    window.location.href="http://" + window.location.host + "/producerpro/";
                }else if(data.result=="PAYERROR"){
                    clearInterval(weixinStatus);
                    localStorage.setItem("useWeixin","isTrue");
                    window.location.href="http://" + window.location.host + "/producerpro/";
                }
            }
        })
    }
    

    function onBridgeReady(appId,timeStamp,nonceStr,repackage,signType,paySign){
        WeixinJSBridge.invoke(
                'getBrandWCPayRequest', {
                "appId":appId,     //公众号名称，由商户传入     
                "timeStamp":timeStamp,         //时间戳，自1970年以来的秒数     
                "nonceStr":nonceStr, //随机串     
                "package":repackage,     
                "signType":signType,         //微信签名方式：     
                "paySign":paySign//微信签名 
            },
            function(res){
                if(res.err_msg == "get_brand_wcpay_request:ok" ){
                   clearInterval(weixinStatus);
                } 
            }); 
    }


    function MobilePayment(appId,timeStamp,nonceStr,repackage,signType,paySign){
        if (typeof WeixinJSBridge == "undefined"){
            if( document.addEventListener ){
               document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);

            }else if (document.attachEvent){
               document.attachEvent('WeixinJSBridgeReady', onBridgeReady); 
               document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
            }
        }else{
            onBridgeReady(appId,timeStamp,nonceStr,repackage,signType,paySign);
        }
    }

})

