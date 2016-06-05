var bookshelf = require('./bookshelf.js');

var Users = bookshelf.Model.extend({
  
  tableName: 'users'

});

module.exports = Users;