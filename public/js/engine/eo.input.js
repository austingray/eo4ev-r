
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
//EO.input.keyboard.lookup = ['w', 'up', 's', 'down', 'a', 'left', 'd', 'right', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
EO.input.keyboard.init = function() {
  //keyboard
  EO.input.keyboard.controller = new THREEx.KeyboardState(EO.three.renderer.domElement);
  EO.three.renderer.domElement.setAttribute("tabIndex", "0");
  EO.three.renderer.domElement.focus();
  // only on keydown
  EO.input.keyboard.controller.domElement.addEventListener('keydown', function(event){

    //console.log(event);

    //up
    if ( EO.input.keyboard.controller.eventMatches(event, 'w') || EO.input.keyboard.controller.eventMatches(event, 'up') ) EO.input.keyboard.up = true;
    //down
    if ( EO.input.keyboard.controller.eventMatches(event, 's') || EO.input.keyboard.controller.eventMatches(event, 'down') ) EO.input.keyboard.down = true;
    //left
    if ( EO.input.keyboard.controller.eventMatches(event, 'a') || EO.input.keyboard.controller.eventMatches(event, 'left') ) EO.input.keyboard.left = true;
    //right
    if ( EO.input.keyboard.controller.eventMatches(event, 'd') || EO.input.keyboard.controller.eventMatches(event, 'right') ) EO.input.keyboard.right = true;

    //camera controls
    if (
      EO.input.keyboard.controller.eventMatches(event, '1' ) ||
      EO.input.keyboard.controller.eventMatches(event, '2' ) ||
      EO.input.keyboard.controller.eventMatches(event, '3' ) ||
      EO.input.keyboard.controller.eventMatches(event, '4' ) ||
      EO.input.keyboard.controller.eventMatches(event, '5' ) ||
      EO.input.keyboard.controller.eventMatches(event, '6' ) ||
      EO.input.keyboard.controller.eventMatches(event, '7' ) ||
      EO.input.keyboard.controller.eventMatches(event, '8' ) ||
      EO.input.keyboard.controller.eventMatches(event, '9' )
    ) EO.three.changeCamera( event.key );

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
EO.input.keyboard.needsSingleUpdate = false;
EO.input.keyboard.completedSingleUpdate = false;
EO.input.keyboard.update = function() {

  var input_arr = [EO.input.keyboard.up, EO.input.keyboard.right, EO.input.keyboard.down, EO.input.keyboard.left];

  var update = false;

  for (var i = 0; i < input_arr.length; i++) {

    if (input_arr[i]) {
      update = true;
    }

  }

  if (update) {

    EO.server.socket.emit('input', input_arr);
    EO.input.keyboard.needsSingleUpdate = true;

  } else {

    if ( EO.input.keyboard.needsSingleUpdate ) {

      EO.server.socket.emit('input', input_arr);
      EO.input.keyboard.needsSingleUpdate = false;

    }

  }

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
