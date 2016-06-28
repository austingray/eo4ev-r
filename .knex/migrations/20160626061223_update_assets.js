
exports.up = function(knex, Promise) {
  return Promise.all([

    knex.schema.table('assets', function(table) {
      table.renameColumn('resource_file_url', 'file_url');
      table.renameColumn('asset_type', 'asset_type_id');
      table.renameColumn('asset_category', 'asset_category_id');
      table.integer('asset_races_id');
      table.integer('asset_sexes_id');
      table.integer('asset_parent_id');
    }),

    knex.schema.table('characters', function(table) {
      table.integer('current_model_id');
      table.integer('current_texture_id');
    }),

    knex.schema.dropTable('models')

  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([

    knex.schema.table('assets', function(table) {
      table.renameColumn('file_url', 'resource_file_url');
      table.renameColumn('asset_type_id', 'asset_type');
      table.renameColumn('asset_category_id', 'asset_category');
      table.dropColumn('asset_races_id');
      table.dropColumn('asset_sexes_id');
      table.dropColumn('asset_parent_id');
    }),

    knex.schema.table('characters', function(table) {
      table.dropColumn('current_model_id');
      table.dropColumn('current_texture_id');
    }),

    knex.schema.createTable("models", function (table) {
      table.increments().primary();
      table.text("name").notNullable();
      table.integer("model_asset_id").references("id").inTable("assets");
      table.integer("texture_asset_id").references("id").inTable("assets");
    })

  ])
};
