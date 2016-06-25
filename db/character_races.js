var bookshelf = require('./bookshelf.js');

var Races = bookshelf.Model.extend({

  tableName: 'character_races'

});

module.exports = Races;
