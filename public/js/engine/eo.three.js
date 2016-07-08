
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
  ambientLight.intensity = .7;
  EO.three.scene.add( ambientLight );
  //point light
  EO.three.pointLight = new THREE.PointLight( 0xff0000, 1, 100 );
	EO.three.pointLight.castShadow = true;
	EO.three.pointLight.shadow.camera.near = 1;
	EO.three.pointLight.shadow.camera.far = 30;
  // pointLight.shadowCameraVisible = true;
  EO.three.pointLight.shadow.bias = 0.01;
  EO.three.scene.add(EO.three.pointLight);
  //
  EO.three.spotLight = new THREE.SpotLight( 0xffffff, 1 );
  EO.three.spotLight.position.set( 15, 40, 35 );
	EO.three.spotLight.castShadow = true;
	EO.three.spotLight.angle = Math.PI / 4;
	EO.three.spotLight.penumbra = 0.05;
	EO.three.spotLight.decay = 2;
	EO.three.spotLight.distance = 200;
	EO.three.spotLight.shadow.mapSize.width = 1024;
	EO.three.spotLight.shadow.mapSize.height = 1024;
	EO.three.spotLight.shadow.camera.near = 1;
	EO.three.spotLight.shadow.camera.far = 200;
	//EO.three.scene.add(EO.three.spotLight);
  //dir lighting for shadow
  EO.three.dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
  EO.three.dirLight.color.setHSL( 0.1, 1, 0.95 );
  EO.three.dirLight.position.set( 2.5, -1.75, 4 );
  EO.three.dirLight.position.multiplyScalar( 50 );
  EO.three.dirLight.castShadow = true;
  EO.three.dirLight.shadow.mapSize.width = 1048;
  EO.three.dirLight.shadow.mapSize.height = 1048;
  var d = 500;
  EO.three.dirLight.shadow.camera.left = -d;
  EO.three.dirLight.shadow.camera.right = d;
  EO.three.dirLight.shadow.camera.top = d;
  EO.three.dirLight.shadow.camera.bottom = -d;
  EO.three.dirLight.shadow.camera.far = 10000;
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
  //update dir light
  //EO.three.dirLight.position.set( position.x + 40000, position.y - 40000, 40000 )
  // EO.three.dirLight.shadow.camera.left = position.x - 500;
  // EO.three.dirLight.shadow.camera.right = position.x + 500;
  // EO.three.dirLight.shadow.camera.top = position.y - 500;
  // EO.three.dirLight.shadow.camera.bottom = position.y + 500;
  //EO.three.dirLight.lookAt( position.x, position.y, 4 )


}
