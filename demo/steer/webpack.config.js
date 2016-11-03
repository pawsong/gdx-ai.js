const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/entry.ts',
  output: {
    path: path.resolve('./dist'),
    filename: 'bundle.js',
  },
  resolve: {
    // These are the reasonable defaults supported by the Node ecosystem.
    extensions: ['.js', '.json', '.ts', '.tsx', ''],
  },
  module: {
    // First, run the linter.
    // It's important to do this before Babel processes the JS.
    preLoaders: [
      { test: /\.js$/, loader: 'source-map-loader' },
    ],
    loaders: [
      { test: /\.ts(x?)$/, loader: `awesome-typescript` },
    ],
  },
  plugins: [
    new CopyWebpackPlugin([{ from: 'index.html' }, { from: 'style.css' }]),
  ],
  devtool: 'cheap-module-source-map',
  devServer: {
    open: true,
  },
};
