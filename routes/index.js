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

///////////////
// Home page //
///////////////
router.get('/', function(req, res, next) {
  new Posts().query(function(qb){
    qb.orderBy('created_at','DESC'); 
  }).fetchAll({withRelated: ['user']}).then(function(posts) {
    res.render('home', { title: 'Welcome to the homepage for EO4Ev-r', user: req.user, posts: posts.toJSON() });
  });
});

/////////////////
// Admin panel //
/////////////////
router.get('/datadmindoe', function(req, res, next) {
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
router.post('/datadmindoe', function(req, res, next) {
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

///////////////////
// Play the game //
///////////////////
router.get('/play', function(req, res, next) {
  if (typeof req.user === 'undefined') {
    res.redirect('/');
  } else {
    res.render('game', { title: 'Dat three.js doe', scripts: 'game', user: req.user });
  }
});

/////////////////////////
// Manage your account //
/////////////////////////
router.get('/account', function(req, res, next) {
  if (typeof req.user === 'undefined') {
    res.render('login', { title: 'Dat three.js doe - Login/Register', flash: req.flash('error') });
  } else {

    new Users({ id: req.user.id }).fetch({ withRelated: ['characters.sex', 'characters.class', 'characters.race', 'current_character'] }).then(function(model) {
      user_model = model.toJSON();
      res.render('account', { title: 'Dat three.js doe - My Account', user: user_model, characters: user_model.characters, scripts: 'character' });
    });

  }
});

////////////////////////
// select a character //
////////////////////////
router.post('/account', function(req, res, next) {
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
})

////////////////////////
// create a character //
////////////////////////
router.get('/character', function(req, res, next) {
  if (typeof req.user === 'undefined') {
    res.redirect('/account');
  } else {
    new Sexes().fetchAll().then(function(sexes_model) {
      var sexes = sexes_model.toJSON();
      new Races().fetchAll().then(function(races_model) {
        var races = races_model.toJSON();
        new Classes().fetchAll().then(function(classes_model) {
          var classes = classes_model.toJSON();
          res.render('character', { flash: req.flash('error'), title: 'Dat three.js doe - Character Creation', user: req.user, scripts: 'character', sexes: sexes, races: races, classes: classes });
        })
      })
    })
  }
});

router.post('/character', function(req, res, next) {
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
        new Races({ id: character_race_id }).fetch().then(function(model) {
          
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
          new Sexes({ id: character_sex_id }).fetch().then(function(model) {

            if (model === null) {
              res.send("Quit screwing around!");
              return;
            }

            var character_class_id = Number( sanitize( req.body['character-class'] ) );
            new Classes({ id: character_class_id }).fetch().then(function(model) {

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

router.get('/character/delete', function(req, res, next) {
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

router.post('/character/delete', function(req, res, next) {
  
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

//////////////////////////////////
// account registrations action //
//////////////////////////////////
router.post('/register', function(req, res, next) {

  if (req.body.register === 'on') {

    var _username = req.body.username;
    var allowedRegex = /^[a-zA-Z0-9_]{1,15}$/;
    var validUsername = allowedRegex.test(_username);
    if (!validUsername) {
      req.flash('error', 'Invalid username. Please try a new username.');
      res.redirect('/account');
      return;
    }

    if (req.body.password !== req.body.password_confirm) {
      req.flash('error', 'Password mismatch, please try again.');
      res.redirect('/account');
      return;
    }

    convert_to_lower_then_check(_username, function(taken) {

      if (taken) {
        req.flash('error', 'Requested username is not available. Please try a new username.');
        res.redirect('/account');
        return;
      }

      //let's make a new account...
      new Users({ username: req.body.username })
      .fetch()
      .then( function(model) {
        if (null === model) {
          //create new account!
          bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(req.body.password, salt, function(err, hash) {
              new Users({ username:req.body.username, hash: hash, email:req.body.email })
              .save()
              .then(function(model) {
                passport.authenticate('local')(req, res, function() {
                  res.redirect('/account');
                });
              });
            });
          });
        } else {
          //username is already in use
          req.flash('error', 'Requested username is not available. Please try a new username.');
          res.redirect('/account');
        }
      });
    });
    //end registration
  } else {
    res.send('you caused an error, ya freak.');
  }

});

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/account', // see text
    failureFlash: true // optional, see text as well
  }), function (req, res) {
    res.redirect('/account');
});

//////////////////////////////////////////////////////////////////////////////////////
//helper function to convert username to lowercase and check if it is already taken //
//////////////////////////////////////////////////////////////////////////////////////
function convert_to_lower_then_check(username, callback) {
  var _username = username.toLowerCase();
  new Users().query('whereRaw', 'LOWER(username) = ?', _username).fetch().then(function(model) {
    if (null === model) {
      //name doesn't exist
      callback(false);
    } else {
      //name exists
      callback(true);
    }
  });
}


module.exports = router;
