/**
 * Created by zhangran on 15/10/24.
 */

var request = require('request');
var iconv = require('iconv-lite');
var cheerio = require('cheerio');


module.exports = function (models) {

    init();

    function init(){
        getText()
            .then(analysisText)
            .then(getDetail)
            .catch(function (err) {
                console.log(err);
            });
    }


    function getText() {
        return new Promise(function (resolve, reject) {
            var stream = request({
                url: 'http://tianyibook.com/tianyibook/42/42073/index.html'
            });
            var bufs = [];
            stream.on('data', function (d) {
                bufs.push(d);
            });
            stream.on('end', function () {
                var buf = Buffer.concat(bufs);
                var str = iconv.decode(buf, 'gbk');

                resolve(str);
            })
        });
    }


    function analysisText(text) {

        var $ = cheerio.load(text);
        var list = $('table td.ccss a');

        var titles = list.map((index, item) => ({
            title: $(item).text(),
            link: $(item).attr('href')
        }));

        return models.novelList.bulkCreate(Array.from(titles));
    }

    function getDetail(titles) {

        var index = 0;

        return getContent();

        function getContent() {
            var item = titles[index];

            return new Promise(function (resolve, reject) {
                var stream = request({
                    url: 'http://tianyibook.com/tianyibook/42/42073/' + item.link
                });

                console.log('http://tianyibook.com/tianyibook/42/42073/' + item.link);

                var bufs = [];
                //stream.on('data', function(d){ bufs.push(d); });
                stream.on('data', d => bufs.push(d));
                stream.on('end', function () {
                    var buf = Buffer.concat(bufs);
                    var str = iconv.decode(buf, 'gbk');
                    resolve(str);
                });

                stream.on('error', function () {
                    console.log('http://tianyibook.com/tianyibook/42/42073/' + item.link);
                })
            }).then(function (text) {
                    var $ = cheerio.load(text,{decodeEntities: false});
                    var content = $('#content');

                    return models.novelList.update(
                        {
                            content: content.html()
                        },
                        {
                            where: {
                                link: item.link
                            }
                        }
                    )
                },getContent)
            .then(function(){
                    index++;
                    if(index+1 < titles.length){
                        getContent();
                    }
                },getContent)

        }


    }
}