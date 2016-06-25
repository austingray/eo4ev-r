var bookshelf = require('./bookshelf.js');
var Characters = require('./characters.js');

var Users = bookshelf.Model.extend({

  tableName: 'users',

  characters: function() {
    return this.hasMany(Characters);
  },

  current_character: function () {
    return this.belongsTo(Characters, 'current_character');
  }

});

module.exports = Users;
