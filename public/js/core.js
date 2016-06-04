/**
	*	
	* 	EO.init()  *** called when socket server establishes connection
	* 	EO.render()  *** called like, 60 times a second, the main loop
	*
	* 	EO.settings  *** stores global variables
	*  	
	* 	EO.util  *** stores frame settings for animated tiles (remove or merge with settings)
	* 		.update()  *** updates current frame
	*
	* 	EO.three  *** stores all three.js core -scene, camera, renderer, lights
	* 		.init()  *** inits all those core three stuffz
	* 		.update()  *** updates all the core stuff in the render cycle based on data sent down from the server, this is a crucial function and we should probably split it out to its own thing
	* 		
	*
	* 	EO.character  *** stores all three.js data about my character object, used as a clone for all characters, probably should be made to include other objects
	* 		.init()  *** loads the initial model
	*
	* 	EO.input  *** stores all input activity
	* 		EO.input.keyboard  *** handles all keyboard inputs, using THREEx.KeyboardState
	* 			.init()
	* 			.update()
	*
	*		EO.tiles  *** loads all texture data and stores in an array
	*			.init()
	*
	*		EO.map  *** stores the three.js plane geometry (need to integrate with server map data)
	*			.init()  *** creates our three.js object
	*			.draw()  *** adds to scene (redundant, should be in init)
	*			.update()  *** doesn't really do anything yet, supposed to handle incoming server data
	*
	* 	EO.characters  *** stores all player data, need to merge with .characters and come up with naming convention more suitable for all objects
	* 		.add()  *** clones the character when called by EO.three.update() - ie new player connected to server and data was sent down
	*
	* 	EO.server  *** socket handler - current using socket.io
	* 		.on(event) -
	* 			news - 
	* 			chat - 
	* 			join -
	* 			update -
	* 			disconnect -
	*
 **/

var EO = EO || {};

//////////////////////////////////////////////////
// Init called when signal received from server //
//////////////////////////////////////////////////
EO.init = function() {
	EO.three.init();
	EO.character.init();
	EO.tiles.init();
	EO.map.init();
	EO.input.init();
	EO.render();
}

////////////////////
// Dat render doe //
////////////////////
EO.render = function() {
	//update view
	EO.three.update();
	//delta
	var delta = 1.5 * EO.settings.clock.getDelta();
	//util frame tick
	var f = Math.floor(Date.now() / 600) % 3;
	if (f !== EO.util.frame) EO.util.update();
	EO.util.frame = f;
	//input updates
	EO.input.keyboard.update();
	//animation mixer update
	if (EO.three.mixer) EO.three.mixer.update( delta );
	//render frame
	EO.three.renderer.render( EO.three.scene, EO.three.camera );
	//request next frame
	requestAnimationFrame( EO.render );
	//export scene to window for three.js inspector
	window.scene = EO.three.scene;
}

//////////////
// Settings //
//////////////
EO.settings = {};
EO.settings.width = 800;
EO.settings.height = 600;
EO.settings.clock = new THREE.Clock();

//////////
// Util //
//////////
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

///////////////////
// Three.js Core //
///////////////////
EO.three = {};
//objects marked for deletion
EO.three.dumpster = [];
// EO.three.cleanUp = setInterval(function() {
// 	while (EO.three.dumpster.length > 0) {
// 		var remove_object = EO.three.dumpster.pop();
// 		console.log('cleaning up: ' + remove_object);
// 		EO.three.scene.traverse( function (object) {
// 			if (object.name === remove_object) {
// 				EO.three.scene.remove(object);
// 			}
// 		});
// 	}
// }, 100);
EO.three.init = function() {
	
	//scene
	EO.three.scene = new THREE.Scene();
	
	//camera
	var camera_left = EO.settings.width / - 2;
	var camera_right = EO.settings.width / 2;
	var camera_top = EO.settings.height / 2;
	var camera_bottom = EO.settings.height / - 2;
	var near = -1000;
	var far = 10000;
	EO.three.camera = new THREE.OrthographicCamera( camera_left, camera_right, camera_top, camera_bottom, near, far );
	EO.three.camera.position.z = 200;
	EO.three.camera.position.x = 0;
	EO.three.camera.position.y = 0 - 1200;
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
}

EO.three.update = function() {
	//localView data
	if (typeof EO.server.data === 'undefined' || typeof EO.three.scene === 'undefined') {
		console.log('server data is undefined');
		return false;
	}
	var localView = EO.server.data.localView;
	//users
	var tmpCharArr = [];
	var existCharArr = [];
	var deleteCharArr = [];
	//add new items
	for (var k = 0; k < localView.users.length; k++) {
		tmpCharArr.push(localView.users[k].name);
		if (typeof EO.characters.group[localView.users[k].name] === 'undefined') {
			EO.characters.add(localView.users[k].name);
		}
	}
	//traverse the scene
	EO.three.scene.traverse( function (object) {
		//loop through localView users
		for (var i = 0; i < localView.users.length; i++) {
			var user = localView.users[i];
			//if user is current object
			if (user.name === object.name) {
				existCharArr.push(user.name);
				object.position.set( user.view.pos.x - localView.offset.x, user.view.pos.y - localView.offset.y, user.view.pos.z );
				object.rotation.y = user.view.rot;
				if (user.view.walking) {
					EO.characters.group[object.name].action.walk.play();
				} else {
					EO.characters.group[object.name].action.walk.stop();
				}
			}
		}
		//loop through delete characters
		for (var j = 0; j < EO.three.dumpster.length; j++) {
			var delete_object = EO.three.dumpster[j];
			if (object.name === delete_object) {
				deleteCharArr.push(object);
			}
		}
	});
	//perform delete after traverse
	while (deleteCharArr.length > 0) {
		var delete_object = deleteCharArr.pop();
		EO.three.scene.remove(delete_object);
	}
	//empty dumpster before starting the dumpster reference cycle, which stats here
	EO.three.dumpster = [];
	//add objects without a server reference to the dumpster
	var removeIndexArr = [];
	for (var i = 0; i < EO.characters.map.length; i++) {
		if (tmpCharArr.indexOf(EO.characters.map[i]) < 0) {
			//console.log('adding '+ EO.characters.map[i] + ' to garbage');
			EO.three.dumpster.push(EO.characters.map[i]);
			delete EO.characters.group[EO.characters.map[i]];
			var index = EO.characters.map.indexOf(EO.characters.map[i]);
			removeIndexArr.push(index);
		}
	}
	for (var l = 0; l < removeIndexArr.length; l++) {
		EO.characters.map.splice(removeIndexArr[l], 1);
	}
	if (EO.map) {
		EO.map.mesh.position.set(-(localView.offset.x), -(localView.offset.y), -(localView.offset.z));
		//EO.map.update();
	}
};

//////////////////////////
// Load character model //
//////////////////////////
EO.character = {};
EO.character.init = function() {
	//create loader
	var loader = new THREE.ObjectLoader();
	loader.castShadow = true;
	// load our main model
	loader.load( 'js/models/updated_export_8.json', function ( object ) {
		EO.character.mesh = object.children[0];
		EO.character.mesh.material.skinning = true;
		EO.character.mesh.scale.x = 6;
		EO.character.mesh.scale.y = 6;
		EO.character.mesh.scale.z = 6;
		EO.character.mesh.rotation.x = 1.45;
		//instantiate mixer
		EO.three.mixer = new THREE.AnimationMixer( EO.three.scene );
	});
}

/////////////
// Inputs  //
/////////////
EO.input = {};
EO.input.init = function() {
	EO.input.keyboard.init();
}
EO.input.keyboard = {};
EO.input.keyboard.left = false;
EO.input.keyboard.right = false;
EO.input.keyboard.up = false;
EO.input.keyboard.down = false;
EO.input.keyboard.init = function() {
	//keyboard
	EO.input.keyboard.controller = new THREEx.KeyboardState(EO.three.renderer.domElement);
	EO.three.renderer.domElement.setAttribute("tabIndex", "0");
	EO.three.renderer.domElement.focus();
	// only on keydown
	EO.input.keyboard.controller.domElement.addEventListener('keydown', function(event){
		//up
		if ( EO.input.keyboard.controller.eventMatches(event, 'w') || EO.input.keyboard.controller.eventMatches(event, 'up') ) EO.input.keyboard.up = true;
		//down
		if ( EO.input.keyboard.controller.eventMatches(event, 's') || EO.input.keyboard.controller.eventMatches(event, 'down') ) EO.input.keyboard.down = true;
		//left
		if ( EO.input.keyboard.controller.eventMatches(event, 'a') || EO.input.keyboard.controller.eventMatches(event, 'left') ) EO.input.keyboard.left = true;
		//right
		if ( EO.input.keyboard.controller.eventMatches(event, 'd') || EO.input.keyboard.controller.eventMatches(event, 'right') ) EO.input.keyboard.right = true;
	});
	EO.input.keyboard.controller.domElement.addEventListener('keyup', function(event) {
		//up
		if( EO.input.keyboard.controller.eventMatches(event, 'w') || EO.input.keyboard.controller.eventMatches(event, 'up') ) EO.input.keyboard.up = false;
		//down
		if( EO.input.keyboard.controller.eventMatches(event, 's') || EO.input.keyboard.controller.eventMatches(event, 'down') ) EO.input.keyboard.down = false;
		//left
		if( EO.input.keyboard.controller.eventMatches(event, 'a') || EO.input.keyboard.controller.eventMatches(event, 'left') ) EO.input.keyboard.left = false;
		//right
		if( EO.input.keyboard.controller.eventMatches(event, 'd') || EO.input.keyboard.controller.eventMatches(event, 'right') ) EO.input.keyboard.right = false;
	});
}
EO.input.keyboard.update = function() {
	var input_arr = [EO.input.keyboard.up, EO.input.keyboard.right, EO.input.keyboard.down, EO.input.keyboard.left];
	EO.server.socket.emit('input', input_arr);
}

///////////
// Tiles //
///////////
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
		
		t.repeat.set(EO.map.tilesPer , EO.map.tilesPer);
		if (texture.animated) {
			t.wrapS = t.wrapT = THREE.RepeatWrapping;//THREE.RepeatWrapping;
			t.repeat.set( EO.map.tilesPer, EO.map.tilesPer );

		} else {
			t.wrapS = t.wrapT = THREE.RepeatWrapping;
		}
		//t.needsUpdate = true;
		//t.image.width = 32;
		var mesh = new THREE.MeshPhongMaterial({ map: t });
		//mesh.map.image.width = 32;
		//var mesh = new THREE.MeshBasicMaterial({ map: t });
		mesh.receiveShadow = true;
		EO.tiles.type[texture.type].push(mesh);
		EO.tiles.materials.push(mesh);
	}

}

/////////
// Map //
/////////
EO.map = {};
EO.map.width = 1280;
EO.map.height = 1280;
EO.map.tilesPer = 20;
EO.map.geometry = new THREE.PlaneGeometry(EO.map.width, EO.map.height, EO.map.tilesPer, EO.map.tilesPer);
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
	EO.map.draw();
}
EO.map.chunk = function() {
	
}
EO.map.draw = function() {
	EO.map.mesh = new THREE.Mesh(EO.map.geometry, new THREE.MeshFaceMaterial(EO.tiles.materials));
	EO.map.mesh.receiveShadow = true;
	EO.three.scene.add(EO.map.mesh);
}
EO.map.update = function() {

	var serverMapToFace = [];

	var localView = EO.server.data.localView;
	if (typeof localView === 'undefined') {
		return false;
	}
	for (var i = 0; i < localView.map.length; i++) {
		for (var j = 0; j < localView.map[i].length; j++) {
			var tile = localView.map[i][j];
			serverMapToFace.push(tile);
		}
	}

	var l = EO.map.geometry.faces.length / 2;
	for (var i=0; i < l; i++) {
		var j  = 2 * i;
		var tileVal = 1;
		if (serverMapToFace[i].material === "water") var tileVal = 0;
		if (serverMapToFace[i].material === "grass") var tileVal = 1;
		EO.map.geometry.faces[j].materialIndex = tileVal;
		EO.map.geometry.faces[j+1].materialIndex = tileVal;
	}

}

//////////////////////////////////
// World objects and characters //
//////////////////////////////////
EO.characters = {};
EO.characters.group = [];
EO.characters.map = [];
EO.characters.add = function (name) {
	if (EO.character.mesh && typeof EO.three.mixer !== 'undefined') {

		//console.log('adding ' + name);
		
		EO.characters.map.push(name);
		
		EO.characters.group[name] = {};
		
		EO.characters.group[name].mesh = EO.character.mesh.clone(true);
		EO.characters.group[name].mesh.name = name;
		
		EO.three.scene.add(EO.characters.group[name].mesh);

		EO.characters.group[name].action = {}
		EO.characters.group[name].action.walk = EO.three.mixer.clipAction( EO.characters.group[name].mesh.geometry.animations[0], EO.characters.group[name].mesh );

	}
}

////////////////////////
// Socket.io handlers //
////////////////////////
EO.server = {}
EO.server.socket = io.connect();
EO.server.socket.on('news', function (data) {
	var $output = $('<div></div>').attr({
		"class":"news"
	}).html(data.message);
	$('#feed').append($output);
});

EO.server.socket.on('chat', function (data) {
	var $output = $('<div></div>').attr({
		"class":"chat"
	}).html(data.user + ': ' + data.message);
	$('#feed').append($output);
});

EO.server.socket.on('join', function(data) {
	EO.init();
});

EO.server.socket.on('update', function(data) {
	EO.server.data = data;
});

EO.server.socket.on('disconnect', function(data) {
	var user = data.name;
	EO.three.dumpster.push(user);
});