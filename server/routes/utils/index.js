/**
 * Created by lei_sun on 2018/2/11.
 */
import express from 'express';
import _ from 'lodash';
import util from '../../helper/util';
import projectConfig from '../../config/project';
import version from '../../config/version';
import config from './config';
import React from 'react';

const configName = process.env.CONFIGNAME;

var goRoute = function(controller, params, configJSON){
    var router = express.Router();
    var dataArr = config[controller];
    handleRoute(router, util.firstUpperCase(controller), dataArr, params);
    return router;
};

/**
 * @param router
 * @param controller: React
 * @param dataArr: { action: '', links: [], scripts: [], demo: [] }
 * demo: 显示在 /Index 页面的测试 URL
 */
var handleRoute = function(router, controller, dataArr, params){
    router.get('/', function(req, res) {
        var renderObj = getRenderObj(controller, params);
        if(handleDefaultPage(req, res, controller, renderObj, dataArr))
            return;

        // 显示 Demo URLs
        var urlPrefix = controller.toLowerCase();
        var urls = [];
        _.each(dataArr, function(item, index){
            if(item){
                var action = item.action;
                var demo = item.demo;

                if(action){
                    if(demo){
                        _.each(demo, function(demoItem, demoIndex){
                            urls.push(urlPrefix + '/' + action + '?' + demoItem);
                        });
                    }
                    else
                        urls.push(urlPrefix + '/' + action);
                }
            }
        });
        renderObj.urls = urls;
        handleRes(req, res, controller, 'Index', renderObj);
    });

    _.each(dataArr, function(item, index){
        if(item){
            var action = item.action;

            if(action){
                router.get('/' + action, function(req, res) {
                    var renderObj = getRenderObj(controller, params);
                    var suffix = action.substring(0,1).toUpperCase() + action.substring(1);
                    var controllerResult = handleController(req, controller, suffix);
                    handleRenderObj(renderObj, item, controllerResult);
                    handleRes(req, res, controller, suffix, renderObj);
                });
            }
        }
    });
};

// 获取 renderObj
var getRenderObj = function(controller, params){
    var react = false;
    var vue = false;
    var serverPrefix = projectConfig.serverPrefix;

    if(params){
        if(params.react != undefined)
            react = params.react;

        if(params.vue != undefined)
            vue = params.vue;
    }

    var renderObj = {
        version: version,
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
        vue: vue,
        controller: '',
        action: '',
        links: [], // 单独页面可增加的 css 链接,
        scripts: [], // 单独页面可增加的 script 链接
        urls: [] // 显示在 Index 页面下 Demo URL
    };
    return renderObj;
};

// 设置路由默认页面
var handleDefaultPage = function(req, res, controller, renderObj, dataArr){
    var suffix = '';
    //console.log('handleDefaultPage', controller, dataArr);

    switch (controller){
        case 'React':
            suffix = 'Home';
            break;
        default:
            suffix = 'Home';
            break;
    }

    if(suffix != ''){
        var controllerResult = handleController(req, controller, suffix);
        _.each(dataArr, function(item, index){
            if(item){
                var action = item.action.toLowerCase();
                if(suffix.toLowerCase() == action){
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

var getReactControllerAction = function(req, controller, action){
    var newController = controller;
    var newAction = action;
    var serverPrefix = projectConfig.serverPrefix;

    var baseUrl = req.baseUrl;
    var baseUrls = '';

    if(controller == 'React' && action == 'Home'){
        baseUrls = baseUrl.split(serverPrefix+'/');
    }
    else if(controller == 'Ssr' && action == 'Home'){
        baseUrls = baseUrl.split(serverPrefix+'/ssr/');
    }

    //console.log('getReactControllerAction', baseUrls);

    if(baseUrls != '' && baseUrls.length > 1){
        var newUrl = baseUrls[1];
        var newUrls = newUrl.split('/');

        if(newUrls.length > 0){
            newController = util.firstUpperCase(newUrls[0]);
        }

        if(newUrls.length > 1){
            newAction = util.firstUpperCase(newUrls[1]);
        }
    }

    //console.log('getReactControllerAction_newController', newController, newAction);
    return { controller: newController, action: newAction };
};

// 渲染模板页面
var handleRes = function(req, res, controller, action, renderObj){
    //console.log('handleRes', controller, action, req.baseUrl);

    if(renderObj){
        var reactObj = getReactControllerAction(req, controller, action);
        renderObj.controller = reactObj.controller;
        renderObj.action = reactObj.action;
        renderObj.body = '../' + controller + '/' + action + '.html';

        //console.log('handleRes', controller, action, renderObj);
        res.render('Common/Layout.html', renderObj);
    }
};

// 设置页面 Links, Scripts, 优先使用 dataArr 设置
var handleRenderObj = function(renderObj, itemObj, controllerObj){
    //console.log('handleRenderObj', itemObj, controllerObj);
    if(renderObj && itemObj){
        var links = itemObj.links;
        var scripts = itemObj.scripts;

        if(links)
            renderObj.links = links;
        else if(controllerObj && controllerObj.links)
            renderObj.links = controllerObj.links;

        if(scripts)
            renderObj.scripts = scripts;
        else if(controllerObj && controllerObj.scripts)
            renderObj.scripts = controllerObj.scripts;
    }
};

// 设置页面 Links, Scripts (通用设置)
var handleController = function(req, controller, action){
    //console.log('handleController', controller, action);
    var result = {};
    var reactObj = getReactControllerAction(req, controller, action);
    var controllerAction = reactObj.controller + reactObj.action;
    return result;
};

export default {
    handleRoute: handleRoute,
    goRoute: goRoute
}