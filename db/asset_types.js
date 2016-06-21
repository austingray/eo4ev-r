var bookshelf = require('./bookshelf.js');

var Asset_Types = bookshelf.Model.extend({
  
  tableName: 'asset_types',

});

module.exports = Asset_Types;