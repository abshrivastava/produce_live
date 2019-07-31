$(function(){
    $(".businessType").text(localStorage.getItem("businessType"));
    function whichButton(event){
        var btnNum = event.button;
        if (btnNum!=2){
            $(".tip-download").show();
            event.preventDefault();
            return false;
        }  
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
        return year+"."+month+"."+day+" "+hour+":"+minute+":"+seconds;
    }
    function _getDelTime(value,type){
        type=="TimeHistory" ? value : value = value/1000;
        var hours = Math.floor(value / (60 * 60));
        var minutes = Math.floor(value / 60 % 60);
        var seconds = Math.floor(value % 60 % 60);
        hours = hours <= 9 ? "0" + hours : hours;    
        minutes = minutes <= 9 ? "0" + minutes : minutes;
        if(type=="TimeHistory") return hours+ switchLangObj.i18n_hoursTime +  minutes+ switchLangObj.i18n_minTime; 
        return hours + ":" + minutes;
    }

    function getListRecords(num){
        var params = {
            currentPageNum: num,
            everyPageNum: 4
        }
        oUtils.ajaxReq("/producerpro/listRecords",params,function (data) {
            if(data.errorCode=="0x0"){
                data = data.result;
                var resultList = data["resultList"];
                if(resultList.length==0){
                    $(".download .page").addClass("hide");
                    $(".download .video-list").html("");
                    return false;
                }else{
                    $(".download .page").removeClass("hide");
                }
                var html = "";
                for(var i=0;i<resultList.length;i++){
                    var saveTime = _getSaveTime(resultList[i]["end_time"]);
                    var random = Math.random();
                    var delTime = _getDelTime(24*3600*1000+resultList[i]["end_time"]-new Date().getTime());
                    html += '<li>\
                        <div class="time-about clearFix">\
                            <div class="start-time left">'+saveTime+'</div> \
                            <div class="delete-time right">Auto delete after '+delTime+'</div> \
                        </div>\
                        <div class="pic-opt clearFix">\
                            <div class="frontcover left">\
                                <img src="'+resultList[i]["pic_url"]+'?random='+random+'" alt="">\
                            </div>\
                            <div class="operate right">\
                            <a class="download-btn" onselectstart="return false" href="'+resultList[i]["url"]+'" download>\
                                <span class="iconfont icon-download"></span>\
                                <span>Download</span>\
                            </a>\
                        </div>\
                    </li>';
                }
                $(".download .video-list").html(html);
                $(".download .pre-page").removeClass("disabled");
                $(".download .next-page").removeClass("disabled");
                if(data.currentPageNum==1){
                    $(".download .pre-page").addClass("disabled");
                }
                if(data.currentPageNum==data.totalPageNum){
                    $(".download .next-page").addClass("disabled");
                }
                $(".download .currentpage").html(data.currentPageNum);
                $(".download .totalpage").html(data.totalPageNum);
            }
            
        });
    }
    function initEvent(){
        $(".tab").on("click","li",function(){
            var thisObj = $(this);
            var index = thisObj.index();
            thisObj.addClass("active").siblings().removeClass("active");
            $(".content-tab>li").eq(index).css("display","block").siblings().css("display","none");
        })
        $(".download").on("click",".download-btn",function(event){
            whichButton(event);
        });
        $(".download .pre-page,.download .next-page").on("click",function(){
            var thisObj = $(this);
            if(thisObj.hasClass("disabled"))return false;
            var currentPage = $(".download .currentpage").html();
            if(thisObj.hasClass("pre-page")){
                currentPage = parseInt(currentPage)-1;
            }else{
                currentPage = parseInt(currentPage)+1;
            }
            getListRecords(currentPage);
        });
        $(".user-history .pre-page,.user-history .next-page").on("click",function(){
            var thisObj = $(this);
            if(thisObj.hasClass("disabled"))return false;
            var currentPage = $(".user-history .currentpage").html();
            if(thisObj.hasClass("pre-page")){
                currentPage = parseInt(currentPage)-1;
            }else{
                currentPage = parseInt(currentPage)+1;
            }
            getUserHistoryInfo(currentPage);
        });
        $(".tip-download .confirm-btn").on("click",function(){
            $(".tip-download").hide();
        });
    }

    function getUserHistoryInfo(num){
        var userEmial=$("#user_info_name").text();
        var params = {
            email:userEmial
        }
        oUtils.ajaxReq("/producerpro/getUsageHistory/8/"+num+"",params,function (data) {
            if(data.errorCode=="0x0"){
                data = data.result;
                var resultList = data["resultList"];
                if(resultList.length==0){
                    $(".user-history .page").addClass("hide");
                    $(".user-history .video-list").html("");
                    return false;
                }else{
                    $(".user-historyd .page").removeClass("hide");
                }
                var html = "";
                for(var i=0;i<resultList.length;i++){
                    var type=resultList[i]["type"];
                    var create_time=_getSaveTime(resultList[i]["create_time"]);
                    var used_time=_getDelTime(resultList[i]["used_time"],"TimeHistory"); //没取到
                    var end_time=resultList[i]["end_time"];
                    end_time== null ? end_time = " " : end_time =_getSaveTime(end_time);
                    var remain_time=_getDelTime(resultList[i]["remain_time"],"TimeHistory");
                    var bussinessType="",proType="",color="";
                    if(type=="1"){
                        used_time = "+" + used_time;
                        proType=switchLangObj.i18n_Pro;
                        bussinessType="userBussinessType";
                    }else if(type=="0"){
                        proType=switchLangObj.i18n_Adv;
                        used_time = "+ " + used_time;
                        bussinessType="userBussinessType";
                    }else{
                        used_time = "- " + used_time;
                    }
                    html += '<li>\
                    <div class="create-time left">\
                        <p>'+create_time+' ~ '+end_time+'</p>\
                        <p class="left '+color+'"> '+used_time+'</p>\
                        <p class="left '+bussinessType+'">'+proType+'</p>\
                    </div>\
                    <div class="remain-time"><span>'+switchLangObj.i18n_Remain+'</span> <span>'+remain_time+'</span></div>\
                 </li>';
                }
                $(".user-history .history-list").html(html);
                $(".user-history .pre-page").removeClass("disabled");
                $(".user-history .next-page").removeClass("disabled");
                if(data.currentPageNum==1){
                    $(".user-history .pre-page").addClass("disabled");
                }
                if(data.currentPageNum==data.totalPageNum){
                    $(".user-history .next-page").addClass("disabled");
                }
                $(".user-history .currentpage").html(data.currentPageNum);
                $(".user-history .totalpage").html(data.totalPageNum);
            }
            
        });
    }

    initEvent();
    $("#user_info_name").text(localStorage.getItem("userEmial"));
    getListRecords(1);
    getUserHistoryInfo(1);
})