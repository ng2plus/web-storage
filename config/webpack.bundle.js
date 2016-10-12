const path = require('path');

/**
 * Webpack Plugins
 */
const webpack = require('webpack');
const ForkCheckerPlugin = require('awesome-typescript-loader').ForkCheckerPlugin;
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');

module.exports = {
  entry: {
    'bundle.umd': './src/index.ts',
    'bundle.umd.min': './src/index.ts'
  },

  /**
   * Developer tool to enhance debugging
   *
   * @see http://webpack.github.io/docs/configuration.html#devtool
   * @see https://github.com/webpack/docs/wiki/build-performance#sourcemaps
   */
  devtool: 'source-map',

  resolve: {
    extensions: ['.ts', '.js'],
    // An array of directory names to be resolved to the current directory
    modules: [
      path.resolve('src')
    ],
  },

  externals: [
    /@angular/,
    /rxjs/
  ],

  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'awesome-typescript-loader',
        exclude: [
          /\.(spec|e2e)\.ts$/
        ]
      },
    ]
  },

  /**
   * Options affecting the output of the compilation.
   *
   * @see http://webpack.github.io/docs/configuration.html#output
   */
  output: {

    /**
     * The output directory as absolute path (required).
     *
     * @see http://webpack.github.io/docs/configuration.html#output-path
     */
    path: path.resolve('dist'),

    /**
     * Specifies the name of each output file on disk.
     * IMPORTANT: You must not specify an absolute path here!
     *
     * @see http://webpack.github.io/docs/configuration.html#output-filename
     */
    filename: '[name].js',

    /**
     * Specifies which format to export the library
     *
     * @see https://webpack.github.io/docs/configuration.html#output-librarytarget
     */
    libraryTarget: 'umd'
  },

  /**
   * Add additional plugins to the compiler.
   *
   * @see http://webpack.github.io/docs/configuration.html#plugins
   */
  plugins: [

    /**
     * Plugin: UglifyJsPlugin
     * Description: Minimize all JavaScript output of chunks.
     * Loaders are switched into minimizing mode.
     *
     * @see https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
     */
    // NOTE: To debug prod builds uncomment //debug lines and comment //prod lines
    new UglifyJsPlugin({
      minimize: true,
      beautify: false, //prod
      mangle: {screw_ie8: true, keep_fnames: true}, //prod
      compress: {screw_ie8: true}, //prod
      comments: false, //prod
      include: /\.min\.js/
    }),

    /**
     * Plugin: ForkCheckerPlugin
     * Description: Do type checking in a separate process, so webpack don't need to wait.
     *
     * @see https://github.com/s-panferov/awesome-typescript-loader#forkchecker-boolean-defaultfalse
     */
    new ForkCheckerPlugin(),

    new webpack.LoaderOptionsPlugin({
      options: {
        context: __dirname,
        /**
         * Static analysis linter for TypeScript advanced options configuration
         * Description: An extensible linter for the TypeScript language.
         *
         * @see https://github.com/wbuchwalter/tslint-loader
         */
        tslint: {
          emitErrors: true,
          failOnHint: true,
          resourcePath: 'src'
        }
      },

      /**
       * Switch loaders to debug mode.
       *
       * @see http://webpack.github.io/docs/configuration.html#debug
       */
      debug: false,
    }),

  ],

  /**
   * Include polyfills or mocks for various node stuff
   * Description: Node configuration
   *
   * @see https://webpack.github.io/docs/configuration.html#node
   */
  node: {
    global: true,
    crypto: 'empty',
    process: false,
    module: false,
    clearImmediate: false,
    setImmediate: false
  }

};