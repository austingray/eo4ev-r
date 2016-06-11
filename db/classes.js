var bookshelf = require('./bookshelf.js');

var Classes = bookshelf.Model.extend({
  
  tableName: 'classes'

});

module.exports = Classes;