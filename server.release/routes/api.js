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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by lei_sun on 2018/5/22.
 */
var router = _express2.default.Router();

router.use(function timeLog(req, res, next) {
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    console.log((0, _moment2.default)().format('YYYY-MM-DD HH:mm:ss') + ' ' + fullUrl);
    next();
});

router.get('/about', function (req, res) {
    var obj = {};
    obj.version = 'about: ' + _version2.default;
    _fetch2.default.showJSON(res, obj);
});

router.get('/*', function (req, res) {
    var obj = {};
    obj.version = 'api: ' + _version2.default;
    _fetch2.default.showJSON(res, obj);
});

exports.default = router;