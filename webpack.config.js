// Helper: root(), and rootDir() are defined at the bottom
var path = require('path');
var webpack = require('webpack');

// Webpack Plugins
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var autoprefixer = require('autoprefixer');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

/**
 * Env
 * Get npm lifecycle event to identify the environment
 */
var ENV = process.env.npm_lifecycle_event;
var isTest = ENV === 'test' || ENV === 'test-watch';
var isProd = ENV === 'build';

module.exports = function makeWebpackConfig () {
  /**
   * Config
   * Reference: http://webpack.github.io/docs/configuration.html
   * This is the object where all configuration gets set
   */
  var config = {};

  /**
   * Devtool
   * Reference: http://webpack.github.io/docs/configuration.html#devtool
   * Type of sourcemap to use per build type
   */
  if (isTest) {
    config.devtool = 'inline-source-map';
  } else if (isProd) {
    config.devtool = 'source-map';
  } else {
    config.devtool = 'inline-source-map';
  }

  // add debug messages
  config.debug = !isProd || !isTest;

  /**
   * Entry
   * Reference: http://webpack.github.io/docs/configuration.html#entry
   */
  config.entry = isTest ? {} : {
    'vendor': './src/vendor.ts',
    'app': './src/bootstrap.ts' // our angular app
  };

  /**
   * Output
   * Reference: http://webpack.github.io/docs/configuration.html#output
   */
  config.output = isTest ? {} : {
    path: root('dist'),
    publicPath: '/',
    filename: isProd ? 'js/[name].[hash].js' : 'js/[name].js',
    chunkFilename: isProd ? '[id].[hash].chunk.js' : '[id].chunk.js'
  };

  /**
   * Resolve
   * Reference: http://webpack.github.io/docs/configuration.html#resolve
   */
  config.resolve = {
    cache: !isTest,
    root: root(),
    // only discover files that have those extensions
    extensions: [ '', '.ts', '.js', '.json', '.css', '.scss', '.html' ],
    alias: {
      'app': 'src/app',
      'common': 'src/common',
      'jquery': 'jquery/dist/jquery.min.js'
    }
  };

  /**
   * Loaders
   * Reference: http://webpack.github.io/docs/configuration.html#module-loaders
   * List: http://webpack.github.io/docs/list-of-loaders.html
   * This handles most of the magic responsible for converting modules
   */
  config.module = {
    preLoaders: isTest ? [] : [ { test: /\.ts$/, loader: 'tslint' } ],
    loaders: [
      // Support for .ts files.
      {
        test: /\.ts$/,
        loader: 'ts',
        query: {
          'ignoreDiagnostics': [
            2403, // 2403 -> Subsequent variable declarations
            2300, // 2300 -> Duplicate identifier
            2374, // 2374 -> Duplicate number index signature
            2375, // 2375 -> Duplicate string index signature
            2502  // 2502 -> Referenced directly or indirectly
          ]
        },
        exclude: [ isTest ? /\.(e2e)\.ts$/ : /\.(spec|e2e)\.ts$/, /node_modules\/(?!(ng2-.+))/ ]
      },

      // copy those assets to output
      {test: /\.(ttf|eot|svg|woff(2)?).*$/, loader: "file-loader"},

      { test: /\.(png|jpe?g|gif|ico)$/, loader: 'file?name=[path][name].[ext]?[hash]' },

      // Support for *.json files.
      { test: /\.json$/, loader: 'json' },

      // Support for CSS as raw text
      // use 'null' loader in test mode (https://github.com/webpack/null-loader)
      // all css in src/style will be bundled in an external css file
      {
        test: /\.css$/,
        exclude: root('src', 'app'),
        loader: isTest ? 'null' : ExtractTextPlugin.extract('style', 'css')
      },
      // all css required in src/app files will be merged in js files
      { test: /\.css$/, include: root('src', 'app'), loader: 'raw' },

      // support for .scss files
      // use 'null' loader in test mode (https://github.com/webpack/null-loader)
      // all css in src/style will be bundled in an external css file
      {
        test: /\.scss$/,
        exclude: root('src', 'app'),
        loader: isTest ? 'null' : ExtractTextPlugin.extract('style', 'raw!postcss!sass')
      },
      // all css required in src/app files will be merged in js files
      { test: /\.scss$/, exclude: root('src', 'style'), loader: 'raw!postcss!sass' },

      // support for .html as raw text
      // todo: change the loader to something that adds a hash to images
      { test: /\.html$/, loader: 'raw' }
    ],
    postLoaders: [],
    noParse: [ /.+zone\.js\/dist\/.+/, /.+angular2\/bundles\/.+/, /angular2-polyfills\.js/ ]
  };

  if (isTest) {
    // instrument only testing sources with Istanbul, covers js compiled files for now :-/
    config.module.postLoaders.push({
      test: /\.(js|ts)$/,
      include: path.resolve('src'),
      loader: 'istanbul-instrumenter-loader',
      exclude: [ /\.spec\.ts$/, /\.e2e\.ts$/, /node_modules/ ]
    })
  }

  /**
   * Plugins
   * Reference: http://webpack.github.io/docs/configuration.html#plugins
   * List: http://webpack.github.io/docs/list-of-plugins.html
   */
  config.plugins = [
    // Define env variables to help with builds
    // Reference: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
    new webpack.DefinePlugin({
      // Environment helpers
      'process.env': {
        ENV: JSON.stringify(ENV)
      }
    })
  ];

  if (!isTest) {
    config.plugins.push(
      // Generate common chunks if necessary
      // Reference: https://webpack.github.io/docs/code-splitting.html
      // Reference: https://webpack.github.io/docs/list-of-plugins.html#commonschunkplugin
      new CommonsChunkPlugin({
        name: 'vendor',
        filename: isProd ? 'js/[name].[hash].js' : 'js/[name].js',
        minChunks: Infinity
      }),
      new CommonsChunkPlugin({
        name: 'common',
        filename: isProd ? 'js/[name].[hash].js' : 'js/[name].js',
        minChunks: 2,
        chunks: [ 'app', 'vendor' ]
      }),

      // Inject script and link tags into html files
      // Reference: https://github.com/ampedandwired/html-webpack-plugin
      new HtmlWebpackPlugin({
        template: './src/public/index.html',
        inject: 'body',
        chunksSortMode: function compare (a, b) {
          // common always first
          if (a.names[ 0 ] === 'common') {
            return -1;
          }
          // app always last
          if (a.names[ 0 ] === 'app') {
            return 1;
          }
          // vendor before app
          if (a.names[ 0 ] === 'vendor' && b.names[ 0 ] === 'app') {
            return -1;
          } else {
            return 1;
          }
          // a must be equal to b
          return 0;
        }
      }),

      // Extract css files
      // Reference: https://github.com/webpack/extract-text-webpack-plugin
      // Disabled when in test mode or not in build mode
      new ExtractTextPlugin('css/[name].[hash].css')
    );
  }

  // Add build specific plugins
  if (isProd) {
    config.plugins.push(
      // Reference: http://webpack.github.io/docs/list-of-plugins.html#noerrorsplugin
      // Only emit files when there are no errors
      new webpack.NoErrorsPlugin(),

      // Reference: http://webpack.github.io/docs/list-of-plugins.html#dedupeplugin
      // Dedupe modules in the output
      new webpack.optimize.DedupePlugin(),

      // Reference: http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
      // Minify all javascript, switch loaders to minimizing mode
      new webpack.optimize.UglifyJsPlugin({
        // Angular 2 is broken again, disabling mangle until beta 6 that should fix the thing
        // Todo: remove this with beta 6
        mangle: false
      }),

      // Copy assets from the public folder
      // Reference: https://github.com/kevlened/copy-webpack-plugin
      new CopyWebpackPlugin([ {
        from: root('src/public')
      } ])
    );
  }

  /**
   * PostCSS
   * Reference: https://github.com/postcss/autoprefixer-core
   * Add vendor prefixes to your css
   */
  config.postcss = [
    autoprefixer({
      browsers: [ 'last 2 version' ]
    })
  ];

  /**
   * Sass
   * Reference: https://github.com/jtangelder/sass-loader
   * Transforms .scss files to .css
   */
  config.sassLoader = {
    //includePaths: [path.resolve(__dirname, "node_modules/foundation-sites/scss")]
  };

  /**
   * Apply the tslint loader as pre/postLoader
   * Reference: https://github.com/wbuchwalter/tslint-loader
   */
  config.tslint = {
    emitErrors: false,
    failOnHint: false
  };

  /**
   * Dev server configuration
   * Reference: http://webpack.github.io/docs/configuration.html#devserver
   * Reference: http://webpack.github.io/docs/webpack-dev-server.html
   */
  config.devServer = {
    contentBase: './src/public',
    historyApiFallback: true,
    stats: 'minimal' // none (or false), errors-only, minimal, normal (or true) and verbose
  };

  return config;
}();

// Helper functions
function root (args) {
  args = Array.prototype.slice.call(arguments, 0);
  return path.join.apply(path, [ __dirname ].concat(args));
}

function rootNode (args) {
  args = Array.prototype.slice.call(arguments, 0);
  return root.apply(path, [ 'node_modules' ].concat(args));
}
