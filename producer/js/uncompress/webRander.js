var queryTextImgObj=(function($,oUtils,switchLangObj){
    function randerEvent(){
    	var logoNumber=$("#preview .logoRander").length;
    	var logoDom = $("#preview .logoRander");
    	var textNumber=$("#preview .textDiv").length;
    	var textDom = $("#preview .textDiv");
    	var scaleValue=1920/826;
    	var randerHtml="<div class='logoText' style='position:relative;width:826px;height:460px;transform-origin:0% 0%;transform:scale("+scaleValue+");'>";
    	if(logoNumber>0 && textNumber>0){
			randerHtml=randerLogo(logoDom,randerHtml,"logo");
	        randerHtml=randerLogo(textDom,randerHtml,"text");
	        randerHtml+='</div>';
    	}else if(logoNumber>0 && textNumber==0){
    		randerHtml=randerLogo(logoDom,randerHtml,"logo");
	        randerHtml+='</div>';
    	}else if(textNumber>0 && logoNumber==0){
    		randerHtml=randerLogo(textDom,randerHtml,"text");
	        randerHtml+='</div>';
    	}else{
    		randerHtml+='</div>';
    	}
        return randerHtml;
    }

    function randerLogo(element,randerHtml,Dom){
    	$.each(element, function(index, val) {
        	var html= "<div class='"+Dom+"WebRander' style='";
        	var style= $(val).attr("style");
        	html += style+"'>";
        	var sonHtml="";
        	if(element.hasClass('textDiv')){
        		var preTextarea = $(val).find(".preTextarea").attr("style");
        		var preText=$(val).find(".preTextarea").text();
        		var sonHtml= "<div class='preTextarea' style='"+preTextarea+"'>"+preText+"</div>";
        	}else{
        		sonHtml= $(val).html();
        	}
        	html += sonHtml+'</div>';
        	randerHtml+=html;
        });
        return randerHtml;
    }
    return {
        randerEvent:randerEvent,
    }
})($,oUtils,switchLangObj);