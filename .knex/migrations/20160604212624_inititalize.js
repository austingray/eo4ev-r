exports.up = function(knex, Promise) {

  return Promise.all([

     knex.schema.createTable("users", function (table) {
      table.increments().primary();
      table.string("email").notNullable().unique();
      table.string("username").notNullable();
      table.string("hash").notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
      table.string("first_name");
      table.string("last_name");
      table.string("date_of_birth");
      table.integer("access").defaultTo(1)
      table.integer("current_character").references("id").inTable("characters");
    }),

    knex.schema.createTable("characters", function (table) {
      table.increments().primary();
      table.integer("user_id").references("id").inTable("users");
      table.json("position").notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
      table.string("name").notNullable().unique();
      table.integer("sex").notNullable().references("id").inTable("sexes");
      table.integer("race").notNullable().references("id").inTable("races");
      table.integer("class").notNullable().references("id").inTable("classes");
      table.integer("experience").notNullable().defaultTo(0);
      table.integer("level").notNullable().defaultTo(0);
      table.boolean("dead").notNullable().defaultTo(false);
      table.integer("weight").notNullable().defaultTo(160);
      table.integer("height").notNullable().defaultTo(160);
      table.integer("age").notNullable().defaultTo(30);
      table.integer("health").notNullable().defaultTo(100);
      table.integer("hitpoints").notNullable().defaultTo(100);
      table.integer("attack").notNullable().defaultTo(10);
      table.integer("defense").notNullable().defaultTo(10);
      table.integer("magic").notNullable().defaultTo(10);
      table.integer("resist").notNullable().defaultTo(10);
      table.integer("speed").notNullable().defaultTo(10);
      table.integer("agility").notNullable().defaultTo(10);
      table.integer("intelligence").notNullable().defaultTo(10);
    }),

    knex.schema.createTable("sexes", function (table) {
      table.increments().primary();
      table.string("name")
    }),

    knex.schema.createTable("races", function (table) {
      table.increments().primary();
      table.string("name");
    }),

    knex.schema.createTable("classes", function (table) {
      table.increments().primary();
      table.string("name");
    }),

    knex.schema.createTable("posts", function (table) {
      table.increments().primary();
      table.integer("user_id").references("id").inTable("users");
      table.text("post_title");
      table.text("post_content");
      table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
    })

  ])
};

exports.down = function(knex, Promise) {
  
};