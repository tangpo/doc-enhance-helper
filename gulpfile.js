const { src, dest, series } = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const { ls } = require('shelljs');
const { cd } = require('shelljs');
require('shelljs/global');

function concatJs () {
  return src([
    // './node_modules/@vscode/webview-ui-toolkit/dist/toolkit.js',
    './node_modules/vue/dist/vue.runtime.min.js',
    './node_modules/vue-router/dist/vue-router.min.js',
    'src/lib/highlight/highlight.min.js'
  ])
  .pipe(concat('vendors.js'))
  .pipe(uglify())
  .pipe(dest('assets'));
}

function concatH5Js () {
  return src([
    'src/webview-h5/dist/js/chunk-vendors.*\.js',
    'src/webview-h5/dist/js/app.*\.js',
  ])
  .pipe(concat('appH5.js'))
  .pipe(dest('dist'));
}

function copyWebviewToolkit () {
  return src([
    './node_modules/@vscode/webview-ui-toolkit/dist/toolkit.js'
  ])
  .pipe(uglify())
  .pipe(dest('assets'));
}

function copyHighlightCss () {
  return src([
    'src/lib/highlight/styles/color-brewer.min.css'
  ])
  .pipe(dest('assets'));
}

function copyAppH5Css () {
  return src([
    'src/webview-h5/dist/css/chunk-vendors.*\.css',
    'src/webview-h5/dist/css/app.*\.css',
  ])
  .pipe(concat('appH5.css'))
  .pipe(dest('dist/css'));
}

function copyAppH5Fonts () {
  return src([
    'src/webview-h5/dist/fonts/**'
  ])
  .pipe(dest('dist/fonts'));
}

async function compileH5App () {
  cd('src/webview-h5')
  const ret = exec('npm run build')

  if (ret.code) {
    throw new Error('code not zero')
  }
}

exports.compileH5App = compileH5App

exports.prepare = series(concatJs, copyWebviewToolkit, copyHighlightCss)

exports.default = series(compileH5App, concatH5Js, copyAppH5Css, copyAppH5Fonts)