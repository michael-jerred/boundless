var gulp = require('gulp');
var cache = require('gulp-cached');
var del = require('del');
var es = require('event-stream');
var livereload = require('gulp-livereload');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');

var paths = (function() {
    var srcRoot = './src/web/public';
    var buildRoot = './build/debug/web/public';

    var srcIndex = srcRoot + '/index.jade';
    var builtIndex = buildRoot + '/index.hmtl';
    return {
        tsTypings: './typings/**/*.d.ts',

        srcIndex: srcIndex,
        srcJade: [srcRoot + '/**/*.jade', '!' + srcIndex],
        srcLess: srcRoot + '/**/*.less',
        srcTs: srcRoot + '/**/*.ts',

        build: buildRoot,
        builtIndex: builtIndex,
        builtHtml: [buildRoot + '/**/*.html', '!' + builtIndex],
        builtCss: buildRoot + '/**/*.css',
        builtJs: buildRoot + '/**/*.js'
    };
})();


// -------------------- build --------------------
var batch = require('gulp-batch');
var runSequence = require('run-sequence').use(gulp);
var watch = require('gulp-watch');

gulp.task('web:clean', function (done) {
    cache.caches = {};
    del([paths.build], done);
});

gulp.task('web:build', ['web:clean'], function(done) {
    runSequence(['web:compile:templates', 'web:compile:styles', 'web:compile:scripts'], 'web:compile:index', done);
});

gulp.task('web:serve', ['web:build'], function() {
    livereload.listen();

    watch([paths.srcJade], batch(function (events, done) {
        runSequence('web:compile:templates', done);
    }));

    watch([paths.srcLess], batch(function (events, done) {
        runSequence('web:compile:styles', done);
    }));

    watch([paths.srcTs], batch(function (events, done) {
        runSequence('web:compile:scripts', done);
    }));

    watch(
        [paths.srcIndex, paths.builtCss, paths.builtJs],
        { events: ['add', 'unlink'] },
        batch(function (events, done) {
            runSequence('web:compile:index', done);
        })
    );
});


// -------------------- markup --------------------
var jade = require('gulp-jade');

gulp.task('web:compile:templates', function () {
    return gulp
        .src(paths.srcJade)
        .pipe(cache('templates', { optimizeMemory: true }))
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(jade())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.build))
        .pipe(livereload());
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
        .pipe(gulp.dest(paths.build))
        .pipe(livereload());
});


// -------------------- scripts -------------------
var ts = require('gulp-typescript');

var tsProject = ts.createProject({
    declarationFiles: false,
    noExternalResolve: true,
    noImplicitAny: true,
    target: 'ES5',
    sortOutput: true
});

gulp.task('web:compile:scripts', function () {
    return gulp
        .src(paths.srcTs)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject))
        .js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.build))
        .pipe(livereload());
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
        .pipe(sourcemaps.init())
        .pipe(inject(gulp.src(bowerFiles(), { read: false }), { name: 'bower' }))
        //.pipe(inject(, { name: 'head' }))
        .pipe(inject(es.merge(styles, scripts)))
        .pipe(jade())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.build))
        .pipe(livereload());
});
