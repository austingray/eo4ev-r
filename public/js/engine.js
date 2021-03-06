/**
	*
	* 	EO.init()  *** called when socket server establishes connection
	* 	EO.render()  *** called like, 60 times a second, the main loop
	* 	EO.update()  *** main update function, reads server data and traverses the scene, updating
	*
	* 	EO.settings  *** stores global settings
	* 		.update()  *** updates settings that need updating, like current frame
	*
	* 	EO.three  *** stores all three.js core -scene, camera, renderer, lights
	* 		.init()  *** inits all those core three stuffz
	* 		.update()  *** updates all the core stuff in the render cycle based on data sent down from the server, this is a crucial function and we should probably split it out to its own thing
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
	EO.models.init();
	//EO.character.init();
	EO.tiles.init();
	//EO.map.init();
	EO.input.init();
	EO.render();
}

////////////////////
// Dat render doe //
////////////////////
EO.render = function() {
	//update view
	EO.update();
	//delta
	var delta = 1.5 * EO.settings.clock.getDelta();
	//util frame tick
	var f = Math.floor(Date.now() / 600) % 3;
	if (f !== EO.settings.frame) EO.settings.update();
	EO.settings.frame = f;
	//input updates
	EO.input.keyboard.update();
	EO.input.mouse.update();
	//animation mixer update
	if (EO.three.mixer) EO.three.mixer.update( delta );
	//render frame
	EO.three.renderer.render( EO.three.scene, EO.three.camera );
	//request next frame
	requestAnimationFrame( EO.render );
	//export scene to window for three.js inspector
	window.scene = EO.three.scene;
}

/////////////////////////////
// dat update function doe //
/////////////////////////////
///	this is an important function
///	this is called in the main render loop
///	this takes the data passed from the server and interacts with the three.scene
///	first we determine if the data is defined, if it is we continue
///	we loop through the server data's collection of users, select a model, and push it to the world data with its server defined name if it does not exist
///	then we traverse the scene
///		for each scene object, if it is not a whitelisted three.js object, and it does not exist in the list of server objects, we EO.world.deleteObject
///		if the object is present in our server data, we update it to represent the server's state of that object
///	we then process the server's map data
EO.update = function() {
	//if not ready, bail
	if (typeof EO.server.data === 'undefined') return false;
	//add new players
	for (var k = 0; k < EO.server.data.localView.players.length; k++) {
		if ( ! EO.world.isActiveObject( EO.server.data.localView.players[k].name) ) {
			EO.models.addToWorld( 'hero', EO.server.data.localView.players[k].name );
		}
	}
	//traverse the scene
	var deleteAfterTraverse = [];
	EO.three.scene.traverse( function (object) {
		if ( EO.server.isServerObject(object) ) {
			EO.world.updateObject(object);
		} else {
			if ( ! EO.three.isWhitelistedObject(object.type) ) {
				deleteAfterTraverse.push(object);
			}
		}
	});
	//can't delete during ra
	while (deleteAfterTraverse.length > 0) {
		var object = deleteAfterTraverse.pop();
		EO.world.deleteObject(object);
	}
	if (EO.map) {
		//EO.map.mesh.position.set(-(localView.offset.x), -(localView.offset.y), -(localView.offset.z));
		//EO.map.update();
	}
};

//////////////
// Settings //
//////////////
EO.settings = {};
EO.settings.width = 800;
EO.settings.height = 600;
EO.settings.clock = new THREE.Clock();
EO.settings.frame = 0;
EO.settings.update = function() {
	//console.log(EO.settings.frame);
	//EO.textures.water.offset.y = EO.settings.frame / 3;
	for (var i = 0; i < EO.tiles.type.length; i++) {
		for (var j = 0; j < EO.tiles.type[i].length; j++) {
			if (EO.tiles.type[i][j].animated) {
				EO.tiles.type[i][j].offset.y = EO.settings.frame / 3;
			}
		}
	}
}

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


/////////////
// Inputs  //
/////////////
EO.input = {};
EO.input.init = function() {
	EO.input.keyboard.init();
	EO.input.mouse.init();
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

EO.input.mouse = {};
EO.input.mouse.raycaster = new THREE.Raycaster();
EO.input.mouse.vector = new THREE.Vector2();
EO.input.mouse.init = function() {
	document.getElementById('gamecanvas').addEventListener( 'mousemove', EO.input.mouse.onMouseMove, false );
}
EO.input.mouse.onMouseMove = function( event ) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	EO.input.mouse.vector.x = ( ( event.clientX - document.getElementById('gamecanvas').getBoundingClientRect().left ) / EO.settings.width ) * 2 - 1;
	EO.input.mouse.vector.y = - ( ( event.clientY - document.getElementById('gamecanvas').getBoundingClientRect().top ) / EO.settings.height ) * 2 + 1;

}
EO.mapping = true;
EO.input.mouse.currentIntersected = null;
EO.input.mouse.storedHex = '';
EO.input.mouse.update = function() {

	if (EO.mapping === true) {

		// update the picking ray with the camera and mouse position
		this.raycaster.setFromCamera( EO.input.mouse.vector, EO.three.camera );
		// calculate objects intersecting the picking ray
		var intersects = this.raycaster.intersectObjects( EO.three.scene.children );

		if ( intersects.length > 0 ) {

			if (intersects[0].object !== this.currentIntersected) {

				var geometry = null;
				var faceIndex = null;

				//the current intersection is not the cached object, so let's update the stored object
				if (this.currentIntersected) {
					var geometry = this.currentIntersected.object.geometry;
					var faceIndex = this.currentIntersected.faceIndex;
					if (faceIndex % 2 === 0) {
				    geometry.faces[faceIndex].color.setHex(this.storedHex);
				    geometry.faces[faceIndex+1].color.setHex(this.storedHex);
				  } else {
				    geometry.faces[faceIndex].color.setHex(this.storedHex);
				    geometry.faces[faceIndex-1].color.setHex(this.storedHex);
				  }
				}

				this.currentIntersected = intersects[0];
				var geometry = this.currentIntersected.object.geometry;
				var faceIndex = this.currentIntersected.faceIndex;
				this.storedHex = this.currentIntersected.face.color.getHex();

				if (EO.input.mouse.currentIntersected) {
	        if (faceIndex % 2 === 0) {
				    geometry.faces[faceIndex].color.setHSL(.7, .5, .41);
				    geometry.faces[faceIndex+1].color.setHSL(.7, .5, .41);
				  } else {
				    geometry.faces[faceIndex].color.setHSL(.7, .5, .41);
				    geometry.faces[faceIndex-1].color.setHSL(.7, .5, .41);
				  }
	      }


	      geometry.colorsNeedUpdate = true;

      } else {

		    // restore previous intersection object (if it exists) to its original color
		   	if (this.currentIntersected) {
					var geometry = this.currentIntersected.object.geometry;
					var faceIndex = this.currentIntersected.faceIndex;
					if (faceIndex % 2 === 0) {
				    geometry.faces[faceIndex].color.setHex(this.storedHex);
				    geometry.faces[faceIndex+1].color.setHex(this.storedHex);
				  } else {
				    geometry.faces[faceIndex].color.setHex(this.storedHex);
				    geometry.faces[faceIndex-1].color.setHex(this.storedHex);
				  }
				}

		    // Remove previous intersection object reference
		    // by setting current intersection object to "nothing"
		    this.currentIntersected = null;
		  }


			// var face = intersects[0].face;
			// //face.color.setRGB( Math.random(), Math.random(), Math.random())
		 //  var faceIndex = intersects[0].faceIndex;
		 //  var obj = intersects[0].object;
		 //  var geom = obj.geometry;

		  // if(faceIndex%2 == 0){
		  //   geom.faces[faceIndex].color.setRGB( Math.random(),Math.random(), Math.random())
		  //   geom.faces[faceIndex+1].color.setRGB( Math.random(),Math.random(), Math.random())
		  // } else{
		  //   geom.faces[faceIndex].color.setRGB( Math.random(),Math.random(), Math.random())
		  //   geom.faces[faceIndex-1].color.setRGB( Math.random(),Math.random(), Math.random())
		  // }


		 //    geom.colorsNeedUpdate = true

		}

	}

}

////////////////////////
// Dat World data doe //
////////////////////////
///	interfaces the server data and the three data
EO.world = {};
EO.world.objects = {};
EO.world.objects.active = {};
EO.world.createObject = function(object) {
	this.objects.active[object.mesh.name] = object;
	EO.three.scene.add( this.objects.active[object.mesh.name].mesh );
}
EO.world.deleteObject = function(object) {

	EO.three.scene.remove(object);

	if (typeof EO.world.objects.active[object.name] !== 'undefined')
		delete EO.world.objects.active[object.name]

}
EO.world.isActiveObject = function(name) {
	if (typeof this.objects.active[name] !== 'undefined') return true;
	return false;
}
EO.world.updateObject = function(object) {
	serverObjects = EO.server.data.localView.players;
	for (var i = 0; i < serverObjects.length; i++) {
		if (serverObjects[i].name === object.name) {
			var objectData = serverObjects[i];
			break;
		}
	}
	if (typeof objectData !== 'undefined') {
		//color
		if (object.colorUpdated !== true) {
			object.material.uniforms.color.value.setHSL( objectData.hsl.h, objectData.hsl.s, objectData.hsl.l );
			object.colorUpdated = true;
		}
		//position
		object.position.set( objectData.view.pos.x, objectData.view.pos.y, objectData.view.pos.z );
		//rotation
		object.rotation.y = objectData.view.rot;
		if (objectData.view.walking) {
			EO.world.objects.active[objectData.name].animations.walk.play();
		} else {
			EO.world.objects.active[objectData.name].animations.walk.stop();
		}
		if (objectData.isPlayer) {
			EO.three.updateCamera( object.position );
		}
	}
}

////////////////////////////////
// Dat main model handler doe //
////////////////////////////////
///	stores all model data, holds original mesh objects to clone as needed
EO.models = {}
EO.models.library = {};
EO.models.dir = 'js/models/';
EO.models.predefined = [
	{ file: EO.models.dir + 'updated_export_8.json', id: 'hero', scale: 6, rotation_x: 1.45 }
];
EO.models.init = function() {
	//get a loader
	var loader = new THREE.ObjectLoader();
	//loop through all our predefined model json files
	for (var i = 0; i < EO.models.predefined.length; i++) {
		//cast to var
		var predefined = EO.models.predefined[i];
		//load
		loader.load( predefined.file, function(object) {
			//our model
			var model = object.children[0];

			if (predefined.id === 'hero') {

				var texture = model.material.map;
				EO.globalTexture = model.material.map;
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

	      var geometry = model.geometry;

	      var skinMesh = new THREE.SkinnedMesh( geometry, material );

	      //model.material = material;
	      skinMesh.material.skinning = true;
	      //model.material._needsUpdate = true;
			}

			skinMesh.scale.x = predefined.scale;
			skinMesh.scale.y = predefined.scale;
			skinMesh.scale.z = predefined.scale;
			skinMesh.rotation.x = predefined.rotation_x;
			EO.models.library[predefined.id] = skinMesh;
		});
	}
}
EO.models.addToWorld = function(model_id, name) {

	if (typeof EO.models.library[model_id] === 'undefined') return;

	var model = {};
	model.mesh = EO.models.library[model_id].clone(true);

	//textures
	var texture = EO.globalTexture;
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

	      var geometry = EO.models.library[model_id].geometry;

	      var skinMesh = new THREE.SkinnedMesh( geometry, material );

	      //model.material = material;
	      skinMesh.material.skinning = true;
	      //model.material._needsUpdate = true;

				skinMesh.scale.x = EO.models.library[model_id].scale.x;
				skinMesh.scale.y = EO.models.library[model_id].scale.y;
				skinMesh.scale.z = EO.models.library[model_id].scale.z;
				skinMesh.rotation.x = EO.models.library[model_id].rotation.x;

	model.mesh = skinMesh;
	//model.mesh.material = material;
	model.mesh.name = name;
	model.animations = {};
	model.animations.walk = EO.three.mixer.clipAction( model.mesh.geometry.animations[0], model.mesh );
	EO.world.createObject(model);

}


///////////
// Tiles //
///////////
///	stores all map tile data, we'll access this from the map, maybe we nest this under map? i dunno yet
EO.tiles = {};
EO.tiles.textures = [
	{ id: 0, type:'blank', name: 'blank' },
	{ id: 1, type:'grass', name: 'Grass 1', file:'img/tiles/grass/grass1.png', animated: false },
	{ id: 2, type:'water', name: 'Water 1', file:'img/tiles/water/water1.png', animated: true, frames: 4 },
	{ id: 3, type:'water', name: 'Water 2', file:'img/tiles/water/water1.png', animated: true, frames: 4 }
];
EO.tiles.type = {};
EO.tiles.type.grass = [];
EO.tiles.type.water = [];
EO.tiles.materials = [];
EO.tiles.init = function() {

	for (var i = 0; i < EO.tiles.textures.length; i++) {

		var texture = EO.tiles.textures[i];
		if (typeof texture.file === 'undefined') {

			var material = new THREE.MeshPhongMaterial( { color: 0x001111, vertexColors: true } );
			var geometry = new THREE.PlaneGeometry( 64, 64, 1 );

		} else {

			var tLoader = new THREE.TextureLoader();
			var t = tLoader.load( texture.file );
			var material = new THREE.MeshPhongMaterial({ map: t, vertexColors: true });
			var geometry = new THREE.PlaneGeometry( 64, 64, 1 );

		}

		EO.tiles.materials.push(material);

	}

}

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
	$('#feed').scrollTop($('#feed').height());
});

EO.server.socket.on('join', function(data) {
	console.log('firing up the engine');
	EO.init();
});

EO.server.socket.on('update', function(data) {
	EO.server.data = data;
});

EO.server.socket.on('chunk', function(data) {
	EO.map.HandleChunk(data.chunk);
})

EO.server.isServerObject = function(object) {
	var objects = EO.server.data.localView.players;
	var isServerObject = false;
	for (var i = 0; i < objects.length; i++) {
		if (objects[i].name === object.name) {
			isServerObject = true;
			break;
		}
	}
	return isServerObject;
}
