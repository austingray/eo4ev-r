var bookshelf = require('./bookshelf.js');
var Asset_Types = require('./asset_types.js');
var Asset_Categories = require('./asset_categories.js');

var Assets = bookshelf.Model.extend({
  
  tableName: 'assets',

  asset_type: function() {
    return this.belongsTo(Asset_Types);
  },

  asset_category: function() {
    return this.belongsTo(Asset_Categories);
  }

});

module.exports = Assets;