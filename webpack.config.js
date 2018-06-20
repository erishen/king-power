var webpack = require('webpack');
var path = require('path');
var HappyPack = require('happypack');
var happyThreadPool = HappyPack.ThreadPool({ size: 5 });
var packageConfig = require(path.resolve(__dirname, './package.json'));
var port = packageConfig.config.port;

var publicPath = 'http://localhost:' + port + '/';
var hotMiddlewareScript = 'webpack-hot-middleware/client?reload=true';

var devConfig = {
    entry: {
        react: ['babel-polyfill', './pages/react', hotMiddlewareScript]
    },
    output: {
        filename: './pages/[name]/bundle.js',
        path: path.resolve(__dirname, './public'),
        publicPath: publicPath
    },
    devtool: 'eval-source-map',
    module: {
        rules: [{
            test: /\.(png|woff|woff2|eot|ttf|svg)$/,
            use: 'url-loader?limit=100000&context=client&name=[path][name].[ext]'
        }, {
            test: /\.scss$/,
            exclude: /node_modules/,
            use: 'happypack/loader?id=scss'
        }, {
            test: /\.less$/,
            exclude: /node_modules/,
            use: 'happypack/loader?id=less'
        }, {
            test: /\.js[x]?$/,
            exclude: /node_modules/,
            use: 'happypack/loader?id=jsx'
        }]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new HappyPack({
            id: 'jsx',
            threadPool: happyThreadPool,
            loaders: [ 'babel-loader' ]
        }),
        new HappyPack({
            id: 'less',
            threadPool: happyThreadPool,
            loaders: [ 'style-loader', 'css-loader?sourceMap', 'resolve-url-loader', 'less-loader?sourceMap' ]
        }),
        new HappyPack({
            id: 'scss',
            threadPool: happyThreadPool,
            loaders: [ 'style-loader', 'css-loader?sourceMap', 'resolve-url-loader', 'sass-loader?sourceMap' ]
        }),
        new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: require('./manifest.json')
        }),
        new webpack.ContextReplacementPlugin(
            /..[\/\\]..[\/\\]config/,
            false
        )
    ]
};

module.exports = devConfig;
