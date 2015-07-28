var gulp = require('gulp');
var concat = require('gulp-concat');
var del = require('del');
var filter = require('gulp-filter');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var sourcemaps = require('gulp-sourcemaps');
var tap = require('gulp-tap');
var watch = require('gulp-watch');

var paths = (function() {
    var srcRoot = './src/web/public';
    var buildRoot = './build/release/web/public';

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
        builtHtml: buildRoot + '/templates.js',
        builtCss: buildRoot + '/styles.css',
        builtJs: buildRoot + '/scripts.js',
        builtLibraryCss: buildRoot + '/libraries.css',
        builtLibraryJs: buildRoot + '/libraries.js'
    };
})();


// -------------------- build --------------------
var runSequence = require('run-sequence').use(gulp);

gulp.task('web:clean', function (done) {
    del([paths.build], done);
});

gulp.task('web:build', ['web:clean'], function(done) {
    runSequence(['web:compile:templates', 'web:compile:styles', 'web:compile:scripts'], 'web:compile:index', done);
});


// -------------------- markup --------------------
var angularTemplateCache = require('gulp-angular-templatecache');
var jade = require('gulp-jade');

gulp.task('web:compile:templates', function () {
    return gulp
        .src(paths.srcJade)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(jade())
        .pipe(angularTemplateCache('templates.js', { standalone: true }))
        .pipe(rev())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.build));
});


// -------------------- styles --------------------
var autoprefixer = require('autoprefixer-core');
var cssmin = require('gulp-cssmin');
var less = require('gulp-less');
var postCss = require('gulp-postcss');

gulp.task('web:compile:styles', function () {
    return gulp
        .src(paths.srcLess)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(postCss([ autoprefixer({ browsers: ['> 2%'] }) ]))
        .pipe(concat('styles.css'))
        .pipe(cssmin())
        .pipe(rev())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.build));
});


// -------------------- scripts -------------------
var ts = require('gulp-typescript');
var uglify = require('gulp-uglify');

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
        .pipe(concat('scripts.js'))
        .pipe(uglify())
        .pipe(rev())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.build));
});


// -------------------- bower --------------------
gulp.task('web:compile:libraries', function () {
    var filterCss = filter('**/*.css', { restore: true });
    var filterJs = filter('**/*.js', { restore: true });

    return gulp
        .src(bowerFiles())
        .pipe(filterJs)
        .pipe(concat(paths.builtLibraryJs, { newLine: ';' }))
        .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest(paths.build))
        .pipe(filterJs.restore)
        .pipe(filterCss)
        .pipe(concat(paths.builtLibraryCss))
        .pipe(cssmin())
        .pipe(rev())
        .pipe(gulp.dest(paths.build));
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
        .pipe(gulp.dest(paths.build));
});
