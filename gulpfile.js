/* Configuración de un Servidor web con browser-sync
 * y tareas de compilacion
 */
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var header = require('gulp-header');
var rename = require('gulp-rename');
//var imagemin = require('gulp-imagemin'); // no se puede eliminar fácilmente 
//para eliminar archivos con nombres demasiados largos
//node_modules>subst z: .   //crear una unidad virtual
//node_modules>subst /d z:  //quitar la unidad virtual
var del = require('del');
var jshint = require('gulp-jshint');
var pkg = require('./package.json');
var browserSync = require('browser-sync'),
    reload = browserSync.reload;


var config = {
    filename: 'home',
    src: ['./src/app/*.js', './src/app/**/*.js'],
    html: ['./src/app/views/*.html', './src/app/views/**/*.html'],
    index: ['src/index.html',],
    css: ['./src/content/*.css', './src/content/**/*.css'],
    images: './src/media/**/*',
    dest: './src/dist',
    umd: {

    },
    banner: ['/**',
        ' * <%= pkg.name %> - <%= pkg.description %>',
        ' * @author <%= pkg.author %>',
        ' * @version v<%= pkg.version %>',
        ' * @link <%= pkg.homepage %>',
        ' * @license <%= pkg.license %>',
        ' */',
        ''
    ].join('\n')
};

// ////////////////////////////////////////////////
// Browser-Sync Tasks
// 
// // /////////////////////////////////////////////
gulp.task('serve-browser-sync', function () {
    browserSync({
        port: 9001,
        host: '127.0.0.1',
        server: {
            baseDir: "src"
        },
        https: {
            key: "custom.key",
            cert: "custom.crt"
        },
        browser: ["firefox"], // , "chrome"
        uiquitar: { //el admin UI de browser-sync server
            port: 3001
        },
        ui: false,
        notify: false
    });

    // watch reload change
    gulp.watch([
        './src/app/*.*',
        './src/content/*.*',
        './src/media/*.*',
        './src/*.*'
    ]).on('change', reload);

});

// ////////////////////////////////////////////////
// JS Tasks
// 
// // /////////////////////////////////////////////

// revisa si los codigos JS cumple el formato JSHint
gulp.task('jshint', function () {
    return gulp.src(config.src)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

// Une todos los archivos .js en uno solo sin comprimir
gulp.task('js', ['jshint'], function () {
    console.log("js");
    return gulp.src(config.src)
        .pipe(concat(config.filename + '.js'))
        .pipe(uglify({
            mangle: false,
            output: { beautify: true },
            compress: false
        }))
        .pipe(header(config.banner, { pkg: pkg }))
        .pipe(gulp.dest(config.dest));

});

// Une todos los archivos .js en uno solo comprimido
gulp.task('js-min', ['js'], function () {
    console.log("js-min");
    return gulp.src(config.src)
        .pipe(concat(config.filename))
        .pipe(uglify({ mangle: false }))
        .pipe(header(config.banner, { pkg: pkg }))
        .pipe(rename(function (path) {
            path.extname = '.min.js';
        }))
        .pipe(gulp.dest(config.dest));
    //.pipe(reload({ stream: true }));
});

// ////////////////////////////////////////////////
// Styles Tasks
// Une todos los archivos .css en uno solo
// // /////////////////////////////////////////////
gulp.task('styles', function () {
    console.log("styles");
    return gulp.src(config.css)
        .pipe(concat(config.filename + '.css'))
        .pipe(header(config.banner, { pkg: pkg }))
        .pipe(gulp.dest(config.dest));
});

// ////////////////////////////////////////////////
// Html Tasks
// 
// // /////////////////////////////////////////////

// Compile the htmls of views folder
gulp.task('html', function () {
    console.log("html");
    return gulp.src(config.html)
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(config.dest + '/views'));
});

// Compile inde.xhtml file
gulp.task('indexhtml', function () { //TODO
    console.log("indexhtml");
    return gulp.src(config.index)
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(config.dest));
});

// ////////////////////////////////////////////////
// Images Tasks
// Copy all static images
// // /////////////////////////////////////////////
gulp.task('images', function () {
    return gulp.src(config.images)
        // Pass in options to the task
        .pipe(imagemin({ optimizationLevel: 5 }))
        .pipe(gulp.dest(config.dest + '/media'));
});

// ////////////////////////////////////////////////
// Clean dist Tasks
// Task for delete folder dist
// // /////////////////////////////////////////////
gulp.task('clean', function () {
    return del(config.dest);
});

// ////////////////////////////////////////////////
// Watch Task
// // /////////////////////////////////////////////
gulp.task('watch', function () {
    //gulp.watch(config.index, ['indexhtml']);
    gulp.watch(config.css, ['styles']);
    gulp.watch(config.src, ['js-min']);
    gulp.watch(config.html, ['html']);
    //gulp.watch(config.images, ['images']);
});

// ////////////////////////////////////////////////
// Scripts
// // /////////////////////////////////////////////
gulp.task('build', ['js-min', 'styles', 'html']);//colocar otras task
gulp.task('default', ['build', 'serve-browser-sync', 'watch']);//colocar otras task
