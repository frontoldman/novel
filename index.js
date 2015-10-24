/**
 * Created by zhangran on 15/10/23.
 */

var koa = require('koa');
var route = require('koa-route');
var lib = require('./lib/index');

global.config = require('./config');

var libs = lib();

var app = koa();

app.use(route.get('/list', function *(next) {
    this.body = 'success';
}));

app.listen(5000);
console.log('listening on port 5000');
