var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass'));
var cleanCSS = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
var rename = require('gulp-rename');
var merge = require('merge2');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var del = require('del');
var zip = require('gulp-zip');
var browserSync = require('browser-sync').create();

gulp.task('css', function() {
    var sassStream = gulp.src('./assets/scss/screen.scss')
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(autoprefixer());
    var cssStream = gulp.src([
        './assets/css/google-font.css',
        './assets/css/bootstrap.min.css',
        './assets/css/slick.css',
        './assets/css/hl-styles/atom-one-dark.min.css'
    ], { allowEmpty: true })
    .pipe(concat('css-files.css'));
    return merge(cssStream, sassStream)
    .pipe(concat('app.bundle.min.css'))
    .pipe(cleanCSS({
        level: {1: {specialComments: 0}},
        compatibility: 'ie9'}))
    .pipe(rename("bundle-css.hbs"))
    .pipe(gulp.dest('./partials/'))
    .pipe(browserSync.stream());
});
gulp.task('concat-js', function() {
    return gulp.src([
        './assets/js/vendor/jquery-3.3.1.min.js',
        './assets/js/vendor/jquery.fitvids.js',
        './assets/js/vendor/highlight.pack.js',
        './assets/js/vendor/searchinghost.min.js',
        './assets/js/vendor/medium-zoom.min.js',
        './assets/js/index.js'
    ], { allowEmpty: true })
    .pipe(concat('app.bundle.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./assets/js'));
});
gulp.task('watch', gulp.series('css', 'concat-js', function () {
    browserSync.init({
        proxy: "http://localhost:2368"
    });
    gulp.watch('./assets/scss/**/*.scss', { allowEmpty: true }).on('change', gulp.series('css'));
    gulp.watch(['./assets/js/**/*.js', '!./assets/js/app.bundle.min.js'], { allowEmpty: true }).on('change', gulp.series('concat-js', browserSync.reload));
    gulp.watch('./**/*.hbs').on('change', browserSync.reload);
}));

gulp.task('clean', function() {
    return del(['./build', './dist']);
});

gulp.task('build', gulp.series('clean', 'css', 'concat-js', function () {
    var targetDir = 'build/';

    return gulp.src([
        '**',
        '!assets/scss', '!assets/scss/**/*',
        '!assets/css', '!assets/css/**/*',
        'assets/js/**', '!assets/js/vendor', '!assets/js/vendor/**/*',
        '!node_modules', '!node_modules/**',
        '!build', '!build/**',
        '!dist', '!dist/**'
    ])
    .pipe(gulp.dest(targetDir));
}));

gulp.task('zip', function () {
    var targetDir = 'dist/';
    var themeName = require('./package.json').name;
    var filename = themeName + '.zip';

    return gulp.src([
        './build/**/*'
    ])
    .pipe(zip(filename))
    .pipe(gulp.dest(targetDir));
});

gulp.task('default', gulp.parallel('watch'));