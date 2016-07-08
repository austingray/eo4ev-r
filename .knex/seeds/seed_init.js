
exports.seed = function(knex, Promise) {
  return Promise.join(

    //sexes
    // knex('sexes').del(),
    // knex('sexes').insert({id: 1, name: 'Male'}),
    // knex('sexes').insert({id: 2, name: 'Female'}),

    // //races
    // knex('races').del(),
    // knex('races').insert({
    //     id: 1,
    //     name: 'Human',
    //     hue: 0.13,
    //     sat_min: 0.25,
    //     sat_max: 0.9,
    //     light_min: 0.1,
    //     light_max: 0.8,
    //     description: 'Humans are found throughout the land of Eo, they are able to adapt and thrive in any climate.'
    // }),
    // knex('races').insert({
    //     id: 2,
    //     name: 'Light Elf',
    //     hue: 0.18,
    //     sat_min: 0.37,
    //     sat_max: 1,
    //     light_min: 0.36,
    //     light_max: 0.7,
    //     description: "Light Elves are native to the forests of Eo. They do well to stay among the forests."
    // }),
    // knex('races').insert({
    //     id: 3,
    //     name: 'Dark Elf',
    //     hue: 0.5,
    //     sat_min: 0.16,
    //     sat_max: 1,
    //     light_min: 0.22,
    //     light_max: 0.65,
    //     description: "Dark Elves have long ago been driven to the various barren rocky coasts of Eo, where their culture has thrived."
    // }),
    // knex('races').insert({
    //     id: 4,
    //     name: 'Dwarf',
    //     hue: 0.13,
    //     sat_min: 0.25,
    //     sat_max: 0.9,
    //     light_min: 0.1,
    //     light_max: 0.8,
    //     description: "Dwarves can be found in and underneath the mountains of Eo. They seldom venture far from their home."
    // }),
    // knex('races').insert({
    //     id: 5,
    //     name: 'Sanda',
    //     hue: 0,
    //     sat_min: 0.22,
    //     sat_max: 0.6,
    //     light_min: 0.22,
    //     light_max: 0.57,
    //     description:"Sanda are a desert people who thrive in arid climates. They are fiercely protective of their desert homelands."
    // }),

    // //classes
    // knex('classes').del(),
    // knex('classes').insert({
    //     id: 1,
    //     name: 'Warrior',
    //     description: "Good with a blade, good at smashing it upon your head."
    // }),
    // knex('classes').insert({
    //     id: 2,
    //     name: 'Hunter',
    //     description: "Cunning and Nimble, Master of Beasts."
    // }),
    // knex('classes').insert({
    //     id: 3,
    //     name: 'Wizard',
    //     description: "Wise and dangerous. A great friend and a nasty foe."
    // }),
    // knex('classes').insert({
    //     id: 4,
    //     name: 'Priest',
    //     description: "Everyone's best friend on the battlefield."
    // }),
    // knex('classes').insert({
    //     id: 5,
    //     name: 'Paladin',
    //     description: "A natural leader, well equipped for any manner of combat."
    // }),
    // knex('classes').insert({
    //     id: 6,
    //     name: 'Monk',
    //     description: "Disciplined and self-sufficient. Don't get on their bad side."
    // }),
    // knex('classes').insert({
    //     id: 7,
    //     name: 'Necromancer',
    //     description: "Just when you thought the battle was won, a necromancer appears."
    // }),

    //tiles
    // knex('tiles').del(),
    // knex('tiles').insert({
    //     id: 1,
    //     type: "water"
    // }),
    // knex('tiles').insert({
    //     id:2,
    //     type: "grass"
    // })


    //asset categories
    // knex('asset_categories').del(),
    // knex('asset_categories').insert({
    //     name: 'Uncategorized'
    // }),
    // knex('asset_categories').insert({
    //   name: 'Tiles'
    // }),
    // knex('asset_categories').insert({
    //   name: 'Characters'
    // }),
    knex('asset_categories').insert({
      name: 'Structures'
    })

    //asset types
    // knex('asset_types').del(),
    // knex('asset_types').insert({
    //     name: 'Model'
    // }),
    // knex('asset_types').insert({
    //     name: 'Texture'
    // })

  );
};
