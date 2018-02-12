const gulp = require('gulp');
const sass = require('gulp-sass');
const babel = require('gulp-babel');

const paths = {
  styles: {
    src: './brick.scss',
    dest: './dist/'
  },
  scripts: {
    src: './brick.js',
    dest: './dist/'
  }
};

function styles() {
    return gulp.src(paths.styles.src)
        .pipe(sass())
        .pipe(gulp.dest(paths.styles.dest));
}

function scripts() {
    return gulp.src(paths.scripts.src)
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest(paths.scripts.dest));
}

function watch() {
    // defaultBuild();
    gulp.watch(paths.styles.src, styles);
    gulp.watch(paths.scripts.src, scripts);
}

const defaultBuild = gulp.parallel(scripts, styles);

gulp.task('build', defaultBuild);
gulp.task('default', defaultBuild);
gulp.task('watch', watch);
