
////////////////////////
// Socket.io handlers //
////////////////////////
EO.server = {}
EO.server.socket = io.connect();
EO.server.socket.on('news', function (data) {
  var $output = $('<div></div>').attr({
    "class":"news"
  }).html(data.message);
  $('#feed').append($output);
});

EO.server.socket.on('chat', function (data) {
  var $output = $('<div></div>').attr({
    "class":"chat"
  }).html(data.user + ': ' + data.message);
  $('#feed').append($output);
  $('#feed').scrollTop($('#feed')[0].scrollHeight);
});

EO.server.socket.on('oopsy', function (data) {
  var $output = $('<div></div>').attr({
    "class":"error"
  }).html(data.message);
  $('#feed').append($output);
  $('#feed').scrollTop($('#feed')[0].scrollHeight);
});

EO.server.socket.on('notice', function (data) {
  var $output = $('<div></div>').attr({
    "class":"notice"
  }).html(data.message);
  $('#feed').append($output);
  $('#feed').scrollTop($('#feed')[0].scrollHeight);
})

EO.server.socket.on('join', function(data) {
  EO.preload(data.chunk);
});

EO.server.socket.on('update', function(data) {
  EO.server.data = data;
});

EO.server.socket.on('chunk', function(data) {
  console.log(data.chunk.clear);
  var deleteMe = [];
  if (data.chunk.clear === true) {
    EO.three.scene.traverse( function (object) {
      if (object.name === "Chunk") {
        deleteMe.push(object);
      }
    });
  }
  while (deleteMe.length > 0) {
    var deleteThis = deleteMe.shift();
    EO.world.deleteObject(deleteThis);
  }
  EO.map.HandleChunk(data.chunk);
});

EO.server.isServerObject = function(object) {
  var objects = EO.server.data.localView.players;
  var isServerObject = false;
  for (var i = 0; i < objects.length; i++) {
    if (objects[i].name === object.name) {
      isServerObject = true;
      break;
    }
  }
  return isServerObject;
}
