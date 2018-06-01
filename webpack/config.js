const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin')
const globby = require('globby')
const camelCase = require('camelcase')

const projectPath = path.resolve(__dirname, '..')
const contentPath = path.resolve(projectPath, 'webpack')
const staticPath = path.resolve(projectPath, 'static')
const htmlEntryTemplate = path.resolve(projectPath, './webpack/entry-html.pug')
const htmlPublicPath = './'
const htmlEntryOutputPath = path.resolve(projectPath, './build/public', htmlPublicPath)

const webpackPublicPath = 'bundle/'
const webpackEntryOutputPath = path.resolve(projectPath, './build/public', webpackPublicPath)

const contentBase = path.resolve(projectPath, './build/public')

const env = process.env.NODE_ENV
const mode = (env === 'production') ? 'production' : 'development'
const devMode = env !== 'production'

const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

const config = module.exports = {
  projectPath: projectPath,
  contentBase: contentBase,
  static: {
    path: staticPath
  }
}

const entry = {}
const entryFiles = globby.sync(path.resolve(contentPath, 'entry', '*.js'), {
  cwd: __dirname,
  absolute: true,
  nodir: true
})
const plugins = [
  new CleanWebpackPlugin([contentBase], {
    root: projectPath,
    verbose: true,
    dry: false,
    beforeEmit: true
  }),
  new MiniCssExtractPlugin({
    filename: 'css/[name].css?[hash:8]',
    chunkFilename: 'css/[id].css?[hash:8]'
  }),
  new webpack.ProvidePlugin({ }),
  new webpack.DefinePlugin({})
]

for (const entryPath of entryFiles) {
  const basename = path.basename(entryPath, '.js')
  const entryName = camelCase(basename)
  entry[entryName] = [entryPath]

  const filename = path.resolve(htmlEntryOutputPath, `./${basename}.html`)
  const plugin = new HtmlWebpackPlugin({
    inject: false,
    hash: false,
    template: htmlEntryTemplate,
    filename: filename,
    basename: basename,
    publicPath: htmlPublicPath,
    alwaysWriteToDisk: true
  })
  plugins.push(plugin)
}

if (entryFiles.length) {
  plugins.push(new HtmlWebpackHarddiskPlugin())
}

config.webpack = {
  mode: mode,
  entry: entry,
  output: {
    path: webpackEntryOutputPath,
    publicPath: webpackPublicPath,
    filename: '[name].js?[hash:8]',
    chunkFilename: '[name].js?[hash:8]'
  },
  resolve: {
    alias: {}
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  module: {
    rules: [ {
      test: /\.(png|jpe?g|gif|svg)$/,
      loader: 'file-loader',
      options: {
        outputPath: 'img',
        publicPath: '../img',
        useRelativePath: false,
        name: '[name].[ext]?[hash:8]'
      }
    }, {
      test: /\.(woff2?|eot|ttf|otf)$/,
      loader: 'file-loader',
      options: {
        outputPath: 'fonts',
        publicPath: '../fonts',
        useRelativePath: false,
        name: '[name].[ext]?[hash:8]'
      }
    }, {
      test: /\.html$/,
      use: [{
        loader: 'html-loader',
        options: {
          minimize: true
        }
      }]
    }, {
      test: /.pug$/,
      loader: 'pug-loader'
    }, {
      test: /\.css$/,
      use: [{
        loader: MiniCssExtractPlugin.loader,
        options: {
          publicPath: ''
        }
      },
      {
        loader: 'css-loader',
        options: {}
      } ]
    }, {
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      include: [
        path.resolve(__dirname, '../webpack'),
        path.resolve(__dirname, '../assets')
      ],
      loader: 'babel-loader',
      options: {
        plugins: [
          require('babel-plugin-syntax-dynamic-import')
        ]
      }
    }]
  },
  plugins: plugins,
  devtool: (devMode) ? 'source-map' : false
}

config['webpack-dev-server'] = {
  contentBase: contentBase,
  hot: false,
  inline: false,
  quiet: false,
  noInfo: false,
  publicPath: path.resolve('/', path.relative(contentBase, webpackEntryOutputPath)),
  stats: {
    colors: true
  },
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  }
}
