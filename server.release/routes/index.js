'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (app, configJSON) {
    app.use('/', indexRouter(configJSON));

    if (serverPrefix != '') {
        app.use(serverPrefix + '/', indexRouter(configJSON));
    }

    app.use(serverPrefix + ssrParameter, _ssr2.default.goRoute(configJSON));
    app.use(serverPrefix + '/static', _static2.default.goRoute(configJSON));
    app.use(serverPrefix + '/api', _api2.default);
    app.use(serverPrefix + '/*', indexRouter(configJSON));
};

var _project = require('../config/project');

var _project2 = _interopRequireDefault(_project);

var _api = require('./api');

var _api2 = _interopRequireDefault(_api);

var _ssr = require('./ssr');

var _ssr2 = _interopRequireDefault(_ssr);

var _static = require('./static');

var _static2 = _interopRequireDefault(_static);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var serverPrefix = _project2.default.serverPrefix;
var ssrParameter = _project2.default.ssrParameter;

var utilsGoRouter = function utilsGoRouter(controller, params, configJSON) {
    if (params == undefined) {
        params = {};
    }

    if (controller == 'react') {
        params.react = true;
    }

    return _utils2.default.goRoute(controller, params, configJSON);
};

var indexRouter = function indexRouter(configJSON) {
    return utilsGoRouter('react', {}, configJSON);
};

;