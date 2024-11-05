const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use('/api', createProxyMiddleware(
  {
    target: 'http://server:4000/',
    changeOrigin: true,
      // logLevel: 'debug',
	  pathRewrite: {
		  'api': ''
	  }

  }));

app.use('/www', createProxyMiddleware(
  {
    target: 'http://www.microsoft.com',
    changeOrigin: true,
      // logLevel: 'debug'

  }));


app.use('/', createProxyMiddleware(
    {
      target: 'http://web:3000',
      changeOrigin: true,
      secure: false,
      ws: true,
      // logLevel: 'debug'
    }));
  


const PORT = process.env.PORT;
app.listen(PORT);


// var proxy = require('express-http-proxy');
// var app = require('express')();


// app.use("/api", proxy('http://server:5000',{
//   proxyErrorHandler: function(err, res, next) {
//     switch (err && err.code) {
//       case 'ECONNRESET':    { return res.status(405).send('504 became 405'); }
//       case 'ECONNREFUSED':  { return res.status(200).send('gotcher back'); }
//       default:              { next(err); }
//     }
// }}));

// app.use("/", proxy('http://client:3000',{
//   proxyErrorHandler: function(err, res, next) {
//     switch (err && err.code) {
//       case 'ECONNRESET':    { return res.status(405).send('504 became 405'); }
//       case 'ECONNREFUSED':  { return res.status(200).send('gotcher back'); }
//       default:              { next(err); }
//     }
// }}));

