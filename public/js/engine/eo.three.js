
///////////////////
// Three.js Core //
///////////////////
EO.three = {};

EO.three.init = function() {
  
  //scene
  EO.three.scene = new THREE.Scene();
  
  //camera
  var camera_left = EO.settings.width / - 2;
  var camera_right = EO.settings.width / 2;
  var camera_top = EO.settings.height / 2;
  var camera_bottom = EO.settings.height / - 2;
  var near = -1000;
  var far = 1000;
  EO.three.camera = new THREE.OrthographicCamera( camera_left, camera_right, camera_top, camera_bottom, near, far );
  EO.three.camera.lookAt(new THREE.Vector3(0, 0, 0));
  EO.three.camera.updateProjectionMatrix();
  
  //renderer
  var canvas = document.getElementById("gamecanvas");
  EO.three.renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
  EO.three.renderer.setSize( EO.settings.width, EO.settings.height );
  EO.three.renderer.shadowMap.enabled = true;
  
  //ambient light
  var ambientLight = new THREE.AmbientLight( 0xcccccc );
  ambientLight.intensity = .5;
  EO.three.scene.add( ambientLight );
  //dir lighting for shadow
  EO.three.dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
  EO.three.dirLight.color.setHSL( 0.1, 1, 0.95 );
  EO.three.dirLight.position.set( 1, -1.75, 4 );
  EO.three.dirLight.position.multiplyScalar( 50 );
  EO.three.dirLight.castShadow = true;
  EO.three.dirLight.shadow.mapSize.width = 2048;
  EO.three.dirLight.shadow.mapSize.height = 2048;
  var d = 500;
  EO.three.dirLight.shadow.camera.left = -d;
  EO.three.dirLight.shadow.camera.right = d;
  EO.three.dirLight.shadow.camera.top = d;
  EO.three.dirLight.shadow.camera.bottom = -d;
  EO.three.dirLight.shadow.camera.far = 3500;
  EO.three.dirLight.shadow.bias = -0.0001;
  EO.three.dirLight.shadow.camera.visible = true;
  EO.three.scene.add( EO.three.dirLight );
  
  EO.three.renderer.setClearColor( 0xbfd1e5 );
  EO.three.renderer.setPixelRatio( window.devicePixelRatio ); 

  //animation mixer
  EO.three.mixer = new THREE.AnimationMixer( EO.three.scene );
}
EO.three.whitelist = ["Scene", "AmbientLight", "DirectionalLight", "Mesh", "Bone"]
EO.three.isWhitelistedObject = function(object_type) {
  var isWhitelistedObject = false;
  for (var i = 0; i < EO.three.whitelist.length; i++) {
    if (object_type === EO.three.whitelist[i]) {
      isWhitelistedObject = true;
      break;
    }
  }
  return isWhitelistedObject;
}
EO.three.updateCamera = function( position ) {
  EO.three.camera.position.set( position.x, position.y - 2, 1 );
  EO.three.camera.lookAt( position );
  EO.three.camera.updateProjectionMatrix();
}