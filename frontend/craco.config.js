const webpack = require('webpack');
const path = require('path');

module.exports = {
  webpack: {
    configure: {
      resolve: {
        alias: {
          process: path.resolve(__dirname, 'src/utils/process-polyfill.js')
        },
        fallback: {
          crypto: require.resolve('crypto-browserify'),
          stream: require.resolve('stream-browserify'),
          util: require.resolve('util/'),
          buffer: require.resolve('buffer/'),
          vm: false
        }
      },
      plugins: [
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer']
        }),
        new webpack.DefinePlugin({
          'process.env': JSON.stringify({
            NODE_ENV: process.env.NODE_ENV,
            REACT_APP_API_URL: process.env.REACT_APP_API_URL
          })
        })
      ]
    }
  }
}; 