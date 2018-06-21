'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _project = require('../../config/project');

var _project2 = _interopRequireDefault(_project);

var _version = require('../../config/version');

var _version2 = _interopRequireDefault(_version);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by lei_sun on 2018/6/1.
 */
var minify = require('html-minifier').minify;

var configName = process.env.CONFIGNAME;
var isRelease = process.env.RELEASE;
var serverPrefix = _project2.default.serverPrefix;
var title = 'react-redux-ssr';
var keywords = 'keywords';
var description = 'description';

var obj = {};
obj.renderFullPage = function (params) {
    var component = params.component,
        action = params.action;
    var preloadedState = params.preloadedState,
        ssr = params.ssr,
        isStatic = params.isStatic;


    if (ssr == undefined) ssr = 'true';

    if (isStatic == undefined) isStatic = 'false';

    if (preloadedState == undefined) preloadedState = {};

    var cssHref = '';
    switch (action) {
        case "bootstrap":
            cssHref = '<link rel="stylesheet" href="' + serverPrefix + '/kingCSS/bootstrap.min.css" />';
            break;
    }

    var html = '\n<!DOCTYPE html>\n<html>\n<head>\n    <meta charset="UTF-8">\n    <title>' + title + '</title>\n    <meta name="keywords" content=' + keywords + ' />\n    <meta name="description" content=' + description + ' />\n    <meta name="viewport" content="width=device-width,initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, minimal-ui" />\n\n    ' + cssHref + '\n\n    <link rel="stylesheet" href="' + serverPrefix + '/kingPAGES/react/index.css?v=' + _version2.default + '" />\n\n    <meta name="appBaseUrl" content="' + serverPrefix + '/" />\n    <meta name="format-detection" content="telephone=no"/>\n\n    <!-- uc\u5F3A\u5236\u7AD6\u5C4F -->\n    <meta name="screen-orientation" content="portrait" />\n    <!-- QQ\u5F3A\u5236\u7AD6\u5C4F -->\n    <meta name="x5-orientation" content="portrait" />\n    <!-- SEO -->\n    <meta name="applicable-device" content="mobile" />\n    <meta name="apple-mobile-web-app-capable" content="yes" />\n    <meta http-equiv="Cache-Control" content="no-siteapp" />\n    \n    <script type="text/javascript">\n        window.ssr = \'' + ssr + '\';\n        window.isStatic = \'' + isStatic + '\';\n        window.configName = \'' + configName + '\';\n    </script>\n</head>\n\n<body onselectstart="return false" style="overflow-y: auto">\n\n    <div id="main">\n        <div class="main-frame">\n            <div class="main-viewport">\n                    <div id="app"><div>' + component + '</div></div>\n            </div>\n            <div class="main-state"></div>\n        </div>\n    </div>\n    <div id="footer"></div>\n    \n    <script>\n          // \u8B66\u544A\uFF1A\u5173\u4E8E\u5728 HTML \u4E2D\u5D4C\u5165 JSON \u7684\u5B89\u5168\u95EE\u9898\uFF0C\u8BF7\u67E5\u770B\u4EE5\u4E0B\u6587\u6863\n          // http://redux.js.org/recipes/ServerRendering.html#security-considerations\n          window.__PRELOADED_STATE__ = ' + JSON.stringify(preloadedState).replace(/</g, '\\u003c') + '\n    </script>\n\n    <script src="' + serverPrefix + '/kingJS/vendor.a3e5a454ebdab64af001.js"></script>\n    <script src="' + serverPrefix + '/kingPAGES/react/bundle.js?v=' + _version2.default + '" type="text/javascript"></script>\n</body>\n</html>\n    ';

    return minify(html, {
        collapseWhitespace: true,
        conservativeCollapse: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true
    });
};

exports.default = obj;