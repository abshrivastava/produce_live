/**
 * 拖拽的平衡的插件
 *
 * @author daniel
 * @since 2017-08-16
 */

(function($) {

    $.fn.sliderBalance = function(options) {

        var data = {
            container: null,
            target: null,
            callback:null,
            initPostion:0,
        }

        console.log(options);
        options = options ? options : {};
        data.parent = this;
        data.callback = options.callback? options.callback: null;
        data.initPostion = options.initPostion? options.initPostion: 0;
        var sliderBalance = $.sliderBalance.newInstance();
        sliderBalance.init(data);
    }


    $.sliderBalance = {
        settings: {
            data: null,
            callback:null,
        },

        newInstance: function() {
            return $.extend(true, {}, this);
        },

        init: function(data) {
            this.initDataEvent(data);
            this.addBalanceDom(data);
            this.initPostion(data);
            this.handleResizeEvent(data);
        },

        initDataEvent:function(data){
            this.settings.data = data;
            $(data.parent).parent().css({
                position: 'relative'
            });
        },

        initPostion: function(data){
            var bgc_l = $(data.parent).find(".bgc_l");
            var bgc_r = $(data.parent).find(".bgc_r");
            var rate = data.initPostion;
            if(rate>50){
                rate = rate - 50;
                bgc_l.css("width", "0%");
                bgc_r.css("width", rate+"%");
            }else if(rate<50){
                rate = 50 - rate;
                bgc_r.css("width", "0%");
                bgc_l.css("width", rate+"%");
            }else{
                rate = 0;
                bgc_r.css("width", "0%");
                bgc_l.css("width", "0%");
            }
            this.settings.data.lineDiv = $(data.parent).find(".lineDiv")[0];
            this.settings.data.minDiv = $(data.parent).find(".minDiv")[0];
            this.settings.data.bgc_l = $(data.parent).find(".bgc_l")[0];
            this.settings.data.bgc_r = $(data.parent).find(".bgc_r")[0];
            this.settings.data.target = $(this.settings.data.parent).find(".minDiv")[0];
        },

        addBalanceDom:function(data){
            var str =   '<div class="lineDiv">\
                            <div class="minDiv">\
                               <div class="min">\
                               </div>\
                            </div>\
                            <div class="center">\
                            </div>\
                            <div class="bgc_l">\
                            </div>\
                            <div class="bgc_r">\
                            </div>\
                        </div>\
                        <div class="balance-title">\
                            <span class="left">L</span>\
                            <span class="right">R</span>\
                        </div>';

            $(data.parent).html(str);
        },

        move:function(e,startXY,minDivOffsetLeft) { //minDivOffsetLeft是相对于浏览器的距离
            var lineDiv = this.settings.data.lineDiv;
            var minDiv = this.settings.data.minDiv;
            var bgc_l = this.settings.data.bgc_l;
            var bgc_r = this.settings.data.bgc_r;
            var xy = this.getPosition(e);//相对于页面的距离

            var distanceX = xy.x - startXY.x;//距离父盒子

            var left = minDivOffsetLeft + distanceX; //相对于浏览器的距离

            var maxPosition = this.getMaxPosition();

            if (left < 0) {
                left = 0;
            } else if (left > maxPosition.left-6) {
                left = maxPosition.left-6;
            }

            minDiv.style.left = left + "px";
            var rate = (left / (maxPosition.left-6)) * 100;
            if(rate>50){
                rate = rate - 50;
                bgc_l.style.width = "0%";
                bgc_r.style.width = rate+"%";
            }else if(rate<50){
                rate = 50 - rate;
                bgc_r.style.width = "0%";
                bgc_l.style.width = rate+"%";
            }else{
                rate = 0;
                bgc_l.style.width = "0%";
                bgc_r.style.width = "0%";
            }
        },
        getMaxPosition: function() {

            var left = $(this.settings.data.target).parent().width();
            return {
                left: left,
            };
        },

        handleResizeEvent: function() {
            var target = this;
            $(this.settings.data.target).off('mousedown').on('mousedown', function(e) {
                e.stopPropagation();
                var startXY = target.getPosition(e);
                var minDivOffsetLeft = $(target.settings.data.target)[0].offsetLeft;
                $(document).off("mousemove").on("mousemove", function(e) {
                    e.stopPropagation();
                    target.move(e,startXY,minDivOffsetLeft);
                    return false;
                });
                $(document).off("mouseup").on("mouseup", function(e) {
                    e.stopPropagation();
                    $(document).unbind('mousemove');
                    $(document).unbind('mouseup');
                    target.settings.data.callback&&target.settings.data.callback(target.settings.data);
                    return false;
                });
                return false;
            });

            $(this.settings.data.target).off('touchstart').on('touchstart', function(e) {

                e.stopPropagation();
                var startXY = target.getPosition(e);
                var minDivOffsetLeft = $(target.settings.data.target)[0].offsetLeft;
                $(document).off("touchmove").on("touchmove", function(e) {
                    e.stopPropagation();
                    target.move(e,startXY,minDivOffsetLeft);
                    return false;
                });


                $(document).off("touchend").on("touchend", function(e) {

                    e.stopPropagation();
                    $(document).unbind('touchmove');
                    $(document).unbind('touchend');
                    target.settings.data.callback&&target.settings.data.callback(target.settings.data);
                    return false;
                });

            });
        },

        getPosition:function(e) {
            // var left = node.offsetLeft; //获取元素相对于其父元素的left值var left
            // var top = node.offsetTop;
            // current = node.offsetParent; // 取得元素的offsetParent
            　 // 一直循环直到根元素　
            // while(current != null) {　　
            //     left += current.offsetLeft;　　
            //     top += current.offsetTop;　　
            //     current = current.offsetParent;　　
            // }
            return {
                "x": e.pageX != undefined ? e.pageX : e.originalEvent.targetTouches[0].pageX,
            };
        }
    }
}(jQuery))
$(".pvw-audio .a-track").sliderBalance();