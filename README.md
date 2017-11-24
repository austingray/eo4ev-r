# Eo4ev-r (Pronouned Ee-oh Forever)

This project has been abandoned and is being rewritten [here](https://github.com/austingray/EoForever). This effort got pretty far, including:

- An admin area for managing the game, including a web based asset manager for uploading models and textures. These would auto populate the map editor
![Asset Manager](/screenshots/asset-manager.png?raw=true "Asset Manager")
- A character creation process
![Character Creation](/screenshots/character-creation.png?raw=true "Character Creation")
- In in game chat system and command system, for example: `/speed 5` would multiply your walking speed by 5, `/map` would bring up the map editor, and `/structure` would bring up the 3d structure editor. For admins only of course.
![Map Editor](/screenshots/map-editor.png?raw=true "Asset Manager")

I only did one live play test with 3 people online including myself with varying results. I deployed it with AWS Elastic Beanstalk which was probably a bad idea. But in any event it worked and it was fun, even if there was no inventory or combat. In my mind it was a success!

The bottom line is it is a horrible inefficient monster that needs a lot of refactoring. Instead of tacking onto this current project I am taking what I learned and rebuilding it from the bottom up. If you want to try to get this current version running locally and need help, send me a message on [twitter](https://twitter.com/austingray).

### main files
* app.js - app
* game/server.js - server
* public/js/engine/ - game engine

### the stack
* Three.js - graphics
* Pug.js - views
* Express.js - app framework
* Socket.io - websockets
* Passport.js - authentication
* Node.js - http server
* Bookshelf.js - ORM
* Knex.js - database intermediary
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
