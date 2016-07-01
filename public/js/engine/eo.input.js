
/////////////
// Inputs  //
/////////////
EO.input = {};
EO.input.init = function() {
  EO.input.keyboard.init();
  EO.input.mouse.init();
}
EO.input.keyboard = {};
EO.input.keyboard.left = false;
EO.input.keyboard.right = false;
EO.input.keyboard.up = false;
EO.input.keyboard.down = false;
EO.input.keyboard.init = function() {
  //keyboard
  EO.input.keyboard.controller = new THREEx.KeyboardState(EO.three.renderer.domElement);
  EO.three.renderer.domElement.setAttribute("tabIndex", "0");
  EO.three.renderer.domElement.focus();
  // only on keydown
  EO.input.keyboard.controller.domElement.addEventListener('keydown', function(event){
    //up
    if ( EO.input.keyboard.controller.eventMatches(event, 'w') || EO.input.keyboard.controller.eventMatches(event, 'up') ) EO.input.keyboard.up = true;
    //down
    if ( EO.input.keyboard.controller.eventMatches(event, 's') || EO.input.keyboard.controller.eventMatches(event, 'down') ) EO.input.keyboard.down = true;
    //left
    if ( EO.input.keyboard.controller.eventMatches(event, 'a') || EO.input.keyboard.controller.eventMatches(event, 'left') ) EO.input.keyboard.left = true;
    //right
    if ( EO.input.keyboard.controller.eventMatches(event, 'd') || EO.input.keyboard.controller.eventMatches(event, 'right') ) EO.input.keyboard.right = true;
  });
  EO.input.keyboard.controller.domElement.addEventListener('keyup', function(event) {
    //up
    if( EO.input.keyboard.controller.eventMatches(event, 'w') || EO.input.keyboard.controller.eventMatches(event, 'up') ) EO.input.keyboard.up = false;
    //down
    if( EO.input.keyboard.controller.eventMatches(event, 's') || EO.input.keyboard.controller.eventMatches(event, 'down') ) EO.input.keyboard.down = false;
    //left
    if( EO.input.keyboard.controller.eventMatches(event, 'a') || EO.input.keyboard.controller.eventMatches(event, 'left') ) EO.input.keyboard.left = false;
    //right
    if( EO.input.keyboard.controller.eventMatches(event, 'd') || EO.input.keyboard.controller.eventMatches(event, 'right') ) EO.input.keyboard.right = false;
  });
}
EO.input.keyboard.update = function() {
  var input_arr = [EO.input.keyboard.up, EO.input.keyboard.right, EO.input.keyboard.down, EO.input.keyboard.left];
  EO.server.socket.emit('input', input_arr);
}

EO.input.mouse = {};
EO.input.mouse.modules = [];
EO.input.mouse.init = function() {

}
EO.input.mouse.onMouseMove = function( event ) {

}
EO.input.mouse.update = function(modules) {
  for (var i = 0; i < modules.length; i++) {
    modules[i]();
  }
}
