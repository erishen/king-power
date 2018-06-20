/**
 * Created by lei_sun on 2018/6/11.
 */
import util from '../helper/util';

var serviceObj = {};

serviceObj.getReactReduxSsrGithub = function() {
    return new Promise((resolve, reject)=>{
        util.ajaxGet('https://api.github.com/repos/erishen/react-redux-ssr', {}, resolve, reject);
    });
};

export default serviceObj;