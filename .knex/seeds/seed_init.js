
exports.seed = function(knex, Promise) {
  return Promise.join(
    
    knex('sexes').del(),
    knex('sexes').insert({id: 1, name: 'Male'}),
    knex('sexes').insert({id: 2, name: 'Female'}),

    knex('races').del(),
    knex('races').insert({id: 1, name: 'Human'}),
    knex('races').insert({id: 2, name: 'Light Elf'}),
    knex('races').insert({id: 3, name: 'Dark Elf'}),
    knex('races').insert({id: 4, name: 'Dwarf'}),
    knex('races').insert({id: 5, name: 'Sanda'}),

    knex('classes').del(),
    knex('classes').insert({id: 1, name: 'Warrior'}),
    knex('classes').insert({id: 3, name: 'Hunter'}),
    knex('classes').insert({id: 2, name: 'Wizard'}),
    knex('classes').insert({id: 4, name: 'Priest'}),
    knex('classes').insert({id: 5, name: 'Paladin'}),
    knex('classes').insert({id: 6, name: 'Monk'}),
    knex('classes').insert({id: 7, name: 'Necromancer'})

  );
};
