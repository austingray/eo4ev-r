//utils
//eventually we will replace this method with manually constructing the cloned object, eg:
//var clonedObject = {
//  knownProp: obj.knownProp,
//  ...
//}
//via http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object/5344074#5344074
//current implementation via http://stackoverflow.com/questions/12690107/clone-object-without-reference-javascript
var clone_object = require('./util/clone_object');

//let's phase out the old arrays with users object
var user_map = [];
var users = {};


var translateLocalView = function(socket_id) {

  var user = users[socket_id];
  if (typeof user == 'undefined') {
    return false;
  }
  var localArray = {};
  if (typeof user.view != 'undefined') {
    localArray.offset = user.view.pos;
  } else {
    localArray.offset = {x:0, y:0, z:0};
  }
  localArray.users = [];
  
  for (var i = 0; i < user_map.length; i++) {
    var add_user_to_local_view = false;
    var check_this_user = users[user_map[i]];
    if (check_this_user.name === user.name) {
      if (user.view) {
        check_this_user = clone_object(user);
        //check_this_user.view.pos = {x:0, y:0, z:0};
      }
      add_user_to_local_view = true;
    };
    if (typeof check_this_user.view !== 'undefined' && typeof user.view !== 'undefined' && check_this_user.view.pos.x - user.view.pos.x < 100 && check_this_user.view.pos.y - user.view.pos.y < 100) {
      add_user_to_local_view = true;
    }
    if (add_user_to_local_view === true) {
      localArray.users.push(check_this_user);
    }
  }

  return localArray;

}

var sendMapChunk = function(socket_id) {

  var user = users[socket_id];
  if (typeof user == 'undefined') {
    return false;
  }

  var mapOffset = {x:0, y:0, z:0};
  if (typeof user.view != 'undefined') {
    var mapOffset = user.view.pos;
  }

  var currentTile = {
    x: Math.floor((GAME.map.width / 2) + (localArray.offset.x / 64)),
    y: Math.floor((GAME.map.height / 2) + (localArray.offset.y / 64))
  };
  var map = [];
  for (var i = currentTile.x - 10; i < currentTile.x + 11; i++) {
    map[i] = [];
    for (var j = currentTile.y - 10; j < currentTile.y + 11; j++) {
      map[i][j] = GAME.map.array[i][j];
    }
  }

  return map;
  
}



/**
 * Invoked whenever a user connects to the server
 * @param  {string} socket_id socket.io generated user id
 * @return {void}
 */
var initNewConnection = function(socket_id) {
  var user = {};
  user.name = 'Guest'+Math.floor(Math.random() * 100000);
  user_map.push(socket_id);
  users[socket_id] = user;
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

  var old_view = users[socket_id].view;

  if (typeof old_view != 'undefined') {
    old_pos = old_view.pos;
  }
  if (typeof cRot === 'undefined') {
    if (typeof old_view === 'undefined') {
      cRot = 0;
    } else {
      cRot = old_view.rot;
    }
  }

  var new_pos = {
    x: old_pos.x + pos.x,
    y: old_pos.y + pos.y,
    z: old_pos.z + pos.z
  };

  view = {
    walking: walking,
    rot: cRot,
    pos: new_pos
  };

  users[socket_id].view = view;

  return;
}

//game stuffz
var GAME = {};
GAME.map = {};
GAME.map.init = function() {
  this.width = 1000;
  this.height = 1000;
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

//io
module.exports = function(io) {
  //socket.io connection handler
  io.on('connection', function (socket) {

    //init connection
    initNewConnection(socket.id);
    //emit 'join' tells client to EO.init();
    socket.emit('join');
    //join unique channel
    socket.join(users[socket.id].name);
    //send MotD
    socket.emit( 'news', { message: 'Welcome to EO!' });
    //announce new user
    socket.broadcast.emit(users[socket.id].name + ' has joined the room!');
    //chat handler
    socket.on('chat', function (data) {
      io.emit('chat', { user: users[socket.id].name, message: data.message });
    });

    //input handler
    socket.on('input', function (data) {
      //calculate movements
      var movement = calculateMovement(data);
      movement.socket_id = socket.id;
      //update user position in global array
      updateUserPos(movement);
    });

    //disconnect handler
    socket.on('disconnect', function () {
      var index = user_map.indexOf(socket.id);
      if (index > -1) {
        var uname = users[socket.id].name;
        user_map.splice(index, 1);
        delete users[socket.id];
      }
      io.emit('disconnect', {name: uname});
      console.log(uname + ' has disconnected.');
    });

    setInterval(function() {
      var localView = translateLocalView(socket.id);
      if (typeof users[socket.id] !== 'undefined') {
        io.sockets.in(users[socket.id].name).emit('update', {localView: localView});
      }
    }, 33);

  //end io
  });
}
