const glob = require('glob');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');
const WriteFilePlugin = require('write-file-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DirectoryNamedWebpackPlugin = require('directory-named-webpack-plugin');

// 配置 entry 入口
const files = glob.sync(path.resolve(__dirname, '../app/components/**/page/*/entry.*.js'));
const entries = files.reduce((entries, dir) => {
  entries[path.basename(dir, '.js').replace('entry.', '')] = dir;
  return entries;
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
  entry: entries,
  devServer: {
    contentBase: path.join(__dirname, '../app/public'),
    port: '9002',
  },
  /**
   * 开发环境默认开启sourcemap，debug模式
   * webpack有七种sourcemap模式，基于性能及使用场景考虑使用哪种
   * cheap-module简化loader相关map，eval提升rebuild效率，但不支持直接debug
   * 使用sourceMap会卡顿的童鞋可以通过注释下面两行配置暂时关闭，必要时再开启
   */
  devtool: '#cheap-module-eval-source-map',
  // 开发阶段的output配置
  output: {
    filename: 'js/[name]_[hash].bundle.js',
    // 符合egg静态资源规范的目录，path 默认开发环境路径
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
    new WriteFilePlugin({
      test: /\.tpl$/,
      log: true,
    }),
    new ExtractTextPlugin({ filename: 'css/[name]-[contenthash].css' }),
    ...htmlWebpackPlugins,
  ],
};
