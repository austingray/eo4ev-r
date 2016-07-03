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
var Posts = require('../db/posts.js');
var Assets = require('../db/assets.js');
var Maps = require('../db/maps.js');
var Tiles = require('../db/tiles.js');

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

//asset requests
router.get('/assets/models/all', function(req, res, next) {
  Assets.query(function(qb) {
    qb.where('asset_type_id', '=', 1)
  }).fetchAll().then(function(assets) {
    res.json(assets.toJSON());
  });
});

router.get('/assets/tiles/all', function(req, res, next) {
  new Tiles().fetchAll({ withRelated: ['asset'] }).then(function(model) {
    res.json(model.toJSON());
  })
  // Tiles.query(function(qb) {
  //   qb.where('asset_type_id', '=', 2)
  //     .andWhere('asset_category_id', '=', 3)
  // }).fetchAll().then(function(assets) {
  //
  // });
});

//map request
router.post('/map/update', function(req, res, next) {
  if (req.user && req.user.access > 1) {
    new Characters({id: req.user.current_character}).fetch().then(function(model) {
      var char = model.toJSON();
      var char_pos = char.position;
      var tile_x = Math.floor( (Number(sanitize(req.body.x)) + Number(char_pos.x)) / 64 );
      var tile_y = Math.floor( (Number(sanitize(req.body.y)) + Number(char_pos.y)) / 64 );
      Maps.query(function(qb) {
        qb.where('x', '=', tile_x)
          .andWhere('y', '=', tile_y)
      }).fetch().then(function(model) {
        if (model == null) {
          new Maps({ x: tile_x, y: tile_y, height: 0, blocking: false, tile_id: Number(sanitize(req.body.tile_id)) }).save().then(function(map_tile) {
            console.log(map_tile.toJSON());
          })
        } else {
          var map = model.toJSON();
          var map_id = map.id;
          new Maps({ id: map_id }).save({
            tile_id: Number( sanitize( req.body.tile_id ) )
          }, {patch: true}).then(function(model) {
            console.log(model.toJSON);
            res.send('done');
          });
        }
      })
    });
  }
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
