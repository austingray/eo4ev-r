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

server.listen(3000);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

var user_map = [];
var char_pos = [];
var user_arr = [];
var pos_arr = [];
var pos_obj = {};

io.on('connection', function (socket) {

	var socketid = socket.id;

	user_map.push(socketid);

	user_arr[socketid] = {};
	user_arr[socketid].name = 'Guest'+Math.floor(Math.random() * 100000);

	console.log('A user has connected');
	//send game map
	io.to(socketid).emit( 'map', GAME.map.array );
	io.to(socketid).emit( 'id', user_arr[socketid].name );
	//send chat greeting
  socket.emit('news', { message: 'Welcome to EO!' });
  socket.broadcast.emit(user_arr[socketid].name + ' has joined the room!');
  socket.on('chat', function (data) {
    //todo: validation
    //assign user
    var msg = data.message;
    io.emit('chat', { user: user_arr[socketid].name, message: msg });
  });

  socket.on('move', function(data) {
  	for (var i = 0; i < user_map.length; i++) {
  		if (socketid === user_map[i]) {
  			var uname = user_arr[socketid].name;
  			if (typeof char_pos[i] != 'undefined') {
  				var old_pos = char_pos[i].pos;
  			} else {
  				var old_pos = {x: 0, y: 0, z: 0};
  			}
  			var new_pos = {};
  			new_pos.x = old_pos.x + data.x;
  			new_pos.y = old_pos.y + data.y;
  			new_pos.z = old_pos.z + data.z;
  			char_pos[i] = {
  				walking: true,
  				name: uname,
  				rot: data.rot,
  				pos: new_pos
  			};
  		}
  	}
  });

  socket.on('stop', function(data) {
  	for (var i = 0; i < user_map.length; i++) {
  		if (socketid === user_map[i]) {
  			char_pos[i].walking = false;
  		}
  	}
  });

});

setInterval(function() {
	io.emit('update', {pos: char_pos});
}, 33);

setInterval(function() {
	console.log(char_pos);
}, 5000);



//game stuffz
var GAME = {};
GAME.map = {};
GAME.map.init = function() {
	this.width = 48;
	this.height = 48;
	this.tile.init();
	this.generate();
	//this.draw();
	//console.log(this.array);
}
GAME.map.generate = function() {
	this.array = [];
	for (var i=0; i<this.width; i++) {
		this.array[i] = [];
		for (var j=0; j<this.height; j++) {
			GAME.map.array[i][j] = this.tile.generate();
		}
	}
}
GAME.map.tile = {};
GAME.map.tile.init = function() {
	this.width = 64;
	this.height = 64;
	this.depth = 1;
}
GAME.map.tile.generate = function() {
	var tile = {};
	tile.width = this.width;
	tile.height = this.height;
	if (Math.random() > .3) {
		tile.material = 'grass';
	} else {
		tile.material = 'water';
	}
	//tile.mesh = new THREE.Mesh( this.geometry, tile.material );
	return tile;
}
GAME.map.init();