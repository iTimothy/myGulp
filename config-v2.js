var fs = require('fs');
var colors = require('colors');

var name;
colors.setTheme({
    info: 'cyan'
});

var filesPath = fs.readdirSync('./actSrc/',(err)=>{

    console.log(err);
});

if(process.env.name && process.env.name.trim() === 'all'){
    console.error('----缺少项目id----'.red);
    process.exit();
}

console.log('====================================================='.rainbow);
console.log(`[info] `.info+`你当前监听环境是：`.green+`${process.env.name ? process.env.name : 'all'}`.white);

if(process.env.name && process.env.name !== 'all'){
    var part = new RegExp(process.env.name.trim());
    if(part.test(filesPath)){
        name = process.env.name.trim();
        console.log(`[info] `.info+`输入的项目匹配成功，监听${process.env.name}项目`.green);
        console.log('====================================================='.rainbow);
    }else{
        name = '**';
        console.log(`[info] `.info+`没有匹配到输入的项目，默认监听actSrc下每个项目`.green);
        console.log('====================================================='.rainbow);
    }
}else{
    name = '**';
    console.log(`[info] `.info+'正在监听actSrc下每个项目'.green);
    console.log('====================================================='.rainbow);
}

module.exports = {
    srcPath: {
        html: 'actSrc/'+`${name !== 'all' ? name+'/**': name}`+'/*.html',
        sass: 'actSrc/'+`${name !== 'all' ? name+'/**': name}`+'/css/**/*.scss',
        js: 'actSrc/'+`${name !== 'all' ? name+'/**': name}`+'/js/**/*.js',
        jsmin: 'actSrc/'+`${name !== 'all' ? name+'/**': name}`+'/js/**/*.min.js',
        imageJpg: 'actSrc/'+`${name !== 'all' ? name+'/**': name}`+'/images/**/*.+(ico)',
        imagePng: 'actSrc/'+`${name !== 'all' ? name+'/**': name}`+'/images/**/*.+(png|jpg|jpeg)',
        css: 'actSrc/'+`${name !== 'all' ? name+'/**': name}`+'/css/**/*.css',
        map: 'activity/**/map'
    },
    destPath : 'activity'+(name !== '**' ? `/${name}/` : ''),
    mkey:'tinypng密钥'
}  
