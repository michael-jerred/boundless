var gulp = require('gulp');
var gutil = require('gulp-util');
var shell = require('gulp-shell');


gulp.task('tsd:update', function () {
    var bower = require('../bower.json');

    var dependencies = [].concat(
        Object.keys(bower.dependencies),
        Object.keys(bower.devDependencies)
    );
    var command = 'tsd install ' + dependencies.join(' ') + ' -ros';

    gutil.log('> ' + command);

    return gulp.src('')
        .pipe(shell(command));
        //.on('error', gutil.log);
});
