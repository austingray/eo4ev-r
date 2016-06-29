var bookshelf = require('./bookshelf.js');
var Assets = require('./assets.js');

var Tiles = bookshelf.Model.extend({

  tableName: 'tiles',

  asset: function() {
    return this.belongsTo(Assets)
  }

});

module.exports = Tiles;
