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