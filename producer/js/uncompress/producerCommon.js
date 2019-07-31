var mix_fn = (function($,oUtils,switchLangObj){
    function isPrower(fnName){
         if(AUTHORITY&&AUTHORITY.indexOf(fnName)>-1){
            return true;
         }else{
            var user_info_name = $("#user_info_name").html(); 
            if(user_info_name == "guest@tvunetworks.com"){
                // 弹出注册页面
                // $(".purchase-cn").css("display","block");
                $(".register-body").css("display","block");
                $("#bgFilter").css("display","block");
                if("producer.tvunetworks.cn"==location.host){
                    $(".register-body .email").hide();
                    $(".register-body .phone").show();
                }else{
                    $(".register-body .email").show();
                    $(".register-body .phone").hide();
                }
                return false;
            }else{
                var host = location.host;
                if( host == "producer.tvunetworks.cn"){
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
                return false;
            }
         }
    }
    //初始化事件
    return {
        isPrower:isPrower,
    }
})($,oUtils,switchLangObj);