EO.admin = {};

EO.admin.sockets = {};
EO.admin.sockets.init = function() {
  EO.server.socket.on('mapeditor', function(response) {
    if (EO.admin.mapEditor.active) {
      console.log('deactivating map editor');
      EO.admin.mapEditor.deactivate();
    } else {
      console.log('activating map editor');
      EO.admin.mapEditor.activate();
    }
  });
}

///////////////
//map editor //
///////////////
EO.admin.mapEditor = {};
EO.admin.mapEditor.init = function() {
  EO.admin.mapEditor.panel.init();
}
EO.admin.mapEditor.active = false;
EO.admin.mapEditor.activate = function() {
  EO.admin.mapEditor.active = true;
  EO.input.mouse.modules.push(EO.admin.mapEditor.mouse.update);
  document.getElementById('gamecanvas').addEventListener( 'mousemove', EO.admin.mapEditor.mouse.onMouseMove, false );
  document.getElementById('gamecanvas').addEventListener( 'click', EO.admin.mapEditor.updateSelectedTile, false );
  EO.admin.mapEditor.panel.create();
}
EO.admin.mapEditor.deactivate = function() {
  EO.admin.mapEditor.active = false;
  var index = EO.input.mouse.modules.indexOf(EO.admin.mapEditor.mouse.update);
  if (index > -1) {
    EO.input.mouse.modules.splice(index, 1);
  }
  document.getElementById('gamecanvas').removeEventListener( 'mousemove', EO.admin.mapEditor.mouse.onMouseMove );
  document.getElementById('gamecanvas').removeEventListener( 'click', EO.admin.mapEditor.updateSelectedTile );
  EO.admin.mapEditor.panel.destroy();
}

EO.admin.mapEditor.panel = {};
EO.admin.mapEditor.panel.activeTile = null;
EO.admin.mapEditor.panel.init = function() {
  $(document).on('click', '#map-editor-panel .single-tile', function() {
    $('#map-editor-panel .single-tile').removeClass('active');
    $(this).addClass('active');
  });
}
EO.admin.mapEditor.panel.create = function() {
  var $panel = $('<div></div>').attr({
    "id":"map-editor-panel"
  });
  var $tile_container = $('<div></div>').attr({
    "class":"tile-container"
  });
  for (var i = 0; i < EO.tiles.predefined.length; i++) {
    var tile = EO.tiles.predefined[i];
    var $img = $('<img />').attr({
      "src": tile.asset.file_url.split('public/')[1]
    });
    var $tile = $('<div></div>').attr({
      "class":"single-tile",
      "data-id": tile.id
    }).html($img);
    $tile_container.append($tile);
  }
  $panel.append($tile_container);
  var $blocking = $('<input />').attr({
    "type":"checkbox",
    "id":"is_blocking"
  });
  var $blocking_container = $('<div></div>').html($blocking);
  $panel.append($blocking_container);
  $('body').append($panel);
  $('#map-editor-panel .single-tile').eq(0).addClass('active');
}
EO.admin.mapEditor.panel.destroy = function() {
  $('#map-editor-panel').remove();
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
    EO.admin.mapEditor.mouse.raycaster.setFromCamera( EO.admin.mapEditor.mouse.vector, EO.three.camera );
    // calculate objects intersecting the picking ray
    var intersects = EO.admin.mapEditor.mouse.raycaster.intersectObjects( EO.three.scene.children );

    if ( intersects.length > 0 ) {

      if (intersects[0].object !== EO.admin.mapEditor.mouse.currentIntersected) {

        var geometry = null;
        var faceIndex = null;

        //the current intersection is not the cached object, so let's update the stored object
        if (EO.admin.mapEditor.mouse.currentIntersected) {
          var geometry = EO.admin.mapEditor.mouse.currentIntersected.object.geometry;
          var faceIndex = EO.admin.mapEditor.mouse.currentIntersected.faceIndex;
          if (faceIndex % 2 === 0) {
            geometry.faces[faceIndex].color.setHex(EO.admin.mapEditor.mouse.storedHex);
            geometry.faces[faceIndex+1].color.setHex(EO.admin.mapEditor.mouse.storedHex);
          } else {
            geometry.faces[faceIndex].color.setHex(EO.admin.mapEditor.mouse.storedHex);
            geometry.faces[faceIndex-1].color.setHex(EO.admin.mapEditor.mouse.storedHex);
          }
        }

        EO.admin.mapEditor.mouse.currentIntersected = intersects[0];
        var geometry = EO.admin.mapEditor.mouse.currentIntersected.object.geometry;
        var faceIndex = EO.admin.mapEditor.mouse.currentIntersected.faceIndex;
        EO.admin.mapEditor.mouse.storedHex = EO.admin.mapEditor.mouse.currentIntersected.face.color.getHex();

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
        if (EO.admin.mapEditor.mouse.currentIntersected) {
          var geometry = EO.admin.mapEditor.mouse.currentIntersected.object.geometry;
          var faceIndex = EO.admin.mapEditor.mouse.currentIntersected.faceIndex;
          if (faceIndex % 2 === 0) {
            geometry.faces[faceIndex].color.setHex(EO.admin.mapEditor.mouse.storedHex);
            geometry.faces[faceIndex+1].color.setHex(EO.admin.mapEditor.mouse.storedHex);
          } else {
            geometry.faces[faceIndex].color.setHex(EO.admin.mapEditor.mouse.storedHex);
            geometry.faces[faceIndex-1].color.setHex(EO.admin.mapEditor.mouse.storedHex);
          }
        }

        // Remove previous intersection object reference
        // by setting current intersection object to "nothing"
        EO.admin.mapEditor.mouse.currentIntersected = null;
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

EO.admin.mapEditor.updateSelectedTile = function() {
  if (EO.admin.mapEditor.active === true) {

    // update the picking ray with the camera and mouse position
    EO.admin.mapEditor.mouse.raycaster.setFromCamera( EO.admin.mapEditor.mouse.vector, EO.three.camera );
    // calculate objects intersecting the picking ray
    var intersects = EO.admin.mapEditor.mouse.raycaster.intersectObjects( EO.three.scene.children );

    if ( intersects.length > 0 ) {

      var x = intersects[0].point.x
      var y = intersects[0].point.y;
      var tile_id = $('.single-tile.active').attr("data-id");
      var tile_update = {
        x: x,
        y: y,
        height: 0,
        blocking: false,
        tile_id: tile_id
      }
      console.log(tile_update);

      $.ajax({
        method: "POST",
        url: "/map/update",
        data: tile_update,
        success: function(data) {
          console.log(data);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log(textStatus);
        }
      })

    }

  }
}


EO.admin.init = function() {
  if (typeof THREE === 'undefined') {
    EO.admin.init();
  } else {
    console.log('admin init\'d');
    EO.admin.mapEditor.init();
    EO.admin.sockets.init();
  }
};

EO.admin.init();
