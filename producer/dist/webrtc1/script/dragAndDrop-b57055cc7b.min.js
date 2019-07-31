/**
 * 按比例拖拽文字
 *
 * @author daniel
 * @since 2017-08-16
 */

(function($) {

	$.fn.DragAndDrop = function(options) {

		var data = {
			container: null,
			target: null,
			resize: true,
			drag: true,
			rate:1,
			scale:false,
			scaleClassName:null,
		}


		options = options ? options : {};

		data.container = options.container ? options.container : null;
		data.target = this;
		data.resize = options.resize==false? options.resize : true;
		data.drag = options.drag==false? options.drag : true;
		data.scale = options.scale? options.scale : false;
		data.scaleClassName = options.scaleClassName? options.scaleClassName : null;
		data.rate = options.rate? options.rate : null;
		data.callback = options.callback? options.callback: null;
		var DragAndDrop = $.DragAndDrop.newInstance();

		DragAndDrop.init(data);
	}


	$.DragAndDrop = {
		settings: {
			data: null,
			pointSize: 4, //圆点长宽为12px
			maxSize: null,
			min: { //缩放的最小宽高,真实宽高，没有缩放
				width: 14,
				height: 16
			},
			directions: { //各个方向对应的值
				leftUp: '.drag-leftUp',
				rightUp: '.drag-rightUp',
				leftDown: '.drag-leftDown',
				rightDown: '.drag-rightDown',
			}
		},
		newInstance: function() {
			return $.extend(true, {}, this);
		},

		init: function(data) {
			this.initDataEvent(data);
			this.addPointEvent();
			this.handleResizeEvent();
			this.handleTargetClick();
			this.handelTargetCancel();
		},

		initDataEvent: function(data) {
			
			this.settings.data = data;
			var targetObj = $(this.settings.data.target);
			if(!this.settings.data.rate){
				this.settings.data.rate = targetObj.height()/targetObj.width();
			}
			
			this.settings.targetWidth = targetObj.width();
			this.settings.height = targetObj.height();
			$(this.settings.data.target).addClass("DragAndDrop");
			if(this.settings.data.scale){
				$(this.settings.data.target).css("transform","scale(1)");
				if(this.settings.data.scaleClassName==null){
					alert("please add scaleClassName at options");
				}
				$(this.settings.data.target).find(this.settings.data.scaleClassName).css({
					"transform-origin":"0 0 0",
					"transform":"scale(1)",
				});
			}

			$($(this.settings.data.target).parent()).css({
				position: 'relative'
			});
		},

		handleTargetClick: function() {
			var drag = this;
			$(this.settings.data.target).off("mousedown").on("mousedown", function(e) {
				if(drag.settings.data.scaleClassName){
					var scaleRate = $("#preview .preTextarea").css("transform");
					if(scaleRate!="none"){
						scaleRate = scaleRate.substring(7,scaleRate.indexOf(","));
						drag.settings.targetWidth = drag.settings.data.target.width();
						drag.settings.height = drag.settings.data.target.height();
						drag.settings.rate = drag.settings.height/drag.settings.targetWidth;

					}
				}
				drag.preventBuddle(e);

				drag.singleSelect();

				drag.handleTargetMoveEvent(e);
				

			});

		},

		singleSelect: function() {

			//单选时 先清空选中效果
			this.hidden($(this.settings.data.target).parent());

			var point = $(this.settings.data.target).find(".point");

			$(this.settings.data.target).addClass("select");
			this.show(this.settings.data.target);

		},

		show: function(flag) {
			$(flag).find(".point").addClass("show");
			$(flag).find(".point").removeClass("hidden");
		},

		hidden: function(flag) {
			$(flag).find(".point").addClass("hidden");
			$(flag).find(".point").removeClass("show");
		},

		handelTargetCancel: function() {
			var drag = this;
			$(this.settings.data.target).parent().off("mousedown").on("mousedown", function() {
				if(drag.settings.data.scaleClassName){
					var scaleRate = $("#preview .preTextarea").css("transform");
					if(scaleRate!="none"){
						// scaleRate = scaleRate.substring(7,scaleRate.indexOf(","));
						// drag.settings.targetWidth = drag.settings.data.target.width()/scaleRate;
						// // drag.settings.height = drag.settings.data.target.height();
						// drag.settings.rate = drag.settings.height/drag.settings.data.target.width();
						drag.settings.targetWidth = drag.settings.data.target.width();
						drag.settings.height = drag.settings.data.target.height();

					}
				}
				var point = $(this).find(".point");

				$(this).find(".select").removeClass("select");

				drag.hidden($(this));


			});

			$(this.settings.data.target).parent().off("touchstart").on("touchstart", function() {

				var point = $(this).find(".point");

				$(this).find(".select").removeClass("select");

				drag.hidden($(this));

			});
		},

		addPointEvent: function() {
			$(this.settings.data.target).find('.point').remove(); //先清空之前设置的助托点，重新设置
        	// 左上角
			var rLeftUp = document.createElement('div');
			$(rLeftUp).addClass(this.settings.directions.leftUp.substring(1) + ' point hidden');
			$(this.settings.data.target).append($(rLeftUp));
			// 右上角
			var rRightUp = document.createElement('div');
			$(rRightUp).addClass(this.settings.directions.rightUp.substring(1) + ' point hidden');
			$(this.settings.data.target).append($(rRightUp));
			// 左下角
			var rLeftDown = document.createElement('div');
			$(rLeftDown).addClass(this.settings.directions.leftDown.substring(1) + ' point hidden');
			$(this.settings.data.target).append($(rLeftDown));
			// 右下角
			var rRightDown = document.createElement('div');
			$(rRightDown).addClass(this.settings.directions.rightDown.substring(1) + ' point hidden');
			$(this.settings.data.target).append($(rRightDown));


		},

		preventBuddle: function(e) { //阻止事件冒泡
			if (e.stopPropagation) {
				e.stopPropagation();
			} else {
				e.cancelBubble = true;
			}
		},

		handleTargetMoveEvent: function(e) {

			if (!this.settings.data.drag) {
				return;
			}

			var drag = this;

			var startXY = this.getXY(e);
			// var settings = this.settings;
			$(document).off("mousemove").on("mousemove", function(e) { //拖动时移动
				drag.preventBuddle(e);
				drag.resetPosition(e, startXY);
				return false;
			});

			$(document).off("mouseup").on("mouseup", function(e) {
				drag.preventBuddle(e);
				$(document).unbind('mousemove');
				$(document).unbind('mouseup');
				drag.settings.data.callback&&drag.settings.data.callback(drag.settings.data);
				return false;
			});
             return false;
		},

		getXY: function(e) {
			width = $(e.target).parent().width();
			height = $(e.target).parent().height();
			return {
				x: e.pageX != undefined ? e.pageX : e.originalEvent.targetTouches[0].pageX,
				y: e.pageY != undefined ? e.pageY : e.originalEvent.targetTouches[0].pageY,
				width:width,
				height:height
			};
		},

		resetPosition: function(e, startXY) {

			var xy = this.getXY(e);
			var distanceX = xy.x - startXY.x;
			var distanceY = xy.y - startXY.y;
			var left = $(this.settings.data.target)[0].offsetLeft + distanceX;
			var top = $(this.settings.data.target)[0].offsetTop + distanceY;

			var maxPosition = this.getMaxPosition();

			if (left < 0) {
				left = 0;
			} else if (left > maxPosition.left) {
				left = maxPosition.left;
			}

			if (top < 0) {
				top = 0;
			} else if (top > maxPosition.top) {
				top = maxPosition.top
			}

			$(this.settings.data.target).css({
				left: left,
				top: top
			});


			//更新后将当前xy设置为startXY
			$.extend(startXY, xy);

		},

		getMaxPosition: function() {

			var left = $(this.settings.data.target).parent().width() - $(this.settings.data.target).width();
			var top = $(this.settings.data.target).parent().height() - $(this.settings.data.target).height();

			return {
				left: left,
				top: top
			};
		},

		handleResizeEvent: function() {

			var drag = this;
			$(this.settings.data.target).find('.point').off('mousedown').on('mousedown', function(e) {
				if(drag.settings.data.scaleClassName){
					var scaleRate = $("#preview .preTextarea").css("transform");
					if(scaleRate!="none"){
						scaleRate = scaleRate.substring(7,scaleRate.indexOf(","));
						drag.settings.targetWidth = drag.settings.data.target.width()/scaleRate;
						
						drag.settings.height = drag.settings.data.target.height()/scaleRate;
						drag.settings.data.rate = drag.settings.height/drag.settings.targetWidth;
						// drag.settings.targetWidth = drag.settings.data.target.width();
						// drag.settings.height = drag.settings.data.target.height();
						// drag.settings.rate = drag.settings.height/drag.settings.targetWidth;
					}
				}
				drag.preventBuddle(e);
				var direction = $(this).attr('class').split('point', 1)[0].trim();
				var startXY = drag.getXY(e);
				
				$(document).off("mousemove").on("mousemove", function(e) {
					drag.preventBuddle(e);
					drag.handleResize(e, startXY, direction);
					return false;
				});
				$(document).off("mouseup").on("mouseup", function(e) {
					drag.preventBuddle(e);
					$(document).unbind('mousemove');
					$(document).unbind('mouseup');
					drag.settings.data.callback&&drag.settings.data.callback(drag.settings.data);
					return false;
				});
				return false;
			});

			$(this.settings.data.target).find('.point').off('touchstart').on('touchstart', function(e) {

				drag.preventBuddle(e);
				var direction = $(this).attr('class').split('point', 1)[0].trim();
				var startXY = drag.getXY(e);

				$(document).off("touchmove").on("touchmove", function(e) {
					drag.preventBuddle(e);
					drag.handleResize(e, startXY, direction);
					return false;
				});


				$(document).off("touchend").on("touchend", function(e) {
					drag.preventBuddle(e);
					$(document).unbind('touchmove');
					$(document).unbind('touchend');
					return false;
				});


			});
		},

		handleResize: function(e, startXY, direction) {

			if (!this.settings.data.resize) {
				return;
			}
			var xy = this.getXY(e);
			var directions = this.settings.directions;

			switch (direction) {
				case directions.leftUp.substring(1):
					this.handleResizeLeftUp(startXY, xy);
					break;
				case directions.rightUp.substring(1):
					this.handleResizeRightUp(startXY, xy);
					break;
				case directions.leftDown.substring(1):
					this.handleResizeLeftDown(startXY, xy);
					break;
				case directions.rightDown.substring(1):
					this.handleResizeRightDown(startXY, xy);
					break;
				default:
					toastr.error('发生错误，方向未知!');
					break;
			}

			$.extend(startXY, xy);

		},

		handleResizeLeftUp: function(startXY, xy) {

			var position = this.getTargetPosition();
			var maxSize = this.getMaxSize();

			var distanceX = xy.x - startXY.x;

			var xValue = distanceX;
			// var oldPosition = Object.assign(position);

			
			if(xValue>0){
				var height = position.height,top=position.top;
				position.left += xValue;
				position.width -= xValue;
				position.height = position.width*this.settings.data.rate;
				position.top = position.top - (position.height-height);
				if(position.width < this.settings.min.width||position.height < this.settings.min.height){
					position.left -= xValue;
					position.width += xValue;
					position.height = height;
					position.top = top;
				}
			}else{
				if (position.left > 0&& position.top > 0) {
					var height = position.height,top=position.top;
					position.left += xValue;
					position.width -= xValue;
					position.height = position.width*this.settings.data.rate;
					position.top = position.top - (position.height-height);
					if(position.left < 0 || position.top < 0){
						position.left -= xValue;
						position.width += xValue;
						position.height = height;
						position.top = top;
					}
				}

			}
			if(this.settings.data.scale){
				this.scaleDom(position);
			}
			this.handlePosition(position);
		},

		handleResizeRightUp: function(startXY, xy) {
			var position = this.getTargetPosition();
			var maxSize = this.getMaxSize();

			var xValue = xy.x - startXY.x;

			position.width += xValue;

			if(xValue>0){
				if (position.top > 0 && (position.left + position.width < maxSize.width)) {
					var height = position.height,top=position.top;
					position.height = position.width*this.settings.data.rate;
					position.top = position.top - (position.height-height);
					if(position.top < 0 || (position.left + position.width > maxSize.width)){
						position.height = height;
						position.top = top;
						position.width -= xValue;
					}
				}else{
					position.width -= xValue;
				}
			}else{
				if (position.width <= this.settings.min.width||position.height < this.settings.min.height) {
					position.width -= xValue; //前面加了 这里减去  保持不变
				}else{
					var height = position.height,top=position.top;
					position.height = position.width*this.settings.data.rate;
					position.top = position.top - (position.height-height);
					if(position.width < this.settings.min.width){
						position.height = height;
						position.top = top;
						position.width -= xValue;
					}
				}
			}
			if(this.settings.data.scale){
				this.scaleDom(position);
			}
			this.handlePosition(position);
		},

		handleResizeLeftDown: function(startXY, xy) {

			var position = this.getTargetPosition();
			var maxSize = this.getMaxSize();

			var yValue = xy.y - startXY.y;

			position.height += yValue;

			if(yValue<0){
				if (position.height <= this.settings.min.height||position.width <= this.settings.min.width) {
					position.height -= yValue; //前面加了 这里减去  保持不变
				}else{
					var width = position.width,left=position.left;
					position.width = position.height/this.settings.data.rate;
					position.left = position.left - (position.width-width);
					if(position.height < this.settings.min.height){
						position.height -= yValue;
						position.width = position.height/this.settings.data.rate;
						position.left = left;
					}
				}
			}else{
				if (position.left >0&&(position.height + position.top < maxSize.height)) {
					var width = position.width,left=position.left;
					position.width = position.height/this.settings.data.rate;
					position.left = position.left - (position.width-width);
					if(position.left <0 || (position.height + position.top > maxSize.height)){
						position.width = width;
						position.left = left;
						position.height -= yValue;
					}
				}else{
					position.height -= yValue;
				}
			}
			if(this.settings.data.scale){
				this.scaleDom(position);
			}
			this.handlePosition(position);
		},

		handleResizeRightDown: function(startXY, xy) {

			var position = this.getTargetPosition();
			var maxSize = this.getMaxSize();

			var xValue = xy.x - startXY.x;
			
			if(xValue>0){
				if ((position.width + position.left < maxSize.width) && (position.height + position.top < maxSize.height)) {
					var height = position.height;
					position.width += xValue;
					position.height = position.width*this.settings.data.rate;
					if((position.width + position.left > maxSize.width) || (position.height + position.top > maxSize.height)){
						position.width -= xValue;
						position.height = height;
					}
				}
			}else{	
					position.width += xValue;
					var height = position.height;
					position.height = position.width*this.settings.data.rate;
					if (position.width < this.settings.min.width||position.height <= this.settings.min.height) {
						position.width -= xValue;
						position.height = height;
					}
			}
			if(this.settings.data.scale){
				this.scaleDom(position);
			}
			this.handlePosition(position);
		},
		scaleDom(position){
			// console.log(position.width,this.settings.targetWidth);
			var rate = position.width/this.settings.targetWidth;
			$(this.settings.data.target).find(this.settings.data.scaleClassName).css("transform","scale("+rate+")");
		},
		getTargetPosition: function() { //获取控件位置大小
			var left = $(this.settings.data.target)[0].offsetLeft;
			var top = $(this.settings.data.target)[0].offsetTop;
			var width = $(this.settings.data.target).width();
			var height = $(this.settings.data.target).height();

			return {
				left: left,
				top: top,
				width: width,
				height: height
			}
		},
		
		handlePosition: function(position) {
			//目标元素位置大小的改变
			$(this.settings.data.target).css({
				width: position.width,
				height: position.height,
				top: position.top,
				left: position.left
			});

		},

		getMaxSize: function() {

			var height = $(this.settings.data.target).parent().height();
			var width = $(this.settings.data.target).parent().width();

			return {
				height: height,
				width: width
			}

		}

	}



}(jQuery))