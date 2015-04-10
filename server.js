
var express = require('express');
var proxy = require('express-http-proxy');
var data = require('./mock-data');
var app = express();
// 全局设置 CORS
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// 静态资源
app.use('/stars/', express.static(__dirname));



// 主站的 layout
app.use(/^(?!\/stars\/)/,function(req, res) {
  console.log(__dirname)
  res.sendFile(__dirname + '/web/html/index.html');
});

// 其它情况


app.listen(9090,function() {
  console.log('web open at 9090');
});

app.get('/stars/provices', data.provinces);
app.get('/stars/cities', data.cities);
app.get('/stars/counties', data.counties);
app.post('/stars/user', data.postUsers);
app.get('/stars/user', data.list);
app.delete('/stars/user', data.postUsers);


