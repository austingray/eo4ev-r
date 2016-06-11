var bookshelf = require('./bookshelf.js');

var Sexes = bookshelf.Model.extend({
  
  tableName: 'sexes'

});

module.exports = Sexes;