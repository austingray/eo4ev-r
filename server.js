var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var fs = require('fs');
var util = require('util');
var app = express();
var bcrypt = require('bcrypt');
var moment = require('moment');
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var server = require('http').Server(app);
var io = require('socket.io')(server);
var pug = require('pug');

//environemt variables
process.env.TZ = 'UTC';
if (app.get('env') === 'development') {
  process.env.PG_CONNECTION_STRING = "";
}

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
//app.use(favicon(__dirname + '/public/favicon.ico'));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({
    secret: 'to be or not to be!?',
    resave: false,
    saveUninitialized: false
}));
app.use(express.static(path.join(__dirname, 'public')));

server.listen(8081);

//routes
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

//server logic
var engine = require('./server_inc/engine')(io);