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

/////////////////////////
// Manage your account //
/////////////////////////
router.get('/', function(req, res, next) {
  if (typeof req.user === 'undefined') {
    res.render('login', { title: 'Dat three.js doe - Login/Register', flash: req.flash('error') });
  } else {
    console.log(req.user.id);
    new Users({ id: req.user.id }).fetch().then((model) => {//{ withRelated: ['characters.sex', 'characters.class', 'characters.race', 'current_character'] }).then(function(model) {
      console.log(model);
      user_model = model.toJSON();
      res.render('account', { title: 'Dat three.js doe - My Account', user: user_model, characters: user_model.characters, scripts: 'character' });
    }).catch((err) => {
      console.log(err);
    }) ;

  }
});

////////////////////////
// select a character //
////////////////////////
router.post('/', function(req, res, next) {
  if (typeof req.user === 'undefined') {
    res.redirect('/account');
  } else {

    var char_id = Number( sanitize( req.body['current-character'] ) );
    new Characters({ id: char_id, user_id: req.user.id }).fetch().then(function(model) {

      if (model === null) {
        res.send('oh buggar off');
        return;
      }

      new Users({ id: req.user.id }).save({ current_character: char_id }, { patch: true }).then(function(model) {
        res.redirect('/account');
      })

    })
  }
});

module.exports = router;
