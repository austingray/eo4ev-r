
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

EO.map.HandleChunk_deletethisfunction = function(chunk) {

  if (Object.keys(EO.tiles.library).length === 0 && EO.tiles.library.constructor === Object) {
    return setTimeout(function() {
      EO.map.HandleChunk(chunk);
    }, 333)
  };

  var geometry = new THREE.PlaneGeometry(6400, 6400, 100, 100);
  EO.tiles.library["0"] = new THREE.MeshPhongMaterial( { color: 0x001111, vertexColors: true } );
  var materials = EO.tiles.library;

  var l = geometry.faces.length / 2;
  for (var i = 0; i < l; i++) {
    var j = 2 * i;
    geometry.faces[j].materialIndex = chunk[i].tile_id;
    geometry.faces[j + 1].materialIndex = chunk[i].tile_id;
  }

  var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));

  EO.three.scene.add(mesh);

}
EO.map.chunkHooks = [];
EO.map.HandleChunk = function(chunkObj) {

  if (Object.keys(EO.tiles.library).length === 0 && EO.tiles.library.constructor === Object) {
    return setTimeout(function() {
      EO.map.HandleChunk(chunkObj);
    }, 333)
  }

  var chunk = chunkObj.data;
  var offset = chunkObj.offset;

  var chunkGeometry = new THREE.Geometry();

  var materialListDictionary = [];
  var materialListIndex = [];

  var geometry = new THREE.PlaneGeometry( 64, 64 );
  var material = new THREE.MeshPhongMaterial( { color: 0x001111, vertexColors: true } );
  //var material_texture = EO.tiles.library[chunk[i].tile_id].clone(true);
  var material_texture = new THREE.MeshPhongMaterial();
  var mesh = new THREE.Mesh( geometry, material );

  for (var i = 0; i < chunk.length; i++) {

    // var height = 64 * chunk[i].height;
    // if (height === 0) height = 1;

    if (typeof EO.tiles.library[chunk[i].tile_id] === 'undefined') {

      mesh.material = material;

    } else {

      mesh.material = EO.tiles.library[chunk[i].tile_id].clone(true);

    }

    if (materialListIndex.indexOf(chunk[i].tile_id) < 0) {

      materialListIndex.push(chunk[i].tile_id);
      materialListDictionary[chunk[i].tile_id] = mesh.material;

    }



    mesh.position.set( chunk[i].x * 64, chunk[i].y * 64, 0 );
    mesh.updateMatrix();

    chunkGeometry.merge(mesh.geometry, mesh.matrix, chunk[i].tile_id);

  }

  chunkGeometry.sortFacesByMaterialIndex();
  //var bufferGeo = new THREE.BufferGeometry().fromGeometry(chunkGeometry);
  var chunkMesh = new THREE.Mesh(chunkGeometry, new THREE.MeshFaceMaterial( materialListDictionary ) );
  chunkMesh.name = "Chunk"
  //chunk.position.set(offset.x, offset.y, 0);

  EO.three.scene.add(chunkMesh);

  for (var l = 0; l < EO.map.chunkHooks.length; l++) {
    EO.map.chunkHooks[l](chunk);
  }

}
EO.map.DrawTileFromChunkItem = function (chunk_item) {
  var tile = EO.tiles.materials[chunk_item.name].clone(true);
  tile.position.set(chunk_item.x, chunk_item.y, 0);
  EO.three.scene.add(tile);
}
