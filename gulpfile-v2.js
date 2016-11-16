var gulp = require('gulp');
var config = require('./config.js');

// 引入gulp组件
var sass = require('gulp-ruby-sass'); // CSS预处理/Sass编译
var imagemin = require('gulp-imagemin'); // imagemin 图片压缩
var pngquant = require('imagemin-pngquant'); // imagemin 深度压缩
var livereload = require('gulp-livereload'); // 网页自动刷新（服务器控制客户端同步刷新）
var webserver = require('gulp-webserver'); // 本地服务器
var rename = require('gulp-rename'); // 文件重命名
var sourcemaps = require('gulp-sourcemaps'); // 来源地图
var changed = require('gulp-changed'); // 只操作有过修改的文件
var concat = require("gulp-concat"); // 文件合并
var minifyCss = require('gulp-minify-css'); // css压缩
var clean = require('gulp-clean'); // 文件清理
var rev = require('gulp-rev-append'); //添加版本号 
var imageminOptipng = require('imagemin-optipng'); //png压缩
var imageminJpegtran = require('imagemin-jpegtran'); //jpg压缩
var tinypng = require('gulp-tinypng'); // tinypng API压缩图片
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var cache = require('gulp-cache');
var md5 = require("gulp-md5-plus");
var notify = require("gulp-notify");
var autoprefixer = require('gulp-autoprefixer');


var srcPath = config.srcPath;
var destPath = config.destPath;
var mkey = config.mkey;
var distHtml = destPath + '/*html';
var distCss = destPath + '/css/**/*';
var distJs = destPath + '/js/**/*';



gulp.task('clean:css', function() {
    return gulp.src(distCss, { read: false })
        .pipe(clean());
});
gulp.task('clean:js', function() {
    return gulp.src(distJs, { read: false })
        .pipe(clean());
});


// HTML处理
gulp.task('html', function() {
    return gulp.src(srcPath.html)
        .pipe(rev())
        .pipe(gulp.dest(destPath));
});
// 样式处理
gulp.task('sass', ['html','clean:css'], function() {
    return sass(srcPath.sass, { sourcemap: true }) // 指明源文件路径、并进行文件匹配（编译风格：简洁格式）
        .on('error', function(err) {
            console.error('Error!', err.message); // 显示错误信息
            notify(err.message);
        })
        .pipe(autoprefixer({
            browsers: ['> 5%'],
            cascade: false,
            add: true
        }))
        .pipe(sourcemaps.write('./map')) // 地图输出路径（存放位置）
        .pipe(md5(10, distHtml))
        .pipe(gulp.dest(destPath)); // 输出路径
});
// CSS处理
gulp.task('css', ['html','clean:css'], function() {
    return gulp.src(srcPath.css)
        .pipe(autoprefixer({
            browsers: ['> 5%'],
            cascade: false,
            add: true
        }))
        .pipe(md5(10, distHtml))
        .pipe(gulp.dest(destPath));
});

// JS文件压缩&重命名
gulp.task('js', ['html','clean:js'], function() {
    return gulp.src([srcPath.js, '!' + srcPath.jsmin]) // 指明源文件路径、并进行文件匹配，排除 .min.js 后缀的文件
        .pipe(plumber())
        .pipe(babel({
            presets: ['es2015', 'stage-2']
        }))
        .pipe(md5(10, distHtml))
        .pipe(plumber.stop())
        .pipe(gulp.dest(destPath)); // 输出路径
});
gulp.task('jsmin', ['html','clean:js'], function() {
    return gulp.src(srcPath.jsmin)
        .pipe(gulp.dest(destPath));
});

gulp.task('jpg', function() {
    return gulp.src(config.srcPath.imageJpg)
        .pipe(cache(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngquant()]
        })))
        .pipe(gulp.dest(destPath));
});
gulp.task('png', function() {
    return gulp.src(srcPath.imagePng) // 源地址
        .pipe(cache(tinypng(mkey)))
        .pipe(gulp.dest(destPath)); // 输出路径
});


gulp.task('images', ['png', 'jpg']);

// 本地服务器
gulp.task('webserver', function() {
    gulp.src('activity') // 服务器目录（.代表根目录）
        .pipe(webserver({ // 运行gulp-webserver
            port: '10245',
            livereload: true, // 启用LiveReload
            open: false // 服务器启动时自动打开网页
        }));
});
// 监听任务
gulp.task('watch', function(err) {
    // 监听 html
    gulp.watch(srcPath.html, ['html', 'images', 'sass', 'css', 'js', 'jsmin']);
    // 监听 scss
    gulp.watch(srcPath.sass, ['sass', 'js', 'css', 'jsmin']);
    // 监听 css
    gulp.watch(srcPath.css, ['css', 'js', 'sass', 'jsmin']);
    // 监听 images
    gulp.watch(srcPath.imageJpg, ['images']);
    gulp.watch(srcPath.imagePng, ['images']);
    // 监听 js
    gulp.watch(srcPath.js, ['js', 'html', 'sass', 'css', 'jsmin']);
    gulp.watch(srcPath.jsmin, ['jsmin', 'html', 'sass', 'css', 'js']);
});
// 默认任务
gulp.task('build', ['html', 'sass', 'css', 'images', 'js', 'jsmin']);
gulp.task('default', ['build', 'webserver', 'watch']);
/* = 发布环境( Release Task )
-------------------------------------------------------------- */
// 清理文件
gulp.task('clean:map', function() {
    return gulp.src(srcPath.map, { read: false }) // 清理maps文件
        .pipe(clean());
});
// sass处理
gulp.task('sassRelease',['html','clean:css'], function() {
    return sass(srcPath.sass, { style: 'compressed' }) // 指明源文件路径、并进行文件匹配（编译风格：压缩）
        .on('error', function(err) {
            console.error('Error!', err.message); // 显示错误信息
        })
        .pipe(autoprefixer({
            browsers: ['> 5%'],
            cascade: false,
            add: true
        }))
        .pipe(md5(10, distHtml))
        .pipe(gulp.dest(destPath)); // 输出路径
});
gulp.task('cssRelease',['html','clean:css'], function() {
    return gulp.src(srcPath.css)
        .pipe(autoprefixer({
            browsers: ['> 5%'],
            cascade: false,
            add: true
        }))
        .pipe(md5(10, distHtml))
        .pipe(minifyCss())
        .pipe(gulp.dest(destPath));
});

// 脚本压缩&重命名
gulp.task('jsRelease',['html','clean:js'],function() {
    return gulp.src([srcPath.js, '!' + srcPath.jsmin]) // 指明源文件路径、并进行文件匹配，排除 .min.js 后缀的文件
        .pipe(babel({
            presets: ['es2015', 'stage-2']
        }))
        .pipe(uglify())
        .pipe(md5(10, distHtml))
        .pipe(gulp.dest(destPath)); // 输出路径
});
// 打包发布
gulp.task('release', ['clean:map'], function() { // 开始任务前会先执行[clean]任务
    return gulp.start('sassRelease', 'cssRelease', 'jsRelease','jsmin' ,'images'); // 等[clean]任务执行完毕后再执行其他任务
});

/* = 帮助提示( Help )
-------------------------------------------------------------- */
gulp.task('help', function() {
    console.log('----------------- 开发环境 -----------------');
    console.log('set name=项目名称||all 默认是监听全部项目');
    console.log('gulp show  显示当前的监听项目');
    console.log('gulp dev   初始化项目并监听项目');
    console.log('gulp build   初始化项目');
    console.log('gulp default   默认任务');
    console.log('gulp html    HTML处理');
    console.log('gulp sass    sass处理');
    console.log('gulp css    css处理');
    console.log('gulp js    JS处理');
    console.log('gulp images    图片压缩');
    console.log('gulp concat    文件合并');
    console.log('---------------- 发布环境 -----------------');
    console.log('gulp release   打包发布');
    console.log('gulp clean   清理文件');
    console.log('gulp sassRelease   sass处理');
    console.log('gulp cssRelease   css处理');
    console.log('gulp jsRelease js压缩');
    console.log('---------------------------------------------');
});
