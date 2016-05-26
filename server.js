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

/**
 * user_map is an array of socket ids
 * socket.id is pushed on connection
 * used to map the socket.id to user_pos array
 * 
 * @type {Array}
 */
var user_map = [];

/**
 * user_arr is an associative array with socket.id as key
 * this holds all attribute data for the user
 * 
 * @type {Array}
 */
var user_arr = [];

/**
 * user_pos is an array of all user coordinates in the scene
 * @type {Array}
 */
var user_pos = [];

//socket.io connection handler
io.on('connection', function (socket) {

	/**
	 * Add socket.id to user_map
	 * Add socket.id to user_arr
	 * Assign Guest alias
	 */
	initNewConnection(socket.id);
  //send connection data to user
  socket.emit( 'join', { asdf:'asdf'});
  //send MotD
  socket.emit( 'news', { message: 'Welcome to EO!' });
  //announce new user
  socket.broadcast.emit(user_arr[socket.id].name + ' has joined the room!');
	//chat handler
  socket.on('chat', function (data) {
    io.emit('chat', { user: user_arr[socket.id].name, message: data.message });
  });

  //input handler
  socket.on('input', function (data) {
    //calculate movements
    var movement = calculateMovement(data);
    //add socket_id to movement object
    movement.socket_id = socket.id;
    //update user position in global array
    updateUserPos(movement);
  });

  //disconnect handler
  socket.on('disconnect', function () {
  	var index = user_map.indexOf(socket.id);
  	if (index > -1) {
  		var uname = user_arr[socket.id].name;
  		for (var i = 0; i < user_map.length; i++) {
  			user_pos.splice(i, 1);
  		}
  		user_map.splice(index, 1);
  		delete user_arr[socket.id];
  	}
    io.emit('disconnect', {name: uname});
    console.log(uname + ' has disconnected.');
  });

//end io
});

setInterval(function() {
	sendUpdate();
}, 33);

var sendUpdate = function() {
  io.emit('update', {pos: user_pos});
  //get users position
  //loop through map and send map data inside viewport
  //loop through users and send back user inside viewport
  //get all map items inside viewport
  //
}

setInterval(function() {
	//console.log(user_pos);
}, 5000);

/**
 * Invoked whenever a user connects to the server
 * @param  {string} socket_id socket.io generated user id
 * @return {void}
 */
var initNewConnection = function(socket_id) {
	user_map.push(socket_id);
	user_arr[socket_id] = {};
	user_arr[socket_id].name = 'Guest'+Math.floor(Math.random() * 100000);
	console.log(user_arr[socket_id].name + ' has connected');
  return;
}

var calculateMovement = function(inputs) {

  var walking = false;
  var cRot;
  var mSpeed = 1.55;
  var cUp = inputs[0];
  var cRight = inputs[1];
  var cDown = inputs[2];
  var cLeft = inputs[3];
  var pos = {
    x: 0,
    y: 0,
    z: 0
  };

  if (cDown) {
    cRot = 0;
    walking = true;
  }
  if (cUp) {
    cRot = 3.20;
    walking = true;
  }
  if (cLeft) {
    cRot = -1.6;
    walking = true;
    if (cDown) {
      cRot = -0.8;
      mSpeed = 1;
    }
    if (cUp) {
      cRot = -2.4;
      mSpeed = 1;
    }
  }
  if (cRight) {
    cRot = 1.6;
    walking = true;
    if (cDown) {
      cRot = 0.8;
      mSpeed = 1;
    }
    if (cUp) {
      cRot = 2.4;
      mSpeed = 1;
    }
  }

  if (cDown) pos.y = pos.y - mSpeed;
  if (cUp) pos.y = pos.y + mSpeed;
  if (cLeft) pos.x = pos.x - mSpeed;
  if (cRight) pos.x = pos.x + mSpeed;

  var movements = {
    cRot: cRot,
    mSpeed: mSpeed,
    pos: pos,
    walking: walking
  }

  return movements;
}

function updateUserPos(movement) {

  var old_pos = {
    x: 0,
    y: 0, 
    z: 0
  };
  
  var cRot = movement.cRot;
  var mSpeed = movement.mSpeed;
  var walking = movement.walking;
  var pos = movement.pos;
  var socket_id = movement.socket_id;
  
  for (var i = 0; i < user_map.length; i++) {
    if (socket_id === user_map[i]) {
        
      var name = user_arr[socket_id].name;
      if (typeof user_pos[i] != 'undefined') {
        var old_pos = user_pos[i].pos;
      }
      
      if (typeof cRot === 'undefined') {
        if (typeof user_pos[i] === 'undefined') {
          cRot = 0;
        } else {
          cRot = user_pos[i].rot;
        }
      }
      
      var new_pos = {
        x: old_pos.x + pos.x,
        y: old_pos.y + pos.y,
        z: old_pos.z + pos.z
      };

      user_pos[i] = {
        name: name,
        walking: walking,
        rot: cRot,
        pos: new_pos
      };

    }
  }

  return;
}

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