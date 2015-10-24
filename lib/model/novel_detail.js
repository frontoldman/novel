/**
 * Created by zhangran on 15/10/24.
 */
var Sequelize = require('sequelize');

module.exports = function (sequelize, novelList) {

    var NovelDetail = sequelize.define('novel_detail', {
        paragraph: Sequelize.STRING,
        content: Sequelize.TEXT,
        list_id : {
            type: Sequelize.INTEGER,
            references : {
                model:novelList,
                key:'id'
            }
        }
    }, {
        freezeTableName: true // Model tableName will be the same as the model name
    });

    NovelDetail.sync({force: true});

    //NovelDetail.belongsTo(novelList, {
    //    foreignKey: 'fk_novel_list',
    //    target: 'id'
    //});


    return NovelDetail;

};