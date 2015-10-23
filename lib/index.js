/**
 * Created by zhangran on 15/10/23.
 */
var modelInit = require('./model/');

module.exports = init;

function init(){
    var model = modelInit();
    return {
        model:model
    }
}