EO.admin = {};

EO.admin.sockets = {};
EO.admin.sockets.init = function() {
  EO.server.socket.on('mapeditor', function(response) {
    console.log(response);
  });
}

///////////////
//map editor //
///////////////
EO.admin.mapEditor = {};
EO.admin.mapEditor.active = false;
EO.admin.mapEditor.activate = function() {
  document.getElementById('gamecanvas').addEventListener( 'mousemove', EO.admin.mapEditor.mouse.onMouseMove, false );
}
EO.admin.mapEditor.deactivate = function() {
  document.getElementById('gamecanvas').removeEventListener( 'mousemove', EO.admin.mapEditor.mouse.onMouseMove );
}
EO.admin.mapEditor.mouse = {};
EO.admin.mapEditor.mouse.raycaster = new THREE.Raycaster();
EO.admin.mapEditor.mouse.vector = new THREE.Vector2();
EO.admin.mapEditor.mouse.onMouseMove = function( event ) {

  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components

  EO.admin.mapEditor.mouse.vector.x = ( ( event.clientX - document.getElementById('gamecanvas').getBoundingClientRect().left ) / EO.settings.width ) * 2 - 1;
  EO.admin.mapEditor.mouse.vector.y = - ( ( event.clientY - document.getElementById('gamecanvas').getBoundingClientRect().top ) / EO.settings.height ) * 2 + 1;

}
EO.admin.mapEditor.mouse.currentIntersected = null;
EO.admin.mapEditor.mouse.storedHex = '';
EO.admin.mapEditor.mouse.update = function() {

  if (EO.admin.mapEditor.active === true) {

    // update the picking ray with the camera and mouse position
    this.raycaster.setFromCamera( EO.admin.mapEditor.mouse.vector, EO.three.camera );
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

        if (EO.admin.mapEditor.mouse.currentIntersected) {
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


EO.admin.init = function() {
  EO.admin.sockets.init();
};
