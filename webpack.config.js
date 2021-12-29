const path = require('path')

module.exports = {
  entry: './flv.js/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'flv.js',
    library: "flvjs",
  },
  devtool: 'inline-source-map',
}
