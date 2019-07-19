module.exports = function (prog) {
  prog
    .command('dev')
    .option('-p, --port <port>', 'web service listen port default:[8080]', 8080)
    .description('start a http service.')
    .action(async function (opts) {
      const configWebpack = require('../webpack/config.dev')
      const webpack = require('webpack')
      const compiler = webpack(configWebpack)
      const WebpackDevServer = require('webpack-dev-server')
      const path = require('path')
      const configWebpackDevServer = {
        contentBase: path.resolve('./build/public'),
        publicPath: configWebpack.output.publicPath,
        hot: false,
        inline: false,
        quiet: false,
        noInfo: false,
        stats: {
          colors: true
        },
        watchOptions: {
          aggregateTimeout: 300,
          poll: 5000
        }
      }
      const webpackServer = new WebpackDevServer(compiler, configWebpackDevServer)
      webpackServer.listen(opts.port, '127.0.0.1', function () {
        // const app = server.listeningApp
        const httpListen = '127.0.0.1:' + opts.port
        console.error('[webpack-dev-server]', 'Http Listen in ' + httpListen)
      })
    })
}
