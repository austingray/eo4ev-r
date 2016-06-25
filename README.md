# Eo Forever

### main files
* app.js - app
* game/server.js - server
* public/js/engine/ - game engine

### the stack
* Three.js - graphics
* Node.js - http server
* Express.js - app framework
* Passport.js - authentication
* Pug.js - views
* Socket.io - websockets
* Knex.js - database intermediary
* Bookshelf.js - ORM
* PostgreSQL - database

### installation instructions
1. install postgres ---- https://www.postgresql.org/
2. setup database via psql --- CREATE USER eo_us WITH PASSWORD 'eo_pw'; CREATE DATABASE eo_db OWNER eo_us;
3. run npm install in repo --- cd /dir/to/project/ && npm install
4. install knex globally --- npm install -g knex
5. run database migration ---  cd /dir/to/project/.knex/ && knex migrate:latest
6. run database seed (uncomment any commented elements) --- cd /dir/to/project/.knex/ && knex seed:run
7. npm start && visit http://localhost:8081
8. admin panel available at http://localhost:8081/datadmindoe --- UPDATE users SET access = 10 WHERE id = <user.id>;
