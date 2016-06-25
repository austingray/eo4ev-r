var bookshelf = require('./bookshelf.js');
var Classes = require('./character_classes.js');
var Races = require('./character_races.js');
var Sexes = require('./character_sexes.js')

var Characters = bookshelf.Model.extend({

  tableName: 'characters',

  class: function () {
    return this.belongsTo(Classes, 'class');
  },

  race: function () {
    return this.belongsTo(Races, 'race');
  },

  sex: function () {
    return this.belongsTo(Sexes, 'sex');
  }

});

module.exports = Characters;
