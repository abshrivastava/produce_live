$(function(){
    queryRegionDetailImageInfo();
    getUserInfo();
    $('#addImageModal').on('show.bs.modal', function (e) {
        $("input").val("");
        oUtils.ajaxReq("/producerpro/support/queryRegionImage", "", function(data) {
            if(data.errorCode=="0x0"){
                var result = data.result,SelectLocationHtml="";
                for(var i = 0; i <result.length; i++){
                    SelectLocationHtml+="<li data-platform='"+result[i].instance_platform+"'><a href='javascript:;'>"+result[i].region+"</a></li>";
                }
                $(".select-version").html(SelectLocationHtml);
            }else{

            }
        })
    });
    $('.select-version').on('click',"li a",function () {
        var val = $(this).html();
        $("#imageVersion").val(val);
        $("#imageVersion").attr("data-platform",$(this).parent().attr("data-platform"));
        $("#imageVersion").attr("data-imageId",$(this).parent().attr("data-imageId"));
    });
    $("#ImageList").on("click","td .rollback",function(){
        var thisparentObj = $(this).parents("tr");
        var params = {};
        params["platform"]=thisparentObj.attr("data-platform");
        params["region"]=thisparentObj.attr("data-region");
        params["imageId"]=thisparentObj.attr("data-previousImageId");
        params["version"]=thisparentObj.attr("data-version");
        oUtils.ajaxReq("adjustRegionImage", params, function(data) {
            var errorCode = data.errorCode;
            if(errorCode == "0x0") {
                queryRegionDetailImageInfo();
            }else {
                $("#errorInfo").html(data.errorInfo);
                $("#errorModal").modal();
            }
        });

    });
    $("#ImageList").on("click","td .reset",function(){
        var thisparentObj = $(this).parents("tr");
        var params = {};
        params["platform"]=thisparentObj.attr("data-platform");
        params["region"]=thisparentObj.attr("data-region");
        oUtils.ajaxReq("/producerpro/support/resetInstance", params, function(data) {
            var errorCode = data.errorCode;
            if(errorCode == "0x0") {
                queryRegionDetailImageInfo();
            }else {
                $("#errorInfo").html(data.errorInfo);
                $("#errorModal").modal();
            }
        });
    })

});
function addImage(){
    var params = {};
    var data = $('#imageForm').serializeArray();
    $.each(data, function() {
      params[this.name] = this.value;
    });
    params["platform"] = $("#imageVersion").attr("data-platform");
    if(params.imageId==""){
        $("#errorInfo").html("imageId can't be empty");
        $("#errorModal").modal();
        return false;
    }
    if(params.version==""){
        $("#errorInfo").html("Version can't be empty");
        $("#errorModal").modal();
        return false;
    }
    var versionFlag = Number(params.version);
    if(isNaN(versionFlag)){
        $("#errorInfo").html("Version must be a number");
        $("#errorModal").modal();
        return false;
    }
    if(params.region==""){
        $("#errorInfo").html("Location can't be empty");
        $("#errorModal").modal();
        return false;
    }

    oUtils.ajaxReq("/producerpro/support/adjustRegionImage", params, function(data) {
        var errorCode = data.errorCode;
        if(errorCode == "0x0") {
            queryRegionDetailImageInfo();
        }else {
            $("#errorInfo").html(data.errorInfo);
            $("#errorModal").modal();
        }
    });
}
function queryRegionDetailImageInfo(){
    oUtils.ajaxReq("/producerpro/support/queryRegionDetailImageInfo", "", function(data) {
        console.log(data);
        if(data.errorCode=="0x0"){
            var result = data.result;
            var ImageHtml="",numOfNull,rollback;
            for(var i = 0; i <result.length;i++){
                numOfNull="",rollback="";
                var instance = result[i].instance;
                for(var key in instance){       
                    if(key!=result[i].version){
                        numOfNull="("+key+") "+instance[key]
                        if(instance[key]!=0&&key!=result[i].version){
                            numOfNull+="<span class='reset'>reset</span>";
                        }
                    };     
                }

                if(result[i].version!=result[i].previous_version&&result[i].previous_version!=null)rollback='<span class="rollback">rollback→</span>';
                 ImageHtml+= 
                    '<tr'+' data-previousImageId="'+result[i].previous_image_id+'" data-platform="'+result[i].instance_platform+'"  data-version="'+result[i].previous_version+'"  data-region="'+result[i].region+'">\
                        <td>'+(i+1)+'</td>\
                        <td>'+result[i].region+'</td>\
                        <td>'+result[i].tvu_global_region+'</td>\
                        <td>'+result[i].version+rollback+'</td>\
                        <td class="previous-version">'+result[i].previous_version+'</td>\
                        <td>'+numOfNull+'</td>\
                        <td>'+'<a class="opt-btn"  onClick="delcfm(\''+result[i].image_id+'\')">Delete Image</a>'+'</td>\
                    </tr>';
            }
            $("#ImageList").html(ImageHtml);
        }
    });
}
function delcfm(id) {  
    $('#delcfmModel').attr("data-id",id);
    $('#delcfmModel').modal();  
}  
function urlSubmit(){  
    var deleteId = $("#delcfmModel").attr("data-id");
    oUtils.ajaxReq("/producerpro/support/delImage", {"imageId":deleteId}, function(data) {
        if(data.errorCode != "0x0"){
            $("#errorInfo").html("Delete failed, please try again");
            $("#errorModal").modal();
        }else{
            queryRegionDetailImageInfo();
        }
    })
}
// 添加修改镜像id相关的信息
//获取镜像相关的信息
$("#settingId").on("click", function() {
    oUtils.ajaxReq("/producerpro/support/queryGlobalImageRegion", "", function(data) {
        if (data.errorCode == "0x0") {
            //获取到数据，渲染页面
            var html = '', result = data.result;
            for(var i = 0; i < result.length; i++){
                html +=  '<div class="form-group" data-id="'+result[i].id+'">\
                            <label>'+result[i].region+'</label>\
                            <input type="text" class="form-control input-border" placeholder="Please update ID" maxlength="64">\
                        </div>';
            }
            // 渲染到页面
            $("#changeImage").html(html);
            $('#changeImageModal').modal();
        }else{
            $("#errorInfo").html("search failed, please try again");
            $("#errorModal").modal();
        }
       
    })
})
// 更新镜像
function updateImageId () {
    //获取镜像的id
    var i = 0, changeObj = $("#changeImage .form-group"),param, arr = [];
    for (; i < changeObj.length; i++) {
        param = {};
        param["id"] = changeObj.eq(i).attr("data-id");
        param["imageId"] = changeObj.eq(i).find("input").val();
        arr.push(param);
    }
    var params = {
        "imageList": JSON.stringify(arr)
    }
    oUtils.ajaxReq("/producerpro/support/updateGlobalImage", params, function(data) {
        if (data.errorCode != "0x0") {
            $("#errorInfo").html(data.errorInfo);
            $("#errorModal").modal();
        }  
    })
}

