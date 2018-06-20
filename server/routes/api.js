/**
 * Created by lei_sun on 2018/5/22.
 */
import express from 'express';
import version from '../config/version';
import moment from 'moment';
import fetch from '../service/fetch';

let router = express.Router();

router.use(function timeLog(req, res, next) {
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' ' + fullUrl);
    next();
});

router.get('/about', function(req, res) {
    var obj = {};
    obj.version = 'about: ' + version;
    fetch.showJSON(res, obj);
});

router.get('/*', function(req, res) {
    var obj = {};
    obj.version = 'api: ' + version;
    fetch.showJSON(res, obj);
});

export default router;