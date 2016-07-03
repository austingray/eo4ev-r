
/////////
// Map //
/////////
EO.map = {};
EO.map.width = 1280;
EO.map.height = 1280;
EO.map.tilesPer = 20;

EO.map.init = function() {

}
EO.map.chunk = function() {

}
EO.map.draw = function() {

}
EO.map.update = function() {

}
EO.map.HandleChunk = function(chunk) {

  if (Object.keys(EO.tiles.library).length === 0 && EO.tiles.library.constructor === Object) {
    return setTimeout(function() {
      EO.map.HandleChunk(chunk);
    }, 333)
  }

  console.log('the tile library:');
  console.log(EO.tiles.library);


  var chunkGeometry = new THREE.Geometry();

  var materialListDictionary = [];
  var materialListIndex = [];

  for (var i = 0; i < chunk.length; i++) {


    if (chunk[i].tile_id > 0) {
      console.log(chunk[i]);
    }

    var height = 64 * chunk[i].height;
    if (height === 0) height = 1;

    var geometry = new THREE.PlaneGeometry( 64, 64 );
    if (typeof EO.tiles.library[chunk[i].tile_id] === 'undefined') {

      var material = new THREE.MeshPhongMaterial( { color: 0x001111, vertexColors: true } );

    } else {

      var material = EO.tiles.library[chunk[i].tile_id].clone(true);
      console.log('cloned a material');
      console.log(material);

    }

    if (materialListIndex.indexOf(chunk[i].tile_id) < 0) {

      materialListIndex.push(chunk[i].tile_id);
      materialListDictionary[chunk[i].tile_id] = material;
    }

    var mesh = new THREE.Mesh( geometry, material );
    mesh.receiveShadow = true;
    mesh.position.set( chunk[i].x * 64, chunk[i].y * 64, 0 );
    mesh.updateMatrix();

    chunkGeometry.merge(mesh.geometry, mesh.matrix, chunk[i].tile_id);

  }

  console.log(materialListDictionary);
  //var materials = new THREE.MeshPhongMaterial({color: 0x000000});
  var chunk = new THREE.Mesh(chunkGeometry, new THREE.MeshFaceMaterial( materialListDictionary ) );
  chunk.receiveShadow = true;
  chunk.material.vertexColors = THREE.FaceColors;
  console.log(chunk);
  chunk.geometry.computeFaceNormals();
  chunk.geometry.computeVertexNormals();
  chunk.name = "Chunk"
  EO.three.scene.add(chunk);

}
EO.map.DrawTileFromChunkItem = function (chunk_item) {
  var tile = EO.tiles.materials[chunk_item.name].clone(true);
  tile.position.set(chunk_item.x, chunk_item.y, 0);
  EO.three.scene.add(tile);
}
