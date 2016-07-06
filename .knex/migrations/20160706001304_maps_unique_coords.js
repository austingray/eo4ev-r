
exports.up = function(knex, Promise) {
  return Promise.all([

    knex.schema.table('maps', function(table) {
      table.dropColumn('x');
      table.dropColumn('y');
    }),

  ])
};

exports.down = function(knex, Promise) {
    return Promise.all([

      knex.schema.table('maps', function(table) {
        table.integer("x").notNullable();
        table.integer("y").notNullable();
      })

    ])
};
