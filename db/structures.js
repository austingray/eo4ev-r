var bookshelf = require('./bookshelf.js');
var Assets = require('./assets.js');

var Structures = bookshelf.Model.extend({

  tableName: 'structures',

  inRectangle: function(rect) {
    return this
      .where('x', '>=', rect.x)
      .where('x', '<', rect.x + rect.width)
      .where('y', '>=', rect.y)
      .where('y', '<', rect.y + rect.height)
      .orderBy('y', 'x')
  },

  asset: function() {
    return this.belongsTo(Assets, 'texture_id');
  }

});

module.exports = Structures;
