
////////////////////////
// Dat World data doe //
////////////////////////
/// interfaces the server data and the three data
EO.world = {};
EO.world.objects = {};
EO.world.objects.active = {};
EO.world.createObject = function(object) {
  this.objects.active[object.mesh.name] = object;
  EO.three.scene.add( this.objects.active[object.mesh.name].mesh );
}
EO.world.deleteObject = function(object) {

  console.log('removing this object from scene:');
  console.log(object);

  EO.three.scene.remove(object);

  // if (object.geometry) {
  //   console.log('cleaning object geometry');
  //   object.geometry.dispose();
  // }
  //
  // if (object.material) {
  //   console.log('cleaning object material');
  //   object.material.dispose();
  // }
  //
  // if (object.texture) {
  //   console.log('cleaning object texture');
  //   object.texture.dispose();
  // }

  if (typeof EO.world.objects.active[object.name] !== 'undefined')
    delete EO.world.objects.active[object.name]

}
EO.world.isActiveObject = function(name) {
  if (typeof this.objects.active[name] !== 'undefined') return true;
  return false;
}
EO.world.updateObject = function(object) {
  serverObjects = EO.server.data.localView.players;
  for (var i = 0; i < serverObjects.length; i++) {
    if (serverObjects[i].name === object.name) {
      var objectData = serverObjects[i];
      break;
    }
  }
  if (typeof objectData !== 'undefined') {
    //color
    if (object.colorUpdated !== true) {
      object.material.uniforms.color.value.setHSL( objectData.hsl.h, objectData.hsl.s, objectData.hsl.l );
      object.colorUpdated = true;
    }
    //position
    object.position.set( objectData.view.pos.x, objectData.view.pos.y, objectData.view.pos.z );
    //rotation
    object.rotation.y = objectData.view.rot;
    if (objectData.view.walking) {
      EO.world.objects.active[objectData.name].animations.walk.play();
    } else {
      EO.world.objects.active[objectData.name].animations.walk.stop();
    }
    if (objectData.isPlayer) {
      EO.three.updateCamera( object.position );
    }
  }
}
