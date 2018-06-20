var gulp = require('gulp'),
    htmlmin = require('gulp-htmlmin');
var cleanCSS = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var pump = require('pump');

gulp.task('minHTML', function () {
    var options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
    };
    gulp.src('server/views/**/**/*.html')
        .pipe(htmlmin(options))
        .pipe(gulp.dest('dest/views'));

    gulp.src('public/**/*.html')
        .pipe(htmlmin(options))
        .pipe(gulp.dest('dest/public'));
});

gulp.task('minCSS', function(){
    gulp.src('public/**/**/**/**/*.css')
        .pipe(sourcemaps.init())
        .pipe(cleanCSS())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dest/public'));
});

gulp.task('minJS', function(cb){
    pump([
            gulp.src('public/**/**/**/**/**/*.js'),
            uglify({
                mangle: {
                    reserved: ['$super']
                },
                compress: {
                    drop_console: true
                }
            }),
            gulp.dest('dest/public')
        ],
        cb
    );
});

gulp.task('release', ['minHTML', 'minCSS', 'minJS']);
gulp.task('default', ['release']);