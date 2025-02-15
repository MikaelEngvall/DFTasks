const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          crypto: require.resolve('crypto-browserify'),
          stream: require.resolve('stream-browserify'),
          util: require.resolve('util/'),
          buffer: require.resolve('buffer/'),
          vm: false,
          process: false
        },
        alias: {
          process: false
        }
      },
      plugins: [
        new webpack.ProvidePlugin({
          process: false,
          Buffer: ['buffer', 'Buffer'],
        }),
      ],
    },
  },
}; 