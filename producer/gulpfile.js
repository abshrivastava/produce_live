var gulp = require("gulp"),
    useref = require("gulp-useref"),
    rev = require("gulp-rev"),
    gulpIf = require("gulp-if"),//判断文件类型的 css/js/html
    minifyCss = require("gulp-minify-css"),//压缩css
    autoprefixer = require("gulp-autoprefixer"),//css补充前缀
    minify = require('gulp-minify'),
    filter = require("gulp-filter"),//过滤文件
    uglify = require("gulp-uglify"),//压缩js
    rename = require("gulp-rename"),//文件重命名
    collector = require("gulp-rev-collector"),
    babel = require("gulp-babel"),
    fs = require("fs"),
    del = require("del"),
    zip = require("gulp-zip");
    var Num = ""; 
/*gulp.task("default",function(){
    gulp.src('./src/producerPro.html')
        .pipe(useref())//通过注释解析依赖关系
        .pipe(rev())//生成属于稳健独有的数字签名
        .pipe(gulp.dest("./dist"))//移动文件 html/css/js
        .pipe(rev.manifest())//生成关联清单
        .pipe(gulp.dest("./dist/rev")) //关联清单的存放路径
})*/
var options = {
    output:"./dist/webrtc/",
}
//1
gulp.task("useref",function(){
    readfile();
    //当前任务存在任务依赖，必须将任务return 返回一个标记，才好控制异步流程
    const f = filter(['**/*.js',"!**/*.min.js"], {restore: true});
    return  gulp.src(["./producerPro.html","./producerManage.html"])
        .pipe(useref())//通过注释解析依赖关系
        .pipe(gulpIf("*.css",minifyCss()))//压缩css
        .pipe(gulpIf("*.css",autoprefixer()))//补前缀
        .pipe(gulpIf("*.css",rev()))//生成数字签名
        .pipe(f)
        .pipe(gulpIf("*.js",babel()))//处理es5的问题
        //.pipe(gulpIf('*.js',uglify()))//压缩js
        .pipe(f.restore)
        .pipe(gulpIf("*.js",rev()))//生成数字签名
        .pipe(gulp.dest("dist/webrtc/"))//html/css/js都去了
        .pipe(rev.manifest())//生成关联清单
        .pipe(rename("css-js-manifest.json"))//改名
        .pipe(gulp.dest("dist/webrtc/rev"))//生成清单文件css-js-manifest.json
});
//gulp.task('default', function () {
 // return gulp.src("./*")
//    .pipe(zip("producer_v_" +Num+ ".zip"))
//    .pipe(gulp.dest("./"));
//});
gulp.task("default",["useref"],function(){
    gulp.src(["./dist/webrtc/rev/*.json","./dist/webrtc/*.html"])
        .pipe(collector())
        .pipe(gulp.dest("./dist/webrtc/"));//覆盖原来的文件
    });
//gulp.task("clean",function(){
 //   return del(options.output);
 //   });
   
function readfile(){
    var data = fs.readFileSync('./js/uncompress/buildVersion.js');
    data = data.toString();
    var index = data.indexOf(".");
    index = data.indexOf(".",index+1);
    var data2 = data.substring(0,index+1);
    var index2 = data.indexOf("\"",index+1);
    Num = data.substring(index+1,index2).trim();
    data = data2+Num+'";';
    writeFile(data);
    }
function writeFile(fileInfor){
    fs.writeFile('./js/uncompress/buildVersion.js',fileInfor,function(err) {
       if (err) {
           return console.error(err);
       }
    });
}