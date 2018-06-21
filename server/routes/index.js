import projectConfig from '../config/project';
import apiRouter from './api';
import ssrRouter from './ssr';
import staticRouter from './static';
import utilsRouter from './utils';

var serverPrefix = projectConfig.serverPrefix;

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
    app.use(serverPrefix + '/', indexRouter(configJSON));
    app.use(serverPrefix + '/kingSSR', ssrRouter.goRoute(configJSON));
    app.use(serverPrefix + '/static', staticRouter.goRoute(configJSON));
    app.use(serverPrefix + '/api', apiRouter);
    app.use(serverPrefix + '/*', indexRouter(configJSON));
};
