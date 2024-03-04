const gulp = require('gulp');
const concat = require('gulp-concat-css');
const plumber = require('gulp-plumber');
const del = require('del');
const browserSync = require('browser-sync').create();
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mediaquery = require('postcss-combine-media-query');
const cssnano = require('cssnano');
const htmlMinify = require('html-minifier');
const sass = require('gulp-sass')(require('sass'));

function serve() {
  browserSync.init({
    server: {
      baseDir: './dist'
    }
  });
}

/**
 * перемещение html
 */
function html() {
  const options = {
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    sortClassName: true,
    useShortDoctype: true,
    collapseWhitespace: true,
    minifyCSS: true,
    keepClosingSlash: true
  };
  return gulp.src('src/**/*.html')
    .pipe(plumber())
    .on('data', function (file) {
      const buferFile = Buffer.from(htmlMinify.minify(file.contents.toString(), options))
      return file.contents = buferFile
    })
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.reload({ stream: true }));
}

/**
 * склейка css
 */
function scss() {
  /**
   * массив с плагины для пост ксс
   */
  const plugins = [
    autoprefixer(),
    mediaquery(),
    cssnano()
  ]
  return gulp
    .src('src/**/*.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(concat('style.css'))
    .pipe(postcss(plugins))
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.reload({ stream: true }));
}

/**
 * сборка картинок
 */
function images() {
  return gulp
    .src('images/**/*.{jpg,png,svg,gif,ico,webp,avif}')
    .pipe(gulp.dest('dist/image'))
    .pipe(browserSync.reload({ stream: true }));
}

function fonts() {
  return gulp
    .src('fonts/**/*.{woff,woff2}')
    .pipe(gulp.dest('dist/fonts'))
    .pipe(browserSync.reload({ stream: true }));
}

/**
 * удаляет папаку с сборкой
 */
function clean() {
  return del('dist');
}

/**
 * отслеживает разные пути и присваивает для них задачи на выполнение
 */
function watchFiles() {
  gulp.watch(['src/**/*.html'], html);
  gulp.watch(['src/**/*.scss'], scss);
  gulp.watch(['src/**/*.{jpg,png,svg,gif,ico,webp,avif}'], images);
}

/**
 * выполняет последовательно команды и внутри паралельно
 */
const build = gulp.series(clean, gulp.parallel(html, scss, images, fonts));
const watchapp = gulp.parallel(build, watchFiles, serve);

exports.html = html;
exports.scss = scss;
exports.images = images;
exports.fonts = fonts;
exports.clean = clean;
exports.serve = serve;

exports.build = build;
exports.watchapp = watchapp;
exports.default = watchapp;
