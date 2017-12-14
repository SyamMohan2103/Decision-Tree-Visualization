// import webpack from 'webpack';
// import path from 'path';
//
// const GLOBALS = {
//   'process.env.NODE_ENV': JSON.stringify('production'),
//   __DEV__: false
// };
//
// export default {
//   devtool: 'source-map',
//   entry: './src/index',
//   target: 'web',
//   output: {
//     path: `${__dirname}/build`,
//     publicPath: '/',
//     filename: 'bundle.js'
//   },
//   resolveLoader: {
//     moduleExtensions: ['-loader']
//   },
//   resolve: {
//     alias: {
//       d3: 'd3/build/d3.js'
//     },
//     mainFields: [
//       'module', // adds check for 'module'
//       'webpack',
//       'browser',
//       'web',
//       'browserify',
//       ['jam', 'main'],
//       'main',
//   ]
//   },
//   plugins: [
//     new webpack.optimize.OccurrenceOrderPlugin(),
//     new webpack.DefinePlugin(GLOBALS),
//     new webpack.optimize.UglifyJsPlugin()
//   ],
//   module: {
//     loaders: [
//       {test: /\.jsx?/, include: path.join(__dirname, 'src'), loaders: ['babel']},
//       {test: /\.eot(\?v=\d+.\d+.\d+)?$/, loader: 'file'},
//       {test: /\.(woff|woff2)$/, loader: 'file-loader?prefix=font/&limit=5000'},
//       {test: /\.ttf(\?v=\d+.\d+.\d+)?$/, loader: 'file-loader?limit=10000&mimetype=application/octet-stream'},
//       {test: /\.svg(\?v=\d+.\d+.\d+)?$/, loader: 'file-loader?limit=10000&mimetype=image/svg+xml'},
//       {test: /\.(jpe?g|png|gif)$/i, loaders: ['file']},
//       {test: /\.ico$/, loader: 'file-loader?name=[name].[ext]'}
//     ]
//   }
// };

import webpack from 'webpack';
import path from 'path';

const GLOBALS = {
  'process.env.NODE_ENV': JSON.stringify('production'),
  __DEV__: false
};

export default {
  debug: true,
  devtool: 'source-map',
  entry: './src/index',
  target: 'web',
  output: {
    path: `${__dirname}/build`,
    publicPath: '/',
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin(GLOBALS),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true
    })
  ],
  module: {
    loaders: [
      {test: /\.jsx?/, include: path.join(__dirname, 'src'), loaders: ['babel']},
      {test: /\.eot(\?v=\d+.\d+.\d+)?$/, loader: 'file'},
      {test: /\.(woff|woff2)$/, loader: 'file-loader?prefix=font/&limit=5000'},
      {test: /\.ttf(\?v=\d+.\d+.\d+)?$/, loader: 'file-loader?limit=10000&mimetype=application/octet-stream'},
      {test: /\.svg(\?v=\d+.\d+.\d+)?$/, loader: 'file-loader?limit=10000&mimetype=image/svg+xml'},
      {test: /\.(jpe?g|png|gif)$/i, loaders: ['file']},
      {test: /\.ico$/, loader: 'file-loader?name=[name].[ext]'}
    ]
  }
};
