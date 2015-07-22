var gulp = require('gulp');
var gutil = require('gulp-util');
var shell = require('gulp-shell');

gulp.task('update', function () {
    var bower = require(path.join(process.cwd(), 'bower.json'));
    var npm = require(path.join(process.cwd(), 'package.json'));

    var dependencies = [].concat(
        Object.keys(bower.dependencies),
        Object.keys(bower.devDependencies),
        Object.keys(npm.dependencies),
        Object.keys(npm.devDependencies)
    );
    var command = 'tsd install ' + dependencies.join(' ') + ' -ros';

    gutil.log('> ' + command);

    return gulp.src('')
        .pipe(shell(command))
        .on('error', gutil.log)
        .on('end', gutil.log('Required d.ts files have been installed.'));
});
