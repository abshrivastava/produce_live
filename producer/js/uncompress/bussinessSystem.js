$(function(){
    $("#user_info_name").text(localStorage.getItem("userEmial"));
    $(".businessType").text(localStorage.getItem("businessType"));
    var currentUrl=window.location.host;
    var langu=undefined;
    currentUrl.indexOf("com")>0 ? langu="EN": langu="CH";
    langu=="EN" ? $(".userWhatToPay").text(switchLangObj.i18n_paypal): $(".userWhatToPay").text(switchLangObj.i18n_wechat);

    //点击购买后判断应该跳转到专业还是高级版页面
    function checkUrl(){
        var url=window.location.href;
        if(url.slice(-1)!="p"){
            $(".pattern-content").css("display","block"); 
            $(".price-content").css("display","none");   
        }
        else{//有p直接跳转到商务价格页面
            $(".pattern-content").css("display","none");  
            $(".price-content").css("display","block");
            var type=localStorage.getItem("businessType");//从localStorage去取值判断是什么套餐
            type==switchLangObj.i18n_Adv?type=0 :type=1;
            getPriceStrategy(type);
            $(".backPlan").css("display","none");
        }
    }

    //一些点击事件
    var weixinStatus = undefined,orderId = undefined;
    function initEvent(){
        $(".pattern-center,.pattern-right").click(function(){//选择的套餐添加绿框
            if($(this).siblings(".pattern").hasClass("proBorder")){
                $(this).siblings(".pattern").removeClass("proBorder");
                $(this).addClass("proBorder");
            }
        });

        $(".nextBtn").click(function(){//下一步
            $(".pattern-content").css("display","none");
            $(".price-content").css("display","block");
            var typeNumber = $(".pattern-content .proBorder").attr("data-type");
            getPriceStrategy(typeNumber)
        });

        $(".backPlan").click(function(){//返回
            $(".pattern-content").css("display","block"); 
            $(".price-content").css("display","none");   
        });
        
        $(".price-list ul").on("click","li",function(){
            if($(this).siblings("li").hasClass("proBorder")){
                $(this).siblings("li").removeClass("proBorder");
                $(this).addClass("proBorder");
            }
            getTimeInfo();
        });

        $(".icon-guanyuxinxitishijingshi").mouseover(function(){//提示的显示
            $(".timeTips").css("display","block");
        });
    
        $(".icon-guanyuxinxitishijingshi").mouseout(function(){
            $(".timeTips").css("display","none");
        });

        $(".userWhatToPay").click(function(){//支付选择
            var id=$(".price-list ul").find(".proBorder").attr("data-id");
            var userEmail=$("#user_info_name").text();
            var currentUrl=window.location.host;
            if(currentUrl.indexOf("com")<0){//中国区微信支付
                var ua = navigator.userAgent.toLowerCase();
                var id=$(".price-list ul").find("li").attr("data-id");
                $.ajax({
                    type: "GET",
                    url:"/producerpro/wechat_createPayUrl?priceStrategyId="+id+"",
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
                            $("#bgFilters").css("display","block");
                            orderId = order.split("=")[1];
                            clearInterval(weixinStatus);
                            weixinStatus = setInterval(checkWeixin,5000); 
                        } 
                    }
                });    
            }else{//全球区paypal支付
                $.ajax({
                    type: "GET",
                    url:"/producerpro/newAddRemain/"+id+"",
                    data: {
                        email:userEmail
                    },
                    timeout:60000,
                    success: function(data){
                        data = JSON.parse(data);
                        result=data.result;
                        if(data.errorCode=="0x0"){
                            window.location.href=result;
                        }else if(data.errorInfo="Exception"){
                            window.location.href="http://" + window.location.host + "/producerpro/user/orderConfirmFail.html";
                        }
                    }  
                });
            }   
        });

        $(".payqrimg .close").on("click",function(){
            $(".payqrimg").hide();
            $("#bgFilters").css("display","none");
        });
    }

    //获取商业套餐选择
    function getCommercialVersion(){
        var type=undefined;
        i18nLanguage=="zh"?type="CH" :type="EN";
        var params={
            language:type//根据语言来传参，如果是中文作为中国区
        }
        oUtils.ajaxReq("/producerpro/getCommercialVersion",params,function (data) {
            if(data.errorCode=="0x0"){
                var resultList = data.result;
                var adv=resultList.adv;
                var pro=resultList.pro;
                var advhtml = "<li>"+switchLangObj.i18n_Advanced+"</li>";
                var prohtml="<li>"+switchLangObj.i18n_Professional+"</li>";
                var titleHtml="<li></li>";
                Object.keys(adv).forEach(key => {
                    titleHtml+='<li>'+key+'</li>';
                });
                $(".pattern-left ul").html(titleHtml);
                Object.keys(pro).forEach(key => {//渲染专业模式
                    if(pro[key]=="true"){
                        prohtml +=  '<li class="iconfont icon-duihao"></li>';
                    }else if(pro[key]=="false"){
                        prohtml += '<li class="iconfont icon-cuo"></li>';
                    }else{ 
                        if( langu=="CH") {//先判断环境再判断语言
                            if(pro[key].split("&")[1]!=undefined){
                                i18nLanguage=="zh"? prohtml += '<li>'+pro[key].split("&")[0]+'</li>': prohtml += '<li>'+pro[key].split("&")[2]+'</li>';
                            }else{
                                prohtml += '<li>'+pro[key]+'</li>';
                            }
                        }else{
                            if(pro[key].split("&")[1]!=undefined){
                                i18nLanguage=="zh"? prohtml += '<li>'+pro[key].split("&")[1]+'</li>': prohtml += '<li>'+pro[key].split("&")[3]+'</li>';
                            }else{
                                prohtml += '<li>'+pro[key]+'</li>';
                            }
                        }
                    }
                });
                $(".pattern-center ul").html(prohtml);
                Object.keys(adv).forEach(key => {//渲染高级模式
                    if ( adv[key] == "true"){
                        advhtml +=  '<li class="iconfont icon-duihao"></li>';
                    }else if(adv[key] == "false"){
                        advhtml +=  '<li class="iconfont icon-cuo"></li>';
                    }else if ( key == "Replay"||key == "回放"){
                        if(adv[key]!="fasle"){
                            advhtml +=  '<li class="iconfont icon-duihao">'+adv[key]+'</li>';
                        }else{
                            advhtml +=  '<li class="iconfont con-cuo"></li>';
                        }    
                    }else{
                        if( langu=="CH") {
                            if(adv[key].split("&")[1]!=undefined){
                                i18nLanguage=="zh"? advhtml += '<li>'+adv[key].split("&")[0]+'</li>': advhtml += '<li>'+adv[key].split("&")[2]+'</li>';
                            }else{
                                advhtml += '<li>'+adv[key]+'</li>';
                            }
                          
                        }else{
                            if(adv[key].split("&")[1]!=undefined){
                                i18nLanguage=="zh"? advhtml += '<li>'+adv[key].split("&")[1]+'</li>': advhtml += '<li>'+adv[key].split("&")[3]+'</li>';
                            }else{
                                advhtml += '<li>'+adv[key]+'</li>';
                            }   
                        }
                    }
                });
                $(".pattern-right ul").html(advhtml);
                $(".pattern-content .nextBtn").text(switchLangObj.i18n_next);
                $(".pattern-center").addClass("proBorder");
            }
        })
    }

    //获取相应套餐价格方法
    function getPriceStrategy(typeNumber){
        var currentUrl=window.location.host;
        var lang=undefined;
        currentUrl.indexOf("com")>0 ? lang="EN": lang="CH";//先判断环境再根据中英文来传参
        var params={
            type:typeNumber,
            language:lang
        }
        oUtils.ajaxReq("/producerpro/getPriceStrategy/"+typeNumber+"",params,function (data) {
            if(data.errorCode=="0x0"){
                var resultList = data.result;
                var data=resultList.data;
                var html="";
                for(var i=0;i<data.length;i++){
                    var id = data[i].id;
                    var type = data[i].type;
                    var price= data[i].price/100;
                    var feeType=data[i].feeType;
                    var availableTime=data[i].availableTime;
                    var hours=undefined;
                    availableTime=="1"?hours=switchLangObj.i18n_hourTime:hours=switchLangObj.i18n_hourTimes;
                    var period = data[i].period;
                    var ExpireTime=undefined;   
                    if(period=="0"){//绑定一个时间方遍计算过期时间
                        period=switchLangObj.i18n_oneWeek;
                        ExpireTime=604800000;
                    }else if(period=="1"){
                        period=switchLangObj.i18n_oneMonth; //1个月按31天计算
                        ExpireTime=2678400000;
                    }else if(period=="2"){//半年计算按183天计算
                        period=switchLangObj.i18n_halfYear;
                        ExpireTime=15811200000;
                    }else{
                        period=switchLangObj.i18n_oneYear;//1年365天
                        ExpireTime=31622400000;
                    } 
                    type=="1"? $(".typeName").text(switchLangObj.i18n_Professional):$(".typeName").text(switchLangObj.i18n_Advanced);
                    feeType=="CNY"?feeType="¥":feeType="$";
                    html += '<li data-id='+id+' data-time='+ExpireTime+'>\
                        <div class="price-list-div">\
                            <p><span>'+switchLangObj.i18n_vaild +'</span> '+period+'</p>\
                            <p><span class="symbol">'+feeType+'</span><span class="">'+price+'</span></p>\
                            <p>'+ availableTime +' <span>'+hours+'</span></p>\
                        </div>\
                    </li>';
                }
                $(".price-list ul").html(html);
                $(".price-list ul").find("li").eq(0).addClass("proBorder");
                getTimeInfo();
            }     
        })
    }

    function getTimeInfo(){//获取剩余时间和过期时间，再根据选择的套餐来继而计算剩余时间和过期时间
        var userEmail=$("#user_info_name").text();
        var params={
            "email": userEmail,
        }
        oUtils.ajaxReq("/producerpro/getRemainAndExpireTime",params, function (data) {
            if(data.errorCode=="0x0"){
                var result=data.result;
                var expireTime=result.expireTime;
                $(".userExpirationDate .commonTimeLast").text(ExpireDateTime(expireTime));
                var remainTime=result.remainTime;
                $(".userRemainTime .commonTimeLast").text(transTimeByms(remainTime,true));
                if($(".price-list li").hasClass("proBorder")){
                    var addtime=$(".proBorder .price-list-div").find("p").eq(2).text();
                    addtime=addtime.split(" ")[0];
                    addtime=addtime*3600;
                    var ExpireTimeValue=$(".price-list .proBorder").attr("data-time");
                    var totleTime=expireTime+parseInt(ExpireTimeValue);
                    $(".userExpirationDate .commonTimeAfter").text(ExpireDateTime(totleTime));
                    $(".userRemainTime .commonTimeAfter").text(transTimeByms(remainTime+addtime,true));
                }
            }
        });
    }  
            
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
                    window.location.href="http://" + window.location.host + "/producerpro/user/paypalSuccess.html";
                }else if(data.result=="PAYERROR"){
                    clearInterval(weixinStatus);
                    localStorage.setItem("useWeixin","isTrue");
                    window.location.href="http://" + window.location.host + "/producerpro/user/orderConfirmFail.html";
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

    function ExpireDateTime(inputTime) {//时间戳转换
        var date = new Date(inputTime);
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        m = m < 10 ? ('0' + m) : m;
        var d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        return y + '/' + m + '/' + d;
    } 
    
    function transTimeByms(value,Reaminflag) {//时间转为时分秒
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

  
    initEvent();
    getCommercialVersion();
    checkUrl();
})

