/**
 * Created by zhangran on 15/10/23.
 */
var modelInit = require('./model/');
var crawl = require('./bin/');

module.exports = init;

function init(){
    var models = modelInit();

    crawl(models);

    return {
        models
    }
}