var gulp = require('gulp');
var cache = require('gulp-cached');
var concat = require('gulp-concat');
var del = require('del');
var es = require('event-stream');
var liveReload = require('gulp-livereload');
var plumber = require('gulp-plumber');
var remember = require('gulp-remember');
var sourcemaps = require('gulp-sourcemaps');
var tap = require('gulp-tap');

var angularApp = 'main';
var paths = (function() {
    var srcRoot = './src/web/public';
    var buildRoot = './build';

    var srcIndex = srcRoot + '/index.jade';
    var build = buildRoot + '/debug/web/public';
    return {
        tsTypings: './typings/**/*.d.ts',

        srcIndex: srcIndex,
        srcJade: [srcRoot + '/**/*.jade', '!' + srcIndex],
        srcLess: srcRoot + '/**/*.less',
        srcTs: srcRoot + '/**/*.ts',

        buildDebug: build,
        builtHtml: build + '/**/*.html',
        builtCss: build + '/**/*.css',
        builtJs: build + '/**/*.js'
    };
})();

gulp.task('web:clean:debug', function (callback) {
    del([paths.buildDebug], callback);
    cache.caches = {};
});



var batch = require('gulp-batch');
var filter = require('gulp-filter');
var watch = require('gulp-watch');

gulp.task('web:serve', ['web:build:debug'], function() {
    liveReload.listen();

    var isAddOrDelete = function (file) {
        return file.event === 'add' || file.event === 'unlink';
    }

    watch([paths.srcJade], batch(function (events, done) {

        events
            .pipe(filter(isAddOrDelete))
            .pipe();

    }));

    watch([paths.builtHtml], batch(function (events, done) {
        compileTemplates().templates
    }));
});



// -------------------- markup --------------------
var jade = require('gulp-jade');

function compileTemplates() {
    var templates = gulp.src(paths.srcJade)
        .pipe(cache('templates'))
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(jade());

    var withMaps = templates
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.buildDebug));

    return { templates: templates, withMaps: withMaps };
}


// -------------------- styles --------------------
var autoprefixer = require('autoprefixer-core')({ browsers: ['> 2%'] });
var less = require('gulp-less');
var postCss = require('gulp-postcss');

function compileStyles() {
    var styles = gulp.src(paths.srcLess)
        .pipe(cache('styles'))
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(postCss([ autoprefixer ]))
        .pipe(gulp.tap(function(file) {
            file.event
        }));

    var withMaps = styles
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.buildDebug));

    return { styles: styles, withMaps: withMaps };
}


// -------------------- scripts -------------------
var ts = require('gulp-typescript');

var tsProject = ts.createProject({
    declarationFiles: false,
    noExternalResolve: true,
    noImplicitAny: true,
    target: 'ES5',
    sortOutput: true
});

function compileScripts() {
    var scripts = gulp.src([paths.tsTypings, paths.srcTs])
        .pipe(cache('scripts'))
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject))
        .js;

    var withMaps = scripts
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.buildDebug));

    return { scripts: scripts, withMaps: withMaps };
}


// -------------------- inject --------------------
var inject = require('gulp-inject');
var angularFilesort = require('gulp-angular-filesort');
var bowerFiles = require('main-bower-files');

function injectHtml(templates, src) {
    return gulp.src(paths.srcIndex)
        .pipe(inject(templates, { name: 'templates' }));
}

function injectCss(styles, src) {
    return gulp.src(paths.srcIndex)
        .pipe(inject(styles));
}

function injectJs(scripts, src) {
    return gulp.src(paths.srcIndex)
        .pipe(inject(scripts.pipe(angularFilesort())));
}

gulp.task('web:build:debug', ['web:clean:debug'], function() {
    // compile everything
    compileTemplates();
    var styles = compileStyles().styles;
    var scripts = compileScripts().scripts;

    // inject the dependencies into the index
    return gulp.src(paths.srcIndex)
        .pipe(sourcemaps.init())
        .pipe(inject(gulp.src(bowerFiles(), { read: false }), { name: 'bower' }))
        .pipe(inject(es.merge(styles, scripts.pipe(angularFilesort()))))
        .pipe(jade())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.buildDebug));
});
