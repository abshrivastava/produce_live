var whdef = 100/1920;// 表示1920的设计图,使用100PX的默认值
var wH = window.innerHeight;// 当前窗口的高度
var wW = window.innerWidth;// 当前窗口的宽度
var rem = wW * whdef;// 以默认比例值乘以当前窗口宽度,得到该宽度下的相应FONT-SIZE值
$('html').css('font-size', rem + "px");
$(window).resize(function (){
      var whdef = 100/1920;// 表示1920的设计图,使用100PX的默认值
      var wH = window.innerHeight;// 当前窗口的高度
      var wW = window.innerWidth;// 当前窗口的宽度
      var rem = wW * whdef;// 以默认比例值乘以当前窗口宽度,得到该宽度下的相应FONT-SIZE值
      $('html').css('font-size', rem + "px");
});

$(function(){
    var timer = null;
    var cur = 0;
    var len = $("#ads .adsLi").length;

    //鼠标滑过容器停止播放
    $("#ads").hover(function(){
        clearInterval(timer);
    },function(){
        showImg();
    });
    // 遍历所有圆点导航实现划过切换至对应的图片
    $("#ads").on("mouseover",".adsLi",function(){
        clearInterval(timer);
        cur = $(this).index();
        $(this).addClass("active").siblings().removeClass("active");
        $("#ads .adsImg").eq(cur).fadeIn(500).siblings(".adsImg").fadeOut(500);
    });

    $("#ads").on("mouseout",".adsLi",function(){
        clearInterval(timer);
        showImg();
    });

    //定义图片切换函数
    function showImg(){
        clearInterval(timer);
        timer = setInterval(function(){
            cur++;
            if( cur>=len ){ cur=0; }
            $("#ads .adsImg").eq( cur ).fadeIn(500).siblings(".adsImg").fadeOut(500);
            $("#ads .adsLi").eq( cur ).addClass("active").siblings().removeClass("active");
        },6000);
    }
    showImg();
});

$(function(){
    $(".register .email input").on("blur",function(){
        var thisObj = $(this)
        var value = thisObj.val().trim();
        if(!isEmail(value)){
            $(".register .email .email-title").html("Please input a correct Email address.");
        }else{
            $(".register .email .email-title").html("");
        }
    });

    $(".register .password input").on("blur",function(){
        var thisObj = $(this);
        var value = thisObj.val().trim();
        if(value==""){
            $(".register .password-title").html("Please input password!"); 
        }else if(value.length<6){
            $(".register .password-title").html("Please enter not less than 6 digits password");   
        }else{
            $(".register .password-title").html("");
        }
    });
   
    $(".register .emailCode input").on("blur",function(){
        var thisObj = $(this);
        var value = thisObj.val().trim();
        if(value==""){
            $(".register .emailCode .code-title").html("Please input the correct code"); 
        }else{
            $(".register .emailCode .code-title").html("");
        }
    });

    $(".email .sencode").click(function(event) {
        var value=$(".emailCode .sencode").html();
        var emailInfo=$(".register .email input").val();
        var InviteCode=undefined;
        if(emailInfo==""||!isEmail(emailInfo)){
            $(".register .email .email-title").html("Please input a correct Email address.");
            return false;
        }else{
            $(".register .email .email-title").html("");
        }
        ga('send', 'event', 'Verification Code', 'click', 'Send Code');
        if(!$(".email .sencode").hasClass("disabled")){
            $(".email .sencode").addClass("disabled");
            var emailName =  $(".register .email input").val().trim();
            if($(".register").parent(".parent").attr("id")=="ads"){
                InviteCode="VNTD";
            }else{
                InviteCode="TNTD";
            }
            var params={
                "email": emailName,
                "parentInviteCode":InviteCode
            }
            $.ajax({
                url: "/producerpro/user/sendVerifyCode",
                type: 'post',
                data:params,
                timeout:30000,
                success: function (data) { 
                    data = JSON.parse(data); 
                    if(data.errorCode=="0x0"){
                        $(".email .sencode").addClass("disabled");
                        Countdown();
                    }else if(data.errorCode=="0x80100001"){
                        if(data.errorInfo=="Please try send verify code in 1mins!"){
                            $(".register .emailCode .code-title").html("Please try again in a minute"); 
                        }else if(data.errorInfo=="Exist user!"){
                            $(".register .email-title").html("The user already exists, please sign in"); 
                        }
                        $(".email .sencode").addClass("disabled");
                        Countdown();
                    }
                },error: function (err) {
                    console.log(err);
                    $(".email .sencode").removeClass("disabled");
                }
            })
         }
    });

    $(".register .phone input").on("blur",function(){
        var phoneInfo=$(".register .phone input").val();
        if(phoneInfo==""){
            $(".register .phone .phone-title").html("Please input  phone number.");
        }else{
            $(".register .phone  .phone-title").html("");
        }

    });

    $(".register .job input").on("blur",function(){
        var jobInfo=$(".register .job input").val();
         if($(".register").parent(".parent").attr("id")=="anotherRegister"){
            if(jobInfo==""){
                $(".register .job .job-title").html("Please input job title");
            }else{
                $(".register .job .job-title").html("");
            }
        }
    })

    $(".register .country input").on("blur",function(){
        var countryInfo=$(".register .country input").val();
         if($(".register").parent(".parent").attr("id")=="anotherRegister"){
            if(countryInfo==""){
                $(".register .country .country-title").html("Please input country");
            }else{
                $(".register .country .country-title").html("");
            }
        }
    })

    $(".register .company input").on("blur",function(){
        var companyInfo=$(".register .company input").val();
         if($(".register").parent(".parent").attr("id")=="anotherRegister"){
            if(companyInfo==""){
                $(".register .company .company-title").html("Please input company name");
            }else{
                $(".register .company .company-title").html("");
            }
        }
    })

    $(".register .firstName input").on("blur",function(){
        var firstNameInfo=$(".register .firstName input").val();
         if($(".register").parent(".parent").attr("id")=="anotherRegister"){
            if(firstNameInfo==""){
                $(".register .firstName .firstName-title").html("Please input first Name ");
            }else{
                $(".register .firstName .firstName-title").html("");
            }
        }
    })

    $(".register .lastName input").on("blur",function(){
        var lastNameInfo=$(".register .lastName input").val();
         if($(".register").parent(".parent").attr("id")=="anotherRegister"){
            if(lastNameInfo==""){
                $(".register .lastName .lastName-title").html("Please input last Name ");
            }else{
                $(".register .lastName .lastName-title").html("");
            }
        }
    })


    $(".select .iconfont").click(function(){
        if($(this).hasClass("icon-checkbox_selected")){
            $(this).addClass("icon-checkbox_unselected");
            $(this).removeClass("icon-checkbox_selected");
            $(".register .user-register button").addClass("gary");
        }else{
            $(this).removeClass("icon-checkbox_unselected");
            $(this).addClass("icon-checkbox_selected");
            $(".register .user-register button").removeClass("gary");
        }
    })

    $(".questionMark").mouseover(function(){
        $(".questionHover").css("display","block");
    });

    $(".questionMark").mouseout(function(){
        $(".questionHover").css("display","none");
    });

    $(".register .user-register button").on("click",function(){
        var email,emialCode,password,username,phone,firstName,lastNamem,company,job,country,InviteCode;
        email = $(".register .email input").val().trim();
        phone = $(".register .phone input").val().trim();
        password = $(".register .password input").val().trim();
        emialCode =$(".register .emailCode input").val().trim();
        firstName =$(".register .firstName input").val().trim();
        company = $(".register .company input").val().trim();
        job = $(".register .job input").val().trim();
        country = $(".register .country input").val().trim();
        lastName =$(".register .lastName input").val().trim();
        username =firstName+lastName;
        ga('send', 'event', 'Register', 'click', 'User Reregister');
        if($(this).hasClass("gary")) return false;
        if(!isEmail(email)){
            $(".register .email-title").html("Please input a correct Email address.");
            return false;
        }
        if(password==""){
            $(".register .password-title").html("Please input password!");
            return false;
        }
        if(emialCode==""){
            $(".register .code-title").html("Please input verification code");
            return false; 
        }
        if($(".register").parent(".parent").attr("id")=="ads"){
            InviteCode="VNTD";
        }else{
            InviteCode="TNTD";
            if(firstName==""){
                $(".register .firstName .firstName-title").html("Please input first name ");
                return false;
            }
            if(lastName==""){
                $(".register .lastName .lastName-title").html("Please input last Name");
            }
            if(country==""){
                $(".register .country .country-title").html("Please input country");
                return false;
            }
            if(company==""){
                $(".register .company .company-title").html("Please input company name");
                return false;
            }
            if(job==""){
                $(".register .job .job-title").html("Please input job title");
                return false;
            }
            if(phone==""){
                $(".register .phone .phone-title").html("Please input phone number.");
                return false;
            }  
        }
        var params={
            "email":email,
            "password":CryptoJS.SHA512(password)+"",
            "verifyCode":emialCode,
            "name":username,
            "promotion":"0",
            "country":country,
            "jobTitle":job,
            "company":company,
            "phone":phone,
            "parentInviteCode":InviteCode,
        }
        $.ajax({
          url: "/producerpro/user/checkVerifyCode",
          type: 'post',
          data:params,
          timeout:30000,
          success: function (data) {
            data = JSON.parse(data);
            if(data.errorCode=="0x0"||data.errorCode=="0x80100015"){
                $(".register .email-title").html("");
                $(".register .password-title").html("");
                $(".register .username-title").html("");
                $(".register input").val("");
                $(".inviteCode-title").html("");
                window.location.href ="http://" + window.location.host + "/producerpro/user/paypalSuccess.html";        
            }else if(data.errorCode=="0x80100001"){
                if(data.errorInfo=="Wrong verify code!" ){
                    $(".register .emailCode .code-title").html("Please enter correct code"); 
                }else if(data.errorInfo=="Exist!"){
                    $(".register .email-title").html("The user already exists, please sign in."); 
                }
                $(".register .emailCode .code-title").html("Please enter correct code"); 
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
        ga('send', 'event', 'Sign', 'click', 'User Sign');
        if($(".main-center").length==0){
            var host = location.host;
            window.location.href ="http://" + window.location.host + "/producerpro/";
                $(".registerSign").attr("href",url); 
        }
    });
   
}); 

function isEmail(str){ 
    var reg = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/; 
    return reg.test(str); 
}
 
// function isPhoneAvailable(phonevalue){
//     var phoneReg = /^1[3-578]\d{9}$/;
//     if(phoneReg.test(phonevalue)){
//        return true;
//     }else{
//        return false;
//    }
// }

var settimer = "";
function Countdown(){
    var time = 60;
    settimer = setInterval(function(){
        if(time<=1){
            clearInterval(settimer);
            time = 60;
            var usersession=localStorage.getItem("session");
            $(".email .sencode").css("color","#FFF");
            $(".email .sencode").removeClass("disabled");
            $(".email .sencode").html("Resend");
        }else{
            time--;
            $(".email .sencode").css("color","#FFF");
            $(".email .sencode").html("Resend"+"("+time+")");
        }
    },1000);
}


$(window).unload(function(){
    if($("#user_info_name").lenght!=0&&$("#user_info_name").html()=="guest@tvunetworks.com"){
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
});


if($(".main-center").length==0){
    // if($(".purchase").hasClass('paymoney')) return false;
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