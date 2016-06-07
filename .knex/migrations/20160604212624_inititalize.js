exports.up = function(knex, Promise) {

  return Promise.all([

     knex.schema.createTable("users", function (table) {
      table.increments().primary();
      table.string("email").notNullable().unique();
      table.string("username").notNullable();
      table.string("hash").notNullable();
      table.timestamps(true);
      table.string("first_name");
      table.string("last_name");
      table.string("date_of_birth");
      table.integer("access").defaultTo(1)
    }),

    knex.schema.createTable("players", function (table) {
      table.increments().primary();
      table.integer("user_id").references("id").inTable("users");
      table.json("position").notNullable();
      table.timestamps(true);
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
    }),

    knex.schema.createTable("posts", function (table) {
      table.increments().primary();
      table.integer("user_id").references("id").inTable("users");
      table.string("post_title");
      table.string("post_content");
      table.timestamps(true);
    })

  ])
};

exports.down = function(knex, Promise) {
  
};