var obj = {};

obj.hello = function(){
    return 'Hello World';
};

obj.debug = function(configJSON, configName){
    process.env.COMMON = 'common';
    process.env.CONFIGNAME = configName || 'index';
    var server = require('./server');
    server.start(configJSON);
};

obj.release = function(configJSON, configName){
    process.env.NODE_ENV = 'production';
    process.env.RELEASE = true;
    process.env.COMMON = 'common.release';
    process.env.CONFIGNAME = configName || 'index';
    var server = require('./server.release');
    server.start(configJSON);
};

obj.store = function(){
    var commonStore = require('./common.release/redux/store').default;
    return commonStore;
};

module.exports = obj;