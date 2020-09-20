const path = require('path');

module.exports = {
  entry: {
      three: './src/panolens/three.min.js',
      posterlens: './src/posterlens.dev.js',
      panolens: './src/panolens/panolens.js'
  },
  output: {
    // filename: 'posterlens.bundle.js',
    filename: '[name].js',
    sourceMapFilename: '[name].js.map',
    path: path.resolve(__dirname, 'dist'),
    library: "posterlens",   // Important
    libraryTarget: 'umd',   // Important
    umdNamedDefine: true   // Important
  },
  externals: {
    'posterlens-three': 'POSTERLENS'
  },
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
    ],
  },
  watchOptions: {
    aggregateTimeout: 200,
    poll: 1000
  }
};