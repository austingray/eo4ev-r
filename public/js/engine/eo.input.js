
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
EO.input.mouse.raycaster = new THREE.Raycaster();
EO.input.mouse.vector = new THREE.Vector2();
EO.input.mouse.init = function() {
  document.getElementById('gamecanvas').addEventListener( 'mousemove', EO.input.mouse.onMouseMove, false );
}
EO.input.mouse.onMouseMove = function( event ) {

  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components

  EO.input.mouse.vector.x = ( ( event.clientX - document.getElementById('gamecanvas').getBoundingClientRect().left ) / EO.settings.width ) * 2 - 1;
  EO.input.mouse.vector.y = - ( ( event.clientY - document.getElementById('gamecanvas').getBoundingClientRect().top ) / EO.settings.height ) * 2 + 1;   

}
EO.mapping = true;
EO.input.mouse.currentIntersected = null;
EO.input.mouse.storedHex = '';
EO.input.mouse.update = function() {

  if (EO.mapping === true) {

    // update the picking ray with the camera and mouse position
    this.raycaster.setFromCamera( EO.input.mouse.vector, EO.three.camera ); 
    // calculate objects intersecting the picking ray
    var intersects = this.raycaster.intersectObjects( EO.three.scene.children );

    if ( intersects.length > 0 ) {
      
      if (intersects[0].object !== this.currentIntersected) {

        var geometry = null;
        var faceIndex = null;

        //the current intersection is not the cached object, so let's update the stored object
        if (this.currentIntersected) {
          var geometry = this.currentIntersected.object.geometry;
          var faceIndex = this.currentIntersected.faceIndex;
          if (faceIndex % 2 === 0) {
            geometry.faces[faceIndex].color.setHex(this.storedHex);
            geometry.faces[faceIndex+1].color.setHex(this.storedHex);
          } else {
            geometry.faces[faceIndex].color.setHex(this.storedHex);
            geometry.faces[faceIndex-1].color.setHex(this.storedHex);
          }
        }

        this.currentIntersected = intersects[0];
        var geometry = this.currentIntersected.object.geometry;
        var faceIndex = this.currentIntersected.faceIndex;
        this.storedHex = this.currentIntersected.face.color.getHex();

        if (EO.input.mouse.currentIntersected) {
          if (faceIndex % 2 === 0) {
            geometry.faces[faceIndex].color.setHSL(.7, .5, .41);
            geometry.faces[faceIndex+1].color.setHSL(.7, .5, .41);
          } else {
            geometry.faces[faceIndex].color.setHSL(.7, .5, .41);
            geometry.faces[faceIndex-1].color.setHSL(.7, .5, .41);
          }
        }


        geometry.colorsNeedUpdate = true;

      } else {

        // restore previous intersection object (if it exists) to its original color
        if (this.currentIntersected) {
          var geometry = this.currentIntersected.object.geometry;
          var faceIndex = this.currentIntersected.faceIndex;
          if (faceIndex % 2 === 0) {
            geometry.faces[faceIndex].color.setHex(this.storedHex);
            geometry.faces[faceIndex+1].color.setHex(this.storedHex);
          } else {
            geometry.faces[faceIndex].color.setHex(this.storedHex);
            geometry.faces[faceIndex-1].color.setHex(this.storedHex);
          }
        }

        // Remove previous intersection object reference
        // by setting current intersection object to "nothing"
        this.currentIntersected = null;
      }


      // var face = intersects[0].face;
      // //face.color.setRGB( Math.random(), Math.random(), Math.random())
     //  var faceIndex = intersects[0].faceIndex;
     //  var obj = intersects[0].object;
     //  var geom = obj.geometry;

      // if(faceIndex%2 == 0){
      //   geom.faces[faceIndex].color.setRGB( Math.random(),Math.random(), Math.random())
      //   geom.faces[faceIndex+1].color.setRGB( Math.random(),Math.random(), Math.random())
      // } else{
      //   geom.faces[faceIndex].color.setRGB( Math.random(),Math.random(), Math.random())
      //   geom.faces[faceIndex-1].color.setRGB( Math.random(),Math.random(), Math.random())
      // }


     //    geom.colorsNeedUpdate = true
     
    }

  }

}