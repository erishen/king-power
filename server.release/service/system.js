'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getIPAdress = function getIPAdress() {
    var interfaces = _os2.default.networkInterfaces();
    //console.log('interfaces', interfaces);
    for (var devName in interfaces) {
        //console.log('devName', devName);
        if (devName.indexOf('VPN') == -1) {
            var iface = interfaces[devName];
            for (var i = 0; i < iface.length; i++) {
                var alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                    return alias.address;
                }
            }
        }
    }
}; /**
    * Created by lei_sun on 2018/1/4.
    */
exports.default = {
    getIPAdress: getIPAdress
};