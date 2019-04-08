'use strict';

const config = {
  syntaxSass: 'scss',
  path: {
    devRoot: 'dev',
    prodRoot: 'dist'
  }
};

const autoprefixer = require('gulp-autoprefixer'),
  babel = require('gulp-babel'),
  browserSync = require('browser-sync'),
  cleanCSS = require('gulp-clean-css'),
  concat = require('gulp-concat'),
  del = require('del'),
  fileInclude = require('gulp-file-include'),
  gulp = require('gulp'),
  plumber = require('gulp-plumber'),
  rename = require('gulp-rename'),
  replace = require('gulp-replace'),
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  uglify = require('gulp-uglify');

/* -== SASS ==- */
gulp.task('dev_sass', () => {
  return gulp
    .src(`src/styles/main.${config.syntaxSass}`)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass({}))
    .pipe(autoprefixer(['last 15 versions', '> 1%'], { cascade: false }))
    .pipe(sourcemaps.write())
    .pipe(plumber.stop())
    .pipe(gulp.dest(`${config.path.devRoot}/css`))
    .pipe(browserSync.stream());
});
gulp.task('prod_sass', () => {
  return gulp
    .src(`src/styles/main.${config.syntaxSass}`)
    .pipe(sass())
    .pipe(autoprefixer(['last 15 versions', '> 1%'], { cascade: false }))
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(`${config.path.prodRoot}/css`));
});

/* -== JavaScript ==- */
gulp.task('dev_scripts', () => {
  return gulp
    .src([`src/js/libs.js`, `src/js/common.js`])
    .pipe(plumber())
    .pipe(
      fileInclude({
        prefix: '@@',
        basepath: '@file'
      })
    )
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('scripts.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(`${config.path.devRoot}/js`))
    .pipe(browserSync.stream());
});
gulp.task('prod_scripts', () => {
  return gulp
    .src([`src/js/libs.js`, `src/js/common.js`])
    .pipe(
      fileInclude({
        prefix: '@@',
        basepath: '@file'
      })
    )
    .pipe(babel())
    .pipe(uglify())
    .pipe(concat('scripts.min.js'))
    .pipe(gulp.dest(`dist/js`));
});

/* -== HTML ==- */
gulp.task('dev_html', () => {
  return gulp
    .src('src/pages/*.html')
    .pipe(
      fileInclude({
        prefix: '@@',
        basepath: '@file'
      })
    )
    .pipe(replace('../images', './images'))
    .pipe(gulp.dest('dev'))
    .pipe(browserSync.stream());
});
gulp.task('prod_html', () => {
  return gulp
    .src('src/pages/*.html')
    .pipe(
      fileInclude({
        prefix: '@@',
        basepath: '@file'
      })
    )
    .pipe(replace('../images', './images'))
    .pipe(replace('main.css', 'main.min.css'))
    .pipe(replace('scripts.js', 'scripts.min.js'))
    .pipe(gulp.dest('dist'));
});

/* -== Images ==- */
gulp.task('images', () => {
  return gulp.src('src/images/**/*').pipe(gulp.dest('dist/images'));
});

/* -== Clean dist folder==- */
gulp.task('clean', async () => {
  return del.sync('dist');
});

/* -== Browsersync==- */
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: ['./dev', './src']
    },
    notify: false
  });
});

/* -== Build production ==- */
gulp.task('build', gulp.series('clean', 'prod_html', 'prod_sass', 'prod_scripts', 'images'));

gulp.task(
  'default',
  gulp.parallel('dev_html', 'dev_sass', 'dev_scripts', 'browser-sync', function() {
    // html
    gulp.watch(`src/pages/**/*.html`, gulp.series('dev_html'));
    // styles
    gulp.watch(`src/styles/*.${config.syntaxSass}`, gulp.series('dev_sass'));
    // scripts
    gulp.watch(`src/js/**/*.js`, gulp.series('dev_scripts'));
  })
);
