const path = require('path');
const gulp = require('gulp');
const rimraf = require('rimraf');
const babel = require('gulp-babel');
const through2 = require('through2');

const cwd = process.cwd();
const libDir = path.join(cwd, 'lib');

function compileAssets() {
  return gulp.src(['react/**/*.@(jpg|png|svg|scss|less|html|ico)']).pipe(gulp.dest(libDir));
}

function compileFile() {
  const source = [
    'react/**/*.js',
    'react/**/*.jsx',
  ];
  return babelify(gulp.src(source));
}

function compileDir(dir) {
  babelify(gulp.src([
    `react/${dir}/**/*.js`,
    `react/${dir}/**/*.jsx`,
  ]), dir);
}

function compile() {
  rimraf.sync(libDir);
  compileAssets();
  compileFile();
}

function copyTo(dir) {
  rimraf.sync(dir);
  gulp.src('lib/**/*')
    .pipe(gulp.dest(dir));
}

function getBabelCommonConfig() {
  const plugins = [
    require.resolve('babel-plugin-syntax-dynamic-import'),
    require.resolve('babel-plugin-transform-decorators-legacy'),
    require.resolve('babel-plugin-transform-es3-member-expression-literals'),
    require.resolve('babel-plugin-transform-es3-property-literals'),
    require.resolve('babel-plugin-transform-object-assign'),
    require.resolve('babel-plugin-transform-class-properties'),
    require.resolve('babel-plugin-transform-object-rest-spread'),
    [require.resolve('babel-plugin-transform-runtime'), {
      polyfill: false,
    }],
    [
      require.resolve('babel-plugin-import'),
      [
        {
          libraryName: 'choerodon-ui',
          style: true,
        },
        {
          libraryName: 'choerodon-ui/pro',
          style: true,
        },
      ],
    ],
    require.resolve('babel-plugin-lodash'),
    ['try-import', {
      tryImport: 'C7NTryImport',
      hasModule: 'C7NHasModule',
    }],
  ];
  return {
    presets: [
      require.resolve('babel-preset-react'),
      require.resolve('babel-preset-es2015'),
      require.resolve('babel-preset-stage-1'),
    ],
    plugins,
  };
}

function babelify(js, dir = '') {
  const babelConfig = getBabelCommonConfig();
  const stream = js.pipe(babel(babelConfig));
  return stream
    .pipe(through2.obj(function (file, encoding, next) {
      const matches = file.path.match(/(routes|dashboard|guide|entry|entrywithoutsider)\.nunjucks\.(js|jsx)/);
      if (matches) {
        const content = file.contents.toString(encoding);
        file.contents = Buffer.from(content
          .replace(`'{{ ${matches[1]} }}'`, `{{ ${matches[1]} }}`)
          .replace('\'{{ home }}\'', '{{ home }}')
          .replace('\'{{ master }}\'', '{{ master }}'));
      }
      this.push(file);
      next();
    }))
    .pipe(gulp.dest(path.join(libDir, dir)));
}

gulp.task('compile', () => {
  compile();
});
gulp.task('copy', () => {
  copyTo('/Users/binjiechen/base-service-pro/node_modules/@choerodon/master-pro/lib');
});
