
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
  var structures = chunkObj.structures;
  //var offset = chunkObj.offset; --- delete

  //the main chunk geo
  var chunkGeometry = new THREE.Geometry();
  //material lists
  var materialListDictionary = [];
  var materialListIndex = [];

  //individual geo reference
  var geometry = new THREE.PlaneGeometry( 64, 64 );
  //blank tile material
  var material = new THREE.MeshPhongMaterial( { color: 0x001111, vertexColors: true } );
  //individual tile mesh
  var mesh = new THREE.Mesh( geometry, material );
  //loop through tiles
  for (var i = 0; i < chunk.length; i++) {

    if (typeof EO.tiles.library[chunk[i].tile_id] === 'undefined') {
      // tile does not exist in database, use blank tile material
      mesh.material = material;
    } else {
      // tile exists in database, clone the source from tile library
      mesh.material = EO.tiles.library[chunk[i].tile_id].clone(true);
    }
    //add material to dictionary if does not exist
    var mat_array_index = materialListIndex.indexOf(chunk[i].tile_id);
    if (mat_array_index < 0) {
      materialListIndex.push(chunk[i].tile_id);
      materialListDictionary.push(mesh.material);
      mat_array_index = materialListIndex.length - 1;
    }

    //set tile position
    mesh.position.set( chunk[i].x * 64, chunk[i].y * 64, 0 );
    mesh.updateMatrix();

    //merge to main chunk geometry
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    chunkGeometry.merge(mesh.geometry, mesh.matrix, mat_array_index);

  }

  /*
  //new structure loop, create them all as planes...
  // [ Ceiling, North, East, South, West]
  //// [ x, y, rotx, roty, rotz ];
  var pi2 = Math.PI / 2;
  var structureOffsetArray = [
    [0, 0, 0, 0, 0],
    [0, 32, pi2, 0, 0],
    [32, 0, pi2, pi2, 0],
    [0, -32, pi2, 0, 0],
    [-32, 0, pi2, pi2, 0]
  ];
  for (var s = 0; s < structures.length; s++) {

    //grab a structure,
    var structure = structures[s];
    var x = structure.x;
    var y = structure.y;
    var height = structure.height;
    var base = 32;
    var texture_id = structure.texture_id;
    //setup materials
    var material = EO.structures.library[texture_id].clone();
    var material2 = EO.structures.library[texture_id].clone();
    var wallTexture = material2.map.clone();
    mesh.material = material;
    wallTexture.needsUpdate = true;
    wallTexture.repeat.set(1, height);
    material2.map = wallTexture;
    for (var si = 0; si < 5; si++) {

      //mesh.geometry = ;
      //var mesh = new THREE.Mesh( new THREE.PlaneGeometry( 64, base * height ), material );
      //handle material key index
      var materialKey = texture_id;

      if (si > 0) {
        mesh.geometry = new THREE.PlaneGeometry( 64, base * height );
        materialKey = texture_id+'_'+height;
        mesh.material = material2;
      } else {
        //base = 32;
        mesh.geometry =  new THREE.PlaneGeometry( 64, 64 );
      }

      var mat_array_index = materialListIndex.indexOf(materialKey);
      if (mat_array_index < 0) {
        materialListIndex.push(materialKey);
        materialListDictionary.push(mesh.material);
        mat_array_index = materialListIndex.length - 1;
      }

      var offset = structureOffsetArray[si];

      if (si === 0) {
        mesh.position.set( x * 64 + offset[0], y * 64 + offset[1], (base * height) );
      } else {
        mesh.position.set( x * 64 + offset[0], y * 64 + offset[1], (base * height) / 2 );
      }
      mesh.rotation.set( offset[2], offset[3], offset[4] );
      mesh.geometry.computeFaceNormals();
      mesh.updateMatrix();
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      chunkGeometry.merge(mesh.geometry, mesh.matrix, mat_array_index);

    }

  }
  */

  /* old implementation:
  //now loop through our structures
  for (var s = 0; s < structures.length; s++) {
    //define individual structure plus attributes
    var structure = structures[s];
    var height = structure.height;
    var base = 64;
    var texture_id = structure.texture_id;
    //structure geometry
    var geometry = new THREE.BoxGeometry( base, base, base * height);
    var material = EO.structures.library[texture_id].clone();
    for ( var t = 0; t < geometry.faces.length; t += 2 ) {
      geometry.faces[ t ].materialIndex = 0;
      geometry.faces[ t + 1 ].materialIndex = 0;
  	}
    var frontMaterial = EO.structures.createFaceMaterial( texture_id, 1, height * 2 );
    geometry.faces[ 6 ].materialIndex = 1;
    geometry.faces[ 6 + 1 ].materialIndex = 1;
    var mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial([material, frontMaterial]) );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    console.log(mesh);
    mesh.position.set(structure.x * 64, structure.y * 64, 0);
    EO.three.scene.add(mesh);
  }
  */

  for (var s = 0; s < structures.length; s++) {
    //define individual structure plus attributes
    var structure = structures[s];
    var height = structure.height;
    var base = 64;
    var texture_id = structure.texture_id;
    //structure geometry
    var geometry = new THREE.BoxGeometry( base, base, base / 2 );
    var material = EO.structures.library[texture_id].clone();
    material.map.needsUpdate = true;
    material.map.repeat.set(1, 1);
    var mesh = new THREE.Mesh( geometry, material );
    var mat_array_index = materialListIndex.indexOf(texture_id);
    if (mat_array_index < 0) {
      materialListIndex.push(texture_id);
      materialListDictionary.push(material);
      mat_array_index = materialListIndex.length - 1;
    }
    for ( var t = 0; t < mesh.geometry.faces.length; t ++ ) {
      mesh.geometry.faces[ t ].materialIndex = mat_array_index;
    }
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    for (var i = 0; i < height; i++) {
      mesh.position.set(structure.x * 64, structure.y * 64, i * base / 2 + base / 4);
      mesh.updateMatrix();
      chunkGeometry.merge(mesh.geometry, mesh.matrix);
    }
  }


  chunkGeometry.sortFacesByMaterialIndex();
  //var bufferGeo = new THREE.BufferGeometry().fromGeometry(chunkGeometry);
  var chunkMesh = new THREE.Mesh(chunkGeometry, new THREE.MeshFaceMaterial( materialListDictionary ) );
  chunkMesh.castShadow = true;
  chunkMesh.receiveShadow = true;
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
