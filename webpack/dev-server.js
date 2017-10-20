const koa = require('koa');
const app = new koa();
const http = require('http');
const webpack = require('webpack');
// 因为 eggjs 的核心还是 koa1，所以 koa-webpack-dev-middleware 用 1 的版本
const devMiddleware = require('koa-webpack-dev-middleware');
const webpackConfig = require('./webpack.config');

function devServerRun() {

  const compiler = webpack(webpackConfig);

  /**
   * https://github.com/FormidableLabs/webpack-dashboard/issues/26
   * dashboard在win下不支持内部滚动条
   * mac推荐结合item2，win推荐结合conemu
   */

  app.use(devMiddleware(compiler, {
    // all options optional

    noInfo: true,
    // display no info to console (only warnings and errors)

    // quiet: true,
    // display nothing to the console

    /*
     * lazy: true,
     */
    // switch into lazy mode
    // that means no watching, but recompilation on every request

    /*
     * watchOptions: {
     *   aggregateTimeout: 300,
     *   poll: true
     * },
     */
    // watch options (only lazy: false)

    publicPath: webpackConfig.output.publicPath,
    // public path to bind the middleware to
    // use the same as in webpack

    /*
     * headers: { "X-Custom-Header": "yes" },
     */
    // custom headers
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },

    stats: {
      colors: true,
    },
    // options for formating the statistics
  }));

  console.info('请等待webpack初次构建完成提示...');


  /**
   * Get port from environment and store in Express.
   */

  const port = normalizePort('9002');

  /**
   * Create HTTP server.
   */

  const server = http.createServer(app.callback());

  /**
   * Listen on provided port, on all network interfaces.
   */

  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);

  /**
   * Normalize a port into a number, string, or false.
   */

  function normalizePort(val) {
    const _port = parseInt(val, 10);

    if (isNaN(_port)) {
      // named pipe
      return val;
    }

    if (_port >= 0) {
      // port number
      return _port;
    }

    return false;
  }

  /**
   * Event listener for HTTP server "error" event.
   */

  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  /**
   * Event listener for HTTP server "listening" event.
   */

  function onListening() {
    console.info('The Static Dev Server is Listening On ' + port);
  }
}

devServerRun();
