'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _util = require('../helper/util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var serviceObj = {}; /**
                      * Created by lei_sun on 2018/6/11.
                      */


serviceObj.getReactReduxSsrGithub = function () {
    return new Promise(function (resolve, reject) {
        _util2.default.ajaxGet('https://api.github.com/repos/erishen/react-redux-ssr', {}, resolve, reject);
    });
};

exports.default = serviceObj;