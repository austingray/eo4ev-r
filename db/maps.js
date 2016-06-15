var bookshelf = require('./bookshelf.js');
var Tiles = require('./tiles.js');

var Maps = bookshelf.Model.extend({
  
  tableName: 'maps',

  tiles: function() {
    return this.belongsTo(Tiles);
  }

});

module.exports = Maps;