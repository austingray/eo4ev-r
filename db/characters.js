var bookshelf = require('./bookshelf.js');

var Players = bookshelf.Model.extend({
  
  tableName: 'characters'

});

module.exports = Players;