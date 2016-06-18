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

/////////////////
// Admin panel //
/////////////////
router.get('/', function(req, res, next) {
  if (req.user) {
    new Users({ username: req.user.username }).fetch().then(function(model) {
      if (model === null) res.redirect('/');
      var user = model.toJSON();
      if (user.access === 10) {
        res.render('admin', { title: 'hey there super cool admin guy' });
      } else {
        res.sendStatus(404);
      }
    });
  } else {
    res.sendStatus(404);
  }
});
router.post('/', function(req, res, next) {
  if (req.user) {
    new Users({ username: req.user.username }).fetch().then(function(model) {
      if (model === null) res.redirect('/');
      var user = model.toJSON();
      if (user.access === 10) {
        //passes validation, handle it
        new Posts({ user_id: req.user.id, post_title: sanitize(req.body.post_title), post_content: sanitize(req.body.post_content) }).save().then(function(model) {
          res.redirect('/');
        });
      } else {
        res.sendStatus(404);
      }
    });
  } else {
    res.sendStatus(404);
  }
});

module.exports = router;