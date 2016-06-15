/**
 *
 *  SERVER.players  *** contains all data about currently connected players
 *
 *  SERVER.view  *** namespace for all server computations
 *    .localView  *** the function that handles each players current view data, this is called and returns an object that is sent to the player
 *    .playerView  *** determines which other players a current player should see, and returns that object data
 *    .mapView *** determines the map data that a current player should see, and returns that object data, returns an array of map grids, translated to planes on client's view
 *
 *  SERVER.socket  *** socket handler, contains all socket interactions, used as the module export
 * 
 */

var Promise = require('bluebird');

var Characters = require('../db/characters.js');
var Maps = require('../db/maps.js');

var SERVER = {};

//////////////////////
// database methods //
//////////////////////
SERVER.db = {};
SERVER.db.fetchUser = function(socket, callback) {
  new Characters({ id: socket.request.user.current_character }).fetch().then(function(model) {

    if (model === null) {
      console.log('user logged in to game with character that does not exist!!!!');
      return false;
    }

    var user_data = model.toJSON();

    var user = {};
    user.name = user_data.name;
    user.hsl = {};
    user.hsl.h = user_data.hue;
    user.hsl.s = user_data.saturation;
    user.hsl.l = user_data.lightness;
    user.view = {};
    user.view.pos = user_data.position;
    user.view.rot = 0;
    user.view.walking = false;

    callback(user);

  });
}

SERVER.db.FetchMapChunk = function(chunkArray, callback) {

  var total = chunkArray.length;
  var chunkData = [];

  while (chunkArray.length > 0) {
    var singleMapTile = chunkArray.shift();
    new Maps({ x: singleMapTile.x, y: singleMapTile.y }).fetch({ withRelated: ['tile'] }).then(function(model) {
      if (model === null) {
        singleMapTile.name = "blank";
        chunkData.push(singleMapTile);
      } else {
        chunkData.push(model.toJSON());
      }
      if (chunkData.length === total) {
        callback(chunkData);
      }
    });
  }

}

////////////////////////////////////////
// Contains all connected player data //
////////////////////////////////////////
SERVER.players = {};
SERVER.players.data = {};
SERVER.players.index = [];
SERVER.players.create = function(socket, callback) {
  SERVER.db.fetchUser(socket, function(user) {
    
    SERVER.players.index.push(socket.id);
    SERVER.players.data[socket.id] = user;

    callback();

  });
}
SERVER.players.delete = function() {

}
//currently handles player input, maybe want to route this in its own namespace
SERVER.players.updatePlayer = function(socket_id, inputs) {
  
  var walking = false;
  var cRot;
  var mSpeed = 1.55;
  var cUp = inputs[0]; var cRight = inputs[1]; var cDown = inputs[2]; var cLeft = inputs[3];
  var pos = { x: 0, y: 0, z: 0 };

  if (cDown) { cRot = 0; walking = true; }
  if (cUp) { cRot = 3.20; walking = true; }
  if (cLeft) { cRot = -1.6; walking = true;
    if (cDown) { cRot = -0.8; mSpeed = 1; }
    if (cUp) { cRot = -2.4; mSpeed = 1; }
  }
  if (cRight) { cRot = 1.6; walking = true;
    if (cDown) { cRot = 0.8; mSpeed = 1; }
    if (cUp) { cRot = 2.4; mSpeed = 1; }
  }
  if (cDown) pos.y = pos.y - mSpeed;
  if (cUp) pos.y = pos.y + mSpeed;
  if (cLeft) pos.x = pos.x - mSpeed;
  if (cRight) pos.x = pos.x + mSpeed;

  var old_pos = { x: 0, y: 0,  z: 0 };
  var old_view = SERVER.players.data[socket_id].view;

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

  var new_pos = { x: old_pos.x + pos.x, y: old_pos.y + pos.y, z: old_pos.z + pos.z };

  view = {
    walking: walking,
    rot: cRot,
    pos: new_pos
  };

  SERVER.players.data[socket_id].view = view;

};

//////////////////////////////////////////////////////////
// Calculates the scene data that the user will display //
//////////////////////////////////////////////////////////
SERVER.view = {};
SERVER.view.localView = function(socket_id) {

  //check current users position
  var player = SERVER.players.data[socket_id];
  if (typeof player === 'undefined') return false;
  
  //do dat local view
  localView = {};
  localView.players = this.playerView(player);
  localView.maps = this.mapView(player);

  return localView;

}
SERVER.view.playerView = function(player) {

  var playerView = [];
  for (var i = 0; i < SERVER.players.index.length; i++) {
    //loop through all connected players // eventually should break into testing zones/regions, 
    var player_is_visible = false;
    var key = SERVER.players.index[i];
    var player_check = SERVER.players.data[key];
    //check if this is our current player so camera knows who to focus on
    player_check.isPlayer = false;
    if (player_check.name === player.name) player_check.isPlayer = true;
    //if (isCloseEnough(player, player_check)) { 
    playerView.push(player_check);
    //};
  }

  return playerView;

}
SERVER.view.mapView = function(player) {

  return player.view.pos;

  //return false;
}

/////////////////////////////////////
// Handles all socket input output //
/////////////////////////////////////
SERVER.socket = function(data) {

  //io
  const io = data.io;
  //session
  const io_session = data.io_session;
  io.use(io_session);
  //connection handler
  io.on('connection', function (socket) {

    console.log(socket.request.user);

    //init connection
    SERVER.players.create(socket, function() {

      //send join notice plus first chunk
      SERVER.map.SendChunk(socket, function (chunkData) {
        //emit 'join' tells client to EO.init();
        socket.emit('join', { chunk: chunkData });
        //player logged in message
        io.emit('news', { message: socket.request.user.username + ' has joined the fray!' } );
        //join unique channel
        socket.join(SERVER.players.data[socket.id].name);
        //send MotD
        socket.emit( 'news', { message: 'Welcome to EO!' });
        //announce new user
        socket.broadcast.emit(SERVER.players.data[socket.id].name + ' has joined the room!');
        //chat handler
        socket.on('chat', function (data) {
          io.emit('chat', { user: socket.request.user.username, message: data.message });
        });
        //input handler
        socket.on('input', function (data) {
          SERVER.players.updatePlayer(socket.id, data);
        });


        //test
        setInterval(function() {
          SERVER.map.SendChunk(socket, function(chunkData) {
            io.sockets.in( SERVER.players.data[socket.id].name ).emit( 'chunk' , { chunk: chunkData } );
          })
        }, 5000);
      });

    });

    //disconnect handler
    socket.on('disconnect', function () {

      //TODO: save users state to the database

      io.emit('news', { message: socket.request.user.username + ' has returned to the mundane world.' } );
      var index = SERVER.players.index.indexOf(socket.id);
      if (index > -1) {
        var uname = SERVER.players.data[socket.id].name;
        SERVER.players.index.splice(index, 1);
        delete SERVER.players.data[socket.id];
      }
      io.emit('disconnect', {name: uname});
      console.log(uname + ' has disconnected.');
    });

    setInterval(function() {
      if (typeof SERVER.players.data[socket.id] !== 'undefined') {
        io.sockets.in( SERVER.players.data[socket.id].name ).emit( 'update' , { localView: SERVER.view.localView(socket.id) } );
      }
    }, 33);

  //end io
  });

}

SERVER.map = {};

SERVER.map.chunk = {};
SERVER.map.chunk.size = 20; //20 tiles x 20 tiles

SERVER.map.ChunkArrayFromCenterTileCoords = function (coords) {
  
  var chunkArray = [];

  var offset = SERVER.map.chunk.size / 2;
  var start_x = coords.x - offset;
  var start_y = coords.y - offset;

  for (var i = 0; i < SERVER.map.chunk.size; i++) {
    for (var j = 0; j < SERVER.map.chunk.size; j++) {
      chunkArray.push({
        x: start_x + i,
        y: start_y + j
      });
    }
  }

  return chunkArray;

}

SERVER.map.SendChunk = function(socket, callback) {

  var player = SERVER.players.data[socket.id];
  if (typeof player === 'undefined') return false;

  //calculate current tile is player.pos.x, player.pos.y / 64
  var coords = {
    x: Math.floor(player.view.pos.x / 64),
    y: Math.floor(player.view.pos.y / 64)
  };

  var chunkArray = SERVER.map.ChunkArrayFromCenterTileCoords(coords);

  var chunkData = SERVER.db.FetchMapChunk(chunkArray, function(chunkData) {

    callback(chunkData);

  });

};



//um, ok
var sendMapChunk = function(socket_id) {

  var user = SERVER.players.data[socket_id];
  if (typeof user == 'undefined') {
    return false;
  }

  var mapOffset = {x:0, y:0, z:0};

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


//uhhh delete?
var GAME = {};
GAME.map = {};
GAME.map.init = function() {
  this.width = 1000;
  this.height = 1000;
  this.tile.init();
  this.generate();
  //this.draw();
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


//connect to the app
module.exports = function(io) {
  SERVER.socket(io);
}