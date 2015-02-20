var gulp = require('gulp');

var plugins = require('gulp-load-plugins');
var browserify = require('browserify');
var reactify = require('reactify');
var watchify = require('watchify');
var vinyl = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');
var gutil = require('gulp-util');
var gulpif = require('gulp-if');
var notify = require('gulp-notify');
var browserSync = require('browser-sync');
var reload      = browserSync.reload;
var bower       = require('gulp-bower');
var sass = require('gulp-ruby-sass');
var clean = require('gulp-clean');

var path = {
    HTML: 'app/index.html',
    JSON: './app/json/**/*.json',
    ALL : ['app/scripts/*.js', 'app/scripts/**/*.js', 'app/index.html'],
    js: ['app/scripts/*.js', 'app/scripts/**/*.js'],
    STYLES: './app/styles/**/*.scss',
    MINIFIED_OUT: 'build.js',
    DEST_SRC: 'dist/src',
    DEST_BUILD: 'dist/build',
    DEST: 'dist',
    MAIN_ENTRY: './app/scripts/app.js',
    CSS_ENTRY: './app/styles/styles.scss',
    VENDOR_OUT: 'vendor.js',
    DEPS: ['react','lodash','superagent'],
    BOWER_DIR: './bower_components'
};


gulp.task('copy', function(){
    gulp.src(path.HTML)
        .pipe(gulp.dest(path.DEST));
    gulp.src(path.JSON)
        .pipe(gulp.dest(path.DEST+'/json'));
    gulp.src(path.BOWER_DIR + '/fontawesome/fonts/**.*')
            .pipe(gulp.dest(path.DEST_BUILD+'/fonts'));

});


var browserifyTask = function(options) {
    var appBundler = browserify({
        entries: [path.MAIN_ENTRY],
        transform: [reactify],
        debug: options.development,
        cache: {}, packageCache: {}, fullPaths: options.development
    });

    (options.development ? path.DEPS : []).forEach(function (dep) {
        appBundler.external(dep);
    });

    var rebundle = function() {
        var start = Date.now();
        appBundler.bundle()
            .on('error', gutil.log)
            .pipe(vinyl(path.MINIFIED_OUT))
            .pipe(gulpif(!options.development, streamify(uglify())))
            .pipe(gulp.dest(path.DEST_BUILD))
            .pipe(gulpif(options.development, reload({stream:true})))
            .pipe(notify(function(){
                return "App Bundle built";
            }));
    }

    if(options.development) {
        appBundler = watchify(appBundler);
        appBundler.on('update', rebundle);
    }
    rebundle();
    if(options.development) {
        var vendorsBundle = browserify({
            debug: true,
            require: path.DEPS
        });
        vendorsBundle.bundle()
            .on('error', gutil.log)
            .pipe(vinyl(path.VENDOR_OUT))
            .pipe(gulpif(!options.development, streamify(uglify())))
            .pipe(gulp.dest(path.DEST_BUILD))
            .pipe(notify('Vendors Built.'));
    }
};


var cssTask = function(options) {
    var run = function() {
        return sass(path.CSS_ENTRY, {
                        style: 'compressed',
                        loadPath: [
                            './app/styles',
                            path.BOWER_DIR + '/bootstrap-sass-official/assets/stylesheets',
                            path.BOWER_DIR + '/fontawesome/scss',
                        ]
                    })
                .on('error',function(error){ notify("Error: " + error.message)})
                .pipe(gulp.dest(path.DEST_BUILD+'/styles'))
                .pipe(gulpif(options.development, reload({stream:true})))
                .pipe(notify('CSS Built'));
    }
    run();
    gulp.watch(path.STYLES, run);
};

gulp.task('browser-sync', function(){
    browserSync({
        server: {
            baseDir: './dist'
        }
    });
});


gulp.task('build', function(){
    browserifyTask({
        development: true
    });

    cssTask({
        development: true
    })
});

gulp.task('bower', function(){
    return bower()
        .pipe(gulp.dest(path.BOWER_DIR));
});

gulp.task('clean', function(){
    return gulp.src(path.DEST, {read: false})
        .pipe(clean())
});

gulp.task('default', ['bower','copy','browser-sync','build']);