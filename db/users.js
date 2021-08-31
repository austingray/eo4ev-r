var bookshelf = require('./bookshelf.js');
var Characters = require('./characters.js');

const Users = bookshelf.Model.extend({

  tableName: 'users',

  characters() {
    return this.hasMany(Characters);
  },

  current_character() {
    return this.belongsTo(Characters, 'current_character');
  }

});

module.exports = Users;
