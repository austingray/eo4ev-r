
///
/// prolly should rename to EO.Textures and do
/// EO.Textures.Tiles, EO.Textures.Structures, etc
///

///////////
// Tiles //
///////////
EO.tiles = {};
EO.tiles.library = {};
EO.tiles.preloads = [];
EO.tiles.init = function() {
  EO.util.ajax('/assets/tiles/all', 'GET', function(response) {
    EO.tiles.predefined = JSON.parse(response.responseText);
    //loop through all our predefined tiles
    for (var i = 0; i < EO.tiles.predefined.length; i++) {
      EO.tiles.preloads[i] = EO.tiles.createfunc(i);
    }
    for (var j = 0; j < EO.tiles.predefined.length; j++) {
      EO.tiles.preloads[j]();
    }
  });
}
EO.tiles.createfunc = function(i) {
  return function() {
    var predefined = EO.tiles.predefined[i];
    var asset_url = predefined.asset.file_url.split('public/')[1];
    var tLoader = new THREE.TextureLoader();
    var t = tLoader.load( asset_url );
    var material = new THREE.MeshPhongMaterial({ map: t });
    EO.tiles.library[predefined.id] = material;
  }
}

////////////////
// Structures //
////////////////
EO.structures = {};
EO.structures.library = {};
EO.structures.preloads = [];
EO.structures.init = function() {
  EO.util.ajax('/assets/structures/all', 'GET', function(response) {
    EO.structures.predefined = JSON.parse(response.responseText);
    console.log(EO.structures.predefined);
    //loop through all our predefined tiles
    for (var i = 0; i < EO.structures.predefined.length; i++) {
      EO.structures.preloads[i] = EO.structures.createfunc(i);
    }
    for (var j = 0; j < EO.structures.predefined.length; j++) {
      EO.structures.preloads[j]();
    }
  });
}
EO.structures.createfunc = function(i) {
  return function() {
    var predefined = EO.structures.predefined[i];
    var asset_url = predefined.file_url.split('public/')[1];
    var tLoader = new THREE.TextureLoader();
    var t = tLoader.load( asset_url );
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    var material = new THREE.MeshPhongMaterial({ map: t, shininess: 0, shading: THREE.FlatShading });
    material.receiveShadow = true;
    EO.structures.library[predefined.id] = material;
  }
}
EO.structures.createFaceMaterial = function(sourceTextureId, u, v) {
  var material = EO.structures.library[sourceTextureId].clone();
  var texture = EO.structures.library[sourceTextureId].map.clone();
  texture.needsUpdate = true;
  texture.repeat.set(u, v);
  material.map = texture;
  material.transparent = true;
  material.opacity = 1;
  return material;
}
