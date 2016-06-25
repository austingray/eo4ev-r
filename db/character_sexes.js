var bookshelf = require('./bookshelf.js');

var Sexes = bookshelf.Model.extend({

  tableName: 'character_sexes'

});

module.exports = Sexes;
