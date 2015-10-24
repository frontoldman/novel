/**
 * Created by zhangran on 15/10/24.
 */

var request = require('request');
var iconv = require('iconv-lite');
var cheerio = require('cheerio');
var Q = require('q');

module.exports = function (models) {

    //getIndex(1);

    function getText(index) {

        var url = 'http://tianyibook.com/tianyibooksort20/0/' + index + '.htm';

        return new Promise(function (resolve, reject) {
            var text, status;

            var stream = request({
                url: url
            }, function (err, res, body) {

                console.log(url)
                console.log(res.statusCode)
                if (err || res.statusCode != 200) {
                    reject(new Error('错误代码: ' + res.statusCode + '出错页数: ' + index));
                    return;
                }
                status = 200;
                cb();
            });


            var bufs = [];
            stream.on('data', d => bufs.push(d));
            stream.on('end', function () {
                var buf = Buffer.concat(bufs);
                text = iconv.decode(buf, 'gbk');
                cb();
            });

            function cb() {
                if (status == 200 && text) {
                    resolve(text);
                }
            }

        });
    }

    function analysisText(text) {

        var $ = cheerio.load(text, {decodeEntities: false});
        var list = $('#content table tr td.odd:nth-of-type(2) a');

        if (!list.length) {
            console.log('结束请求');
            return null;
        }

        var promisesALl = list.map(function (index, item) {
            return models.novelList.findOrCreate({
                where: {
                    title: $(item).text(),
                    link: $(item).attr('href')
                }
            })
        });

        return Q.all(promisesALl);

    }

    function getIndex(index) {
        return getText(index)
            .then(analysisText)
            .then(function (isGoOn) {
                if (isGoOn) {
                    return getIndex(++index);
                }
            }).catch(function (err) {
                console.log(err);
                var reg = /出错页数:\s(\d+)/;
                var match = reg.exec(err);
                if (match && match.length == 2) {
                    console.log('重新发送请求');
                    getIndex(match[1]);
                }
            });
    }

};