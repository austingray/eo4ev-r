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

/////////////
// helpers //
/////////////
var validateAdmin = function(req, res, callback) {
  if (req.user && req.user.access === 10) {
    callback();
  } else {
    res.sendStatus(404);
  }
}

/////////////////////////////
// generic response object //
/////////////////////////////
var res_object = {
  title: 'hey there super cool admin guy',
  admin: true
}

/////////////////
// Admin panel //
/////////////////
router.get('/', function(req, res, next) {
  validateAdmin(req, res, function() {
    res_object.section = 'main';
    res.render('admin', res_object);
  });
});

///////////
// posts //
///////////
router.get('/post', function(req, res, next) {
  validateAdmin(req, res, function() {
    res_object.section = 'post';
    res.render('admin', res_object);
  });
});

router.post('/post', function(req, res, next) {
  validateAdmin(req, res, function() {
    new Posts({ user_id: req.user.id, post_title: sanitize(req.body.post_title), post_content: sanitize(req.body.post_content) }).save().then(function(model) {
      res.redirect('/');
    });
  });
});

///////////////////
// asset manager //
///////////////////
router.get('/assets', function(req, res, next) {
  validateAdmin(req, res, function() {
    res_object.section = 'assets';
    res.render('admin', res_object);
  });
});

router.post('/assets', function(req, res, next) {
  validateAdmin(req, res, function() {
    console.log(req.body);
  });
});

module.exports = router;