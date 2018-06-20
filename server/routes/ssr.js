/**
 * Created by lei_sun on 2018/5/31.
 */
import express from 'express';
import version from '../config/version';
import moment from 'moment';
import fetch from '../service/fetch';
import render from './utils/render';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import _ from 'lodash';

var goRoute = function(configJSON){
    let router = express.Router();

    router.use(function timeLog(req, res, next) {
        var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' ' + fullUrl);
        next();
    });

    _.each(configJSON, (item, key)=>{
        let action = item.action;
        let component = ReactDOMServer.renderToString(<item.component />);
        let ssr = (item.ssr == undefined) ? true : item.ssr;
        let preloadedState = item.preloadedState;
        let apiFunc = item.apiFunc;

        if(ssr){
            router.get('/' + action, function(req, res) {
                if(!apiFunc){
                    res.end(render.renderFullPage({
                        component: component,
                        preloadedState: preloadedState,
                        action: action
                    }));
                }
                else {
                    apiFunc(fetch, req, res).then((preloadedState)=>{
                        res.end(render.renderFullPage({
                            component: component,
                            preloadedState: preloadedState,
                            action: action
                        }));
                    }).catch((err)=>{
                        console.log('apiFunc_err', err);
                        res.end(render.renderFullPage({ component: component, action: action }));
                    });
                }
            });
        }
    });

    router.get('/*', function(req, res) {
        let obj = {};
        obj.version = 'ssr: ' + version;
        fetch.showJSON(res, obj);
    });

    return router;
};

export default {
    goRoute: goRoute
};