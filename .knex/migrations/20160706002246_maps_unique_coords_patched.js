
exports.up = function(knex) {
  return Promise.all([

    knex.schema.table('maps', function(table) {
      table.unique(["x", "y"]);
      table.integer("x").notNullable();
      table.integer("y").notNullable();
    })

  ])
};

exports.down = function(knex) {
    return Promise.all([

      knex.schema.table('maps', function(table) {
        table.dropColumn('x');
        table.dropColumn('y');
      })

    ])
};
