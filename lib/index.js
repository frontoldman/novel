/**
 * Created by zhangran on 15/10/23.
 */
var modelInit = require('./model/');
var crawl = require('./bin/');

module.exports = init;

function init(){
    var models = modelInit();

    setTimeout(function(){
        crawl(models);
    },1000)

    return {
        models
    }
}