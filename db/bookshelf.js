var dbConfig = {
  client: 'pg',
  connection: process.env.PG_CONNECTION_STRING
}

const knex = require('knex')(dbConfig);
const bookshelf = require('bookshelf')(knex)
module.exports = bookshelf;