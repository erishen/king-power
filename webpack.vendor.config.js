/**
 * Created by lei_sun on 2018/3/12.
 */
const webpack = require('webpack');
const path = require('path');

const vendors = [
    'isomorphic-fetch',
    'react',
    'react-dom',
    'react-redux',
    'react-router',
    'react-router-dom',
    'redux',
    'redux-thunk',
    'redux-logger'
];

module.exports = {
    entry: {
        vendor: vendors,
    },
    output: {
        path: path.resolve(__dirname, './public'),
        filename: '[name].[chunkhash].js',
        library: '[name]_[chunkhash]',
    },
    plugins: [
        new webpack.DllPlugin({
            path: path.join(__dirname, "manifest.json"),
            name: '[name]_[chunkhash]',
            context: __dirname,
        }),
    ],
};