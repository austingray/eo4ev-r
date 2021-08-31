
exports.up = function(knex) {
  return Promise.all([

    knex.schema.createTable("structures", function (table) {
      table.increments().primary();
      table.unique(["x", "y"]);
      table.integer("x").notNullable();
      table.integer("y").notNullable();
      table.integer("height").notNullable();
      table.integer("texture_id").notNullable();
    })

  ])
};

exports.down = function(knex) {
    return Promise.all([

      knex.schema.dropTable("structures")

    ]);
};
