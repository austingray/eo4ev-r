var bookshelf = require('./bookshelf.js');

var Classes = bookshelf.Model.extend({

  tableName: 'character_classes'

});

module.exports = Classes;
