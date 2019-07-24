const webpack = require('webpack')
const path = require('path')

module.exports = {
  mode: 'none',
  entry: {
    main: './frontend.js'
  },
  module: {
      rules: [
          {
              test: /\.css$/,
              use: [
                  'style-loader',
                  'css-loader'
              ]
          }
      ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    })
  ],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'public')
  }
}
