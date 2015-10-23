/**
 * Created by zhangran on 15/10/23.
 */
var Sequelize = require('sequelize');

module.exports = function(sequelize){

    var NovelList = sequelize.define('novel_list', {
        name : Sequelize.STRING
    }, {
        freezeTableName: true // Model tableName will be the same as the model name
    });

    NovelList.sync({force: false});

};