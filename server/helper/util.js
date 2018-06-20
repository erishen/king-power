/**
 * Created by lei_sun on 2018/3/8.
 */
var util = {};

util.trim = function (str) {
    return str.replace(/^\s*|\s*$/g, '');
};

util.firstUpperCase = function(str){
    var self = this;
    if(self.trim(str) != ''){
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }
    return str;
};

export default util;