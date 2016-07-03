
////////////////////////////////
// Dat main model handler doe //
////////////////////////////////
/// stores all model data, holds original mesh objects to clone as needed
EO.models = {}
EO.models.library = {};
EO.models.dir = 'js/models/';
// EO.models.predefined = [
//   { file: EO.models.dir + 'updated_export_8.json', id: 'hero', scale: 6, rotation_x: 1.45 }
// ];
EO.models.preloads = [];
EO.models.createfunc = function(i) {
  return function() {
    //cast to var
    var predefined = EO.models.predefined[i];
    //get a loader
    var loader = new THREE.ObjectLoader();
    loader.load( window.location.origin + '/' + EO.models.predefined[i].file_url.split('public/')[1], function(object) {
      //our model
      var model = object.children[0];

      //if (predefined.id === 'hero') {

        var texture = model.material.map;
        EO.globalTexture = model.material.map;
        texture.needsUpdate = true; // important

        // uniforms
        var uniforms = {
          color: { type: "c", value: new THREE.Color( 0xff0000 ) }, // material is "red"
          texture: { type: "t", value: texture },
        };

        // material
        var material = new THREE.ShaderMaterial({
            uniforms        : uniforms,
            vertexShader    : document.getElementById( 'vertex_shader' ).textContent,
            fragmentShader  : document.getElementById( 'fragment_shader' ).textContent
        });

        var geometry = model.geometry;

        var skinMesh = new THREE.SkinnedMesh( geometry, material );

        //model.material = material;
        skinMesh.material.skinning = true;
        //model.material._needsUpdate = true;
      //}

      skinMesh.scale.x = 6;
      skinMesh.scale.y = 6;
      skinMesh.scale.z = 6;
      skinMesh.rotation.x = 1.45;
      skinMesh.name = predefined.name;

      EO.models.library[predefined.id] = skinMesh;
    });
  }
}
EO.models.init = function() {

  EO.util.ajax('/assets/models/all', 'GET', function(response) {
    EO.models.predefined = JSON.parse(response.responseText);
    //loop through all our predefined model json files
    for (var i = 0; i < EO.models.predefined.length; i++) {
      EO.models.preloads[i] = EO.models.createfunc(i);
    }
    for (var j = 0; j < EO.models.predefined.length; j++) {
      EO.models.preloads[j]();
    }
  }); //end ajax
}
EO.models.addToWorld = function(model_id, name) {

  if (typeof EO.models.library[model_id] === 'undefined') {
    return;
  }

  var model = {};
  model.mesh = EO.models.library[model_id].clone(true);

  //textures
  var texture = EO.globalTexture;
  // uniforms
        var uniforms = {
          color: { type: "c", value: new THREE.Color( 0xff0000 ) }, // material is "red"
          texture: { type: "t", value: texture },
        };

        // material
        var material = new THREE.ShaderMaterial({
            uniforms        : uniforms,
            vertexShader    : document.getElementById( 'vertex_shader' ).textContent,
            fragmentShader  : document.getElementById( 'fragment_shader' ).textContent
        });

        var geometry = EO.models.library[model_id].geometry;

        var skinMesh = new THREE.SkinnedMesh( geometry, material );

        //model.material = material;
        skinMesh.material.skinning = true;
        //model.material._needsUpdate = true;

        skinMesh.scale.x = EO.models.library[model_id].scale.x;
        skinMesh.scale.y = EO.models.library[model_id].scale.y;
        skinMesh.scale.z = EO.models.library[model_id].scale.z;
        skinMesh.rotation.x = EO.models.library[model_id].rotation.x;

  model.mesh = skinMesh;
  //model.mesh.material = material;
  model.mesh.name = name;
  model.animations = {};
  model.animations.walk = EO.three.mixer.clipAction( model.mesh.geometry.animations[0], model.mesh );
  EO.world.createObject(model);

}
