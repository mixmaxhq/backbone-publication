/* jshint node:true */
import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';

var pkg = require('./package.json');

export default {
  entry: 'src/index.js',
  external: ['underscore', 'backbone'],
  plugins: [
    nodeResolve(),
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
    })
  ],
  targets: [
    {
      format: 'es',
      dest: pkg['main']
    }
  ]
};