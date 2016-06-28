
exports.up = function(knex, Promise) {
  return Promise.all([

    knex.schema.table('character_races', function(table) {
      table.integer('default_model_id');
    })

  ])
};

exports.down = function(knex, Promise) {
    return Promise.all([

      knex.schema.table('character_races', function(table) {
        table.dropColumn('default_model_id');
      })

    ])
};
