
///////////
// Tiles //
///////////
/// stores all map tile data, we'll access this from the map, maybe we nest this under map? i dunno yet
EO.tiles = {};
// EO.tiles.textures = [
//   { id: 0, type:'blank', name: 'blank' },
//   { id: 1, type:'grass', name: 'Grass 1', file:'img/tiles/grass/grass1.png', animated: false },
//   { id: 2, type:'water', name: 'Water 1', file:'img/tiles/water/water1.png', animated: true, frames: 4 },
//   { id: 3, type:'water', name: 'Water 2', file:'img/tiles/water/water1.png', animated: true, frames: 4 }
// ];
// EO.tiles.type = {};
// EO.tiles.type.grass = [];
// EO.tiles.type.water = [];
// EO.tiles.materials = [];
EO.tiles.library = {};
// EO.tiles.init = function() {
//
//   for (var i = 0; i < EO.tiles.textures.length; i++) {
//
//     var texture = EO.tiles.textures[i];
//     if (typeof texture.file === 'undefined') {
//
//       var material = new THREE.MeshPhongMaterial( { color: 0x001111, vertexColors: true } );
//       var geometry = new THREE.PlaneGeometry( 64, 64, 1 );
//
//     } else {
//
//       var tLoader = new THREE.TextureLoader();
//       var t = tLoader.load( texture.file );
//       var material = new THREE.MeshPhongMaterial({ map: t, vertexColors: true });
//       var geometry = new THREE.PlaneGeometry( 64, 64, 1 );
//
//     }
//
//     EO.tiles.materials.push(material);
//
//   }
//
// }

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
  }); //end ajax
}

EO.tiles.createfunc = function(i) {
  return function() {
    //cast to var
    var predefined = EO.tiles.predefined[i];

    var asset_url = predefined.asset.file_url.split('public/')[1];

    var tLoader = new THREE.TextureLoader();
    var t = tLoader.load( asset_url );
    var material = new THREE.MeshPhongMaterial({ map: t });
    //var geometry = new THREE.PlaneGeometry( 64, 64, 1 );

    EO.tiles.library[predefined.id] = material;

    //
    // if (typeof texture.file === 'undefined') {
    //
    //   var material = new THREE.MeshPhongMaterial( { color: 0x001111, vertexColors: true } );
    //   var geometry = new THREE.PlaneGeometry( 64, 64, 1 );
    //
    // } else {
    //

    //
    // }

  }
}
