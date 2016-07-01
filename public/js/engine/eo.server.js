
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

EO.server.socket.on('join', function(data) {
  console.log('firing up the engine');
  var modules = [
    EO.three.init,
    EO.models.init,
    //EO.character.init(),
    EO.tiles.init,
    //EO.map.init(),
    EO.input.init,
    EO.render,
  ];
  EO.init(modules);
});

EO.server.socket.on('update', function(data) {
  EO.server.data = data;
});

EO.server.socket.on('chunk', function(data) {
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
