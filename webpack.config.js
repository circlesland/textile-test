const webpack = require('webpack')
const dotenv = require('dotenv').config({ path: __dirname + '/.env' })

const mode = process.env.NODE_ENV || 'development'
const IS_DEV = process.env.NODE_ENV === 'development'

module.exports = {
  entry: {
    bundle: ['./src/main.ts'],
  },
  resolve: {
    extensions: ['.mjs', '.tsx', '.ts', '.js', '.svelte'],
    mainFields: ['svelte', 'browser', 'module', 'main'],
  },
  output: {
    path: __dirname + '/public',
    filename: '[name].js',
    chunkFilename: '[name].[id].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ['ts-loader']
      },
    ],
  },
  mode: process.env.NODE_ENV,
  plugins: [
    new webpack.SourceMapDevToolPlugin({}),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(dotenv.parsed),
    }),
  ],
  devtool: IS_DEV ? 'source-map' : false,
}
