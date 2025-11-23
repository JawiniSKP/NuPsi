const webpack = require('webpack');

module.exports = {
  resolve: {
    fallback: {
      "buffer": require.resolve("buffer/"),
      "stream": false,
      "crypto": false,
      "path": false,
      "fs": false
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser'
    })
  ]
};
