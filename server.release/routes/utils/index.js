'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _util = require('../../helper/util');

var _util2 = _interopRequireDefault(_util);

var _project = require('../../config/project');

var _project2 = _interopRequireDefault(_project);

var _version = require('../../config/version');

var _version2 = _interopRequireDefault(_version);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } /**
                                                                                                                                                                                                                   * Created by lei_sun on 2018/2/11.
                                                                                                                                                                                                                   */


var configName = process.env.CONFIGNAME;

var goRoute = function goRoute(controller, params, configJSON) {
    var router = _express2.default.Router();
    var dataArr = _config2.default[controller];
    handleRoute(router, _util2.default.firstUpperCase(controller), dataArr, params);
    return router;
};

/**
 * @param router
 * @param controller: React
 * @param dataArr: { action: '', links: [], scripts: [], demo: [] }
 * demo: 显示在 /Index 页面的测试 URL
 */
var handleRoute = function handleRoute(router, controller, dataArr, params) {
    router.get('/', function (req, res) {
        var renderObj = getRenderObj(controller, params);
        if (handleDefaultPage(req, res, controller, renderObj, dataArr)) return;

        // 显示 Demo URLs
        var urlPrefix = controller.toLowerCase();
        var urls = [];
        _lodash2.default.each(dataArr, function (item, index) {
            if (item) {
                var action = item.action;
                var demo = item.demo;

                if (action) {
                    if (demo) {
                        _lodash2.default.each(demo, function (demoItem, demoIndex) {
                            urls.push(urlPrefix + '/' + action + '?' + demoItem);
                        });
                    } else urls.push(urlPrefix + '/' + action);
                }
            }
        });
        renderObj.urls = urls;
        handleRes(req, res, controller, 'Index', renderObj);
    });

    _lodash2.default.each(dataArr, function (item, index) {
        if (item) {
            var action = item.action;

            if (action) {
                router.get('/' + action, function (req, res) {
                    var renderObj = getRenderObj(controller, params);
                    var suffix = action.substring(0, 1).toUpperCase() + action.substring(1);
                    var controllerResult = handleController(req, controller, suffix);
                    handleRenderObj(renderObj, item, controllerResult);
                    handleRes(req, res, controller, suffix, renderObj);
                });
            }
        }
    });
};

// 获取 renderObj
var getRenderObj = function getRenderObj(controller, params) {
    var _renderObj;

    var react = false;
    var vue = false;
    var serverPrefix = _project2.default.serverPrefix;

    if (params) {
        if (params.react != undefined) react = params.react;

        if (params.vue != undefined) vue = params.vue;
    }

    var renderObj = (_renderObj = {
        version: _version2.default,
        head: '../Common/Head.html',
        footer: '../Common/Footer.html',
        url: '../Common/URL.html',
        body: '',
        title: 'react-redux-ssr',
        keywords: 'keywords',
        description: 'description',
        controller: controller,
        serverPrefix: serverPrefix,
        configName: configName,
        react: react,
        vue: vue
    }, _defineProperty(_renderObj, 'controller', ''), _defineProperty(_renderObj, 'action', ''), _defineProperty(_renderObj, 'links', []), _defineProperty(_renderObj, 'scripts', []), _defineProperty(_renderObj, 'urls', []), _renderObj);
    return renderObj;
};

// 设置路由默认页面
var handleDefaultPage = function handleDefaultPage(req, res, controller, renderObj, dataArr) {
    var suffix = '';
    //console.log('handleDefaultPage', controller, dataArr);

    switch (controller) {
        case 'React':
            suffix = 'Home';
            break;
        default:
            suffix = 'Home';
            break;
    }

    if (suffix != '') {
        var controllerResult = handleController(req, controller, suffix);
        _lodash2.default.each(dataArr, function (item, index) {
            if (item) {
                var action = item.action.toLowerCase();
                if (suffix.toLowerCase() == action) {
                    handleRenderObj(renderObj, item, controllerResult);
                    return false;
                }
            }
        });

        handleRes(req, res, controller, suffix, renderObj);
        return true;
    }

    return false;
};

var getReactControllerAction = function getReactControllerAction(req, controller, action) {
    var newController = controller;
    var newAction = action;
    var serverPrefix = _project2.default.serverPrefix;

    var baseUrl = req.baseUrl;
    var baseUrls = '';

    if (controller == 'React' && action == 'Home') {
        baseUrls = baseUrl.split(serverPrefix + '/');
    } else if (controller == 'Ssr' && action == 'Home') {
        baseUrls = baseUrl.split(serverPrefix + '/ssr/');
    }

    //console.log('getReactControllerAction', baseUrls);

    if (baseUrls != '' && baseUrls.length > 1) {
        var newUrl = baseUrls[1];
        var newUrls = newUrl.split('/');

        if (newUrls.length > 0) {
            newController = _util2.default.firstUpperCase(newUrls[0]);
        }

        if (newUrls.length > 1) {
            newAction = _util2.default.firstUpperCase(newUrls[1]);
        }
    }

    //console.log('getReactControllerAction_newController', newController, newAction);
    return { controller: newController, action: newAction };
};

// 渲染模板页面
var handleRes = function handleRes(req, res, controller, action, renderObj) {
    //console.log('handleRes', controller, action, req.baseUrl);

    if (renderObj) {
        var reactObj = getReactControllerAction(req, controller, action);
        renderObj.controller = reactObj.controller;
        renderObj.action = reactObj.action;
        renderObj.body = '../' + controller + '/' + action + '.html';

        //console.log('handleRes', controller, action, renderObj);
        res.render('Common/Layout.html', renderObj);
    }
};

// 设置页面 Links, Scripts, 优先使用 dataArr 设置
var handleRenderObj = function handleRenderObj(renderObj, itemObj, controllerObj) {
    //console.log('handleRenderObj', itemObj, controllerObj);
    if (renderObj && itemObj) {
        var links = itemObj.links;
        var scripts = itemObj.scripts;

        if (links) renderObj.links = links;else if (controllerObj && controllerObj.links) renderObj.links = controllerObj.links;

        if (scripts) renderObj.scripts = scripts;else if (controllerObj && controllerObj.scripts) renderObj.scripts = controllerObj.scripts;
    }
};

// 设置页面 Links, Scripts (通用设置)
var handleController = function handleController(req, controller, action) {
    //console.log('handleController', controller, action);
    var result = {};
    var reactObj = getReactControllerAction(req, controller, action);
    var controllerAction = reactObj.controller + reactObj.action;
    return result;
};

exports.default = {
    handleRoute: handleRoute,
    goRoute: goRoute
};