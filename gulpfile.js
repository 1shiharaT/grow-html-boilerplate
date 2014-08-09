'use strict';

// load plugins
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({ camelize: true });
var del = require('del');
var psi = require('psi');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var bourbon = require('node-bourbon');
var neat = require('node-neat').includePaths;

// Lint JavaScript
gulp.task('jshint', function () {
	return gulp.src('app/assets/js/**/*.js')
		.pipe(reload({stream: true, once: true}))
		.pipe(plugins.jshint())
		.pipe(plugins.jshint.reporter('jshint-stylish'))
		.pipe(plugins.if(!browserSync.active, plugins.jshint.reporter('fail')));
});

// Copy All Files At The Root Level (app)
gulp.task('copy', function () {
	return gulp.src([
		'app/*',
		'!app/*.html',
		'node_modules/apache-server-configs/dist/.htaccess'
	], {
		dot: true
	}).pipe(gulp.dest('dist'))
		.pipe(plugins.size({title: 'copy'}));
});

// styles
gulp.task('styles', function() {
	return gulp.src('app/assets/scss/main.scss')
	.pipe(plugins.plumber())
	.pipe(plugins.sass({
		includePaths: ['styles'].concat(neat)
	}))
	.pipe(plugins.autoprefixer('last 2 versions', 'ie 9', 'ios 6', 'android 4'))
	.pipe(gulp.dest('app/assets/css'))
	.pipe(plugins.cssshrink())
	.pipe(plugins.rename({ suffix: '.min' }))
	.pipe(gulp.dest('dist/assets/css'))
	.pipe(reload({stream:true}))
	.pipe(plugins.notify({ message: 'Styles task complete' }));
});

// Vendor Plugin Scripts
gulp.task('plugins', function() {
	return gulp.src(['app/assets/js/_*.js', 'assets/js/bootstrap/*.js'])
	.pipe(plugins.plumber())
	.pipe(plugins.concat('scripts.js'))
	.pipe(gulp.dest('dist/assets/js/'))
	.pipe(plugins.rename({ suffix: '.min' }))
	.pipe(plugins.uglify())
	.pipe(gulp.dest('dist/assets/js'))
	.pipe(plugins.notify({ message: 'Scripts task complete' }))
	.pipe(reload( {stream:true} ));
});

// task "javascript"
gulp.task('scripts', function() {
	return gulp.src(['app/assets/js/_*.js', '!assets/js/scripts.js'])
	.pipe(plugins.plumber())
	.pipe(plugins.jshint('.jshintrc'))
	.pipe(plugins.jshint.reporter('default'))
	.pipe(plugins.concat('scripts.js'))
	.pipe(gulp.dest('dist/assets/js'))
	.pipe(plugins.rename({ suffix: '.min' }))
	.pipe(plugins.uglify())
	.pipe(gulp.dest('dist/assets/js'))
	.pipe(plugins.notify({ message: 'Scripts task complete' }))
	.pipe(reload( {stream:true} ));
});

// task "images"
gulp.task('images', function() {
	return gulp.src('app/assets/images/**/*')
	.pipe(plugins.plumber())
	.pipe(plugins.cache(plugins.imagemin({ optimizationLevel: 7, progressive: true, interlaced: true })))
	.pipe(gulp.dest('dist/assets/images'))
	.pipe(plugins.notify({ message: 'Images task complete' }))
	.pipe(reload( {stream:true} ));
});

// tash "html"
gulp.task('html', function(){
	return gulp.src('app/**/*.html')
	.pipe(plugins.plumber())
	.pipe(plugins.beml())
	.pipe(plugins.notify({ message: 'HTML task complete' }))
	.pipe(gulp.dest('dist'))
	.pipe(reload( {stream:true} ));
})

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

// Watch Files For Changes & Reload
gulp.task('serve', ['styles','html'], function () {
	browserSync({
		notify: false,
		server: {
			baseDir: ['.tmp', 'app']
		}
	});
	gulp.watch(['app/**/*.html'], ['html', reload]);
	gulp.watch(['app/assets/styles/**/*.{scss,css}'], ['styles', reload]);
	gulp.watch(['app/assets/scripts/**/*.js'], ['jshint']);
	gulp.watch(['app/assets/images/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function () {
	browserSync({
		notify: false,
		server: {
			baseDir: 'dist'
		}
	});
});

// Default task
gulp.task( 'default', ['styles', 'plugins', 'scripts', 'images', 'html', 'copy'] );


// Run PageSpeed Insights
gulp.task('pagespeed', psi.bind(null, {
	url: 'https://example.com',
	strategy: 'mobile'
}));
