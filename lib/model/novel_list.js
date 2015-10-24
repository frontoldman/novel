/**
 * Created by zhangran on 15/10/23.
 */
var Sequelize = require('sequelize');

module.exports = function(sequelize){

    var NovelList = sequelize.define('novel_list', {
        title : {
            type:Sequelize.STRING,
            unique:true
        },
        link : Sequelize.STRING
    }, {
        freezeTableName: true // Model tableName will be the same as the model name
    });

    NovelList.sync({force: true});

    return NovelList;

};