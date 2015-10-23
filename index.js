/**
 * Created by zhangran on 15/10/23.
 */

var Stream = require('stream')
var koa = require('koa');
var route = require('koa-route');
var request = require('request');
var iconv = require('iconv-lite');
var cheerio = require('cheerio');
var lib = require('./lib/index');

global.config = require('./config');

lib();

var app = koa();

app.use(route.get('/list', function *(next) {
    var text = yield getText();
    var list = yield analysisText(text);
    this.body = list;
}));

function getText() {
    return new Promise(function(resolve,reject){
        var stream = request({
            url:'http://tianyibook.com/tianyibook/42/42073/index.html'
        });
        var bufs = [];
        stream.on('data', function(d){ bufs.push(d); });
        stream.on('end', function() {
            var buf = Buffer.concat(bufs);
            var str = iconv.decode(buf,'gbk');
            resolve(str);
        })
    });
}

function analysisText(text){
    var $ = cheerio.load(text);
    var list = $('table tr td.ccss a');
    var titles = list.map((index,item) => ({
        title:$(item).text(),
        link:$(item).attr('href')
    }));


    return function(fn){
        fn(null,'hi');
    }
}

app.listen(5000);
console.log('listening on port 5000');
