var bookshelf = require('./bookshelf.js');

var Tiles = bookshelf.Model.extend({
  
  tableName: 'tiles',

});

module.exports = Tiles;