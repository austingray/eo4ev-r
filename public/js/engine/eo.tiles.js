
///////////
// Tiles //
///////////
/// stores all map tile data, we'll access this from the map, maybe we nest this under map? i dunno yet
EO.tiles = {};
EO.tiles.textures = [
  { id: 0, type:'blank', name: 'blank' },
  { id: 1, type:'grass', name: 'Grass 1', file:'img/tiles/grass/grass1.png', animated: false },
  { id: 2, type:'water', name: 'Water 1', file:'img/tiles/water/water1.png', animated: true, frames: 4 },
  { id: 3, type:'water', name: 'Water 2', file:'img/tiles/water/water1.png', animated: true, frames: 4 }
];
EO.tiles.type = {};
EO.tiles.type.grass = [];
EO.tiles.type.water = [];
EO.tiles.materials = [];
EO.tiles.init = function() {
  
  for (var i = 0; i < EO.tiles.textures.length; i++) {
    
    var texture = EO.tiles.textures[i];
    if (typeof texture.file === 'undefined') {

      var material = new THREE.MeshPhongMaterial( { color: 0x001111, vertexColors: true } );
      var geometry = new THREE.PlaneGeometry( 64, 64, 1 );

    } else {

      var tLoader = new THREE.TextureLoader();
      var t = tLoader.load( texture.file );
      var material = new THREE.MeshPhongMaterial({ map: t, vertexColors: true });
      var geometry = new THREE.PlaneGeometry( 64, 64, 1 );

    }

    EO.tiles.materials.push(material);

  }

}