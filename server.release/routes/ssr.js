'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _version = require('../config/version');

var _version2 = _interopRequireDefault(_version);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _fetch = require('../service/fetch');

var _fetch2 = _interopRequireDefault(_fetch);

var _render = require('./utils/render');

var _render2 = _interopRequireDefault(_render);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by lei_sun on 2018/5/31.
 */
var goRoute = function goRoute(configJSON) {
    var router = _express2.default.Router();

    router.use(function timeLog(req, res, next) {
        var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        console.log((0, _moment2.default)().format('YYYY-MM-DD HH:mm:ss') + ' ' + fullUrl);
        next();
    });

    _lodash2.default.each(configJSON, function (item, key) {
        var action = item.action;
        var component = _server2.default.renderToString(_react2.default.createElement(item.component, null));
        var ssr = item.ssr == undefined ? true : item.ssr;
        var preloadedState = item.preloadedState;
        var apiFunc = item.apiFunc;

        if (ssr) {
            router.get('/' + action, function (req, res) {
                if (!apiFunc) {
                    res.end(_render2.default.renderFullPage({
                        component: component,
                        preloadedState: preloadedState,
                        action: action
                    }));
                } else {
                    apiFunc(_fetch2.default, req, res).then(function (preloadedState) {
                        res.end(_render2.default.renderFullPage({
                            component: component,
                            preloadedState: preloadedState,
                            action: action
                        }));
                    }).catch(function (err) {
                        console.log('apiFunc_err', err);
                        res.end(_render2.default.renderFullPage({ component: component, action: action }));
                    });
                }
            });
        }
    });

    router.get('/*', function (req, res) {
        var obj = {};
        obj.version = 'ssr: ' + _version2.default;
        _fetch2.default.showJSON(res, obj);
    });

    return router;
};

exports.default = {
    goRoute: goRoute
};