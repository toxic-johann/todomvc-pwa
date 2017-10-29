const glob = require('glob');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');
const WriteFilePlugin = require('write-file-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DirectoryNamedWebpackPlugin = require('directory-named-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const notifier = require('node-notifier');
const { deepAssign } = require('toxic-utils');
const WebpackAssetsManifest = require('webpack-assets-manifest');

// 配置 entry 入口
const entries = glob.sync(path.resolve(__dirname, '../app/components/**/page/*/entry.*.js')).reduce((entries, dir) => {
  entries[path.basename(dir, '.js').replace('entry.', '')] = [ 'webpack-hot-middleware/client?path=http://localhost:9002/__webpack_hmr&timeout=20000&reload=true', dir ];
  return entries;
}, {});

const sws = glob.sync(path.resolve(__dirname, '../app/components/**/page/*/sw.*.js')).reduce((sws, dir) => {
  sws[path.basename(dir, '.js')] = dir;
  return sws;
}, {});

// 配置 html 输出路径
const baseEntryTplPath = path.join(__dirname, '../app/views/entry.tpl');
const outputEntryTplPath = path.join(__dirname, '../app/views/dist/');
const htmlWebpackPlugins = Object.keys(entries)
  .map(entryName => new HtmlWebpackPlugin({
    filename: path.join(outputEntryTplPath, `${entryName}.tpl`),
    template: baseEntryTplPath,
    chunks: [ entryName ],
  }));

module.exports = {
  entry: deepAssign({}, entries, sws),
  devServer: {
    contentBase: path.join(__dirname, '../app/public'),
    port: '9002',
    hot: true,
  },
  // 开发阶段的output配置
  output: {
    filename: 'js/[name]-[hash].js',
    path: path.join(__dirname, '../app/public/dist/dev/'),
    publicPath: 'http://localhost:9002/public/dist/dev/',
    // 支持chrome workspace，直接编辑生效，提高开发效率
    devtoolModuleFilenameTemplate(info) {
      return 'webpack:///' + info.resourcePath;
    },
  },
  module: {
    rules: [
      // lint docs: https://github.com/vuejs/vue-loader/blob/master/docs/en/workflow/linting.md
      {
        enforce: 'pre',
        test: /\.(vue|js)$/,
        loader: 'eslint-loader',
        exclude: /node_modules/,
        options: {
          fix: true,
        },
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader?cacheDirectory=true',
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
            },
          ],
        }),
      },
    ],
  },
  resolve: {
    extensions: [ '.js', '.vue', '.css' ],
    modules: [
      path.resolve(__dirname, '../app/components/'),
      'node_modules',
    ],
    alias: {
      vue: 'vue/dist/vue.esm.js',
    },
    plugins: [
      new DirectoryNamedWebpackPlugin(),
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"',
      },
    }),
    new WebpackAssetsManifest({
      output: 'webpack-assets.json',
      writeToDisk: true,
      publicPath: true,
    }),
    new WriteFilePlugin({
      test: /\.tpl$/,
      log: true,
    }),
    new ExtractTextPlugin({ filename: 'css/[name]-[contenthash].css' }),
    ...htmlWebpackPlugins,
    new FriendlyErrorsWebpackPlugin({
      onErrors: (severity, errors) => {
        if (severity !== 'error') {
          return;
        }
        const error = errors[0];
        notifier.notify({
          title: 'Webpack error',
          message: severity + ': ' + error.name,
          subtitle: error.file || '',
        });
      },
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
};
