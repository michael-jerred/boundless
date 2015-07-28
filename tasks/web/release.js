var gulp = require('gulp');
var concat = require('gulp-concat');
var del = require('del');
var filter = require('gulp-filter');
var rename = require('gulp-rename');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var sourcemaps = require('gulp-sourcemaps');
var tap = require('gulp-tap');
var watch = require('gulp-watch');

var angularApp = 'main';
var paths = (function() {
    var srcRoot = './src/web/public';
    var buildRoot = './build';
    var compiledRoot = './.compile';

    var srcIndex = srcRoot + '/index.jade';
    return {
        tsTypings: './typings/**/*.d.ts',

        srcIndex: srcIndex,
        srcJade: [srcRoot + '/**/*.jade', '!' + srcIndex],
        srcLess: srcRoot + '/**/*.less',
        srcTs: srcRoot + '/**/*.ts',

        compiledRoot: compiledRoot,
        compiledHtml: compiledRoot + '/**/*.html',
        compiledCss: compiledRoot + '/**/*.css',
        compiledJs: compiledRoot + '/**/*.js',

        buildDebug: buildRoot + '/debug/web/public',
        buildRelease: buildRoot + '/release/web/public'
    };
})();

gulp.task('web:clean:debug', function (callback) {
    del([paths.buildDebug], callback);
});

gulp.task('web:clean:release', function (callback) {
    del([paths.buildRelease], callback);
});

gulp.task('web:serve', ['web:clean:debug', 'web:build:debug'], function() {

});

gulp.task(
    'web:build:debug',
    ['web:build:debug:jade', 'web:build:debug:less', 'web:build:debug:ts', 'web:build:debug:inject'],
    function() {

});

gulp.task('web:build:release', ['web:build:release:jade', 'web:build:release:less', 'web:build:release:ts'], function() {

});


// -------------------- markup --------------------
var jade = require('gulp-jade');
var angularTemplatecache = require('gulp-angular-templatecache');

gulp.task('web:build:release:jade', function() {
    return gulp.src(paths.srcJade)
        .pipe(sourcemaps.init())
        .pipe(jade())
        .pipe(angularTemplatecache('templates.js'))
        .pipe(rev())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.compiledRoot));
});


// -------------------- styles --------------------
var autoprefixer = require('autoprefixer-core')({ browsers: ['> 2%'] });
var less = require('gulp-less');
var minifyCss = require('gulp-minify-css');
var postCss = require('gulp-postcss');

gulp.task('web:build:debug:less', function() {
    return gulp.src(paths.srcLess)
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(postCss([ autoprefixer ]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.compiledRoot));
});

gulp.task('web:build:release:less', function() {
    return gulp.src(paths.srcLess)
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(postCss([ autoprefixer ]))
        .pipe(concat('styles.css'))
        .pipe(minifyCss())
        .pipe(rev())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.compiledRoot));
});


// -------------------- scripts -------------------
var ts = require('gulp-typescript');
var uglify = require('gulp-uglify');

var tsProject = ts.createProject({
    declarationFiles: false,
    noExternalResolve: true,
    noImplicitAny: true,
    target: 'ES5',
    'module': 'commonjs',
    sortOutput: true
});

gulp.task('web:build:debug:ts', function() {
    return gulp.src([paths.tsTypings, paths.srcTs])
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.compiledRoot));
});

gulp.task('web:build:release:ts', function() {
    return gulp.src([paths.tsTypings, paths.srcTs])
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject))
        .pipe(concat('scripts.js'))
        .pipe(uglify())
        .pipe(rev())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.compiledRoot));
});


// -------------------- inject --------------------
var inject = require('gulp-inject');

gulp.task('web:build:debug:inject', function() {
    return gulp.src(paths.srcIndex)
        .pipe(jade())
        .pipe(inject(gulp.src(paths.compiledJs, { read: false })))
});

gulp.task('web:build:release:inject', function() {

});