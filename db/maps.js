var bookshelf = require('./bookshelf.js');
var Tiles = require('./tiles.js');

var Maps = bookshelf.Model.extend({
  
  tableName: 'maps',

  inRectangle: function(rect) {
    return this
      .where('x', '>=', rect.x)
      .where('x', '<', rect.x + rect.width)
      .where('y', '>=', rect.y)
      .where('y', '<', rect.y + rect.height)
      .orderBy('y', 'x')
  },

  tiles: function() {
    return this.belongsTo(Tiles);
  }

});

module.exports = Maps;