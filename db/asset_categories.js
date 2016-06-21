var bookshelf = require('./bookshelf.js');

var Asset_Categories = bookshelf.Model.extend({
  
  tableName: 'asset_categories',

});

module.exports = Asset_Categories;