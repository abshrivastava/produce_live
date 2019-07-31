/*Writer: Nancy*/
/*Date Time: 2015/12/22*/

/*Need jquery 1.9+*/

var $p = function(a, b) {
	var $=top.$;
	if (!b) {
		return ($(a, document).length > 0 || !parent) ? $(a, document) : (($(a, parent.document).length > 0 || !parent.parent) ? $(a, parent.document) : $(a, parent.parent.document));
	} else {
		return $.apply(this, arguments);
	}
}

String.prototype.startWith = function(str) {
	return (this.substring(0, str.length) == str);
}

var oUtils = function() {

	function _alertTips(text, timestamp, callback, defineBtnValue,cancelBtnValue,hideBtn) {
		var $body = top.$("body", top.document);
		var autoHideFlag = _isExist(timestamp) && typeof timestamp == "number";
		
		var textFlag=text.slice(0,4);
		if(textFlag=="i18n"){
			if($.isFunction(fn_loadProperties)){
				text=fn_loadProperties(text);
			}
		}
		createTipsEvent("alert", text, callback, autoHideFlag, defineBtnValue,cancelBtnValue,hideBtn);

		var $obj = $body.find(".alert_popupContent");
		if ($obj.siblings(".simulate_popupContent").length > 0) {
			$obj.css("z-index", "16000");
			$obj.prev(".alert_popupBg").css("z-index", "15500");
		} else {
			$obj.css("z-index", "16000");
			$obj.prev(".alert_popupBg").css("z-index", "15500");
		}
		if (autoHideFlag) {
			var timeout = null;
			function removeCustomTips() {
				if ($body.find(".alert_popupBg").css("display") != undefined) {
					if (typeof(callback) != "undefined" && $.isFunction(callback)) {
						callback();
					}
					$body.find(".alert_popupBg,.alert_popupContent").fadeOut(500, function() {
						$body.find(".alert_popupBg,.alert_popupContent").hide();
					});
				}
			};
			$(".alert_popupBg,.alert_popupContent").one("click",function(){
				if(timeout) clearTimeout(timeout);
				if ($body.find(".alert_popupBg").css("display") != undefined) {
					if (typeof(callback) != "undefined" && $.isFunction(callback)) {
						callback();
					}
					$body.find(".alert_popupBg,.alert_popupContent").fadeOut(100, function() {
						$body.find(".alert_popupBg,.alert_popupContent").hide();
					});
				}
			});
			timeout = setTimeout(removeCustomTips, timestamp);
		}
	}

	function _confirmTips(text, confirmFun, cancelFun,defineBtnValue,cancelBtnValue) {
		var textFlag=text.slice(0,4);
		if(textFlag=="i18n"){
			if($.isFunction(fn_loadProperties)){
				text=fn_loadProperties(text);
			}
		}
		createTipsEvent("confirm", text, confirmFun, cancelFun, defineBtnValue,cancelBtnValue);
	}

	function _promptTips(text, confirmFun, cancelFun, defineBtnValue,cancelBtnValue) {
		var textFlag=text.slice(0,4);
		if(textFlag=="i18n"){
			if($.isFunction(fn_loadProperties)){
				text=fn_loadProperties(text);
			}
		}
		createTipsEvent("prompt", text, confirmFun, cancelFun, defineBtnValue,cancelBtnValue);
	}

	function createTipsEvent(typeFlag, text, confirmFun, lastParam, _defineBtnValue,_cancelBtnValue,hideBtn) {
		//_dataType = typeof _dataType == "undefined"?"json":_dataType;
		var _determine=switchLangObj.i18n_determine;
		var _cancel=switchLangObj.i18n_cancel;
		var defineBtnValue=typeof _defineBtnValue=="undefined"?_determine:_defineBtnValue;
		var cancelBtnValue=typeof _cancelBtnValue=="undefined"?_cancel:_cancelBtnValue;
		var $body = top.$("body", top.document);
		if (!_isExist($body.children("." + typeFlag + "_popupContent"))) {
			var operateStr = "";
			switch (typeFlag) {
				case "alert":
					if (!lastParam) {
						operateStr = '<div class="simulate_popupBtnsContainer '+typeFlag+'_operateBtnsContainer">\
				    		<input type="button" value="'+defineBtnValue+'" class="simulate_popupBtns ' + typeFlag + '_sureBtn"/>\
				    	</div>';
					};
					break;
				case "confirm":
				case "prompt":
					operateStr = '<div class="simulate_popupBtnsContainer '+typeFlag+'_operateBtnsContainer">\
					    	<input type="button" value="'+defineBtnValue+'"  class="simulate_popupBtns ' + typeFlag + '_sureBtn"/>\
					    	<input type="button" value="'+cancelBtnValue+'"  class="simulate_popupBtns simulate_popupCancelBtn ' + typeFlag + '_cancelBtn"/>\
				    	</div>';
					break;
			};

			var _html = '<div class="simulate_popupFilterBg ' + typeFlag + '_popupBg"></div>\
					<div class="simulate_popupContent ' + typeFlag + '_popupContent">\
				    	<div class="simulate_popupTipsText ' + typeFlag + '_tipsText"></div>' +
				(typeFlag == "prompt" ? '<input type="text" class="prompt_inputTexts"/>' : '') + operateStr +
				'</div>';

			$body.prepend(_html);
		}else if(typeFlag == "alert"){
			var contentObj = $body.children("." + typeFlag + "_popupContent");
			var operateBtnObj = contentObj.children("." + typeFlag + "_operateBtnsContainer");
			if (!lastParam && operateBtnObj.length == 0) {
				operateStr = '<div class="simulate_popupBtnsContainer ' + typeFlag + '_operateBtnsContainer">\
		    		<input type="button" value="'+defineBtnValue+'" class="simulate_popupBtns ' + typeFlag + '_sureBtn"/>\
		    	</div>';
		    	contentObj.append(operateStr);
			}else if(lastParam){
				operateBtnObj.remove();
			}
		}
		if(hideBtn) {
			$body.find(".alert_operateBtnsContainer").hide();
		}else{
			$body.find(".alert_operateBtnsContainer").show();
		}
		var $Obj = $body.children("." + typeFlag + "_popupContent");
		var operateBtnsObj = $Obj.children("." + typeFlag + "_operateBtnsContainer");
		$Obj.children("." + typeFlag + "_tipsText").html(text);
		$Obj.animate({
			filter: "alpha(opacity=100)",
			opacity: "1",
			marginLeft: -($Obj.width() / 2),
			marginTop: -($Obj.height() / 2)
		}, 200);

		$Obj.show();
		$Obj.prev("." + typeFlag + "_popupBg").show();

		switch (typeFlag) {
			case "alert":
			case "confirm":
				operateBtnsObj.children("." + typeFlag + "_sureBtn").focus();
				break;
			case "prompt":
				$Obj.find(".prompt_inputTexts").focus();
				break;
		}
		operateBtnsObj.off("click", "." + typeFlag + "_sureBtn");
		operateBtnsObj.on("click", "." + typeFlag + "_sureBtn", function(e) {
			e.stopPropagation();
			switch (typeFlag) {
				case "alert":
				case "confirm":
					if (typeof(confirmFun) != "undefined" && $.isFunction(confirmFun)) {
						confirmFun();
					}
					closeTips($(this).parent().parent(".simulate_popupContent"));
					break;
				case "prompt":
					var _inputMsg = $.trim($Obj.find(".prompt_inputTexts").val());
					if (typeof(confirmFun) != "undefined" && $.isFunction(confirmFun)) {
						if (confirmFun(_inputMsg)) {
							closeTips($(this).parent().parent(".simulate_popupContent"));
						};
					}
					break;
			}
		});
		operateBtnsObj.off("click", "." + typeFlag + "_cancelBtn");
		operateBtnsObj.on("click", "." + typeFlag + "_cancelBtn", function(e) {
			e.stopPropagation();
			closeTips($(this).parent().parent(".simulate_popupContent"));
			if (typeof(lastParam) != "undefined" && $.isFunction(lastParam)) {
				lastParam();
			}
		});
	}

	function closeTips(obj) {
		$(obj).prev(".simulate_popupFilterBg").hide();
		$(obj).hide();
	}

	function _strSubstring(str, num,symbol) {
		if (typeof str == "string") {
			if (str.length > num) {
				symbol = symbol || "...";
				str = str.substring(0, num) + symbol;
			}
			return str;
		}
	}

	function _noDataTr(arr, length, className, tag1, tag2,symbol) {
		tag1 = (tag1 == null ? "tr" : tag1);
		tag2 = (tag2 == null ? "td" : tag2);
		symbol = symbol ||"";
		arr.push('<' + tag1 + ' class="' + className + '">');
		for (var i = 0; i < length; i++) {
			arr.push('<' + tag2 + '>'+symbol+'</' + tag2 + '>');
		}
		arr.push('</' + tag1 + '>');
		return arr;
	}

	function _getQueryString(name, str, symbol) {
		str = (str == null ? window.location.search.substr(1) : str);
		symbol = (symbol == null ? "&" : symbol);
		var reg = new RegExp("(^|" + symbol + ")" + name + "=([^" + symbol + "]*)(" + symbol + "|$)", "i");
		var r = str.match(reg);
		if (r != null) return unescape(r[2]);
		return null;
	}

	function _ajaxReq(_url, _para, successMethod, _async, _dataType,errorMethod,_type,times,thisObj,startLiveObject,type,sendData,version) {
		_para = _para == null?$(":input").serializeArray():_para;
		_async = _async == null?true:_async;
		_dataType = _dataType ==null?"json":_dataType;
		_type = _type==null?"post":_type;
		times = times==null?10000:times;
		$.ajax({
			type: _type,
			url: _url,
			data: _para,
			async: _async,
			dataType: _dataType,
			traditional: true,
			success: function(data) {
				if(typeof successMethod == "function"){
					successMethod(data,thisObj,startLiveObject,type,sendData,version);
				}
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				if (textStatus != "timeout") {
					console.error("error:" + textStatus);
				} else {
					console.error("error:" + textStatus);
				}
				if (XMLHttpRequest.status == 401) {
					window.location.reload();
					return;
				}
				if (XMLHttpRequest.status == 399) {
					var url = XMLHttpRequest.responseText;
//					url ="http://"+ window.location.host + url;
//					alert(url);
					window.location.href = url;
					return;
				}
				
				if(typeof errorMethod == "function") errorMethod();
			},
			timeout:times
		});
	}

	function _isExist(obj) {
		var result = (typeof obj == "number" || typeof obj == "boolean" || (obj&&(!obj.jquery||(obj.jquery&&obj.length>0))))? true : false;
		return result;
	}

	function _click2ChangeClass(obj, className) {
		if (obj.hasClass(className)) {
			obj.removeClass(className);
		} else {
			obj.addClass(className);
		}
	}

	function _isEmail(value) {
		var regTextEmail = /^[a-zA-Z0-9_\.\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$/;
		if (!regTextEmail.test(value)) {
			return false;
		} else
			return true;
	}

	function _formatDate(val) {
		val = parseInt(val);
		if (val < 10) {
			val = "0" + val;
		}
		return val;
	}

	function _roll(leftBtn, rightBtn, targetObj, tableNum, callBack) {
		leftBtn = typeof leftBtn != "object" ? $(leftBtn) : leftBtn;
		rightBtn = typeof rightBtn != "object" ? $(rightBtn) : rightBtn;
		targetObj = typeof targetObj != "object" ? $(targetObj) : targetObj;
		var totalNum = targetObj.children().length;

		function updateStatus(flag) {
			var curStartIdx = targetObj.children().index(targetObj.children(":visible").eq(0));
			var curEndIdx = curStartIdx + tableNum - 1;
			var showElmNum = targetObj.children(":visible").length;
			if (totalNum <= tableNum) {
				leftBtn.addClass("not-allowed");
				rightBtn.addClass("not-allowed");
			} else {
				if (curStartIdx == 0) {
					leftBtn.addClass("not-allowed");
				} else {
					leftBtn.removeClass("not-allowed");
				}

				if (curEndIdx == totalNum - 1) {
					rightBtn.addClass("not-allowed");
				} else {
					rightBtn.removeClass("not-allowed");
				}
			}
			if (!flag) $.isFunction(callBack) && callBack();
		}

		updateStatus("init");
		leftBtn.unbind("click");
		leftBtn.bind("click", function() {
			if (!$(this).hasClass("not-allowed")) {
				targetObj.children(":visible").eq(0).prev().show();
				updateStatus();
			}
		});
		rightBtn.unbind("click");
		rightBtn.bind("click", function() {
			if (!$(this).hasClass("not-allowed")) {
				targetObj.children(":visible").eq(0).hide();
				updateStatus();
			}
		});
	}

	function _timestamp2DateString(time,millisecond) {
		var result = {};
		var timestamp = typeof millisecond != "undefined"? (time + millisecond):time;
		var date = new Date(timestamp);
		var tempDate = [];
		tempDate.push(date.getFullYear());
		tempDate.push(oUtils.formatDate(date.getMonth() + 1));
		tempDate.push(oUtils.formatDate(date.getDate()));
		result.date = tempDate.join("-");
		var tempTime = [];
		tempTime.push(oUtils.formatDate(date.getHours()));
		tempTime.push(oUtils.formatDate(date.getMinutes()));
		tempTime.push(oUtils.formatDate(date.getSeconds()));
		result.time = tempTime.join(":");
		result.formatDate = result.date + " " + result.time;
		return result;
	}

	function _dateString2Timestamp(dateString) {
		//		console.log(dateString.replace(/-/g,"/"));
		return new Date(dateString.replace(/-/g, "/")).getTime();
	}

	function cloneArr(arr){
	  var r=[];
	  for(var i =0 ; i<arr.length;i++){
	   r[i]=_clone(arr[i]);
	  }
	  return r;
	}

	function _clone(o){
		if(typeof o!='object'||!o) return o;

		if(o.constructor==Array) return cloneArr(o);

		var r={};
		for(var p in o){
			if(typeof o[p] == "object"){
				r[p]=_clone(o[p]);
			}else{
				r[p]=o[p];
			}
		}
		return r;
 	}

 	function Storage(){
 		this.storgae = window.localStorage;
 	}
 	Storage.prototype = {
 		constructor:Storage,
 		/**
	     *  @description 添加缓存
	     *  @param 要求传入对象,储存时间/ms
	     */
 		add:function(data,expire){ 
 			var that = this;
 			if(!that.isObject(data)){
 				console.log("请以对象的格式传入参数");
 				return null;
 			}
 			var expireTime = expire?new Date(expire).getTime():0;
 			Object.keys(data).forEach(function(key){
 				var keyValue = expireTime>0?{value:data[key],expire:expireTime}:{value:data[key]};
	            keyValue = JSON.stringify(keyValue);
	            that.storgae.setItem(key,keyValue);
 			})
 		},
 		/**
	     * @description 删除缓存 
	     * @param 单个，直接传键名；多个，以数组的形式
	     */
 		delete:function(key){
 			var that = this;
 			if(that.isString(key)) {
	            if(that.isExist(key)) that.storgae.removeItem(key);
	            else console.log(key+"不存在！");
	        } else if (that.isArray(key)) {
	            key.forEach(function(k){
	                if(that.isExist(k)) that.storgae.removeItem(k);
	                else console.log(k+"不存在！");
	            })
	        } else {
	            console.log("数据格式错误！");
	        }
 		},
 		/**
	    * @description 编辑缓存
	    * @param 单个，直接传键名
	    */
 		edit:function(data){
 			var that = this;
 			if(!that.isObject(data)) return;
 			Object.keys(data).forEach(function(key){
 				if(!that.isExist(key)) {
	                console.log(key+"不存在！");
	                return null;
	            } 
	            that.storgae.setItem(key,JSON.stringify(data[key]));
 			})
 		},
 		/**
	     * @description 查询缓存
	     * @param 单个，直接传键名；多个，以数组的形式
	     * @returns 单个，直接返回查询结果；多个，返回查询结果对象
	     */
 		getItem:function(key){
 			var that = this;
	        if(that.isString(key)) {
	            if(that.isExist(key)){
	                return that.dealExpire(key);
	            }else{
	                console.log(key+"不存在！");
	                return null
	            }
	        } else if (that.isArray(key)) {
	            var result = {};
	            key.forEach(function(k) {
	                if(that.isExist(k)) result[k] = that.dealExpire(k);
	                else console.log(k+"不存在！")
	            })
	            return result;
	        } else {
	            console.log("数据格式错误！")
	        }
 		},
 		/**
	     * @description 根据失效时间处理数据，内部工具函数
	     * @param 键值
	     * @returns 失效返回null,可用返回数值
	     */
 		dealExpire:function(k){
 			var that = this;
 			var keyValue = that.storgae.getItem(k),
	             curTime = new Date().getTime();
	        try {
	            keyValue = JSON.parse(that.storgae.getItem(k))
	            if(keyValue.expire&&keyValue.expire<curTime){
	                that.delete(k);
	                console.log('缓存已过期');
	                return null
	             }else{
	                return keyValue.value
	            } 
	        } catch(err){
	            console.log(err);
	        }
 		},
 		isExist:function(key){return Object.keys(this.storgae).indexOf(key)>-1;},
		isObject:function(data){return Object.prototype.toString.call(data) === "[object Object]";},
		isArray:function(data){return Object.prototype.toString.call(data) === "[object Array]";},
		isString:function(data){return Object.prototype.toString.call(data) === "[object String]";}
 	}       
	var storage = new Storage();

	/**
     * @description 一键切换皮肤，通过两套css样式表来完成切换，动画可以通过回调函数自定义
     * @param 传入link标签，切换按钮，回调函数，缓存过期时间(以小时为单位)
     */
	function SwicthSkin(){
		this.item = null;
		this.selector = null;
		this.expire = null;
	}
	SwicthSkin.prototype = {
		constructor:SwicthSkin,
		init:function(data){
			this.item = data.item;
            this.selector = data.selector;
            this.expire = new Date().getTime() + data.expire*60*60*1000;
            this.bindEvents();
		},
		bindEvents(){
			var that = this,
                selectors = this.selector;
            for(var i=0;i<selectors.length;i++){
                selectors[i].item.addEventListener("click",function(){
                    var href = this.getAttribute("data-href");
                    if(that.item.getAttribute("href")===href) return; //当前样式不需要切换
                    that.item.setAttribute("href",href); //切换样式

                    if(selectors[i].callback) selectors[i].callback(); // 有回调函数执行回调函数
                    storage.add({skinHref:href},that.expire); //添加到缓存中
                })
            }
		}
	}
	var switchSkin = new SwicthSkin();

	/*webSocket的简易封装*/
	function Socket(data){
		//传参
		this.url = data.url||'',
		this.param = data.param||{},
		this.message = data.message||'',
		this.time = data.time || 2000,
		this.success = data.success||'',
		this.error = data.error||'',
		this.response = data.response||'',
		this.key = data.key||'';

		//内部变量
		this.closed = null;
		this.interval = null;
		this.responseObj = null;
		this.successObj =data.successObj||null;
		this.rInfo = null;
		this.sendMsgs = null;
		this.socket = null;	
	}
	Socket.prototype = {
		constructor:Socket,
		init:function(successObj){ //初始化
			var protocol = document.location.protocol === "https:"?"wss://":"ws://",
				pathname = document.location.pathname.slice(document.location.pathname.indexOf("/"),document.location.pathname.indexOf("/",document.location.pathname.indexOf("/")+1)+1),
				urlParam = '',
				that = this;
			that.closed = false;
			that.interval = {};
			that.responseObj = {};
			if(successObj!=undefined){
				for (var Key in successObj){
					that.successObj[Key] = successObj[Key];
			    }
			}else{
				that.successObj = {};
			}
			// that.successObj = {
			// 	'activeWs': function(data) { // This function used to update the pageControlCount value
			// 		console.log(data);
			// 	},
			// 	'instanceStatusChange':function(data) { // This function used to update the pageControlCount value
			// 		console.log(data);
			// 	}
			// };
			that.sendMsgs = {};
			that.rInfo = {};
			//拼接websocket地址
			for(var k in that.param){
				urlParam += k+'='+that.param[k]+'&';
			}
			urlParam = urlParam.slice(0,urlParam.length-1);
			if(urlParam) urlParam = '?'+urlParam;
			if(!that.url){
				console.log("请输入接口地址");
				return;
			}
			var socketUrl = protocol + document.location.host+pathname+that.url+urlParam;
			//创建连接
			that.socket = new WebSocket(socketUrl);
			//绑定事件
			that.socket.onopen = function(){
				that.send({
					message:that.message,
					time:that.time,
					key:that.key,
					resonse:that.response,
					success:that.success
				});
			};
			that.socket.onmessage = function(e){
				Object.keys(that.responseObj).forEach(function(key){
					var response = that.responseObj[key];
					response(e);
				});
				if(e.data!=='heartbeat'&&e.data){
					var data = JSON.parse(e.data);
					var key;
					if(data.categoryId&&data.operationType){
						var rkey = 'key'+ data['categoryId'] + data['operationType'];
						Object.keys(that.rInfo).forEach(function(v){
							if(that.rInfo[v]===rkey){
								key = v;
								return;
							}
						});
					}
					key = key?key:JSON.parse(e.data).module
					var success = that.successObj[key];
					if(success) success(JSON.parse(e.data));
				}
			};
			that.socket.onerror = function(e){
				if(typeof that.error === 'function') that.error(e);
			};
			that.socket.onclose = function(){
				if(!that.closed) that.reconnect();
			};
		},
		reconnect:function(){ //websocket断线重连，只要非前端主动断开的连接，都会重连
			var that = this,
				sendMsgs = this.sendMsgs;
			that.off();
			that.init();
			Object.keys(sendMsgs).forEach(function(v){
				that.send(sendMsgs[v]);
			})
			console.log("reconnect");
		},
		send:function(data){ //websocket发送信息
			var message = data.message||'',
				time = data.time || 1000,
				key = data.key || '',
				response = data.response||'',
				success = data.success||'';
			if(!message||!key||!this.interval) return;
			if(Object.keys(this.interval).indexOf(key)>-1){ //当前websocket连接中，key值唯一
				console.log("当前key值已存在！");
				return;
			}
			//构造信息，信息类型必须为字符串，带有module值
			var msg = typeof message === 'string'?JSON.parse(message):message,
				that = this;
			if(msg['categoryId']&&msg['operationType']){
				var rkey = 'key'+ msg['categoryId'] + msg['operationType'];
				that.rInfo[key] = rkey;
			}else{
				if(!msg['module']) msg['module'] = key;
			}
			msg = JSON.stringify(msg);
			that.sendMsgs[key] = data;
			//发送信息
			that.interval[key] = setInterval(function(){
				if(that.socket&&that.socket.readyState===1) that.socket.send(JSON.stringify(that.sendMsgs[key].message));
			},time);
			//将相关值储存在当前对象中
			if(typeof response === "function") that.responseObj[key] = response;
			if(typeof success === "function") that.successObj[key] = success;	
		},
		has:function(key){ //查找当前连接中是否有所传key的信息
			return this.interval&&Object.keys(this.interval).indexOf(key)>-1;
		},
		stop:function(key){ //从当前连接中，删除指定的信息传递
			var that = this;
			if(Object.prototype.toString.call(key) === "[object Array]"){
				key.forEach(function(key){
					that.stop(key);
				}) 
			}else if(typeof key === 'string'){
				if(Object.keys(that.interval).indexOf(key)>-1){
					clearInterval(that.interval[key]);
					delete that.interval[key];
					delete that.responseObj[key];
					delete that.successObj[key];
					delete that.sendMsgs[key];
					if(that.rInfo[key]) delete that.rInfo[key];
				}
			}else{
				console.log("数据格式错误");
			}		 
		},
		off:function(){ //关闭连接，重置数据，清除所有定时器
			var that = this;
			that.closed = true;
			if(that.interval){
				Object.keys(that.interval).forEach(function(k){
					clearInterval(that.interval[k]);
				})
				that.interval = null;
				that.responseObj = null;
				that.successObj = null;
				that.rInfo = null;
				that.sendMsgs = null;
			}
			if(that.socket){
				that.socket.close();
				that.socket = null;
			} 
		}
	}

	function createSocket(data){
		var socket = new Socket(data);
		socket.init(data.successObj);
		return socket;
	}
	
	function _getPageUserRole(key,usrRole){
		if(userRolePerm[key]!="1"&&usrRole!="1"&&usrRole!="2"){
			$("#oUtils_noAuthorityBg").removeClass("hide");
			$(document.body).css({
				"overflow-x": "hidden",
				"overflow-y": "hidden"
			});
		}
		
	}
	
	return {
		alertTips:_alertTips,
		confirmTips:_confirmTips,
		promptTips:_promptTips,
		strSubstring:_strSubstring,
		noDataTr:_noDataTr,
		getQueryString: _getQueryString,
		ajaxReq: _ajaxReq,
		isExist: _isExist,
		click2ChangeClass:_click2ChangeClass,
		isEmail: _isEmail,
		formatDate: _formatDate,
		roll: _roll,
		timestamp2DateString:_timestamp2DateString,
		dateString2Timestamp:_dateString2Timestamp,
		clone:_clone,
		storage: storage,
		swicthSkin: switchSkin,
		socket:createSocket,
		getPageUserRole:_getPageUserRole
	}
}();