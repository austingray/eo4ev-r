
exports.up = function(knex) {
  return Promise.all([

    knex.schema.table('character_races', function(table) {
      table.integer('male_model_id');
      table.integer('female_model_id');
    })

  ])
};

exports.down = function(knex) {
    return Promise.all([

      knex.schema.table('character_races', function(table) {
        table.dropColumn('male_model_id');
        table.dropColumn('female_model_id');
      })

    ])
};
