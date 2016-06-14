var bookshelf = require('./bookshelf.js');
var Classes = require('./classes.js');
var Races = require('./races.js');
var Sexes = require('./sexes.js')

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