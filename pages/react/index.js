/**
 * Created by lei_sun on 2018/2/11.
 */
import './index.less';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import _ from 'lodash';
import projectConfig from '../../server/config/project';

const test = window.configName;
const Config = require('../../config/' + test + '.js').default;

if(document.getElementById('app') != null){
    let basename = projectConfig.serverPrefix;
    if(window.ssr == 'true'){
        basename += '/ssr';
    }

    let content = [];
    let index = 0;

    _.each(Config, (item, key)=>{
        //console.log(item, key);
        let action = item.action;
        let component = item.component;
        let path = '/' + action;

        if(window.isStatic == 'true'){
            path += '.html';
        }

        if(index == 0){
            content.push(
                <Route key={key+index} exact path="/" component={component} />
            );
        }

        content.push(
            <Route key={key+index} path={path} component={component} />
        );
        index++;
    });

    let router = (
        <BrowserRouter basename={basename}>
            <Switch>
                {content}
            </Switch>
        </BrowserRouter>
    );
    ReactDOM.render(router, document.getElementById('app'));
}