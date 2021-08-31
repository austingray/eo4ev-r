
exports.up = function(knex) {
  return Promise.all([

    knex.schema.renameTable('classes', 'character_classes'),
    knex.schema.renameTable('races', 'character_races'),
    knex.schema.renameTable('sexes', 'character_sexes')

  ]);
};

exports.down = function(knex) {
  return Promise.all([

    knex.schema.renameTable('character_classes', 'classes'),
    knex.schema.renameTable('character_races', 'races'),
    knex.schema.renameTable('character_sexes', 'sexes')

  ]);
};
