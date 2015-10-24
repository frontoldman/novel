/**
 * Created by zhangran on 15/10/23.
 */
var Sequelize = require('sequelize');
var config = require('../../config');
var novelList = require('./novel_list');
var novelDetail = require('./novel_detail');

module.exports = modelInit;

function modelInit(){
    var sequelize = new Sequelize('novel', config.db.user, config.db.pass,{
        host:config.db.host,
        port:config.db.port,
        timezone:'+08:00',
        define: {
            charset: 'utf8'
        }
    });

    var novelListModel = novelList(sequelize);
    var novelDetailModel = novelDetail(sequelize,novelListModel);

    return {
        novelList:novelListModel,
        novelDetail:novelDetailModel
    };
}