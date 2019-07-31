(function() {
'use strict';
 
var TLib = {};

if (!window.console) {
    window.console = { log: function() {} };
}

if (!Date.hasOwnProperty("now") || !Date.now instanceof Function) {
    Date.now = function () {
        return (new Date()).getTime();
    };
}

window.extend = (function() {
    var F = function() {};
    return function (Child, Parent) {
        F.prototype = Parent.prototype;
        Child.prototype = new F();
        Child.prototype.constructor = Child;
        Child.superclass = Parent.prototype;
    };
}());

// requestAnimationFrame shim
var oldRAF = window.requestAnimationFrame;
if (!oldRAF) {
    window.requestAnimationFrame = (function() {
        return window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(cb) { setTimeout(cb, 1000/60) };
    })();
};

TLib.toDate = function(obj) {
    if (!_.isDate(obj)) {
        return new Date(obj);
    }
    return obj;
};

TLib.padZero = function(num) {
    return num < 10 ? "0" + num : num;
};
    
TLib.formatTime = function(time) {
    time = TLib.toDate(time);
    return TLib.padZero(time.getHours()) + ":" + TLib.padZero(time.getMinutes()) + ":" + TLib.padZero(time.getSeconds());
};

TLib.timeToSeconds = function(time) {
    var timeEl = time.match(/(\d{2})\:(\d{2})\:(\d{2})/);
    var result = -1;
    if(timeEl.length === 4) {
        var h = parseInt(timeEl[1], 10);
        var m = parseInt(timeEl[2], 10);
        var s = parseInt(timeEl[3], 10);
    
        if(h > -1 && m > -1 && s > -1 && h <= 24 && m <= 60 && s <= 60) {
            result = h * 3600 + m * 60 + s;
        }
    }
    return result;
    
};

TLib.formatDate = function(date) {
    date = TLib.toDate(date);
    return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
};

TLib.format = function(format) {
    var i, chunks = format.split(/\${\d+}/);
    for (i = chunks.length - 1; i > 0; i--)
        chunks.splice(i, 0, arguments[i]);
    return chunks.join('');
};

TLib.capitalize = function(str) {
    return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
};

TLib.bigIntToHex = function(bigIntStr) {
    var idInt1 = Number(bigIntStr.substring(0, Math.ceil(bigIntStr.length/2)));
    var idInt2 = Number(bigIntStr.substring(Math.ceil(bigIntStr.length/2), bigIntStr.length));
    var temp;
    var res = '';

    while(idInt1 > 0 || idInt2 > 0) {
        if(idInt1 > 0) {
            temp = Number((idInt1%16).toString() + idInt2.toString());
            idInt1 = Math.floor(idInt1/16);
        } else {
            temp = idInt2;
        }
        res = (temp%16).toString(16) + res;
        idInt2 = Math.floor(temp/16);
    }
    return res;
};

TLib.UUID = function() {
    var S4 = function() {
        return Math.floor(
                Math.random() * 0x10000
            ).toString(16);
    };
    return S4() + S4() + "-" +
        S4() + "-" +
        S4() + "-" +
        S4() + "-" +
        S4() + S4() + S4();
};

TLib.showErrorMessage = function (errorText, title) {
    var videoContainer =  $("#video-service-main");
    var videoContainerStatus =  videoContainer.css("display");
    var errorDialog = $("#error-dialog");
    videoContainer.css("display", "none");
    errorDialog.dialog({
        modal: true,
        resizable: false,
        draggable: false,
        dialogClass: 'error_dialog',
        title: title || "An error occurred",
        height: 150,
        width: 300,
        position: "center",
        close : function(Event) {
            if (!_.isUndefined(Event.handleObj) && Event.handleObj.type === 'click') {
                Transport.Request.closePopup();
            }
            if (videoContainerStatus !== "none") {
                videoContainer.css("display", "block");
            }
        }
    });
    errorDialog.children("p").text(errorText);
}; 

    TLib.toggleVideoContainer = function(val) {
        var logoElement;
        logoElement = $("#vlc-logo");
        if (val === "none" && logoElement.length === 0) {
            logoElement = jQuery('<div />').attr('id', 'vlc-logo');
            $("#video-service").append(logoElement);
        }
        if (val === "none") {
            logoElement.css("display", "block");
        } else {
            logoElement.css("display", "none");
        }
        $("#video-service-main").css("display", val);
    };

window.TLib = TLib;
}());
