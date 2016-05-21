/*

	what needs to happen

	init three...
		camera?

	draw a map...
		so generate a map?
		create tile system

			GAME.map

			only draw map if in viewport

	place a character on the map...
		center on the character

	add keyboard controls



	*/

var GAME = GAME || {};

GAME.width = 800;
GAME.height = 600;

GAME.preload = {};
GAME.preload.grass;
GAME.preload.init = function(init) {
	var textureLoader = new THREE.TextureLoader();
	var grass = textureLoader.load('img/tiles/grass/grass1.png');
	
	GAME.textures.water = textureLoader.load('img/tiles/water/water-animated.png');
	GAME.textures.water.wrapS = GAME.textures.water.wrapT = THREE.RepeatWrapping; 
	GAME.textures.water.repeat.set( 1 / 3, 1 );
	//var grass = textureLoader.load('img/grass_64.jpg');
	//grass.wrapS = grass.wrapT = THREE.RepeatWrapping;
	GAME.preload.grass = new THREE.MeshPhongMaterial({ map: grass });
	GAME.preload.grass.receiveShadow = true;
	GAME.preload.water = new THREE.MeshPhongMaterial({ map: GAME.textures.water });
	GAME.preload.water.receiveShadow = true;
	init();
}

GAME.textures = {};
GAME.input = {};
GAME.input.keyboard = {};
GAME.input.keyboard.left = false;
GAME.input.keyboard.right = false;
GAME.input.keyboard.up = false;
GAME.input.keyboard.down = false;
GAME.input.keyboard.update = function() {
	var mSpeed = .7;
	var cRot = 0;
	var cX = 0;
	var cY = 0;
	var cLeft = GAME.input.keyboard.left;
	var cRight = GAME.input.keyboard.right;
	var cDown = GAME.input.keyboard.down;
	var cUp = GAME.input.keyboard.up;
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
	if (GAME.character.action) {
		if ( GAME.input.keyboard.left === false && GAME.input.keyboard.up === false && GAME.input.keyboard.right === false && GAME.input.keyboard.down === false ) {
			GAME.character.action.walk.stop();
		} else {
			GAME.character.action.walk.play();
			if (cLeft) GAME.character.mesh.position.x = GAME.character.mesh.position.x - mSpeed;
			if (cRight) GAME.character.mesh.position.x = GAME.character.mesh.position.x + mSpeed;
			if (cDown) GAME.character.mesh.position.y = GAME.character.mesh.position.y - mSpeed;
			if (cUp) GAME.character.mesh.position.y = GAME.character.mesh.position.y + mSpeed;
			GAME.character.mesh.rotation.y = cRot;
		}
	}

}
GAME.three = {};
GAME.three.init = function() {
	//scene
	this.scene = new THREE.Scene();
	//camera
	//this.camera = new THREE.PerspectiveCamera( 75, GAME.width / GAME.height, .1, 10000 );
	this.camera = new THREE.OrthographicCamera( (GAME.width / - 2), (GAME.width / 2), (GAME.height / 2), ( GAME.height / - 2), -1000, 1000 );
	//this.camera.rotation.x = .75;
	this.camera.position.z = 200;
	//renderer
	var canvas = document.getElementById("gamecanvas");
	this.renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
	this.renderer.setSize( GAME.width, GAME.height );
	this.renderer.shadowMap.enabled = true;
	//this.renderer.shadowMap.cullFace = true;
	//keyboard
	this.keyboard = new THREEx.KeyboardState(this.renderer.domElement);
	this.renderer.domElement.setAttribute("tabIndex", "0");
	this.renderer.domElement.focus();

	// only on keydown
	
	this.keyboard.domElement.addEventListener('keydown', function(event){
		//up
		if( GAME.three.keyboard.eventMatches(event, 'w') ) {
			GAME.input.keyboard.up = true;
		}
		//down
		if( GAME.three.keyboard.eventMatches(event, 's') ) {
			GAME.input.keyboard.down = true;
		}
		//left
		if( GAME.three.keyboard.eventMatches(event, 'a') ) {
			GAME.input.keyboard.left = true;
		}
		//right
		if( GAME.three.keyboard.eventMatches(event, 'd') ) {
			GAME.input.keyboard.right = true;
		}
	});
	this.keyboard.domElement.addEventListener('keyup', function(event) {
		//up
		if( GAME.three.keyboard.eventMatches(event, 'w') ) {
			GAME.input.keyboard.up = false;
		}
		//down
		if( GAME.three.keyboard.eventMatches(event, 's') ) {
			GAME.input.keyboard.down = false;
		}
		//left
		if( GAME.three.keyboard.eventMatches(event, 'a') ) {
			GAME.input.keyboard.left = false;
		}
		//right
		if( GAME.three.keyboard.eventMatches(event, 'd') ) {
			GAME.input.keyboard.right = false;
		}
	});

}


GAME.dom = {};
GAME.dom.init = function() {
	//document.body.appendChild( GAME.three.renderer.domElement );
}

GAME.map = {};
GAME.map.init = function() {
	this.width = 48;
	this.height = 48;
	this.offsetX = this.width / 2;
	this.offsetY = this.height / 2;
	this.tile.init();
	this.generate();
	this.draw();
	//console.log(this.array);
}
GAME.map.generate = function() {
	this.array = [];
	for (var i=0; i<this.width; i++) {
		this.array[i] = [];
		for (var j=0; j<this.height; j++) {
			GAME.map.array[i][j] = this.tile.generate();
		}
	}
}
GAME.map.tile = {};
GAME.map.tile.init = function() {
	this.width = 64;
	this.height = 64;
	this.depth = 1;
	this.geometry = new THREE.CubeGeometry( this.width, this.height, this.depth );
}

GAME.map.tile.generate = function() {
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
	
	tile.material = GAME.preload.grass;
	if (Math.random() > .3) {
		tile.material = GAME.preload.grass;
	} else {
		tile.material = GAME.preload.water;
	}
	tile.mesh = new THREE.Mesh( this.geometry, tile.material );
	return tile;
}
GAME.map.draw = function() {
	for (i=0; i<this.array.length; i++) {
		for (var j=0; j<this.array[i].length; j++) {
			var startX = i * 64;
			var startY = j * 64;
			this.array[i][j].mesh.position.set( startX - this.offsetX * this.tile.width, startY - this.offsetY * this.tile.height, 0 )
			this.array[i][j].mesh.castShadow = true;
			this.array[i][j].mesh.receiveShadow = true;
			GAME.three.scene.add( this.array[i][j].mesh );
		}
	}
}

GAME.util = {};
GAME.util.frame = 0;

GAME.util.update = function() {
	//console.log(GAME.util.frame);
	GAME.textures.water.offset.y = GAME.util.frame / 3;
}
var clock = new THREE.Clock();
GAME.render = function() {
	requestAnimationFrame( GAME.render );
	if (GAME.character.mesh && GAME.three.camera) {
		GAME.three.camera.position.x = GAME.character.mesh.position.x;
		GAME.three.camera.position.y = GAME.character.mesh.position.y -200;
		GAME.three.camera.lookAt(GAME.character.mesh.position);
		GAME.three.camera.updateProjectionMatrix();
	}
	
	var delta = 0.75 * clock.getDelta();

	var f = Math.floor(Date.now() / 600) % 3;
	if (f !== GAME.util.frame) {
		GAME.util.update();
	}
	GAME.util.frame = f;

	if (GAME.character.mixer) {
		GAME.character.mixer.update( delta );
		GAME.character.helper.update();
	}

	GAME.input.keyboard.update();


	//GAME.three.camera.position.z = Math.abs( Math.cos( timer ) * 4200 );

	//GAME.three.camera.position.y = Math.sin( timer ) * 250;// - GAME.map.width;
	//GAME.three.camera.position.x = Math.cos( timer ) * 250;
	//console.log(GAME.three.camera.position.y);
	
	//GAME.three.camera.position.x = -139.72;

	//GAME.three.controls.update();

	window.scene = GAME.three.scene;

	//GAME.three.camera.lookAt( new THREE.Vector3(0, 0, 0) );
	//GAME.three.camera.updateProjectionMatrix();
	//
	GAME.three.renderer.render( GAME.three.scene, GAME.three.camera );
}

GAME.character = {};

GAME.init = function() {
	GAME.preload.init(function() {

		GAME.three.init();
		GAME.dom.init();
		GAME.map.init();
		//midpoint
		GAME.three.midpoint = new THREE.Vector3(GAME.map.width / 2 * GAME.map.tile.width, GAME.map.height / 2 * GAME.map.tile.height, 1);
		//GAME.three.scene.add(GAME.three.midpoint);
		//GAME.three.midpoint.add(GAME.three.camera);
		//GAME.three.camera.position.copy(GAME.three.midpoint);
		//lights
		var ambientLight = new THREE.AmbientLight( 0xcccccc );
		ambientLight.intensity = .5;
		GAME.three.scene.add( ambientLight );
		hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
		hemiLight.color.setHSL( 0.6, 1, 0.6 );
		hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
		hemiLight.position.set( 0, 500, 0 );
		//GAME.three.scene.add( hemiLight );
		//shadow lighting
		GAME.three.dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
		GAME.three.dirLight.color.setHSL( 0.1, 1, 0.95 );
		GAME.three.dirLight.position.set( 1, -1.75, 4 );
		GAME.three.dirLight.position.multiplyScalar( 50 );
		GAME.three.dirLight.castShadow = true;

		GAME.three.dirLight.shadow.mapSize.width = 2048;
		GAME.three.dirLight.shadow.mapSize.height = 2048;

		var d = 500;

		GAME.three.dirLight.shadow.camera.left = -d;
		GAME.three.dirLight.shadow.camera.right = d;
		GAME.three.dirLight.shadow.camera.top = d;
		GAME.three.dirLight.shadow.camera.bottom = -d;

		GAME.three.dirLight.shadow.camera.far = 3500;
		GAME.three.dirLight.shadow.bias = -0.0001;
		GAME.three.dirLight.shadow.camera.visible = true;
		GAME.three.scene.add( GAME.three.dirLight );


		//render
		GAME.three.renderer.setClearColor( 0xbfd1e5 );
		GAME.three.renderer.setPixelRatio( window.devicePixelRatio );
		GAME.render();

		//GAME.three.camera.position.z = 200;
		//GAME.three.camera.position.x = 0;
		//GAME.three.camera.position.y = 0;
		//this.three.camera.position.x = 0;//(GAME.map.width / 2) * GAME.map.tile.width;
		//this.three.camera.position.y = (GAME.map.height / 2) * GAME.map.tile.height;

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
				//GAME.character.mesh = new THREE.SkinnedMesh( geometry, material );
				GAME.character.mesh = object.children[0];
				GAME.character.mesh.material.skinning = true;
				GAME.character.mesh.scale.x = 6;
				GAME.character.mesh.scale.y = 6;
				GAME.character.mesh.scale.z = 6;
				//GAME.character.mesh.castShadow = true;
				//GAME.character.mesh.receiveShadow = true;
				//mesh.position.z = 51;
				//GAME.character.mesh.rotateX(135);
				GAME.character.mesh.rotation.x = 1.45;
				// GAME.character.mesh.traverse( function(child) {
				// 	if ( child instanceof THREE.Mesh ) {
				//         child.castShadow = true;
				// 		child.receiveShadow = true;
				//     }
				// });
				GAME.three.scene.add( GAME.character.mesh );

				GAME.character.helper = new THREE.SkeletonHelper( GAME.character.mesh );
				GAME.character.helper.material.linewidth = 1;
				GAME.character.helper.visible = false;
				//GAME.character.helper.rotateX(135);
				GAME.three.scene.add( GAME.character.helper );

				GAME.character.mixer = new THREE.AnimationMixer( GAME.character.mesh );
				GAME.character.action = {}
				//GAME.character.action.stand = new THREE.AnimationAction( geometry.animations[ 0 ] );
				GAME.character.action.walk  = GAME.character.mixer.clipAction( GAME.character.mesh.geometry.animations[0], GAME.character.mesh );
				GAME.character.action.two = GAME.character.mixer.clipAction( GAME.character.mesh.geometry.animations[1] );
				GAME.character.action.three = GAME.character.mixer.clipAction( GAME.character.mesh.geometry.animations[2] );
				//console.log(GAME.character.action.walk);
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
	// 			GAME.character.mesh = new THREE.SkinnedMesh( geometry, material );
	// 			GAME.character.mesh.castShadow = true;
	// 			GAME.character.mesh.receiveShadow = true;
	// 			//mesh.position.z = 51;
	// 			GAME.character.mesh.rotateX(135);
	// 			GAME.character.mesh.traverse( function(child) {
	// 				if ( child instanceof THREE.Mesh ) {
	// 			        child.castShadow = true;
	// 					child.receiveShadow = true;
	// 			    }
	// 			});
	// 			GAME.three.scene.add( GAME.character.mesh );

	// 			//GAME.character.helper = new THREE.SkeletonHelper( GAME.character.mesh );
	// 			//GAME.character.helper.material.linewidth = 3;
	// 			//GAME.character.helper.visible = true;
	// 			//GAME.character.helper.rotateX(135);
	// 			//GAME.three.scene.add( GAME.character.helper );

	// 			GAME.character.mixer = new THREE.AnimationMixer( GAME.character.mesh );
	// 			GAME.character.action = {}
	// 			//GAME.character.action.stand = new THREE.AnimationAction( geometry.animations[ 0 ] );
	// 			GAME.character.action.walk = GAME.character.mixer.clipAction( geometry.animations[2] );
	// 			console.log(GAME.character.action.walk);
	// 			GAME.character.action.walk.play();
	// 		}
	// 	);
}

GAME.init();