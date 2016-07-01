var EO = EO || {};

//////////////////////////////////////////////////
// Init called when signal received from server //
//////////////////////////////////////////////////
EO.init = function(modules) {
  for (var i = 0; i < modules.length; i++) {
    modules[i]();
  }
}

////////////////////
// Dat render doe //
////////////////////
EO.render = function() {
  //update view
  EO.update();
  //delta
  var delta = 1.5 * EO.settings.clock.getDelta();
  //util frame tick
  var f = Math.floor(Date.now() / 600) % 3;
  if (f !== EO.settings.frame) EO.settings.update();
  EO.settings.frame = f;
  //input updates
  EO.input.keyboard.update();
  EO.input.mouse.update(EO.input.mouse.modules);
  //animation mixer update
  if (EO.three.mixer) EO.three.mixer.update( delta );
  //render frame
  EO.three.renderer.render( EO.three.scene, EO.three.camera );
  //request next frame
  requestAnimationFrame( EO.render );
  //export scene to window for three.js inspector
  window.scene = EO.three.scene;
}

/////////////////////////////
// dat update function doe //
/////////////////////////////
/// this is an important function
/// this is called in the main render loop
/// this takes the data passed from the server and interacts with the three.scene
/// first we determine if the data is defined, if it is we continue
/// we loop through the server data's collection of users, select a model, and push it to the world data with its server defined name if it does not exist
/// then we traverse the scene
///   for each scene object, if it is not a whitelisted three.js object, and it does not exist in the list of server objects, we EO.world.deleteObject
///   if the object is present in our server data, we update it to represent the server's state of that object
/// we then process the server's map data
EO.update = function() {
  //if not ready, bail
  if (typeof EO.server.data === 'undefined') return false;
  //add new players
  for (var k = 0; k < EO.server.data.localView.players.length; k++) {
    if ( ! EO.world.isActiveObject( EO.server.data.localView.players[k].name) ) {
      //console.log(  EO.server.data.localView.players[k] );
      EO.models.addToWorld( EO.server.data.localView.players[k].current_model, EO.server.data.localView.players[k].name );
    }
  }
  //traverse the scene
  var deleteAfterTraverse = [];
  EO.three.scene.traverse( function (object) {
    if ( EO.server.isServerObject(object) ) {
      EO.world.updateObject(object);
    } else {
      if ( ! EO.three.isWhitelistedObject(object.type) ) {
        deleteAfterTraverse.push(object);
      }
    }
  });
  //can't delete during ra
  while (deleteAfterTraverse.length > 0) {
    var object = deleteAfterTraverse.pop();
    EO.world.deleteObject(object);
  }
  if (EO.map) {
    //EO.map.mesh.position.set(-(localView.offset.x), -(localView.offset.y), -(localView.offset.z));
    //EO.map.update();
  }
};
