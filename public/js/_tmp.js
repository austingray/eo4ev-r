var EO = EO || {};

//	Settings
//		global settings
EO.settings = {};
EO.settings.width = 800;
EO.settings.height = 600;

//	Textures
//		holds all tile data
EO.tiles = {};
EO.tiles.textures = [
	{ type:'grass', name: 'Grass 1', file:'img/tiles/grass/grass1.png', animated: false },
	{ type:'water', name: 'Water 1', file:'img/tiles/water/water-animated.png', animated: true, frames: 3 }
];
EO.tiles.type = {};
EO.tiles.type.grass = [];
EO.tiles.type.water = [];
EO.tiles.init = function() {
	
	for (var i = 0; i < EO.tiles.textures.length; i++) {
		var texture = EO.tiles.textures[i];
		var tLoader = new THREE.TextureLoader();
		var t = tLoader.load( texture.file );
		if (texture.animated) {
			t.wrapS = t.wrapT = THREE.RepeatWrapping;
			t.repeat.set( 1 / texture.frames, 1 );
		}
		var mesh = new THREE.MeshPhongMaterial({ map: t });
		mesh.receiveShadow = true;
		EO.tiles.type[texture.type].push(mesh);
	}

}

EO.width = 800;
EO.height = 600;

EO.preload = {};
EO.preload.grass;
EO.preload.init = function(init) {
	var textureLoader = new THREE.TextureLoader();
	var grass = textureLoader.load('img/tiles/grass/grass1.png');
	
	EO.textures.water = textureLoader.load('img/tiles/water/water-animated.png');
	EO.textures.water.wrapS = EO.textures.water.wrapT = THREE.RepeatWrapping; 
	EO.textures.water.repeat.set( 1 / 3, 1 );
	//var grass = textureLoader.load('img/grass_64.jpg');
	//grass.wrapS = grass.wrapT = THREE.RepeatWrapping;
	EO.preload.grass = new THREE.MeshPhongMaterial({ map: grass });
	EO.preload.grass.receiveShadow = true;
	EO.preload.water = new THREE.MeshPhongMaterial({ map: EO.textures.water });
	EO.preload.water.receiveShadow = true;
	init();
}

EO.textures = {};
EO.input = {};
EO.input.keyboard = {};
EO.input.keyboard.left = false;
EO.input.keyboard.right = false;
EO.input.keyboard.up = false;
EO.input.keyboard.down = false;
EO.input.keyboard.update = function() {
	var mSpeed = .7;
	var cRot = 0;
	var cX = 0;
	var cY = 0;
	var cLeft = EO.input.keyboard.left;
	var cRight = EO.input.keyboard.right;
	var cDown = EO.input.keyboard.down;
	var cUp = EO.input.keyboard.up;
	if (cLeft) {
		cRot = -1.6;
	}
	if (cRight) {
		cRot = 1.6;
	}
	if (cDown) {
		cRot = 0;
	}
	if (cUp) {
		cRot = 3.20;
	}
	if (cLeft && cDown) {
		cRot = -0.8;
		mSpeed = .5;
	}
	if (cLeft && cUp) {
		cRot = -2.4;
		mSpeed = .5;
	}
	if (cRight && cDown) {
		cRot = 0.8;
		mSpeed = .5;
	}
	if (cRight && cUp) {
		cRot = 2.4;
		mSpeed = .5;
	}
	if (EO.character.action) {
		if ( EO.input.keyboard.left === false && EO.input.keyboard.up === false && EO.input.keyboard.right === false && EO.input.keyboard.down === false ) {
			EO.character.action.walk.stop();
		} else {
			EO.character.action.walk.play();
			if (cLeft) EO.character.mesh.position.x = EO.character.mesh.position.x - mSpeed;
			if (cRight) EO.character.mesh.position.x = EO.character.mesh.position.x + mSpeed;
			if (cDown) EO.character.mesh.position.y = EO.character.mesh.position.y - mSpeed;
			if (cUp) EO.character.mesh.position.y = EO.character.mesh.position.y + mSpeed;
			EO.character.mesh.rotation.y = cRot;
		}
	}

}
EO.three = {};
EO.three.init = function() {
	//scene
	this.scene = new THREE.Scene();
	//camera
	//this.camera = new THREE.PerspectiveCamera( 75, EO.width / EO.height, .1, 10000 );
	this.camera = new THREE.OrthographicCamera( (EO.width / - 2), (EO.width / 2), (EO.height / 2), ( EO.height / - 2), -1000, 1000 );
	//this.camera.rotation.x = .75;
	this.camera.position.z = 200;
	//renderer
	var canvas = document.getElementById("gamecanvas");
	this.renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
	this.renderer.setSize( EO.width, EO.height );
	this.renderer.shadowMap.enabled = true;
	//this.renderer.shadowMap.cullFace = true;
	//keyboard
	this.keyboard = new THREEx.KeyboardState(this.renderer.domElement);
	this.renderer.domElement.setAttribute("tabIndex", "0");
	this.renderer.domElement.focus();

	// only on keydown
	
	this.keyboard.domElement.addEventListener('keydown', function(event){
		//up
		if( EO.three.keyboard.eventMatches(event, 'w') ) {
			EO.input.keyboard.up = true;
		}
		//down
		if( EO.three.keyboard.eventMatches(event, 's') ) {
			EO.input.keyboard.down = true;
		}
		//left
		if( EO.three.keyboard.eventMatches(event, 'a') ) {
			EO.input.keyboard.left = true;
		}
		//right
		if( EO.three.keyboard.eventMatches(event, 'd') ) {
			EO.input.keyboard.right = true;
		}
	});
	this.keyboard.domElement.addEventListener('keyup', function(event) {
		//up
		if( EO.three.keyboard.eventMatches(event, 'w') ) {
			EO.input.keyboard.up = false;
		}
		//down
		if( EO.three.keyboard.eventMatches(event, 's') ) {
			EO.input.keyboard.down = false;
		}
		//left
		if( EO.three.keyboard.eventMatches(event, 'a') ) {
			EO.input.keyboard.left = false;
		}
		//right
		if( EO.three.keyboard.eventMatches(event, 'd') ) {
			EO.input.keyboard.right = false;
		}
	});

}


EO.dom = {};
EO.dom.init = function() {
	//document.body.appendChild( EO.three.renderer.domElement );
}

EO.map = {};
EO.map.init = function() {
	this.width = 48;
	this.height = 48;
	this.offsetX = this.width / 2;
	this.offsetY = this.height / 2;
	this.tile.init();
	this.generate();
	this.draw();
	//console.log(this.array);
}
EO.map.generate = function() {
	this.array = [];
	for (var i=0; i<this.width; i++) {
		this.array[i] = [];
		for (var j=0; j<this.height; j++) {
			EO.map.array[i][j] = this.tile.generate();
		}
	}
}
EO.map.tile = {};
EO.map.tile.init = function() {
	this.width = 64;
	this.height = 64;
	this.depth = 1;
	this.geometry = new THREE.CubeGeometry( this.width, this.height, this.depth );
}

EO.map.tile.generate = function() {
	var tile = {};
	tile.width = this.width;
	tile.height = this.height;
	var color = 0x00AE00;
	if (Math.random() > .5) {
		color = 0x00FF00;
	}
	//tile.geometry = new THREE.BoxGeometry( tile.width, tile.height, 1 );
	//tile.material = new THREE.MeshBasicMaterial( { color: color } );
	//tile.cube = new THREE.Mesh( tile.geometry, tile.material );
	tile.geometry = this.geometry;
	//tile.material = this.material;
	//tile.material = new THREE.MeshBasicMaterial( { color: color } );
	
	tile.material = EO.preload.grass;
	if (Math.random() > .3) {
		tile.material = EO.preload.grass;
	} else {
		tile.material = EO.preload.water;
	}
	tile.mesh = new THREE.Mesh( this.geometry, tile.material );
	return tile;
}
EO.map.draw = function() {
	for (i=0; i<this.array.length; i++) {
		for (var j=0; j<this.array[i].length; j++) {
			var startX = i * 64;
			var startY = j * 64;
			this.array[i][j].mesh.position.set( startX - this.offsetX * this.tile.width, startY - this.offsetY * this.tile.height, 0 )
			this.array[i][j].mesh.castShadow = true;
			this.array[i][j].mesh.receiveShadow = true;
			EO.three.scene.add( this.array[i][j].mesh );
		}
	}
}

EO.util = {};
EO.util.frame = 0;

EO.util.update = function() {
	//console.log(EO.util.frame);
	EO.textures.water.offset.y = EO.util.frame / 3;
}
var clock = new THREE.Clock();
EO.render = function() {
	requestAnimationFrame( EO.render );
	if (EO.character.mesh && EO.three.camera) {
		EO.three.camera.position.x = EO.character.mesh.position.x;
		EO.three.camera.position.y = EO.character.mesh.position.y -200;
		EO.three.camera.lookAt(EO.character.mesh.position);
		EO.three.camera.updateProjectionMatrix();
	}
	
	var delta = 0.75 * clock.getDelta();

	var f = Math.floor(Date.now() / 600) % 3;
	if (f !== EO.util.frame) {
		EO.util.update();
	}
	EO.util.frame = f;

	if (EO.character.mixer) {
		EO.character.mixer.update( delta );
		EO.character.helper.update();
	}

	EO.input.keyboard.update();


	//EO.three.camera.position.z = Math.abs( Math.cos( timer ) * 4200 );

	//EO.three.camera.position.y = Math.sin( timer ) * 250;// - EO.map.width;
	//EO.three.camera.position.x = Math.cos( timer ) * 250;
	//console.log(EO.three.camera.position.y);
	
	//EO.three.camera.position.x = -139.72;

	//EO.three.controls.update();

	window.scene = EO.three.scene;

	//EO.three.camera.lookAt( new THREE.Vector3(0, 0, 0) );
	//EO.three.camera.updateProjectionMatrix();
	//
	EO.three.renderer.render( EO.three.scene, EO.three.camera );
}

EO.character = {};

EO.init = function() {
	EO.preload.init(function() {

		EO.three.init();
		EO.dom.init();
		EO.map.init();
		//midpoint
		EO.three.midpoint = new THREE.Vector3(EO.map.width / 2 * EO.map.tile.width, EO.map.height / 2 * EO.map.tile.height, 1);
		//EO.three.scene.add(EO.three.midpoint);
		//EO.three.midpoint.add(EO.three.camera);
		//EO.three.camera.position.copy(EO.three.midpoint);
		//lights
		var ambientLight = new THREE.AmbientLight( 0xcccccc );
		ambientLight.intensity = .5;
		EO.three.scene.add( ambientLight );
		hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
		hemiLight.color.setHSL( 0.6, 1, 0.6 );
		hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
		hemiLight.position.set( 0, 500, 0 );
		//EO.three.scene.add( hemiLight );
		//shadow lighting
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


		//render
		EO.three.renderer.setClearColor( 0xbfd1e5 );
		EO.three.renderer.setPixelRatio( window.devicePixelRatio );
		EO.render();

		//EO.three.camera.position.z = 200;
		//EO.three.camera.position.x = 0;
		//EO.three.camera.position.y = 0;
		//this.three.camera.position.x = 0;//(EO.map.width / 2) * EO.map.tile.width;
		//this.three.camera.position.y = (EO.map.height / 2) * EO.map.tile.height;

	});

	var animation;
	// instantiate a loader
		var loader = new THREE.ObjectLoader();
		loader.castShadow = true;

		// load a resource
		loader.load(
			// resource URL
			'/js/models/updated_export_8.json',
			// Function when resource is loaded
			function ( object ) {
				console.log(object);
				//materials[0].shininess = 0;
				//var material = new THREE.MultiMaterial( materials );
				//var material = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0xffffff, shininess: 20, morphTargets: true, vertexColors: THREE.FaceColors, shading: THREE.FlatShading } );
				//EO.character.mesh = new THREE.SkinnedMesh( geometry, material );
				EO.character.mesh = object.children[0];
				EO.character.mesh.material.skinning = true;
				EO.character.mesh.scale.x = 6;
				EO.character.mesh.scale.y = 6;
				EO.character.mesh.scale.z = 6;
				//EO.character.mesh.castShadow = true;
				//EO.character.mesh.receiveShadow = true;
				//mesh.position.z = 51;
				//EO.character.mesh.rotateX(135);
				EO.character.mesh.rotation.x = 1.45;
				// EO.character.mesh.traverse( function(child) {
				// 	if ( child instanceof THREE.Mesh ) {
				//         child.castShadow = true;
				// 		child.receiveShadow = true;
				//     }
				// });
				EO.three.scene.add( EO.character.mesh );

				EO.character.helper = new THREE.SkeletonHelper( EO.character.mesh );
				EO.character.helper.material.linewidth = 1;
				EO.character.helper.visible = false;
				//EO.character.helper.rotateX(135);
				EO.three.scene.add( EO.character.helper );

				EO.character.mixer = new THREE.AnimationMixer( EO.character.mesh );
				EO.character.action = {}
				//EO.character.action.stand = new THREE.AnimationAction( geometry.animations[ 0 ] );
				EO.character.action.walk  = EO.character.mixer.clipAction( EO.character.mesh.geometry.animations[0], EO.character.mesh );
				EO.character.action.two = EO.character.mixer.clipAction( EO.character.mesh.geometry.animations[1] );
				EO.character.action.three = EO.character.mixer.clipAction( EO.character.mesh.geometry.animations[2] );
				//console.log(EO.character.action.walk);
				//
				//
				//
				
		
				
				
			}
		);



	// 	var animation;
	// // instantiate a loader
	// 	var loader = new THREE.JSONLoader();
	// 	loader.castShadow = true;

	// 	// load a resource
	// 	loader.load(
	// 		// resource URL
	// 		'/threed/js/models/eo4ev_walk_stand_2json.json',
	// 		// Function when resource is loaded
	// 		function ( geometry, materials ) {
	// 			console.log(materials);
	// 			materials[0].shininess = 0;
	// 			var material = new THREE.MultiMaterial( materials );
	// 			//var material = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0xffffff, shininess: 20, morphTargets: true, vertexColors: THREE.FaceColors, shading: THREE.FlatShading } );
	// 			EO.character.mesh = new THREE.SkinnedMesh( geometry, material );
	// 			EO.character.mesh.castShadow = true;
	// 			EO.character.mesh.receiveShadow = true;
	// 			//mesh.position.z = 51;
	// 			EO.character.mesh.rotateX(135);
	// 			EO.character.mesh.traverse( function(child) {
	// 				if ( child instanceof THREE.Mesh ) {
	// 			        child.castShadow = true;
	// 					child.receiveShadow = true;
	// 			    }
	// 			});
	// 			EO.three.scene.add( EO.character.mesh );

	// 			//EO.character.helper = new THREE.SkeletonHelper( EO.character.mesh );
	// 			//EO.character.helper.material.linewidth = 3;
	// 			//EO.character.helper.visible = true;
	// 			//EO.character.helper.rotateX(135);
	// 			//EO.three.scene.add( EO.character.helper );

	// 			EO.character.mixer = new THREE.AnimationMixer( EO.character.mesh );
	// 			EO.character.action = {}
	// 			//EO.character.action.stand = new THREE.AnimationAction( geometry.animations[ 0 ] );
	// 			EO.character.action.walk = EO.character.mixer.clipAction( geometry.animations[2] );
	// 			console.log(EO.character.action.walk);
	// 			EO.character.action.walk.play();
	// 		}
	// 	);
}

EO.init();