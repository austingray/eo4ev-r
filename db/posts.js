var bookshelf = require('./bookshelf.js');
var Users = require('./users.js');

var Posts = bookshelf.Model.extend({
  
  tableName: 'posts',

  user: function() {
    return this.belongsTo(Users);
  }

});

module.exports = Posts;