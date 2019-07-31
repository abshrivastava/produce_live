/* cookie操作*/
var httpHostgetCookie = function(name, value, options) {
	if(typeof value != 'undefined') { // name and value given, set cookie
		options = options || {};
		if(value === null) {
			console.log('value is null');
			value = '';
			options.expires = -1;
		}
		var expires = '';
		if(options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
			var date;
			if(typeof options.expires == 'number') {
				date = new Date();
				date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
			} else {
				date = options.expires;
			}
			expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
		}
		var path = options.path ? '; path=' + options.path : '';
		var domain = options.domain ? '; domain=' + options.domain : '';
		var s = [cookie, expires, path, domain, secure].join('');
		var secure = options.secure ? '; secure' : '';
		var c = [name, '=', encodeURIComponent(value)].join('');
		var cookie = [c, expires, path, domain, secure].join('')
		document.cookie = cookie;
	} else { // only name given, get cookie
		var cookieValue = null;
		if(document.cookie && document.cookie != '') {
			var cookies = document.cookie.split(';');
			for(var i = 0; i < cookies.length; i++) {
				var cookie = jQuery.trim(cookies[i]);
				// Does this cookie string begin with the name we want?
				if(cookie.substring(0, name.length + 1) == (name + '=')) {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	}
};
/**
 * 获取浏览器语言类型
 * @return {string} 浏览器国家语言
 */
var getNavLanguage = function() {
		if(navigator.appName == "Netscape") {
			var navLanguage = navigator.language;
			return navLanguage.substr(0, 2);
		}
		return false;
	}
	/* 设置语言类型： 默认为英文*/
var i18nLanguage = "en";
/*设置一下网站支持的语言种类*/
var webLanguage = ['en', 'zh'];
var href = location.href;
/**
 * 执行页面i18n方法
 * @return
 */
var execI18n = function(i18nName) {
	/* 获取一下资源文件名*/
	//var newText = "";
	var optionEle = $("#i18n_pagename");
	if(optionEle.length < 1) {
		console.log("未找到页面名称元素，请在页面写入\n <meta id=\"i18n_pagename\" content=\"页面名(对应语言包的语言文件名)\">");
		return false;
	};
	var sourceName = optionEle.attr('content');
	sourceName = sourceName.split('-');
	/*首先获取用户浏览器设备之前选择过的语言类型*/
	if(httpHostgetCookie("userLanguage")) {
		i18nLanguage = httpHostgetCookie("userLanguage");
	} else {
		// 获取浏览器语言
		var navLanguage = getNavLanguage();
		if(navLanguage) {
			// 判断是否在网站支持语言数组里
			var charSize = $.inArray(navLanguage, webLanguage);
			if(charSize > -1) {
				i18nLanguage = navLanguage;
				// 存到缓存中
				httpHostgetCookie("userLanguage", navLanguage);
			};
		} else {
			console.log("not navigator");
			return false;
		}
	}
	/* 需要引入 i18n 文件*/
	if($.i18n == undefined) {
		console.log("请引入i18n js 文件")
		return false;
	};
	var i18n_cacheFlag = false;
	/* 这里需要进行i18n的翻译 */
	jQuery.i18n.properties({
		name: sourceName, //资源文件名称
		path: href.indexOf("producerpro/user")>-1?'../i18n/':"./i18n/", //资源文件路径	
		mode: 'map', //用Map的方式使用资源文件中的值
		language: i18nLanguage,
		cache: i18n_cacheFlag,
		callback: function() { //加载成功后设置显示内容
			//console.log("111--i18n_cacheFlag::"+i18n_cacheFlag);
			var insertEle = $(".i18n");
			insertEle.each(function() {
				// 根据i18n元素的 name 获取内容写入
				$(this).html($.i18n.prop($(this).attr('name')));
			});
			var insertInputEle = $(".i18n-input");
			insertInputEle.each(function() {
				var selectAttr = $(this).attr('selectattr');
				if(!selectAttr) {
					selectAttr = "value";
				};
				$(this).attr(selectAttr, $.i18n.prop($(this).attr('selectname')));
			});
//			i18n_cacheFlag = true; //使用缓存模式*/
			//-------------------
			/*if(i18nName) {
				if(typeof i18nName == "object") {
					newText = {};
					for(var i = 0; i < i18nName.length; i++) {
						var singleName = i18nName[i];
						newText[singleName] = $.i18n.prop(singleName);
					}
				} else {
					newText = $.i18n.prop(i18nName);
				}
			}
			i18n_cacheFlag = true; //使用缓存模式*/
			//-----------------    
		}
	});
	//return newText;
}
/*页面执行加载执行*/
$(function() {
	/*执行I18n翻译*/
	execI18n();

	/*将语言选择默认选中缓存中的值*/
	$("#switchLanguage option[value=" + i18nLanguage + "]").prop("selected", true);
	$("#changeLan li[data-id='"+i18nLanguage+"']").addClass("active");
	/* 选择语言 */
	$("#switchLanguage").on('change', function() {
		var language = $(this).children('option:selected').val()
		httpHostgetCookie("userLanguage", language, {
			expires: 30,
			//          path:'/'
		});
		location.reload();
	});
	$("#changeLan").on('click','li', function() {
		var language = $(this).attr("data-id");
		httpHostgetCookie("userLanguage", language, {
			expires: 30,
			//          path:'/'
		});
		location.reload();
	});
});

//加载翻译
function fn_loadProperties(i18nName) {
	var newText = "";
	var optionEle = $("#i18n_pagename");
	var sourceName = optionEle.attr('content');
	sourceName = sourceName.split('-');
	if(httpHostgetCookie("userLanguage")) {
		i18nLanguage = httpHostgetCookie("userLanguage");
	} else {
		var navLanguage = getNavLanguage();
		if(navLanguage) {
			var charSize = $.inArray(navLanguage, webLanguage);
			if(charSize > -1) {
				i18nLanguage = navLanguage;
				httpHostgetCookie("userLanguage", navLanguage);
			};
		} else {
			console.log("not navigator");
			return false;
		}
	}
	if($.i18n == undefined) {
		console.log("请引入i18n js 文件")
		return false;
	};
	
	//console.log("222222-----i18n_cacheFlag"+i18n_cacheFlag);
	jQuery.i18n.properties({
		name: sourceName, //资源文件名称
		path:href.indexOf("producerpro/user")>-1?'../i18n/':"./i18n/", //资源文件路径	
		mode: 'map', //用Map的方式使用资源文件中的值
		language: i18nLanguage,
		cache: i18n_cacheFlag, //资源文件缓存
		callback: function(text) { //加载成功后设置显示内容
			//console.log("222--i18n_cacheFlag::"+i18n_cacheFlag);
			//newText=$.i18n.prop(i18nName);
			if(typeof i18nName == "object") {
				newText = {};
				for(var i = 0; i < i18nName.length; i++) {
					var singleName = i18nName[i];
					newText[singleName] = $.i18n.prop(i18nName[i]);
				}
			} else {
				newText = $.i18n.prop(i18nName);
			}
//			i18n_cacheFlag = true; //使用缓存模式
		}
	});
	return newText;
}
//swicth language alertTips
function fn_switchLangAlertTip(englishTip, chineseTip) {
	var languageFlag = httpHostgetCookie("userLanguage") || i18nLanguage;
	if(languageFlag == "en") {
		if(typeof englishTip == "string") {
			oUtils.alertTips(englishTip);
		} else {
			//text, timestamp, callback
			var _text = englishTip.thisText;
			var timestamp = englishTip.timestamp;
			var callback = englishTip.callback;
			oUtils.alertTips(_text, timestamp, callback);
		}
	} else if(languageFlag == "zh-CN" || languageFlag == "zh") {
		if(typeof chineseTip == "string") {
			oUtils.alertTips(chineseTip);
		} else {
			var _text = chineseTip.thisText;
			var timestamp = chineseTip.timestamp;
			var callback = chineseTip.callback;
			oUtils.alertTips(_text, timestamp, callback);
		}
	}
}

//返回对应的文字 （参数是一个数组）
function fn_swicthLanguage(objArr) {
	var languageFlag = httpHostgetCookie("userLanguage") || i18nLanguage;
	if(languageFlag == "en") {
		return objArr[0];
	} else {
		return objArr[1];
	}
}

var getFirstLanguage = function() {
		if(httpHostgetCookie("userLanguage")) {
			i18nLanguage = httpHostgetCookie("userLanguage");
			return i18nLanguage;
		} else {
			// 获取浏览器语言
			var navLanguage = getNavLanguage();
			if(navLanguage) {
				// 判断是否在网站支持语言数组里
				var charSize = $.inArray(navLanguage, webLanguage);
				if(charSize > -1) {
					i18nLanguage = navLanguage;
					// 存到缓存中
					httpHostgetCookie("userLanguage", navLanguage);
					return i18nLanguage;
				};
			} else {
				console.log("not navigator");
				return false;
			}
		}
	}

//
function fn_switchLangCreateLabel(englishFn, chineseFn) {
	var languageFlag = httpHostgetCookie("userLanguage") || i18nLanguage;
	if(languageFlag == "en") {
		if($.isFunction(englishFn)) {
			englishFn();
		} else {
			englishFn;
		}
	} else if(languageFlag == "zh-CN" || languageFlag == "zh") {
		if($.isFunction(englishFn)) {
			chineseFn();
		} else {
			chineseFn;
		}
	}
}