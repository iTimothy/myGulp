var fs = require('fs');
var colors = require('colors');

var argv = require('minimist')(process.argv.slice(2),{
    string:['src','dist']
});


var destDir = argv.dist ||'activity';

var srcCLI = argv.src;

if(!srcCLI){
    console.log('没有输入项目名称');
    process.exit();
}

var name = srcCLI;
colors.setTheme({
    info: 'cyan'
});

var filesPath = fs.readdirSync('./actSrc/',(err)=>{

    if(err){
        console.log(err);
    }
});

console.log('====================================================='.rainbow);
console.log(`[info] `.info+`你当前监听发布环境是：`.green+`${destDir}`.bgWhite.red+`目录下的`+`${name}`.bgRed.white+'项目');

var part = new RegExp(name);
if(part.test(filesPath)){
    console.log(`[info] `.info+`输入的项目匹配成功，监听${name}项目`.green);
    console.log('====================================================='.rainbow);
}else{
    console.log(`[info] `.info+`没有匹配到输入的项目，强制退出`.green);
    console.log('====================================================='.rainbow);
    process.exit();
}


module.exports = {
    srcPath: {
        html: `actSrc/${name}/**/*.html`,
        sass: `actSrc/${name}/**/css/**/*.scss`,
        js: `actSrc/${name}/**/js/**/*.js`,
        jsmin: `actSrc/${name}/**/js/**/*.min.js`,
        imageJpg: `actSrc/${name}/**/images/**/*.+(ico)`,
        imagePng: `actSrc/${name}/**/images/**/*.+(png|jpg|jpeg)`,
        css: `actSrc/${name}/**/css/**/*.css`,
        map: `${destDir}/**/map`
    },
    destPath : `${destDir}/${name}/`,
    mkey:'tinypng密钥',
    destDir:destDir,
    src:name
}  
