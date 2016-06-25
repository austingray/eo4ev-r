
exports.up = function(knex, Promise) {
  return Promise.all([

    knex.schema.createTable("assets", function (table) {
      table.increments().primary();
      table.text("name").notNullable();
      table.integer("asset_type").references("id").inTable("asset_types");
      table.integer("asset_category").references("id").inTable("asset_categories");
      table.string("resource_file_url");
    }),

    knex.schema.createTable("asset_types", function (table) {
      table.increments().primary();
      table.text("name").notNullable();
    }),

    knex.schema.createTable("asset_categories", function (table) {
      table.increments().primary();
      table.text("name");
    }),

    knex.schema.table("tiles", function (table) {
      table.dropColumn('type');
      table.text("name").notNullable();
      table.integer("asset_id").references("id").inTable("assets");
    }),

    knex.schema.createTable("models", function (table) {
      table.increments().primary();
      table.text("name").notNullable();
      table.integer("model_asset_id").references("id").inTable("assets");
      table.integer("texture_asset_id").references("id").inTable("assets");
    })

  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([

    knex.schema.dropTable('assets'),
    knex.schema.dropTable('asset_types'),
    knex.schema.dropTable('asset_categories'),
    knex.schema.dropTable('models')

  ]);
};
