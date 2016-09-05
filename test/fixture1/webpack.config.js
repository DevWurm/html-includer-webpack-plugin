var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlIncluderWebpackPlugin = require('../../lib/index').default;

module.exports = {
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "bundle.js"
    },
    plugins: [
        new HtmlWebpackPlugin(),
        new HtmlIncluderWebpackPlugin()
    ]
};
