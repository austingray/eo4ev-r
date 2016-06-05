/*

  EO4EV-R
  ---
  Tables
  ---
  users *** website user login
    id, uuid, nickname, email, hash, first_name, last_name, date_of_birth, created_at

  players *** game specific info for users, users can have many players
    id, user_id, created_at, name, race, experience, level, dead, weight, height, age, class, hitpoints, attack, defense, magic, resist, speed, agility, intelligence

*/

exports.up = function(knex, Promise) {
    return Promise.all([
      knex.schema.createTable("users", function (table) {
        table.increments().primary();
        table.string("email").notNullable().unique();
        table.string("nickname").notNullable();
        table.string("hash").notNullable();
        table.timestamps();
        table.string("first_name");
        table.string("last_name");
        table.string("date_of_birth");
      }),

      knex.schema.createTable("players", function (table) {
        table.increments().primary();
        table.integer("user_id").references("id").inTable("users");
        table.timestamps();
        table.string("name").notNullable().unique();
        table.string("race").notNullable().defaultTo('Human');
        table.integer("experience").notNullable().defaultTo(0);
        table.integer("level").notNullable().defaultTo(0);
        table.boolean("dead").notNullable().defaultTo(false);
        table.integer("weight").notNullable().defaultTo(160);
        table.integer("height").notNullable().defaultTo(160);
        table.integer("age").notNullable().defaultTo(30);
        table.string("class").notNullable().defaultTo('Fighter');
        table.integer("hitpoints").notNullable().defaultTo(100);
        table.integer("attack").notNullable().defaultTo(10);
        table.integer("defense").notNullable().defaultTo(10);
        table.integer("magic").notNullable().defaultTo(10);
        table.integer("resist").notNullable().defaultTo(10);
        table.integer("speed").notNullable().defaultTo(10);
        table.integer("agility").notNullable().defaultTo(10);
        table.integer("intelligence").notNullable().defaultTo(10);
      })
    ]);
};

exports.down = function(knex, Promise) {
  
};