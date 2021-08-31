
exports.up = function(knex) {
  return Promise.all([

    knex.schema.createTable("items", function (table) {
      table.increments().primary();
      table.string("name");
      table.integer("asset_id");
      table.integer("texture_id");
      table.integer("item_type_id");
      table.integer("scale");
      table.string("color");
      table.integer("price").defaultTo(0);
      table.text("description");
      table.integer("class").defaultTo(0);
      table.integer("melee_attack").defaultTo(0);
      table.integer("melee_defense").defaultTo(0);
      table.integer("magic_attack").defaultTo(0);
      table.integer("magic_defense").defaultTo(0);
      table.integer("speed").defaultTo(0);
      table.integer("active_state").defaultTo(0);
    }),

    knex.schema.createTable("item_types", function (table) {
      table.increments().primary();
      table.string("name");
    })

  ])
};

exports.down = function(knex) {
  return Promise.all([

    knex.schema.dropTable("items"),
    knex.schema.dropTable("item_types")

  ])
};
