var bookshelf = require('./bookshelf.js');

var Players = bookshelf.Model.extend({
  
  tableName: 'players'

});

module.exports = Players;