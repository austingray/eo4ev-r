var bookshelf = require('./bookshelf.js');

var Characters = bookshelf.Model.extend({
  
  tableName: 'characters'

});

module.exports = Characters;