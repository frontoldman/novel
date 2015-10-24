/**
 * Created by zhangran on 15/10/24.
 */

var request = require('request');
var iconv = require('iconv-lite');
var cheerio = require('cheerio');
var Q = require('q');

module.exports = function (models) {

    getIndex(1);

    function getText(index) {
        var url = 'http://tianyibook.com/tianyibooksort20/0/' + index + '.htm';
        return curl(url,index);
    }

    function analysisText(obj) {

        var $ = cheerio.load(obj.text, {decodeEntities: false});
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
                    //return getIndex(++index);
                } else {
                    getDetail();

                }

                getDetail()
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

    function getDetail() {
        getAllList()
            .then(getParagraphs)


    }

    function getAllList() {
        return models.novelList.findAll({});
    }


    function getParagraphs(pList) {
        var outerIndex = 0;

        run();

        function run() {
            return getParagraphEnter()
                .then(analysisEnter)
                .then(getAllParagraph)
                .then(function () {
                    //if(++outerIndex < pList.length){
                    if (++outerIndex < 2) {
                        return run();
                    }else{
                        getContent();
                    }
                })
                .catch(function (error) {
                    console.log(error);
                    var reg = /出错页数:\s(\d+)/;
                    var match = reg.exec(err);
                    if (match && match.length == 2) {
                        console.log('重新发送请求');
                        run();
                    }
                })
        }


        function getParagraphEnter() {
            var url = pList[outerIndex].link;
            return curl(url);
        }

        function analysisEnter(obj) {
            var $ = cheerio.load(obj.text, {decodeEntities: false});
            var bt1 = $('#bt_1 a');

            return curl(bt1.attr('href'));
        }

        function getAllParagraph(obj) {
            var $ = cheerio.load(obj.text, {decodeEntities: false});
            var list = $('table td.ccss a');


            var promiseAll = list.map(function (index, item) {
                return models.novelDetail.findOrCreate({
                    where: {
                        paragraph: $(item).text(),
                        link: obj.url + $(item).attr('href'),
                        list_id: pList[outerIndex].id
                    }
                });
            });

            return promiseAll;

        }
    }

    //getDetail();

    function getContent() {
        models.novelDetail.findAll({})
            .then(getContentText)

    }


    function getContentText(pList) {
        var index = 0;

        run();

        function run() {
            curl(pList[index].link)
                .then(function (obj) {
                    var $ = cheerio.load(obj.text, {decodeEntities: false});
                    var content = $('#content');
                    pList[index].content = content.html();
                    return pList[index].save();
                })
                .then(function () {
                    if (++index < pList.length) {
                        return run();
                    }
                })
                .catch(function (error) {
                    console.log(error);
                    var reg = /出错页数:\s(\d+)/;
                    var match = reg.exec(err);
                    if (match && match.length == 2) {
                        console.log('重新发送请求');
                        run();
                    }

                });
        }


    }

    //getContent();

    function curl(url,index) {

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
                    resolve({text, url});
                }
            }
        });
    }

}