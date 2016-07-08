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

var Users = require('../db/users.js');
var Characters = require('../db/characters.js');
var Maps = require('../db/maps.js');
var Assets = require('../db/assets.js');

var SERVER = {};

SERVER.util = {};
SERVER.util.floorX = function(x) {
  return Math.floor((x + 32) / 64);
}
SERVER.util.floorY = function(y) {
  return Math.floor((y + 32) / 64);
}

//////////////////////
// database methods //
//////////////////////
SERVER.db = {};
SERVER.db.fetchUser = function(socket, callback) {
  new Characters({ id: socket.request.user.current_character }).fetch({withRelated: ['current_model']}).then(function(model) {

    if (model === null) {
      console.log('user logged in to game with character that does not exist!!!!');
      return false;
    }

    var user_data = model.toJSON();
    if (user_data.current_model == null) {
      var current_model_name = 1;
    } else {
      var current_model_name = user_data.current_model;
    }

    var user = {};
    user.name = user_data.name;
    user.current_model = current_model_name;
    user.hsl = {};
    user.hsl.h = user_data.hue;
    user.hsl.s = user_data.saturation;
    user.hsl.l = user_data.lightness;
    user.view = {};
    user.view.pos = user_data.position;
    user.view.rot = 0;
    user.view.walking = false;
    user.speed = 1;

    callback(user);

  });
}

SERVER.db.fetchUserAccess = function(user_id, callback) {
  new Users({ id: user_id }).fetch().then(function(model) {
    var user = model.toJSON();
    callback(user.access);
  });
}

SERVER.db.FetchMapChunk = function(chunkRect, callback) {

  //var total = chunkArray.length;
  var chunkData = [];

  new Maps().inRectangle({ x: chunkRect.x, y: chunkRect.y, width: chunkRect.width, height: chunkRect.height }).fetchAll().then(function(model) {
    var results = model.toJSON();
    if (results.length < SERVER.map.chunk.size*SERVER.map.chunk.size) {

      //patch missing values
      var patched = [];

      for (var i = 0; i < SERVER.map.chunk.size; i++) {
        for (var j = 0; j < SERVER.map.chunk.size; j++) {

          var test_x = chunkRect.x + i;
          var test_y = chunkRect.y + j;

          var db_tile = {};
          var tile_exists_in_db = false;

          for (k = 0; k < results.length; k++) {
            if (results[k].x === test_x && results[k].y === test_y) {
              tile_exists_in_db = true;
              db_tile = results[k];
            }
          }

          if (tile_exists_in_db) {
            patched.push(db_tile);
          } else {
            patched.push({
              id: 0,
              x: test_x,
              y: test_y,
              height: 0,
              blocking: false,
              tile_id: 0
            });
          }

        }
      }

      //console.log(patched);
      callback(patched);

    } else {

      //results are full, no need to patch
      //console.log(results);
      callback(results);

    }
  });

}

SERVER.db.updateTile = function(user_id, tile, callback) {
  SERVER.db.fetchUserAccess(user_id, function(user_access) {

    if (user_access > 2) {

      // new Characters({id: req.user.current_character}).fetch().then(function(model) {
        // var char = model.toJSON();
        // var char_pos = char.position;
        // var tile_x = Math.floor( ( Number(char_pos.x) + Number(sanitize(req.body.x)) ) / 64 );
        // var tile_y = Math.floor( ( Number(char_pos.y) + Number(sanitize(req.body.y)) ) / 64 );
        var tile_x = Math.floor( Number(tile.x) / 64 );
        var tile_y = Math.floor( Number(tile.y) / 64 );
        Maps.query(function(qb) {
          qb.where('x', '=', tile_x)
            .andWhere('y', '=', tile_y)
        }).fetch().then(function(model) {
          if (model == null) {
            new Maps({ x: tile_x, y: tile_y, height: 0, blocking: false, tile_id: Number(tile.tile_id) }).save().then(function(map_tile) {
              callback();
            });
          } else {
            var map = model.toJSON();
            var map_id = map.id;
            new Maps({ id: map_id }).save({
              tile_id: Number( tile.tile_id )
            }, {patch: true}).then(function(model) {
              callback();
            });
          }
        })
      // });

    }

  });
}


SERVER.db.multiTilesArr = [];
SERVER.db.multiTilesFuncArr = [];
SERVER.db.multiTilesComp = 0;
SERVER.db.multiTilesFunc = function(i) {
  return function() {

    var tile = SERVER.db.multiTilesArr[i];

    // var tile_x = Math.floor( Number(tile.x) / 64 );
    // var tile_y = Math.floor( Number(tile.y) / 64 );

    Maps.query(function(qb) {
      qb.where('x', '=', tile.x)
        .andWhere('y', '=', tile.y)
    }).fetch().then(function(model) {
      if (model == null) {
        new Maps({ x: SERVER.db.multiTilesArr[i].x, y: SERVER.db.multiTilesArr[i].y, height: 0, blocking: SERVER.db.multiTilesArr[i].blocking, tile_id: Number(tile.tile_id) }).save().then(function(map_tile) {
          // callback();
          SERVER.db.multiTilesComp++;
          if (SERVER.db.multiTilesComp === SERVER.db.multiTilesFuncArr.length) {
            SERVER.db.multiTilesCallback();
          }
        });
      } else {
        var map = model.toJSON();
        var map_id = map.id;
        new Maps({ id: map_id }).save({
          tile_id: Number( tile.tile_id ),
          blocking: tile.blocking
        }, {patch: true}).then(function(model) {
          // callback();
          SERVER.db.multiTilesComp++;
          if (SERVER.db.multiTilesComp === SERVER.db.multiTilesFuncArr.length) {
            SERVER.db.multiTilesCallback();
          }
        });
      }
    });

  }
}
SERVER.db.updateMultiTile = function(user_id, tiles, callback) {
  SERVER.db.fetchUserAccess(user_id, function(user_access) {

    if (user_access > 2) {

      SERVER.db.multiTilesArr = [];
      SERVER.db.multiTilesFuncArr = [];
      SERVER.db.multiTilesComp = 0;
      SERVER.db.multiTilesCallback = callback;

      for (var i = tiles.start_x; i < tiles.start_x + tiles.width; i++) {
        for (var j = tiles.start_y; j < tiles.start_y + tiles.height; j++) {

          var tile = {
            x: i,
            y: j,
            tile_id:  tiles.tile_id,
            blocking: tiles.blocking,
          }

          SERVER.db.multiTilesArr.push(tile);

        }
      }

      for (var k = 0; k < SERVER.db.multiTilesArr.length; k++) {
        SERVER.db.multiTilesFuncArr[k] = SERVER.db.multiTilesFunc(k);
      }

      for (var l = 0; l < SERVER.db.multiTilesArr.length; l++) {
        SERVER.db.multiTilesFuncArr[l]();
      }

    }

  });
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
SERVER.players.delete = function(socket) {

  var char_id = socket.request.user.current_character

  var position = SERVER.players.data[socket.id].view.pos;

  var insert_position = {
    x: position.x,
    y: position.y,
    z: position.z
  };

  new Characters({ id: char_id }).save({ position: JSON.stringify({ x: position.x, y: position.y, z: position.z }) }, { patch: true }).then(function(model) {
    var index = SERVER.players.index.indexOf(socket.id);
    if (index > -1) {
      var uname = SERVER.players.data[socket.id].name;
      SERVER.players.index.splice(index, 1);
      delete SERVER.players.data[socket.id];
    }
    console.log(uname + ' has disconnected.');
  });

}
//currently handles player input, maybe want to route this in its own namespace
SERVER.players.updatePlayer = function(socket_id, inputs) {

  var walking = false;
  var cRot;
  var speedMulti = SERVER.players.data[socket_id].speed;
  var mSpeed = 1.55 * speedMulti;
  var mSpeedDiag = 1 * speedMulti;
  var cUp = inputs[0]; var cRight = inputs[1]; var cDown = inputs[2]; var cLeft = inputs[3];
  var pos = { x: 0, y: 0, z: 0 };

  if (cDown) { cRot = 0; walking = true; }
  if (cUp) { cRot = 3.20; walking = true; }
  if (cLeft) { cRot = -1.6; walking = true;
    if (cDown) { cRot = -0.8; mSpeed = mSpeedDiag; }
    if (cUp) { cRot = -2.4; mSpeed = mSpeedDiag; }
  }
  if (cRight) { cRot = 1.6; walking = true;
    if (cDown) { cRot = 0.8; mSpeed = mSpeedDiag; }
    if (cUp) { cRot = 2.4; mSpeed = mSpeedDiag; }
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

  var p = { x: old_pos.x + pos.x, y: old_pos.y + pos.y, z: old_pos.z + pos.z };

  var updateChunk = false;
  if (walking) {
    //var c_x = Math.floor(p.x / 64);
    var c_x = SERVER.util.floorX(p.x);
    //var c_y = Math.floor(p.y / 64);
    var c_y = SERVER.util.floorY(p.y);
    for (var z = 0; z < SERVER.players.data[socket_id].chunkData.length; z++) {
      if (SERVER.players.data[socket_id].chunkData[z].x === c_x && SERVER.players.data[socket_id].chunkData[z].y === c_y) {
        var check_this = SERVER.players.data[socket_id].chunkData[z];
        break;
      }
    }
    if (typeof check_this !== 'undefined' && check_this.blocking) {
      p.x = old_pos.x;
      p.y = old_pos.y;
    }
    //check for chunks
    var c = SERVER.players.data[socket_id].lastChunk;

    var left_edge = Math.abs(p.x / 64 - c.x);
    var right_edge = Math.abs(Number(c.width) + c.x - p.x / 64);
    var top_edge = Math.abs(Number(c.height) + c.y - p.y / 64);
    var bottom_edge = Math.abs(p.y / 64 - c.y);

    if (left_edge < 10 || right_edge < 10 || top_edge < 15 || bottom_edge < 15) {
      var updateChunk = true;
    }
  }

  view = {
    walking: walking,
    rot: cRot,
    pos: p
  };

  SERVER.players.data[socket_id].view = view;

  return updateChunk;

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

    //init connection
    SERVER.players.create(socket, function() {

      //send join notice plus first chunk
      SERVER.map.GetChunk(socket, function (chunkRect, chunkData) {

        var chunkObj = {
          data: chunkData,
          offset: SERVER.players.data[socket.id].view.pos
        };
        //emit 'join' tells client to EO.init();
        socket.emit('join', { chunk: chunkObj });
        //send map chunk
        //socket.emit('chunk', { chunk: chunkData });
        //
        socket.on('map_update', function(data) {
          SERVER.db.updateTile(socket.request.user.id, data.tile, function() {
            SERVER.map.GetChunk(socket, function (chunkRect, chunkData) {

              var chunkObj = {
                data: chunkData,
                offset: SERVER.players.data[socket.id].view.pos,
                clear: true
              };

              socket.emit('chunk', { chunk: chunkObj });

            });
          });
        });

        //map multi update

        socket.on('map_multi_update', function(data) {
          SERVER.db.updateMultiTile(socket.request.user.id, data.tiles, function() {
            SERVER.map.GetChunk(socket, function (chunkRect, chunkData) {

              var chunkObj = {
                data: chunkData,
                offset: SERVER.players.data[socket.id].view.pos,
                clear: true
              };

              socket.emit('chunk', { chunk: chunkObj });
            });
          });
        });

        //
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
          if ( ! SERVER.chatCommands.check(data.message) ) {
            io.emit('chat', { user: socket.request.user.username, message: data.message });
          } else {
            SERVER.chatCommands.parse(socket, data.message, function(response) {

              if (typeof response == 'undefined' || typeof response.rType === 'undefined' || typeof response.rKey === 'undefined' || typeof response.rVal === 'undefined') {
                console.log('chat command handler returned empty response or empty rType or empty rKey or empty rValue:');
                return false;
              }

              var type = response.rType;
              var key = response.rKey;
              var val = response.rVal;

              var responseObject = {};
              responseObject[key] = val;

              if (response.rTarget === "global") {
                io.emit( type, { key, val } );
              } else {
                socket.emit( type, responseObject );
              }

            });
          }
        });
        //input handler
        socket.on('input', function (data) {
          //player position gets updated in the if statement, retuns true/false if needs to update chunk
          if ( SERVER.players.updatePlayer(socket.id, data) ) {
            SERVER.map.GetChunk(socket, function (chunkRect, chunkData) {

              SERVER.players.data[socket.id].lastChunk = chunkRect;

              var chunkObj = {
                data: chunkData,
                offset: SERVER.players.data[socket.id].view.pos,
                clear: true
              };

              socket.emit('chunk', { chunk: chunkObj });

            });
          }

        });

      });

    });

    //disconnect handler
    socket.on('disconnect', function () {
      io.emit('news', { message: socket.request.user.username + ' has returned to the mundane world.' } );
      SERVER.players.delete(socket);
    });

    setInterval(function() {
      if (typeof SERVER.players.data[socket.id] !== 'undefined') {
        io.sockets.in( SERVER.players.data[socket.id].name ).emit( 'update' , { localView: SERVER.view.localView(socket.id) } );
      }
    }, 33);

  //end io
  });

}

///////////////////
// chat commands //
///////////////////
SERVER.chatCommands = {};
SERVER.chatCommands.check = function(msg) {

  if (msg.substring(0,1) === "/")
    return true;

  return false;

}
SERVER.chatCommands.parse = function(socket, cmd, callback) {

  var string = cmd.split('/')[1];
  var args = string.split(' ');
  var cmd = args.shift();

  //invalid command
  if (typeof SERVER.chatCommands.dictionary[cmd] === 'undefined') {
    console.log('returning error');
    return callback({
      rType: 'oopsy',
      rKey: 'message',
      rVal: '/'+cmd+' is not a valid command!'
    });
  }

  var command = SERVER.chatCommands.dictionary[cmd];
  command.args = args;

  //access check
  if (command.access) {

    var user_id = socket.request.user.id;

    SERVER.db.fetchUserAccess(user_id, function(user_access) {
      if (user_access < command.access) {
        return callback({
          rType: 'oopsy',
          rKey: 'message',
          rVal: 'You do not have that kind of power, asshole!!'
        });
      } else {

        return SERVER.chatCommands.perform(socket, command, callback);

      }
    });
  } else {

    return SERVER.chatCommands.perform(socket, command, callback);

  }

}

SERVER.chatCommands.perform = function(socket, command, callback) {

  if (command.action) {

    command.action(socket, command.args, function(actionData) {

      return callback(command.response);

    });

  } else {

    return callback(command.response);

  }

}

SERVER.chatCommands.dictionary = {

  test: {
    access: 11,
    action: function(socket, args, callback) {
      return callback();
    },
    response: {
      rType: 'admin',
      rKey: 'message',
      rVal: 'This worked, ya big dummy!'
    }
  },

  map: {
    access: 2,
    // action: function(socket, args, callback) {
    //   var pThis = this;
    //   return SERVER.map.GetChunk(socket, function (chunkRect, chunkData) {
    //
    //     var chunkObj = {
    //       data: chunkData,
    //       offset: SERVER.players.data[socket.id].view.pos,
    //       clear: true
    //     };
    //
    //     // pThis.response = {
    //     //   rType: 'chunk',
    //     //   rKey: 'chunk',
    //     //   rVal: chunkObj
    //     // }
    //
    //     callback();
    //
    //     socket.emit('mapeditor', { message: 'start er up custom!' });
    //
    //   });
    // },
    response: {
      rType: 'mapeditor',
      rKey: 'message',
      rVal: 'Starting dat map editor'
    }
  },

  position: {
    action: function(socket, args, callback) {
      var position = SERVER.players.data[socket.id].view.pos;
      this.response.rVal = "x:" + Math.floor(position.x / 64) + ", y:"+Math.floor(position.y / 64);
      callback();
    },
    response: {
      rType: 'notice',
      rKey: 'message',
      rVal: 'Logged your position in the console'
    }
  },

  speed: {
    action: function(socket, args, callback) {
      if (typeof args[0] === 'undefined') {
        this.response.rVal = 'Set a speed, asshole!';
      } else {
        SERVER.players.data[socket.id].speed = Number(args[0])
        this.response.rVal = 'Your speed multiplier has been updated to ' + Number(args[0]);
      }
      callback();
    },
    response: {
      rType: 'notice',
      rKey: 'message',
      rVal: 'your speed has been updated'
    }
  },

  structure: {
    access: 2,
    response: {
      rType: 'structeditor',
      rKey: 'message',
      rVal: 'Starting dat structure editor'
    }
  }

}

/////////
// map //
/////////
SERVER.map = {};

SERVER.map.chunk = {};
SERVER.map.chunk.size = 50; //20 tiles x 20 tiles

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

SERVER.map.ChunkRectFromCenterTileCoords = function (coords) {
  var rect = {};
  var offset = SERVER.map.chunk.size / 2;
  rect.x = coords.x - offset;
  rect.y = coords.y - offset;
  rect.width = SERVER.map.chunk.size;
  rect.height = SERVER.map.chunk.size;
  return rect;
}

SERVER.map.GetChunk = function(socket, callback) {

  var player = SERVER.players.data[socket.id];
  if (typeof player === 'undefined') return false;

  //calculate current tile is player.pos.x, player.pos.y / 64
  var coords = {
    x: Math.floor(player.view.pos.x / 64),
    y: Math.floor(player.view.pos.y / 64)
  };

  //var chunkArray = SERVER.map.ChunkArrayFromCenterTileCoords(coords);

  var chunkRect = SERVER.map.ChunkRectFromCenterTileCoords(coords);

  var chunkData = SERVER.db.FetchMapChunk(chunkRect, function(chunkData) {

    SERVER.players.data[socket.id].lastChunk = chunkRect;
    SERVER.players.data[socket.id].chunkData = chunkData;

    callback(chunkRect, chunkData);

  });

};


//connect to the app
module.exports = function(io) {
  SERVER.socket(io);
}
