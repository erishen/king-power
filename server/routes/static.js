/**
 * Created by lei_sun on 2017/12/1.
 */
import express from 'express';
import path from 'path';
import fs from 'fs';
import util from '../helper/util';
import render from './utils/render';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import fetch from '../service/fetch';
import projectConfig from '../config/project';

let isDev = process.env.NODE_ENV !== 'production';
let Config = null;

// 测试数据
isDev = false;

const firstUpper = function(str){
    return util.firstUpperCase(str);
};

const getHtml = function(){
    return `<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
    </head>
    <body>
        hello
    </body>
</html>`;
};

const renderWrite = function(req, res, route, callback){
    if(Config){
        let item = Config[route];
        let html = getHtml();

        if(item){
            let action = item.action;
            let component = ReactDOMServer.renderToString(<item.component />);
            let ssr = (item.ssr == undefined) ? true : item.ssr;
            let preloadedState = item.preloadedState;
            let apiFunc = item.apiFunc;

            if(ssr){
                if(!apiFunc){
                    html = render.renderFullPage({
                        component: component,
                        preloadedState: preloadedState,
                        action: action,
                        isStatic: 'true'
                    });
                    renderReactHome(req, res, action, html, callback);
                }
                else {
                    apiFunc(fetch, req, res).then((preloadedState)=>{
                        html = render.renderFullPage({
                            component: component,
                            preloadedState: preloadedState,
                            action: action,
                            isStatic: 'true'
                        });
                        renderReactHome(req, res, action, html, callback);
                    }).catch((err)=>{
                        console.log('apiFunc_err', err);
                        html = render.renderFullPage({
                            component: component,
                            action: action,
                            isStatic: 'true'
                        });
                        renderReactHome(req, res, action, html, callback);
                    });
                }
            }
            else {
                renderReactHome(req, res, action, html, callback);
            }
        }
        else {
            renderReactHome(req, res, route, html, callback);
        }
    }
    else {
        renderReactHome(req, res, route, html, callback);
    }
};

const renderReactHome = function(req, res, route, html, callback){
    res.render('React/Home.html', { html: html }, function(err, resHTML){
        if(!err){
            let filename = route;
            if(filename != ''){
                console.log('filename', filename);
                let filePathPrefix = path.join(__dirname, '../../public') + projectConfig.ssrParameter + '/';
                if (!fs.existsSync(filePathPrefix))
                    fs.mkdirSync(filePathPrefix);

                if(filename.indexOf('/') != -1){
                    let filenameArr = filename.split('/');
                    let filenameArrLen = filenameArr.length;
                    let dir = filePathPrefix;

                    if(filenameArrLen == 2){
                        dir += filenameArr[0];
                    }
                    else if(filenameArrLen == 3){
                        dir += filenameArr[0] + '/' + filenameArr[1];
                    }
                    else if(filenameArrLen == 4){
                        dir += filenameArr[0] + '/' + filenameArr[1] + '/' + filenameArr[2];
                    }

                    if (!fs.existsSync(dir))
                        fs.mkdirSync(dir);
                }

                fs.writeFile(filePathPrefix + filename + '.html', resHTML, 'utf8', (err) => {
                    if (!err) {
                        console.log('The file ' + filename + '.html has been saved!');
                        return callback && callback(true);
                    }
                    else {
                        return callback && callback(false);
                    }
                });
            }
            else {
                return callback && callback(false);
            }
        }
        else {
            console.log('err', err);
            return callback && callback(false);
        }
    });
};

const renderWriteLoop = function(req, res, routeIndex, routeArray, resultArray, callback){
    if(resultArray == undefined)
        resultArray = [];

    const routeArrayLen = routeArray.length;
    if(routeArray && routeArrayLen > 0){
        if(routeIndex >= 0 && routeIndex < routeArrayLen){
            const route = routeArray[routeIndex];
            renderWrite(req, res, route, function(flag){
                //console.log('renderWriteLoop', route, flag);
                resultArray.push({ route: route, flag: flag });
                routeIndex++;
                return renderWriteLoop(req, res, routeIndex, routeArray, resultArray, callback);
            });
        }
        else {
            return callback && callback(resultArray);
        }
    }
    else {
        return callback && callback(resultArray);
    }
};

var goRoute = function(configJSON) {
    let router = express.Router();
    Config = configJSON;

    router.get('/', function (req, res) {
        if (!isDev) {
            const routeArray = Object.keys(Config);

            renderWriteLoop(req, res, 0, routeArray, [], function (result) {
                res.send(result);
            });
        }
        else {
            res.send('Should use production');
        }
    });
    return router;
}

export default {
    goRoute: goRoute
};