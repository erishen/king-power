import projectConfig from '../config/project';
import apiRouter from './api';
import ssrRouter from './ssr';
import staticRouter from './static';
import utilsRouter from './utils';

var serverPrefix = projectConfig.serverPrefix;
var ssrParameter = projectConfig.ssrParameter;

var utilsGoRouter = function(controller, params, configJSON){
    if(params == undefined){
        params = {};
    }

    if(controller == 'react'){
        params.react = true;
    }

    return utilsRouter.goRoute(controller, params, configJSON);
};

var indexRouter = function(configJSON){
    return utilsGoRouter('react', {}, configJSON);
};

export default function(app, configJSON){
    app.use('/', indexRouter(configJSON));

    if(serverPrefix != ''){
        app.use(serverPrefix + '/', indexRouter(configJSON));
    }

    app.use(serverPrefix + ssrParameter, ssrRouter.goRoute(configJSON));
    app.use(serverPrefix + '/static', staticRouter.goRoute(configJSON));
    app.use(serverPrefix + '/api', apiRouter);
    app.use(serverPrefix + '/*', indexRouter(configJSON));
};
