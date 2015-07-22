var gulp = require('gulp');
var concat = require('gulp-concat');
var del = require('del');
var es = require('event-stream');
var liveReload = require('gulp-livereload');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var tap = require('gulp-tap');
var watch = require('gulp-watch');

var angularApp = 'main';
var paths = (function() {
    var srcRoot = './src/web/public';
    var buildRoot = './build';

    var srcIndex = srcRoot + '/index.jade';
    return {
        tsTypings: './typings/**/*.d.ts',

        srcIndex: srcIndex,
        srcJade: [srcRoot + '/**/*.jade', '!' + srcIndex],
        srcLess: srcRoot + '/**/*.less',
        srcTs: srcRoot + '/**/*.ts',

        buildDebug: buildRoot + '/debug/web/public'
    };
})();

gulp.task('web:clean:debug', function (callback) {
    del([paths.buildDebug], callback);
});

gulp.task('web:serve', ['web:build:debug'], function() {
    liveReload.listen();
    gulp.watch(paths.srcJade, ['web:build:debug:templates']);
    gulp.watch(paths.srcLess, ['web:build:debug:styles']);
    gulp.watch(paths.srcTs, ['web:build:debug:scripts']);
});



// -------------------- markup --------------------
var jade = require('gulp-jade');

function compileTemplates() {
    var templates = gulp.src(paths.srcJade)
        .pipe(watch(paths.srcJade))
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(jade());

    return [templates, templates.pipe(sourcemaps.write('.'))];
}

gulp.task('web:build:debug:templates', function() { return compileTemplates()[0]; });


// -------------------- styles --------------------
var autoprefixer = require('autoprefixer-core')({ browsers: ['> 2%'] });
var less = require('gulp-less');
var postCss = require('gulp-postcss');

function compileStyles() {
    var styles = gulp.src(paths.srcLess)
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(postCss([ autoprefixer ]));

    return [styles, styles.pipe(sourcemaps.write('.'))];
}

gulp.task('web:build:debug:styles', function() { return compileStyles()[0]; });


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
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject))
        .js;

    return [scripts, scripts.pipe(sourcemaps.write('.'))];
}

gulp.task('web:build:debug:scripts', function() { return compileScripts()[0]; });


// -------------------- inject --------------------
var inject = require('gulp-inject');
var angularFilesort = require('gulp-angular-filesort');
var bowerFiles = require('main-bower-files');

gulp.task('web:build:debug', ['web:clean:debug'], function() {

    var templates = compileTemplates();
    var templatesWithMaps = templates.splice(1, 1);

    var styles = compileStyles();
    var stylesWithMaps = styles.splice(1, 1);

    var scripts = compileScripts();
    var scriptsWithMaps = scripts.splice(1, 1);

    var injecting = gulp.src(paths.srcIndex)
        .pipe(jade())
        .pipe(inject(gulp.src(bowerFiles(), { read: false }), { name: 'bower' }))
        .pipe(inject(templates, { name: 'templates' }))
        .pipe(inject(es.merge(styles, scripts.pipe(angularFilesort()))));

    var writing = es.merge(
        templatesWithMaps,
        stylesWithMaps,
        scriptsWithMaps
    )
    .pipe(gulp.dest(paths.buildDebug));

    return es.merge(injecting, writing);
});
