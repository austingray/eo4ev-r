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
var Character_Sexes = require('../db/character_sexes.js');
var Character_Races = require('../db/character_races.js');
var Character_Classes = require('../db/character_classes.js');
var Posts = require('../db/posts.js');

////////////////////////
// create a character //
////////////////////////
router.get('/', function(req, res, next) {
  if (typeof req.user === 'undefined') {
    res.redirect('/account');
  } else {
    new Character_Sexes().fetchAll().then(function(sexes_model) {
      var sexes = sexes_model.toJSON();
      new Character_Races().fetchAll().then(function(races_model) {
        var races = races_model.toJSON();
        new Character_Classes().fetchAll().then(function(classes_model) {
          var classes = classes_model.toJSON();
          res.render('character', { flash: req.flash('error'), title: 'Dat three.js doe - Character Creation', user: req.user, scripts: 'character', sexes: sexes, races: races, classes: classes });
        })
      })
    })
  }
});

router.post('/', function(req, res, next) {
  if (typeof req.user === 'undefined') {
    res.redirect('/account');
  } else {

    var _name = req.body['character-name'];
    var allowedRegex = /^[a-zA-Z0-9_]{1,15}$/;
    var validName = allowedRegex.test(_name);

    if ( ! validName ) {
      req.flash('error', 'Invalid character name. Please try a new name.');
      res.redirect('/character');
      return;
    }

    new Characters().query( 'whereRaw', 'LOWER(name) = ?', _name.toLowerCase() ).fetch().then(function(model) {
      if (null === model) {

        //fetch race, validate color req.body, save new character
        var character_race_id = Number( sanitize( req.body['character-races'] ) );
        new Character_Races({ id: character_race_id }).fetch().then(function(model) {

          if (model === null) {
            res.send('Quit screwing around');
            return;
          }

          //race data
          var race = model.toJSON();
          //hue
          var hue = race.hue;
          //saturation
          var sat_min = race.sat_min;
          var sat_max = race.sat_max;
          var sat = Number( sanitize( req.body['skin-saturation'] ) ) / 100;
          if (sat < sat_min || sat > sat_max) {
            sat = (sat_max - sat_min) / 2 + sat_min;
          }
          //lightness
          var light_min = race.light_min;
          var light_max = race.light_max;
          var light = Number( sanitize( req.body['skin-lightness'] ) ) / 100;
          if (light < light_min || light > light_max) {
            light = (light_max - light_min) / 2 + light_min;
          }

          //fetch sex
          var character_sex_id = Number( sanitize( req.body['character-sex'] ) );
          new Character_Sexes({ id: character_sex_id }).fetch().then(function(model) {

            if (model === null) {
              res.send("Quit screwing around!");
              return;
            }

            var character_class_id = Number( sanitize( req.body['character-class'] ) );
            new Character_Classes({ id: character_class_id }).fetch().then(function(model) {

              if (model === null) {
                res.send("Quit screwing around!!!");
                return;
              }

              new Characters({ user_id: req.user.id, position: JSON.stringify({x: 0, y: 0, z: 0}), name: _name, sex: character_sex_id, race: character_race_id, hue: hue, saturation: sat, lightness: light, class: character_class_id })
              .save()
              .then(function(model) {

                res.redirect('/account');

              });

            });

          });

        })

      } else {
        req.flash('error', 'Character name already in use. Please try a new name.');
        res.redirect('/character');
        return;
      }
    });

  }
});

router.get('/delete', function(req, res, next) {
  if (typeof req.user === 'undefined') {
    res.redirect('/account');
    return;
  } else {
    new Users({ id: req.user.id }).fetch({ withRelated: ['current_character'] }).then(function(model) {
      user_model = model.toJSON();
      new Characters({ id: user_model.current_character.id }).fetch({ withRelated: [ 'sex', 'race', 'class' ] }).then(function(model) {
        var delete_char = model.toJSON();
        res.render('delete', { title: 'Dat three.js doe - Delete Character', user: req.user, character: delete_char });
      });
    });
  }
});

router.post('/delete', function(req, res, next) {

  if (typeof req.user === 'undefined') {
    res.send('fuck off');
    return;
  } else {
    var delRequest = sanitize( req.body.delete );
    if (delRequest === "true") {
      var delId = sanitize( req.body.character_id );
      console.log(delId);
      new Characters({ id: delId, user_id: req.user.id }).fetch().then(function(model) {

        if (model === null) {
          res.redirect('/account');
          return;
        }

        new Users({ id: req.user.id }).save({ current_character: null }, { patch: true }).then(function(model){

          new Characters({ id: delId }).destroy().then(function(model) {
            console.log('deleted');
            res.redirect('/account');
          });

        });

      });
    } else {
      res.redirect('/account');
    }
  }

});

module.exports = router;
