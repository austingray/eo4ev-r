
exports.up = function(knex) {
  return Promise.all([

    knex.schema.createTable("maps", function (table) {
      table.increments().primary();
      table.integer("x").notNullable();
      table.integer("y").notNullable();
      table.integer("height").notNullable().defaultTo(0);
      table.boolean("blocking").notNullable().defaultTo(false);
      table.integer("tile_id").references("id").inTable("tiles");
    }),

    knex.schema.createTable("tiles", function (table) {
      table.increments().primary();
      table.text("type").notNullable();
    })


  ]);
};

exports.down = function(knex) {
  return Promise.all([

    knex.schema.dropTable('tiles'),
    knex.schema.dropTable('maps')

  ]);
};
