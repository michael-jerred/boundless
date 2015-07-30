var gulp = require('gulp');
var cache = require('gulp-cached');
var connect = require('gulp-connect');
var del = require('del');
var es = require('event-stream');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');

var paths = (function() {
    var srcRoot = './src/web/public';
    var buildRoot = './build/debug/web/public';

    var srcIndex = srcRoot + '/index.html';
    var builtIndex = buildRoot + '/index.hmtl';
    return {
        tsConfig: './tsconfig.json',
        tsTypings: './typings/**/*.d.ts',

        srcIndex: srcIndex,
        srcHtml: [srcRoot + '/**/*.html', '!' + srcIndex],
        srcLess: srcRoot + '/**/*.less',
        srcTs: srcRoot + '/**/*.ts',

        built: buildRoot,
        builtIndex: builtIndex,
        builtHtml: [buildRoot + '/**/*.html', '!' + builtIndex],
        builtCss: buildRoot + '/**/*.css',
        builtJs: buildRoot + '/**/*.js'
    };
})();


// -------------------- build --------------------
var batch = require('gulp-batch');
var opn = require('opn');
var runSequence = require('run-sequence').use(gulp);
var watch = require('gulp-watch');

gulp.task('web:clean', function (done) {
    cache.caches = {};
    del([paths.built], done);
});

gulp.task('web:build', ['web:clean'], function(done) {
    runSequence(
        ['web:compile:templates', 'web:compile:styles', 'web:compile:scripts'],
        'web:compile:index',
        done);
});

gulp.task('web:serve', ['web:build'], function() {
    connect.server({
        root: paths.built,
        livereload: true
    });

    opn('http://localhost:8080');

    watch(paths.srcHtml, { verbose: true }, batch(function (events, done) {
        runSequence('web:compile:templates', done);
    }));

    watch(paths.srcLess, { verbose: true }, batch(function (events, done) {
        runSequence('web:compile:styles', done);
    }));

    watch(paths.srcTs, { verbose: true }, batch(function (events, done) {
        runSequence('web:compile:scripts', done);
    }));

    watch(paths.srcIndex, { verbose: true }, batch(function(events, done) {
        runSequence('web:compile:index', done);
    }));

    watch(
        [paths.builtCss, paths.builtJs],
        { verbose: true, events: ['add', 'unlink'] },
        batch(function (events, done) {
            runSequence('web:compile:index', done);
        })
    );
});


// -------------------- markup --------------------
//var jade = require('gulp-jade');

gulp.task('web:compile:templates', function () {
    return gulp
        .src(paths.srcHtml)
        .pipe(cache('templates', { optimizeMemory: true }))
        //.pipe(plumber())
        //.pipe(sourcemaps.init())
        //.pipe(jade())
        //.pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.built))
        .pipe(connect.reload());
});


// -------------------- styles --------------------
var autoprefixer = require('autoprefixer-core');
var less = require('gulp-less');
var postCss = require('gulp-postcss');

gulp.task('web:compile:styles', function () {
    return gulp
        .src(paths.srcLess)
        .pipe(cache('styles', { optimizeMemory: true }))
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(postCss([ autoprefixer({ browsers: ['> 2%'] }) ]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.built))
        .pipe(connect.reload());
});


// -------------------- scripts -------------------
var ts = require('gulp-typescript');

var tsProject = ts.createProject(paths.tsConfig);

gulp.task('web:compile:scripts', function () {
    return gulp
        .src([paths.tsTypings, paths.srcTs])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject))
        .js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.built))
        .pipe(connect.reload());
});


// -------------------- inject --------------------
var inject = require('gulp-inject');
var angularFilesort = require('gulp-angular-filesort');
var bowerFiles = require('main-bower-files');

gulp.task('web:compile:index', function () {
    var styles = gulp.src(paths.builtCss, { read: false });
    var scripts = gulp.src(paths.builtJs).pipe(angularFilesort());

    return gulp
        .src(paths.srcIndex)
        //.pipe(sourcemaps.init())
        .pipe(inject(gulp.src(bowerFiles(), { read: false }), { name: 'bower' }))
        //.pipe(inject(, { name: 'head' }))
        .pipe(inject(es.merge(styles, scripts)))
        //.pipe(jade())
        //.pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.built))
        .pipe(connect.reload());
});
