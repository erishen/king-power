import express from 'express';
import path from 'path';
import ejs from 'ejs';
import http from 'http';
import https from 'https';
import fs from 'fs';
import packageConfig from '../package.json';
import projectConfig from './config/project';
import serverRoute from './routes/index';
import bodyParser from 'body-parser';

var obj = {};

obj.start = function(configJSON){
    const port = packageConfig.config.port;
    const serverPrefix = projectConfig.serverPrefix;

    const isRelease = process.env.RELEASE;
    console.log('isRelease', isRelease, serverPrefix);

    let viewsDictionary = './views';
    let publicDictionary = '../public';

    if(isRelease){
        viewsDictionary = '../dest/views';
        publicDictionary = '../dest/public';
    }

    const isDev = process.env.NODE_ENV !== 'production';
    let app = express();

    ejs.delimiter = '?';
    app.engine('html', ejs.__express);
    app.set('view engine', 'html');
    app.set('views', path.resolve(__dirname, viewsDictionary));

    app.use(bodyParser.json()); // for parsing application/json

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

        app.use(serverPrefix, express.static(path.join(__dirname, publicDictionary)));

        var server = http.createServer(app);
        require('reload')(server, app);

        serverRoute(app, configJSON);

        // browsersync is a nice choice when modifying only views (with their css & js)
        var bs = require('browser-sync').create();

        server.listen(port, function(){
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
        var keyFile = path.join(__dirname, './privatekey.pem');
        var certFile = path.join(__dirname, './certrequest.pem');

        if(fs.existsSync(keyFile) && fs.existsSync(certFile)){
            var options = {
                key: fs.readFileSync(keyFile),
                cert: fs.readFileSync(certFile)
            };

            var httpsPort = 8083;
            var httpsServer = https.createServer(options, app);
            require('reload')(httpsServer, app);

            httpsServer.listen(httpsPort, function(){
                console.log('Https (dev) is now running on port ' + httpsPort + '!');
            });
        }
    } else {
        // static wildsAssets served by express.static() for production
        app.use(serverPrefix, express.static(path.join(__dirname, publicDictionary)));

        serverRoute(app, configJSON);

        app.listen(port, function () {
            console.log('App (production) is now running on port ' + port + '!');
        });
    }
};

module.exports = obj;
