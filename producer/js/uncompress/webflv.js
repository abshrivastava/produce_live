//web flv 
var webflv= (function($,switchLangObj,wpjs){
    var videoDom = {
    }
    var peerClientStatusArr = {
        backdata:null,
        playObj:{}
    };
    function createBigPlayerDom(id){
        var name = id[0].replace(/\//g, "_");
        if(videoDom.output||videoDom.input){
            var div = '<video playsinline autoplay="autoplay" class="left main-player" id="'+name+'"></video>';
                // <div class="timeStamp">\
                //     timeStamp:<span></span>\
                // </div>';
            var videoBox = videoDom.input||videoDom.output;
            // video.find("video").css("display","none");
            videoBox.html(div);
            // videoBox.removeAttr("style");
            videoBox.find("video").attr("id",name);
            createPlayer(id[0],videoBox.find("video")[0])
            // videoBox.find("video")[0].play();
            var volumeHtml = '<div class="left audio">\
                    <div class="row left">\
                        <div class="bg">\
                            <div class="back container">\
                                <div class="active"></div>\
                            </div>\
                        </div>\
                    </div>\
                    <div class="row right">\
                        <div class="bg">\
                            <div class="back container">\
                                <div class="active"></div>\
                            </div>\
                        </div>\
                    </div>\
                </div>';
                videoBox.parent().append(volumeHtml);
            if(videoDom.input){
                if($(".apply-preview .radius-box").hasClass('shut'))$(".main-preview .audio").css("display","none");
                videoBox.find("video")[0].volume = 0;
                videoBox.find("video")[0].muted = true;
                $(".preview-voice .voice-control-mark").attr("data-value",0);
                $(".preview-voice .voice-control-slider").slider("value",0);
                $(".preview-voice .voice-control-slider").find(".voice-value").html(0);
            }
            if(videoDom.output){
                $(".main-output").attr("data-filename",peerClientStatusArr.backdata["CurrentEncoderSharedMemory"]["SharedMemoryName"]);
                if(peerClientStatusArr.backdata["CurrentPIPList"]!==null&&peerClientStatusArr.backdata["CurrentPIPList"].length>0){
                    $(".main-output").attr("data-pipfilename",peerClientStatusArr.backdata["CurrentPIPList"][0]["id"]);
                }
                if($(".main-output .output-erphone .icon-erphone").hasClass("active")){
                    videoBox.find("video")[0].volume = 1;
                    videoBox.find("video")[0].muted = false;
                }else{
                    videoBox.find("video")[0].volume = 0;
                    videoBox.find("video")[0].muted = true;
                }
                // $(".output-voice .voice-control-mark").attr("data-value",0);
                // $(".output-voice .voice-control-slider").slider("value",0);
                // $(".output-voice .voice-control-slider").find(".voice-value").html(0);
            }
        } 
    }
    // function createSmallPlayerDom(previewList){
    function createSmallPlayerDom(curItem){
        // var curItem = previewList[0];
        var name = curItem.PreviewID;
        var nameIndex = webrtcVideo.peerIds.indexOf(name);
        var rid="";
        if(curItem.PreviewShm.R_ID){
            rid=curItem.PreviewShm.R_ID;
            rid = " data-rid="+rid;
        }
        if(curItem.PreviewShm.SharedMemoryName==="Default"){
            rid = $(".main-rList .rList-show").attr("data-peerid").toUpperCase();
            rid = " data-rid='"+rid+"'";
        }
        if(curItem.PreviewShm.SourceType==100){
            sourceTypeIcon = "icon-ext";
        }else if(curItem.PreviewShm.SourceType==200){
            //清除ip-del
            sourceTypeIcon = "icon-ip-source";
        }else {
            sourceTypeIcon = "icon-pack";
        }
        var id = name.replace(/\//g, "_");
        var previewListItem =   '<li class="preview-item" data-filename="'+curItem.PreviewShm.SharedMemoryName+'" '+rid+'>\
                                    <div  style="position:relative">\
                                        <video playsinline height=168 muted width=300 class="preview-item-video" id='+id+'></video>\
                                        <div class="slider-vertical voice-control"></div>\
                                        <div class="left audio">\
                                            <div class="row left">\
                                                <div class="bg">\
                                                    <div class="back container">\
                                                        <div class="active"></div>\
                                                    </div>\
                                                </div>\
                                            </div>\
                                            <div class="row right">\
                                                <div class="bg">\
                                                    <div class="back container">\
                                                        <div class="active"></div>\
                                                    </div>\
                                                </div>\
                                            </div>\
                                        </div>\
                                    </div>\
                                    <div class="preview-item-control clearFix">\
                                        <div class="item-control-setting left" >\
                                            <span class="iconfont '+sourceTypeIcon+' set-name left"></span>\
                                            <div class="edit-name left"><input type="text" style="display:none"><div class="show-name"></div></div>\
                                        </div>\
                                        <div class="item-control-voice erphone right">\
                                            <span class="iconfont icon-erphone"></span>\
                                            <span class="iconfont voice icon-novoice"></span>\
                                        </div>\
                                    </div>\
                                    <span class="preview-item-num"></span>\
                                    </li>';
        var previewUlEle = $(".sd-preview-list .preview-content");
        if(curItem.PreviewShm.SourceType==0||curItem.PreviewShm.SourceType==300){
            previewUlEle.prepend(previewListItem);
        }else{
            previewUlEle.append(previewListItem);
        }    
        var listWidth = previewUlEle.find(".preview-item").length*320-20+"px";
        previewUlEle.css("width",listWidth);
        $(".preview-list-container").fnNiceScroll("#444");
        createPlayer(name,$("#"+id)[0]);
        $("#"+id)[0].volume = 0;

        var itemEles = previewUlEle.find(".preview-item"); //根据peerId将视频排序
        // $.each(itemEles,function(idx,itm){
        //      $(itm).find(".preview-item-num").html(idx+1);
        // });
         

       
        //避免多次循环，写个定时器
        if(videoDom.timer) clearTimeout(videoDom.timer);
        videoDom.timer = setTimeout(function(){
            
            var eleRArr = [],eleOtherArr=[],mainR='';
            $.each(itemEles,function(idx,itm){
                var fileName = $(itm).attr("data-filename");
                if(fileName=="Default"){
                    mainR = itm;
                }else if(fileName.indexOf("(R Shim)")>-1){
                    eleRArr.push(itm)
                }else if(fileName.indexOf("(IP Shim)")>-1){
                    eleOtherArr.unshift(itm); 
                }else{
                    eleOtherArr.push(itm); 
                }
            });
            eleRArr = eleRArr.sort(sortVideo);
            eleRArr = eleRArr.concat(eleOtherArr);
            eleRArr.unshift(mainR);
            eleRArr.forEach(function(v,i){
                $(v).find(".preview-item-num").html(i+1);
                previewUlEle.append(v);
            });
            $.each($(".preview-content").find("video"),function(idx,itm){
                itm.play();
            });
        },1000);
        if(peerClientStatusArr.previewListNum==$(".preview-content .preview-item").length&&($(".show-logo .pretreat-item-logo").length==0&&$(".show-score .pretreat-item-score").length==0&&$(".show-text .pretreat-item-text").length==0)){
            peerClientStatusArr.previewList = true;
        }
        // $(".main-preview").removeAttr("data-filename");
        // $(".main-output").removeAttr("data-filename");
        //避免peerclient重启造成pip没有恢复的问题发生
        if($("#preview .pip").length!==0&&$("#preview .pip").find("video").attr("data-videoid")==name){
            delete peerClientStatusArr.videoResetNumObj[name];
            createPipVideo(name);
        }
        // 避免R重启后，没有恢复pip的情况发生
        if($("#preview .pip").length!==0&&$("#preview .pip").attr("data-pipvideosharedmemoryname")==curItem.PreviewShm.SharedMemoryName){
            createPipVideo(name);
        }
        //初始化previewlist volume
        var previewVolume = volumeConversion.volumeR2local(curItem.CurrentVolume);
        if(previewVolume > 0){
            $('.preview-content [data-filename="'+curItem.PreviewShm.SharedMemoryName+'"]').find(".voice").removeClass("icon-novoice").addClass("icon-voice");
        }
        createPreviewListVoiceControl(previewVolume, $('.preview-content [data-filename="'+curItem.PreviewShm.SharedMemoryName+'"]'),'vertical');
        var shareVolume = curItem.PreviewShm.SharedMemoryName;
        // var timer = setInterval(function(){
        //     if($("#"+id)[0].played.length>0){
        //         clearInterval(timer);
        //         previewList.shift();
        //         if(previewList.length>0){
        //             createSmallPlayerDom(previewList);
        //         } 
        //     }
        // },50);
    }
    function createPlayer(url,element){
        var key = url.replace(/\//g, "_");

        var wsreader = wpjs.createWSReader(element);
        // new WebPlayer()
        var player = wpjs.createPlayer({
            isLive: true,
            lazyLoadMaxDuration: 60,
            seekType: 'range',
        });
        peerClientStatusArr.playObj[key] = {"player":player,"wsreader":wsreader,"url":url};
        // peerClientStatusArr.playObj[key] = element;
        player.init(element);
        // player.reconnect =  wsreader.MSEErrorExcute.bind(wsreader);
        wsreader.onReconnect = player.reset.bind(player);
        wsreader.onMetadataArrived = player.onMetadataReceived.bind(player);
        wsreader.onVideoSampleArrived = player.appendVideoSample.bind(player);
        wsreader.onAudioSampleArrived = player.appendAudioSample.bind(player);
        var ip = $(".main-rList .rList-show").attr("data-rip");
        url = "ws://"+ip+":" + url;
        // url = "";
        wsreader.open(url);
        // setInterval(function(){
        //     showTimestamp(peerClientStatusArr.playObj[key]["player"],element);
        //     // console.log(peerClientStatusArr.playObj[key].currentTime);
        // });
        console.log(url);
    }
    // function showTimestamp(player,element){
    //     var timeStampDom =  $(element).parent().find(".timeStamp");
    //     var timestamp = Math.round(player.currentTime * 1000) + player.dtsBase;
    //     timeStampDom.html(timestamp);
    // }
    // MSE error excute
    // function MSEErrorExcute(id){
    //     console.log("MSE error player restart.");
    //     var playObj = webflv.playObj[id];
    //     playObj["wsreader"].destroy();
    //     playObj["player"].pause();
    //     playObj["player"].detachMediaElement();
    //     playObj["player"].destroy();
    //     playObj["player"] = null;
    //     var url = webflv.playObj[id]["url"];
    //     delete webflv.playObj[id];
    //     var element = $("#"+id)[0];
    //     createPlayer(url,element);
    // }
    function createFlvVideo(options){
        videoDom.input = options.input||null;
        videoDom.output = options.output||null;
        videoDom.previewList = options.previewList||null;
        peerClientStatusArr.backdata = options.data||null;
        if(videoDom.input!=null||videoDom.output!=null){
            createBigPlayerDom(options.id);
        }else{
            console.log(videoDom.previewList);
            videoDom.previewList.forEach(function(v,i){
                createSmallPlayerDom(v);
            });
            // createSmallPlayerDom(videoDom.previewList);
        }
    }
    function sortVideo(ele1,ele2){
        var id1 = parseInt($(ele1).attr("data-rid"),16),
            id2 = parseInt($(ele2).attr("data-rid"),16);
        if(id1<id2){
            return -1;
        }else if(id1>id2){
            return 1;
        }else{
            return 0;
        }
    }
    return {
        createFlvVideo:createFlvVideo,
        playObj:peerClientStatusArr.playObj,
    }
})($,switchLangObj,wpjs);