/*
 * The statement start:
	$.fn.draggable; // 	drag the element.
	$.fn.createSimulateSelect // create a simulate select component.
	$.fn.updateSimulateSelect //updata the list of simulate select.
	$.fn.setSimulateSelect //assign to the simulate select.
	$.fn.createSearchElm // create a search component.
	$.fn.bindSearchEvent // Bind the search event to the element;
	$.fn.createSelectedOptionList // create the select items component.
	$.fn.setSelectedOptionList // assign to the value of select items
	Above all,you can use them like this:$("selector").functionName(arguments);
	The functionName,such as: draggable,createSimulateSelect,updateSimulateSelect,setSimulateSelect,createSearchElm,etc.
	The arguments:refer to the defined place is each method.
* The statement end
*/
(function() {
	//var switchLangObj=fn_loadProperties(["i18n_all"]);
	document.addEventListener("click", function(e) {
		var e = e ? e : window.event;
		var tar = e.srcElement || e.target;
		var tarObj = $(tar).parent();
		if (!tarObj.hasClass("dropdownContainer") &&  !tarObj.hasClass("dropdownDefault")&&!tarObj.hasClass("dropdownArrow") && !tarObj.hasClass("checkbox") && !tarObj.hasClass("dropdown_option")) {
			$(".dropdown_menu").hide();
			$("#secondBookBox").hide();
			$("#threeBookBox").hide();
			$("#fourBookBox").hide();
			$(".pageList").hide();
		}
	}, true);
	
	Array.name = "Array";
	Array.prototype.intersect = function(arr, getCompareKey) {
		getCompareKey = getCompareKey || function(d) {return d;};
		var result = [];
		var rKey = {};
		var rFlag = {};
		if (arr.constructor.name != "Array") {
			arr = [arr];
		}
		for (var i = 0; i < arr.length; i++) {
			rKey[getCompareKey(arr[i])] = true;
		}
		
		for (var i = 0; i < this.length; i++) {
			var key = getCompareKey(this[i]);
			if (rKey[key]) {
				result.push(this[i]);
			}
		}
		return result;
	};
	
	function fn_commonAlertTips(tips){
		if(oUtils && oUtils.alertTips){
			oUtils.alertTips(tips)
		}else{
			alert(tips);
		}
	}
	
	function fnNiceScroll(_color, _cursorwidth, _cursorborderradius) {
		var objArr = this;
		$.each(objArr, function(idx,obj) {  
			obj = $(obj);
			_color = _color || "#e9e9e9";
			_cursorwidth = _cursorwidth || "5px";
			_cursorborderradius = _cursorborderradius || "5px";
		
			$.fn.niceScroll && obj.niceScroll({
				cursorcolor: _color,
				cursoropacitymax: 1,
				touchbehavior: false,
				cursorwidth: _cursorwidth,
				cursorborder: "0",
				cursorborderradius: _cursorborderradius
			});
		});
	}

	function draggable(positionParam, target) {
		var objArr = this;
		$.each(objArr, function(idx,source) {  
			source = $(source);
			source.css({
				"cursor": "move"
			});
			positionParam = positionParam || {};
			positionParam.top = positionParam.top || 0, positionParam.bottom = positionParam.bottom || 0, positionParam.left = positionParam.left || 0, positionParam.right = positionParam.right || 0, positionParam.direction = positionParam.direction || "auto";
			target = target || source;
			target = typeof target == "object" ? target : $(target);
			var _documentHeight = parseInt($(window).height()),
				_documentWidth = parseInt($(window).width()),
				targetWidth = target.width(),
				targetHeight = target.height(),
				minTop = positionParam.top,
				minLeft = positionParam.left,
				maxTop = _documentHeight - targetHeight - positionParam.bottom,
				maxLeft = _documentWidth - targetWidth - positionParam.right;
			var old_position = target.css("position");
			source.mousedown(function(e) {
				if (e.target && e.target.tagName && e.target.tagName.toLowerCase() == 'input') {
					return;
				}
				target.css("margin", target.css("margin"));
				var maL = target.css("margin-left") ? target.css("margin-left").replace("px", '') * 1 : 0,
					maT = target.css("margin-top") ? target.css("margin-top").replace("px", '') * 1 : 0,
					_left = target.offset().left,
					_top = target.offset().top;
				if (old_position != "absolute" && old_position != "fixed") {
					target.css({
						"position": "absolute",
					});
				}
				var x = e.pageX - _left + maL,
					y = e.pageY - _top + maT;
				$(document).mouseup(function() {
					$(this).unbind("mousemove");
				});
				$(document).bind("mousemove", function(ev) {
					var _x = ev.pageX - x,
						_y = ev.pageY - y;
					if (ev.which == 0) {
						$(this).unbind("mousemove");
						return;
					}
					if (_x + maL <= minLeft) {
						_x = minLeft - maL;
					} else if (_x + maL >= maxLeft) {
						_x = maxLeft - maL;
					}
	
					if (_y + maT <= minTop) {
						_y = minTop - maT;
					} else if (_y + maT >= maxTop) {
						_y = maxTop - maT;
					}
	
					if (positionParam.direction == "x") {
						target.css({
							'left': _x
						});
					} else if (positionParam.direction == "y") {
						target.css({
							'top': _y
						});
					} else {
						target.css({
							'left': _x,
							'top': _y
						});
					}
				});
			});
		});
	}

	function isExist(obj) {
		var result = (typeof obj == "number" || typeof obj == "boolean" || (obj&&(!obj.jquery||(obj.jquery&&obj.length>0))))? true : false;
		return result;
	}

	function updateListHtml(thisObj, listArr, key1, key2, params,actionType,arrayList,parentIdList,allDifferentSet) {
		var result = [];
		function createListHtml(data, _className,key2,arrayList,parentIdList) {
			var item_classArr = [];
			var item_icon_classArr = [];
			var classKey="";
			if(listArr.className){
				item_icon_classArr = listArr.className;
				classKey = listArr.classNameKey;
			}
			var item_classKey="";
			if(data.className){
				item_classArr = data.className;
				item_classKey = data.classNameKey;
			}
			data = data.children || data;
			data = typeof data !="object" && data?$.parseJSON(data):data;
			if(data.length>0){
				key1 = key1 || "val";
				key2 = key2 || "text";
				$.each(data, function(i,list) {
					var _val = list[key1] || list;
					var _name = list[key2] || _val;
					if(typeof _val=="object") _val=_name;
					var currItemClassName = item_classKey?item_classArr[list[item_classKey].split(",")[0]]:item_classArr[i];
					currItemClassName = currItemClassName || "";
					var currIconClassName = classKey?item_icon_classArr[list[classKey]]:item_icon_classArr[i];
					var curClassName = currItemClassName || currIconClassName
					var item_icon_str = curClassName ? '<span class="dropdown_option_item_icon '+curClassName+'"></span>':'';
					var paramStr = "";
					if (isExist(params)) {
						var paramObj = {};
						$.each(params, function(idx, param) {
							paramObj[param] = list[param];
						});
						paramStr = ' data-param = ' + JSON.stringify(paramObj) + '';
					}
					if(i == 0 && actionType =="update" &&(_className=="sort" || _className=="radio")){
						result.push('<li class="dropdown_option ' + _className + ' active">'+ item_icon_str+'<a href="javascript:;"' + paramStr + ' data-value="' + _val + '" class="ellipsis dropdown_option_item" title="' + _name + '">'+ _name + '</a></li>');
					}else{
						if(key2=="bookmarkName"){
							if(arrayList[i]=="0"){
								result.push('<li class="dropdown_option ' + _className + '" data-number="'+arrayList[i]+'" data-parentId="'+parentIdList[i]+'">'+ item_icon_str+'<a href="javascript:;"' + paramStr + ' data-value="'+ _val + '" class="ellipsis dropdown_option_item" title="' + _name + '">'+ _name + '</a></li>');
							}else{
								result.push('<li class="dropdown_option ' + _className + '" data-number="'+arrayList[i]+'" data-parentId="'+parentIdList[i]+'">'+ item_icon_str+'<a href="javascript:;"' + paramStr + ' data-value="'+ _val + '" class="ellipsis dropdown_option_item" title="' + _name + '">'+ _name + '</a><i class="iconfont icon-right"></i></li>');
							}

						}else{
							result.push('<li class="dropdown_option ' + _className + '">'+ item_icon_str+'<a href="javascript:;"' + paramStr + ' data-value="' + _val + '" class="ellipsis dropdown_option_item" title="' + _name + '">'+ _name + '</a></li>');
						}
					}
				});
			}
		}
		
		if (!listArr.radio && !listArr.checkbox) {
			if(listArr.sorts){
				createListHtml(listArr.sorts, "sort");
			}else{
				createListHtml(listArr, "sort",key2);
			}
		} else {
			if (listArr.radio) {
				createListHtml(listArr.radio, "radio",key2,arrayList,parentIdList);
			}

			if (listArr.checkbox) {
				createListHtml(listArr.checkbox, "checkbox",key2,arrayList,parentIdList);
			}
		}
		if (!listArr.radio && listArr.checkbox && listArr.checkbox.selectAll==true) {
			var item_icon_str = "";
			if(listArr.className){
				item_icon_str = '<span class="dropdown_option_item_icon"></span>';
			}
			var _str = '<li class="dropdown_option checkbox"><a href="javascript:;" class="ellipsis dropdown_option_item" title="'+switchLangObj.i18n_all+'" data-value="all">'+item_icon_str+''+switchLangObj.i18n_all+'</a></li>';
			var str_unclassified = '<li class="dropdown_option checkbox"><a href="javascript:;" class="ellipsis dropdown_option_item" title="'+switchLangObj.i18n_unclassified+'" data-value="Unclassified">'+item_icon_str+''+switchLangObj.i18n_unclassified+'</a></li>';
			var str_token = '<li class="dropdown_option checkbox"><a href="javascript:;" class="ellipsis dropdown_option_item" title="'+switchLangObj.i18n_token+'" data-value="Token">'+item_icon_str+''+switchLangObj.i18n_token+'</a></li>';
			if(allDifferentSet){
				var isAddUnclassBookmark = allDifferentSet.addUnclassBookmark;
				var isAddTokenBookmark = allDifferentSet.addTokenBookmark;
			}
			result.splice(0,0,_str);
			if(isAddUnclassBookmark){
				result.push(str_unclassified);
			}
			if(isAddTokenBookmark){
				result.push(str_token);
			}
			thisObj.children(".dropdown_menu").attr("data-selectAll","true");
		}
		if(listArr.checkbox && listArr.checkbox.max){
			thisObj.children(".dropdown_menu").attr("data-maxselected",listArr.checkbox.max);
		}
		thisObj.children(".dropdown_menu").html(result.join(""));
	}

	function updateSimulateSelect(listArr, key1, key2, params) {
		var objArr = this;
		$.each(objArr, function(idx,thisObj) {  
			thisObj = $(thisObj);
			updateListHtml(thisObj, listArr, key1, key2, params,"update");
		});
	}
	

	/*
	 * \[ ... \],the content of this is not necessary
	 	listArr like: {checkbox:{parent:"Status",selectAll:false,children:[{val:"0",text:"Offline",name:"my"}]\[,className:rStatusIconClass,classNameKey:"val"}};
	 	You can use it like the following:
	 	$(selector).createSimulateSelect(listArr,selectCallback,"val","text",["name"]\[,true,inputCallback\]);
	*/
	function createSimulateSelect(listArr,selectCallback, key1, key2,params,inputable,inputCallback,arrayList,parentIdList,allDifferentSet) {
		var allDifferentSet=allDifferentSet?allDifferentSet:{};
		var noCommonFn=allDifferentSet.noCommonFn;
		//console.log(allDifferentSet.noCommonFn);
		var callback=allDifferentSet.callback;
		var objArr = this;
		$.each(objArr, function(idx,thisObj) {  
			thisObj = $(thisObj);
			if (!thisObj.hasClass("dropdownContainer")) {
				thisObj.addClass("dropdownContainer");
			}
			var defaultObj = null;
			var dropdownDefault_str = isExist(inputable) ? '<input type="text" class="ellipsis dropdownDefault_value"/>' : '<span class="ellipsis dropdownDefault_value"></span>';
			if (!(isExist(thisObj.children(".dropdownDefault")) && isExist(thisObj.children(".dropdown_menu")))) {
				var dropdownHtml = '<div class="dropdownDefault">' + dropdownDefault_str + '</div>\
		                <span class="downArrow arrow dropdownArrow"></span>\
		                <ul class="dropdown_menu"></ul>';
				thisObj.html(dropdownHtml);
			}else{
				defaultObj = thisObj.find(".dropdownDefault");
				defaultObj.html(dropdownDefault_str);
			}
			defaultObj = thisObj.find(".dropdownDefault").children();
			$.fn.fnNiceScroll && thisObj.children(".dropdown_menu").fnNiceScroll();
			var dropdownArrowObj = thisObj.children(".dropdownArrow");
			if (!isExist(listArr)) {
				thisObj.attr("data-value", "");
				defaultObj.attr({
					"title": "",
					"data-param": "{}"
				});
				isExist(inputable) ? defaultObj.val(""):defaultObj.html("");
				thisObj.children(".dropdown_menu").html("").css("border-bottom-width", "0px");
				defaultObj.parent().addClass("not-allowed");
				dropdownArrowObj.addClass("not-allowed");
			} else {
				defaultObj.parent().removeClass("not-allowed");
				dropdownArrowObj.removeClass("not-allowed");
				thisObj.children(".dropdown_menu").css("border-bottom-width", "1px");
				//生成下拉列表
				updateListHtml(thisObj, listArr, key1, key2, params,"",arrayList,parentIdList,allDifferentSet);
		
				if (listArr.checkbox) {
					var _text = "";
					if (listArr.checkbox.parent) {
						_text = listArr.checkbox.parent + "";
					}
					defaultObj.attr("title",_text);
					isExist(inputable) ? defaultObj.val(_text):defaultObj.html(_text);
				} else {
					var firstLi = thisObj.children(".dropdown_menu").children(".dropdown_option").not(".hide").eq(0).children(".dropdown_option_item");
					var _text = firstLi.html();
					firstLi.parent(".dropdown_option").addClass("active");
					defaultObj.attr("title", _text);
					isExist(inputable)?defaultObj.val(_text):defaultObj.html(_text);
					isExist(firstLi.attr("data-param")) && defaultObj.attr("data-param", firstLi.attr("data-param"));
					thisObj.attr("data-value", firstLi.attr("data-value"));
				}
			}
		//	console.log(noCommonFn);
			if(!noCommonFn){
			thisObj.off("click", ".dropdownDefault,.downArrow");
			thisObj.on("click", ".dropdownDefault,.downArrow", function() {
				if($(this).hasClass("not-allowed")){
					return;
				}else if($(this).parents(".disabled").length>0){
					return;
				}else{
					$(this).selectDropDown();
				}
			});
			var dropdown_menu = thisObj.children(".dropdown_menu");
			dropdown_menu.off("click", ".dropdown_option");
			dropdown_menu.on("click", ".dropdown_option", function() {
				//console.log("option 点击0-----------------");
				if(allDifferentSet.preventMulti){
					//console.log("----前面---");
					if(!geo_ActiveFlag)return;
					geo_ActiveFlag=false;
					//console.log("----后面0----");
				}
				var defaultObj = $(this).parent().siblings(".dropdownDefault").children();
				var liObj = $(this);
				var thisItemObj = liObj.children(".dropdown_option_item");
				if (!liObj.hasClass("checkbox")) {
					liObj.addClass("active");
					liObj.siblings(".dropdown_option").not(".dropdown_option.checkbox").removeClass("active");
					if($(".mainContainerPaddingTop #extSource_paging ul").css("display")=="block"){
						
					}else{
						if(liObj.parent().parent().attr("id") != "shareTo"){
							liObj.parent().hide();
						}
					}
					thisObj.attr("data-value", thisItemObj.attr("data-value"));
					if(liObj.siblings(".dropdown_option.checkbox").length==0){
						var _text = thisItemObj.html();
						defaultObj.attr("title", _text);
						isExist(inputable)?defaultObj.val(_text):defaultObj.html(_text);
						isExist(thisItemObj.attr("data-param")) && defaultObj.attr("data-param", thisItemObj.attr("data-param"));
					}
				} else {
					var maxSelectedNum = dropdown_menu.attr("data-maxselected");
					var oAllCheckbox = dropdown_menu.children(".dropdown_option.checkbox");
					var selectedCheckboxNum = dropdown_menu.children(".dropdown_option.checkbox.active").length;
					var curItemIdx = dropdown_menu.children(".dropdown_option.checkbox").index($(this));
					if (liObj.hasClass("active")) {
						if(maxSelectedNum && selectedCheckboxNum <= maxSelectedNum){
							oAllCheckbox.not(".active").children(".dropdown_option_item").removeClass("disabled");
						}
						liObj.removeClass("active");
					} else {
						if(maxSelectedNum && selectedCheckboxNum == maxSelectedNum){
							oAllCheckbox.not(".active").children(".dropdown_option_item").addClass("disabled");
							fn_commonAlertTips("The selected counts cannot exceed "+maxSelectedNum+".");
							return;
						}
						if(dropdown_menu.attr("data-selectAll") == "true" && curItemIdx==0 && (oAllCheckbox.length-1>maxSelectedNum)){
							fn_commonAlertTips("The selected counts cannot exceed "+maxSelectedNum+".");
							return;
						}
						liObj.addClass("active");
					}
					
					if(dropdown_menu.children(".dropdown_option.radio").length==0 || dropdown_menu.children(".dropdown_option.sort").length==0){
						var menuObj = dropdown_menu;
						var firsCheckboxtLi = menuObj.children(".dropdown_option.checkbox").eq(0);
						if(menuObj.attr("data-selectAll") == "true"){
							var _idx = thisObj.find(".dropdown_menu .dropdown_option").index(liObj);
							var allCheckboxLi = menuObj.children(".dropdown_option.checkbox");
							if(_idx==0){
								if(firsCheckboxtLi.hasClass("active")){
									allCheckboxLi.addClass("active");
								}else{
									allCheckboxLi.removeClass("active");
								}
							}else{
								var selectedLiObj = menuObj.children(".dropdown_option.checkbox.active");
								var num = allCheckboxLi.length;
								if(!firsCheckboxtLi.hasClass("active")){
									num--;
								}
								if(num == selectedLiObj.length){
									var id = liObj.parent().parent().attr("id");
									firsCheckboxtLi.addClass("active");
								}else{
									firsCheckboxtLi.removeClass("active");
								}
							}
						}
						var selectedLi = menuObj.children(".dropdown_option.checkbox.active");
						var _val = isExist(inputable)?defaultObj.val().split("(")[0]:defaultObj.html().split("(")[0];
						_val = $.trim(_val);
						var selectedNum = selectedLi.length;
						if(listArr.checkbox.selectAll==true && firsCheckboxtLi.hasClass("active")){
							selectedNum--;
						}
						if(selectedNum>0){
							_val +=" ("+selectedNum+")"; 
						} 
						isExist(inputable)?defaultObj.val(_val):defaultObj.html(_val);
					}
					selectedCheckboxNum = dropdown_menu.children(".dropdown_option.checkbox.active").length;
					if(selectedCheckboxNum == maxSelectedNum){
						oAllCheckbox.not(".active").children(".dropdown_option_item").addClass("disabled");
					}
				}
				if(typeof selectCallback == "function"){
					selectCallback(liObj);
				}
			});
			defaultObj.off("keyup");
			defaultObj.on("keyup", function() {
				if (typeof inputCallback == "function") {
					inputCallback();
				}
			});
		}else{
			callback&&callback();
		}
		});
		//---
	}

	/*
	 * 
	 	data like: "all" or ["1","2"],the value of data-value property in one or some of the option lists.;
	 	You can use it like as followings:
	 	$(selector).setSimulateSelect(data);
	
	* */
	function setSimulateSelect(data) {
		var objArr = this;
		data = data== null?data :(data.constructor.name != "Array" ?[data]: data);
		$.each(objArr, function(idx,thisObj) {  
			thisObj = $(thisObj);
			var defaultObj = thisObj.children(".dropdownDefault").children();
			var inputable = false;
			if(defaultObj[0].tagName.toLowerCase()=="input"){
				inputable = true;
			}
			var dropdownArrowObj = thisObj.children(".dropdownArrow");
			if (data== null) {
				thisObj.attr("data-value", "");
				defaultObj.attr({
					"title": "",
					"data-param": "{}"
				});
				inputable?defaultObj.val(""):defaultObj.html("");
				thisObj.children(".dropdown_menu").css("border-bottom-width", "0px");
				defaultObj.parent().addClass("not-allowed");
				dropdownArrowObj.addClass("not-allowed");
				return;
			} else{
				defaultObj.parent().removeClass("not-allowed");
				dropdownArrowObj.removeClass("not-allowed");
				var list = thisObj.find(".dropdown_menu .dropdown_option");
				var oMenu = thisObj.children(".dropdown_menu");
				var maxSelectedNum = oMenu.attr("data-maxselected");
				var selectAll = oMenu.attr("data-selectAll");
				var nAllCheckboxNum = oMenu.children(".dropdown_option.checkbox").length-1;
				$.each(data, function(i,_data){
					$.each(list, function(j, elm) {
						var thisLiObj = $(elm);
						var thisElm = thisLiObj.children(".dropdown_option_item");
						var _val = thisElm.attr("data-value");
						var _text = thisElm.html();
						var _idx = 0;
						if(_val == _data){
							_idx = j;
							var nSelectedCheckboxNum = oMenu.children(".dropdown_option.checkbox.active").length;
							if(maxSelectedNum && ( ( selectAll == "true" && _idx==0 && nAllCheckboxNum > maxSelectedNum) || nSelectedCheckboxNum >= maxSelectedNum )){
								fn_commonAlertTips("The selected counts cannot exceed "+maxSelectedNum+".");
								if(nSelectedCheckboxNum >= maxSelectedNum){
									oMenu.children(".dropdown_option.checkbox").not(".active").children(".dropdown_option_item").addClass("disabled");
								}
								return;
							}
							thisLiObj.addClass("active");
							if(thisObj.find(".dropdown_option.radio").length != 0 || thisObj.find(".dropdown_option.checkbox").length == 0){
								thisLiObj.siblings(".dropdown_option").removeClass("active");
								thisObj.attr("data-value", _val);
								defaultObj.attr("title", _text);
								inputable?defaultObj.val(_text):defaultObj.html(_text);
								if (isExist(thisElm.attr("data-param"))) {
									var _param = thisElm.attr("data-param");
									defaultObj.attr("data-param", _param);
								}
								return false;
							}else{
								var menuObj = thisObj.children(".dropdown_menu");
								var firsCheckboxtLi = menuObj.children(".dropdown_option.checkbox").eq(0);
								if(menuObj.attr("data-selectAll") == "true"){
									var allCheckboxLi = menuObj.children(".dropdown_option.checkbox");
									if(_idx==0){
										allCheckboxLi.addClass("active");
									}else{
										var selectedLiObj = menuObj.children(".dropdown_option.checkbox.active");
										if(allCheckboxLi.length-1 == selectedLiObj.length){
											firsCheckboxtLi.addClass("active");
										}else{
											firsCheckboxtLi.removeClass("active");
										}
									}
								}
								
								var _val = inputable?defaultObj.val().split("(")[0]:defaultObj.html().split("(")[0];
								_val = $.trim(_val);
								var selectedLi = menuObj.children(".dropdown_option.checkbox");
								var selectedNum = selectedLi.length;
								var allFlag = false;
								if(menuObj.attr("data-selectAll") == 'true' && firsCheckboxtLi.hasClass("active")){
									selectedNum--;
									allFlag = true;
								}
								
								if(selectedNum>0){
									if(objArr.attr("id") == "sort_rStatus"){
										var isLastSelect = objArr.find("li").last().hasClass("active");
										if(!isLastSelect) selectedNum--;
									}
									_val +=" ("+selectedNum+")"; 
								} 
								inputable?defaultObj.val(_val):defaultObj.html(_val);
								if (isExist(thisElm.attr("data-param"))) {
									var _param = thisElm.attr("data-param");
									defaultObj.attr("data-param", _param);
								}
								if(allFlag){
									return false;
								}
							}
							
						}
			
					});
				});
			}
		});
	}

	function selectDropDown() {
		$(".dropdown-menu,.multi-list-box").addClass("hide");
		var objArr = this;
		$.each(objArr, function(idx,thisObj) {  
			thisObj = $(thisObj);
			var dropdown_menuObj = thisObj.siblings(".dropdown_menu");
			var _display = dropdown_menuObj.css("display");
			$(".dropdown_menu").hide();
			if (_display == "none") {
				if($("#SelectFacebook")!=undefined){
					var htmls = $("#SelectFacebook .addNickName").val();
					if($("#addExtSource_sourceTypeList2").attr("data-value")=="Add new account"&&htmls!=""){
						
					}else{
						dropdown_menuObj.show();
					}
				}else{
					dropdown_menuObj.show();
				}
				var curVal = thisObj.parent().attr("data-value");
				var curHtml = thisObj.children().val();
				var list = thisObj.siblings(".dropdown_menu").find(".dropdown_option:visible");
				$.each(list, function(idx, curList) {
					var curObj = $(curList).children(".dropdown_option_item");
					var curLiObj = curObj.parent();
					if (curObj.attr("data-value") == curVal) {
						curLiObj.addClass("active");
						var height = curObj.height();
						thisObj.siblings(".dropdown_menu").scrollTop(height * idx);
						curLiObj.siblings(".dropdown_option").not(".dropdown_option.checkbox").removeClass("active");
						if (typeof curVal == "undefined") {
							thisObj.parent().attr("data-value", curObj.attr("value"));
						}
						return false;
					} else {
						return true;
					}
				});
			}
		});
	}

	function createSearchElm(inputId,queryFun, inputName, placeholderText, title) {
		var objArr = this;
		$.each(objArr, function(idx,thisObj) {  
			thisObj = $(thisObj);
			title = title || switchLangObj.i18n_search;
			placeholderText = placeholderText || "";
			inputName = inputName || inputId;
			thisObj.addClass("searchInputBox");
			thisObj.addClass("clearFix")
			var searchHtml = '<label for="' + inputId + '" class="placeholder">' + placeholderText + '</label>\
		            <input type="text" autocomplete="off" name="' + inputName + '" id="' + inputId + '" class="left searchInput"/>\
		            <div class="left searchIconDiv" title="' + title + '" >\
		                <div class="center searchIcon"></div>\
		            </div>';
			thisObj.html(searchHtml);
			thisObj.bindSearchEvent(thisObj.children(".searchInput"), thisObj.find(".searchIconDiv"), queryFun);
		});
	}

	function bindSearchEvent(oInput, oSearchBtn, queryFun, oPlaceholder) {
		var objArr = this;
		$.each(objArr, function(idx,thisObj) {  
			thisObj = $(thisObj);
			oPlaceholder = oPlaceholder || thisObj.children(".placeholder");
	
			oInput.on("keyup", function(e) {
				var _text = $.trim($(this).val());
				if (_text != "") {
					if (isExist(oPlaceholder) && oPlaceholder.css("display") != "none") {
						oPlaceholder.hide();
					}
				} else {
					if (isExist(oPlaceholder) && oPlaceholder.css("display") == "none") {
						oPlaceholder.show();
					}
				}
	
				if (e.keyCode == 13) {
					if (typeof queryFun == "function") {
						queryFun();
					}
				}
			});
			
			oInput.on("focus", function(e) {
				var _text = $.trim($(this).val());
				if (_text == "") {
					if (isExist(oPlaceholder) && oPlaceholder.css("display") != "none") {
						oPlaceholder.hide();
					}
				} 
//				else {
//					if (isExist(oPlaceholder) && oPlaceholder.css("display") == "none") {
//						oPlaceholder.show();
//					}
//				}
	
				if (e.keyCode == 13) {
					if (typeof queryFun == "function") {
						queryFun();
					}
				}
			});
			oInput.on("blur", function(e) {
				var _text = $.trim($(this).val());
				if (_text != "") {
					if (isExist(oPlaceholder) && oPlaceholder.css("display") != "none") {
						oPlaceholder.hide();
					}
				} else {
					if (isExist(oPlaceholder) && oPlaceholder.css("display") == "none") {
						oPlaceholder.show();
					}
				}
	
			});
	
			oSearchBtn.on("click", function() {
				if (typeof queryFun == "function") {
					queryFun();
				}
			});
		});
	}
	

	/*
	 * \[ ... \],the content of this is not necessary
	 	listArr like: {title:"Status",checkbox:{data:[{val:"0",text:"Offline",name:"my"}]}\[,className:[],classNameKey:"val"\]}
	 	You can use it like the following:
	 	$(selector).createSelectedOptionList(listArr,selectCallback,"val","text",["name"]);
	*/
	function createSelectedOptionList(listArr,selectCallback, key1, key2,params,isMarkFlag){
		var objArr = this;
		function createOptionItem(list,_className){
			var classNameArr = list.className || "";
			var dataArr = list.data || list;
			var classKey = list.classNameKey || "";
			$.each(dataArr,function(idx,obj){
				var paramStr = "",keyName = "";
				var currClassName = classKey?classNameArr[obj[classKey].split(",")[0]]:(classNameArr?classNameArr[idx]:"");
				var _val = obj[key1] || obj;
				var _name = obj[key2] || _val;
				_name = _name+"&nbsp;";
				if (isExist(params)) {
					var singleList=list[idx];
					var paramObj = {};	
					$.each(params, function(idx, param) {
						paramObj[param] = singleList[param];
						keyName = singleList[param];
					});
					paramStr = ' data-param = ' + JSON.stringify(paramObj) + '';
				}
				var _str ='<div class="selecet_option_item left clearFix '+_className+'" data-value="'+_val+'"'+paramStr+' data-key="'+keyName+'">\
					<i class="selecet_option_item_icon left '+currClassName+'"></i>\
					<span class="selecet_option_item_text left">'+_name+'</span>\
				</div>';
				_htmlArr.push(_str);
			});
		}
		var _htmlArr=[];
		$.each(objArr, function(idx,thisObj){  
			var thisObj = $(thisObj);
			thisObj.addClass("clearFix selecet_option_container");
			thisObj.html('<div class="selecet_option_title left">'+listArr.title+'&nbsp;</div>');
			if(isMarkFlag){
				thisObj.append('<a href="javascript:;" class="helpIcon iconfont left aMarkStyle" target="_blank" title="'+switchLangObj.i18n_regular4HourWidthVOD+'"></a>');
			}
			if(listArr.radio){
				createOptionItem(listArr.radio,"radio");
			}
			if(listArr.checkbox){
				createOptionItem(listArr.checkbox,"checkbox");
			}
			thisObj.append(_htmlArr.join(""));
			if(listArr.radio){
				var fisrtData = listArr.radio.data || listArr.radio;
				fisrtData = fisrtData[0][key1] || fisrtData[0];
				thisObj.setSelectedOptionList(fisrtData);
			}
			thisObj.off("click",".selecet_option_item");
			thisObj.on("click",".selecet_option_item",function(){
				var curItemObj = $(this);
				if(curItemObj.hasClass("noPerm")) return;
				if(curItemObj.hasClass("radio")){
					thisObj.attr("data-value",curItemObj.attr("data-value"));
					if(!curItemObj.hasClass("active")){
						curItemObj.addClass("active");
						curItemObj.siblings(".selecet_option_item.radio").removeClass("active");
					}
				}else if(curItemObj.hasClass("checkbox")){
					if(curItemObj.hasClass("active")){
						curItemObj.removeClass("active");
					}else{
						curItemObj.addClass("active");
					}
				}
				if(typeof selectCallback == "function") selectCallback();
			});
		});
	}
	
	
	/*
	 * 
	 	data like: "all" or ["1","2"],the value of data-value property in one or some of the item lists.;
	 	You can use it like as followings:
	 	$(selector).createSelectedOptionList(data);
	
	* */
	function setSelectedOptionList(data){ // type of data: String or Array
		var objArr = this;
		data = data.constructor.name != "Array" ?[data]: data;
		$.each(objArr, function(idx,obj){  
			var thisObj = $(obj);
			var listObj = thisObj.find(".selecet_option_item");
			$.each(data, function(i,_data) {
				$.each(listObj, function(idx, elm) {
					var thisElm = $(elm);
					var _val = thisElm.attr("data-value");
					if(_val == _data){
						thisElm.addClass("active");
						if(thisElm.hasClass("radio")){
							thisObj.attr("data-value",_val);
							thisElm.siblings(".selecet_option_item.radio").removeClass("active");
						}
						return false;
					}
				});
			});
		});
	}
	
	/*----多级下拉列表*/
	function createMenuBar(allDataObj,allNextListObj,dropOptionFn,typeParam,callback){
		//["title显示值","data-val","class",data-id]
		//多选 ，单选
		//1:数据类型决定单选还是多选 checkBox radio 
		//所有的bookmarkID和是否选中{id:123,active:1/0};
		var bookmarkHasActive=allNextListObj.bookmarkHasActive; 
		var _typeParam=typeParam?typeParam:{}; //可扩展参数对象
		var objArr = this;
		$.each(objArr, function(idx,thisObj) { //有多个对象同时调用这个方法  
			thisObj = $(thisObj); //$("#devSearchBookmark")
			var parentObj=thisObj.parent(); 
			thisObj.addClass("dropdownContainer filter_items multiMenu");
			var defaultObj = null;
			var dropdownDefault_str= '<span class="ellipsis dropdownDefault_value"></span>';
			if (!(isExist(thisObj.children(".dropdownDefault")) && isExist(thisObj.children(".dropdown_menu")))) {
				var dropdownHtml = '<div class="dropdownDefault">' + dropdownDefault_str + '</div>\
		   	         <span class="downArrow arrow dropdownArrow"></span>\
		  	         <ul class="dropdown-menu firstMenu common-menu" data-level="0"></ul>';
				thisObj.html(dropdownHtml);
			}else{
				defaultObj = thisObj.find(".dropdownDefault");
				defaultObj.html(dropdownDefault_str);
			}
			$.fn.fnNiceScroll && thisObj.children(".dropdown-menu").fnNiceScroll();
			thisObj.children(".dropdown-menu").css("border-bottom-width", "1px");
			if(allDataObj.checkbox){
				var hasNextNum=allDataObj.checkbox.length;
				thisObj.find(".dropdownDefault_value").html(allDataObj.title+'('+hasNextNum+')');
			}else{
				thisObj.find(".dropdownDefault_value").html(allDataObj.title);
			}
			//显示第一层数据
			_typeParam.notMouse=true;
			createDropDownList(thisObj,allDataObj,allNextListObj,_typeParam,callback);
			//绑定函数
			if(!_typeParam.noFn){
				//1：显示隐藏下拉列表
				thisObj.on("click",".dropdownDefault,.dropdownArrow",function(){
					var dropMenu=thisObj.find(".dropdown-menu").first();
					if(dropMenu.hasClass('hide')){
						$(".dropdown_menu").not(".common-menu").hide();
						dropMenu.removeClass("hide");
					}else{
						thisObj.parent().find(".common-menu,.multi-list-box").addClass("hide");	
						//thisObj.parent().find(".multi-list-box").addClass("hide");
					}
				});

				//点击是否选中当前这个元素
				
				parentObj.on('click','.dropdown_option',function(){
					if(!geo_ActiveFlag) return; //还是false的时候不往下走
					geo_ActiveFlag=false;
					var _this=$(this);
					var parentBox=_this.parent().parent(); //devSearchBookmark
					_this.toggleClass("active");
					var thisVal=_this.find(".dropdown_option_item").attr("data-value");
					if(thisVal=="all"&&_this.parent().attr("data-selectAll")=="true"){
						//console.log("all--");
						
						//if(_this.parent().attr("data-selectAll")=="true"){
							var allSelectNum=_this.parent().children(".dropdown_option").length-1;
							var active="0";
							if(_this.hasClass("active")){
								active="1";
								//_this.siblings('.dropdown_option').addClass("active");
								parentBox.parent().find(".dropdown_option").addClass("active");	
								_this.parent().parent().find('.dropdownDefault_value').text(switchLangObj.i18n_bookmark+'('+allSelectNum+')');
							}else{
								//_this.siblings('.dropdown_option').removeClass("active");
								parentBox.parent().find(".dropdown_option").removeClass("active");
								_this.parent().parent().find('.dropdownDefault_value').text(switchLangObj.i18n_bookmark+'(0)');	
							}
							//循环遍历
							$.each(bookmarkHasActive,function(idx,obj){
								obj.active=active;
							});
							dropOptionFn&&dropOptionFn();
						//}
					}else{
						//console.log("------单个---")
						var thisId=_this.attr('data-id');
						oUtils.ajaxReq("getAllChildBookmarkIds.action", {"rbookmarkIds":thisId}, function(data) {
							if(data.errorCode=="0x0"){
								var allBookmarkIdArr=data.bookmarkIds?$.parseJSON(data.bookmarkIds):"";
								var active="0";
								if(_this.hasClass('active')){
									//选中
									active="1";
									parentBox.next(".multi-list-box").find(".dropdown_option").addClass("active");
								}else{
									parentBox.next(".multi-list-box").find(".dropdown_option").removeClass("active");
								}
								$.each(bookmarkHasActive,function(idx1,obj1){
									var allBookmarkObj=obj1;
									var thisId=allBookmarkObj.id;
									$.each(allBookmarkIdArr,function(idx2,obj2){
										if(thisId==obj2){
											allBookmarkObj.active=active;
										}
									});
								});
								//--------
								if(_this.parent().attr("data-selectAll")=="true"){
									var _flag = true;
									var activeNum=0;
									var arrObj=_this.parent().children('.dropdown_option');
									$.each(arrObj, function(idx, obj) {
										if(idx != 0) {
											if(!$(obj).hasClass("active")){
												_flag = false;
											}else if(!$(obj).hasClass("all")){
												activeNum++;
											}		
										}
									});
								if(_flag) {
									_this.parent().children().first().addClass('active');
								} else {
									_this.parent().children().first().removeClass('active');
								}
								_this.parent().parent().find('.dropdownDefault_value').text(switchLangObj.i18n_bookmark+'('+activeNum+')');	
								}
								//---------
								dropOptionFn&&dropOptionFn();
							}else{
								console.log("超时或错误");
							}
						});	
					}	
				});
				//1：显示各级列表
				var curWidth=thisObj.width();
				var curHeight=allDataObj.nextListTop?allDataObj.nextListTop:38;
				var listWidth=curWidth;
				if(allNextListObj){
					//代表有多层列表
					var listNum=allNextListObj.listNum;
					var allListArr=allNextListObj.allListArr;
					for(var i=1;i<listNum;i++){
						var markerNum=i+1;
						var thisClass="menu"+markerNum;
						var divClass="multilistBox"+markerNum;
						var strUl='<div class="multi-list-box '+divClass+'"><ul class="common-menu '+thisClass+'" data-level="'+i+'"></ul></div>';
						thisObj.parent().append(strUl);
						thisObj.parent().find("."+divClass).css({'left':curWidth,'top':curHeight});
						curWidth=(curWidth-0)+listWidth;
					}
					$.fn.fnNiceScroll && parentObj.children(".multi-list-box").fnNiceScroll();	
					//--------------多层事件--end--
				}	
			}
		});
	}
	
	function createDropDownList(thisObj,allDataObj,allNextListObj,typeParam,callback){
		var parentObj=thisObj.parent();
		var allListArr=allNextListObj.allListArr;
		var _typeParam=typeParam?typeParam:{};
		var thisBoxObj=thisObj;
		var thisObjUl=thisObj.find(".common-menu");
		var isNextMarker=allDataObj.isNextMarker;// 是否有下一级
		var bookmarkHasActive=allNextListObj.bookmarkHasActive;
		//判定自定义属性
		var isAttrName=allDataObj.isAttrName?allDataObj.isAttrName:["bookmarkName","bookmarkName","id","id"];
		var title=isAttrName[0]?isAttrName[0]:"";
		var dataVal=isAttrName[1]?isAttrName[1]:"";
		var _class=isAttrName[2]?isAttrName[2]:"";
		var dataId=isAttrName[3]?isAttrName[3]:"";
		var dataParam=allDataObj.dataParam;//更多的自定义属性
		var notMouse=typeParam.notMouse;
		var level=thisObjUl.attr("data-level");
		var listArr=[];
		if(notMouse&&level=="0"&&!_typeParam.noAll){
			thisObjUl.attr("data-selectAll",true); //有全选的标记
			var _strAll='<li class="dropdown_option checkbox all" title="all" data-id="all">\
					<a href="javascript:;" data-value="all" class="ellipsis dropdown_option_item">All</a>\
					</li>';
			listArr.push(_strAll);
		}
		if(allDataObj.checkbox){
			//["title显示值","data-val","class",data-id]
			//if(notMouse){
			var needData=allDataObj.checkbox;
			//}
			$.each(needData,function(idx,thisObj){
				var addDataParam={};
				if(isNextMarker){
					var hasNextNum=thisObj[isNextMarker].length;
				}
				if(dataParam){
					//增加自定义属性
					for(var i=0;i<dataParam.length;i++){
						var singleData=dataParam[i];
						addDataParam[singleData]=thisObj[singleData];
					}
				}
				addDataParam=JSON.stringify(addDataParam);
				if(isNextMarker&&hasNextNum>0){
					var _str='<li class="dropdown_option checkbox '+thisObj[_class]+'" title="'+thisObj[title]+'" data-id="'+thisObj[dataId]+'" data-param="'+addDataParam+'">\
								<a href="javascript:;" data-value="'+ thisObj[dataVal] + '" class="ellipsis dropdown_option_item">'+ thisObj[title] + '</a>\
								<i class="iconfont icon-right"></i>\
								</li>';
				}else{
					var _str='<li class="dropdown_option checkbox '+thisObj[_class]+'" title="'+thisObj[title]+'" data-id="'+thisObj[dataId]+'" data-param="'+addDataParam+'">\
								<a href="javascript:;" data-value="'+ thisObj[dataVal] + '" class="ellipsis dropdown_option_item">'+ thisObj[title] + '</a>\
								</li>';
				}
				listArr.push(_str); //得到列表
			});
			thisObjUl.html(listArr.join(""));
			//console.log("这里按理值进来一次--");
			$.each(bookmarkHasActive,function(idx,obj){
				var thisId=obj.id;
				var thisActive=obj.active;
				var flag=true;
				if(thisActive=="1"){
					thisBoxObj.find("."+thisId).addClass("active");	
				}else{
					flag=false;
					thisBoxObj.find("."+thisId).removeClass("active");	
				}
				if(flag){
					thisBoxObj.find(".dropdown_option").first().addClass("active");	
				}
			});
			/*if(!_typeParam.noAllSelect){ //以后要记录就要修改
				thisObjUl.children('.dropdown_option').addClass("active");
			}*/
		}else{
			//单选框		
		}
		//--------------------
		var showOptionInterval="";
		parentObj.on('mouseleave','.dropdown_option', function() {
			showOptionInterval = setTimeout(function() {
				var firstBox=parentObj.find(".dropdownContainer").first();
				firstBox.nextAll(".multi-list-box").addClass("hide");
				parentObj.find('.dropdown_option').removeClass('comBokLibg');
			}, 1500);
		});
		
		parentObj.on("mouseenter",".dropdown_option",function(){
			//鼠标划入划出事件
			//1:这是第几层元素在划入划出
			clearTimeout(showOptionInterval);
			var curObj=$(this);
			var thisid=curObj.attr("data-id");
			var val=curObj.children('.dropdown_option_item').attr("data-value");
			var thisLevel=curObj.parent().attr("data-level");
			var curLevData=allListArr[thisLevel]; //得到当前的数据
			curObj.siblings('.dropdown_option').removeClass('comBokLibg');
			curObj.addClass('comBokLibg');
			//下一层显示， 下一层的下一层要都隐藏
			var parentBox=curObj.parent().parent();
			if(curObj.children().hasClass('icon-right')){
				parentBox.next('.multi-list-box').first().removeClass("hide");
				parentBox.next('.multi-list-box').first().children('.common-menu').removeClass("hide");
				var showBox=parentBox.next('.multi-list-box').first();
				showBox.nextAll('.multi-list-box').addClass('hide'); 
				//显示数据
				var showAllData=curLevData[val];
				var nextlistArr=[];
				$.each(showAllData,function(idx,obj){
					var _thisObj=obj;
					var hasNextNum=obj[isNextMarker].length;
					//--------xianshi  shuju --
					if(hasNextNum>0){
						var _str='<li class="dropdown_option checkbox '+_thisObj[_class]+'" title="'+_thisObj[title]+'" data-id="'+_thisObj[dataId]+'">\
						<a href="javascript:;" data-value="'+ _thisObj[dataVal] + '" class="ellipsis dropdown_option_item">'+ _thisObj[title] + '</a>\
							<i class="iconfont icon-right"></i>\
						</li>';
					}else{
						var _str='<li class="dropdown_option checkbox '+_thisObj[_class]+'" title="'+_thisObj[title]+'" data-id="'+_thisObj[dataId]+'">\
						<a href="javascript:;" data-value="'+ _thisObj[dataVal] + '" class="ellipsis dropdown_option_item">'+ _thisObj[title] + '</a>\
						</li>';
					}
					nextlistArr.push(_str); //得到列表						
					});
					showBox.children(".common-menu").html(nextlistArr.join(""));
							//在次循环看那些选中、未选中
						$.each(showAllData,function(idx,obj){
							var curId=showAllData[idx].id;
							$.each(bookmarkHasActive,function(idx,obj){
								var thisId=obj.id;
								if(curId==thisId){
									var thisActive=obj.active;
									if(thisActive=="1"){
										parentObj.find("."+thisId).addClass("active");	
									}else{
										parentObj.find("."+thisId).removeClass("active");	
									}
								}	
							});
						});	
						}else{
							parentBox.nextAll('.multi-list-box').addClass("hide");
						}
					});
		//---------------
		}
	
	/*搜索框*/
	function SearchInput(props){
		this.entity = props.entity;
        this.data = props.data;
        this.callback = props.callback;

        this.filterData = [];
        this.onsearch = false;
	}
	SearchInput.prototype = {
		constructor:SearchInput,
		init: function(){
			var entity = document.querySelector(this.entity);
            var initHtml = 	'<div class="search-container">'+
	            				'<input class="search-input"  type=text/>'+
	                            '<ul class="search-content hide">'+this.template(this.data)+'</ul>'+
                            '</div>';
            entity.innerHTML = initHtml; //创建html结构
            $(entity).find(".search-content").fnNiceScroll();
		},
		present:function(){
			var searchContent = document.querySelector(this.entity+" .search-content");
            var searchItems = document.querySelectorAll(this.entity+" .search-item");
            searchItems.forEach(function(v,i){
                v.classList.remove("active");
            })
            // searchItems.map(ele=>ele.classList.remove("active"));
            searchItems[0].classList.add("active"); //默认为第一行内容添加选中状态
            this.onsearch = true;
		},
		selected:function(){
			var searchInput = document.querySelector(this.entity+" .search-input");
            var selectedContent = document.querySelector(this.entity+" .search-item.active");
            var searchContent = document.querySelector(this.entity+" .search-content");
            searchContent.classList.add("hide");
            searchInput.value = selectedContent.innerHTML;
            this.onsearch = false;
            if(this.callback) this.callback(selectedContent);
		},
		filter:function(value){
			var that = this;
            var searchContent = document.querySelector(that.entity+" .search-content");
            that.filterData = [];
            that.data.forEach(function(v,i){
                if(v.indexOf(value)>-1) that.filterData.push(v);
            })
            searchContent.innerHTML = that.template(that.filterData);
            searchContent.classList.remove("hide");
            that.present();
		},
		template:function(data){
            var html = '';
            if(Object.prototype.toString.call(data)==="[object Array]"){
                data.forEach(function(v,i){
                     html += '<li class="search-item">'+v+'</li>';
                })
            }else{
                console.error("请输入数组类型的数据");
            }
            return html;
        },
        keydown:function(keyCode){
        	var that = this;
            var selectPreview = function(key){
                var searchItems = document.querySelectorAll(that.entity+" .search-item");
                var judgement = key?searchItems.length-1:0;
                for(var i =0;i<searchItems.length;i++){
                    if(searchItems[i].classList.contains("active")&&i!==judgement){
                        var index = key?i+1:i-1;
                        searchItems[i].classList.remove("active");
                        searchItems[index].classList.add("active");
                        break;
                    }
                }
            }
            if(keyCode===13) that.selected();
            if(keyCode===38) selectPreview(false);
            if(keyCode===40) selectPreview(true);
        },
        bindEvents:function(){
            var that = this;
            var entityBox = document.querySelector(that.entity+" .search-container");
            var searchContent = document.querySelector(that.entity+" .search-content");
            entityBox.addEventListener("click",function(e){
                var searchItem = document.querySelector(that.entity+" .search-item.active");        
                if(e.target.classList.contains("search-input")){
                    if(!that.onsearch) that.filter(e.target.value); //展现输入框
                }else if(e.target.classList.contains("search-item")){
                    searchItem.classList.remove("active");
                    e.target.classList.add("active");
                    that.selected(); //选择内容
                }
                e.stopPropagation();
            });
            entityBox.addEventListener("keydown",function(e){
                if(e.target.classList.contains("search-input")){
                    var keyCode = e.keyCode;
                    that.keydown(keyCode);
                }
            });
            entityBox.addEventListener("mouseover",function(e){
                if(e.target.classList.contains("search-item")){
                    var searchItems = document.querySelectorAll(that.entity+" .search-item");
                    searchItems.forEach(function(v,i){
                        v.classList.remove("active");
                    });
                    e.target.classList.add("active");
                }
            });
            entityBox.addEventListener("mouseleave",function(){
                if(that.onsearch) that.present();
            });
            entityBox.addEventListener("input",function(e){
                if(e.target.classList.contains("search-input")) that.filter(e.target.value);
            });
            //点击其他地方，搜索框消失
            document.addEventListener("click",function(e){
                searchContent.classList.add("hide");
                that.onsearch = false;
            });
        },
        done:function(){
            let that = this;
            that.init();
            that.bindEvents();
        }
	}
	/**
	* @param data 搜索数据内容
	* @param callback 选择内容后回调
	*/
	function createSearchInput(data,callback){
		var searchBox = this;
		var searchInput = new SearchInput({
			entity:searchBox.selector,
			data:data,
			callback:callback
		})
		searchInput.done();
	}

	$.fn.createMenuBar = createMenuBar; //下拉列表
	$.fn.createDropDownList = createDropDownList; //列表数据 多级事件
	$.fn.fnNiceScroll = fnNiceScroll;
	$.fn.draggable = draggable;
	$.fn.createSimulateSelect = createSimulateSelect;
	$.fn.updateSimulateSelect = updateSimulateSelect;
	$.fn.setSimulateSelect = setSimulateSelect;
	$.fn.selectDropDown = selectDropDown;
	$.fn.createSearchElm = createSearchElm;
	$.fn.createSelectedOptionList = createSelectedOptionList;
	$.fn.setSelectedOptionList = setSelectedOptionList;
	$.fn.bindSearchEvent = bindSearchEvent;
	$.fn.createSearchInput = createSearchInput;
})();