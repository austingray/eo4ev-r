
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
  
  var chunkGeometry = new THREE.Geometry();

  for (var i = 0; i < chunk.length; i++) {

    var height = 64 * chunk[i].height;
    if (height === 0) height = 1;

    var geometry = new THREE.PlaneGeometry( 64, 64 );
    var material = EO.tiles.materials[chunk[i].tile_id].clone(true);
    var mesh = new THREE.Mesh( geometry, material );
    mesh.receiveShadow = true;
    mesh.position.set( chunk[i].x * 64, chunk[i].y * 64, 0 );
    mesh.updateMatrix();

    chunkGeometry.merge(mesh.geometry, mesh.matrix, chunk[i].tile_id);

  }

  //var materials = new THREE.MeshPhongMaterial({color: 0x000000});
  var chunk = new THREE.Mesh(chunkGeometry, new THREE.MeshFaceMaterial( [ EO.tiles.materials[0], EO.tiles.materials[1] ] ) );
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