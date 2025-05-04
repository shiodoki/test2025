const gulp = require("gulp")
const notify = require("gulp-notify")
const plumber = require("gulp-plumber")
const sass = require("gulp-sass")(require("sass")) // ← Dart Sass を明示的に使う
const pug = require("gulp-pug")
const postcss = require("gulp-postcss")
const autoprefixer = require("autoprefixer")
const uglify = require("gulp-uglify")
const browserSync = require("browser-sync")

//setting : paths
const paths = {
  root: "./dist/",
  pug: "./src/pug/**/*.pug",
  html: "./dist/",
  cssSrc: "./src/scss/main.scss",
  cssDist: "./dist/css/",
  jsSrc: "./src/js/**/*.js",
  jsDist: "./dist/js/",
}

//gulpコマンドの省略
const { watch, series, task, src, dest, parallel } = require("gulp")

//Sass
task("sass", function () {
  return src(paths.cssSrc)
    .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
    .pipe(
      sass({
        outputStyle: "expanded", // Minifyするなら'compressed'
      })
    )
    .pipe(
      postcss([
        autoprefixer({
          overrideBrowserslist: ["ie >= 11"],
          grid: true,
        }),
      ])
    )
    .pipe(dest(paths.cssDist))
})

//Pug
task("pug", function () {
  return src([paths.pug, "!./src/pug/layout.pug", "!./src/pug/**/_*.pug"])
    .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
    .pipe(
      pug({
        pretty: true,
        basedir: "./src/pug",
      })
    )
    .pipe(dest(paths.html)) // 修正後は paths.html が dist/ になる
})

//JS Compress
task("js", function () {
  return src(paths.jsSrc).pipe(plumber()).pipe(uglify()).pipe(dest(paths.jsDist))
})

// browser-sync
task("browser-sync", () => {
  return browserSync.init({
    server: {
      baseDir: paths.root,
    },
    port: 8080,
    reloadOnRestart: true,
  })
})

// browser-sync reload
task("reload", (done) => {
  browserSync.reload()
  done()
})

//watch
task("watch", (done) => {
  watch([paths.cssSrc], series("sass", "reload"))
  watch([paths.jsSrc], series("js", "reload"))
  watch([paths.pug], series("pug", "reload"))
  done()
})
task("default", parallel("watch", "browser-sync"))
