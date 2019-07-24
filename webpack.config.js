const webpack = require('webpack')
const path = require('path')

module.exports = {
  mode: 'none',
  entry: {
    main: './frontend.js'
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
