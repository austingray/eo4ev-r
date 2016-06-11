var CHARACTER = CHARACTER || {};

//////////////////////////////////////////////////
// Init called when signal received from server //
//////////////////////////////////////////////////
CHARACTER.init = function() {
  CHARACTER.three.init();
  CHARACTER.models.init();
  CHARACTER.tiles.init();
  CHARACTER.map.init();
  CHARACTER.render();
}

////////////////////
// Dat render doe //
////////////////////
CHARACTER.render = function() {
  //delta
  var delta = 1.5 * CHARACTER.settings.clock.getDelta();
  //render frame
  CHARACTER.three.renderer.render( CHARACTER.three.scene, CHARACTER.three.camera );
  if (CHARACTER.models.library.hero)
    CHARACTER.models.library.hero.rotation.y = CHARACTER.models.library.hero.rotation.y + .001;
  if (CHARACTER.map.mesh)
    CHARACTER.map.mesh.rotation.z = CHARACTER.map.mesh.rotation.z + .001;
  //request next frame
  requestAnimationFrame( CHARACTER.render );
}

//////////////
// Settings //
//////////////
CHARACTER.settings = {};
CHARACTER.settings.width = 500;
CHARACTER.settings.height = 400;
CHARACTER.settings.clock = new THREE.Clock();

///////////////////
// Three.js Core //
///////////////////
CHARACTER.three = {};
CHARACTER.three.init = function() {
  
  //scene
  CHARACTER.three.scene = new THREE.Scene();
  
  //camera
  var camera_left = CHARACTER.settings.width / - 2;
  var camera_right = CHARACTER.settings.width / 2;
  var camera_top = CHARACTER.settings.height / 2;
  var camera_bottom = CHARACTER.settings.height / - 2;
  var near = -1000;
  var far = 10000;
  //CHARACTER.three.camera = new THREE.OrthographicCamera( camera_left, camera_right, camera_top, camera_bottom, near, far );
  CHARACTER.three.camera = new THREE.PerspectiveCamera( 45, CHARACTER.settings.width / CHARACTER.settings.height, 1, 1000 );
  CHARACTER.three.camera.position.z = 90;
  CHARACTER.three.camera.position.y = -100;
  CHARACTER.three.camera.lookAt(new THREE.Vector3(0, 100, 0));
  CHARACTER.three.camera.updateProjectionMatrix();
  
  //renderer
  var canvas = document.getElementById("character");
  CHARACTER.three.renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
  CHARACTER.three.renderer.setSize( CHARACTER.settings.width, CHARACTER.settings.height );
  CHARACTER.three.renderer.shadowMap.enabled = true;
  
  //ambient light
  var ambientLight = new THREE.AmbientLight( 0xcccccc );
  ambientLight.intensity = .5;
  CHARACTER.three.scene.add( ambientLight );
  //dir lighting for shadow
  CHARACTER.three.dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
  CHARACTER.three.dirLight.color.setHSL( 0.1, 1, 0.95 );
  CHARACTER.three.dirLight.position.set( 1, -1.75, 4 );
  CHARACTER.three.dirLight.position.multiplyScalar( 50 );
  CHARACTER.three.dirLight.castShadow = true;
  CHARACTER.three.dirLight.shadow.mapSize.width = 2048;
  CHARACTER.three.dirLight.shadow.mapSize.height = 2048;
  var d = 500;
  CHARACTER.three.dirLight.shadow.camera.left = -d;
  CHARACTER.three.dirLight.shadow.camera.right = d;
  CHARACTER.three.dirLight.shadow.camera.top = d;
  CHARACTER.three.dirLight.shadow.camera.bottom = -d;
  CHARACTER.three.dirLight.shadow.camera.far = 3500;
  CHARACTER.three.dirLight.shadow.bias = -0.0001;
  CHARACTER.three.dirLight.shadow.camera.visible = true;
  CHARACTER.three.scene.add( CHARACTER.three.dirLight );
  
  CHARACTER.three.renderer.setClearColor( 0xbfd1e5 );
  CHARACTER.three.renderer.setPixelRatio( window.devicePixelRatio ); 


}
CHARACTER.three.updateCamera = function( position ) {
  CHARACTER.three.camera.position.set( position.x, position.y - 2, 1 );
  CHARACTER.three.camera.lookAt( position );
  CHARACTER.three.camera.updateProjectionMatrix();
}


////////////////////////////////
// Dat main model handler doe //
////////////////////////////////
/// stores all model data, holds original mesh objects to clone as needed
CHARACTER.models = {}
CHARACTER.models.library = {};
CHARACTER.models.dir = 'js/models/';
CHARACTER.models.predefined = [
  { file: CHARACTER.models.dir + 'updated_export_8.json', id: 'hero', scale: 6, rotation_x: 1.45 }
];
CHARACTER.models.init = function() {
  var loader = new THREE.ObjectLoader();
  for (var i = 0; i < CHARACTER.models.predefined.length; i++) {
    var predefined = CHARACTER.models.predefined[i];
    loader.load( predefined.file, function(object) {
      var model = object.children[0];
      model.material.skinning = true;

      // texture
      // http://stackoverflow.com/questions/12368200/displaying-background-colour-through-transparent-png-on-material
      //var texture = new THREE.Texture( generateTexture( ) ); // texture background is transparent
      var texture = model.material.map;
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

      model.material = material;
      //model.material.vertexColors = THREE.FaceColors
      //
      model.scale.x = predefined.scale;
      model.scale.y = predefined.scale;
      model.scale.z = predefined.scale;
      model.rotation.x = predefined.rotation_x;
      CHARACTER.models.library[predefined.id] = model;
      CHARACTER.three.scene.add(CHARACTER.models.library.hero);
    });
  }
}


///////////
// Tiles //
///////////
/// stores all map tile data, we'll access this from the map, maybe we nest this under map? i dunno yet
CHARACTER.tiles = {};
CHARACTER.tiles.textures = [
  { type:'grass', name: 'Grass 1', file:'img/tiles/grass/grass1.png', animated: false }
];
CHARACTER.tiles.type = {};
CHARACTER.tiles.type.grass = [];
CHARACTER.tiles.type.water = [];
CHARACTER.tiles.materials = [];
CHARACTER.tiles.init = function() {
  
  for (var i = 0; i < CHARACTER.tiles.textures.length; i++) {
    var texture = CHARACTER.tiles.textures[i];
    var tLoader = new THREE.TextureLoader();
    var t = tLoader.load( texture.file );
    
    t.repeat.set(CHARACTER.map.tilesPer , CHARACTER.map.tilesPer);
    if (texture.animated) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;//THREE.RepeatWrapping;
      t.repeat.set( CHARACTER.map.tilesPer, CHARACTER.map.tilesPer );

    } else {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
    }
    //t.needsUpdate = true;
    //t.image.width = 32;
    var mesh = new THREE.MeshPhongMaterial({ map: t });
    //mesh.map.image.width = 32;
    //var mesh = new THREE.MeshBasicMaterial({ map: t });
    mesh.receiveShadow = true;
    CHARACTER.tiles.type[texture.type].push(mesh);
    CHARACTER.tiles.materials.push(mesh);
  }

}

/////////
// Map //
/////////
CHARACTER.map = {};
CHARACTER.map.width = 1280;
CHARACTER.map.height = 1280;
CHARACTER.map.tilesPer = 20;
CHARACTER.map.geometry = new THREE.PlaneGeometry(CHARACTER.map.width, CHARACTER.map.height, CHARACTER.map.tilesPer, CHARACTER.map.tilesPer);
var l = CHARACTER.map.geometry.faces.length / 2;
for (var i=0; i < l; i++) {
  var j  = 2 * i;
  var rand = Math.random();
  CHARACTER.map.geometry.faces[j].materialIndex = 0;
}
CHARACTER.map.geometry.sortFacesByMaterialIndex();

CHARACTER.map.init = function() {
  this.width = 14;
  this.height = 14;
  CHARACTER.map.draw();
}
CHARACTER.map.draw = function() {
  CHARACTER.map.mesh = new THREE.Mesh(CHARACTER.map.geometry, new THREE.MeshFaceMaterial(CHARACTER.tiles.materials));
  CHARACTER.map.mesh.receiveShadow = true;
  CHARACTER.three.scene.add(CHARACTER.map.mesh);
}


CHARACTER.init();