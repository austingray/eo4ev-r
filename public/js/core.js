var EO = EO || {};

//	Settings
//		global settings
EO.settings = {};
EO.settings.width = 800;
EO.settings.height = 600;
EO.settings.clock = new THREE.Clock();

EO.util = {};
EO.util.frame = 0;
EO.util.update = function() {
	//console.log(EO.util.frame);
	//EO.textures.water.offset.y = EO.util.frame / 3;
	for (var i = 0; i < EO.tiles.type.length; i++) {
		for (var j = 0; j < EO.tiles.type[i].length; j++) {
			if (EO.tiles.type[i][j].animated) {
				EO.tiles.type[i][j].offset.y = EO.util.frame / 3;
			}
		}
	}
}

EO.input = {};
EO.input.keyboard = {};
EO.input.keyboard.left = false;
EO.input.keyboard.right = false;
EO.input.keyboard.up = false;
EO.input.keyboard.down = false;
EO.input.keyboard.update = function() {
	var cUp = EO.input.keyboard.up;
	var cRight = EO.input.keyboard.right;
	var cDown = EO.input.keyboard.down;
	var cLeft = EO.input.keyboard.left;
	if (EO.character.action) {
		var input_arr = [cUp, cRight, cDown, cLeft];
		socket.emit('input', input_arr)
	}
}

EO.three = {};
EO.three.init = function() {
	//scene
	this.scene = new THREE.Scene();
	//camera
	var camera_left = EO.settings.width / - 2;
	var camera_right = EO.settings.width / 2;
	var camera_top = EO.settings.height / 2;
	var camera_bottom = EO.settings.height / - 2;
	var near = -1000;
	var far = 1000;
	this.camera = new THREE.OrthographicCamera( camera_left, camera_right, camera_top, camera_bottom, near, far );
	this.camera.position.z = 200;
	//renderer
	var canvas = document.getElementById("gamecanvas");
	this.renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
	this.renderer.setSize( EO.settings.width, EO.settings.height );
	this.renderer.shadowMap.enabled = true;
	//this.renderer.shadowMap.cullFace = true;
	//keyboard
	this.keyboard = new THREEx.KeyboardState(this.renderer.domElement);
	this.renderer.domElement.setAttribute("tabIndex", "0");
	this.renderer.domElement.focus();

	// only on keydown
	
	this.keyboard.domElement.addEventListener('keydown', function(event){
		//up
		if( EO.three.keyboard.eventMatches(event, 'w') || EO.three.keyboard.eventMatches(event, 'up') ) {
			EO.input.keyboard.up = true;
		}
		//down
		if( EO.three.keyboard.eventMatches(event, 's') || EO.three.keyboard.eventMatches(event, 'down') ) {
			EO.input.keyboard.down = true;
		}
		//left
		if( EO.three.keyboard.eventMatches(event, 'a') || EO.three.keyboard.eventMatches(event, 'left') ) {
			EO.input.keyboard.left = true;
		}
		//right
		if( EO.three.keyboard.eventMatches(event, 'd') || EO.three.keyboard.eventMatches(event, 'right') ) {
			EO.input.keyboard.right = true;
		}
	});
	this.keyboard.domElement.addEventListener('keyup', function(event) {
		//up
		if( EO.three.keyboard.eventMatches(event, 'w') || EO.three.keyboard.eventMatches(event, 'up') ) {
			EO.input.keyboard.up = false;
		}
		//down
		if( EO.three.keyboard.eventMatches(event, 's') || EO.three.keyboard.eventMatches(event, 'down') ) {
			EO.input.keyboard.down = false;
		}
		//left
		if( EO.three.keyboard.eventMatches(event, 'a') || EO.three.keyboard.eventMatches(event, 'left') ) {
			EO.input.keyboard.left = false;
		}
		//right
		if( EO.three.keyboard.eventMatches(event, 'd') || EO.three.keyboard.eventMatches(event, 'right') ) {
			EO.input.keyboard.right = false;
		}
	});

	EO.three.midpoint = new THREE.Vector3(EO.map.width / 2 * 64, EO.map.height / 2 * 64, 1);
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
		EO.three.renderer.setClearColor( 0xbfd1e5 );
		EO.three.renderer.setPixelRatio( window.devicePixelRatio );
	

	var animation;
	// instantiate a loader
		var loader = new THREE.ObjectLoader();
		loader.castShadow = true;

		// load a resource
		loader.load(
			// resource URL
			'js/models/updated_export_8.json',
			// Function when resource is loaded
			function ( object ) {
				//materials[0].shininess = 0;
				//var material = new THREE.MultiMaterial( materials );
				//var material = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0xffffff, shininess: 20, morphTargets: true, vertexColors: THREE.FaceColors, shading: THREE.FlatShading } );
				//EO.character.mesh = new THREE.SkinnedMesh( geometry, material );
				//EO.character.ref = object;
				EO.character.mesh = object.children[0];
				EO.character.object = object;
				EO.character.material = object.children[0].material;
				EO.character.geometry = object.children[0].geometry;

				//EO.character.mesh.castShadow = true;
				//EO.character.mesh.receiveShadow = true;
				//mesh.position.z = 51;
				//EO.character.mesh.rotateX(135);
				//EO.character.mesh.material.skinning = true;

				// EO.character.mesh.traverse( function(child) {
				// 	if ( child instanceof THREE.Mesh ) {
				//         child.castShadow = true;
				// 		child.receiveShadow = true;
				//     }
				// });
				//EO.three.scene.add( EO.character.mesh );

				EO.character.helper = new THREE.SkeletonHelper( EO.character.mesh );
				EO.character.helper.material.linewidth = 1;
				EO.character.helper.visible = false;
				//EO.character.helper.rotateX(135);
				//EO.three.scene.add( EO.character.helper );

				EO.three.mixer = new THREE.AnimationMixer( EO.three.scene );
				EO.character.action = {}
				//EO.character.action.stand = new THREE.AnimationAction( geometry.animations[ 0 ] );
				// EO.character.action.walk  = EO.three.mixer.clipAction( EO.character.mesh.geometry.animations[0] );
				// EO.character.action.two = EO.three.mixer.clipAction( EO.character.mesh.geometry.animations[1] );
				// EO.character.action.three = EO.three.mixer.clipAction( EO.character.mesh.geometry.animations[2] );
				//console.log(EO.character.action.walk);
				//
				//
				//
		
				
				
			}
		);
}

//	Tiles
//		holds all tile data
EO.tiles = {};
EO.tiles.textures = [
	{ type:'grass', name: 'Grass 1', file:'img/tiles/grass/grass1.png', animated: false },
	{ type:'water', name: 'Water 1', file:'img/tiles/water/water1.png', animated: true, frames: 4 },
	{ type:'water', name: 'Water 2', file:'img/tiles/water/water1.png', animated: true, frames: 4 }
];
EO.tiles.type = {};
EO.tiles.type.grass = [];
EO.tiles.type.water = [];
EO.tiles.materials = [];
EO.tiles.init = function() {
	
	for (var i = 0; i < EO.tiles.textures.length; i++) {
		var texture = EO.tiles.textures[i];
		var tLoader = new THREE.TextureLoader();
		var t = tLoader.load( texture.file );
		
		t.repeat.set(20 , 20);
		if (texture.animated) {
			t.wrapS = t.wrapT = THREE.RepeatWrapping;//THREE.RepeatWrapping;
			t.repeat.set( 20, 20 );

		} else {
			t.wrapS = t.wrapT = THREE.RepeatWrapping;
		}
		//t.needsUpdate = true;
		//t.image.width = 32;
		var mesh = new THREE.MeshPhongMaterial({ map: t });
		console.log(mesh.map['image']);
		//mesh.map.image.width = 32;
		//var mesh = new THREE.MeshBasicMaterial({ map: t });
		mesh.receiveShadow = true;
		EO.tiles.type[texture.type].push(mesh);
		EO.tiles.materials.push(mesh);
	}

}

EO.map = {};
EO.map.geometry = new THREE.PlaneGeometry(1280, 1280, 20, 20);
var l = EO.map.geometry.faces.length / 2;
for (var i=0; i < l; i++) {
	var j  = 2 * i;
	var rand = Math.random();
	EO.map.geometry.faces[j].materialIndex = 0.4 > rand ? 1 : 0;
	EO.map.geometry.faces[j+1].materialIndex = 0.4 > rand ? 1 : 0;
}
EO.map.geometry.sortFacesByMaterialIndex();

EO.map.init = function() {
	this.width = 14;
	this.height = 14;
	this.offsetX = this.width / 2;
	this.offsetY = this.height / 2;
	EO.map.draw();
}
EO.map.draw = function() {
	// for (i=0; i<this.array.length; i++) {
	// 	for (var j=0; j<this.array[i].length; j++) {
	// 		// var startX = i * 64;
	// 		// var startY = j * 64;
	// 		// var geometry = new THREE.CubeGeometry( 64, 64, 1 );
	// 		// var material = EO.tiles.type[this.array[i][j].material][0];
	// 		// var mesh = new THREE.Mesh( geometry, material );
			

	// 		mesh.position.set( startX - this.offsetX * 64, startY - this.offsetY * 64, 0 )
	// 		mesh.castShadow = true;
	// 		mesh.receiveShadow = true;
	// 		EO.three.scene.add( mesh );
	// 	}
	// }
	//console.log(EO.tiles.materials);
	console.log(EO.map.geometry);
	EO.map.mesh = new THREE.Mesh(EO.map.geometry, new THREE.MeshFaceMaterial(EO.tiles.materials));
	EO.three.scene.add(EO.map.mesh);
}

EO.character = {};

EO.render = function() {
	
	var delta = 1.5 * EO.settings.clock.getDelta();

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
	
	if (EO.characters.count) {
		for (var i = 0; i < EO.characters.count.length; i++ ) {
			//var index = EO.characters.count[i];
			//EO.characters.group[index].mixer.update( delta );
			
			//EO.characters.group[index].helper.update();
		}
	}
	if (EO.three.mixer) {
		EO.three.mixer.update( delta );
	}

	EO.three.renderer.render( EO.three.scene, EO.three.camera );

	window.scene = EO.three.scene;

	requestAnimationFrame( EO.render );
}

EO.characters = {};
EO.characters.group = [];
EO.characters.add = function (name) {
	if (EO.character.mesh && typeof EO.three.mixer !== 'undefined') {
		
		EO.characters.count = [];
		EO.characters.count.push(name);
		
		EO.characters.group[name] = {};
		
		EO.characters.group[name].mesh = EO.character.mesh.clone(true);
		var geometry = EO.character.geometry.clone();
		geometry.bones = EO.character.geometry.bones;
		geometry.skinWeights = EO.character.geometry.skinWeights;
		geometry.skinIndices = EO.character.geometry.skinIndices;
		geometry.animations = EO.character.geometry.animations;
		geometry.animation = EO.character.geometry.animation;
		var material = EO.character.material.clone();
		EO.characters.group[name].mesh = new THREE.SkinnedMesh( geometry , material );
		
		//EO.character.action.walk.play();
		EO.characters.group[name].mesh.material.skinning = true;
		EO.characters.group[name].mesh.scale.x = 6;
		EO.characters.group[name].mesh.scale.y = 6;
		EO.characters.group[name].mesh.scale.z = 6;
		EO.characters.group[name].mesh.rotation.x = 1.45;
		EO.characters.group[name].mesh.name = name;
		
		EO.three.scene.add(EO.characters.group[name].mesh);
		
		// EO.characters.group[name].helper = new THREE.SkeletonHelper( EO.characters.group[name].mesh );
		// EO.characters.group[name].helper.material.linewidth = 1;
		// EO.characters.group[name].helper.visible = false;
		// EO.three.scene.add( EO.characters.group[name].helper );
		
		//EO.characters.group[name].mixer = new THREE.AnimationMixer( EO.characters.group[name].mesh );
		EO.characters.group[name].action = {}
		EO.characters.group[name].action.walk = EO.three.mixer.clipAction( EO.characters.group[name].mesh.geometry.animations[0], EO.characters.group[name].mesh );

	}
}

EO.hero = {};
EO.hero.walking = false;

EO.update = function(data) {
	var charData = data.pos;
	for (var i = 0; i < charData.length; i++) {
		var exists = false;
		if (charData[i] != null && charData[i].name) {
			EO.three.scene.traverse( function (object) {
				if (object.name === charData[i].name) {
					//console.log(charData[i].name);
					exists = true;
					var pos = charData[i].pos;
					object.position.set(pos.x, pos.y, pos.z);
					object.rotation.y = charData[i].rot;
					if (charData[i].walking) {
						EO.characters.group[object.name].action.walk.play();
					} else {
						EO.characters.group[object.name].action.walk.stop();
					}

					if (object.name === EO.hero.id) {
						EO.three.camera.position.x = object.position.x;
						EO.three.camera.position.y = object.position.y -200;
						EO.three.camera.lookAt(object.position);
						EO.three.camera.updateProjectionMatrix();
					}
				}
			});
			if ( typeof EO.characters.group[charData[i].name] === 'undefined' ) {
				EO.characters.add(charData[i].name);
			}
		}
	}
}

EO.disconnect = function(data) {
	var user = data.name;
	EO.three.scene.traverse( function (object) {
		if (object.name === user) {
			EO.three.scene.remove(object);
		}
	});
}


EO.init = function() {
	EO.three.init();
	EO.tiles.init();
	EO.map.init();
	EO.render();
}