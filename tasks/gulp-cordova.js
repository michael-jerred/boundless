var gulp = require('gulp');
var path = require('path');
var del = require('del');
var npmPackage = require('./package.json');
var cordova = require("cordova-lib").cordova;

var appId = '';
var appName = 'boundless';
var cordovaBuildDir = '.build/cordova';
var cordovaSrcDir = 'src/cordova';

var plugins = ['org.apache.cordova.file'];
var cordovaPlatforms = ['android'];


var platform_dirs = [];  // List of subdirs with platform files under node_modules
for (p in cordova_lib.cordova_platforms) {
    var pname = 'cordova-' + p;
    if (npmPackage.dependencies[pname]) {
        platforms.push(pname);
        platform_dirs.push(path.join(__dirname, 'node_modules', pname));
        // TODO: Check if those dirs exist and if not ask the user to run "npm install"
    }
}



gulp.task('cordova:clean', function(callback) {
    del([cordovaBuildDir], callback);
});

gulp.task('cordova:run', function() {

});

gulp.task('cordova:create', ['cordova:clean'], function(callback) {

    var srcDir = path.join(__dirname, 'src');
    var config = {
        lib: {
            www: {
                url: srcDir,
                link: true
            }
        }
    };

    cordova.create(cordovaBuildDir, appId, appName, config, callback);
});

gulp.task('cordova:build', ['cordova:clean'], function(callback) {
    cordova.build({
        platforms: cordovaPlatforms,
        options: []
    }, callback);
});