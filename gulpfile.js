var gulp = require('gulp');
var config = require('./config.js');

// 引入gulp组件
var sass = require('gulp-ruby-sass');      // CSS预处理/Sass编译
var imagemin = require('gulp-imagemin');   // imagemin 图片压缩
var pngquant = require('imagemin-pngquant'); // imagemin 深度压缩
var livereload = require('gulp-livereload');     // 网页自动刷新（服务器控制客户端同步刷新）
var webserver = require('gulp-webserver');    // 本地服务器
var rename = require('gulp-rename');     // 文件重命名
var sourcemaps = require('gulp-sourcemaps');   // 来源地图
var changed = require('gulp-changed');      // 只操作有过修改的文件
var concat = require("gulp-concat");       // 文件合并
var minifyCss = require('gulp-minify-css');       // css压缩
var clean = require('gulp-clean');    // 文件清理
var rev = require('gulp-rev-append'); //添加版本号 
var imageminOptipng = require('imagemin-optipng');   //png压缩
var imageminJpegtran = require('imagemin-jpegtran');  //jpg压缩
var tinypng = require('gulp-tinypng'); // tinypng API压缩图片
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var cache = require('gulp-cache');
var md5 = require("gulp-md5-plus");
var notify = require("gulp-notify");
var autoprefixer = require('gulp-autoprefixer');

var destDir = config.destDir;
var srcPath = config.srcPath;
var destPath = config.destPath;
var mkey = config.mkey;

gulp.task('html', function () {
    return gulp.src(srcPath.html)
        .pipe(rev())
        .pipe(gulp.dest(destPath));
});

gulp.task('sass', function () {
    return sass(srcPath.sass, { sourcemap: true })
        .on('error', function (err) {
            console.error('Error!', err.message);
            notify(err.message);
        })
        .pipe(autoprefixer({
            browsers: ['> 5%'],
            cascade: false,
            add: true
        }))
        .pipe(sourcemaps.write('./map'))
        .pipe(rev())
        .pipe(gulp.dest(destPath));
});

gulp.task('css', function () {
    return gulp.src(srcPath.css)
        .pipe(autoprefixer({
            browsers: ['> 5%'],
            cascade: false,
            add: true
        }))
        .pipe(rev())
        .pipe(gulp.dest(destPath));
});


gulp.task('js', function () {
    return gulp.src([srcPath.js, '!' + srcPath.jsmin])
        .pipe(plumber())
        .pipe(babel())
        .pipe(plumber.stop())
        .pipe(gulp.dest(destPath));
});

gulp.task('jsmin', function () {
    return gulp.src(srcPath.jsmin)
        .pipe(gulp.dest(destPath));
});

gulp.task('jpg', function () {
    return gulp.src(config.srcPath.imageJpg)
        .pipe(cache(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngquant()]
        })))
        .pipe(gulp.dest(destPath));
});
gulp.task('png', function () {
    return gulp.src(srcPath.imagePng)
        .pipe(cache(tinypng(mkey)))
        .pipe(gulp.dest(destPath));
});


gulp.task('images', ['png', 'jpg']);


// 本地服务器
gulp.task('webserver', function () {
    gulp.src(destDir)
        .pipe(webserver({ // 运行gulp-webserver
            port: '10245',
            livereload: true, // 启用LiveReload
            open: false // 服务器启动时自动打开网页
        }));
});
// 监听任务
gulp.task('watch', function (err) {
    // 监听 html
    gulp.watch(srcPath.html, ['html', 'images']);
    // 监听 scss
    gulp.watch(srcPath.sass, ['sass']);
    // 监听 css
    gulp.watch(srcPath.css, ['css']);
    // 监听 images
    gulp.watch(srcPath.imageJpg, ['images']);
    gulp.watch(srcPath.imagePng, ['images']);
    // 监听 js
    gulp.watch(srcPath.js, ['js']);
    gulp.watch(srcPath.jsmin, ['jsmin']);
});
// 默认任务
gulp.task('build', ['html', 'sass', 'css', 'images', 'js', 'jsmin']);
gulp.task('default', ['build', 'webserver', 'watch']);
/* = 发布环境( Release Task )
-------------------------------------------------------------- */
// 清理文件
gulp.task('clean', function () {
    return gulp.src(srcPath.map, { read: false }) // 清理maps文件
        .pipe(clean());
});
// sass处理
gulp.task('sassRelease', function () {
    return sass(srcPath.sass, { style: 'compressed' }) // 指明源文件路径、并进行文件匹配（编译风格：压缩）
        .on('error', function (err) {
            console.error('Error!', err.message); // 显示错误信息
        })
        .pipe(autoprefixer({
            browsers: ['> 5%'],
            cascade: false,
            add: true
        }))
        .pipe(rev())
        .pipe(gulp.dest(destPath)); // 输出路径
});
gulp.task('cssRelease', function () {
    return gulp.src(srcPath.css)
        .pipe(autoprefixer({
            browsers: ['> 5%'],
            cascade: false,
            add: true
        }))
        .pipe(rev())
        .pipe(minifyCss())
        .pipe(gulp.dest(destPath));
});

// 脚本压缩&重命名
gulp.task('jsRelease', function () {
    return gulp.src([srcPath.js, '!' + srcPath.jsmin]) // 指明源文件路径、并进行文件匹配，排除 .min.js 后缀的文件
        .pipe(babel())
        .pipe(uglify())
        .pipe(gulp.dest(destPath)); // 输出路径
});
// 打包发布
gulp.task('release', ['clean'], function () { // 开始任务前会先执行[clean]任务
    return gulp.start('sassRelease', 'cssRelease', 'jsRelease', 'images'); // 等[clean]任务执行完毕后再执行其他任务
});

/* = 帮助提示( Help )
-------------------------------------------------------------- */
gulp.task('help', function () {
    console.log('----------------- 开发环境 -----------------');
    //console.log('set name=项目名称||all 默认是监听全部项目');
    console.log('npm run dev -- --src 项目名称 --dist 输出目录（默认activity）');

    console.log('---------------- 发布环境 -----------------');
    console.log('npm run release -- --src 项目名称 --dist 输出目录（默认activity）');
    console.log('gulp clean   清理文件');
    console.log('gulp sassRelease   sass处理');
    console.log('gulp cssRelease   css处理');
    console.log('gulp jsRelease js压缩');
    console.log('---------------------------------------------');
});