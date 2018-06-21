'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ejs = require('ejs');

var _ejs2 = _interopRequireDefault(_ejs);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

var _project = require('./config/project');

var _project2 = _interopRequireDefault(_project);

var _index = require('./routes/index');

var _index2 = _interopRequireDefault(_index);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var obj = {};

obj.start = function (configJSON) {
    var port = _package2.default.config.port;
    var serverPrefix = _project2.default.serverPrefix;

    var isRelease = process.env.RELEASE;
    console.log('isRelease', isRelease, serverPrefix);

    var viewsDictionary = './views';
    var publicDictionary = '../public';

    if (isRelease) {
        viewsDictionary = '../dest/views';
        publicDictionary = '../dest/public';
    }

    var isDev = process.env.NODE_ENV !== 'production';
    var app = (0, _express2.default)();

    _ejs2.default.delimiter = '?';
    app.engine('html', _ejs2.default.__express);
    app.set('view engine', 'html');
    app.set('views', _path2.default.resolve(__dirname, viewsDictionary));

    app.use(_bodyParser2.default.json()); // for parsing application/json

    // local variables for all views
    app.locals.env = process.env.NODE_ENV || 'dev';
    app.locals.reload = true;

    if (isDev) {
        var webpack = require('webpack');
        var webpackDevMiddleware = require('webpack-dev-middleware');
        var webpackHotMiddleware = require('webpack-hot-middleware');
        var webpackDevConfig = require('../webpack.config.js');
        var compiler = webpack(webpackDevConfig);

        // attach to the compiler & the server
        app.use(serverPrefix, webpackDevMiddleware(compiler, {
            // public path should be the same with webpack config
            publicPath: webpackDevConfig.output.publicPath,
            noInfo: true,
            stats: {
                colors: true
            }
        }));
        app.use(webpackHotMiddleware(compiler));

        app.use(serverPrefix, _express2.default.static(_path2.default.join(__dirname, publicDictionary)));

        (0, _index2.default)(app, configJSON);

        var server = _http2.default.createServer(app);
        require('reload')(server, app);

        // browsersync is a nice choice when modifying only views (with their css & js)
        var bs = require('browser-sync').create();

        server.listen(port, function () {
            bs.init({
                open: false,
                ui: false,
                notify: false,
                proxy: {
                    target: 'localhost:' + port,
                    ws: true
                },
                files: ['./server/views/**'],
                port: port
            });
            console.log('App (dev) is going to be running on port ' + port + ' (by browsersync).');
        });

        // 设置 Https
        var keyFile = _path2.default.join(__dirname, './privatekey.pem');
        var certFile = _path2.default.join(__dirname, './certrequest.pem');

        if (_fs2.default.existsSync(keyFile) && _fs2.default.existsSync(certFile)) {
            var options = {
                key: _fs2.default.readFileSync(keyFile),
                cert: _fs2.default.readFileSync(certFile)
            };

            var httpsPort = 8083;
            var httpsServer = _https2.default.createServer(options, app);
            require('reload')(httpsServer, app);

            httpsServer.listen(httpsPort, function () {
                console.log('Https (dev) is now running on port ' + httpsPort + '!');
            });
        }
    } else {
        // static wildsAssets served by express.static() for production
        app.use(serverPrefix, _express2.default.static(_path2.default.join(__dirname, publicDictionary)));

        (0, _index2.default)(app, configJSON);

        app.listen(port, function () {
            console.log('App (production) is now running on port ' + port + '!');
        });
    }
};

module.exports = obj;