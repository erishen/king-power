var webpack = require('webpack');
var path = require('path');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

var productionConfig = {
    entry: {
        react: ['babel-polyfill', './pages/react']
    },
    output: {
        filename: './pages/[name]/bundle.js',
        path: path.resolve(__dirname, './public'),
        publicPath: '/'
    },
    module: {
        rules: [{
            test: /\.(png|woff|woff2|eot|ttf|svg)$/,
            use: 'url-loader?limit=100000&context=client&name=[path][name].[ext]'
        }, {
            test: /\.scss$/,
            exclude: /node_modules/,
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: ['css-loader', 'resolve-url-loader', 'sass-loader?sourceMap']
            })
        }, {
            test: /\.less$/,
            exclude: /node_modules/,
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: ['css-loader', 'resolve-url-loader', 'less-loader?sourceMap']
            })
        }, {
            test: /\.js[x]?$/,
            exclude: /node_modules/,
            use: ['babel-loader']
        }]
    },
    plugins: [
        new CleanWebpackPlugin(['public/pages']),
        new ExtractTextPlugin({
            filename: './pages/[name]/index.css',
            allChunks: true
        }),
        new UglifyJSPlugin(),
        new OptimizeCssAssetsPlugin(),
        new webpack.ContextReplacementPlugin(
            /..[\/\\]..[\/\\]config/,
            false
        )
    ]
};

module.exports = productionConfig;
