var bookshelf = require('./bookshelf.js');

var Races = bookshelf.Model.extend({
  
  tableName: 'races'

});

module.exports = Races;