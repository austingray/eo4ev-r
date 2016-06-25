var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var sanitize = require('sanitize-html');

//db objects
var knex = require('knex');

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
