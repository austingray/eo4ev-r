var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var sanitize = require('sanitize-html');

//db objects
var knex = require('knex');
var Users = require('../db/users.js');
var Characters = require('../db/characters.js');
var Sexes = require('../db/sexes.js');
var Races = require('../db/races.js');
var Classes = require('../db/classes.js');
var Posts = require('../db/posts.js');

///////////////////
// Play the game //
///////////////////
router.get('/', function(req, res, next) {
  if (typeof req.user === 'undefined') {
    res.redirect('/');
  } else {
    res.render('game', { title: 'Dat three.js doe', scripts: 'game', user: req.user });
  }
});

module.exports = router;