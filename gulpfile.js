/* eslint-disable no-console */
const _ = require('underscore');
const babel = require('rollup-plugin-babel');
const Erik = require('erik');
const gulp = require('gulp');
const MultiBuild = require('multibuild');
const commonjs = require('rollup-plugin-commonjs');
const multiEntry = require('rollup-plugin-multi-entry');
const nodeResolve = require('rollup-plugin-node-resolve');
const path = require('path');

const SHOULD_WATCH = (process.env.WATCH === 'true');
const SHOULD_BUILD_TESTS = (process.env.npm_lifecycle_event === 'test');

const SRC_FILES = 'src/**/*';
const TEST_FILES = ['spec/**/*.js', '!spec/tests.js'];
const pkg = require('./package.json');

const build = new MultiBuild({
  gulp,
  targets: _.compact([
    'index',
    SHOULD_BUILD_TESTS && 'tests'
  ]),
  entry: (target) => (target === 'tests') ? TEST_FILES : `src/${target}.js`,
  rollupOptions: (target) => {
    return {
      external: ['backbone', 'underscore'],
      globals: (target === 'tests') ? {
        backbone: 'Backbone',
        underscore: '_'
      } : {},
      plugins: _.compact([
        (target === 'tests') && multiEntry({exports: false}),
        babel({
          presets: [
            [
              'es2015',
              {
                modules: false
              }
            ]
          ],
          plugins: [
            'external-helpers'
          ],
          exclude: ['node_modules/**']
        }),
        nodeResolve(),
        commonjs({ include: ['node_modules/**'] })
      ]),
      format: (target === 'tests') ? 'iife' : 'es'
    };
  },
  output: (target, input) => {
    // Write `${destDir}/${target}.js`.
    var destDir = target === 'tests' ? 'spec' : path.dirname(pkg.main);
    return input.pipe(gulp.dest(destDir));
  }
});

new Erik({
  gulp,
  watch: SHOULD_WATCH,
  taskDependencies: [
    MultiBuild.task('tests')
  ],
  remoteDependencies: [
    'https://cdn.jsdelivr.net/g/jquery@2.1.4,underscorejs@1.8.3,backbonejs@1.1.2'
  ],
  localDependencies: [
    'spec/tests.js'
  ],
  bundlePath: 'spec'
});

gulp.on('task_start', function(e) {
  if (e.task === 'erik') {
    if (SHOULD_WATCH) {
      console.log('Watching…');
      gulp.watch(SRC_FILES, (file) => build.changed(file.path));
      gulp.watch(TEST_FILES, (file) => build.changed(file.path));
    }
  }
});

gulp.task('default', function(cb) {
  build.runAll(() => {
    // It's ok to call the callback before starting watching, I guess that Gulp exits when
    // Node exits usually (i.e. when JS is done executing) rather than immediately when tasks finish.
    cb();

    if (SHOULD_WATCH) {
      console.log('Watching…');
      gulp.watch(SRC_FILES, (file) => build.changed(file.path));
    }
  });
});
