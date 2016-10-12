/**
 * Webpack Plugins
 */
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');

/**
 * Webpack configuration
 *
 * @see http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = {

  /**
   * Source map for Karma from the help of karma-sourcemap-loader &  karma-webpack
   *
   * Do not change, leave as is or it wont work.
   * @see https://github.com/webpack/karma-webpack#source-maps
   */
  devtool: 'inline-source-map',

  /**
   * Options affecting the resolving of modules.
   *
   * @see http://webpack.github.io/docs/configuration.html#resolve
   */
  resolve: {

    /**
     * An array of extensions that should be used to resolve modules.
     *
     * @see http://webpack.github.io/docs/configuration.html#resolve-extensions
     */
    extensions: ['.ts', '.js'] // configuration.resolve.extensions[0] should not be empty

  },

  /**
   * Options affecting the normal modules.
   *
   * @see http://webpack.github.io/docs/configuration.html#module
   */
  module: {
    /**
     * An array of automatically applied loaders.
     *
     * IMPORTANT: The loaders here are resolved relative to the resource which they are applied to.
     * This means they are not resolved relative to the configuration file.
     *
     * @see http://webpack.github.io/docs/configuration.html#module-loaders
     */
    rules: [
      /**
       * Typescript loader support for .ts and Angular 2 async routes via .async.ts
       *
       * @see https://github.com/s-panferov/awesome-typescript-loader
       */
      {
        test: /\.ts$/,
        use: 'awesome-typescript-loader',
        options: {
          compilerOptions: {
            // Remove TypeScript helpers to be injected
            // below by DefinePlugin
            removeComments: true

          }
        },
        exclude: [/\.e2e\.ts$/]
      }
    ]
  },

  /**
   * Add additional plugins to the compiler.
   *
   * @see http://webpack.github.io/docs/configuration.html#plugins
   */
  plugins: [
    new LoaderOptionsPlugin({
      options: {
        /**
         * Static analysis linter for TypeScript advanced options configuration
         * Description: An extensible linter for the TypeScript language.
         *
         * @see https://github.com/wbuchwalter/tslint-loader
         */
        tslint: {
          emitErrors: false,
          failOnHint: false,
          resourcePath: 'src'
        }
      }
    })
  ],

  /**
   * Include polyfills or mocks for various node stuff
   * Description: Node configuration
   *
   * @see https://webpack.github.io/docs/configuration.html#node
   */
  node: {
    global: true,
    process: false,
    crypto: false,
    module: false,
    clearImmediate: false,
    setImmediate: false
  }

};