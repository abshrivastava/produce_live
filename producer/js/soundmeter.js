/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

try {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  window.audioContext = new AudioContext();
} catch (e) {
  console.error('Web Audio API not supported.');
}

// Meter class that generates a number correlated to audio volume.
// The meter class itself displays nothing, but it makes the
// instantaneous and time-decaying volumes available for inspection.
// It also reports on the fraction of samples that were at or near
// the top of the measurement range.
function SoundMeter() {
  this.context = window.audioContext;
  //window.audioContext = this.context;
  this.instant = 0.0;
  this.slow = 0.0;
  this.clip = 0.0;
  this.script = this.context.createScriptProcessor(2048, 1, 1);
  var that = this;
  this.script.onaudioprocess = function(event) {
    var input = event.inputBuffer.getChannelData(0);
    var i;
    var sum = 0.0;
    var clipcount = 0;
    for (i = 0; i < input.length; ++i) {
      sum += input[i] * input[i];
      if (Math.abs(input[i]) > 0.99) {
        clipcount += 1;
      }
    }
    that.instant = Math.sqrt(sum / input.length) * 100;
    that.slow = 0.95 * that.slow + 0.05 * that.instant;
    that.clip = clipcount / input.length;
  };
}

SoundMeter.prototype.connectToSource = function(stream, callback) {
  console.log('SoundMeter connecting');
  try {
    this.mic = this.context.createMediaStreamSource(stream);
    this.mic.connect(this.script);
    // necessary to make sample run, but should not be.
    this.script.connect(this.context.destination);
    if (typeof callback !== 'undefined') {
      callback(null);
    }
  } catch (e) {
    console.error(e);
    if (typeof callback !== 'undefined') {
      callback(e);
    }
  }
};
SoundMeter.prototype.stop = function() {
  this.mic.disconnect();
  this.script.disconnect();
};

$("#replay").on("click",function(){
    var rid = $("#rid").val().trim().toLowerCase();
    var timeStamp = parseInt(new Date().getTime()/1000)*1000-5000;
    var filenames = $("#fileName").val();
    if(filenames==""||rid==""){
        alert("please input filename and rid");
    }
    $.ajax({
        type:"POST",
        url:"record/current_session",
        data:{
            rid:rid
        },
        success:function(data){
            var data = JSON.parse(data);
            var sources =data.Sources;
            if(sources.length>0){
                for(var i=0;i<sources.length;i++){
                    if(filenames.indexOf(sources[i].ID)>-1){
                        if(sources[i].Records!=null&&sources[i].Records.length!=0){
                            if(timeStamp-sources[i].Records[sources[i].Records.length-1].StartTimestamp>10000&&sources[i].Records[sources[i].Records.length-1].EndTimestamp==0){
                                getReplayTime(sources[i],timeStamp);
                            }else{
                                alert("record tiem less than 10s");
                                return false;  
                            }
                        }else{
                            alert("record tiem less than 10s");
                            return false;
                        }
                    }
                }
            }
        },
        error:function(data){
            console.log(data)
        }
    });
});
function getReplayTime(sources,timeStamp,){
    var Records = sources["Records"][sources["Records"].length-1];
    var param = {
        rid:$("#rid").val().trim().toLowerCase(),
    }
    var params = {
        Title:Records["Title"],
        Tags:Records["Tags"],
        Author:"",
        Scenes:[{ 
            "SourceID":Records.SourceID, 
            "SessionID":Records.ID, 
            "StartTimestamp":timeStamp-30000, 
            "EndTimestamp":timeStamp-10000, 
            "SpeedRate":1,
            "EffectImageId":"",
        }],
        FrontCover:""
    }
    param["params"] = JSON.stringify(params);
    $.ajax({
        type:"POST",
        url:"record/express_apply_pvw",
        data:param,
        success:function(data){
            console.log(data);
        },
        error:function(data){
            console.log(data);
        }
    });
}
