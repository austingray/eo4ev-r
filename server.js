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

  socket.on('input', function (data) {
  	var x = 0;
		var y = 0;
		var z = 0;
  	var walking = true;
  	var mSpeed = 1.55;
  	var cUp = data[0];
  	var cRight = data[1];
  	var cDown = data[2];
  	var cLeft = data[3];
  	if (cLeft) {
			cRot = -1.6;
		}
		if (cRight) {
			cRot = 1.6;
		}
		if (cDown) {
			cRot = 0;
		}
		if (cUp) {
			cRot = 3.20;
		}
		if (cLeft && cDown) {
			cRot = -0.8;
			mSpeed = 1;
		}
		if (cLeft && cUp) {
			cRot = -2.4;
			mSpeed = 1;
		}
		if (cRight && cDown) {
			cRot = 0.8;
			mSpeed = 1;
		}
		if (cRight && cUp) {
			cRot = 2.4;
			mSpeed = 1;
		}
		for (var i = 0; i < user_map.length; i++) {
  		if (socketid === user_map[i]) {

				if (cLeft) x = x - mSpeed;
				if (cRight) x = x + mSpeed;
				if (cDown) y = y - mSpeed;
				if (cUp) y = y + mSpeed;

				if ( cUp === false && cRight === false && cDown === false && cLeft === false) {
					walking = false;
				}
  			
  			var uname = user_arr[socketid].name;
  			if (typeof char_pos[i] != 'undefined') {
  				var old_pos = char_pos[i].pos;
  			} else {
  				var old_pos = {x: 0, y: 0, z: 0};
  			}
  			if (typeof cRot === 'undefined') {
  				if (typeof char_pos[i] === 'undefined') {
  					cRot = 0;
  				} else {
  					cRot = char_pos[i].rot;
  				}
  			}
  			var new_pos = {};
  			new_pos.x = old_pos.x + x;
  			new_pos.y = old_pos.y + y;
  			new_pos.z = old_pos.z + z;
  			char_pos[i] = {
  				walking: walking,
  				name: uname,
  				rot: cRot,
  				pos: new_pos
  			};
  		}
  	}
  });

  socket.on('disconnect', function () {
  	
  	var index = user_map.indexOf(socketid);
  	if (index > -1) {
  		var uname = user_arr[socketid].name;
  		for (var i = 0; i < user_map.length; i++) {
  			char_pos.splice(i, 1);
  		}
  		user_map.splice(index, 1);
  		delete user_arr[socketid];
  	}
		io.emit('disconnect', {name: uname});
    io.emit('user disconnected');
  });
//end io
});

setInterval(function() {
	io.emit('update', {pos: char_pos});
}, 33);

setInterval(function() {
	//console.log(char_pos);
}, 5000);



//game stuffz
var GAME = {};
GAME.map = {};
GAME.map.init = function() {
	this.width = 16;
	this.height = 16;
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